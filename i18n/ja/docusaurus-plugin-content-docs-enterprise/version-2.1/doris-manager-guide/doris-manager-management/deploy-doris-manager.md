---
{
  "title": "Manager のデプロイ",
  "description": "Manager インストールパッケージを展開します。",
  "language": "ja"
}
---
# Managerのデプロイ

## ステップ1: インストールパッケージのダウンロード

Managerインストールパッケージを展開します。

パッケージのディレクトリ構造は以下の通りです：

```shell
├── agent        ## anget directory
│   ├── install.sh                              
│   ├── manager-agent-24.2.0-x64-bin.tar.gz     
│   └── validation.sh                           
├── deps        ## Third-Party Dependency Directory
│   ├── alertmanager                            
│   ├── foundationdb-7.1.38.tar.gz
│   ├── grafana
│   ├── jdk
│   ├── jdk17
│   ├── prometheus
│   └── webui
├── LICENSE
└── webserver    ## WebServer directory 
    ├── bin
    ├── conf
    ├── config-tool
    ├── inspection
    ├── lib
    └── static

```
## Step 2: WebServerコンポーネントの起動

1. **インストールディレクトリの変更**

   適切なインストールディレクトリを選択してください。この例では、展開されたパッケージを /opt/doris/manager に移動します：

   ```sql
   mv ./doris-manager-24.2.0-x64-bin /opt/doris/manager
   ```
2. **WebServerサービスの設定（オプション）**

   `webserver/conf/manager.conf`ファイルを変更してWebServerサービスを設定します。設定パラメータは以下の通りです：

   | パラメータ                          | デフォルト | 説明                                                                 |
   | ---------------------------------- | ------- | --------------------------------------------------------------------------- |
   | MANAGER_PORT                       | 8004    | Manager Webサービスコンポーネントのポート                                |
   | DB_TYPE                            | h2      | サポートされるデータベースタイプ：mysql、h2、またはpostgresql                          |
   | DATA_PATH                          | ../data | Managerメタデータ格納パス（DB_TYPEがh2の場合のみ有効）           |
   | DB_HOST                            | -       | データベースアクセスアドレス（mysql/postgresqlの場合のみ有効）               |
   | DB_PORT                            | -       | データベースアクセスポート（mysql/postgresqlの場合のみ有効）                 |
   | DB_USER                            | -       | データベースアクセスユーザー名（mysql/postgresqlの場合のみ有効）             |
   | DB_PASS                            | -       | データベースアクセスパスワード（mysql/postgresqlの場合のみ有効）             |
   | DB_DBNAME                          | -       | データベース名（mysql/postgresqlの場合のみ有効）                        |
   | DB_URL_SUFFIX                      | -       | MySQLデータベース接続URL接尾辞                                       |
   | HTTP_CONNECT_TIMEOUT               | 30      | HTTPハンドシェイクタイムアウト（秒）                                        |
   | HTTP_SOCKET_TIMEOUT                | 60      | HTTPレスポンス受信タイムアウト（秒）                                 |
   | LISTEN_PROTOCOL                    | ALL     | サービスリッスン用IPプロトコル：ALL、IPV4、またはIPV6（ALLは両方を意味する）      |
   | FE_MIN_DISK_SPACE_FOR_UPGRADE      | 10      | アップグレード時のFEモジュールインストールパスに必要な最小空きディスク容量（GB） |
   | BE_MIN_DISK_SPACE_FOR_UPGRADE      | 10      | アップグレード時のBEモジュールインストールパスに必要な最小空きディスク容量（GB） |

3. **WebServerサービスの開始**

   以下のコマンドを使用してWebServerサービスを開始します。開始後、MANAGER_PORTのステータス（デフォルトは8004）を確認してください：

   ```sql
   webserver/bin/start.sh
   ```
## ステップ 3: WebServer 経由でManager を起動

ブラウザで http://{webserver-ip}:{manager-port} を開いて WebServer サービスにアクセスします。

1.  **Manager 管理者アカウントの初期化**

    ウェブサービスに初回アクセスする際、ユーザー初期化ページが表示されます。ここで最初の Manager 管理者ユーザーを作成します。

    Manager 管理者アカウントはクラスターアカウントとは独立しており、Manager のアクセス制御にのみ使用されます。

2.  **サービスコンポーネント配備情報の設定**

    以下のページでサービス情報を設定できます：

    ![component-config](/images/enterprise/doris-manager-guide/doris-manager-management/deploy-doris-manager/component-config.png)

    設定の説明は以下の通りです：

    | 設定項目           | 説明                                                                                                                                                                                                                                                                |
    | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Monitoring and Alerting Service | オプション。Manager の監視およびアラートモジュールを設定するために使用されます。これにより Grafana、Prometheus、Alertmanager がインストールされます。Manager がインストールされているマシンで利用可能な3つのポートを選択する必要があります。                                                              |
    | Email Alerting          | メールサーバーを設定します。設定後、アラートに「Email Alerting」チャネルを使用できるようになります。                                                                                                                                                                                            |
    | Proxy Configuration     | 本番環境が外部ネットワークから分離されている場合、パブリックオフィス通信ソフトウェアに通知を送信するためのプロキシを設定できます。                                                                                                                             |
    | Installation Package Configuration | Doris Core と Manager のインストールパッケージのローカルストレージパスを設定します。新しいクラスターの作成と既存クラスターのアップグレードに使用されます。 |
