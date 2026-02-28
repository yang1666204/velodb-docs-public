---
{
  "title": "Amazon S3 Tables",
  "description": "VeloDB CloudはAWS Glue Iceberg RESTエンドポイント経由でS3 Tablesに接続します。AWS Lake FormationでS3 Tables統合を有効にすると、AWS Glueはデータカタログ内に`s3tablescatalog`という名前のフェデレーテッドカタログを作成します。VeloDB Cloudは、このディレクトリのIceberg REST APIを通じてS3 Tablesデータにアクセスします。",
  "language": "ja"
}
---
Amazon S3 Tablesは、AWSによって導入されたTable形式データに最適化されたストレージサービスで、Apache Icebergフォーマットをネイティブサポートしています。

VeloDB Cloudは、AWS Glue Iceberg RESTエンドポイント経由でS3 Tablesに接続します。AWS Lake FormationでS3 Tables統合を有効にすると、AWS Glueはデータカタログ内に`s3tablescatalog`という名前のフェデレーテッドカタログを作成します。VeloDB Cloudは、このディレクトリのIceberg REST APIを通じてS3 Tablesデータにアクセスします。

## 前提条件

Amazon S3 Tables Catalogを作成する前に、AWS側で以下の準備が完了していることを確認してください。

### 1. S3 Table Bucketの作成

まず、AWS S3でTable Bucketを作成する必要があります：

1. AWS S3コンソールにログインします。
2. 左側のナビゲーションバーで、**Table buckets**を選択します。
3. **Create table bucket**をクリックします。
4. バケット名を入力し、リージョンを選択します。
5. 作成を完了します。

### 2. Lake FormationでS3 Tables統合を有効化

AWS Glue Iceberg RESTエンドポイント経由でS3 Tablesにアクセスするには、まずLake Formationで統合を有効にする必要があります：

1. AWS Lake Formationコンソールにログインします。
2. 左側のナビゲーションバーで、**データカタログ** > **Catalogs**を選択します。
3. ページ上部のプロンプトバナーで、**Enable S3 Table integration**ボタンをクリックします。

![aws-s3-tables-1](/images/integrations/data-catalog/aws-s3-tables-1.png)

有効にすると、AWS Glueが自動的に`s3tablescatalog`という名前のフェデレーテッドカタログを作成し、S3 Table Bucketsがその中にサブディレクトリとして表示されます。

> 詳細な手順については、AWS公式ドキュメントを参照してください：[Creating an Amazon S3 Tables catalog in the AWS Glue データカタログ](https://docs.aws.amazon.com/lake-formation/latest/dg/create-s3-tables-catalog.html)

### 3. NamespaceとTableの作成

S3 Table Bucket内にNamespaceとTableを作成します：

1. S3コンソールのTable bucketsページで、Table Bucketを選択します。
2. Namespaceを作成します。
3. Namespace内にTableを作成します。

### 4. Lake Formation権限の設定

Lake Formationで必要な権限を付与します：

1. AWS Lake Formationコンソールにログインします。
2. 左側のナビゲーションバーで、**Permissions** → **Data permissions**を選択します。
3. **Grant**をクリックします。
4. 以下のオプションを設定します：
   - **Principals**: IAM users and rolesを選択し、IAMユーザーまたはロールを選択します。
   - **LF-Tags or catalog resources**: Named データカタログ resourcesを選択します。
   - **Catalogs**: s3tablescatalogを選択します。
   - **Databases**: `s3tablescatalog/<table-bucket-name>`配下の対象データベース、またはAll databasesを選択します。
   - **Tables**: 対象TableまたはAll tablesを選択します。
5. 必要な権限にチェックを入れます：
   - **Table permissions**: Select、Insert、Delete、Describe、Alter、Dropなど。
6. **Grant**をクリックします。

### 5. IAM権限の設定

S3 TablesにアクセスするIAMユーザー/ロールに対して、以下の権限ポリシーを設定します：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GlueCatalogAccess",
            "Effect": "Allow",
            "Action": [
                "glue:GetCatalog",
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:CreateDatabase",
                "glue:UpdateDatabase",
                "glue:DeleteDatabase",
                "glue:GetTable",
                "glue:GetTables",
                "glue:CreateTable",
                "glue:UpdateTable",
                "glue:DeleteTable",
                "glue:GetUserDefinedFunction",
                "glue:GetUserDefinedFunctions",
                "glue:DeleteUserDefinedFunction"
            ],
            "Resource": [
                "arn:aws:glue:<region>:<account-id>:catalog",
                "arn:aws:glue:<region>:<account-id>:catalog/s3tablescatalog",
                "arn:aws:glue:<region>:<account-id>:catalog/s3tablescatalog/<table-bucket-name>",
                "arn:aws:glue:<region>:<account-id>:database/s3tablescatalog/<table-bucket-name>/*",
                "arn:aws:glue:<region>:<account-id>:table/s3tablescatalog/<table-bucket-name>/*/*",
                "arn:aws:glue:<region>:<account-id>:userDefinedFunction/s3tablescatalog/<table-bucket-name>/*/*"
            ]
        },
        {
            "Sid": "S3TablesAccess",
            "Effect": "Allow",
            "Action": [
                "s3tables:GetTableBucket",
                "s3tables:ListTableBuckets",
                "s3tables:CreateNamespace",
                "s3tables:GetNamespace",
                "s3tables:ListNamespaces",
                "s3tables:DeleteNamespace",
                "s3tables:CreateTable",
                "s3tables:GetTable",
                "s3tables:ListTables",
                "s3tables:UpdateTableMetadataLocation",
                "s3tables:GetTableMetadataLocation",
                "s3tables:RenameTable",
                "s3tables:DeleteTable",
                "s3tables:GetTableData",
                "s3tables:PutTableData"
            ],
            "Resource": [
                "arn:aws:s3tables:<region>:<account-id>:bucket/<table-bucket-name>",
                "arn:aws:s3tables:<region>:<account-id>:bucket/<table-bucket-name>/*"
            ]
        },
        {
            "Sid": "LakeFormationDataAccess",
            "Effect": "Allow",
            "Action": [
                "lakeformation:GetDataAccess"
            ],
            "Resource": "*"
        }
    ]
}
```
> **設定手順**
>
> - `<region>`を実際のAWSリージョン（例：us-east-1）に置き換えてください。
> - `<account-id>`をあなたのAWS アカウント IDに置き換えてください。
> - `<table-bucket-name>`をあなたのS3 Table Bucket名に置き換えてください。

### 6. ネットワーク要件

- VeloDB CloudはS3 Table Glue RESTエンドポイントにアクセスできる必要があります。
- VeloDB Cloudはデータストレージ（例：S3）にアクセスできる必要があります。

> **SaaS ModeのVeloDB Cloudの場合**
>
> - WarehouseとおなじリージョンにあるS3 Table Glue RESTエンドポイントとS3 Bucketsにのみアクセス可能です。
>
> **BYOC ModeのVeloDB Cloudの場合**
>
> - S3 Table Glue RESTエンドポイントとS3 Bucketサービスへのアクセスには、デプロイ時のネットワークポリシーを参照する必要があります。[create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources)を参照してください。

## Catalogの作成

VeloDB CloudでAmazon S3 Tables Catalogを作成するには、以下の手順に従ってください。

### ステップ 1: 作成ページへの移動

1. VeloDB Cloud Consoleにログインします。
2. 左ナビゲーションバーで**Catalogs**をクリックします。
3. **Add 外部カタログ**ボタンをクリックします。
4. Data Lakeカテゴリの下で**Amazon S3 Tables**を選択します。

### ステップ 2: 基本情報の入力

**Basic Information**セクションで、Catalogの基本識別情報を設定します。

![aws-s3-tables-2](/images/integrations/data-catalog/aws-s3-tables-2.png)

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **カタログ Name** | ✓ | Catalogの一意な名前で、SQLクエリでこのデータソースを識別するために使用されます。 |
| **Comment** |  | オプションの説明。 |

### ステップ 3: Metastoreの設定

**Metastore**セクションで、S3 Tablesへの接続に必要な情報を設定します。S3 TablesはAWS Glueが提供するIceberg REST Catalogインタフェースを使用します。

![aws-s3-tables-3](/images/integrations/data-catalog/aws-s3-tables-3.png)

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **Iceberg REST URI** | ✓ | AWS Glue Iceberg REST APIエンドポイント。形式は`https://glue.<region>.amazonaws.com/iceberg`で、`<region>`はあなたのAWSリージョンです。 |
| **Warehouse** | ✓ | S3 Table Bucketの識別子。形式は`<account-id>:s3tablescatalog/<table-bucket-name>`です。AWS S3 ConsoleのTable Bucketsページで確認できます。 |
| **Region** | ✓ | S3 Table Bucketが配置されているAWSリージョンで、Glue Iceberg RESTエンドポイントと一致している必要があります。 |
| **Signing-name** | ✓ | AWSサービス署名名。S3 Tablesの場合は`glue`を入力します。 |

**Warehouse形式について**：

Warehouseの形式は`<account-id>:s3tablescatalog/<table-bucket-name>`で、3つの部分から構成されます：

- `<account-id>`：あなたのAWS アカウント ID（12桁）。
- `s3tablescatalog`：これがS3 Tablesディレクトリであることを示す固定プレフィックス。
- `<table-bucket-name>`：S3 Table Bucketの名前。

### ステップ 4: 認証の設定

**認証**セクションで、AWSサービスへのアクセスに使用する認証情報を設定します。

![aws-s3-tables-4](/images/integrations/data-catalog/aws-s3-tables-4.png)

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **AK** | ✓ | AWS Access Key ID。 |
| **SK** | ✓ | AWS Secret Access Key。 |

**セキュリティ推奨事項**：

- AWSルートアカウントのアクセスキーは使用しないでください。
- VeloDB Cloud専用のIAMユーザーを作成してください。
- 最小権限の原則に従い、S3 Tables、Glue、S3に必要な権限のみを付与してください。
- アクセスキーを定期的にローテーションしてください。

### ステップ 5: 詳細設定（オプション）

**Advanced Settings**をクリックして、より多くの設定オプションを展開します。

![aws-s3-tables-5](/images/integrations/data-catalog/aws-s3-tables-5.png)

詳細設定には通常以下が含まれます：

- メタデータキャッシュ設定。
- 接続タイムアウト設定。

> **ヒント**: ほとんどのシナリオでは、デフォルト値で十分です。

### ステップ 6: 作成の確認

1. すべての設定情報が正しいかを確認します。
2. **Confirm**ボタンをクリックしてCatalogを作成します。
3. 接続確認が完了するまで待ちます。

作成が成功すると、Catalogリストで新しく作成されたAmazon S3 Tables Catalogを確認できます。

## Catalogの使用

作成が成功した後、SQL EditorでCatalogを使用してデータをクエリできます。

### NamespaceとTableの表示

```sql
-- View all Namespaces under the カタログ
SHOW DATABASES FROM s3_tables_catalog;

-- View all tables under a specific Namespace
SHOW TABLES FROM s3_tables_catalog.my_database;

-- View table structure
DESCRIBE s3_tables_catalog.my_database.my_table;
```
### Query Data

```sql
-- Query data
SELECT * FROM s3_tables_catalog.my_database.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM s3_tables_catalog.my_database.my_table
WHERE event_date >= '2024-01-01';
```
