---
{
  "title": "DBeaver",
  "description": "DBeaverは、開発者、データベース管理者、アナリスト、およびデータを扱うすべての人のためのクロスプラットフォームデータベースツールです。",
  "language": "ja"
}
---
## introduce

DBeaver は、開発者、データベース管理者、アナリスト、およびデータを扱う全ての人のためのクロスプラットフォームデータベースツールです。

Apache Doris は MySQL プロトコルとの高い互換性を持っています。DBeaver の MySQL ドライバーを使用して Apache Doris に接続し、内部カタログ と 外部カタログ のデータをクエリできます。

## Preconditions

Dbeaver がインストール済み
https://dbeaver.io にアクセスして DBeaver をダウンロードおよびインストールできます

## Add data source

:::info Note
現在、DBeaver バージョン 24.0.0 を使用して検証済み
:::

1. DBeaver を起動します

2. DBeaver ウィンドウの左上隅にあるプラス記号（**+**）アイコンをクリックするか、メニューバーで **Database > New Database Connection** を選択して **Connect to a database** インターフェースを開きます。
   
    ![add connection 1](/images/dbeaver1.png)

    ![add connection 2](/images/dbeaver2.png)

3. MySQL ドライバーを選択します

    **Select your database** ウィンドウで、**MySQL** を選択します。

    ![chose driver](/images/dbeaver3.png)

4. Doris 接続を設定します

    **Connection Settings** ウィンドウの **main** タブで、以下の接続情報を設定します：

  - サーバー Host: Doris クラスターの FE ホスト IP アドレス
  - Port: Doris クラスターの FE クエリポート（例：9030）
  - Database: Doris クラスター内のターゲットデータベース
  - Username: Doris クラスターへのログインに使用するユーザー名（例：admin）
  - Password: Doris クラスターへのログインに使用するユーザーパスワード

   :::tip
   Database は 内部カタログ と 外部カタログ を区別するために使用できます。Database 名のみを入力した場合、現在のデータソースはデフォルトで 内部カタログ に接続されます。形式が catalog.db の場合、現在のデータソースはデフォルトで Database に入力された catalog に接続され、DBeaver に表示されるデータベースTableも接続された catalog 内のデータベースTableとなるため、DBeaver の MySQL ドライバーを使用して複数の Doris データソースを作成し、Doris 内の異なる Catalogs を管理できます。
   :::

   :::info Note
   catalog.db の Database 形式を通じて Doris に接続された 外部カタログ を管理するには、Doris バージョン 2.1.0 以上が必要です。
   :::

  - 内部カタログ
    ![connect 内部カタログ](/images/dbeaver4.png)
  - 外部カタログ
    ![connect 外部カタログ](/images/dbeaver5.png)

5. データソース接続をテストします

   接続情報を入力した後、左下の Test Connection をクリックしてデータベース接続情報の正確性を確認します。DBeaver は以下のダイアログボックスを返し、接続情報の設定を確認します。OK をクリックして設定された接続情報が正しいことを確認します。次に右下の Finish をクリックして接続設定を完了します。
   ![test connection](/images/dbeaver6.png)

6. データベースに接続します

   データベース接続が確立された後、左側のデータベース接続ナビゲーションで作成されたデータソース接続を確認でき、DBeaver を通じてデータベースに接続して管理できます。
   ![create connection](/images/dbeaver7.png)

## ファンクション support
- fully support
  - Visual viewing class
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
    - Operation class
      - SQL editor
      - SQL console
- basic support

    basic support 部分は、エラーなしでクリックして表示できることを意味しますが、プロトコル互換性の問題により、表示が不完全な場合があります。

  - Visual viewing class
    - dash board
    - Users/user/properties
    - Session Status
    - Global Status
- not support

  not support 部分は、DBeaver を使用して Doris を管理する際に、特定のビジュアル操作を実行するとエラーが報告される可能性があるか、一部のビジュアル操作が検証されていないことを意味します。
  データベースTableのビジュアル作成、schema change、データの追加・削除・変更などが含まれます。
