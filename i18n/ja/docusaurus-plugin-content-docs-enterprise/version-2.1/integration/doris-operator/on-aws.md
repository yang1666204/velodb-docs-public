---
{
  "title": "AWSに関する推奨事項",
  "description": "EKSクラスターで実行されているコンテナは、EC2インスタンス上でホストされています。",
  "language": "ja"
}
---
## AWS EKS

### 新しいクラスターの作成
EKSクラスターで実行されるコンテナはEC2インスタンス上でホストされ、EC2インスタンスはDorisの要件に応じてシステムレベルで設定する必要があります。クラスターを作成する際、ユーザーはEKSモード、autoモードまたは非autoモードを確認する必要があります。
ここでは自律モードの使用を推奨しません。自律モードではコンピューティングリソースが内蔵のノードプール経由で割り当てと回収が行われるためです。各リソース申請や解放時に、既存のリソースが再統合されます。statefulsetなどのステートフルサービス、特に起動に時間がかかり、Dorisのような厳格な分散協調要件を持つサービスの場合、共有ノードプール内のすべてのサービスに混乱を引き起こします。直接的な現象としては、Dorisクラスター全体のすべてのノードがドリフトする可能性があります（これは再起動よりも恐ろしいことです。このプロセスはローリング再起動ではなく、以前に安定していたサービスがノード上にある際に、そのノードが強制的に解放され、K8sがこれらのpodを新しいノードにスケジュールします）。本番環境には大きなセキュリティリスクがあります。
- 上記のとおり、自律モードはステートレスサービスの運用保守デプロイメントに適しています。Dorisクラスターのインストールには非自律モードが推奨されます
- 推奨オペレーティングシステムイメージ：Amazon Linux 2

### 既存のクラスター

既存のクラスター（非autoモード）では、K8sの特権モードの使用が制限されていない限り、Doris OperatorによってDorisクラスターを実行できます。
既存のクラスターでは、Dorisクラスターリソースを個別にデプロイ・保守するための新しいノードグループを設定することを推奨します。これはDoris BEの動作に関するシステム設定に関わり、ホストマシンのシステムパラメータを調整する可能性があります。

### DockerHubへのアクセス

EKS上でDockerHubパブリックイメージリポジトリにアクセスする必要がある場合、`Amazon VPC CNI`、`CoreDNS`、`kube-proxy`などのネットワークプラグインをクラスターに追加し、クラスター用にVPCを設定する際にパブリック環境にアクセスできるサブネットを選択する必要があります。

### K8s特権モード

EKS環境下では、EC2インスタンスは完全に現在のEKSユーザーに属し、リソースプール内で異なるユーザークラスターが相互に影響し、K8s特権モードを無効にする状況はありません。

- EKSが特権モードを許可している場合（デフォルトで許可）、システムパラメータを気にする必要はありません。Doris Operatorはデフォルトでdorisの動作に必要なシステムパラメータを調整します。
- 特権モードが許可されていない場合、ホスト上で以下のシステムパラメータを調整する必要があります：
  - 仮想メモリ領域数の変更：`sysctl -w vm.max_map_count=2000000`で仮想メモリマッピングの最大数を調整します。`sysctl vm.max_map_count`で確認できます。
  - Transparent Huge Pagesの無効化：Transparent Huge Pagesはパフォーマンスに悪影響を与える可能性があるため、無効にする必要があります。cat /sys/kernel/mm/transparent_hugepage/enabledにneverが含まれているかで判断します。
  - オープンファイルハンドルの最大数設定：`/etc/security/limits.conf`を変更してファイルハンドルの最大数を調整します。`ulimit -n`で確認できます。
  - swapの無効化：`swapoff -a`を使用してすべてのスワップパーティションとファイルを無効にします。`swapon --show`で確認し、有効でない場合は出力されません。

### ストレージ

Doris Operatorは本番環境でノードストレージを保存するために永続化設定を使用する必要があります。[EBS](https://aws.amazon.com/ebs)が推奨されます。

以下の点に注意してください：

- クラスター設定インストールまたは管理インターフェースで、EBSストレージプラグインを追加します。EKS自律モード（非推奨）を使用する場合は、EFSのインストールを推奨し、ストレージプラグインには対応する[ロール権限](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)が必要です
- EKSノードのIAMロールが以下の権限を持つことを確認してください：
  - AmazonEC2FullAccess
  - AmazonEKSWorkerNodePolicy
  - AmazonEKS_CNI_Policy
  - AmazonSSMManagedInstanceCore

### コンピューティングリソースプール設定

- AWS Resource Groups（推奨）
  クラスター作成インターフェースでノードグループを作成するか、クラスター初期化後にノードグループを追加できます。EC2 > Launch Template > Create Launch Templateを使用して、ノードプール用のノードグループ起動テンプレートを設定します。テンプレートを使用してスクリプトを注入し、EC2インスタンスのシステム環境設定を自動調整し、ノードが起動時に必要なシステムパラメータを自動設定することを保証します。ノードテンプレートを設定することで、EKS自動弾性スケーリングを使用する際に新しく追加されるノードのシステムパラメータを自動設定する機能も実現できます。
  起動スクリプト例：

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
さらに、ノードグループを作成する際に、コマンドラインからアクセスしたい場合は、リモートノードアクセス権限を設定する必要があります。

- Default node pools（推奨しません）

  EKS自律モードで使用されるリソースプールを有効にします。ノードプールを作成する際に、カスタムEC2インスタンスタイプを選択し、インスタンスのCPU、メモリおよびその他のリソースを調整できます。ノードプールを設定する際に、システムパラメータを調整するためにEC2インスタンス用の起動スクリプトを追加できます。ただし、このタイプのリソースプールは自律モードを必要とし、クラスターを管理する自由度が低下します。具体的な変更操作の詳細については、以下を参照してください：Cluster Environment OS Checking
