---
{
  "title": "Glue + AWS S3 Tablesとの統合",
  "description": "AWS S3 TablesはApache Icebergテーブル形式標準と互換性のある読み取りおよび書き込みインターフェースを提供するS3 Bucketの特殊なタイプです。",
  "language": "ja"
}
---
[AWS S3 Tables](https://aws.amazon.com/s3/features/tables/)は特別なタイプのS3 Bucketで、Amazon S3上に構築され、Apache Icebergテーブルフォーマット標準と互換性のある読み取りおよび書き込みインターフェースを提供し、S3自体と同じ耐久性、可用性、スケーラビリティ、およびパフォーマンス特性を提供します。さらに、S3 Tablesは以下の機能を提供します：

- 通常のS3 Bucketsに保存されたIcebergテーブルと比較して、S3 Tablesは最大3倍高いクエリパフォーマンスと最大10倍高いトランザクション毎秒を提供できます。
- 自動テーブル管理。S3 Tablesは小さなファイルのコンパクション、スナップショット管理、ガベージファイルのクリーンアップを含む、Icebergテーブルデータを自動的に最適化します。

S3 Tablesのリリースにより、Lakehouseアーキテクチャがさらに簡素化され、クラウドネイティブなlake-warehouseシステムにより多くの可能性がもたらされます。これには、コールドホット分離、データアーカイブ、データバックアップ、コンピュート・ストレージ分離アーキテクチャが含まれ、これらすべてがS3 Tablesを基盤とした全く新しいアーキテクチャに発展する可能性があります。

Amazon S3 TablesのIceberg APIとの高い互換性により、Apache DorisはS3 Tablesと迅速に統合できます。この記事では、Apache DorisをS3 Tablesと接続し、データ分析と処理を実行する方法を説明します。

:::tip
この機能はDoris 3.1以降でサポートされています
:::

## 使用ガイド

### 01 S3 Table Bucketの作成

S3 Table Bucketは、以前のGeneral purpose bucketおよびDirectory bucketと同等のS3が開始した3番目のタイプのBucketです。

![AWS S3 Table Bucket](/images/Lakehouse/s3-table-bucket.png)

ここでは、doris-s3-table-bucketという名前のTable Bucketを作成します。作成後、ARNで表されるTable Bucketを取得します。

![AWS S3 Table Bucket Create](/images/Lakehouse/s3-table-bucket-create.png)

### 02 Iceberg Catalogの作成

- AWS S3 Table Rest Catalogを使用して`s3 tables`に接続する

    ```sql
    CREATE CATALOG aws_s3_tables PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'rest',
        'warehouse' = 'arn:aws:s3tables:us-east-1:<account_id>:bucket/<s3_table_bucket_name>',
        'iceberg.rest.uri' = 'https://s3tables.us-east-1.amazonaws.com/iceberg',
        'iceberg.rest.sigv4-enabled' = 'true',
        'iceberg.rest.signing-name' = 's3tables',
        'iceberg.rest.signing-region' = 'us-east-1',
        'iceberg.rest.access-key-id' = '<ak>',
        'iceberg.rest.secret-access-key' = '<sk>'
    );
    ```
- Glue Rest Catalogを使用した`s3 tables`への接続

    ```sql
    CREATE CATALOG glue_s3 PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'rest',
        'iceberg.rest.uri' = 'https://glue.<region>.amazonaws.com/iceberg',
        'warehouse' = '<acount_id>:s3tablescatalog/<s3_table_bucket_name>',
        'iceberg.rest.sigv4-enabled' = 'true',
        'iceberg.rest.signing-name' = 'glue',
        'iceberg.rest.access-key-id' = '<ak>',
        'iceberg.rest.secret-access-key' = '<sk>',
        'iceberg.rest.signing-region' = '<region>'
    );
    ```
### 03 S3Tablesへのアクセス

```sql
Doris > SWITCH iceberg_s3;

Doris > SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| my_namespace       |
| mysql              |
+--------------------+

Doris > USE my_namespace;

Doris > SHOW TABLES;
+------------------------+
| Tables_in_my_namespace |
+------------------------+
| my_table               |
+------------------------+

Doris > SELECT * FROM my_table;
+------+------+-------+
| id   | name | value |
+------+------+-------+
|    1 | ABC  |   100 |
|    2 | XYZ  |   200 |
+------+------+-------+
```
### 04 S3Tablesテーブルの作成とデータの書き込み

```sql
Doris > CREATE TABLE partition_table (
    ->   `ts` DATETIME COMMENT 'ts',
    ->   `id` INT COMMENT 'col1',
    ->   `pt1` STRING COMMENT 'pt1',
    ->   `pt2` STRING COMMENT 'pt2'
    -> )
    -> PARTITION BY LIST (day(ts), pt1, pt2) ();

Doris > INSERT INTO partition_table VALUES
    -> ("2024-01-01 08:00:00", 1000, "us-east", "PART1"),
    -> ("2024-01-02 10:00:00", 1002, "us-sout", "PART2");
Query OK, 2 rows affected
{'status':'COMMITTED', 'txnId':'1736935786473'}

Doris > SELECT * FROM partition_table;
+----------------------------+------+---------+-------+
| ts                         | id   | pt1     | pt2   |
+----------------------------+------+---------+-------+
| 2024-01-02 10:00:00.000000 | 1002 | us-sout | PART2 |
| 2024-01-01 08:00:00.000000 | 1000 | us-east | PART1 |
+----------------------------+------+---------+-------+
```
## Tableau

### Q1. バージョン2.0.xでTableauがエラーコード37CE01A3でデータソースに接続できないと報告される。

現在のバージョンで新しいオプティマイザーをオフにするか、2.0.7以降にアップグレードしてください

### Q2. SSL接続エラー:protocol version mismatch Failed to connect to the MySQL server

このエラーの原因は、DorisでSSL認証が有効になっているが、接続時にSSL接続が使用されていないことです。fe.confのenable_ssl変数を無効にする必要があります。

### Q3. 接続エラー Unsupported command(COM_STMT_PREPARED)

MySQLドライバーのバージョンが不適切にインストールされています。代わりにMySQL 5.1.x接続ドライバーをインストールしてください。
