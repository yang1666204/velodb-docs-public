---
{
  "title": "MySQL互換性",
  "description": "Dorisは、MySQL構文と高い互換性を持ち、標準SQLをサポートしています。しかし、DorisとMySQLの間にはいくつかの違いがあります。",
  "language": "ja"
}
---
DorisはMySQLの構文と高い互換性があり、標準SQLをサポートしています。ただし、以下に示すように、DorisとMySQLにはいくつかの違いがあります。

## データ型

### 数値型

| 型           | MySQL                                                        | Doris                                                        |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Boolean      | <p>- サポート</p>  <p>- 範囲: 0は偽、1は真を表す</p>  | <p>- サポート</p>  <p>- キーワード: Boolean</p>  <p>- 範囲: 0は偽、1は真を表す</p> |
| Bit          | <p>- サポート</p>  <p>- 範囲: 1から64</p>                                | サポートなし                                                |
| Tinyint      | <p>- サポート</p> <p>- 符号ありと符号なしをサポート</p>  <p>- 範囲: 符号ありは-128から127、符号なしは0から255 </p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- 範囲: -128から127</p>    |
| Smallint     | <p>- サポート</p> <p>- 符号ありと符号なしをサポート</p> <p> - 範囲: 符号ありは-2^15から2^15-1、符号なしは0から2^16-1</p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- 範囲: -32768から32767</p> |
| Mediumint    | <p>- サポート</p> <p>- 符号ありと符号なしをサポート</p>  <p>- 範囲: 符号ありは-2^23から2^23-1、符号なしは0から2^24-1</p> | - サポートなし                                              |
| Int          | <p>- サポート</p> <p>- 符号ありと符号なしをサポート</p>  <p>- 範囲: 符号ありは-2^31から2^31-1、符号なしは0から2^32-1</p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- 範囲: -2147483648から2147483647</p> |
| Bigint       | <p>- サポート</p> <p>- 符号ありと符号なしをサポート</p> <p>- 範囲: 符号ありは-2^63から2^63-1、符号なしは0から2^64-1</p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- 範囲: -2^63から2^63-1</p> |
| Largeint     | - サポートなし                                              | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- 範囲: -2^127から2^127-1</p> |
| Decimal      | <p>- サポート</p>  <p>- 符号ありと符号なしをサポート（8.0.17以降は非推奨）</p>  <p>- デフォルト: Decimal(10, 0)</p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>  <p>- デフォルト: Decimal(9, 0)</p> |
| Float/Double | <p>-サポート</p>  <p>- 符号ありと符号なしをサポート（8.0.17以降は非推奨）</p> | <p>- サポート</p>  <p>- 符号ありのみサポート</p>                          |

### 日付型

| 型        | MySQL                                                        | Doris                                                        |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Date      | <p>- サポート</p> <p>- 範囲: ['1000-01-01', '9999-12-31']</p>   - フォーマット: YYYY-MM-DD | <p>- サポート</p> <p>- 範囲: ['0000-01-01', '9999-12-31']</p>   - フォーマット: YYYY-MM-DD |
| DateTime  | <p>- サポート</p> <p>- DATETIME([P])、Pは精度を定義するオプションパラメータ</p>  - 範囲: '1000-01-01 00:00:00.000000'から'9999-12-31 23:59:59.999999'  <p>- フォーマット: YYYY-MM-DD hh:mm:ss[.fraction]</p> | <p>- サポート</p> <p>- DATETIME([P])、Pは精度を定義するオプションパラメータ</p>  <p>- 範囲: ['0000-01-01 00:00:00[.000000]', '9999-12-31 23:59:59[.999999]']</p>   - フォーマット: YYYY-MM-DD hh:mm:ss[.fraction] |
| Timestamp | <p>- サポート</p> <p>- Timestamp[(p)]、Pは精度を定義するオプションパラメータ</p> <p>- 範囲: ['1970-01-01 00:00:01.000000' UTC, '2038-01-19 03:14:07.999999' UTC]</p>   <p>- フォーマット: YYYY-MM-DD hh:mm:ss[.fraction]</p> | - サポートなし                                              |
| Time      | <p>- サポート</p> <p>- Time[(p)]</p>  <p>- 範囲: ['-838:59:59.000000'から'838:59:59.000000']</p>   <p>- フォーマット: hh:mm:ss[.fraction]</p> | - サポートなし                                              |
| Year      | <p>- サポート</p> <p>- 範囲: 1901から2155、または0000</p>   - フォーマット: yyyy  | - サポートなし                                              |

### 文字列型

| 型        | MySQL                                                        | Doris                                                        |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Char      | <p>-サポート - CHAR[(M)]、Mは文字長。省略時のデフォルト長は1</p>  <p>- 固定長</p>  - 範囲: [0, 255]バイト | <p>- サポート</p> <p>- CHAR[(M)]、Mはバイト長</p>  <p>- 可変長</p>  - 範囲: [1, 255] |
| Varchar   | <p>- サポート</p> <p>- VARCHAR(M)、Mは文字長</p> <p>- 範囲: [0, 65535]バイト</p> | <p>- サポート</p> <p>- VARCHAR(M)、Mはバイト長</p>  <p>- 範囲: [1, 65533]</p> |
| String    | - サポートなし                                              | <p>- サポート</p> <p>- 1,048,576バイト（1MB）、2,147,483,643バイト（2GB）まで増加可能</p> |
| Binary    | <p>- サポート</p> <p>- Charと同様</p>                                | - サポートなし                                              |
| Varbinary | <p>- サポート</p> <p>- Varcharと同様</p>                             | <p>- サポートなし</p>                                              |
| Blob      | <p>- サポート</p> <p>- TinyBlob、Blob、MediumBlob、LongBlob</p>           | - サポートなし                                              |
| Text      | <p>- サポート</p> <p>- TinyText、Text、MediumText、LongText</p>           | - サポートなし                                              |
| Enum      | <p>- サポート</p> <p>- 最大65,535要素をサポート</p>                 | - サポートなし                                              |
| Set       | <p>- サポート</p> <p>- 最大64要素をサポート</p>                     | - サポートなし                                              |

### JSON型

| 型   | MySQL       | Doris     |
| ---- | ----------- | --------- |
| JSON |  サポート | サポート |

### Doris固有のデータ型

Dorisにはいくつかの固有のデータ型があります。詳細は以下の通りです：

- **HyperLogLog**

  HLL（HyperLogLog）は、キー列として使用できないデータ型です。集約モデルテーブルでは、HLLに対応する集約タイプはHLL_UNIONです。長さとデフォルト値を指定する必要はありません。長さはデータの集約レベルに基づいて内部的に制御されます。HLL列は、`HLL_UNION_AGG`、`HLL_RAW_AGG`、`HLL_CARDINALITY`、`HLL_HASH`、その他の関連関数でのみクエリまたは使用できます。

  HLLは近似ファジー重複排除に使用され、大量のデータを扱う際にcount distinctよりも優れたパフォーマンスを発揮します。HLLの典型的なエラー率は約1%で、時には2%に達することもあります。

- **Bitmap**

  Bitmapは、キー列として使用できないデータ型です。集約モデルテーブルでは、BITMAPに対応する集約タイプはBITMAP_UNIONです。HLLと同様に、長さとデフォルト値を指定する必要はなく、長さはデータの集約レベルに基づいて内部的に制御されます。Bitmap列は、`BITMAP_UNION_COUNT`、`BITMAP_UNION`、`BITMAP_HASH`、`BITMAP_HASH64`などの関数でのみクエリまたは使用できます。

  従来のシナリオでBITMAPを使用すると、ロード速度に影響を与える可能性がありますが、大量のデータを扱う際には一般的にCount Distinctよりも優れたパフォーマンスを発揮します。リアルタイムシナリオでは、グローバル辞書なしでbitmap_hash()関数を使用したBITMAPは約0.1%のエラーを発生させる可能性があることに注意してください。このエラーが許容できない場合は、代わりにbitmap_hash64を使用できます。

- **QUANTILE_PERCENT**

  QUANTILE_STATEは、キー列として使用できないデータ型です。集約モデルテーブルでは、QUANTILE_STATEに対応する集約タイプはQUANTILE_UNIONです。長さとデフォルト値を指定する必要はなく、長さはデータの集約レベルに基づいて内部的に制御されます。QUANTILE_STATE列は、`QUANTILE_PERCENT`、`QUANTILE_UNION`、`TO_QUANTILE_STATE`などの関数でのみクエリまたは使用できます。

  QUANTILE_STATEは近似分位値の計算に使用されます。インポート中に、同じキーの異なる値で事前集約を実行します。値の数が2048を超えない場合、すべてのデータを詳細に格納します。値の数が2048を超えると、TDigestアルゴリズムを使用してデータを集約（クラスター化）し、クラスターの重心を保存します。

- **Array<T\>**

  ArrayはDorisのデータ型で、型Tの要素で構成される配列を表します。キー列として使用することはできません。

- **MAP<K, V\>**

  MAPはDorisのデータ型で、型KとVの要素で構成されるマップを表します。

- **STRUCT<field_name:field_type,...>**

  構造体（STRUCT）は複数のフィールドで構成されます。複数の列のコレクションとしても識別できます。

  - field_name: フィールドの識別子で、一意である必要があります。
  - field_type: フィールドの型。

- **Agg_State**

  AGG_STATEはDorisのデータ型で、キー列として使用することはできません。テーブル作成時に、集約関数のシグネチャを宣言する必要があります。

  長さとデフォルト値を指定する必要はなく、実際のストレージサイズは関数の実装に依存します。

  AGG_STATEは、SQLマニュアルのアグリゲータからSTATE / MERGE/ UNION関数と組み合わせてのみ使用できます。

## 構文

### DDL

#### 01 DorisでのCreate Table構文

```sql
CREATE TABLE [IF NOT EXISTS] [database.]table
(
    column_definition_list
    [, index_definition_list]
)
[engine_type]
[keys_type]
[table_comment]
[partition_info]
distribution_desc
[rollup_list]
[properties]
[extra_properties]
```
#### 02 MySQLとの違い


| パラメータ              | MySQLとの違い                                       |
| ---------------------- | ------------------------------------------------------------ |
| Column_definition_list | - フィールドリスト定義: 基本的な構文はMySQLと類似していますが、集約型の追加操作が含まれます。<br />- 集約型操作は主にAggregateをサポートしています。<br />- テーブル作成時、MySQLではフィールドリスト定義の後にIndex（例：Primary Key、Unique Key）などの制約を追加できますが、DorisではこれらをDataModelの定義によってサポートします。 |
| Index_definition_list  | - インデックスリスト定義: 基本的な構文はMySQLと類似しており、bitmap indexes、inverted indexes、N-Gram indexesをサポートしますが、Bloom filter indexesはpropertiesによって設定されます。<br />- MySQLはB+TreeおよびHashインデックスをサポートします。 |
| Engine_type            | - テーブルエンジンタイプ: オプション。<br />- 現在サポートされているテーブルエンジンは主にOLAPネイティブエンジンです。<br />- MySQLはInnodb、MyISAMなどのストレージエンジンをサポートします。 |
| Keys_type              | - データモデル: オプション。<br />- サポートされるタイプには次のものがあります: 1) DUPLICATE KEY（デフォルト）: 指定したカラムがソートカラムになります。2) AGGREGATE KEY: 指定したカラムがディメンションカラムになります。3) UNIQUE KEY: 指定したカラムがプライマリキーカラムになります。<br />- MySQLにはデータモデルの概念はありません。 |
| Table_comment          | テーブルコメント                                                |
| Partition_info         | - パーティショニングアルゴリズム: オプション。Dorisがサポートするパーティショニングアルゴリズムには次のものがあります:<br />- LESS THAN: パーティションの上限のみを定義します。下限は前のパーティションの上限によって決定されます。<br />- FIXED RANGE: パーティションの左閉右開区間を定義します。<br />- MULTI RANGE: 複数のRANGEパーティションを一括作成し、左閉右開区間を定義して時間単位とステップを設定します。時間単位は年、月、日、週、時間をサポートします。<br />MySQLはHash、Range、List、Keyなどのアルゴリズムをサポートします。MySQLはサブパーティションもサポートし、サブパーティションではHashとKeyのみがサポートされます。 |
| Distribution_desc      | - バケッティングアルゴリズム: 必須。次のものが含まれます: 1) Hashバケッティング構文: DISTRIBUTED BY HASH (k1[,k2 ...]) [BUCKETS num\|auto]。説明: 指定したキーカラムを使用してハッシュバケッティングを行います。2) ランダムバケッティング構文: DISTRIBUTED BY RANDOM [BUCKETS num\|auto]。説明: 乱数を使用してバケッティングを行います。<br />- MySQLにはバケッティングアルゴリズムはありません。 |
| Rollup_list            | - テーブル作成時に複数の同期マテリアライズドビューを作成できます。<br />- 構文: `rollup_name (col1[, col2, ...]) [DUPLICATE KEY(col1[, col2, ...])][PROPERTIES("key" = "value")]`<br />- MySQLはこれをサポートしません。 |
| Properties             | テーブルプロパティ: MySQLのテーブルプロパティとは異なり、テーブルプロパティを定義する構文もMySQLとは異なります。 |


#### 03 CREATE INDEX

```sql
CREATE INDEX [IF NOT EXISTS] index_name ON table_name (column [, ...],) [USING BITMAP];
```
- Dorisは現在、Bitmapインデックス、転置インデックス、およびN-Gramインデックスをサポートしています。BloomFilterインデックスもサポートされていますが、これらには設定用の独立した構文があります。

- MySQLはB+TreeやHashなどのインデックスアルゴリズムをサポートしています。

#### 04 CREATE VIEW

```sql
CREATE VIEW [IF NOT EXISTS]
 [db_name.]view_name
 (column1[ COMMENT "col comment"][, column2, ...])
AS query_stmt

CREATE MATERIALIZED VIEW (IF NOT EXISTS)? mvName=multipartIdentifier
        (LEFT_PAREN cols=simpleColumnDefs RIGHT_PAREN)? buildMode?
        (REFRESH refreshMethod? refreshTrigger?)?
        (KEY keys=identifierList)?
        (COMMENT STRING_LITERAL)?
        (PARTITION BY LEFT_PAREN partitionKey = identifier RIGHT_PAREN)?
        (DISTRIBUTED BY (HASH hashKeys=identifierList | RANDOM) (BUCKETS (INTEGER_VALUE | AUTO))?)?
        propertyClause?
        AS query
```
- 基本構文はMySQLと一致しています。
- DorisはLogical Viewをサポートし、2種類のMaterialized Viewをサポートします：同期Materialized Viewと非同期Materialized View
- MySQLは非同期Materialized Viewをサポートしていません。

#### 05 ALTER TABLE / ALTER INDEX

DorisのALTER構文は基本的にMySQLと同じです。

### DROP TABLE / DROP INDEX

DorisのDROP構文は基本的にMySQLと同じです。

### DML

#### INSERT

```sql
INSERT INTO table_name
    [ PARTITION (p1, ...) ]
    [ WITH LABEL label]
    [ (column [, ...]) ]
    [ [ hint [, ...] ] ]
    { VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query }
```
Doris の INSERT 構文は基本的に MySQL と同じです。

#### UPDATE

```sql
UPDATE target_table [table_alias]
    SET assignment_list
    WHERE condition

assignment_list:
    assignment [, assignment] ...

assignment:
    col_name = value

value:
    {expr | DEFAULT}
```
DorisのUPDATE構文は基本的にMySQLと同じですが、**`WHERE`条件を必ず追加する必要がある**ことに注意してください。

#### Delete

```sql
DELETE FROM table_name [table_alias] 
    [PARTITION partition_name | PARTITIONS (partition_name [, partition_name])]
    WHERE column_name op { value | value_list } [ AND column_name op { value | value_list } ...];
```
構文はフィルタ述語のみを指定できます

```sql
DELETE FROM table_name [table_alias]
    [PARTITION partition_name | PARTITIONS (partition_name [, partition_name])]
    [USING additional_tables]
    WHERE condition
```
この構文はUNIQUE KEYモデルテーブルでのみ使用できます。

DorisのDELETE構文は基本的にMySQLと同じです。ただし、Dorisは分析データベースであるため、削除を頻繁に行うことはできません。

#### SELECT

```sql
SELECT
    [hint_statement, ...]
    [ALL | DISTINCT]
    select_expr [, select_expr ...]
    [EXCEPT ( col_name1 [, col_name2, col_name3, ...] )]
    [FROM table_references
      [PARTITION partition_list]
      [TABLET tabletid_list]
      [TABLESAMPLE sample_value [ROWS | PERCENT]
        [REPEATABLE pos_seek]]
    [WHERE where_condition]
    [GROUP BY [GROUPING SETS | ROLLUP | CUBE] {col_name | expr | position}]
    [HAVING where_condition]
    [ORDER BY {col_name | expr | position} [ASC | DESC], ...]
    [LIMIT {[offset_count,] row_count | row_count OFFSET offset_count}]
    [INTO OUTFILE 'file_name']
```
DorisのSELECT構文は基本的にMySQLと同じです。

## SQL Function

Doris FunctionはほとんどのMySQL関数をカバーしています。

## SQL Mode

| Name | Behavior when enabled | Behavior when disabled | Notes |
| :-- | :-- | :-- | :-- |
| PIPES_AS_CONCAT | `\|\|`を`concat`関数として解析する | `\|\|`を論理AND演算子として解析する | - |
| NO_BACKSLASH_ESCAPES | 文字列内のバックスラッシュをリテラル文字として扱う | 文字列内のバックスラッシュをエスケープ文字として扱う | - |
