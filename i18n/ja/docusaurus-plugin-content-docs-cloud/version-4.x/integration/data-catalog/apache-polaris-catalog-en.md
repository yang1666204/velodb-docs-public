---
{
  "title": "Apache Polaris",
  "description": "Apache Polarisは、Iceberg REST Catalog仕様に準拠したオープンソースのカタログサービスです。Apache Polaris Catalogを作成することで、VeloDB CloudでPolarisによって管理されているIcebergTableをクエリでき、複数のコンピューティングエンジン間でのデータ共有が可能になります。",
  "language": "ja"
}
---
Apache Polarisは、Iceberg REST Catalog仕様に準拠したオープンソースのカタログサービスです。Apache Polaris Catalogを作成することで、VeloDB CloudでPolarisによって管理されているIcebergTableをクエリでき、複数のコンピュートエンジン間でのデータ共有が可能になります。

PolarisはOAuth2認証メカニズムをサポートし、Vended Credentials機能を通じてクライアントに一時的なストレージアクセス認証情報を安全に発行できます。

## 前提条件

Apache Polaris Catalogを作成する前に、以下の条件が満たされていることを確認してください：

### Polaris側の準備

- Apache Polarisサービスがデプロイされ、VeloDB Cloudからアクセス可能であること。
- PolarisにCatalogとNamespaceが作成されていること。
- 認証用のPrincipal（クライアント IDとClient Secretを含む）が作成されていること。
- Principalに適切なロールと権限が割り当てられていること。

### ストレージ側の準備

- データファイルがクラウドオブジェクトストレージ（例：Amazon S3）に保存されていること。
- Vended Credentialsを使用しない場合、読み書き権限を持つストレージアクセス認証情報を準備する必要があること。

### ネットワーク要件

- VeloDB CloudがPolaris サーバー Endpointにアクセス可能であること。
- VeloDB Cloudがデータストレージ（例：S3）にアクセス可能であること。

> **SaaS Mode VeloDB Cloudの場合**
>
> - Polaris サーバー Endpointへのアクセスには、VeloDBがVPCにアクセスできるようにする必要がある場合があります。[VeloDB Accesses Your VPC](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc)を参照してください。
> - Warehouseと同じリージョンのS3バケットのみアクセス可能です。
>
> **BYOC Mode VeloDB Cloudの場合**
>
> - Polaris サーバー EndpointとS3バケットへのアクセスには、デプロイ時のネットワークポリシーを参照する必要があります。[Create VPC Network Resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources)を参照してください。

## Catalogの作成

VeloDB CloudでApache Polaris Catalogを作成する手順に従ってください。

### ステップ1：作成ページへの移動

1. VeloDB Cloudコンソールにログインします。
2. 左側のナビゲーションバーで**Catalogs**をクリックします。
3. **Add 外部カタログ**ボタンをクリックします。
4. Data Lakeカテゴリーの下で**Apache Polaris**を選択します。

### ステップ2：基本情報の入力

**Basic Information**セクションで、Catalogの基本識別情報を設定します。

![apache-polaris-1](/images/integrations/data-catalog/apache-polaris-1.png)

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **カタログ Name** | ✓ | Catalogの一意の名前で、SQLクエリでデータソースを識別するために使用されます。 |
| **Comment** | | オプションの説明情報。 |

### ステップ3：Metastoreの設定

**Metastore**セクションで、Apache Polarisサービスに接続するために必要な情報を設定します。

![apache-polaris-2](/images/integrations/data-catalog/apache-polaris-2.png)

#### 接続設定

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **Warehouse** | ✓ | PolarisのCatalog名。これはPolarisサービスで作成したCatalogで、VeloDB Cloudはこの名前を介して対応するメタデータにアクセスします。 |
| **Polaris サーバー Endpoint** | ✓ | Polaris REST APIのエンドポイントアドレス。形式は`http(s)://<polaris-host>:<port>/api/catalog`です。 |

#### OAuth2認証設定

PolarisはOAuth2 クライアント Credentialsフローを認証に使用します。Polarisでプリンシパルを作成し、認証情報を取得する必要があります。

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **クライアント ID** | ✓ | OAuth2 クライアント ID、PolarisでPrincipalを作成する際に生成される識別子。 |
| **クライアント Secret** | ✓ | OAuth2 クライアント Secret、クライアント IDと組み合わせて認証に使用されます。 |
| **Scope** | ✓ | OAuth2権限スコープ、この認証情報がアクセスできるリソースの範囲を定義します。 |
| **サーバー URI** | | OAuth2 Tokenエンドポイントアドレス、アクセストークンを取得するために使用されます。 |

**Scopeについて：**

- `PRINCIPAL_ROLE:ALL`：Principalに割り当てられたすべてのロールを使用。
- `PRINCIPAL_ROLE:<role-name>`：指定されたロールのみを使用。

### ステップ4：ストレージアクセスの設定

**Storage**セクションで、基盤となるデータファイルにアクセスするための認証情報を設定します。

Polarisで管理されるIcebergTableのデータは、クラウドオブジェクトストレージ（例：S3）に保存されます。VeloDB Cloudはデータファイルを読み取るためにストレージアクセス権限を取得する必要があります。

#### Vended Credentials（推奨）

**Enable Vended Credentials**スイッチは、Polarisによって発行される一時認証情報を使用してストレージにアクセスするかどうかを制御します。

**Vended Credentialsを有効にする：**

![apache-polaris-3](/images/integrations/data-catalog/apache-polaris-3.png)

- Polarisが各リクエストに対して動的に一時的なストレージアクセス認証情報を発行します。
- VeloDB Cloudで長期間のストレージ認証情報を設定する必要がありません。
- 認証情報が自動でローテーションされ、セキュリティが向上します。
- **前提条件**：Polarisサーバー側でStorage Integrationが正しく設定されていること。

**適用シナリオ：**

- PolarisがStorage Integrationを設定している場合。
- ストレージアクセス権限を集中管理したい場合。
- より高いセキュリティを求める場合。

#### ストレージ認証情報の手動設定

**Vended Credentialsを無効にする：**

S3アクセス権限を持つ認証情報を手動で設定する必要があります。

![apache-polaris-4](/images/integrations/data-catalog/apache-polaris-4.png)

| フィールド | 必須 | 説明 |
| --- | --- | --- |
| **Region** | ✓ | ストレージバケットが配置されているリージョン、例：`us-east-1`。 |
| **認証** | ✓ | 認証方法、現在はAccess Keyをサポートしています。 |
| **AK** | ✓ | AWS Access Key ID。 |
| **SK** | ✓ | AWS Secret Access Key。 |

**適用シナリオ**：

* PolarisでVended Credentialsが設定されていない場合。
* Polarisとは異なるストレージアクセス権限を使用する必要がある場合。
* テストおよび開発環境。

### ステップ5：詳細設定（オプション）

**Advanced Settings**をクリックして、より多くの設定オプションを展開します。

![apache-polaris-5](/images/integrations/data-catalog/apache-polaris-5.png)

詳細設定には通常以下が含まれます：

- メタデータキャッシュ設定
- 接続タイムアウト設定

> **ヒント**：ほとんどのシナリオでは、デフォルト値で十分です。

### ステップ6：作成の確認

1. すべての設定情報が正しいかチェックします。
2. **Confirm**ボタンをクリックしてCatalogを作成します。
3. 接続検証の完了を待ちます。

作成が成功すると、Catalogリストで新しく作成されたApache Polaris Catalogを確認できます。

## Catalogの使用

作成が成功した後、このCatalogを使用してSQL Editorでデータをクエリできます。

### データベースとTableの表示

```sql
-- View all Namespaces (Databases) under the カタログ
SHOW DATABASES FROM polaris_iceberg;

-- View all tables under a Namespace
SHOW TABLES FROM polaris_iceberg.my_namespace;

-- View table structure
DESCRIBE polaris_iceberg.my_namespace.my_table;
```
### Query Data

```sql
-- Query data
SELECT * FROM polaris_iceberg.my_namespace.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM polaris_iceberg.my_namespace.my_table
WHERE created_at >= '2024-01-01';
```
