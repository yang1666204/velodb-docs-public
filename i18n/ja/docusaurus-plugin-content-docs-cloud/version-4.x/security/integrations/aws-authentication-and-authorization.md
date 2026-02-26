---
{
  "title": "AWS認証と認可",
  "description": "Dorisは、​​IAM User​​と​​Assumed Role​​の2つの認証方法を通じてAWSサービスリソースへのアクセスをサポートしています。",
  "language": "ja"
}
---
# AWS認証と認可

DorisはAWSサービスリソースへのアクセスを2つの認証方法でサポートします：`IAM User`と`Assumed Role`。この記事では、両方の方法におけるセキュリティクレデンシャルの設定方法と、DorisのフィーチャーをAWSサービスとの連携に使用する方法について説明します。

# 認証方法の概要

## IAM User認証

Dorisは`AWS IAM User`クレデンシャル（`access_key`と`secret_key`に相当）を設定することで外部データソースへのアクセスを可能にします。以下は詳細な設定手順です（詳細については、AWSドキュメント[IAM users](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html)を参照してください）：

### Step1 IAM Userを作成してポリシーを設定する

1. `AWS Console`にログインして`IAM User`を作成します

![create iam user](/images/cloud/security/integrations/create-iam-user.png)

2. IAM User名を入力して、ポリシーを直接アタッチします

![iam user attach policy1](/images/cloud/security/integrations/iam-user-attach-policy1.png)

3. ポリシーエディターでAWSリソースポリシーを定義します。以下は、S3バケットにアクセスするための読み取り/書き込みポリシーのテンプレートです

![iam user attach policy2](/images/cloud/security/integrations/iam-user-attach-policy2.png)

S3読み取りポリシーテンプレート。読み取り/リストアクセスが必要なDorisフィーチャー（例：S3 Load、TVF、External Catalog）に適用されます

**注意：**

1. **<your-bucket>と<your-prefix>を実際の値に置き換えてください。**

2. **余分な/セパレーターを追加しないでください。**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:GetObject",
              "s3:GetObjectVersion",
            ],
            "Resource": "arn:aws:s3:::<your-bucket>/your-prefix/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::<your-bucket>"
        }    
    ]
}
```
S3書き込みポリシーテンプレート（読み書きアクセスを必要とするDoris機能に適用されます。例：Export、Storage Vault、Repository）

**注意事項：**

1. **`your-bucket`と`your-prefix`を実際の値に置き換えてください。**

2. **余分な`/`セパレータを追加しないでください。**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:PutObject",
              "s3:GetObject",
              "s3:GetObjectVersion",
              "s3:DeleteObject",
              "s3:DeleteObjectVersion",
              "s3:AbortMultipartUpload",      
              "s3:ListMultipartUploadParts"
            ],
            "Resource": "arn:aws:s3:::<your-bucket>/<your-prefix>/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:GetBucketVersioning",
                "s3:GetLifecycleConfiguration"
            ],
            "Resource": "arn:aws:s3:::<your-bucket>"
        }    
    ]
}
```
4. IAM Userの作成に成功した後、access/secret keyペアを作成します

![iam user create ak sk](/images/cloud/security/integrations/iam-user-create-ak-sk.png)

### Step2 SQLを通じてaccess/secret keyペアでdoris機能を使用する

Step 1のすべての設定を完了すると、`access_key`と`secret_key`を取得できます。以下の例に示すように、これらの認証情報を使用してdoris機能にアクセスします：

#### S3 Load

```SQL
  LOAD LABEL s3_load_2022_04_01
  (
      DATA INFILE("s3://your_bucket_name/s3load_example.csv")
      INTO TABLE test_s3load
      COLUMNS TERMINATED BY ","
      FORMAT AS "CSV"
      (user_id, name, age)
  )
  WITH S3
  (
      "provider" = "S3",
      "s3.endpoint" = "s3.us-east-1.amazonaws.com",
      "s3.region" = "us-east-1",
      "s3.access_key" = "<your-access-key>",
      "s3.secret_key" = "<your-secrety-key>"
  )
  PROPERTIES
  (
      "timeout" = "3600"
  );
```
#### TVF

```SQL
  SELECT * FROM S3 (
      'uri' = 's3://your_bucket/path/to/tvf_test/test.parquet',
      'format' = 'parquet',
      's3.endpoint' = 's3.us-east-1.amazonaws.com',
      's3.region' = 'us-east-1',
      "s3.access_key" = "<your-access-key>",
      "s3.secret_key"="<your-secret-key>"
  )
```
#### External Catalog

```SQL
  CREATE CATALOG iceberg_catalog PROPERTIES (
      'type' = 'iceberg',
      'iceberg.catalog.type' = 'hadoop',
      'warehouse' = 's3://your_bucket/dir/key',
      's3.endpoint' = 's3.us-east-1.amazonaws.com',
      's3.region' = 'us-east-1',
      "s3.access_key" = "<your-access-key>",
      "s3.secret_key"="<your-secret-key>"
  );
```
#### Storage Vault

```SQL
CREATE STORAGE VAULT IF NOT EXISTS s3_demo_vault
PROPERTIES (
    "type" = "S3",
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.bucket" = "<your-bucket>",
    "s3.access_key" = "<your-access-key>",
    "s3.secret_key"="<your-secret-key>",
    "s3.root.path" = "s3_demo_vault_prefix",
    "provider" = "S3",
    "use_path_style" = "false"
);
```
#### エクスポート

```SQL
EXPORT TABLE s3_test TO "s3://your_bucket/a/b/c" 
PROPERTIES (
    "column_separator"="\\x07", 
    "line_delimiter" = "\\x07"
) WITH S3 (
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.access_key" = "<your-access-key>",
    "s3.secret_key"="<your-secret-key>",
)
```
#### Repository

```SQL
CREATE REPOSITORY `s3_repo`
WITH S3
ON LOCATION "s3://your_bucket/s3_repo"
PROPERTIES
(
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.access_key" = "<your-access-key>",
    "s3.secret_key"="<your-secret-key>"
);
```
#### Resource

```SQL
CREATE RESOURCE "remote_s3"
PROPERTIES
(
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.bucket" = "<your-bucket>",
    "s3.access_key" = "<your-access-key>",
    "s3.secret_key"="<your-secret-key>"
);
```
異なるビジネスロジック間で異なるIAM Userクレデンシャル（`access_key`と`secret_key`）を指定して、外部データのアクセス制御を実装できます。

## Assumed Role認証

Assumed RoleはAWS IAM Roleを引き受けることで外部データソースにアクセスします（詳細については、AWSドキュメントの[assume role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage-assume.html)を参照してください）。以下の図は設定ワークフローを示しています：

![assumed role flow](/images/cloud/security/integrations/assumed-role-flow.png)

用語：

`Source Account`：Assume Roleアクションを開始するAWSアカウント（Doris FE/BE EC2インスタンスが存在する場所）；

`Target Account`：対象のS3バケットを所有するAWSアカウント；

`ec2_role`：ソースアカウントで作成され、Doris FE/BEを実行するEC2インスタンスにアタッチされるロール；

`bucket_role`：対象バケットにアクセスする権限を持つ、ターゲットアカウントで作成されるロール；

**注意事項：**

1. **ソースアカウントとターゲットアカウントは同じAWSアカウントでも構いません；**
2. **Doris FE/BEがデプロイされているすべてのEC2インスタンスが`ec_role`にアタッチされていることを確認してください。特にスケーリング操作時にご注意ください。**

詳細な設定手順は以下のとおりです：

### Step1 前提条件

1. ソースアカウントが`ec2_role`を作成し、Doris FE/BEを実行するすべての`EC2 instances`にアタッチしていることを確認してください；

2. ターゲットアカウントが`bucket_role`と対応するバケットを作成していることを確認してください；

`ec2_role`を`EC2 instances`にアタッチした後、以下のように`role_arn`を確認できます：

![ec2 instance](/images/cloud/security/integrations/ec2-instance.png)

### Step2 ソースアカウントIAM Role（EC2インスタンスロール）の権限設定

1. [AWS IAM Console](https://us-east-1.console.aws.amazon.com/iamv2/home#/home)にログインし、`Access management` > `Roles`に移動します；
2. EC2インスタンスロールを見つけて、その名前をクリックします；
3. ロールの詳細ページで、`Permissions`タブに移動し、`Add permissions`をクリックしてから`Create inline policy`を選択します；
4. `Specify permissions`セクションで、`JSON`タブに切り替え、以下のポリシーを貼り付けて、`Review policy`をクリックします：

![source role permission](/images/cloud/security/integrations/source-role-permission.png)

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["sts:AssumeRole"],
            "Resource": "*"
        }
    ]
}
```
### Step3 ターゲットアカウントIAMロールの信頼ポリシーと権限を設定する

1. [AWS IAM Console](https://us-east-1.console.aws.amazon.com/iamv2/home#/home)にログインし、​​Access management > Roles​​に移動して、ターゲットロール（bucket_role）を見つけ、その名前をクリックします。

2. `​​Trust relationships`​​タブに移動し、`​​Edit trust policy`​​をクリックして、以下のJSONを貼り付けます（<ec2_iam_role_arn>をあなたのEC2インスタンスロールARNに置き換えてください）。​​Update policy​​をクリックします。

![target role trust policy](/images/cloud/security/integrations/target-role-trust-policy.png)

**注意: `Condition`セクションの`ExternalId`は、複数のソースユーザーが同じロールをassumeする必要があるシナリオを区別するために使用されるオプションの文字列パラメータです。設定した場合は、対応するDoris SQLステートメントに含めてください。ExternalIdの詳細な説明については、[aws doc](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html)を参照してください。**

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "<ec2_iam_role_arn>"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "1001"
                }
            }
        }
    ]
}
```
3. ロールの詳細ページで、`Permissions`タブに移動し、`Add permissions`をクリックして、`Create inline policy`を選択します。`JSON`タブで、要件に基づいて以下のポリシーのいずれかを貼り付けます。

![target role permission2](/images/cloud/security/integrations/target-role-permission2.png)

S3読み取りポリシーテンプレート、読み取り/リストアクセスが必要なDoris機能に適用されます。例：S3 Load、TVF、External Catalog

**注意:**

1. **`your-bucket`と`your-prefix`を実際の値に置き換えてください。**

2. **余分な`/`区切り文字を追加しないでください。**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:GetObject",
              "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::<bucket>/<prefix>/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::<bucket>",
        }
    ]
}
```
S3書き込みポリシーテンプレート（読み書きアクセスを必要とするDoris機能に適用されます。例：Export、Storage Vault、Repository）

**注意事項：**

1. **`your-bucket`と`your-prefix`を実際の値に置き換えてください。**

2. **余分な`/`セパレーターを追加しないでください。**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:PutObject",
              "s3:GetObject",
              "s3:GetObjectVersion",
              "s3:DeleteObject",
              "s3:DeleteObjectVersion",
              "s3:AbortMultipartUpload",      
              "s3:ListMultipartUploadParts"
            ],
            "Resource": "arn:aws:s3:::<bucket>/<prefix>/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::<bucket>"
        }
    ]
}
```
### Step4 `role_arn` と `external_id` フィールドに従って、SQL経由でAssumed Roleを使用したdoris機能を使用する

上記の設定を完了した後、対象アカウントの `role_arn` と `external_id`（該当する場合）を取得します。
以下に示すように、これらのパラメータをdoris SQLステートメントで使用します：

重要な共通キーパラメータ：

```sql
"s3.role_arn" = "<your-target-role-arn>",
"s3.external_id" = "<your-external-id>"      -- option parameter
```
#### S3 Load

```SQL
  LOAD LABEL s3_load_2022_04_01
  (
      DATA INFILE("s3://your_bucket_name/s3load_example.csv")
      INTO TABLE test_s3load
      COLUMNS TERMINATED BY ","
      FORMAT AS "CSV"
      (user_id, name, age)
  )
  WITH S3
  (
      "provider" = "S3",
      "s3.endpoint" = "s3.us-east-1.amazonaws.com",
      "s3.region" = "us-east-1",
      "s3.role_arn" = "<your-target-role-arn>",
      "s3.external_id" = "<your-external-id>"      -- option parameter
  )
  PROPERTIES
  (
      "timeout" = "3600"
  );
```
#### TVF

```SQL
  SELECT * FROM S3 (
      "uri" = "s3://your_bucket/path/to/tvf_test/test.parquet",
      "format" = "parquet",
      "s3.endpoint" = "s3.us-east-1.amazonaws.com",
      "s3.region" = "us-east-1",
      "s3.role_arn" = "<your-target-role-arn>",
      "s3.external_id" = "<your-external-id>"      -- option parameter
  )
```
#### External Catalog

```SQL
  CREATE CATALOG iceberg_catalog PROPERTIES (
      "type" = "iceberg",
      "iceberg.catalog.type" = "hadoop",
      "warehouse" = "s3://your_bucket/dir/key",
      "s3.endpoint" = "s3.us-east-1.amazonaws.com",
      "s3.region" = "us-east-1",
      "s3.role_arn" = "<your-target-role-arn>",
      "s3.external_id" = "<your-external-id>"      -- option parameter
  );
```
#### Storage Vault

```SQL
CREATE STORAGE VAULT IF NOT EXISTS s3_demo_vault
PROPERTIES (
    "type" = "S3",
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.bucket" = "<your-bucket>",
    "s3.role_arn" = "<your-target-role-arn>",
    "s3.external_id" = "<your-external-id>",            -- option parameter
    "s3.root.path" = "s3_demo_vault_prefix",
    "provider" = "S3",
    "use_path_style" = "false"
);
```
#### Export

```SQL
EXPORT TABLE s3_test TO "s3://your_bucket/a/b/c" 
PROPERTIES (
    "column_separator"="\\x07", 
    "line_delimiter" = "\\x07"
) WITH S3 (
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.role_arn" = "<your-target-role-arn>",
    "s3.external_id" = "<your-external-id>"
)
```
#### リポジトリ

```SQL
CREATE REPOSITORY `s3_repo`
WITH S3
ON LOCATION "s3://your_bucket/s3_repo"
PROPERTIES
(
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.role_arn" = "<your-target-role-arn>",
    "s3.external_id" = "<your-external-id>"
);
```
#### リソース

```SQL
CREATE RESOURCE "remote_s3"
PROPERTIES
(
    "s3.endpoint" = "s3.us-east-1.amazonaws.com",
    "s3.region" = "us-east-1",
    "s3.bucket" = "<your-bucket>",
    "s3.role_arn" = "<your-target-role-arn>",
    "s3.external_id" = "<your-external-id>"
);
```
