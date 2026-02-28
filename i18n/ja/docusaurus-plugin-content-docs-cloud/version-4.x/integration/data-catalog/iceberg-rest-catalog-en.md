---
{
  "title": "Iceberg REST カタログ",
  "description": "Iceberg REST Catalogは、Apache Icebergによって定義された標準のREST API仕様であり、IcebergTableメタデータを管理およびアクセスするための汎用的な方法を提供します。この仕様を実装するあらゆるサービスをIceberg REST Catalogとして使用できます。Iceberg REST Catalogを作成することで、VeloDB Cloud内でIceberg REST仕様と互換性のあるあらゆるCatalogサービスに接続できます。",
  "language": "ja"
}
---
Iceberg REST Catalogは、Apache Icebergによって定義された標準のREST API仕様であり、IcebergTableメタデータを管理・アクセスするための汎用的な方法を提供します。この仕様を実装したサービスはすべて、Iceberg REST Catalogとして使用できます。

Iceberg REST Catalogを作成することで、VeloDB Cloud内でIceberg REST仕様と互換性のある任意のCatalogサービスに接続できます。

> **ヒント**: Apache PolarisまたはAmazon S3 Tablesを使用している場合は、より的確な設定オプションを提供する専用のCatalogタイプの使用を推奨します。

## 前提条件

Iceberg REST Catalogを作成する前に、以下の条件が満たされていることを確認してください：

### REST Catalogサービスの準備

* Iceberg REST CatalogサービスがデプロイされていてVeloDB Cloudからネットワーク経由でアクセス可能であること。
* REST Catalogで認証が有効化されている場合は、OAuth2認証情報（クライアント ID、クライアント Secret）を準備してください。

### ストレージの準備

* REST CatalogがVended Credentialsをサポートしている場合は、追加のストレージ認証情報は不要です。
* Vended Credentialsがサポートされていない場合は、ストレージアクセス用の認証情報（AWS Access Keyなど）を準備してください。

### ネットワーク要件

* VeloDB CloudがREST Catalogサービスエンドポイントにアクセス可能であること。
* VeloDB Cloudがデータストレージ（S3など）にアクセス可能であること。

> **SaaS ModeのVeloDB Cloudの場合：**
> * Iceberg RESTサービスへのアクセスには、VeloDBがVPCへのアクセス許可が必要な場合があります。[velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc)を参照してください。
> * WarehouseとおなじRegion内のS3 Bucketのみアクセス可能です。
>
> **BYOC ModeのVeloDB Cloudの場合：**
> * Iceberg RESTサービスとS3 Bucketへのアクセスには、デプロイ時のネットワークポリシーを参照する必要があります。[create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources)を参照してください。

## Catalogの作成

以下の手順に従って、VeloDB CloudでIceberg REST Catalogを作成してください。

### ステップ1: 作成ページに入る

1. VeloDB Cloudコンソールにログインします。
2. 左側のナビゲーションバーで、**Catalogs**をクリックします。
3. **Add 外部カタログ**ボタンをクリックします。
4. Data Lakeカテゴリの下で、**Iceberg REST カタログ**を選択します。

### ステップ2: 基本情報の入力

**Basic Information**セクションで、Catalogの基本識別情報を設定します。

![irc-1](/images/integrations/data-catalog/irc-1.png)

| フィールド | 必須 | 説明 |
| ---------------- | -- | -------------------------------- |
| **カタログ Name** | ✓  | Catalogの一意な名前で、SQLクエリでこのデータソースを識別するために使用されます。 |
| **Comment**      |    | オプションの説明。                         |

### ステップ3: Metastoreの設定

**Metastore**セクションで、REST CatalogサービスのConnections情報を設定します。

![irc-2](/images/integrations/data-catalog/irc-2.png)

#### Connection設定

| フィールド | 必須 | 説明 |
| ------------- | -- | --------------------------------------------------------------------------------------- |
| **URI**       | ✓  | REST CatalogサービスのAPIエンドポイントアドレス。Iceberg REST APIのエントリURLです。                                  |
| **Warehouse** | ✓  | IcebergTableのデータウェアハウスID。フォーマットはREST Catalogの実装によって異なり、ストレージパス（例：`s3://bucket/warehouse`）またはCatalog名を指定できます。 |

#### Auth タイプ

REST Catalogサービスの要件に基づいて、適切な認証方法を選択してください。

##### None

REST Catalogサービスで認証が不要な場合は、**None**を選択します。

![irc-3](/images/integrations/data-catalog/irc-3.png)

認証が無効化されているREST Catalogサービスに適用されます。

##### OAuth2

REST CatalogサービスでID認証にOAuth2を使用している場合は、**OAuth2**を選択します。

![irc-4](/images/integrations/data-catalog/irc-4.png)

| フィールド | 必須 | 説明 |
| ----------------- | -- | ------------------------------------------------------------------- |
| **クライアント ID**     | ✓  | OAuth2 クライアント ID。REST Catalogサービスによって提供されます。                                  |
| **クライアント Secret** | ✓  | OAuth2 クライアント Secret。クライアント IDと組み合わせて認証に使用されます。                               |
| **Scope**         | ✓  | OAuth2権限スコープ。認証情報でアクセス可能なリソースの範囲を定義します。一般的な値は`PRINCIPAL_ROLE:ALL`です。                |
| **サーバー URI**    |    | OAuth2 Tokenエンドポイントアドレス。アクセストークンを取得するためのURL。空の場合は、REST CatalogのデフォルトOAuthエンドポイントが使用されます。 |

### ステップ4: ストレージアクセスの設定

**Storage**セクションで、データファイルへのアクセス方法を設定します。

#### Vended Credentials（推奨）

**Enable Vended Credentials**スイッチは、REST Catalogが発行する一時認証情報を使用してストレージにアクセスするかどうかを制御します。

![irc-5](/images/integrations/data-catalog/irc-5.png)

**Enable Vended Credentials**:

* REST Catalogが各リクエストに対してストレージアクセス用の一時認証情報を動的に発行します。
* VeloDB Cloudで長期間のストレージ認証情報を設定する必要がありません。
* 認証情報が自動的にローテーションされ、セキュリティが向上します。

**適用シナリオ**:

* REST CatalogサービスがCredential Vendingをサポートし、設定済みである場合。
* ストレージアクセス権限を一元管理したい場合。
* より高いセキュリティを求める場合。

> **注意**: すべてのREST Catalog実装がVended Credentialsをサポートしているわけではありません。REST Catalogサービスがこの機能をサポートしているかを確認してください。

#### 手動ストレージ認証情報設定

**Enable Vended Credentials**スイッチをオフにした後、対応するS3 Bucketへのアクセス権限を持つ認証情報を手動で設定する必要があります。

権限ポリシーの参考：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::<bucket-name>",
                "arn:aws:s3:::<bucket-name>/*"
            ]
        }
    ]
}
```
![irc-6](/images/integrations/data-catalog/irc-6.png)

| Field | Required | デスクリプション |
| ------------------ | -- | ------------------------ |
| **Region**         | ✓  | ストレージバケットが配置されているリージョン（例：`us-east-1`）。 |
| **認証** | ✓  | 認証方法。Access Keyを選択してください。      |
| **AK**             | ✓  | AWS Access Key ID。       |
| **SK**             | ✓  | AWS Secret Access Key。   |

**適用シナリオ**：

* REST CatalogはVended Credentialsをサポートしていません。
* 特定のストレージアクセス認証情報が必要です。

### ステップ5：詳細設定（オプション）

**詳細設定**をクリックして、さらなる設定オプションを展開します。

![irc-7](/images/integrations/data-catalog/irc-7.png)

詳細設定には通常以下が含まれます：

* メタデータキャッシュ設定
* 接続タイムアウト設定

> **ヒント**：ほとんどのシナリオでは、デフォルト値で十分です。

### ステップ6：作成の確認

* すべての設定情報が正しいかどうかを確認してください。
* **確認**ボタンをクリックしてCatalogを作成します。
* 接続検証の完了を待ちます。

作成が成功すると、Catalogリストに新しく作成したIceberg REST Catalogが表示されます。

## Catalogの使用

作成が成功した後、このCatalogを使用してSQL Editorでデータをクエリできます。

### NamespaceとTableの表示

```sql
-- View all Namespaces under the カタログ
SHOW DATABASES FROM iceberg_rest;

-- View all tables under a Namespace
SHOW TABLES FROM iceberg_rest.my_namespace;

-- View table schema
DESCRIBE iceberg_rest.my_namespace.my_table;
```
### クエリデータ

```sql
-- Query data
SELECT * FROM iceberg_rest.my_namespace.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM iceberg_rest.my_namespace.my_table
WHERE created_at >= '2024-01-01';
```
