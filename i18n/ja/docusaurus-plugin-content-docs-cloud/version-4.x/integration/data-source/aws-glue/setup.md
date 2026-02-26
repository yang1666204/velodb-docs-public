---
{
  "title": "AWS Glue セットアップ",
  "description": "VeloDB を AWS Glue Iceberg catalog に接続するための AWS リソースを設定する",
  "language": "ja"
}
---
# AWS Glue Setup

このガイドでは、VeloDBをAWS Glue Icebergカタログに接続するために必要なAWSリソースの設定について説明します。

## 前提条件

- S3バケット、Glueデータベース、IAMユーザーを作成する権限を持つAWSアカウント
- 設定済みのAWS CLI（Lake Formation権限用、オプション）

---

## ステップ1: S3バケットの作成

1. **AWS S3 Console** > **Create bucket**に移動します
2. バケット名を入力します（例：`my-lakehouse-bucket`）
3. VeloDBウェアハウスと**同じリージョン**を選択します
4. バージョニングを有効化します（推奨）
5. **Create bucket**をクリックします

:::warning
最適なパフォーマンスのため、バケットのリージョンはVeloDBウェアハウスのリージョンと一致している必要があります。
:::

![S3 Iceberg folder structure](/images/cloud/integration/aws-glue/13-s3-iceberg-table-folders.png)

---

## ステップ2: Glueデータベースの作成

1. **AWSコンソール**を開き、「Glue」を検索します

2. **AWS Glue Console** > **Data Catalog** > **Databases**に移動します

![AWS Glue Getting Started](/images/cloud/integration/aws-glue/04-glue-getting-started.png)

3. **Add database**をクリックします

4. 以下を入力します：
   - **Name**: 小文字、数字、アンダースコアのみ使用します（例：`lakehouse_iceberg_db`）
   - **Location**: `s3://my-lakehouse-bucket/iceberg/`
5. **Create database**をクリックします

![Glue Databases List](/images/cloud/integration/aws-glue/09-glue-databases-list.png)

:::warning
データベース名にハイフン（`-`）は使用できません。代わりにアンダースコア（`_`）を使用してください。
:::

---

## ステップ3: IAMユーザーの作成

1. **IAM Console** > **Users** > **Create user**に移動します
2. ユーザー名を入力し（例：`velodb-glue-user`）、**Next**をクリックします
3. **Attach policies directly**を選択し、**Create policy**をクリックします
4. **JSON**タブを選択し、以下のポリシーを貼り付けます：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "glue:GetDatabase", "glue:GetDatabases",
                "glue:CreateDatabase", "glue:UpdateDatabase", "glue:DeleteDatabase",
                "glue:GetTable", "glue:GetTables",
                "glue:CreateTable", "glue:UpdateTable", "glue:DeleteTable",
                "glue:GetPartition", "glue:GetPartitions",
                "glue:CreatePartition", "glue:BatchCreatePartition",
                "glue:UpdatePartition", "glue:DeletePartition", "glue:BatchDeletePartition"
            ],
            "Resource": [
                "arn:aws:glue:REGION:*:catalog",
                "arn:aws:glue:REGION:*:database/lakehouse_*",
                "arn:aws:glue:REGION:*:table/lakehouse_*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject", "s3:PutObject", "s3:DeleteObject",
                "s3:ListBucket", "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::my-lakehouse-bucket",
                "arn:aws:s3:::my-lakehouse-bucket/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": ["lakeformation:GetDataAccess"],
            "Resource": "*"
        }
    ]
}
```
`REGION`をあなたのAWSリージョン（例：`us-east-1`）に、`my-lakehouse-bucket`を実際のバケット名に置き換えてください。

5. **Next**をクリックし、ポリシーに名前を付け（例：`VeloDBGlueAccess`）、**Create policy**をクリックします
6. ユーザー作成画面に戻り、ポリシーリストを更新して新しいポリシーを選択し、**Next**をクリックします
7. **Create user**をクリックします
8. 新しいユーザーを選択し、**Security credentials**タブに移動します
9. **Create access key** > **Third-party service** > **Next** > **Create access key**をクリックします
10. **Access Key IDとSecret Access Keyを保存してください** - VeloDBで必要になります

---

## ステップ4：Lake Formationの権限付与（必要な場合）

一部のリージョン（例：us-east-1）では、Lake Formationがデフォルトで有効になっており、Glueアクセスを制御します。

**AWSアカウントIDの確認**：AWSコンソールの右上のユーザー名をクリックして、アカウントID（12桁の数字）を確認してください。

AWS CLIで権限を付与します：

```bash
# Replace ACCOUNT_ID (12 digits), YOUR_USER, and YOUR_DATABASE with your values
aws lakeformation grant-permissions \
  --principal DataLakePrincipalIdentifier=arn:aws:iam::123456789012:user/velodb-glue-user \
  --resource '{"Database":{"Name":"lakehouse_iceberg_db"}}' \
  --permissions CREATE_TABLE DESCRIBE ALTER DROP
```
:::info
VeloDBで「Lake Formation permission denied」エラーが表示される場合は、この手順が必要です。
:::

---

## Step 5: サンプルデータの書き込み（任意）

PyIcebergを使用してテスト用のテーブルを作成し、サンプルデータを書き込みます：

```bash
pip install "pyiceberg[glue,s3]" pyarrow pandas
```
```python
from pyiceberg.catalog import load_catalog
import pyarrow as pa
import pandas as pd

# Connect to Glue catalog (replace with your values)
catalog = load_catalog("glue", **{
    "type": "glue",
    "s3.access-key-id": "YOUR_ACCESS_KEY",
    "s3.secret-access-key": "YOUR_SECRET_KEY",
    "s3.region": "us-east-1",
    "glue.access-key-id": "YOUR_ACCESS_KEY",
    "glue.secret-access-key": "YOUR_SECRET_KEY",
    "glue.region": "us-east-1",
    "warehouse": "s3://my-lakehouse-bucket/iceberg",
})

# Create a sample table
schema = pa.schema([
    ("id", pa.int64()),
    ("name", pa.string()),
    ("value", pa.float64()),
])

table = catalog.create_table(
    "lakehouse_iceberg_db.sample_table",
    schema=schema
)

# Write sample data
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"],
    "value": [100.5, 200.3, 150.8]
})
table.append(pa.Table.from_pandas(df))
print("Sample data written successfully!")
```
## Regional Endpointsリファレンス

| Region | Glue Endpoint | S3 Endpoint |
|--------|---------------|-------------|
| us-east-1 | `https://glue.us-east-1.amazonaws.com` | `https://s3.us-east-1.amazonaws.com` |
| us-west-2 | `https://glue.us-west-2.amazonaws.com` | `https://s3.us-west-2.amazonaws.com` |
| eu-west-1 | `https://glue.eu-west-1.amazonaws.com` | `https://s3.eu-west-1.amazonaws.com` |
| ap-southeast-1 | `https://glue.ap-southeast-1.amazonaws.com` | `https://s3.ap-southeast-1.amazonaws.com` |
| ap-northeast-1 | `https://glue.ap-northeast-1.amazonaws.com` | `https://s3.ap-northeast-1.amazonaws.com` |

---

## VeloDBに必要な値

セットアップ完了後、VeloDBに接続するために以下の値が必要になります：

| Value | Description |
|-------|-------------|
| **S3 Bucket Path** | `s3://my-lakehouse-bucket/iceberg` |
| **Glue Region** | 使用するAWSリージョン（例：`us-east-1`） |
| **Glue Endpoint** | `https://glue.{region}.amazonaws.com` |
| **Access Key ID** | IAMユーザー作成時に取得 |
| **Secret Access Key** | IAMユーザー作成時に取得 |

---

## セットアップの確認

テーブル作成後、AWS Glue Consoleの**Data Catalog** > **Tables**でテーブルを確認できます：

![Glue Iceberg Table Details](/images/cloud/integration/aws-glue/11-glue-iceberg-table-details.png)

S3でIcebergデータファイルも確認できます：

![S3 Iceberg Parquet Files](/images/cloud/integration/aws-glue/14-s3-iceberg-parquet-files.png)

---

## 次のステップ

AWSインフラストラクチャの準備が完了したら、[AWS Glue Connection Guide](../aws-glue)に進んで、ビジュアルインターフェースを使用してVeloDBをGlueカタログに接続してください。
