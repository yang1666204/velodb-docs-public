---
{
  "title": "MaxComputeからDoris",
  "description": "この文書では、MaxCompute Catalogを使用してAlibaba Cloud MaxComputeからApache Dorisにデータを迅速にインポートする方法について説明します。",
  "language": "ja"
}
---
この文書では、[MaxCompute カタログ](../catalogs/maxcompute-catalog.md)を使用して、Alibaba Cloud MaxComputeからApache Dorisにデータを迅速にインポートする方法を説明します。

この文書はApache Dorisバージョン2.1.9に基づいています。

## 環境準備

### 01 MaxCompute Open Storage APIを有効にする

[MaxCompute Console](https://maxcompute.console.aliyun.com/)の左ナビゲーションバーから`テナント管理` -> `テナントプロパティ` -> `Open Storage (Storage API)スイッチ`をオンにします。

### 02 MaxCompute権限を有効にする

DorisはAK/SKを使用してMaxComputeサービスにアクセスします。AK/SKに対応するIAMユーザーが、対応するMaxComputeサービスに対して以下のロールまたは権限を持っていることを確認してください：

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

Doris クラスターと MaxCompute サービスが同一の VPC 内にあり、適切なセキュリティグループが設定されていることを強く推奨します。

本ドキュメントの例は、同一の VPC ネットワーク環境でテストされています。

## MaxCompute データのインポート

### 01 カタログ の作成

```sql
CREATE CATALOG mc PROPERTIES (
  "type" = "max_compute",
  "mc.default.project" = "xxx",
  "mc.access_key" = "AKxxxxx",
  "mc.secret_key" = "SKxxxxx",
  "mc.endpoint" = "xxxxx"
);
```
Support Schema Level (3.1.3+)対応:

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
詳細については、[MaxCompute カタログ](../catalogs/maxcompute-catalog.md) のドキュメントを参照してください。

### 02 TPCH Dataset のインポート

MaxCompute のパブリックデータセットから TPCH 100 データセットを例として使用し（データはすでに MaxCompute にインポート済み）、`CREATE TABLE AS SELECT` 文を使用して MaxCompute データを Doris にインポートします。

このデータセットには 7 つのTableが含まれています。最大のTableである `lineitem` は 16 列、600,037,902 行で、約 30GB のディスク容量を占有します。

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
16C 64Gスペックの単一BEを持つDorisクラスターにおいて、上記の操作を直列で実行すると約6-7分かかります。

### 03 Github Event Datasetのインポート

MaxComputeのパブリックデータセットからGithub Event datasetを例として使用し（データは既にMaxComputeにインポート済み）、`CREATE TABLE AS SELECT`文を使用してMaxComputeデータをDorisにインポートします。

ここでは'2015-01-01'から'2016-01-01'までの365パーティションについて、`dwd_github_events_odps`Tableからデータを選択します。このデータは32列、212,786,803行で構成され、約10GBのディスク容量を占有します。

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
Dorisクラスターにおいて、16C 64G仕様の単一BEを使用した場合、上記の操作には約2分かかります。
