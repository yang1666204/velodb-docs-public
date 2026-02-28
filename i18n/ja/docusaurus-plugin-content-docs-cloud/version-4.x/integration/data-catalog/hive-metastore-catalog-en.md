---
{
  "title": "Hive Metastore カタログ",
  "description": "AWS Glueは、AWSが提供する完全管理型のサーバーレスメタデータストレージサービスです。AWS Glue Catalogを作成することで、VeloDB CloudにおいてAWS Glueで管理されたメタデータを持つAmazon S3に格納されたデータレークTableを直接クエリできます。",
  "language": "ja"
}
---
Hive Metastore Service (HMS) は Apache Hive のメタデータ管理サービスで、Hadoop エコシステムで広く使用され、Tableスキーマ、パーティション、ストレージの場所などのメタデータを管理します。

Hive Metastore カタログ を作成することで、VeloDB Cloud でセルフホスト型の HMS によって管理される Iceberg Tableをクエリできます。データは Amazon S3 または EMR HDFS に保存されます。

## 前提条件

Hive Metastore カタログ を作成する前に、以下の条件が満たされていることを確認してください：

### Hive Metastore の準備

- Hive Metastore Service がデプロイされ、VeloDB Cloud からアクセス可能であること。
- Hive Metastore が Thrift プロトコルを使用し、デフォルトポートが 9083 であること。

### ストレージの準備

データストレージの場所に基づいて、対応するアクセス認証情報を準備してください：

**S3 Storage**：
- AWS Access Key を準備するか、Cross-account IAM Role を設定してください。
- 認証情報がデータが存在する S3 バケットにアクセスする権限を持っていることを確認してください。

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
**EMR HDFS Storage**:
- VeloDB CloudがEMRクラスターのすべてのノードにアクセスできることを確認してください。
- HDFSの`fs.defaultFS`アドレスを準備してください。

### ネットワーク要件

- VeloDB CloudはHive MetastoreのThriftポート（デフォルトは9083）にアクセスできる必要があります。
- VeloDB Cloudはデータストレージ（S3またはHDFS）にアクセスできる必要があります。

> SaaSモードのVeloDB Cloudの場合：
>
> - HMSサービスやHDFSへのアクセスには、VeloDBがVPCにアクセスすることを許可する必要がある場合があります。[velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc)を参照してください。
> - Warehouseと同じリージョンのS3 Bucketのみアクセス可能です。
>
> BYOCモードのVeloDB Cloudの場合：
>
> - HMSサービスやデータストレージ（S3またはHDFS）へのアクセスには、デプロイメント時のネットワークポリシーを参照する必要があります。[create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources)を参照してください。

## Catalogの作成

VeloDB CloudでHive Metastore Catalogを作成するには、以下の手順に従ってください。

### ステップ1：作成ページへの移動

1. VeloDB Cloudコンソールにログインします。
2. 左側のナビゲーションバーで、**Catalogs**をクリックします。
3. **Add 外部カタログ**ボタンをクリックします。
4. Data Lakeカテゴリの下で、**Hive Metastore**を選択します。

### ステップ2：基本情報の入力

**Basic Information**セクションで、Catalogの基本識別情報を設定します。

![hive-metastore-1](/images/integrations/data-catalog/hive-metastore-1.png)

| フィールド | 必須 | 説明 |
|---|---|---|
| **カタログ Name** | ✓ | Catalogの一意の名前で、SQLクエリでこのデータソースを識別するために使用されます。 |
| **Comment** | | オプションの説明情報。 |

### ステップ3：Metastoreの設定

**Metastore**セクションで、Hive Metastoreへの接続情報を設定します。

![hive-metastore-2](/images/integrations/data-catalog/hive-metastore-2.png)

#### Table Format

現在、VeloDB CloudはHive Metastore経由で**Iceberg**Tableフォーマットのみをサポートしています。

#### 接続設定

| フィールド | 必須 | 説明 |
|---|---|---|
| **Warehouse** | ✓ | VeloDBがIcebergデータベースを作成する際のデフォルトのデータファイル保存場所。S3とHDFSをサポートします。注意：S3 BucketはHMSサービスで設定されたAWS Endpointと同じリージョンにある必要があります。 |
| **Hive Metastore URI** | ✓ | Hive Metastore ServiceのThrift接続アドレス。 |

### ステップ4：ストレージアクセスの設定

**Storage**セクションで、データファイルへのアクセス方法を設定します。データの保存場所に基づいて、**S3**または**EMR HDFS**を選択してください。

#### ストレージタイプ：S3

データがAmazon S3に保存されている場合は**S3**を選択します。

![hive-metastore-3](/images/integrations/data-catalog/hive-metastore-3.png)

| フィールド | 必須 | 説明 |
|---|---|---|
| **Region** | ✓ | S3バケットが配置されているAWSリージョン。**注意：HMSサービスで設定されたAWS Endpointと同じリージョンである必要があります。** |

##### 認証方法1：Access Key

AWS IAMユーザーのアクセスキーを使用して認証します。

| フィールド | 必須 | 説明 |
|---|---|---|
| **AK** | ✓ | AWS Access Key ID |
| **SK** | ✓ | AWS Secret Access Key |

##### 認証方法2：Cross-account IAM

クロスアカウントIAMロールを使用して認証します。これはより安全で、本番環境での使用が推奨されます。

![hive-metastore-4](/images/integrations/data-catalog/hive-metastore-4.png)

| フィールド | 必須 | 説明 |
|---|---|---|
| **Cross-Account Role ARN** | ✓ | AWSアカウントで作成されたIAMロールのARN。形式：`arn:aws:iam::<your-account-id>:role/<role-name>` |

**設定手順**：

**Authorization Guidelines Help**リンクをクリックして、詳細な設定手順を確認してください。

#### ストレージタイプ：EMR HDFS

データがAWS EMRクラスターのHDFSに保存されている場合は**EMR HDFS**を選択します。

![hive-metastore-5](/images/integrations/data-catalog/hive-metastore-5.png)

| フィールド | 必須 | 説明 |
|---|---|---|
| **fs.defaultFS** | ✓ | HDFSのNameNodeアドレス。形式：`hdfs://<namenode-host>:<port>`、デフォルトポートは8020。 |

### ステップ5：詳細設定（オプション）

**Advanced Settings**をクリックして、追加の設定オプションを展開します。

![hive-metastore-6](/images/integrations/data-catalog/hive-metastore-6.png)

詳細設定には通常以下が含まれます：

- メタデータキャッシュ設定
- 接続タイムアウト設定

> **ヒント**：ほとんどのシナリオでは、デフォルト値で十分です。

### ステップ6：作成の確認

1. すべての設定情報が正しいかを確認してください。
2. **Confirm**ボタンをクリックしてCatalogを作成します。
3. 接続検証の完了を待ちます。

作成が成功すると、Catalogリストで新しく作成されたHive Metastore Catalogを確認できます。

## Catalogの使用

作成が成功した後、SQL EditorでこのCatalogを使用してデータをクエリできます。

### データベースとTableの表示

```sql
-- View all databases under the カタログ
SHOW DATABASES FROM hms_iceberg;

-- View all tables under a specific database
SHOW TABLES FROM hms_iceberg.my_database;

-- View table schema
DESCRIBE hms_iceberg.my_database.my_table;
```
### クエリデータ

```sql
-- Query data
SELECT * FROM hms_iceberg.my_database.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM hms_iceberg.my_database.my_table
WHERE created_at >= '2024-01-01';
```
