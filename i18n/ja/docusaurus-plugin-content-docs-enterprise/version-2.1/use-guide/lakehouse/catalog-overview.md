---
{
  "title": "データカタログ概要",
  "description": "Data Catalogは、データソースの属性を記述するために使用されます。",
  "language": "ja"
}
---
Data Catalogは、データソースの属性を記述するために使用されます。

Dorisでは、異なるデータソース（Hive、Iceberg、MySQLなど）を指す複数のカタログを作成できます。Dorisは、カタログを通じて対応するデータソースのデータベース、テーブル、カラム、パーティション、データの場所などを自動的に取得します。ユーザーは標準のSQL文を通じてこれらのカタログにアクセスしてデータ分析を行うことができ、複数のカタログのデータに対して結合クエリを実行できます。

Dorisには2つのタイプのカタログがあります：

| タイプ                         | 説明 |
| ---------------- | -------------------------------------------------------- |
| Internal Catalog | `internal`という名前の組み込みカタログで、Doris内部テーブルのデータを格納するために使用されます。作成、変更、削除はできません。      |
| External Catalog | External CatalogはInternal Catalog以外のすべてのカタログを指します。ユーザーはExternal Catalogの作成、変更、削除が可能です。 |

カタログは主に以下の3つのシナリオに適用されますが、異なるカタログが異なるシナリオに適しています。詳細については、対応するカタログのドキュメントを参照してください。

| シナリオ | 説明      |
| ---- | ------------------------------------------- |
| Query Acceleration | Hive、Iceberg、Paimonなどのデータレイクに対する直接的なクエリ高速化。      |
| Data Integration | ZeroETLソリューションで、異なるデータソースに直接アクセスして結果データを生成したり、異なるデータソース間のデータフローを促進します。 |
| Data Write-back | Dorisでのデータ処理後、外部データソースへの書き戻し。                |

このドキュメントでは、カタログの基本操作に焦点を当てるために[Iceberg Catalog](./catalogs/iceberg-catalog.mdx)を例として使用します。異なるカタログの詳細な説明については、対応するカタログのドキュメントを参照してください。

## Catalogの作成

`CREATE CATALOG`文を使用してIceberg Catalogを作成します。

```sql
CREATE CATALOG iceberg_catalog PROPERTIES (
    'type' = 'iceberg',
    'iceberg.catalog.type' = 'hadoop',
    'warehouse' = 's3://bucket/dir/key',
    's3.endpoint' = 's3.us-east-1.amazonaws.com',
    's3.access_key' = 'ak',
    's3.secret_key' = 'sk'
);
```
基本的に、Dorisで作成されたカタログは、対応するデータソースのメタデータサービス（Hive Metastoreなど）やストレージサービス（HDFS/S3など）にアクセスするための「プロキシ」として機能します。Dorisは、カタログの接続プロパティやその他の情報のみを保存し、対応するデータソースの実際のメタデータやデータは保存しません。

### 共通プロパティ

各カタログ固有のプロパティセットに加えて、すべてのカタログに共通するプロパティ `{CommonProperties}` を以下に示します。

| Property Name            | Description                                                                                                                          | Example                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `include_database_list`  | 指定されたDatabaseのみの同期をサポートし、`,`で区切ります。デフォルトでは、すべてのDatabaseが同期されます。Database名は大文字小文字を区別します。外部データソースに多数のDatabaseが存在するが、アクセスが必要なのは少数の場合に、大量のメタデータの同期を避けるためにこのパラメータを使用します。 | `'include_database_list' = 'db1,db2'` |
| `exclude_database_list`  | 同期が不要な複数のDatabaseの指定をサポートし、`,`で区切ります。デフォルトでは、フィルタリングは適用されず、すべてのDatabaseが同期されます。Database名は大文字小文字を区別します。これは上記と同じシナリオで使用され、アクセスが不要なデータベースを除外します。競合がある場合は、`exclude`が`include`より優先されます。 | `'exclude_database_list' = 'db1,db2'` |


### カラム型マッピング

ユーザーがカタログを作成すると、Dorisは自動的にカタログのデータベース、テーブル、カラムを同期します。異なるカタログのカラム型マッピングルールについては、対応するカタログのドキュメントを参照してください。

`UNION`、`INTERVAL`など、現在Dorisカラム型にマッピングできない外部データ型については、Dorisはカラム型を`UNSUPPORTED`にマッピングします。`UNSUPPORTED`型を含むクエリについては、以下の例を参照してください：

同期されたテーブルスキーマが以下であると仮定します：

```text
k1 INT,
k2 INT,
k3 UNSUPPORTED,
k4 INT
```
クエリの動作は以下の通りです：

```sql
SELECT * FROM table;                -- Error: Unsupported type 'UNSUPPORTED_TYPE' in 'k3'
SELECT * EXCEPT(k3) FROM table;     -- Query OK.
SELECT k1, k3 FROM table;           -- Error: Unsupported type 'UNSUPPORTED_TYPE' in 'k3'
SELECT k1, k4 FROM table;           -- Query OK.
```
### Nullable属性

Dorisは現在、外部テーブルカラムのNullable属性サポートに特別な制限があり、具体的な動作は以下の通りです：

| Source Type | Doris Read Behavior | Doris Write Behavior |
| ---   | ------------  | ------------ |
| Nullable | Nullable  | Null値の書き込みを許可 |
| Not Null | Nullable、つまり読み取り時にNULLを許可するカラムとして扱われる | Null値の書き込みを許可、つまりNull値に対する厳密なチェックは行わない。ユーザーはデータの整合性と一貫性を自分で確保する必要がある。|

## Catalogの使用

### Catalogの表示

作成後、`SHOW CATALOGS`コマンドを使用してcatalogを表示できます：

```text
mysql> SHOW CATALOGS;
+-----------+-----------------+----------+-----------+-------------------------+---------------------+------------------------+
| CatalogId | CatalogName     | Type     | IsCurrent | CreateTime              | LastUpdateTime      | Comment                |
+-----------+-----------------+----------+-----------+-------------------------+---------------------+------------------------+
|     10024 | iceberg_catalog | hms      | yes       | 2023-12-25 16:11:41.687 | 2023-12-25 20:43:18 | NULL                   |
|         0 | internal        | internal |           | NULL                    | NULL                | Doris internal catalog |
+-----------+-----------------+----------+-----------+-------------------------+---------------------+------------------------+
```
SHOW CREATE CATALOGを使用してカタログを作成するステートメントを表示できます。

### カタログの切り替え

DorisはSWITCHステートメントを提供しており、接続セッションのコンテキストを対応するカタログに切り替えることができます。これはUSEステートメントを使用してデータベースを切り替えるのと同様です。

カタログに切り替えた後、USEステートメントを使用して指定したデータベースへの切り替えを続行するか、SHOW DATABASESを使用して現在のカタログ下のデータベースを表示できます。

```sql
SWITCH iceberg_catalog;

SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| test               |
| iceberg_db         |
+--------------------+

USE iceberg_db;
```
`USE`文を完全修飾名`catalog_name.database_name`と組み合わせて使用することで、指定されたカタログ内の指定されたデータベースに直接切り替えることもできます。

```sql
USE iceberg_catalog.iceberg_db;
```
完全修飾名は、MySQL接続プロトコルとの互換性を保つために、MySQLコマンドラインやJDBC接続文字列でも使用できます。

```sql
# Command line tool
mysql -h host -P9030 -uroot -Diceberg_catalog.iceberg_db

# JDBC url
jdbc:mysql://host:9030/iceberg_catalog.iceberg_db
```
組み込みカタログの固定名は`internal`です。切り替え方法は外部カタログと同じです。

### デフォルトカタログ
ユーザー属性`default_init_catalog`は、特定のユーザーのデフォルトカタログを設定するために使用されます。設定されると、指定されたユーザーがDorisに接続した際に、設定されたカタログに自動的に切り替わります。

```sql
SET PROPERTY default_init_catalog=hive_catalog;
```
注意 1: MySQLコマンドラインまたはJDBC接続文字列でcatalogが明示的に指定されている場合、指定されたcatalogが使用され、`default_init_catalog`ユーザー属性は効果を持ちません。
注意 2: ユーザー属性`default_init_catalog`で設定されたcatalogが存在しなくなった場合、自動的にデフォルトの`internal` catalogに切り替わります。
注意 3: この機能はバージョンv3.1.x以降で有効になります。

### Simple Query

Dorisでサポートされている任意のSQL文を使用して、外部catalogのテーブルをクエリできます。

```sql
SELECT id, SUM(cost) FROM iceberg_db.table1
GROUP BY id ORDER BY id;
```
### Cross-Catalog Query

Dorisは異なるカタログ間でのjoinクエリをサポートしています。

ここで、別のMySQL Catalogを作成しましょう：

```sql
CREATE CATALOG mysql_catalog properties(
    'type' = 'jdbc',
    'user' = 'root',
    'password' = '123456',
    'jdbc_url' = 'jdbc:mysql://host:3306/mysql_db',
    'driver_url' = 'mysql-connector-java-8.0.25.jar',
    'driver_class' = 'com.mysql.cj.jdbc.Driver'
);
```
その後、SQLを使用してIcebergテーブルとMySQLテーブル間でjoinクエリを実行します：

```sql
SELECT * FROM
iceberg_catalog.iceberg_db.table1 tbl1 JOIN mysql_catalog.mysql_db.dim_table tbl2
ON tbl1.id = tbl2.id;
```
### Data Import

`INSERT`コマンドを使用して、データソースからDorisにデータをインポートできます。

```sql
INSERT INTO internal.doris_db.tbl1
SELECT * FROM iceberg_catalog.iceberg_db.table1;
```
外部データソースからDorisの内部テーブルを作成し、データをインポートするために`CTAS (Create Table As Select)`文を使用することもできます：

```sql
CREATE TABLE internal.doris_db.tbl1
PROPERTIES('replication_num' = '1')
AS
SELECT * FROM iceberg_catalog.iceberg_db.table1;
```
### データライトバック

Dorisは`INSERT`文を使用して外部データソースへのデータのライトバックをサポートしています。詳細については以下を参照してください：

* [Hive Catalog](./catalogs/hive-catalog.mdx)
* [Iceberg Catalog](./catalogs/iceberg-catalog.mdx)
* [JDBC Catalog](./catalogs/jdbc-catalog-overview.md)

## Catalogのリフレッシュ

Dorisで作成されたCatalogは、対応するデータソースのメタデータサービスにアクセスするための「プロキシ」として機能します。Dorisはアクセス性能を向上させ、頻繁なネットワーク間リクエストを削減するために一部のメタデータをキャッシュします。ただし、キャッシュには有効期限があり、リフレッシュしないと最新のメタデータにアクセスできません。そのため、DorisはCatalogをリフレッシュするためのいくつかの方法を提供しています。

```sql
-- Refresh catalog
REFRESH CATALOG catalog_name;

-- Refresh specified database
REFRESH DATABASE catalog_name.db_name;

-- Refresh specified table
REFRESH TABLE catalog_name.db_name.table_name;
```
Dorisは、リアルタイムで最新のメタデータにアクセスするために、メタデータキャッシュを無効化することもサポートしています。

メタデータキャッシュの詳細情報と設定については、以下を参照してください：[Metadata Cache](./meta-cache.md)

## Catalogの変更

`ALTER CATALOG`文を使用して、catalogのプロパティまたは名前を変更できます：

```sql
-- Rename a catalog
ALTER CATALOG iceberg_catalog RENAME iceberg_catalog2;

-- Modify properties of a catalog
ALTER CATALOG iceberg_catalog SET PROPERTIES ('key1' = 'value1' [, 'key' = 'value2']); 

-- Modify the comment of a catalog
ALTER CATALOG iceberg_catalog MODIFY COMMENT 'my iceberg catalog';
```
## カタログの削除

`DROP CATALOG`文を使用して、指定した外部カタログを削除できます。

```sql
DROP CATALOG [IF EXISTS] iceberg_catalog;
```
Dorisから外部カタログを削除しても、実際のデータは削除されません。Dorisに保存されているマッピング関係のみが削除されます。

## Permission Management

外部カタログ内のデータベースとテーブルの権限管理は、内部テーブルと同じです。詳細については、Authentication and Authorizationドキュメントを参照してください。
