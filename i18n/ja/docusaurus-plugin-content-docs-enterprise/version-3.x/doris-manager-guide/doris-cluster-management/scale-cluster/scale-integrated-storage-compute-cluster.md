---
{
  "title": "Compute-Storage統合クラスターのスケールアウト/イン",
  "description": "Managerはクラスターのスケールアウトとスケールインをサポートしています。これらの操作は、クラスターページの「Cluster Scale」をクリックすることで実行できます。",
  "language": "ja"
}
---
# Scale Out/In Compute-Storage Integrated Cluster

Managerはクラスターのスケールアウトとスケールインをサポートしています。これらの操作は、クラスターページの「Cluster Scale」をクリックして実行できます。

## 注意事項

## Scale Out FE

**ステップ 1: Add Hosts**

「Cluster Scale」ボタンをクリックし、「Scale Out FE Node」を選択します。

クラスターページで「Add Node」を選択した後、IPドロップダウンボックスから「Add Host」を選択します。複数のホストを追加できます。

![add-new-agent-integrated](./assets/scale-integrated-storage-compute-cluster/add-new-agent-integrated.png)

**ステップ 2: Deploy エージェント for Hosts**

プロンプトに従って、ホスト用のagentサービスをインストールします。すべてのホストのAgentステータスが正常であることを確認してください。

![register-agent-integrated](./assets/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**ステップ 3: Add FE Nodes**

追加するホストを選択し、FEノードのロールを選択します。この例では、3つの高可用性Followerノードが既に存在しているため、新しいFEのロールとして「Observer」を選択します。

![add-fe-integrated](./assets/scale-integrated-storage-compute-cluster/add-fe-integrated.png)

## Scale In FE

「Cluster Scale」ボタンをクリックし、「Scale In FE Node」を選択して、廃止するノードを選択します。例えば、この例では、廃止対象としてObserverノードが選択されています。

![scale-in-fe-integrated](./assets/scale-integrated-storage-compute-cluster/scale-in-fe-integrated.png)

## Scale Out BE

**ステップ 1: Add Hosts**

「Cluster Scale」ボタンをクリックし、「Scale Out BE Node」を選択します。

クラスターページで「Add Node」を選択した後、IPドロップダウンボックスから「Add Host」を選択します。複数のホストを追加できます。

![add-new-benode-integrated](./assets/scale-integrated-storage-compute-cluster/add-new-benode-integrated.png)

**ステップ 2: Deploy エージェント for Hosts**

プロンプトに従って、ホスト用のagentサービスをインストールします。すべてのホストのAgentステータスが正常であることを確認してください。

![register-agent-integrated](./assets/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**ステップ 3: Add BE Nodes**

追加するホストを選択します。BEノードは標準ノードまたはcomputeノードとして登録できます。

![chose-new-be-node-integrated](./assets/scale-integrated-storage-compute-cluster/chose-new-be-node-integrated.png)

## Scale In BE

「Cluster Scale」ボタンをクリックし、「Scale In BE Node」を選択して、廃止するノードを選択します。

![scale-in-be-integrated](./assets/scale-integrated-storage-compute-cluster/scale-in-be-integrated.png)
