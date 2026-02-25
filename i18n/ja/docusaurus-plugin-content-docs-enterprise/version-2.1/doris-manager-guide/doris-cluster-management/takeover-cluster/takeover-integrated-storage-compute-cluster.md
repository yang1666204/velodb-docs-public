---
{
  "title": "Compute-Storage統合クラスターの引き継ぎ",
  "description": "Manager は既にデプロイされた Doris クラスターを管理することができます。",
  "language": "ja"
}
---
# Compute-Storage統合クラスターの引き継ぎ

Managerは既にデプロイされたDorisクラスターを管理することができます。引き継ぎ後、Managerプラットフォームを通じて監視、スケーリング、再起動などのクラスター操作を実行できます。

## ステップ1：環境設定

![config-env-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/takeover-cluster/takeover-integrated-storage-compute-cluster/config-env-integrated.png)

クラスターを引き継ぐ際、利用可能な任意のFEの情報とクラスターのrootユーザーパスワードを提供する必要があります。

:::tip
注意：

FE proxyを有効にする必要がある場合は、設定メニューでFE代表IPとFE proxyアドレスを入力する必要があります。

:::

## ステップ2：ノード設定

ノードを設定する際、クラスターノードとAgentのステータスが正常であることを確認してください。Agentインストールのガイドを参照できます。

ステータスが正常であることを確認した後、「Take Over Cluster」をクリックしてください。

:::tip

注意：

クラスター引き継ぎ時に「auto-start」機能を選択する場合、まずクラスターの以前の自動起動管理（例：systemdまたはsupervisor）を無効にする必要があります。その後、Managerが自動起動管理を引き継ぎ、競合を防止します。

:::

![install-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/takeover-cluster/takeover-integrated-storage-compute-cluster/install-agent-integrated.png)
