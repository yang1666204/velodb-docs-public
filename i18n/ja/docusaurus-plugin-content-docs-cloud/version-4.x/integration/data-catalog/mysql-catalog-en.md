---
{
  "title": "MySQL カタログ",
  "description": "MySQL Catalogを作成することで、VeloDB Cloud内でMySQLデータベースのデータを直接クエリでき、データソース間でのフェデレーテッドクエリが可能になります。",
  "language": "ja"
}
---
MySQL Catalogを作成することで、VeloDB Cloud内でMySQLデータベースのデータを直接クエリでき、データソース間でのフェデレーテッドクエリが可能になります。

## 前提条件

- MySQLデータベースインスタンスが動作している
- クエリ権限を持つデータベースユーザーが用意されている
- VeloDB CloudがネットワークからMySQLインスタンスにアクセス可能である

## AWS RDS/Aurora設定（オプション）

Amazon RDS for MySQLまたはAmazon Aurora MySQLを使用している場合は、以下の準備を完了する必要があります：

1. データベースエンドポイントとポートを取得します。
2. AWS RDS Consoleにログインします。
3. 左側のナビゲーションバーで**Databases**を選択します。
4. データベースインスタンス名をクリックします。
5. **Connectivity & security**タブで、以下を確認します：

   - **Endpoint**：データベース接続アドレス（例：`mydb.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com`）
   - **Port**：データベースポート（MySQLのデフォルトは3306）

   > **Auroraクラスターのヒント**：Auroraを使用している場合は、実際のニーズに応じて、Readerエンドポイント（読み取り専用クエリ）またはClusterエンドポイント（読み書き）の使用を推奨します。

6. Security Groupの設定

   RDSインスタンスのセキュリティグループがVeloDB Cloudからのアクセスを許可していることを確認します：
   - RDSインスタンス詳細ページの**Connectivity & security**タブで、**VPC security groups**の下にあるセキュリティグループリンクをクリックします。
   - **Inbound rules**タブを選択し、**Edit inbound rules**をクリックします。
   - ルールを追加します：
     - **Type**：MySQL/Aurora
     - **Port range**：3306（またはカスタムポート）
     - **Source**：
       - SaaSモード：VeloDB CloudはVPC Private Link経由でVPCのIPアドレス範囲に接続します。
       - BYOCモード：VPC CIDRまたはセキュリティグループ。
   - **Save rules**をクリックします。

7. データベースユーザー権限の設定

   RDSインスタンスに接続し、適切な権限を持つユーザーを作成します：

   ```sql
   -- Create user
   CREATE USER 'velodb_user'@'%' IDENTIFIED BY 'your_password';
   -- Grant read-only permissions (recommended for query scenarios)
   GRANT SELECT ON your_database.* TO 'velodb_user'@'%';
   -- Or grant read-write permissions (if data writing is needed)
   GRANT SELECT, INSERT, UPDATE, DELETE ON your_database.* TO 'velodb_user'@'%';
   -- Flush privileges
   FLUSH PRIVILEGES;
   ```
> **セキュリティに関するアドバイス**: 最小権限の原則に従い、必要なデータベースおよびテーブル権限のみを付与してください。

### ネットワーク要件

- **SaaS モードの VeloDB Cloud**: MySQL サービスにアクセスするには、VeloDB が VPC にアクセスできるように許可する必要があります。[velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc) を参照してください。
- **BYOC モードの VeloDB Cloud**: MySQL サービスにアクセスするには、デプロイメント時のネットワークポリシーを参照する必要があります。[create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources) を参照してください。
---

## Catalog の作成

### ステップ 1: 作成ページに移動

1. VeloDB Cloud Console にログインします。
2. 左側のナビゲーションバーで **Catalogs** をクリックします。
3. **Add External Catalog** ボタンをクリックします。
4. Database カテゴリで **MySQL** を選択します。

### ステップ 2: 接続情報の設定

![mysql-1](/images/integrations/data-catalog/mysql-1.png)

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| **Catalog Name** | ✓ | Catalog の一意の名前。SQL クエリでデータソースを識別するために使用されます。 |
| **Comment** | | オプションの説明。 |
| **JDBC URL** | ✓ | MySQL の JDBC 接続文字列。形式は `jdbc:mysql://<host>:<port>` で、オプションでデータベース名を指定できます。 |
| **User** | ✓ | データベースのユーザー名。 |
| **Password** | ✓ | データベースのパスワード。 |

**JDBC URL の例**:
- 基本形式: `jdbc:mysql://mysql.example.com:3306`
- データベース指定: `jdbc:mysql://mysql.example.com:3306/mydb`
- パラメータ付き: `jdbc:mysql://mysql.example.com:3306/mydb?useSSL=true`

### ステップ 3: 詳細設定 (オプション)

**Advanced Settings** をクリックして、接続プールサイズやタイムアウト設定などの追加オプションを設定します。

### ステップ 4: 作成の確認

1. 設定情報を確認します。
2. **Confirm** ボタンをクリックして Catalog を作成します。

## Catalog の使用

```sql
-- View database list
SHOW DATABASES FROM mysql_catalog;

-- View table list
SHOW TABLES FROM mysql_catalog.my_database;

-- Query data
SELECT * FROM mysql_catalog.my_database.my_table LIMIT 100;
```
