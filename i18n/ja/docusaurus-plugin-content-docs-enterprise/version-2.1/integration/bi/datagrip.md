---
{
  "title": "DataGrip",
  "description": "DataGripは、JetBrainsが提供するリレーショナルデータベースとNoSQLデータベース向けの強力なクロスプラットフォームデータベースツールです。",
  "language": "ja"
}
---
## 概要

DataGripは、JetBrains社のリレーショナルデータベースとNoSQLデータベースに対応した強力なクロスプラットフォームデータベースツールです。

Apache DorisはMySQLプロトコルとの高い互換性を持っています。DataGripのMySQLデータソースを使用してApache Dorisに接続し、内部カタログと外部カタログ内のデータをクエリできます。

## 前提条件

DataGripがインストール済み
www.jetbrains.com/datagrip/ にアクセスしてDataGripをダウンロードしてインストールできます

## データソースの追加

:::info Note
現在DataGripバージョン2023.3.4を使用して検証済み
:::

1. DataGripを起動
2. DataGripウィンドウの左上にあるプラス記号（**+**）アイコンをクリックし、MySQLデータソースを選択

    ![add data source](/images/datagrip1.png)

3. Doris接続の設定

    Data Sources and DriversウィンドウのGeneralタブで、以下の接続情報を設定します：

  - Host: DorisクラスタのFEホストIPアドレス
  - Port: DorisクラスタのFEクエリポート（例：9030）
  - Database: Dorisクラスタ内の対象データベース
  - User: Dorisクラスタへのログインに使用するユーザー名（例：admin）
  - Password: Dorisクラスタへのログインに使用するユーザーパスワード

    :::tip
    Databaseを使用して内部カタログと外部カタログを区別できます。Database名のみが入力されている場合、現在のデータソースはデフォルトで内部カタログに接続されます。catalog.dbの形式の場合、現在のデータソースはDatabaseに入力されたcatalogにデフォルトで接続され、DataGripに表示されるデータベースTableも接続されたcatalog内のデータベースTableになります。この方法により、DataGripのMySQLデータソースを使用して複数のDorisデータソースを作成し、Doris内の異なるCatalogを管理できます。
    :::

    :::info Note
    catalog.dbのDatabase形式を通じてDorisに接続された外部カタログを管理するには、Dorisバージョン2.1.0以上が必要です。
    :::

  - 内部カタログ

    ![connect 内部カタログ](/images/datagrip2.png)

  - 外部カタログ

    ![connect 外部カタログ](/images/datagrip3.png)

5. データソース接続のテスト

    接続情報を入力後、左下のTest Connectionをクリックしてデータベース接続情報の正確性を検証します。DBeaverが以下のポップアップウィンドウを表示した場合、テスト接続は成功です。右下のOKをクリックして接続設定を完了します。

   ![test connection](/images/datagrip4.png)

6. データベースへの接続

    データベース接続が確立された後、左側のデータベース接続ナビゲーションに作成されたデータソース接続が表示され、DataGripを通じてデータベースに接続し、管理できます。

   ![create connection](/images/datagrip5.png)

## 機能サポート

基本的にほとんどの視覚的表示操作、およびSQLコンソールでのSQL記述操作をサポートします。DorisはデータベースTableの作成、スキーマ変更、データの追加・削除・変更などの各種操作をサポートしていない、または検証されていません。
