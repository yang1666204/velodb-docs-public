---
{
  "title": "S3/HDFS上のファイルを分析する",
  "description": "Table Value Function機能を通じて、DorisはオブジェクトストレージやHDFS上のファイルを直接Tableとしてクエリおよび分析できます。",
  "language": "ja"
}
---
Table Value Function機能を通じて、DorisはオブジェクトストレージやHDFS上のファイルをTableとして直接クエリおよび分析できます。また、自動的な列タイプ推論もサポートしています。

より詳細な使用方法については、Table Value ファンクション ドキュメントを参照してください：

* S3: S3互換オブジェクトストレージ上でのファイル分析をサポートします。

* HDFS: HDFS上でのファイル分析をサポートします。

## 基本的な使用方法

ここでは、S3 Table Value Functionを例として、オブジェクトストレージ上のファイルを分析する方法を説明します。

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
`S3(...)`はTVF（Table Value ファンクション）です。Table Value Functionは本質的にはTableなので、「Table」が使用できるあらゆるSQL文で使用できます。

TVFの属性には、分析対象のファイルパス、ファイル形式、オブジェクトストレージの接続情報などが含まれます。ファイルパス（URI）では、複数のファイルにマッチするためにワイルドカードを使用できます。以下のファイルパスが有効です：

* 特定のファイルにマッチ

  `s3://bucket/path/to/tvf_test/test.parquet`

* `test_`で始まるすべてのファイルにマッチ

  `s3://bucket/path/to/tvf_test/test_*`

* `.parquet`拡張子を持つすべてのファイルにマッチ

  `s3://bucket/path/to/tvf_test/*.parquet`

* `tvf_test`ディレクトリ内のすべてのファイルにマッチ

  `s3://bucket/path/to/tvf_test/*`

* ファイル名に`test`を含むファイルにマッチ

  `s3://bucket/path/to/tvf_test/*test*`

### ファイル列タイプの自動推論

`DESC FUNCTION`構文を使用してTVFのSchemaを表示できます：

```sql
DESC FUNCTION s3 (
    "URI" = "s3://bucket/path/to/tvf_test/test.parquet",
    "s3.access_key"= "ak",
    "s3.secret_key" = "sk",
    "format" = "parquet",
    "use_path_style"="true"
);
+---------------+--------------+------+-------+---------+-------+
| Field         | タイプ         | Null | Key   | Default | Extra |
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
DorisはSchema推論を以下のルールに基づいて行います：

* ParquetおよびORCフォーマットでは、Dorisはファイルメタデータからschemaを取得します。

* 複数ファイルが一致する場合、最初のファイルのSchemaがTVFのSchemaとして使用されます。

* CSVおよびJSONフォーマットでは、Dorisはフィールド、区切り文字等に基づいて**データの最初の行**を解析してSchemaを取得します。

  デフォルトでは、すべてのカラム型は`string`です。`csv_schema`属性を使用して、カラム名と型を個別に指定することができます。Dorisは、ファイル読み込みに指定されたカラム型を使用します。フォーマットは`name1:type1;name2:type2;...`です。例：

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
現在サポートされているカラムタイプ名は以下の通りです：

  | Column タイプ Name |
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

* フォーマットが一致しないカラム（例：ファイルには文字列が含まれているが、ユーザーが`int`として定義している場合や、他のファイルが最初のファイルと異なるSchemaを持つ場合）、または欠損カラム（例：ファイルには4つのカラムがあるが、ユーザーが5つのカラムを定義している場合）については、これらのカラムは`null`を返します。

## 適用シナリオ

### クエリ分析

TVFは、事前にDorisにデータをインポートする必要なく、ストレージシステム上の独立したファイルを直接分析するのに非常に適しています。

ファイル分析には以下のような任意のSQL文を使用できます：

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
TVFはTableが出現可能なSQLの任意の位置に配置できます。例えば、`CTE`の`WITH`句や`FROM`句などです。この方法により、ファイルを通常のTableとして任意の分析に使用できます。

また、`CREATE VIEW`文を使用してTVFの論理ビューを作成することもできます。その後、他のビューと同様にこのTVFにアクセスし、権限を管理するなどができ、他のユーザーが接続情報やその他の属性を繰り返し記述することなくこのViewにアクセスできるようになります。

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

TVFは、Dorisへのデータインポートの方法として使用することができます。`INSERT INTO SELECT`構文を使用することで、ファイルをDorisに簡単にインポートできます。

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
## 注意事項

1. 指定された`uri`がどのファイルとも一致しない場合、またはマッチしたファイルがすべて空の場合、TVFは空の結果セットを返します。この場合、`DESC FUNCTION`を使用してこのTVFのSchemaを表示すると、仮想列`__dummy_col`が表示されますが、これは意味がなく、プレースホルダーとしてのみ機能します。

2. 指定されたファイル形式が`csv`で、読み取られたファイルが空ではないがファイルの最初の行が空の場合、ファイルの最初の行からSchemaを解析できないため、エラー`The first line is empty, can not parse column numbers`が表示されます。
