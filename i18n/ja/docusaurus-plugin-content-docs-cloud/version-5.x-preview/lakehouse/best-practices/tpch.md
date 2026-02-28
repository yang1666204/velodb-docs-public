---
{
  "title": "Hive/IcebergでのTPC-H生成",
  "description": "Dorisは、TPCH Connectorを使用してTPCHテストセットを迅速に構築するために、Trino Connector互換フレームワークの使用をサポートしています。",
  "language": "ja"
}
---
DorisはTPCHテストセットを迅速に構築するために、[Trino Connector](https://doris.apache.org/community/how-to-contribute/trino-connector-developer-guide)互換フレームワークと[TPCH Connector](https://trino.io/docs/current/connector/tpch.html)の使用をサポートしています。

Hive/IcebergTableのデータWrite-back機能と組み合わせることで、Dorisを通じてDoris、Hive、IcebergTableのTPCHテストデータセットを迅速に構築できます。

このドキュメントでは主に、TPCH Connectorをデプロイし、テストデータセットを構築するために使用する方法について説明します。

:::tip
この機能はDorisバージョン3.0.0からサポートされています。
:::

## TPCH Connectorのコンパイル

> JDKバージョン17が必要です。

```shell
git clone https://github.com/trinodb/trino.git
git checkout 435
cd trino/plugin/trino-tpch
mvn clean install -DskipTest
```
コンパイル後、`trino/plugin/trino-tpch/target/`の下に`trino-tpch-435/`ディレクトリが作成されます。

また、プリコンパイル済みの[trino-tpch-435.tar.gz](https://github.com/morningman/trino-connectors/releases/download/trino-connectors/trino-tpch-435.tar.gz)を直接ダウンロードして展開することもできます。

## TPCHコネクタのデプロイ

すべてのFEおよびBEデプロイメントパスの`connectors/`ディレクトリに`trino-tpch-435/`ディレクトリを配置してください。（存在しない場合は手動で作成できます）。

```text
├── bin
├── conf
├── connectors
│   ├── trino-tpch-435
...
```
デプロイ後、Connectorが正しく読み込まれることを確実にするために、FEとBEノードの再起動が推奨されます。

## TPCH Catalogの作成

```sql
CREATE CATALOG `tpch` PROPERTIES (
    "type" = "trino-connector",
    "trino.connector.name" = "tpch",
    "trino.tpch.column-naming" = "STANDARD",
    "trino.tpch.splits-per-node" = "32"
);
```
`tpch.splits-per-node`は並行数であり、最適な並行性を実現するためにBEマシンあたりのコア数の2倍に設定することが推奨されています。これによりデータ生成効率が向上します。

`"tpch.column-naming" = "STANDARD"`の場合、TPCHTableの列名はTable名の略称で始まります（例：`l_orderkey`）。そうでなければ`orderkey`となります。

## TPCH Catalogの使用

TPCH Catalogには異なるScale FactorのTPCHデータセットが事前に設定されており、`SHOW DATABASES`および`SHOW TABLES`コマンドを使用して確認できます。

```sql
mysql> SWITCH tpch;
Query OK, 0 rows affected (0.00 sec)

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| sf1                |
| sf100              |
| sf1000             |
| sf10000            |
| sf100000           |
| sf300              |
| sf3000             |
| sf30000            |
| tiny               |
+--------------------+

mysql> USE sf1;
mysql> SHOW TABLES;
+---------------+
| Tables_in_sf1 |
+---------------+
| customer      |
| lineitem      |
| nation        |
| orders        |
| part          |
| partsupp      |
| region        |
| supplier      |
+---------------+
```
これらのTableはSELECT文を使って直接クエリできます。

:::tip
これらの事前設定されたデータセットのデータは実際には保存されておらず、クエリ実行時にリアルタイムで生成されます。そのため、これらの事前設定されたデータセットは直接的なBenchmarkテストには適していません。これらは`INSERT INTO SELECT`を通じて他のターゲットTable（Doris内部Table、Hive、Iceberg、およびDorisが書き込みをサポートするその他すべてのデータソース）にデータセットを書き込み、その後ターゲットTableでパフォーマンステストを実行するのに適しています。
:::

## TPCHテストデータセットの構築

以下の例では、CTAS文を使ってHive上にTPCHテストデータセットを素早く構築します：

```sql
CREATE TABLE hive.tpch100.customer PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.customer  ;
CREATE TABLE hive.tpch100.lineitem PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.lineitem  ;
CREATE TABLE hive.tpch100.nation   PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.nation    ;
CREATE TABLE hive.tpch100.orders   PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.orders    ;
CREATE TABLE hive.tpch100.part     PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.part      ;
CREATE TABLE hive.tpch100.partsupp PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.partsupp  ;
CREATE TABLE hive.tpch100.region   PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.region    ;
CREATE TABLE hive.tpch100.supplier PROPERTIES("file_format" = "parquet") AS SELECT * FROM tpch.sf100.supplier  ;
```
:::tip
3つの16C BEノードを持つDorisクラスタでは、TPCH 1000 Hiveデータセットの作成には約25分かかり、TPCH 10000では約4～5時間かかります。
:::
