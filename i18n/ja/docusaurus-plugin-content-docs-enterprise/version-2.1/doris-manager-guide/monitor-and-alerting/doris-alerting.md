---
{
  "title": "Dorisクラスタアラート",
  "description": "アラートモジュールでは、アラートポリシーを設定できます。ビジネスニーズに基づいてアラート項目を作成するには、「Create New Alert Policy」を選択してください。",
  "language": "ja"
}
---
# Doris Cluster Alerts

## Cluster Alert Items

アラートモジュールでは、アラートポリシーを設定できます。「Create New Alert Policy」を選択して、ビジネスニーズに基づいてアラート項目を作成します。下の画像に示すように、FE用のアラートポリシーが作成されています。FEがダウンした場合、アラート通知が送信されます。

![alert-policy](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-policy.png)

## 通知配信の設定

アラートルールは、サイト内通知、メール、IMツール、またはWebhookを介して通知を送信するように設定できます。

WeChat Work、DingTalk、FeishuなどのIMツールを使用する場合は、パブリックネットワークへの接続を確保してください。

### サイト内通知

1.  **In-site Alertを選択**

    サイト内通知は、アラート通知内でアラート情報をプッシュします。サイト内プッシュユーザーを選択する必要があります。
    ![internal-alert](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/internal-alert.png)

2.  **サイト内アラートの表示**

    アラートが発生した場合、左下の通知メニューでアラート情報を確認できます。
    ![check-internal-alert](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/check-internal-alert.png)

### Email

1.  **Emailアラートの設定**

    ユーザーメニューで「Service 構成」を選択して設定メニューに入ります。メールアラート情報を設定します。

    ![alert-mail-config](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-mail-config.png)

2.  **Email通知の選択**

    方法として「Email Notification」を選択し、アラートを受信するユーザーのメールアドレスを入力します。

    ![alert-mail](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-mail.png)

### WeChat Work

1.  **WeChat Workグループを作成してBotを追加**

    下の画像に示すように、WeChat Work botを追加します：

    ![add-wechat-robot](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-wechat-robot.png)

2.  **Bot Webhookをコピー**

    ![copy-wechat-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-wechat-webhook.png)

3.  **ManagerにBot Webhookを追加**

    ![paste-wechat-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-wechat-webhook.png)

### DingTalk

1.  **DingTalkグループを作成してグループBotを追加**

    下の画像に示すように、グループ設定でDingTalkグループbotを作成します：

    ![add-dingding-robot](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-dingding-robot.png)

2.  **「Add Webhook タイプ Bot」を選択**

    ![chose-dingdign-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/chose-dingdign-webhook.png)

3.  **Botのキーワードを追加**

    DingTalk botは「Alert」と「告警」の両方のキーワードを追加する必要があります。そうでなければ、アラートを受信できません。

    ![add-robot-label](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-robot-label.png)

4.  **DingTalk Bot Webhookをコピー**

    ![copy-dingding-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-dingding-webhook.png)

5.  **ManagerのDingTalk Bot Webhookを設定**

    ![paste-dingding-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-dingding-webhook.png)

### Feishu

1.  **Feishuグループを作成してBotを追加**

    Feishuグループで「Custom Bot」を選択します：

2.  **Webhookアドレスをコピー**

    ![copy-feishu-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-feishu-webhook.png)

3.  **ManagerアラートのFeishu Bot Webhookを設定**

    ![paste-feishu-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-feishu-webhook.png)

### Webhook

Webhook方法により、ユーザーはカスタムAPIを定義し、その完全なURLをManagerに提供できます。その後、ManagerはこのAPIにアラートを送信し、ユーザーのAPIはアラートを受信時に他の処理を実行できます。

![customer-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/customer-webhook.png)

ManagerがユーザーのAPIに送信するbody内容は以下のとおりです：

```json
{
    "alertContent":"[cluster_guide]testrule1\nTime: 2023-12-15 17:32:56\nCluster: cluster_guide\nRule Name: testrule1\nAlert Content: FE Alive less than 50.0\n",
    "alertInfo":"FE Alive less than 50.0",
    "alertName":"testrule1",
    "cluster":"cluster_guide",
    "time":"2023-12-15 17:32:56"
}
```
