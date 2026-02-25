---
{
  "title": "Huawei OBS",
  "description": "この文書では、Huawei Cloud OBSにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下のシナリオに適用されます：",
  "language": "ja"
}
---
この文書では、Huawei Cloud OBSへのアクセスに必要なパラメータについて説明します。これらのパラメータは以下のシナリオに適用されます：

- Catalogプロパティ
- Table Valued Functionプロパティ
- Broker Loadプロパティ
- Exportプロパティ
- Outfileプロパティ

**DorisはS3 Clientを使用して、S3互換プロトコルを通じてHuawei Cloud OBSにアクセスします。**

## パラメータ概要

| Property Name                | Former Name              | Description                                                  | Default Value | Required |
| ---------------------------- | ------------------------ | ------------------------------------------------------------ | ------------- | -------- |
| obs.endpoint                 | s3.endpoint              | OBSエンドポイント、Huawei Cloud OBSのアクセスエンドポイントを指定 |               | Yes      |
| obs.access_key               | s3.access_key            | OBSアクセスキー、認証に使用                     |               | Yes      |
| obs.secret_key               | s3.secret_key            | OBSシークレットキー、アクセスキーと組み合わせて認証に使用 |               | Yes      |
| obs.region                   | s3.region                | OBSリージョン、Huawei Cloud OBSのリージョンを指定        |               | No       |
| obs.use_path_style           | s3.use_path_style        | パススタイルアクセスを使用するかどうか。MinIO/Cephなどの非AWS S3サービスとの互換性のためtrueに設定することを推奨 | FALSE         | No       |
| obs.connection.maximum       | s3.connection.maximum    | OBSサービスへの最大接続数                | 50            | No       |
| obs.connection.request.timeout | s3.connection.request.timeout | OBSサービスへの接続時のリクエストタイムアウト（ミリ秒） | 3000          | No       |
| obs.connection.timeout       | s3.connection.timeout    | OBSサービスへの接続確立時のコネクションタイムアウト（ミリ秒） | 1000          | No       |

> バージョン3.1より前では、レガシー名を使用してください

## 設定例

```properties
"obs.access_key" = "your-access-key",
"obs.secret_key" = "your-secret-key",
"obs.endpoint" = "obs.cn-north-4.myhuaweicloud.com",
"obs.region" = "cn-north-4"
```
バージョン3.1より前の場合:

```properties
"s3.access_key" = "your-access-key",
"s3.secret_key" = "your-secret-key",
"s3.endpoint" = "obs.cn-north-4.myhuaweicloud.com",
"s3.region" = "cn-north-4",
```
## 使用推奨事項

* Huawei Cloud OBSとの一貫性と明確性を確保するため、設定パラメータには`obs.`プレフィックスを使用することを推奨します。
* バージョン3.1より前では、`s3.`プレフィックスを持つ従来の名前を使用してください。
* `obs.region`を設定することでアクセス精度とパフォーマンスを向上させることができるため、設定することを推奨します。
* コネクションプールパラメータは、コネクションのブロッキングを避けるために、並行処理要件に応じて調整できます。
