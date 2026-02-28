---
{
  "title": "Azure Storage",
  "description": "Dorisは、Azure Storageからファイルを読み込むための2つの方法を提供しています：",
  "language": "ja"
}
---
DorisはAzure Storageからファイルを読み込む2つの方法を提供します：
- S3 LoadによりAzure StorageファイルをDorisに読み込む方法（非同期読み込み方式）
- TVFによりAzure StorageファイルをDorisに読み込む方法（同期読み込み方式）

## S3 Loadによる読み込み

S3 Loadを使用してオブジェクトストレージ上のファイルをインポートします。詳細な手順については、[Broker Load Manual](../import-way/broker-load-manual)を参照してください。

### ステップ1：データの準備

CSVファイルs3load_example.csvを作成します。このファイルはAzure Storage上に保存され、その内容は以下の通りです：

```
1,Emily,25
2,Benjamin,35
3,Olivia,28
4,Alexander,60
5,Ava,17
6,William,69
7,Sophia,32
8,James,64
9,Emma,37
10,Liam,64
```
### ステップ 2: Doris でTableを作成する

```sql
CREATE TABLE test_s3load(
    user_id            BIGINT       NOT NULL COMMENT "user id",
    name               VARCHAR(20)           COMMENT "name",
    age                INT                   COMMENT "age"
)
DUPLICATE KEY(user_id)
DISTRIBUTED BY HASH(user_id) BUCKETS 10;
```
### ステップ 3: S3 Loadを使用してデータをロードする

:::caution 注意
Azure StorageはデフォルトでHTTPS送信を要求し、対応するストレージアカウント設定は`Secure transfer required: Enabled`となります。
Azure Storageに適切にアクセスするには、DorisのDELETED`be.conf`で`s3_client_http_scheme = https`を設定する必要があります。

Azure S3プロパティの`s3.region`設定は省略可能です。
:::

```sql
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
    "provider" = "AZURE",
    "s3.endpoint" = "StorageAccountA.blob.core.windows.net",  
    "s3.region" = "westus3",
    "s3.access_key" = "<your-ak>",
    "s3.secret_key" = "<your-sk>"
)
PROPERTIES
(
    "timeout" = "3600"
);
```
### ステップ 4: インポートされたデータを確認する

```sql
SELECT * FROM test_s3load;
```
結果:

```
mysql> select * from test_s3load;
+---------+-----------+------+
| user_id | name      | age  |
+---------+-----------+------+
|       5 | Ava       |   17 |
|      10 | Liam      |   64 |
|       7 | Sophia    |   32 |
|       9 | Emma      |   37 |
|       1 | Emily     |   25 |
|       4 | Alexander |   60 |
|       2 | Benjamin  |   35 |
|       3 | Olivia    |   28 |
|       6 | William   |   69 |
|       8 | James     |   64 |
+---------+-----------+------+
10 rows in set (0.04 sec)
```
## TVFを使用した読み込み

### ステップ1: データの準備

CSVファイル s3load_example.csv を作成します。このファイルはAzure Storageに保存され、その内容は以下の通りです：

```
1,Emily,25
2,Benjamin,35
3,Olivia,28
4,Alexander,60
5,Ava,17
6,William,69
7,Sophia,32
8,James,64
9,Emma,37
10,Liam,64
```
### ステップ 2: DorisでTableを作成する

```sql
CREATE TABLE test_s3load(
    user_id            BIGINT       NOT NULL COMMENT "user id",
    name               VARCHAR(20)           COMMENT "name",
    age                INT                   COMMENT "age"
)
DUPLICATE KEY(user_id)
DISTRIBUTED BY HASH(user_id) BUCKETS 10;
```
### ステップ 3: TVFを使用してデータをロードする

:::caution 注意
Azure StorageはデフォルトでHTTPS伝送を必要とし、対応するストレージアカウント設定は`Secure transfer required: Enabled`です。
Azure Storageに適切にアクセスするには、Dorisの`be.conf`で`s3_client_http_scheme = https`を設定する必要があります。

Azure S3プロパティの`s3.region`設定は省略できます。
:::

```sql
INSERT INTO test_s3load
SELECT * FROM S3
(
    "uri" = "s3://your_bucket_name/s3load_example.csv",
    "format" = "csv",
    "provider" = "AZURE",
    "s3.endpoint" = "StorageAccountA.blob.core.windows.net",
    "s3.region" = "westus3",
    "s3.access_key" = "<your-ak>",
    "s3.secret_key" = "<your-sk>",
    "column_separator" = ",",
    "csv_schema" = "user_id:int;name:string;age:int"
);
```
### ステップ 4: インポートしたデータを確認する

```sql
SELECT * FROM test_s3load;
```
結果:

```
mysql> select * from test_s3load;
+---------+-----------+------+
| user_id | name      | age  |
+---------+-----------+------+
|       5 | Ava       |   17 |
|      10 | Liam      |   64 |
|       7 | Sophia    |   32 |
|       9 | Emma      |   37 |
|       1 | Emily     |   25 |
|       4 | Alexander |   60 |
|       2 | Benjamin  |   35 |
|       3 | Olivia    |   28 |
|       6 | William   |   69 |
|       8 | James     |   64 |
+---------+-----------+------+
10 rows in set (0.04 sec)
```
