---
{
  "title": "DataGrip",
  "description": "DataGripは、JetBrains製のリレーショナルデータベースとNoSQLデータベース用の強力なクロスプラットフォームデータベースツールです。",
  "language": "ja"
}
---
# DataGrip

## 概要

DataGripは、JetBrainsが提供するリレーショナルデータベースおよびNoSQLデータベース用の強力なクロスプラットフォームデータベースツールです。

Apache DorisはMySQLプロトコルとの高い互換性を持っています。DataGripのMySQLデータソースを使用してApache Dorisに接続し、内部カタログおよび外部カタログ内のデータをクエリできます。

## 前提条件

DataGripがインストールされていること
www.jetbrains.com/datagrip/ にアクセスしてDataGripをダウンロードおよびインストールできます

## データソースの追加

:::info Note
現在DataGripバージョン2023.3.4を使用して検証済み
:::

1. DataGripを起動
2. DataGripウィンドウの左上角にあるプラス記号（**+**）アイコンをクリックし、MySQLデータソースを選択

    ![add data source](/images/cloud/integration/sql-client/datagrip1.png)

3. Doris接続の設定

    Data Sources and DriversウィンドウのGeneralタブで、以下の接続情報を設定します：

  - Host: DorisクラスターのFEホストIPアドレス。
  - Port: Dorisクラスターのクエリポート（例：9030）。
  - Database: Dorisクラスター内のターゲットデータベース。
  - User: Dorisクラスターへのログインに使用するユーザー名（例：admin）。
  - Password: Dorisクラスターへのログインに使用するユーザーパスワード。

    :::tip
    Databaseは内部カタログと外部カタログを区別するために使用できます。Databaseに名前のみを入力した場合、現在のデータソースはデフォルトで内部カタログに接続されます。形式がcatalog.dbの場合、現在のデータソースはDatabaseに入力されたcatalogにデフォルトで接続され、DataGripに表示されるデータベースTableも接続されたcatalog内のデータベースTableになります。この方法により、DataGripのMySQLデータソースを使用して複数のDorisデータソースを作成し、Doris内の異なるCatalogを管理できます。
    :::

    :::info Note
    catalog.dbのDatabase形式を通じてDorisに接続された外部カタログを管理するには、Dorisバージョン2.1.0以上が必要です。
    :::

  - 内部カタログ

    ![connect 内部カタログ](/images/cloud/integration/sql-client/datagrip2.png)

  - 外部カタログ

    ![connect 外部カタログ](/images/cloud/integration/sql-client/datagrip3.png)

5. データソース接続のテスト

    接続情報を入力後、左下角のTest Connectionをクリックしてデータベース接続情報の正確性を検証します。DBeaverが以下のポップアップウィンドウを返す場合、テスト接続は成功です。その後、右下角のOKをクリックして接続設定を完了します。

   ![test connection](/images/cloud/integration/sql-client/datagrip4.png)

6. データベースへの接続

    データベース接続が確立された後、左側のデータベース接続ナビゲーションで作成されたデータソース接続を確認でき、DataGripを通じてデータベースに接続および管理できます。

   ![create connection](/images/cloud/integration/sql-client/datagrip5.png)

## 機能サポート

基本的にはほとんどの視覚的な閲覧操作、およびSQLコンソールでのSQL操作の記述をサポートしています。DorisはデータベースTableの作成、スキーマ変更、データの追加・削除・変更などの各種操作をサポートしていないか、または検証されていません。
