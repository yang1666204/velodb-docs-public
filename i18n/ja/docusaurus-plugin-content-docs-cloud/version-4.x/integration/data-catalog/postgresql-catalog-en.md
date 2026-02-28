---
{
  "title": "PostgreSQL カタログ",
  "description": "PostgreSQL Catalogを作成することで、VeloDB Cloud内でPostgreSQLデータベースから直接データをクエリでき、データソース間での連合クエリが可能になります。",
  "language": "ja"
}
---
PostgreSQL Catalogを作成することで、VeloDB Cloud内でPostgreSQLデータベースから直接データをクエリでき、データソース間でのフェデレーテッドクエリが可能になります。

## 前提条件

* PostgreSQLデータベースインスタンスが稼働していること
* クエリ権限を持つデータベースユーザーが準備されていること
* VeloDB Cloudがネットワークを通じてPostgreSQLインスタンスにアクセスできること

## AWS RDS/Aurora設定（オプション）

Amazon RDS for PostgreSQLまたはAmazon Aurora PostgreSQLを使用している場合は、以下の準備を完了する必要があります：

### 1. データベースEndpointとPortの取得

1. AWS RDSコンソールにログイン
2. 左側のナビゲーションバーでDatabasesを選択
3. データベースインスタンス名をクリック
4. Connectivity & securityタブで以下を確認：
   * Endpoint：データベース接続アドレス（例：mydb.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com）
   * Port：データベースポート（PostgreSQLのデフォルトは5432）

   > Aurora Cluster：Aurora PostgreSQLを使用している場合は、実際のニーズに応じてReader endpoint（読み取り専用クエリ）またはCluster endpoint（読み書き）の使用を推奨します。

### 2. Security Groupの設定

RDSインスタンスのsecurity groupがVeloDB Cloudからのアクセスを許可するようにします：

1. RDSインスタンス詳細ページのConnectivity & securityタブで、VPC security groups下のsecurity groupリンクをクリック
2. Inbound rulesタブを選択し、Edit inbound rulesをクリック
3. ルールを追加：
   * Type：PostgreSQL
   * Port range：5432（またはカスタムポート）
   * Source：
     * SAASmMode：VPC Private Link経由でVPCに接続するVeloDB CloudのIPアドレス範囲
     * BYOCMode：VPCのCIDRまたはsecurity group
4. Save rulesをクリック

### 3. データベースユーザー権限の設定

RDSインスタンスに接続し、適切な権限を持つユーザーを作成します：

```sql
-- Create user
CREATE USER velodb_user WITH PASSWORD 'your_password';
-- Grant database connection permission
GRANT CONNECT ON DATABASE your_database TO velodb_user;
-- Grant schema usage permission
GRANT USAGE ON SCHEMA public TO velodb_user;
-- Grant read-only permission (recommended for query scenarios)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO velodb_user;
-- Grant read-only permission for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO velodb_user;
-- Or grant read-write permission (if data write is needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO velodb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO velodb_user;
```
**セキュリティ推奨事項**: 最小権限の原則に従い、必要なデータベースとTableの権限のみを付与してください。

### 4. ネットワーク要件

* **SAASモード**: PostgreSQLサービスにアクセスするには、VeloDBがVPCにアクセスできるようにする必要があります。[velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc)を参照してください。
* **BYOCモード**: PostgreSQLサービスにアクセスするには、デプロイメント時のネットワークポリシーを参照する必要があります。[create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources)を参照してください。

## Catalogの作成

### ステップ1: 作成ページにアクセス

1. VeloDB Cloudコンソールにログインします
2. 左側のナビゲーションバーで、**Catalogs**をクリックします
3. **Add 外部カタログ**ボタンをクリックします
4. Databaseカテゴリから、**PostgreSQL**を選択します

### ステップ2: 接続情報の設定

![pg-1](/images/integrations/data-catalog/pg-1.png)

| フィールド | 必須 | 説明 |
| ---------------- | -------- | --------------------------------------------------------------------------------------------- |
| **カタログ Name** | ✓        | Catalogの一意の名前で、SQLクエリでこのデータソースを識別するために使用されます。 |
| **Comment**      |          | オプションの説明。 |
| **JDBC URL**     | ✓        | PostgreSQLのJDBC接続文字列。形式: `jdbc:postgresql://<host>:<port>/<database>`。 |
| **User**         | ✓        | データベースのユーザー名。 |
| **Password**     | ✓        | データベースのパスワード。 |

**JDBC URLの例**:

* 基本形式: `jdbc:postgresql://pg.example.com:5432/postgres`
* パラメータ付き: `jdbc:postgresql://pg.example.com:5432/mydb?sslmode=require`

> **注意**: PostgreSQL JDBC URLはデータベース名（例: `postgres`）を指定する必要があります。

### ステップ3: 詳細設定（オプション）

**Advanced Settings**をクリックして、接続プールサイズ、タイムアウト設定などの追加オプションを設定します。

### ステップ4: 作成の確認

* 設定情報を確認します
* **Confirm**ボタンをクリックしてCatalogを作成します

## Catalogの使用

```sql
-- View schema list
SHOW DATABASES FROM pg_catalog;

-- View table list
SHOW TABLES FROM pg_catalog.public;

-- Query data
SELECT * FROM pg_catalog.public.my_table LIMIT 100;
```
