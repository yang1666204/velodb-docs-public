---
{
  "title": "Iceberg JDBC カタログ",
  "description": "このドキュメントは、JDBCインターフェースを使用してIceberg Catalogメタデータサービスに接続およびアクセスする際にサポートされるパラメータについて説明します。",
  "language": "ja"
}
---
この文書では、`CREATE CATALOG` ステートメントを使用してJDBCインターフェースを通じてIceberg Catalogメタデータサービスに接続してアクセスする際にサポートされるパラメータについて説明します。

:::tip Note
これは実験的機能で、バージョン4.1.0以降でサポートされています。
:::

## パラメータ概要

| Property Name | デスクリプション | デフォルト値 | Required |
| --- | --- | --- | --- | 
| iceberg.jdbc.uri | JDBC接続URIを指定します | - | Yes |
| iceberg.jdbc.user | JDBC接続ユーザー名 | - | Yes |
| iceberg.jdbc.password | JDBC接続パスワード | - | Yes |
| warehouse | icebergウェアハウスを指定します | - | Yes |
| iceberg.jdbc.init-catalog-tables | 初回使用時にCatalog関連のTable構造を自動的に初期化するかどうか | `true` | No |
| iceberg.jdbc.schema-version | JDBC Catalogで使用されるスキーマバージョン。`V0`と`V1`をサポート | `V0` | No |
| iceberg.jdbc.strict-mode | 厳密モードを有効にするかどうか。メタデータのより厳密な検証を実行します | `false` | No |
| iceberg.jdbc.driver_class | JDBCドライバークラス名（`org.postgresql.Driver`、`com.mysql.cj.jdbc.Driver`など） | - | No |
| iceberg.jdbc.driver_url | JDBCドライバーJARファイルのパス | - | No |

> Note:
>
> 1. Iceberg JDBC CatalogはPostgreSQL、MySQL、SQLiteなど、様々なリレーショナルデータベースをバックエンドストレージとしてサポートします。
>
> 2. JDBCドライバーJARファイルがアクセス可能であることを確認してください。`iceberg.jdbc.driver_url`でドライバーの場所を指定できます。

## 設定例

### PostgreSQLをメタデータストレージとして使用

PostgreSQLデータベースを使用してIcebergメタデータを保存する場合：

```sql
CREATE CATALOG iceberg_jdbc_postgresql PROPERTIES (
    'type' = 'iceberg',
    'iceberg.catalog.type' = 'jdbc',
    'iceberg.jdbc.uri' = 'jdbc:postgresql://127.0.0.1:5432/iceberg_db',
    'iceberg.jdbc.user' = 'iceberg_user',
    'iceberg.jdbc.password' = 'password',
    'iceberg.jdbc.init-catalog-tables' = 'true',
    'iceberg.jdbc.schema-version' = 'V1',
    'iceberg.jdbc.driver_class' = 'org.postgresql.Driver',
    'iceberg.jdbc.driver_url' = '<jdbc_driver_jar>',
    'warehouse' = 's3://bucket/warehouse',
    's3.access_key' = '<ak>',
    's3.secret_key' = '<sk>',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1'
);
```
### MySQLをメタデータストレージとして使用

MySQLデータベースを使用してIcebergメタデータを保存する：

```sql
CREATE CATALOG iceberg_jdbc_mysql PROPERTIES (
    'type' = 'iceberg',
    'iceberg.catalog.type' = 'jdbc',
    'iceberg.jdbc.uri' = 'jdbc:mysql://127.0.0.1:3306/iceberg_db',
    'iceberg.jdbc.user' = 'iceberg_user',
    'iceberg.jdbc.password' = 'password',
    'iceberg.jdbc.init-catalog-tables' = 'true',
    'iceberg.jdbc.schema-version' = 'V1',
    'iceberg.jdbc.driver_class' = 'com.mysql.cj.jdbc.Driver',
    'iceberg.jdbc.driver_url' = '<jdbc_driver_jar>'
    'warehouse' = 's3://bucket/warehouse',
    's3.access_key' = '<ak>',
    's3.secret_key' = '<sk>',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1'
);
```
### SQLite as Metadata Storage

Icebergメタデータを格納するためのSQLiteデータベースの使用（テスト環境に適しています）：

```sql
CREATE CATALOG iceberg_jdbc_sqlite PROPERTIES (
    'type' = 'iceberg',
    'iceberg.catalog.type' = 'jdbc',
    'iceberg.jdbc.uri' = 'jdbc:sqlite:/tmp/iceberg_catalog.db',
    'iceberg.jdbc.init-catalog-tables' = 'true',
    'iceberg.jdbc.schema-version' = 'V1',
    'iceberg.jdbc.driver_class' = 'org.sqlite.JDBC',
    'iceberg.jdbc.driver_url' = '<jdbc_driver_jar>'
    'warehouse' = 's3://bucket/warehouse',
    's3.access_key' = '<ak>',
    's3.secret_key' = '<sk>',
    's3.endpoint' = 'https://s3.us-east-1.amazonaws.com',
    's3.region' = 'us-east-1'
);
```
