---
{
  "title": "Compute-Storage統合クラスターのアップグレード",
  "description": "Managerはクラスターのアップグレードをサポートし、2つのアップグレードモードを提供します：完全ダウンタイムアップグレードとオンラインローリングアップグレードです。",
  "language": "ja"
}
---
# Compute-Storage Integrated Clusterのアップグレード

Managerはクラスターのアップグレードをサポートし、完全停止アップグレードとオンラインローリングアップグレードの2つのアップグレードモードを提供します。クラスターページで、右上のドロップダウンメニューから**Cluster Upgrade**をクリックし、対象のアップグレードバージョンとアップグレードモードを選択して、クラスターアップグレード操作を実行します。

## アップグレード時の注意事項

* 完全アップグレード中は、データのバックアップを選択できます。クラスターに大量のデータがある場合、バックアップに長時間を要し、その間サービスが利用できなくなります。
* ローリングアップグレード中はデータをバックアップできません。ローリングアップグレードは2桁バージョンにはロールバックできませんが、3桁バージョンにはロールバックできます。

## ステップ1: Upgrade Clusterをクリック

**Cluster - Nodes**ページで、右上のドロップダウンメニューから"Cluster Upgrade"を選択します。

![upgrade-cluster-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/upgrade-cluster-integrated.png)

## ステップ2: アップグレードモードの選択

![chose-upgrade-type-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/chose-upgrade-type-integrated.png)

クラスターをアップグレードする際、完全停止アップグレードとオンラインローリングアップグレードから選択できます：

| アップグレード方法      | クラスター可用性                                                 | ロールバックサポート                  |
| :------------------ | :------------------------------------------------------------------- | :-------------------------------- |
| 完全停止アップグレード | クラスターが利用不可                                               | データバックアップをサポート；バックアップ後にロールバック可能 |
| オンラインローリングアップグレード | クラスターは利用可能だが、ローリング再起動中のノードで読み書きリクエストが失敗し、アプリケーションクライアントでの再試行が必要 | データバックアップをサポートしない；ロールバック不可  |

データバックアップが選択された場合、FEまたはBEルートディレクトリ下の`upgrade`ディレクトリに保存されます。このディレクトリは、クラスターが正常にアップグレードされたことを確認した後に削除できます。

## ステップ3: アップグレードの検証

**完全停止アップグレードの検証**

完全停止アップグレードはロールバックをサポートします。完全停止アップグレード後、完了したクラスターを確認でき、異常が見つかった場合はロールバック操作を実行できます。

![full-upgrade-review-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/full-upgrade-review-integrated.png)

**オンラインローリングアップグレードの検証**

オンラインローリングアップグレード中は、まず単一ノードをアップグレードできます。単一ノードのアップグレードが完了した後、残りのすべてのノードのローリングアップグレードを実行できます。

![rollup-upgrade-reivew-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/rollup-upgrade-reivew-integrated.png)
