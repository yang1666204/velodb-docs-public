---
{
  "title": "S3/HDFS上のファイルを解析する",
  "description": "Table Value Function機能により、DorisはオブジェクトストレージやHDFS上のファイルをTableとして直接クエリおよび分析することができます。",
  "language": "ja"
}
---
Table Value Function機能を通じて、DorisはオブジェクトストレージやHDFS上のファイルをTableとして直接クエリおよび分析できます。また、自動的な列型推論もサポートしています。

より詳細な使用方法については、Table Value Function ドキュメントを参照してください：

* [S3](../sql-manual/sql-functions/table-valued-functions/s3.md): S3互換オブジェクトストレージ上のファイル分析をサポートします。

* [HDFS](../sql-manual/sql-functions/table-valued-functions/hdfs.md): HDFS上のファイル分析をサポートします。

* [FILE](../sql-manual/sql-functions/table-valued-functions/file.md): 統合テーブル関数で、S3/HDFS/Localファイルの読み取りを同時にサポートできます。（バージョン3.1.0以降でサポート。）

## 基本的な使用方法

ここでは、S3 Table Value Functionを使用してオブジェクトストレージ上のファイルを分析する方法を例として説明します。

### クエリ

```sql
SELECT * FROM S3 (
    'uri' = 's3://bucket/path/to/tvf_test/test.parquet',
    'format' = 'parquet',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1',
    's3.access_key' = 'ak',
    's3.secret_key'='sk'
)
```
`S3(...)`は、TVF（Table Value Function）です。Table Value Functionは本質的にテーブルなので、「テーブル」が使用できるあらゆるSQL文で使用できます。

TVFの属性には、分析対象のファイルパス、ファイル形式、オブジェクトストレージの接続情報などが含まれます。

### 複数ファイルのインポート

インポート時、ファイルパス（URI）はマッチング用のワイルドカードをサポートしています。Dorisのファイルパスマッチングは[Glob matching pattern](https://en.wikipedia.org/wiki/Glob_(programming)#:~:text=glob%20%28%29%20%28%2F%20%C9%A1l%C9%92b%20%2F%29%20is%20a%20libc,into%20a%20list%20of%20names%20matching%20that%20pattern.)を使用し、この基盤を拡張してより柔軟なファイル選択方法をサポートしています。

- `file_{1..3}`: ファイル`file_1`、`file_2`、`file_3`にマッチします
- `file_{1,3}_{1,2}`: ファイル`file_1_1`、`file_1_2`、`file_3_1`、`file_3_2`にマッチします（`{n..m}`記法との混在をサポート、カンマで区切り）
- `file_*`: `file_`で始まるすべてのファイルにマッチします
- `*.parquet`: `.parquet`拡張子を持つすべてのファイルにマッチします
- `tvf_test/*`: `tvf_test`ディレクトリ内のすべてのファイルにマッチします
- `*test*`: ファイル名に`test`を含むファイルにマッチします

**注意事項**

- `{1..3}`記法では、順序を逆にすることができ、`{3..1}`も有効です。
- `file_{-1..2}`や`file_{a..4}`のような記法はサポートされていません。負の数や文字は列挙の端点として使用できないためです。ただし、`file_{1..3,11,a}`は許可され、ファイル`file_1`、`file_2`、`file_3`、`file_11`、`file_a`にマッチします。
- Dorisは可能な限り多くのファイルをインポートしようとします。`file_{a..b,-1..3,4..5}`のような間違った記法を含むパスの場合、ファイル`file_4`と`file_5`をマッチします。
- `{1..4,5}`のようにカンマを使用する場合、数値のみが許可されます。`{1..4,a}`のような式はサポートされていません。この場合、`{a}`は無視されます。

### ファイル列タイプの自動推論

`DESC FUNCTION`構文を使用してTVFのSchemaを確認できます：

```sql
DESC FUNCTION s3 (
    "URI" = "s3://bucket/path/to/tvf_test/test.parquet",
    "s3.access_key"= "ak",
    "s3.secret_key" = "sk",
    "format" = "parquet",
    "use_path_style"="true"
);
+---------------+--------------+------+-------+---------+-------+
| Field         | Type         | Null | Key   | Default | Extra |
+---------------+--------------+------+-------+---------+-------+
| p_partkey     | INT          | Yes  | false | NULL    | NONE  |
| p_name        | TEXT         | Yes  | false | NULL    | NONE  |
| p_mfgr        | TEXT         | Yes  | false | NULL    | NONE  |
| p_brand       | TEXT         | Yes  | false | NULL    | NONE  |
| p_type        | TEXT         | Yes  | false | NULL    | NONE  |
| p_size        | INT          | Yes  | false | NULL    | NONE  |
| p_container   | TEXT         | Yes  | false | NULL    | NONE  |
| p_retailprice | DECIMAL(9,0) | Yes  | false | NULL    | NONE  |
| p_comment     | TEXT         | Yes  | false | NULL    | NONE  |
+---------------+--------------+------+-------+---------+-------+
```
Dorisは以下のルールに基づいてSchemaを推測します:

* ParquetおよびORC形式の場合、DorisはファイルメタデータからSchemaを取得します。

* 複数のファイルがマッチする場合、最初のファイルのSchemaがTVFのSchemaとして使用されます。

* CSVおよびJSON形式の場合、Dorisはフィールド、区切り文字等に基づいて**最初の行のデータ**を解析してSchemaを取得します。

  デフォルトでは、すべてのカラムタイプは`string`です。`csv_schema`属性を使用してカラム名とタイプを個別に指定することができます。Dorisはファイル読み込み時に指定されたカラムタイプを使用します。形式は`name1:type1;name2:type2;...`です。例:

  ```sql
  S3 (
      'uri' = 's3://bucket/path/to/tvf_test/test.parquet',
      's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
      's3.region' = 'us-east-1',
      's3.access_key' = 'ak'
      's3.secret_key'='sk',
      'format' = 'csv',
      'column_separator' = '|',
      'csv_schema' = 'k1:int;k2:int;k3:int;k4:decimal(38,10)'
  )
  ```
現在サポートされているカラム型名は以下の通りです：

  | Column Type Name |
  | ------------ |
  | tinyint      |
  | smallint     |
  | int          |
  | bigint       |
  | largeint     |
  | float        |
  | double       |
  | decimal(p,s) |
  | date         |
  | datetime     |
  | char         |
  | varchar      |
  | string       |
  | boolean      |

* フォーマットが一致しないカラム（例：ファイルには文字列が含まれているが、ユーザーが`int`として定義している場合や、他のファイルが最初のファイルと異なるSchemaを持っている場合）、または欠損しているカラム（例：ファイルに4つのカラムがあるが、ユーザーが5つのカラムを定義している場合）については、これらのカラムは`null`を返します。

## 適用シナリオ

### クエリ分析

TVFは、事前にDorisにデータをインポートする必要なく、ストレージシステム上の独立したファイルを直接分析するのに非常に適しています。

ファイル分析には任意のSQL文を使用できます。例えば：

```sql
SELECT * FROM s3(
    'uri' = 's3://bucket/path/to/tvf_test/test.parquet',
    'format' = 'parquet',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1',
    's3.access_key' = 'ak',
    's3.secret_key'='sk'
)
ORDER BY p_partkey LIMIT 5;
+-----------+------------------------------------------+----------------+----------+-------------------------+--------+-------------+---------------+---------------------+
| p_partkey | p_name                                   | p_mfgr         | p_brand  | p_type                  | p_size | p_container | p_retailprice | p_comment           |
+-----------+------------------------------------------+----------------+----------+-------------------------+--------+-------------+---------------+---------------------+
|         1 | goldenrod lavender spring chocolate lace | Manufacturer#1 | Brand#13 | PROMO BURNISHED COPPER  |      7 | JUMBO PKG   |           901 | ly. slyly ironi     |
|         2 | blush thistle blue yellow saddle         | Manufacturer#1 | Brand#13 | LARGE BRUSHED BRASS     |      1 | LG CASE     |           902 | lar accounts amo    |
|         3 | spring green yellow purple cornsilk      | Manufacturer#4 | Brand#42 | STANDARD POLISHED BRASS |     21 | WRAP CASE   |           903 | egular deposits hag |
|         4 | cornflower chocolate smoke green pink    | Manufacturer#3 | Brand#34 | SMALL PLATED BRASS      |     14 | MED DRUM    |           904 | p furiously r       |
|         5 | forest brown coral puff cream            | Manufacturer#3 | Brand#32 | STANDARD POLISHED TIN   |     15 | SM PKG      |           905 |  wake carefully     |
+-----------+------------------------------------------+----------------+----------+-------------------------+--------+-------------+---------------+---------------------+
```
TVFはTableが現れることができるSQLの任意の位置に現れることができます。例えば、`CTE`の`WITH`句や`FROM`句などです。この方法により、任意の分析においてファイルを通常のテーブルとして扱うことができます。

また、`CREATE VIEW`文を使用してTVFの論理ビューを作成することもできます。その後、他のビューと同様にこのTVFにアクセスし、権限を管理することなどができ、接続情報やその他の属性を繰り返し記述する必要なく、他のユーザーがこのViewにアクセスできるようになります。

```sql
-- Create a view based on a TVF
CREATE VIEW tvf_view AS 
SELECT * FROM s3(
    'uri' = 's3://bucket/path/to/tvf_test/test.parquet',
    'format' = 'parquet',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1',
    's3.access_key' = 'ak',
    's3.secret_key'='sk'
);

-- Describe the view as usual
DESC tvf_view;

-- Query the view as usual
SELECT * FROM tvf_view;

-- Grant SELECT priv to other user on this view
GRANT SELECT_PRIV ON db.tvf_view TO other_user;
```
### Data Import

TVFは、Dorisへのデータインポートの方法として使用できます。`INSERT INTO SELECT`構文を使用することで、ファイルを簡単にDorisにインポートできます。

```sql
-- Create a Doris table
CREATE TABLE IF NOT EXISTS test_table
(
    id int,
    name varchar(50),
    age int
)
DISTRIBUTED BY HASH(id) BUCKETS 4
PROPERTIES("replication_num" = "1");

-- 2. Load data into table from TVF
INSERT INTO test_table (id,name,age)
SELECT cast(id as INT) as id, name, cast (age as INT) as age
FROM s3(
    'uri' = 's3://bucket/path/to/tvf_test/test.parquet',
    'format' = 'parquet',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1',
    's3.access_key' = 'ak',
    's3.secret_key'='sk'
);
```
## Notes

1. 指定された`uri`がいずれのファイルにもマッチしない場合、または マッチしたすべてのファイルが空の場合、TVFは空の結果セットを返します。この場合、`DESC FUNCTION`を使用してこのTVFのSchemaを表示すると、仮想的なカラム`__dummy_col`が表示されますが、これは意味を持たずプレースホルダーとしての役割のみを果たします。

2. 指定されたファイル形式が`csv`で、読み取られたファイルが空でないにも関わらずファイルの最初の行が空の場合、ファイルの最初の行からSchemaを解析できないため、`The first line is empty, can not parse column numbers`というエラーが表示されます。
