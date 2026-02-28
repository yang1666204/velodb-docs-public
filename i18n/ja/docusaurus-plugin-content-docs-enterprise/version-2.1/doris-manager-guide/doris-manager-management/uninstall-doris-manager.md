---
{
  "title": "アンインストールマネージャー",
  "description": "Managerをアンインストールすると、Managerの制御メタデータと監視情報が失われるため、注意して実行してください。",
  "language": "ja"
}
---
# Uninstall Manager

Managerをアンインストールすると、Managerの制御メタデータと監視情報が失われるため、慎重に進めてください。Managerをアンインストールしても、Dorisクラスターの正常な動作には影響しません。コマンドラインやその他の方法でDorisクラスターを管理することができます。

## ステップ 1: Non-WebServerサービスを停止する

左下のユーザー設定ページで「Service 構成」をクリックし、「Services」メニューを選択して、すべてのサービスを停止します。

![component-config](/images/enterprise/doris-manager-guide/doris-manager-management/uninstall-doris-manager/stop-service.png)

## ステップ 2: WebServerサービスを停止する

1.  **WebServerサービスを停止する**

    managerのデプロイメントディレクトリに移動します。以下のコマンドを実行した後、インストールパスを削除できます：

    ```sql
    webserver/bin/stop.sh
    ```
2.  **ノード上のAgentを停止**

    Agentのインストールディレクトリで、以下のコマンドを実行してインストールパスを削除します：

    ```sql
    bin/stop.sh
    ```
