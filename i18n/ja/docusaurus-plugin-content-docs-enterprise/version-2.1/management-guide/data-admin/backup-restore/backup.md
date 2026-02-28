---
{
  "title": "バックアップ",
  "language": "ja"
}
---
バックアップに関する概念については、[Backup and Restore](./overview.md)を参照してください。このガイドでは、Repositoryを作成してデータをバックアップする手順を説明します。

## ステップ 1. Repository作成

<!--
suites/backup_restore/test_create_and_drop_repository.groovy
-->

ストレージの選択に基づいて適切なステートメントを使用してRepositoryを作成してください。詳細な使用方法については、[Create Repository](../../../sql-manual/sql-statements/data-modification/backup-and-restore/CREATE-REPOSITORY)を参照してください。異なるクラスター間で同じパスのRepositoryを使用してバックアップする場合は、データの混乱を引き起こす可能性がある競合を避けるため、異なるラベルを使用するようにしてください。

### Option 1: S3でRepository作成

S3ストレージでRepositoryを作成するには、以下のSQLコマンドを使用してください：

```sql
CREATE REPOSITORY `s3_repo`
WITH S3
ON LOCATION "s3://bucket_name/s3_repo"
PROPERTIES
(
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk"
);
```
- `bucket_name`をあなたのS3バケット名に置き換えてください。
- S3セットアップに適切なエンドポイント、アクセスキー、シークレットキー、およびリージョンを提供してください。

### Option 2: AzureでRepositoryを作成

**Azureは3.0.4以降でサポートされています。**

Azureストレージ上でRepositoryを作成するには、以下のSQLコマンドを使用してください：

```sql
CREATE REPOSITORY `azure_repo`
WITH S3
ON LOCATION "s3://bucket_name/azure_repo"
PROPERTIES
(
    "s3.endpoint" = "selectdbcloudtestwestus3.blob.core.windows.net",
    "s3.region" = "dummy_region",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk",
    "provider" = "AZURE"
);
```
- `bucket_name`をあなたのAzureコンテナ名に置き換えてください。
- 認証のためにAzureストレージアカウントとキーを提供してください。
- `s3.region`はダミーですが必須のフィールドです。
- Azureストレージの場合、`provider`は`AZURE`に設定する必要があります。

### オプション3: GCPでRepositoryを作成する

Google Cloud Platform (GCP) ストレージでRepositoryを作成するには、以下のSQLコマンドを使用してください：

```sql
CREATE REPOSITORY `gcp_repo`
WITH S3
ON LOCATION "s3://bucket_name/backup/gcp_repo"
PROPERTIES
(
    "s3.endpoint" = "storage.googleapis.com",
    "s3.region" = "US-WEST2",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk"
);
```
- `bucket_name` をあなたのGCPバケット名に置き換えてください。
- GCPエンドポイント、アクセスキー、およびシークレットキーを提供してください。
- `s3.region` はダミーですが必須フィールドです。

### オプション4: OSS（Alibaba Cloud Object Storage Service）でRepositoryを作成する

OSSでRepositoryを作成するには、以下のSQLコマンドを使用します：

```sql
CREATE REPOSITORY `oss_repo`
WITH S3
ON LOCATION "s3://bucket_name/oss_repo"
PROPERTIES
(
    "s3.endpoint" = "oss.aliyuncs.com",
    "s3.region" = "cn-hangzhou",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk"
);
```
- `bucket_name`をあなたのOSSバケット名に置き換えてください。
- OSSエンドポイント、リージョン、アクセスキー、シークレットキーを提供してください。

### Option 5: MinIOでRepositoryを作成する

MinIOストレージでRepositoryを作成するには、以下のSQLコマンドを使用してください：

```sql
CREATE REPOSITORY `minio_repo`
WITH S3
ON LOCATION "s3://bucket_name/minio_repo"
PROPERTIES
(
    "s3.endpoint" = "yourminio.com",
    "s3.region" = "dummy-region",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk",
    "use_path_style" = "true"
);
```
- `bucket_name`を自分のMinIOバケット名に置き換えてください。
- MinIOエンドポイント、アクセスキー、シークレットキーを提供してください。
- `s3.region`はダミーですが必須のフィールドです。
- Virtual Host-styleを有効にしない場合、`use_path_style`はtrueである必要があります。

### オプション6: HDFSでRepositoryを作成する

HDFSストレージでRepositoryを作成するには、次のSQLコマンドを使用してください：

```sql
CREATE REPOSITORY `hdfs_repo`
WITH hdfs
ON LOCATION "/prefix_path/hdfs_repo"
PROPERTIES
(
    "fs.defaultFS" = "hdfs://127.0.0.1:9000",
    "hadoop.username" = "doris-test"
)
```
- `prefix_path`を実際のパスに置き換えてください。
- HDFSエンドポイントとユーザー名を提供してください。

## ステップ2. バックアップ

データベース、Table、またはパーティションをバックアップするには、以下のステートメントを参照してください。詳細な使用方法については、[Backup](../../../sql-manual/sql-statements/data-modification/backup-and-restore/BACKUP)を参照してください。

バックアップに含まれるデータベースやTableを含む、意味のあるラベル名を使用することをお勧めします。

### オプション1: 現在のデータベースのバックアップ

以下のSQLステートメントは、現在のデータベースを`example_repo`という名前のRepositoryにバックアップし、スナップショットラベル`exampledb_20241225`を使用します。

```sql
BACKUP SNAPSHOT exampledb_20241225
TO example_repo;
```
### オプション 2: 指定されたデータベースのバックアップ

以下のSQL文は、`destdb`という名前のデータベースを`example_repo`という名前のRepositoryにバックアップし、スナップショットラベル`destdb_20241225`を使用します。

```sql
BACKUP SNAPSHOT destdb.`destdb_20241225`
TO example_repo;
```
### オプション3: 指定したTableのバックアップ

以下のSQL文は、スナップショットラベル`exampledb_tbl_tbl1_20241225`を使用して、2つのTableを`example_repo`という名前のRepositoryにバックアップします。

```sql
BACKUP SNAPSHOT exampledb_tbl_tbl1_20241225
TO example_repo
ON (example_tbl, example_tbl1);
```
### Option 4: 指定パーティションのバックアップ

以下のSQL文は、`example_tbl2`という名前のTableと`p1`および`p2`という名前の2つのパーティションを`example_repo`という名前のRepositoryにバックアップし、スナップショットラベル`example_tbl_p1_p2_tbl1_20241225`を使用します。

```sql
BACKUP SNAPSHOT example_tbl_p1_p2_tbl1_20241225
TO example_repo
ON
(
      example_tbl PARTITION (p1,p2),
      example_tbl2
);
```
### オプション 5: 特定のTableを除外して現在のデータベースをバックアップ

以下のSQL文は、現在のデータベースを`example_repo`という名前のRepositoryにバックアップし、スナップショットラベル`exampledb_20241225`を使用して、`example_tbl`と`example_tbl1`という名前の2つのTableを除外します。

```sql
BACKUP SNAPSHOT exampledb_20241225
TO example_repo
EXCLUDE
(
      example_tbl,
      example_tbl1
);
```
## ステップ 3. 最近のバックアップジョブの実行状態を確認する

次のSQL文を使用して、最近のバックアップジョブの実行状態を確認できます。

```sql
mysql> show BACKUP\G;
*************************** 1. row ***************************
                  JobId: 17891847
           SnapshotName: exampledb_20241225
                 DbName: example_db
                  State: FINISHED
             BackupObjs: [example_db.example_tbl]
             CreateTime: 2022-04-08 15:52:29
   SnapshotFinishedTime: 2022-04-08 15:52:32
     UploadFinishedTime: 2022-04-08 15:52:38
           FinishedTime: 2022-04-08 15:52:44
        UnfinishedTasks:
               Progress:
             TaskErrMsg:
                 Status: [OK]
                Timeout: 86400
   1 row in set (0.01 sec)
```
## ステップ 4. Repository内の既存バックアップを表示する

以下のSQL文を使用して、`example_repo`という名前のRepository内の既存バックアップを表示できます。ここで、Snapshot列はスナップショットラベル、Timestampはタイムスタンプです。

```sql
mysql> SHOW SNAPSHOT ON example_repo;
+-----------------+---------------------+--------+
| Snapshot        | Timestamp           | Status |
+-----------------+---------------------+--------+
| exampledb_20241225 | 2022-04-08-15-52-29 | OK     |
+-----------------+---------------------+--------+
1 row in set (0.15 sec)
```
## ステップ5. バックアップのキャンセル（必要な場合）

`CANCEL BACKUP FROM db_name;`を使用してデータベース内のバックアップタスクをキャンセルできます。より具体的な使用方法については、[Cancel Backup](../../../sql-manual/sql-statements/data-modification/backup-and-restore/CANCEL-BACKUP)を参照してください。
