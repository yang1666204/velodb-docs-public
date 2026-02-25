---
{
    "title": "Doris Cluster Alerts",
    "description": "In the alert module, you can configure alert policies. Select \"Create New Alert Policy\" to create alert items based on your business needs."
}
---

# Doris Cluster Alerts

## Cluster Alert Items

In the alert module, you can configure alert policies. Select "Create New Alert Policy" to create alert items based on your business needs. As shown in the image below, an alert policy for FE has been created; if an FE goes down, an alert notification will be sent.

![alert-policy](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-policy.png)

## Configure Notification Delivery

Alert rules can be configured to send notifications via in-site notifications, email, IM tools, or Webhook.

When using IM tools like WeChat Work, DingTalk, or Feishu, ensure connectivity to the public network.

### In-site Notifications

1.  **Select In-site Alert**

    In-site notifications will push alert information within the alert notifications. You need to select the in-site push users.
    ![internal-alert](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/internal-alert.png)

2.  **View In-site Alerts**

    When an alert occurs, you can view the alert information in the notification menu at the bottom left.
    ![check-internal-alert](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/check-internal-alert.png)

### Email

1.  **Configure Email Alerts**

    In the user menu, select "Service Configuration" to enter the configuration menu. Configure the email alert information.

    ![alert-mail-config](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-mail-config.png)

2.  **Select Email Notification**

    Select "Email Notification" as the method and fill in the email addresses of the users who should receive alerts.

    ![alert-mail](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/alert-mail.png)

### WeChat Work

1.  **Create a WeChat Work Group and Add a Bot**

    As shown in the image below, add a WeChat Work bot:

    ![add-wechat-robot](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-wechat-robot.png)

2.  **Copy Bot Webhook**

    ![copy-wechat-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-wechat-webhook.png)

3.  **Add Bot Webhook in Manager**

    ![paste-wechat-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-wechat-webhook.png)

### DingTalk

1.  **Create a DingTalk Group and Add a Group Bot**

    As shown in the image below, create a DingTalk group bot in the group settings:

    ![add-dingding-robot](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-dingding-robot.png)

2.  **Select "Add Webhook Type Bot"**

    ![chose-dingdign-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/chose-dingdign-webhook.png)

3.  **Add Keywords for the Bot**

    DingTalk bots require both "Alert" and "告警" (alarm/alert in Chinese) keywords to be added, otherwise, alerts will not be received.

    ![add-robot-label](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/add-robot-label.png)

4.  **Copy DingTalk Bot Webhook**

    ![copy-dingding-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-dingding-webhook.png)

5.  **Configure DingTalk Bot Webhook for Manager**

    ![paste-dingding-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-dingding-webhook.png)

### Feishu

1.  **Create a Feishu Group and Add a Bot**

    In the Feishu group, select "Custom Bot":

2.  **Copy Webhook Address**

    ![copy-feishu-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/copy-feishu-webhook.png)

3.  **Configure Feishu Bot Webhook for Manager Alerts**

    ![paste-feishu-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/paste-feishu-webhook.png)

### Webhook

The Webhook method allows users to define a custom API and provide its full URL to Manager. Manager then sends alerts to this API, and the user's API can perform any other processing upon receiving the alert.

![customer-webhook](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-alert/customer-webhook.png)

The body content sent by Manager to the user's API is as follows:

```json
{
    "alertContent":"[cluster_guide]testrule1\nTime: 2023-12-15 17:32:56\nCluster: cluster_guide\nRule Name: testrule1\nAlert Content: FE Alive less than 50.0\n",
    "alertInfo":"FE Alive less than 50.0",
    "alertName":"testrule1",
    "cluster":"cluster_guide",
    "time":"2023-12-15 17:32:56"
}
```