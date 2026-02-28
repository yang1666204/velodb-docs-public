---
{
  "title": "MinIO | Storages",
  "description": "この文書では、MinIOにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下のシナリオに適用されます：",
  "language": "ja"
}
---
# MinIO

このドキュメントでは、MinIOにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下のシナリオに適用されます：

- Catalogプロパティ
- Table Valued Functionプロパティ
- Broker Loadプロパティ
- Exportプロパティ
- Outfileプロパティ

**DorisはS3 Clientを使用してS3互換プロトコルを通じてMinIOにアクセスします。**

## パラメータ概要

| Property Name                  | Legacy Name              | デスクリプション                                                  | デフォルト値 | Required |
| ------------------------------ | ------------------------ | ------------------------------------------------------------ | ------------- | -------- |
| minio.endpoint                 | s3.endpoint              | MinIOエンドポイント、MinIOのアクセスエンドポイント               |               | Yes      |
| minio.access_key               | s3.access_key            | MinIOアクセスキー、認証に使用するMinIOアクセスキー |               | Yes      |
| minio.secret_key               | s3.secret_key            | MinIOシークレットキー、アクセスキーと組み合わせて使用するシークレットキー |               | Yes      |
| minio.connection.maximum       | s3.connection.maximum    | S3最大接続数、MinIOサービスと確立する最大接続数を指定 | 50            | No       |
| minio.connection.request.timeout | s3.connection.timeout    | S3リクエストタイムアウト、ミリ秒単位、MinIOサービスに接続する際のリクエストタイムアウトを指定 | 3000          | No       |
| minio.connection.timeout       | s3.connection.timeout    | S3接続タイムアウト、ミリ秒単位、MinIOサービスとの接続確立時のタイムアウトを指定 | 1000          | No       |
| minio.use_path_style           | s3.use_path_style        | path-styleアクセスを使用するかどうか。MinIOおよび他のAWS以外のS3サービスとの互換性のためtrueに設定することを推奨 | FALSE         | No       |

### Path-styleアクセスの使用

MinIOはデフォルトでHost-styleアクセスを使用しますが、Path-styleアクセスもサポートしています。`minio.use_path_style`パラメータを設定することで切り替えることができます。

- Host-styleアクセス（デフォルト）：`https://bucket.minio.example.com`
- Path-styleアクセス（有効時）：`https://minio.example.com/bucket`

## 設定例

```properties
"minio.access_key" = "your-access-key",
"minio.secret_key" = "your-secret-key",
"minio.endpoint" = "http://minio.example.com:9000"
```
バージョン3.1より前の場合:

```properties
"s3.access_key" = "your-access-key",
"s3.secret_key" = "your-secret-key",
"s3.endpoint" = "http://minio.example.com:9000"
```
## 使用推奨事項

* MinIOとの一貫性と明確性を確保するため、設定パラメータには`minio.`プレフィックスを使用することを推奨します。
* バージョン3.1より前では、プレフィックスとして従来の名前`s3.`を使用してください。
* 接続プールパラメータは、接続を回避するために同時実行要件に応じて調整できます
