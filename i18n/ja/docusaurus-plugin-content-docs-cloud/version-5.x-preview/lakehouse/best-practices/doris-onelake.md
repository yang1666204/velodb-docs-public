---
{
  "title": "Microsoft OneLakeとの統合",
  "description": "Microsoft OneLake は、Fabric エコシステムの一部であり、組織に対して中央集権的な論理データを提供する統合されたオープンな SaaS データレイクです",
  "language": "ja"
}
---
**Microsoft OneLake**は、Fabricエコシステムの一部であり、組織に統合された論理的なデータストレージ層を提供する統合されたオープンなSaaSデータレイクです。OneLakeのデータは**Parquet**形式で保存され、**Delta Lake**と**Apache Iceberg**のメタデータを同時に維持できます。この設計により、複数の分析エンジンが**データの重複や移行なしに**共有データセットに直接アクセスでき、データ管理とガバナンスを大幅に簡素化します。

**Apache DorisのIceberg REST Catalog**を活用することで、ユーザーはOneLakeに保存されたデータを直接クエリし分析できます—ここでも、コピーや移動は不要です。

この統合により、単一のデータレイク上で**エンドツーエンドの分析パイプライン**を構築でき、OneLakeの統合されたストレージとガバナンス機能をDorisの高性能分析コンピュートと組み合わせることができます。

技術レベルでは、Dorisはオープンなテーブル形式と標準化されたインターフェースを通じてOneLakeと相互作用し、メタデータとParquetファイルの両方にアクセスします。このアーキテクチャは、集中化されたガバナンス、アクセス制御、セキュリティポリシーを保持し、プラットフォームの信頼性、スケーラビリティ、保守性を確保します。

この記事では、環境セットアップ、認証、クエリワークフローの例を含めて、DorisをOneLakeに接続する方法を説明します。

> Dorisバージョン3.1.4+が必要です

## Onelakeセットアップ

まず**Fabric (OneLake)**側でのデータと認証セットアップの準備から始め、その後そのデータにアクセスするためのDorisでの**Iceberg REST Catalog**の作成方法を示します。

### OneLakeにデータをロードする

1. **Microsoft Fabric**コンソールを開き、新しい**Workspace**を作成します（一部の設定が制限される可能性があるため、デフォルトのワークスペースを使用*しない*ことを推奨します）。

   ![onelake1](/images/integrations/lakehouse/onelake/onelake-1.png)

2. ワークスペース内で、**New Item → Lakehouse**を選択してLakehouseインスタンスを作成します。

   ![onelake2](/images/integrations/lakehouse/onelake/onelake-2.png)

3. **Workspace Settings**に移動し、Lakehouse機能を有効にするために必要な機能トグルを有効にします。

   ![onelake3](/images/integrations/lakehouse/onelake/onelake-3.png)

### ローカルファイルをアップロードする

デモンストレーションのために、ローカルのCSVファイルを直接OneLakeにアップロードします。これはサンプルファイルです：

![onelake4](/images/integrations/lakehouse/onelake/onelake-4.png)

1. ワークスペースの**Files**セクションに移動し、**Upload → Upload Files**をクリックしてCSVファイルを選択します。

   ![onelake5](/images/integrations/lakehouse/onelake/onelake-5.png)

2. アップロード後、**Load Tables → New table**を選択します（既存のテーブルがある場合は、そちらにロードすることも可能です）。

3. インポートが完了したら、**Tables**ビューに移動してテーブルとデータを確認します。

   ![onelake6](/images/integrations/lakehouse/onelake/onelake-6.png)

### 認証セットアップ

DorisがIceberg REST Catalog経由でOneLakeにアクセスできるようにするには、Azureポータルで**アプリケーション登録と権限**を設定する必要があります：

1. **Azure Portal → App registrations → New registration**を開き、後で使用するために以下の値をメモしてください：

   * Application (client) ID

   * Directory (tenant) ID

   ![onelake7](/images/integrations/lakehouse/onelake/onelake-7.png)

* **API Permissions**で、**Azure Storage**に必要な権限を追加します（最小権限の原則に従ってください）。

  ![onelake8](/images/integrations/lakehouse/onelake/onelake-8.png)

* **Certificates & secrets**で、**client secret**を作成し、その値を安全に保存してください—ページを離れると非表示になります。

  ![onelake9](/images/integrations/lakehouse/onelake/onelake-9.png)

* **Fabric Workspace → Manage Access**に戻り、登録されたアプリを（表示名で）アクセスプリンシパルとして追加します。

  ![onelake10](/images/integrations/lakehouse/onelake/onelake-10.png)

これらの手順が完了すると、OneLakeのデータと認証セットアップの準備が整います。

## Apache DorisからOneLakeに接続する

次に、Dorisで**Iceberg REST Catalog**を作成し、OneLakeデータに接続しましょう。

### Catalogを作成する

```sql
Doris> CREATE CATALOG onelake_doris PROPERTIES (
            'type' = 'iceberg',
            'iceberg.catalog.type' = 'rest',
            'uri'='https://onelake.table.fabric.microsoft.com/iceberg',
            'warehouse'='<workerspace_id>/<data_item_id>',
            'iceberg.rest.security.type'='oauth2',
            'iceberg.rest.oauth2.server-uri'='https://login.microsoftonline.com/<talent_id>/oauth2/v2.0/token',
            'iceberg.rest.oauth2.credential'='<oauth2.client_id>:'<oauth2.client_secret>,
            'iceberg.rest.oauth2.scope'='https://storage.azure.com/.default', 
            'fs.azure.support'='true',
            'azure.endpoint'='https://onelake.dfs.fabric.microsoft.com',
            'azure.auth_type'='OAuth2',
            'azure.oauth2_account_host'='onelake.dfs.fabric.microsoft.com',
            'azure.oauth2_server_uri'='https://login.microsoftonline.com/<talent_id>/oauth2/v2.0/token',
            'azure.oauth2_client_id'='<oauth2.client_id>',
            'azure.oauth2_client_secret'='<oauth2.client_secret>'
        );
```
カタログを作成する際、以下のパラメータが必要です:

* `WORKSPACE_ID` と `DATA_ITEM_ID` — Lakehouse URL から取得できます:

  `https://app.fabric.microsoft.com/groups/<WORKSPACE_ID>/lakehouses/<DATA_ITEM_ID>`

* `client_id`、`client_secret`、`tenant` などのその他のパラメータは、Azure アプリ登録の詳細に対応します。

* OneLake の場合、`iceberg.rest.oauth2.scope`、`uri`、`azure.oauth2_account_host`、`azure.endpoint` などの設定キーは通常固定値を持ちます — 詳細については公式ドキュメントまたはサンプル設定を参照してください。

設定後、標準 SQL を使用して Doris から OneLake の Iceberg テーブルを直接クエリできます。

### 基本的な分析

以下は、Doris と OneLake が統合分析でどのように連携できるかを示す、一般的なビジネス分析の例です:

```sql
Doris> SWITCH onelake_doris;
Query OK, 0 rows affected

Doris> USE dbo;
Database changed

Doris> SHOW TABLES;
+----------------+
| Tables_in_dbo  |
+----------------+
| customer_order |
+----------------+
1 row in set
```
1. 過去3日間の新規注文を追跡

   保留中、支払済み、完了済みの注文を含む最近の販売活動に関するリアルタイムの洞察を得て、フルフィルメントの優先順位付けを改善します。

   ```sql
   Doris> SELECT order_id, customer_name, product_name, total_price, status
       -> FROM customer_order
       -> WHERE order_date >= DATE_SUB(NOW(), INTERVAL 3 DAY)
       -> ORDER BY order_date DESC;

   +----------------+---------------+---------------------+-------------+-----------+
   | order_id       | customer_name | product_name        | total_price | status    |
   +----------------+---------------+---------------------+-------------+-----------+
   | ORD20251112002 | Bob Li        | Smart Watch         |        1128 | Completed |
   | ORD20251112001 | Alice Zhang   | Wireless Headphones |         499 | Completed |
   | ORD20251112003 | Chen Wei      | Bluetooth Speaker   |         299 | Pending   |
   +----------------+---------------+---------------------+-------------+-----------+
   3 rows in set
   ```
2. 市レベルの売上パフォーマンス

   地域売上戦略と在庫計画の指針とするため、市ごとの総売上と注文数を集計する。

   ```sql
   Doris> SELECT city,
       ->        SUM(total_price) AS total_sales,
       ->        COUNT(*) AS order_count
       -> FROM customer_order
       -> WHERE status = 'Completed'
       -> GROUP BY city
       -> ORDER BY total_sales DESC;

   +----------+-------------+-------------+
   | city     | total_sales | order_count |
   +----------+-------------+-------------+
   | Beijing  |        1128 |           1 |
   | Shanghai |         499 |           1 |
   | Shenzhen |         387 |           1 |
   +----------+-------------+-------------+
   3 rows in set
   ```
3. 決済方法別返金率

   異常に高い返金率を示す決済チャネルを特定し、財務部門やリスク管理チームがポリシーを調整したり監視を強化したりするのに役立てます。

   ```sql
   Doris> SELECT payment_method,
       -> SUM(CASE WHEN status = 'Refunded' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
       ->    AS refund_rate_percent
       -> FROM customer_order
       -> GROUP BY payment_method
       -> ORDER BY refund_rate_percent DESC;

   +----------------+---------------------+
   | payment_method | refund_rate_percent |
   +----------------+---------------------+
   | Credit Card    |            50.00000 |
   | WeChat Pay     |             0.00000 |
   | Alipay         |             0.00000 |
   | UnionPay       |             0.00000 |
   +----------------+---------------------+
   4 rows in set
   ```
4. クロスシステムユーザー行動比較

   レガシー（例：Hive）とOneLakeシステムの両方がアクティブな場合、ユーザーの重複と移行後の行動変化を分析して、ビジネスへの影響を評価できます。

   ```sql
   -- "hive_catalog" is a Hive Catalog created in Doris 
   Doris> SELECT
       ->     a.customer_id,
       ->     COUNT(DISTINCT b.order_id) AS new_order_count,
       ->     SUM(b.total_price) AS new_total_amount
       -> FROM hive_catalog.order_db.hive_customer_order a
       -> JOIN onelake_doris.dbo.customer_order b
       ->   ON a.customer_id = b.customer_id
       -> GROUP BY a.customer_id
       -> ORDER BY new_total_amount DESC
       -> LIMIT 100;
       
   +-------------+-----------------+------------------+
   | customer_id | new_order_count | new_total_amount |
   +-------------+-----------------+------------------+
   | CUST1002    |               1 |             1128 |
   | CUST1001    |               1 |              499 |
   | CUST1004    |               1 |              387 |
   | CUST1003    |               1 |              299 |
   | CUST1005    |               1 |              189 |
   +-------------+-----------------+------------------+
   5 rows in set
   ```
### スナップショット & タイムトラベル

```sql
Doris> SELECT * FROM customer_order$snapshots\G
*************************** 1. row ***************************
 committed_at: 2025-11-12 17:21:06.692000
  snapshot_id: 7623467350518045470
    parent_id: NULL
    operation: overwrite
manifest_list: abfss://181a804a-ea52-...
      summary: {"XTABLE_METADATA":"{"lastInstantSynced":"2025-11-12...
1 row in set (1.90 sec)

mysql> SELECT * FROM customer_order FOR VERSION AS OF 7623467350518045470 LIMIT 1\G
*************************** 1. row ***************************
      order_id: ORD20251112001
   customer_id: CUST1001
 customer_name: Alice Zhang
         email: alice.zhang@example.com
         phone: 13812345678
       country: China
          city: Shanghai
    order_date: 2025-11-10 22:23:00.000000
    product_id: PROD-A100
  product_name: Wireless Headphones
      category: Electronics
      quantity: 1
    unit_price: 499
   total_price: 499
payment_method: Credit Card
        status: Completed
1 row in set
```
## 結論

本ガイドを通じて、**Apache Doris**と**Microsoft OneLake**をシームレスに統合し、統一されたデータレイクアーキテクチャ上で高性能な分析を可能にする方法を実演しました。
この統合により、以下のような主要な利点が得られます：

* **ゼロデータ移動** – OneLake内のデータに直接アクセスし、コピーやマイグレーションは不要です。

* **統一されたガバナンス** – データレイク全体で一元化された管理、アクセス制御、セキュリティポリシーを維持します。

* **オープンフォーマット互換性** – **Iceberg**オープンテーブル標準に基づいて構築されており、クロスプラットフォームの相互運用性を保証します。

* **柔軟な分析** – DorisのパワフルなOLAPエンジンとOneLakeのスケーラブルなストレージ層を組み合わせます。

**リアルタイムビジネスモニタリング**、**システム間データ比較**、**複雑な多次元分析**など、このアーキテクチャは企業にパフォーマンスと柔軟性の両方を提供します。データレイク技術の進歩に伴い、DorisとOneLakeの統合は、企業のデジタル変革における堅固なデータ基盤として機能します。

次に、この記事で説明した設定手順に従って独自の分析環境を構築し、ビジネスニーズに合わせたより高度な分析シナリオを探求することができます。
