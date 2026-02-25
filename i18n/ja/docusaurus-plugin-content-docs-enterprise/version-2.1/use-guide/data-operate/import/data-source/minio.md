---
{
  "title": "MinIO | データソース",
  "description": "Dorisは、MinIOからファイルを読み込む2つの方法を提供します：",
  "language": "ja"
}
---
# MinIO

DorisはMinIOからファイルを読み込む2つの方法を提供します：
- S3 LoadをMinIOファイルのDorisへの読み込みに使用する方法。これは非同期読み込み方式です。
- TVFをMinIOファイルのDorisへの読み込みに使用する方法。これは同期読み込み方式です。

## S3 Loadによる読み込み

S3 Loadを使用してオブジェクトストレージ上のファイルをインポートします。詳細な手順については、[Broker Load Manual](../import-way/broker-load-manual)を参照してください。

### Step 1: データの準備

CSVファイルs3load_example.csvを作成します。このファイルはMinIO上に保存されており、その内容は以下の通りです：

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
### ステップ2: Dorisでテーブルを作成する

```sql
CREATE TABLE test_s3load(
    user_id            BIGINT       NOT NULL COMMENT "user id",
    name               VARCHAR(20)           COMMENT "name",
    age                INT                   COMMENT "age"
)
DUPLICATE KEY(user_id)
DISTRIBUTED BY HASH(user_id) BUCKETS 10;
```
### Step 3: S3 Loadを使用したデータの読み込み

:::caution 注意
ローカルネットワークにMinIOをデプロイしてTLSを有効にしていない場合は、エンドポイント文字列に明示的に`http://`を追加する必要があります。

- `"s3.endpoint" = "http://localhost:9000"`

S3 SDKはデフォルトでvirtual-hosted styleを使用します。しかし、MinIOはデフォルトでvirtual-hosted styleアクセスを有効にしていません。この場合、`use_path_style`パラメータを追加してpath styleの使用を強制することができます。

- `"use_path_style" = "true"`
:::

```sql
LOAD LABEL s3_load_2022_04_05
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
    "s3.endpoint" = "play.min.io:9000",  
    "s3.region" = "us-east-1",
    "s3.access_key" = "myminioadmin",
    "s3.secret_key" = "minio-secret-key-change-me",
    "use_path_style" = "true"
)
PROPERTIES
(
    "timeout" = "3600"
);
```
### Step 4: インポートしたデータを確認する

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

### ステップ1: データを準備する

CSVファイル s3load_example.csv を作成します。このファイルはMinIOに保存され、その内容は以下の通りです：

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
### ステップ2: Dorisでテーブルを作成する

```sql
CREATE TABLE test_s3load(
    user_id            BIGINT       NOT NULL COMMENT "user id",
    name               VARCHAR(20)           COMMENT "name",
    age                INT                   COMMENT "age"
)
DUPLICATE KEY(user_id)
DISTRIBUTED BY HASH(user_id) BUCKETS 10;
```
### Step 3: TVF を使用してデータを読み込む

:::caution 注意
ローカルネットワークに MinIO をデプロイし、TLS を有効にしていない場合は、エンドポイント文字列に明示的に `http://` を追加する必要があります。

- `"s3.endpoint" = "http://localhost:9000"`


S3 SDK はデフォルトで virtual-hosted スタイルを使用します。しかし、MinIO はデフォルトで virtual-hosted スタイルアクセスを有効にしていません。この場合、`use_path_style` パラメータを追加して path スタイルの使用を強制できます。

- `"use_path_style" = "true"`
:::

```sql
INSERT INTO test_s3load
SELECT * FROM S3
(
    "uri" = "s3://your_bucket_name/s3load_example.csv",
    "format" = "csv",
    "provider" = "S3",
    "s3.endpoint" = "play.min.io:9000",
    "s3.region" = "us-east-1",
    "s3.access_key" = "myminioadmin",
    "s3.secret_key" = "minio-secret-key-change-me",
    "column_separator" = ",",
    "csv_schema" = "user_id:int;name:string;age:int",
    "use_path_style" = "true"
);
```
### Step 4: インポートされたデータを確認する

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
