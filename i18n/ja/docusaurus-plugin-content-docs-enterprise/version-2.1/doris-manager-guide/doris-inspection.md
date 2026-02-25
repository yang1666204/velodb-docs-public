---
{
  "title": "クラスター検査",
  "description": "Managerには、クラスタ/オペレーティングシステム情報を収集し、データ品質をチェックし、SQLパフォーマンスを分析する組み込みクラスタ検査機能が含まれています...",
  "language": "ja"
}
---
# Cluster Inspection

Managerには、クラスタ/オペレーティングシステム情報を収集し、データ品質をチェックし、SQLパフォーマンスを分析する組み込みのクラスタ検査機能が含まれています。

## クラスタ検査の開始

ナビゲーションバーの**Inspection**メニューに移動し、**Inspect Now**をクリックしてクラスタ検査を実行します。

![run-inspection](/images/enterprise/doris-manager-guide/doris-inspection/run-inspection.png)

検査の異常ステータスは3つのタイプに分類されます：

* **Execution Failed**: 実行が成功した結果を返さなかった場合で、権限、マシン環境設定、またはクラスタの可用性が原因の可能性があります。
* **Warning**: このステータスは、クラスタの正常な動作に大きな影響を与える可能性のある検査項目を示します。**View Suggestions**をクリックして修正方法を確認してください。
* **Tip**: このステータスは、クラスタの正常な動作に何らかの影響を与えたり、潜在的なリスクをもたらしたりする可能性のある検査項目を示します。**View Suggestions**をクリックして修正方法を確認してください。

さらに、検査レポートをPDFまたはMarkdownファイルとしてローカルマシンに**Export**することができます。

![export-inspection](/images/enterprise/doris-manager-guide/doris-inspection/export-inspection.png)

## スケジュール検査の有効化

検査機能はスケジュール検査をサポートしており、必要に応じて検査頻度と通知設定を構成することができます。

![regular-inspection](/images/enterprise/doris-manager-guide/doris-inspection/regular-inspection.png)

## カスタム検査の追加

Managerは、カスタムスクリプトを通じて検査項目機能の拡張をサポートしています。

1.  **`user-defined-tasks.json`スクリプトの変更**

    `webserver/inspection/script/user-defined-tasks.json`ファイルで検査項目のスクリプト拡張を追加します。

    例えば、以下は2つのカスタム検査項目`CheckBadTablet`と`CheckSwapOff`の追加を示しています：

    ```json
    {
      "tasks": [
        {
          "name": "CheckBadTablet",
          "source": "DORIS",
          "reason": "ensure tablets are all healthy.",
          "script": "CheckBadTablet.sh",
          "timeout": 600,
          "enabled": false
        },
        {
          "name": "CheckSwapOff",
          "source": "AGENT",
          "reason": "doris be requires swap off.",
          "script": "CheckSwapOff.sh",
          "timeout": 600,
          "enabled": true
        }
      ]
    }
    ```
パラメータについて以下に説明します：

    | Parameter | Meaning                                                                       |
    | :-------- | :---------------------------------------------------------------------------- |
    | `name`    | 検査名。検査レポートに表示されます。            |
    | `source`  | `DORIS`または`AGENT`のいずれかを指定できます。                                             |
    | `script`  | 検査スクリプト名。スクリプトが`webserver/inspection/script/`ディレクトリに配置されていることを確認してください。 |
    | `timeout` | スクリプト実行のタイムアウト時間（秒単位）。                                          |
    | `enabled` | スクリプトが有効かどうか。`true`は検査項目がアクティブであることを意味します。    |

2.  **カスタム検査スクリプトの変更**

    カスタムスクリプトを作成する際、Managerを実行するユーザーはスクリプトに対する実行権限を持つ必要があります。`agent_demo.sh`と`doris_demo.sh`のスクリプトテンプレートを参考にできます：

    * `agent_demo.sh`：各agentマシンでシェルコマンドを実行する`AGENT`タイプのスクリプト。
    * `doris_demo.sh`：DorisクラスターにSQLコマンドを送信する`DORIS`タイプのスクリプト。

3.  **検査の実行と結果の確認**

    カスタム検査項目を追加後、**Inspect Now**ボタンをクリックしてください。検査レポートの最後でカスタム検査の結果を確認できます。
