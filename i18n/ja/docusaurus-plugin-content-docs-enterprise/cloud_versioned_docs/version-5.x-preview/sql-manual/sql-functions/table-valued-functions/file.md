---
{
  "title": "I don't see any text to translate in your message. You mentioned \"Text:\" followed by \"FILE\" but there doesn't appear to be any actual technical documentation content provided. \n\nCould you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "File table-valued-function (tvf) は、S3、HDFS、LOCAL などのテーブル関数のラッパーです。",
  "language": "ja"
}
---
## 説明

File table-valued-function (tvf) は、[S3](./s3.md)、[HDFS](./hdfs.md)、[LOCAL](local.md) などのテーブル関数のラッパーで、異なるストレージシステム上のファイル内容にアクセスするための統一されたインターフェースを提供します。

この機能はバージョン 3.1.0 からサポートされています。

## 構文

```sql
FILE(
    {StorageProperties},
    {FileFormatProperties}
)
```
- `{StorageProperties}`

    StoragePropertiesセクションは、ストレージシステムに関連する接続と認証情報を入力するために使用されます。詳細については、[Supported Storage Systems]セクションを参照してください。

- `{FileFormatProperties}`

    FileFormatPropertiesセクションは、CSVデリミタなど、ファイル形式に関連するプロパティを入力するために使用されます。詳細については、[Supported File Formats]セクションを参照してください。

## Supported Storage Systems

* [ hdfs](../../../lakehouse/storages/hdfs.md)

* [ aws s3](../../../lakehouse/storages/s3.md)

* [ google cloud storage](../../../lakehouse/storages/gcs.md)

* [ Alibaba Cloud OSS](../../../lakehouse/storages/aliyun-oss.md)

* [ Tencent Cloud COS](../../../lakehouse/storages/tencent-cos.md)

* [ Huawei Cloud OBS](../../../lakehouse/storages/huawei-obs.md)

* [ MINIO](../../../lakehouse/storages/minio.md)

## Supported File Formats

* [Parquet](../../../lakehouse/file-formats/parquet.md)

* [ORC](../../../lakehouse/file-formats/orc.md)

* [Text/CSV/JSON](../../../lakehouse/file-formats/text.md)

## Examples

### Accessing S3 Storage

```sql
select * from file(
    "fs.s3.support" = "true",
    "uri" = "s3://bucket/file.csv",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk",
    "s3.endpoint" = "endpoint",
    "s3.region" = "region",
    "format" = "csv"
);
```
### HDFS ストレージへのアクセス

```sql
select * from file(
    "fs.hdfs.support" = "true",
    "uri" = "hdfs://path/to/file.csv",
    "fs.defaultFS" = "hdfs://localhost:9000",
    "hadoop.username" = "doris",
    "format" = "csv"
);
```
### Local Storageへのアクセス

```sql
select * from file(
    "fs.local.support" = "true",
    "file_path" = "student.csv",
    "backend_id" = "10003",
    "format" = "csv"
);
```
### desc関数を使用してテーブル構造を表示する

```sql
desc function file(
    "fs.s3.support" = "true",
    "uri" = "s3://bucket/file.csv",
    "s3.access_key" = "ak",
    "s3.secret_key" = "sk",
    "s3.endpoint" = "endpoint",
    "s3.region" = "region",
    "format" = "csv"
);
```
