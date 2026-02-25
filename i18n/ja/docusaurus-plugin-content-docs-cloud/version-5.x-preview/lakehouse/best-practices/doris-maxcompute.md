---
{
  "title": "MaxCompute から Doris へ",
  "description": "このドキュメントでは、MaxCompute Catalogを使用してAlibaba Cloud MaxComputeからApache Dorisにデータを迅速にインポートする方法について説明します。",
  "language": "ja"
}
---
この文書では、[MaxCompute Catalog](../catalogs/maxcompute-catalog.md)を使用してAlibaba Cloud MaxComputeからApache Dorisにデータを迅速にインポートする方法について説明します。

この文書はApache Dorisバージョン2.1.9に基づいています。

## 環境準備

### 01 MaxCompute Open Storage APIの有効化

[MaxCompute Console](https://maxcompute.console.aliyun.com/)の左側ナビゲーションバー -> `Tenant Management` -> `Tenant Properties` -> `Open Storage (Storage API) switch`をオンにします。

### 02 MaxCompute権限の有効化

DorisはAK/SKを使用してMaxComputeサービスにアクセスします。AK/SKに対応するIAMユーザーが、対応するMaxComputeサービスに対して以下の役割または権限を持っていることを確認してください：

```json
{
    "Statement": [{
            "Action": ["odps:List",
                "odps:Usage"],
            "Effect": "Allow",
            "Resource": ["acs:odps:*:regions/*/quotas/pay-as-you-go"]}],
    "Version": "1"
}
```
### 03 Doris と MaxCompute のネットワーク環境の確認

Doris クラスターと MaxCompute サービスが同じ VPC 内にあり、正しいセキュリティグループが設定されていることを強く推奨します。

このドキュメントの例は、同じ VPC ネットワーク環境でテストされています。

## MaxCompute データのインポート

### 01 Catalog の作成

```sql
CREATE CATALOG mc PROPERTIES (
  "type" = "max_compute",
  "mc.default.project" = "xxx",
  "mc.access_key" = "AKxxxxx",
  "mc.secret_key" = "SKxxxxx",
  "mc.endpoint" = "xxxxx"
);
```
Support Schema Level (3.1.3+) をサポート:

```sql
CREATE CATALOG mc PROPERTIES (
  "type" = "max_compute",
  "mc.default.project" = "xxx",
  "mc.access_key" = "AKxxxxx",
  "mc.secret_key" = "SKxxxxx",
  "mc.endpoint" = "xxxxx",
  'mc.enable.namespace.schema' = 'true'
);
```
詳細については、[MaxCompute Catalog](../catalogs/maxcompute-catalog.md)のドキュメントを参照してください。

### 02 TPCHデータセットのインポート

MaxComputeの公開データセットにあるTPCH 100データセットを例として使用し（データはすでにMaxComputeにインポート済み）、`CREATE TABLE AS SELECT`文を使ってMaxComputeのデータをDorisにインポートします。

このデータセットには7つのテーブルが含まれています。最大のテーブルである`lineitem`は16列、600,037,902行で構成されており、約30GBのディスク容量を占有します。

```sql
-- switch catalog
SWITCH internal;
-- create database
CREATE DATABASE tpch_100g;
-- ingest data
CREATE TABLE tpch_100g.lineitem AS SELECT * FROM mc.selectdb_test.lineitem;
CREATE TABLE tpch_100g.nation AS SELECT * FROM mc.selectdb_test.nation;
CREATE TABLE tpch_100g.orders AS SELECT * FROM mc.selectdb_test.orders;
CREATE TABLE tpch_100g.part AS SELECT * FROM mc.selectdb_test.part;
CREATE TABLE tpch_100g.partsupp AS SELECT * FROM mc.selectdb_test.partsupp;
CREATE TABLE tpch_100g.region AS SELECT * FROM mc.selectdb_test.region;
CREATE TABLE tpch_100g.supplier AS SELECT * FROM mc.selectdb_test.supplier;
```
16C 64Gスペックの単一BEを持つDorisクラスターでは、上記の操作を順次実行するのに約6-7分かかります。

### 03 Github Eventデータセットのインポート

MaxComputeのパブリックデータセットからGithub Eventデータセットを例として使用し（データは既にMaxComputeにインポート済み）、`CREATE TABLE AS SELECT`文を使ってMaxComputeのデータをDorisにインポートします。

ここでは、'2015-01-01'から'2016-01-01'までの365パーティションについて、`dwd_github_events_odps`テーブルからデータを選択します。データは32列、212,786,803行で、約10GBのディスク容量を占有します。

```sql
-- switch catalog
SWITCH internal;
-- create database
CREATE DATABASE github_events;
-- ingest data
CREATE TABLE github_events.dwd_github_events_odps
AS SELECT * FROM mc.github_events.dwd_github_events_odps
WHERE ds BETWEEN '2015-01-01' AND '2016-01-01';
```
Dorisクラスター内で16C 64G仕様の単一のBEを使用した場合、上記の操作には約2分かかります。
