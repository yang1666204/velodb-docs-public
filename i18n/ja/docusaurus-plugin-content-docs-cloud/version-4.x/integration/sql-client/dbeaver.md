---
{
  "title": "DBeaver",
  "description": "DBeaverは、開発者、データベース管理者、アナリスト、およびデータを扱うすべての人のためのクロスプラットフォームデータベースツールです。",
  "language": "ja"
}
---
# DBeaver

## 紹介

DBeaverは、開発者、データベース管理者、アナリスト、そしてデータを扱うすべての人のためのクロスプラットフォームデータベースツールです。

Apache DorisはMySQLプロトコルとの高い互換性を持ちます。DBeaverのMySQLドライバーを使用してApache Dorisに接続し、内部カタログおよび外部カタログのデータをクエリできます。

## 前提条件

Dbeaverがインストールされていること
https://dbeaver.io にアクセスしてDBeaverをダウンロード・インストールできます

## データソースの追加

:::info Note
現在DBeaver version 24.0.0を使用して検証済み
:::

1. DBeaverを起動

2. DBeaverウィンドウの左上にあるプラス記号（**+**）アイコンをクリックするか、メニューバーで**Database > New Database Connection**を選択して**Connect to a database**インターフェースを開きます。
   
    ![add connection 1](/images/cloud/integration/sql-client/dbeaver1.png)

    ![add connection 2](/images/cloud/integration/sql-client/dbeaver2.png)

3. MySQLドライバーを選択

    **Select your database**ウィンドウで**MySQL**を選択します。

    ![chose driver](/images/cloud/integration/sql-client/dbeaver3.png)

4. Doris接続の設定

    **Connection Settings**ウィンドウの**main**タブで、以下の接続情報を設定します：

  - サーバー Host: DorisクラスターのFE host IPアドレス。
  - Port: Dorisクラスターのfeクエリポート（例：9030）。
  - Database: Dorisクラスター内のターゲットデータベース。
  - Username: Dorisクラスターへのログインに使用するユーザー名（例：admin）。
  - Password: Dorisクラスターへのログインに使用するユーザーパスワード。

   :::tip
   Databaseは内部カタログと外部カタログを区別するために使用できます。Database名のみ入力した場合、現在のデータソースはデフォルトで内部カタログに接続されます。catalog.db形式の場合、現在のデータソースはデフォルトでDatabaseに入力されたcatalogに接続され、DBeaverで表示されるデータベースTableも接続されたcatalog内のデータベースTableになります。そのため、DBeaverのMySQLドライバーを使用して複数のDorisデータソースを作成し、Doris内の異なるCatalogを管理できます。
   :::

   :::info Note
   catalog.dbのDatabse形式を通じてDorisに接続された外部カタログを管理するには、Doris version 2.1.0以上が必要です。
   :::

  - 内部カタログ
    ![connect 内部カタログ](/images/cloud/integration/sql-client/dbeaver4.png)
  - 外部カタログ
    ![connect 外部カタログ](/images/cloud/integration/sql-client/dbeaver5.png)

5. データソース接続のテスト

   接続情報を入力した後、左下のTest Connectionをクリックしてデータベース接続情報の正確性を検証します。DBeaverは以下のダイアログボックスを返し、接続情報の設定を確認します。OKをクリックして設定された接続情報が正しいことを確認します。その後、右下のFinishをクリックして接続設定を完了します。
   ![test connection](/images/cloud/integration/sql-client/dbeaver6.png)

6. データベースへの接続

   データベース接続が確立された後、左側のデータベース接続ナビゲーションで作成されたデータソース接続を確認でき、DBeaverを通じてデータベースに接続し管理できます。
   ![create connection](/images/cloud/integration/sql-client/dbeaver7.png)

## 機能サポート
- 完全サポート
  - ビジュアル表示クラス
    - Databases
      - Tables
      - Views
    - Users
      - Administer
    - Session Manager
    - システム Info
      - Session Variables
      - Global Variables
      - Engines
      - Charsets
      - User Priviages
      - Plugin
    - 操作クラス
      - SQL editor
      - SQL console
- 基本サポート

    基本サポート部分は、エラーなしでクリックして表示できることを意味しますが、プロトコル互換性の問題により、表示が不完全な場合があります。

  - ビジュアル表示クラス
    - dash board
    - Users/user/properties
    - Session Status
    - Global Status
- サポートなし

  サポートされていない部分は、DBeaverを使用してDorisを管理する際に、特定のビジュアル操作を実行するとエラーが報告される可能性があること、または一部のビジュアル操作が検証されていないことを意味します。
  例：データベースTableのビジュアル作成、schema change、データの追加・削除・変更など。
