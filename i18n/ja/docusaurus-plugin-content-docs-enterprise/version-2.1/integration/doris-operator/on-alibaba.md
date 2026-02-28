---
{
  "title": "Alibaba Cloud に関する推奨事項",
  "description": "Alibaba Cloud Container Service ACKは、ECSインスタンスを購入した後のマネージド型コンテナ化サービスです。",
  "language": "ja"
}
---
## Alibaba ACK  

Alibaba Cloud Container Service ACKは、ECSインスタンスを購入後のマネージドコンテナ化サービスであり、関連するシステムパラメータを調整するための完全なアクセス制御権限を取得できます。インスタンスイメージとして Alibaba Cloud Linux 3 を使用します。現在のシステムパラメータはDorisの実行要件を完全に満たしています。要件を満たさないものについても、K8s privilegedモードを通じてコンテナ内で修正し、安定した動作を保証できます。  
**Alibaba Cloud ACKクラスターは、Doris Operatorを使用してデプロイされ、ほとんどの環境要件はECSのデフォルト設定で満たすことができます。満たされない場合、Doris Operatorが自動で修正できます**。ユーザーは以下のように手動で修正することも可能です：

### 既存クラスター

Container Serviceクラスターがすでに作成されている場合、このドキュメントを参照して変更できます：Cluster Environment OS Checking      
BE起動パラメータ要件に注目してください：  
1. swapの無効化と停止：有効でない場合、`swapon --show`は出力されません
2. システムでの開けるファイルハンドルの最大数の確認 `ulimit -n`
3. 仮想メモリ領域数の確認と変更 `sysctl vm.max_map_count`
4. transparent huge pagesが閉じられているかどうか `cat /sys/kernel/mm/transparent_hugepage/enabled` にneverが含まれているか  
   対応するパラメータのデフォルト値は以下の通りです：

  ```shell
  [root@iZj6c12a1czxk5oer9rbp8Z ~]# swapon --show
  [root@iZj6c12a1czxk5oer9rbp8Z ~]# ulimit -n
  65535
  [root@iZj6c12a1czxk5oer9rbp8Z ~]# sysctl vm.max_map_count
  vm.max_map_count = 262144
  [root@iZj6c12a1czxk5oer9rbp8Z ~]# cat /sys/kernel/mm/transparent_hugepage/enabled
  [always] madvise never
  ```  
### 新しいクラスターの作成

クラスターが購入・作成されていない場合は、Alibaba Cloud Container Service ACKコンソールで「Create Cluster」をクリックして購入できます。必要に応じて設定を調整できます。上記のパラメータは、クラスター作成の「Node Pool 構成」ステップの「Instance Pre-customized Data」でシステム調整スクリプトに追加できます。
クラスターが開始された後、ノードを再起動して設定を完了します。参考スクリプトは以下の通りです：

```shell
#!/bin/bash
chmod +x /etc/rc.d/rc.local
echo "sudo systemctl stop firewalld.service" >> /etc/rc.d/rc.local
echo "sudo systemctl disable firewalld.service" >> /etc/rc.d/rc.local
echo "sysctl -w vm.max_map_count=2000000" >> /etc/rc.d/rc.local
echo "swapoff -a" >> /etc/rc.d/rc.local
current_limit=$(ulimit -n)
desired_limit=1000000
config_file="/etc/security/limits.conf"
 if [ "$current_limit" -ne "$desired_limit" ]; then
    echo "* soft nofile 1000000" >> "$config_file"
    echo "* hard nofile 1000000" >> "$config_file"
fi
```
## Alibaba ACS

ACSサービスは、K8sをユーザーインターフェースとして使用してコンテナコンピューティングリソースを提供するクラウドコンピューティングサービスで、オンデマンドで課金される弾性コンピューティングリソースを提供します。上記のACKとは異なり、ECSの具体的な使用に注意を払う必要はありません。
ACSを使用する際は、以下の点に注意してください：

### イメージリポジトリ

ACSを使用する場合、対応するAlibaba [Container Registry](https://www.alibabacloud.com/en/product/container-registry)(ACR)の使用を推奨します。個人版とエンタープライズ版は必要に応じて有効にしてください。

ACRとイメージ転送環境を設定した後、Dorisが提供する公式イメージを対応するACRに移行する必要があります。

プライベートACRを使用して認証を有効にする場合は、以下の手順を参照してください：

1. イメージウェアハウスにアクセスするための認証情報を設定するために、`docker-registry`タイプの`secret`を事前に設定する必要があります。

  ```shell
  kubectl create secret docker-registry image-hub-secret --docker-server={your-server} --docker-username={your-username} --docker-password={your-pwd}
  ```
2. 上記の手順を使用してDCR上でシークレットを設定します：

  ```yaml
  spec:
    feSpec:
      replicas: 1
      image: crpi-4q6quaxa0ta96k7h-vpc.cn-hongkong.personal.cr.aliyuncs.com/selectdb-test/doris.fe-ubuntu:3.0.3
      imagePullSecrets:
      - name: image-hub-secret
    beSpec:
      replicas: 3
      image: crpi-4q6quaxa0ta96k7h-vpc.cn-hongkong.personal.cr.aliyuncs.com/selectdb-test/doris.be-ubuntu:3.0.3
      imagePullSecrets:
      - name: image-hub-secret
      systemInitialization:
        initImage: crpi-4q6quaxa0ta96k7h-vpc.cn-hongkong.personal.cr.aliyuncs.com/selectdb-test/alpine:latest
  ```
### BE systemInitialization  

現在、Alibaba Cloudはフルマネージドなサービスでの特権モードを有効にする機能を段階的に提供しています（一部のリージョンではまだ有効になっていない場合があり、ワークオーダーを提出して機能を有効にするよう申請することができます）。  
Doris BEノードの起動には、仮想メモリエリアの数を変更する`sysctl -w vm.max_map_count=2000000`などの特別な環境パラメータが必要です。  
コンテナ内でこのパラメータを設定するにはホスト設定の変更が必要なため、通常のK8sクラスタではpodで特権モードを有効にする必要があります。Operatorは`systemInitialization`を通じてBE podに`InitContainer`を追加し、このような操作を実行します。

:::tip Tip  
**現在のクラスタが特権モードを使用できない場合、BEノードを起動することができません**。ACKコンテナサービス + ホストを選択してクラスタをデプロイすることができます。
:::

### Service

ACSサービスはK8sをユーザーインターフェースとして使用してコンテナコンピューティングリソースを提供するクラウドコンピューティングサービスであり、コンピューティングリソースを提供します。そのノードは仮想コンピューティングリソースであり、ユーザーが注意を払う必要はありません。使用したリソース量に応じて課金され、無限に拡張できます。つまり、従来のノードの物理的な概念は存在しません：

```shell  
$ kubectl get nodes
NAME                            STATUS   ROLES   AGE   VERSION
virtual-kubelet-cn-hongkong-d   Ready    agent   27h   v1.31.1-aliyun.1
```
したがって、Dorisクラスターをデプロイする際、serviceTypeはNodePortモードを無効にし、ClusterIPおよびLBモードの使用を許可します。

- ClusterIPモード：

  ClusterIPモードはOperatorのデフォルトのネットワークモードです。具体的な使用方法とアクセス方法については、[このドキュメント](https://kubernetes.io/docs/concepts/services-networking/service/#type-clusterip)を参照してください

- ロードバランシングモード：

  以下のように設定できます：

  - Operatorによって提供されるDCRサービスannotationsを通じてLBアクセスを設定します。手順は以下の通りです：
    1. ロードバランシングコンソールを通じてCLBまたはNLBインスタンスが作成済みで、そのインスタンスがACKクラスターと同じリージョンにあること。まだ作成していない場合は、[CLBインスタンスの作成と管理](https://www.alibabacloud.com/help/en/slb/classic-load-balancer/user-guide/create-and-manage-a-clb-instance)および[NLBインスタンスの作成と管理](https://www.alibabacloud.com/help/en/slb/network-load-balancer/user-guide/create-and-manage-an-nlb-instance)を参照してください。
    2. DCR設定を通じて、上記のLBのアクセスannotationsは以下の形式になります：

      ```yaml
        feSpec:
          replicas: 3
          image: crpi-4q6quaxa0ta96k7h-vpc.cn-hongkong.personal.cr.aliyuncs.com/selectdb-test/doris.fe-ubuntu:3.0.3
          service:
            type: LoadBalancer
            annotations:
              service.beta.kubernetes.io/alibaba-cloud-loadbalancer-address-type: "intranet"
      ```  
- ACS コンソールを通じてLBサービスをホストし、FEまたはBEの対応するリソース制御にバインドされたstatefulsetサービスを生成する  
    手順は以下の通りです：
    1. serviceTypeはClusterIP（デフォルトポリシー）
    2. Alibaba Cloudコンソールインターフェースを通じて負荷分散サービスを作成できます：Container Compute Service ACS -> Cluster List -> Cluster -> Service、`Create`ボタンを使用します。
    3. `service`を作成するインターフェースで新しく作成されたLBを選択します。これは`service`にバインドされ、`service`が登録解除される際に同時に登録解除されます。ただし、この`service`はDoris Operatorによって制御されません。
