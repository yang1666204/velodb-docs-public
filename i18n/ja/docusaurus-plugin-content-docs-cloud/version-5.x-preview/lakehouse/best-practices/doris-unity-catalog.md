---
{
  "title": "Databricks Unity Catalog との統合",
  "description": "企業が Lakehouse アーキテクチャの下で増加するデータ資産をますます管理するようになるにつれて、クロスプラットフォーム、高性能な",
  "language": "ja"
}
---
企業がLakehouseアーキテクチャの下で増大するデータ資産を管理することが増えるにつれ、クロスプラットフォーム、高性能、そしてガバナンスされたデータアクセス機能への需要がより緊急になっています。次世代リアルタイム分析データベースであるApache Dorisは、[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog)との深い統合を実現し、企業が統一されたガバナンスフレームワークの下でDatabricksによって管理されるデータレイクに直接アクセスし、効率的にクエリを実行できるようになり、シームレスなデータ接続を実現しています。

**このドキュメントを通じて、以下について深く理解できます：**

- Databricks環境セットアップ：DatabricksでのExternal Locations、Catalogs、およびIcebergテーブルの作成方法と、関連する権限設定

- DorisのUnity Catalogへの接続：DorisをDatabricks Unity Catalogに接続し、Icebergテーブルにアクセスする方法

> 注意：この機能にはDorisバージョン3.1.3以上が必要です。

## Databricks環境セットアップ

### External Locationの作成

Unity Catalogにおいて、[External Location](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-external-locations)は、クラウドオブジェクトストレージのパスをStorage Credentialsと関連付けるセキュアなオブジェクトです。External Locationsは外部アクセスをサポートし、Unity CatalogはCredential Vending機能を通じて外部システムに短期間の認証情報を発行し、外部システムがこれらのパスにアクセスできるようにします。

![unity1](/images/integrations/lakehouse/unity/unity-1.png)

このドキュメントではAWS QuickstartでAWS S3にExternal Locationを作成します。

![unity2](/images/integrations/lakehouse/unity/unity-2.png)

作成後、External Catalogとそれに対応するCredentialを確認できます：

![unity3](/images/integrations/lakehouse/unity/unity-3.png)

### Catalogの作成

インターフェースでCreate Catalogオプションをクリックします。

![unity4](/images/integrations/lakehouse/unity/unity-4.png)

Catalog名を入力します。`Use default storage`のチェックを外し、先ほど作成したExternal Locationを選択します。

![unity5](/images/integrations/lakehouse/unity/unity-5.png)

### External Use Schema権限の有効化

新しく作成した`Catalog` → `Permissions` → `Grant`をクリックします：

![unity6](/images/integrations/lakehouse/unity/unity-6.png)

`All account users`を選択し、`EXTERNAL USE SCHEMA`オプションにチェックを入れます。

![unity7](/images/integrations/lakehouse/unity/unity-7.png)

### Icebergテーブルの作成とデータ挿入

Databricks SQL EditorでIcebergテーブルを作成し、データを挿入するために以下のSQLを実行します：

```sql
CREATE TABLE `my-unity-catalog`.default.iceberg_table (
  id int,
  name string
) USING iceberg;

INSERT INTO `my-unity-catalog`.default.iceberg_table VALUES(1, "jack");
```
### アクセストークンの取得

右上角のユーザーアバターをクリックし、`Settings`ページに移動して、`User` → `Developer`の下にある`Access tokens`を選択します。DorisをUnity Catalogに接続する際に後で使用するための新しいTokenを作成します。Tokenは次の形式の文字列です：`dapi4f...`

## DorisのUnity Catalogへの接続

### Catalogの作成

```sql
-- Use oauth2 credential and vended credentials
CREATE CATALOG dbx_unity_catalog PROPERTIES (
  "uri" = "https://dbc-xx.cloud.databricks.com:443/api/2.1/unity-catalog/iceberg-rest/",
  "type" = "iceberg",
  "warehouse" = "my-unity-catalog",
  "iceberg.catalog.type" = "rest",
  "iceberg.rest.security.type" = "oauth2",
  "iceberg.rest.oauth2.credential" = "clientid:clientsecret",
  "iceberg.rest.oauth2.server-uri" = "https://dbc-xx.cloud.databricks.com:443/oidc/v1/token",
  "iceberg.rest.oauth2.scope" = "all-apis",
  "iceberg.rest.vended-credentials-enabled" = "true"
);

-- Use PAT and vended credentials
CREATE CATALOG dbx_unity_catalog PROPERTIES (
  "uri" = "https://<dbc-account>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest/",
  "type" = "iceberg",
  "warehouse" = "my-unity-catalog",
  "iceberg.catalog.type" = "rest",
  "iceberg.rest.security.type" = "oauth2",
  "iceberg.rest.oauth2.token" = "<token>",
  "iceberg.rest.vended-credentials-enabled" = "true"
);

-- Use oauth2 credential and static ak/sk for accessing aws s3
CREATE CATALOG dbx_unity_catalog PROPERTIES (
  "uri" = "https://dbc-xx.cloud.databricks.com:443/api/2.1/unity-catalog/iceberg-rest/",
  "type" = "iceberg",
  "warehouse" = "my-unity-catalog",
  "iceberg.catalog.type" = "rest",
  "iceberg.rest.security.type" = "oauth2",
  "iceberg.rest.oauth2.credential" = "clientid:clientsecret",
  "iceberg.rest.oauth2.server-uri" = "https://dbc-xx.cloud.databricks.com:443/oidc/v1/token",
  "iceberg.rest.oauth2.scope" = "all-apis",
  "s3.endpoint" = "https://s3.<region>.amazonaws.com",
  "s3.access_key" = "<ak>",
  "s3.secret_key" = "<sk>",
  "s3.region" = "<region>"
);
```
### Catalog へのアクセス

作成後、Unity Catalog に保存された Iceberg テーブルにアクセスを開始できます：

```sql
mysql> USE dbx_unity_catalog.`default`;
Database changed

mysql> SELECT * FROM iceberg_table;
+------+------+
| id   | name |
+------+------+
|    1 | jack |
+------+------+
1 row in set (3.32 sec)
```
### Iceberg テーブルの管理

Dorisを通じてUnity Catalog内のIcebergテーブルの作成、管理、書き込みを直接行うこともできます：

```sql
-- Write to existing table in Unity Catalog
INSERT INTO iceberg_table VALUES(2, "mary");

-- Create a partitioned table
CREATE TABLE partition_table (
  `ts` DATETIME COMMENT 'ts',
  `col1` BOOLEAN COMMENT 'col1',
  `pt1` STRING COMMENT 'pt1',
  `pt2` STRING COMMENT 'pt2'
)
PARTITION BY LIST (day(ts), pt1, pt2) ();

-- Insert data
INSERT INTO partition_table VALUES("2025-11-12", true, "foo", "bar");

-- View table partition information
SELECT * FROM partition_table$partitions\G
*************************** 1. row ***************************
                    partition: {"ts_day":"2025-11-12", "pt1":"foo", "pt2":"bar"}
                      spec_id: 0
                 record_count: 1
                   file_count: 1
total_data_file_size_in_bytes: 2552
 position_delete_record_count: 0
   position_delete_file_count: 0
 equality_delete_record_count: 0
   equality_delete_file_count: 0
              last_updated_at: 2025-11-18 15:20:45.964000
     last_updated_snapshot_id: 9024874735105617773
```
## Summary

Databricks Unity Catalogとの深い統合により、Apache Dorisは企業が統一されたガバナンスフレームワークの下で、より高いパフォーマンスとより低いコストでデータレイク内のコア資産にアクセスし、分析することを可能にします。この機能はLakehouseアーキテクチャの全体的な一貫性を向上させるだけでなく、リアルタイム分析、インタラクティブクエリ、AIシナリオに新しい可能性をもたらします。データチーム、分析エンジニア、プラットフォームアーキテクトのいずれであっても、既存のデータレイク基盤の上により機敏でインテリジェントなデータアプリケーションを構築するためにDorisを活用できます。
