---
{
  "title": "Compute-Storage統合クラスタのスケールアウト/イン",
  "description": "Managerはクラスターのスケールアウトとスケールインをサポートしています。これらの操作は、クラスターページの「Cluster Scale」をクリックすることで実行できます。",
  "language": "ja"
}
---
# Scale Out/In Compute-Storage Integrated Cluster

Managerはクラスターのスケールアウトおよびスケールインをサポートしています。これらの操作は、クラスターページの「Cluster Scale」をクリックすることで実行できます。

## 注意事項

## Scale Out FE

**ステップ1: ホストを追加する**

「Cluster Scale」ボタンをクリックし、「Scale Out FE Node」を選択します。

クラスターページで「Add Node」を選択した後、IPドロップダウンボックスから「Add Host」を選択します。複数のホストを追加できます。

![add-new-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-new-agent-integrated.png)

**ステップ2: ホストにAgentをデプロイする**

表示される手順に従って、ホストにagentサービスをインストールします。すべてのホストのAgent状態が正常であることを確認してください。

![register-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**ステップ3: FEノードを追加する**

追加するホストを選択し、FEノードのロールを選択します。この例では、3つの高可用性Followerノードが既に存在するため、新しいFEのロールとして「Observer」を選択します。

![add-fe-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-fe-integrated.png)

## Scale In FE

「Cluster Scale」ボタンをクリックし、「Scale In FE Node」を選択して、削除するノードを選択します。例えば、この例では、削除対象としてObserverノードが選択されています。

![scale-in-fe-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/scale-in-fe-integrated.png)

## Scale Out BE

**ステップ1: ホストを追加する**

「Cluster Scale」ボタンをクリックし、「Scale Out BE Node」を選択します。

クラスターページで「Add Node」を選択した後、IPドロップダウンボックスから「Add Host」を選択します。複数のホストを追加できます。

![add-new-benode-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-new-benode-integrated.png)

**ステップ2: ホストにAgentをデプロイする**

表示される手順に従って、ホストにagentサービスをインストールします。すべてのホストのAgent状態が正常であることを確認してください。

![register-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**ステップ3: BEノードを追加する**

追加するホストを選択します。BEノードは標準ノードまたはcomputeノードとして登録できます。

![chose-new-be-node-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/chose-new-be-node-integrated.png)

## Scale In BE

「Cluster Scale」ボタンをクリックし、「Scale In BE Node」を選択して、削除するノードを選択します。

![scale-in-be-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/scale-in-be-integrated.png)
