---
{
  "title": "AWS Glue",
  "description": "この文書では、CREATE CATALOGを通じてIcebergテーブルやHiveテーブルにアクセスするためにAWS Glue Catalogを使用する際のパラメータ設定について説明します。",
  "language": "ja"
}
---
このドキュメントは、`CREATE CATALOG`を通じて**Iceberg tables**または**Hive tables**にアクセスするために**AWS Glue Catalog**を使用する際のパラメータ設定について説明します。

## サポートされているGlue Catalogタイプ

AWS Glue Catalogは現在3つのタイプのCatalogをサポートしています：

| Catalog Type | Type Identifier (`type`) | Description                                    |
|-------------|-------------------------|------------------------------------------------|
| Hive        | glue                    | Catalog for connecting to Hive Metastore      |
| Iceberg     | glue                    | Catalog for connecting to Iceberg table format |
| Iceberg     | rest                    | Catalog for connecting to Iceberg table format via Glue Rest Catalog |

このドキュメントでは、ユーザーの設定を支援するために各タイプの詳細なパラメータの説明を提供します。

## 共通パラメータの概要
| Parameter Name            | Description                                                   | Required | Default Value |
|--------------------------|---------------------------------------------------------------|----------|---------------|
| `glue.region`            | AWS Glue region, e.g., `us-east-1`                          | Yes      | None          |
| `glue.endpoint`          | AWS Glue endpoint, e.g., `https://glue.us-east-1.amazonaws.com` | Yes      | None          |
| `glue.access_key`        | AWS Access Key ID                                            | Yes      | Empty         |
| `glue.secret_key`        | AWS Secret Access Key                                        | Yes      | Empty         |
| `glue.catalog_id`        | Glue Catalog ID (not supported yet)                         | No       | Empty         |
| `glue.role_arn`          | IAM Role ARN for accessing Glue (supported since 3.1.2+)   | No       | Empty         |
| `glue.external_id`       | IAM External ID for accessing Glue (supported since 3.1.2+) | No       | Empty         |

### 認証パラメータ

Glueにアクセスするには認証情報が必要で、以下の2つの方法をサポートしています：

1. Access Key認証

   `glue.access_key`と`glue.secret_key`で提供されるAccess Keyを通じてGlueへのアクセスを認証します。

2. IAM Role認証（3.1.2+以降でサポート）

   `glue.role_arn`で提供されるIAM Roleを通じてGlueへのアクセスを認証します。

   この方法では、DorisがAWS EC2上にデプロイされている必要があり、EC2インスタンスにはGlueにアクセスする権限を持つIAM Roleがバインドされている必要があります。

   External IDを通じたアクセスが必要な場合は、`glue.external_id`も設定する必要があります。

注意：

- 2つの方法のうち少なくとも1つは設定する必要があります。両方の方法が設定されている場合、Access Key認証が優先されます。

例：

    ```sql
    CREATE CATALOG hive_glue_catalog PROPERTIES (
      'type' = 'hms',
      'hive.metastore.type' = 'glue',
      'glue.region' = 'us-east-1',
      'glue.endpoint' = 'https://glue.us-east-1.amazonaws.com',
      -- Using Access Key authentication
      'glue.access_key' = '<YOUR_ACCESS_KEY>',
      'glue.secret_key' = '<YOUR_SECRET_KEY>'
      -- Or using IAM Role authentication
      -- 'glue.role_arn' = '<YOUR_ROLE_ARN>',
      -- 'glue.external_id' = '<YOUR_EXTERNAL_ID>'
    );
    ```
### Hive Glue Catalog

Hive Glue CatalogはAWS GlueのHive Metastore互換インターフェースを通じてHiveテーブルにアクセスするために使用されます。設定は以下の通りです：

| パラメータ名 | 説明 | 必須 | デフォルト値 |
|--------------------------|---------------------------------------------------------------|----------|---------------|
| `type` | `hms`で固定 | Yes | None |
| `hive.metastore.type` | `glue`で固定 | Yes | None |
| `glue.region` | AWS Glueリージョン、例：`us-east-1` | Yes | None |
| `glue.endpoint` | AWS Glueエンドポイント、例：`https://glue.us-east-1.amazonaws.com` | Yes | None |
| `glue.access_key` | AWS Access Key ID | No | Empty |
| `glue.secret_key` | AWS Secret Access Key | No | Empty |
| `glue.catalog_id` | Glue Catalog ID（まだサポートされていません） | No | Empty |
| `glue.role_arn` | GlueにアクセスするためのIAM Role ARN | No | Empty |
| `glue.external_id` | GlueにアクセスするためのIAM External ID | No | Empty |

#### 例

```sql
CREATE CATALOG hive_glue_catalog PROPERTIES (
  'type' = 'hms',
  'hive.metastore.type' = 'glue',
  'glue.region' = 'us-east-1',
  'glue.endpoint' = 'https://glue.us-east-1.amazonaws.com',
  'glue.access_key' = 'YOUR_ACCESS_KEY',
  'glue.secret_key' = 'YOUR_SECRET_KEY'
);
```
### Iceberg Glue Catalog

Iceberg Glue CatalogはGlue Clientを通じてGlueにアクセスします。設定は以下の通りです：

| パラメータ名 | 説明 | 必須 | デフォルト値 |
|------------------------|------------------------------------------------------------------|----------|---------------|
| `type` | `iceberg`に固定 | はい | None |
| `iceberg.catalog.type` | `glue`に固定 | はい | None |
| `warehouse` | Icebergデータウェアハウスパス、例：`s3://my-bucket/iceberg-warehouse/` | はい | s3://doris |
| `glue.region` | AWS Glueリージョン、例：`us-east-1` | はい | None |
| `glue.endpoint` | AWS Glueエンドポイント、例：`https://glue.us-east-1.amazonaws.com` | はい | None |
| `glue.access_key` | AWS Access Key ID | いいえ | Empty |
| `glue.secret_key` | AWS Secret Access Key | いいえ | Empty |
| `glue.catalog_id` | Glue Catalog ID（未サポート） | いいえ | Empty |
| `glue.role_arn` | Glueアクセス用のIAM Role ARN（未サポート） | いいえ | Empty |
| `glue.external_id` | Glueアクセス用のIAM External ID（未サポート） | いいえ | Empty |

#### 例

```sql
CREATE CATALOG iceberg_glue_catalog PROPERTIES (
  'type' = 'iceberg',
  'iceberg.catalog.type' = 'glue',
  'glue.region' = 'us-east-1',
  'glue.endpoint' = 'https://glue.us-east-1.amazonaws.com',
  'glue.access_key' = '<YOUR_ACCESS_KEY>',
  'glue.secret_key' = '<YOUR_SECRET_KEY>'
);
```
### Iceberg Glue Rest Catalog

Iceberg Glue Rest Catalogは、Glue Rest Catalogインターフェースを通じてGlueにアクセスします。現在はAWS S3 Table Bucketに保存されたIcebergテーブルのみをサポートしています。設定は以下の通りです：

| パラメータ名                        | 説明                                                            | 必須 | デフォルト値 |
|----------------------------------|-------------------------------------------------------------------|------|---------------|
| `type`                           | `iceberg`に固定                                                | はい | None          |
| `iceberg.catalog.type`           | `rest`に固定                                                   | はい | None          |
| `iceberg.rest.uri`               | Glue Restサービスエンドポイント、例：`https://glue.ap-east-1.amazonaws.com/iceberg` | はい | None          |
| `warehouse`                      | Icebergデータウェアハウスパス、例：`<account_id>:s3tablescatalog/<bucket_name>` | はい | None          |
| `iceberg.rest.sigv4-enabled`     | V4署名形式を有効化、`true`に固定                                | はい | None          |
| `iceberg.rest.signing-name`      | 署名タイプ、`glue`に固定                                       | はい | Empty         |
| `iceberg.rest.access-key-id`     | Glueアクセス用のAccess Key（S3 Bucketアクセスにも使用）           | はい | Empty         |
| `iceberg.rest.secret-access-key` | Glueアクセス用のSecret Key（S3 Bucketアクセスにも使用）           | はい | Empty         |
| `iceberg.rest.signing-region`    | AWS Glueリージョン、例：`us-east-1`                            | はい | Empty         |

#### 例

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
## Permission Policies

使用シナリオに応じて、**read-only**と**read-write**のポリシーに分けることができます。

### 1. Read-Only Permissions

Glue Catalogからデータベースとテーブル情報の読み取りのみを許可します。

``` json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GlueCatalogReadOnly",
      "Effect": "Allow",
      "Action": [
        "glue:GetCatalog",
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartitions"
      ],
      "Resource": [
        "arn:aws:glue:<region>:<account-id>:catalog",
        "arn:aws:glue:<region>:<account-id>:database/*",
        "arn:aws:glue:<region>:<account-id>:table/*/*"
      ]
    }
  ]
}
```
### 2. Read-Write Permissions

読み取り専用権限をベースとして、データベースとテーブルの作成/変更/削除を許可します。

``` json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GlueCatalogReadWrite",
      "Effect": "Allow",
      "Action": [
        "glue:GetCatalog",
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartitions",
        "glue:CreateDatabase",
        "glue:UpdateDatabase",
        "glue:DeleteDatabase",
        "glue:CreateTable",
        "glue:UpdateTable",
        "glue:DeleteTable"
      ],
      "Resource": [
        "arn:aws:glue:<region>:<account-id>:catalog",
        "arn:aws:glue:<region>:<account-id>:database/*",
        "arn:aws:glue:<region>:<account-id>:table/*/*"
      ]
    }
  ]
}
```
### 注意事項

1. プレースホルダーの置換

    - `<region>` → あなたのAWSリージョン（例：`us-east-1`）
    - `<account-id>` → あなたのAWSアカウントID（12桁の番号）

2. 最小権限の原則

    - クエリのみを実行する場合は、書き込み権限を付与しないでください。
    - `*`を特定のデータベース/テーブルのARNに置き換えることで、権限をさらに制限できます。

3. S3権限

    - 上記のポリシーはGlue Catalogのみを対象としています。
    - データファイルを読み取る必要がある場合は、追加のS3権限が必要です（`s3:GetObject`、`s3:ListBucket`など）。
