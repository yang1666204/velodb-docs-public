---
{
  "title": "Databricks Unity カタログ",
  "description": "Databricks Unity CatalogとVeloDB Cloudを統合して、クラウドストレージに保存されたデータレークTableをクエリする方法を学習します。このガイドでは、セットアップ、認証、およびUnity CatalogからIcebergTableをクエリする方法について説明します。",
  "language": "ja"
}
---
## 概要

[Databricks Unity カタログ](https://www.databricks.com/product/unity-catalog)は、クラウドとデータプラットフォーム全体でデータとAIアセットを統一的に管理するガバナンスレイヤーです。Unity CatalogをVeloDB Cloudと統合することで、Unity Catalogで管理されたメタデータを使用してクラウドオブジェクトストレージに保存されているデータレークTable（IcebergTableを含む）を直接クエリでき、シームレスなクロスプラットフォームデータアクセスと分析を可能にします。

このガイドでは、完全なセットアッププロセスを説明します：

- Databricks環境とUnity Catalogの準備
- VeloDB Cloudでの外部カタログコネクションの作成
- Unity CatalogTableからのデータクエリ

## Databricks環境の準備

VeloDB CloudでDatabricks Unity Catalogコネクションを作成する前に、以下の前提条件でDatabricks Unity Catalog環境が適切に設定されていることを確認してください：

### External Locationの作成

Databricks Unity Catalogにおいて、[External Location](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-external-locations)は、クラウドオブジェクトストレージ（AWS S3など）のパスをStorage Credentialsと関連付けるセキュリティオブジェクトです。External Locationは外部アクセスをサポートし、Unity CatalogはCredential Vending機能を通じてVeloDB Cloudなどの外部システムに短期間の認証情報を発行することで、これらのパスに保存されているデータへの安全なアクセスを可能にします。

![Create External Location in Unity カタログ](/images/integrations/data-catalog/unity-1.png)

以下の例では、Unity Catalogインターフェースを使用してAWS S3でExternal Locationを作成する手順を示します。Unity Catalogがサポートする他のクラウドストレージプロバイダーでも同様の手順が適用されます。

![Create External Location in Unity カタログ with AWS S3 path](/images/integrations/data-catalog/unity-2.png)

作成後、外部カタログとそれに対応するCredentialを確認できます：

![Unity カタログ External Location and Storage Credential created](/images/integrations/data-catalog/unity-3.png)

### Unity CatalogでのCatalogの作成

Databricksワークスペースで、Unity Catalogインターフェースに移動し、**Create カタログ**オプションをクリックします。

![Create カタログ in Unity カタログ](/images/integrations/data-catalog/unity-4.png)

Catalog名を入力します。`Use default storage`のチェックを外し、先ほど作成したExternal Locationを選択します。

![Configure Unity カタログ name and select External Location](/images/integrations/data-catalog/unity-5.png)

### External Use Schema権限の有効化

作成したCatalogをクリック → `Permissions` → `Grant`：

![Unity カタログ Permissions page to grant access](/images/integrations/data-catalog/unity-6.png)

`All account users`を選択し、`EXTERNAL USE SCHEMA`オプションにチェックを入れます。

![Grant EXTERNAL USE SCHEMA permission to all account users in Unity カタログ](/images/integrations/data-catalog/unity-7.png)

### IcebergTableの作成とデータ挿入

Databricks SQL Editorで以下のSQLを実行して、Unity CatalogにIcebergTableを作成し、サンプルデータを挿入します：

```sql
CREATE TABLE `my_unity_catalog`.default.iceberg_table (
  id int,
  name string
) USING iceberg;

INSERT INTO `my_unity_catalog`.default.iceberg_table VALUES(1, "jack");
```
## VeloDB Cloud で Databricks Unity カタログ 接続を作成する

以下の手順に従って、VeloDB Cloud で Databricks Unity カタログ 接続を作成し、VeloDB から Unity カタログ で管理されるTableを直接クエリできるようにします。

### ステップ 1: 作成ページに移動する

1.  VeloDB Cloud コンソールにログインします。
2.  左側のナビゲーションバーで **Catalogs** をクリックします。
3.  **Add 外部カタログ** ボタンをクリックします。
4.  Data Lake カテゴリで **Databricks Unity カタログ** を選択します。

### ステップ 2: 基本情報を入力する

**Basic Information** セクションで、Catalog の基本識別情報を設定します。

![VeloDB Cloud カタログ creation basic information form](/images/integrations/data-catalog/unity-8.png)

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| **カタログ Name** | ✓ | カタログ の一意の名前で、SQL クエリでこのデータソースを識別するために使用されます。 |
| **Comment** | | オプションの説明情報。 |

### ステップ 3: Metastore を設定する

**Metastore** セクションで、Databricks Unity カタログ サービスの接続情報を設定します。

![Configure Unity カタログ Warehouse and REST URI in VeloDB Cloud](/images/integrations/data-catalog/unity-9.png)

| フィールド | 必須 | 説明 |
| :--- | :--- | :--- |
| **Warehouse** | ✓ | Unity カタログ で設定された カタログ 名を指定します。 |
| **Unity カタログ Iceberg REST URI** |✓| Unity カタログ の REST サービス エンドポイント。 |

#### 認証タイプ

認証には OAuth2 と Personal Access Token(PAT) の 2 種類があります。

- OAuth2

    ![Configure OAuth2 authentication for Unity カタログ connection](/images/integrations/data-catalog/unity-10.png)

    | フィールド | 必須 | 説明 |
    | :--- | :--- | :--- |
    | **クライアント ID** | ✓ | OAuth2 サービスへのアクセスに使用される認証情報のクライアント ID。 |
    | **クライアント Secret** | ✓ | OAuth2 サービスへのアクセスに使用される認証情報のクライアント シークレット。 |
    | **Scope** | ✓ | OAuth2 アクセス リクエストのスコープ。 |
    | **サーバー URI** |  | トークンを取得するために使用される OAuth2 サービス エンドポイント。このパラメータはオプションで、一部のサービスでは明示的に指定する必要がない場合があります。 |

- Personal Access Token

    ![Configure Personal Access Token authentication for Unity カタログ](/images/integrations/data-catalog/unity-11.png)

    | フィールド | 必須 | 説明 |
    | :--- | :--- | :--- |
    | **Token** | ✓ | Unity カタログ の個人アクセス トークン |

### ステップ 4: 作成を確認する

1.  すべての設定情報が正しいかを確認します。
2.  **Confirm** ボタンをクリックして カタログ を作成します。
3.  接続の検証が完了するまで待ちます。

作成が成功すると、Catalog リストで新しく作成された Databricks Unity カタログ 接続を確認できます。

## Unity カタログ からデータをクエリする

Databricks Unity カタログ 接続が正常に作成されると、VeloDB Cloud SQL Editor で Unity カタログ Tableから直接データをクエリできます。これにより、Unity カタログ で管理されるメタデータとデータにアクセスしながら、VeloDB のクエリエンジンを活用できます。

### データベースとTableを表示する

以下の SQL コマンドを使用して Unity カタログ 構造を探索します：

```sql
-- View all databases under the Unity カタログ
SHOW DATABASES FROM my_unity_catalog;

-- View all tables under a database
SHOW TABLES FROM my_unity_catalog.`default`;

-- View table schema and metadata
DESCRIBE my_unity_catalog.`default`.iceberg_table;
```
### Unity カタログ Tableからのデータクエリ

Unity カタログ Tableからデータを取得するためにSQLクエリを実行します：

```sql
-- Query data with limit
SELECT * FROM my_unity_catalog.`default`.iceberg_table LIMIT 100;

-- Query with filtering conditions
SELECT column1, column2
FROM my_unity_catalog.`default`.iceberg_table
WHERE id = 10001;
```
Databricks Unity Catalogで管理されるIcebergTableおよび他のデータフォーマットをVeloDB Cloudを通じてシームレスにクエリできるようになり、Unity Catalogのガバナンス機能とVeloDBのクエリエンジンのパフォーマンスおよび機能を組み合わせることが可能です。
