---
{
  "title": "サンプルデータカタログ",
  "description": "VeloDB Cloudでは、スケーラブルなベンチマークデータセットを生成するために、TPCDSとTPCHという2種類のサンプルデータジェネレータCatalogを提供しています。このデータは、パフォーマンステスト、機能検証、またはSQLクエリの学習に使用できます。",
  "language": "ja"
}
---
## 概要

| カタログ | 説明 | 適用シナリオ |
| :--- | :--- | :--- |
| **TPCDS** | TPC-DSベンチマークデータ。小売業の意思決定支援シナリオをシミュレートし、24のTableを含む。 | 複雑な分析クエリ、データウェアハウスのパフォーマンステスト。 |
| **TPCH** | TPC-Hベンチマークデータ。ビジネス意思決定シナリオをシミュレートし、8のTableを含む。 | OLAPクエリのパフォーマンステスト、入門学習。 |

これらのCatalogは動的なデータ生成をサポートします。生成されたデータをテスト用にVeloDB内部Table、IcebergTable、またはHiveTableに書き込むことができます。

## Catalog作成

### ステップ1：作成ページへ移動

1. VeloDB Cloudコンソールにログインします。
2. 左側のナビゲーションバーで、**Catalogs**をクリックします。
3. **Add 外部カタログ**ボタンをクリックします。
4. **サンプル Data**カテゴリの下で、**TPCDS**または**TPCH**を選択します。

### ステップ2：Catalogの設定

#### TPCDS設定

![sample-1](/images/integrations/data-catalog/sample-1.png)

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| **カタログ Name** | ✓ | Catalogの一意の名前。 |
| **Comment** | | オプションの説明情報。 |
| **Splits Count** | | ノードごとの同時実行数。デフォルトは32。 |

#### TPCH設定

![sample-2](/images/integrations/data-catalog/sample-2.png)

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| **カタログ Name** | ✓ | Catalogの一意の名前。 |
| **Comment** | | オプションの説明情報。 |
| **Splits Per Node** | | ノードごとの同時実行数。デフォルトは32。 |

### ステップ3：作成の確認

**Confirm**ボタンをクリックして作成を完了します。

## Catalogの使用

### 利用可能なデータの表示

```sql
-- View databases (datasets of different scales)
SHOW DATABASES FROM tpcds_catalog;
-- Result example: sf1, sf10, sf100, sf1000 ...

-- View tables
SHOW TABLES FROM tpcds_catalog.sf1;
```
データベース名の`sf`はScale Factorを表します:

* `sf1`: 約1GBのデータ
* `sf10`: 約10GBのデータ
* `sf100`: 約100GBのデータ
* `sf1000`: 約1TBのデータ

### Query サンプル Data

```sql
-- Query TPCH data
SELECT * FROM tpch_catalog.sf1.customer LIMIT 10;

-- Query TPCDS data
SELECT * FROM tpcds_catalog.sf1.store_sales LIMIT 10;
```
### VeloDBTableへのデータの書き込み

```sql
-- Create VeloDB table and import TPCH data
CREATE TABLE my_db.customer AS
SELECT * FROM tpch_catalog.sf1.customer;

-- Or use INSERT INTO
INSERT INTO my_db.lineitem
SELECT * FROM tpch_catalog.sf10.lineitem;
```
## TPCHTable構造

| Table Name | デスクリプション |
| :--- | :--- |
| customer | 顧客情報 |
| lineitem | 注文詳細 |
| nation | 国 |
| orders | 注文 |
| part | 部品 |
| partsupp | 部品サプライヤー |
| region | 地域 |
| supplier | サプライヤー |

## TPCDSTable構造

TPCDSには24のTableが含まれており、小売シナリオをシミュレートします：

| Category | Table Name |
| :--- | :--- |
| Fact Tables | store_sales, store_returns, catalog_sales, catalog_returns, web_sales, web_returns, inventory |
| Dimension Tables | customer, customer_address, customer_demographics, date_dim, time_dim, item, store, catalog_page, web_page, web_site, warehouse, promotion, household_demographics, income_band, ship_mode, reason, call_center |
