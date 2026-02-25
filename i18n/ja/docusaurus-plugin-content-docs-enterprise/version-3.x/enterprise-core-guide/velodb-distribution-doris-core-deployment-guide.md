---
{
  "title": "VeloDB Enterprise Core インストールマニュアル",
  "description": "このドキュメントは、主にVeloDB Enterprise Coreの直接インストールを対象としています。",
  "language": "ja"
}
---
# VeloDB Enterprise Core インストールマニュアル

この文書は主にVeloDB Enterprise Coreの**直接インストール**を対象としています。クラスターのデプロイメント、スケーリング、縮小をワンクリックで完了するため、提供されているVeloDB Managerの使用を推奨します。

便利なインストールと使用のため、Java8がパッケージに組み込まれており、別途Javaをインストールする必要がありません。ダウンロード後、直接実行できます。

## マシン環境

### 概要

Apache Dorisは主流のLinuxサーバーの大部分で動作します。LinuxについてはCentOSとUbuntuの新しいバージョン、およびGCCバージョン4.8.2以上を選択することを推奨します。インストール前に、以下のLinuxシステム設定を確認してください。

#### システムの最大オープンファイルハンドル数を増やす

```
vi /etc/security/limits.conf 
* soft nofile 65536
* hard nofile 65536
```
#### vm.max_map_countのサイズを調整する

```
vi /etc/sysctl.conf
vm.max_map_count=2000000
Then execute to make it effective.
sysctl -p
```
#### Clock Synchronization

Dorisのmetadataは時刻精度が5000ms未満である必要があります。クラスタ内のすべてのマシンは、時刻の問題によって引き起こされるmetadataの不整合によってサービスに異常が発生することを避けるために、クロックを同期する必要があります。

#### Disable Swap Partition

LinuxのswapパーティションはDorisに深刻なパフォーマンス問題を引き起こす可能性があります。swapパーティションを無効にする必要があります。

### 開発・テスト環境

| Module     | CPU  | Memery  | Disk               | Network      | Number of Instances |
| -------- | ---- | ----- | ------------------ | --------- | -------- |
| Frontend | 8 cores+ | 8GB+  | SSD or SATA, 10GB+ | Gigabit Ethernet+ | 1        |
| Backend  | 8 cores+ | 16GB+ | SSD or SATA, 10GB+ | Gigabit Ethernet+ | 1-3      |

### 本番環境

| Module     | CPU   | Memery  | Disk                   | Network      | Number of Instances |
| -------- | ----- | ----- | ---------------------- | --------- | -------- |
| Frontend | 16 cores+ | 64GB+ | SSD or RAID card, 100GB+ | 10 Gigabit Ethernet+ | 1-3      |
| Backend  | 16 cores+ | 64GB+ | SSD or SATA, 100GB+     | 10 Gigabit Ethernet+ | 3 +      |


注記:

1. FEのディスク容量は主にmetadataの保存に使用され、logsやimagesを含み、およそ数十ギガバイトを占有します。
2. BEのディスク容量は主にデータの保存に使用されます。総ディスク容量は総データ量 * 3（3レプリカ）で計算され、その後データcompactionといくつかの中間データの保存のために20%の追加容量が確保されます。
3. 1台のマシンに複数のBEインスタンスをデプロイできますが、FEは1つのみをデプロイすることを推奨します。データの高可用性を確保するため、3台のマシンにそれぞれ1つのBEインスタンスをデプロイすることを推奨します（1台のマシンに3つのBEインスタンスをデプロイする代わりに）。
4. FEの役割にはFollowerとObserverがあります（LeaderはFollowerグループから選出される役割で、総称してFollowerと呼ばれます）。
5. FEノードの最小データは1です（1 Follower）。読み取りの高可用性を提供するために、1 Followerと1 Observerをデプロイすることを推奨します。読み取りと書き込みの両方で高可用性が必要な場合は、3 Followersをデプロイします。

#### Network Requirements

Dorisインスタンスはネットワーク経由で通信を行います。以下の表は必要なポートをすべて示しています：

| Instance Name | Port Name              | Default Port | Communication Direction      | Description                                                  |
| --------------- | ------------------------ | -------------- | ------------------------------ | -------------------------------------------------------------- |
| BE            | be_port                | 9060         | FE --> BE                    | Port on BE for Thrift server to receive requests from FE     |
| BE            | webserver_port         | 8040         | BE <--> BE                   | Port for HTTP server on BE                                   |
| BE            | heartbeat_service_port | 9050         | FE --> BE                    | Port for Thrift heartbeat service on BE to receive from FE   |
| BE            | brpc_port              | 8060         | FE <--> BE, BE <--> BE       | BRPC port for communication between BEs                      |
| FE            | http_port              | 8030         | FE <--> FE, User <--> FE     | Port for HTTP server on FE                                   |
| FE            | rpc_port               | 9020         | BE --> FE, FE <--> FE        | Port for Thrift server on FE, consistent across FE instances |
| FE            | query_port             | 9030         | User <--> FE                 | Port for MySQL server on FE                                  |
| FE            | edit_log_port          | 9010         | FE <--> FE                   | Port for communication between BDBJE on FE                   |
| Broker        | broker_ipc_port        | 8000         | FE --> Broker, BE --> Broker | Port for Thrift server on Broker to receive requests         |

> 注記: 複数のFEインスタンスをデプロイする際は、`http_port`の設定が同じであることを確認してください。

#### Network Configuration

複数のネットワークインターフェースの存在やDockerなどのインストールによって引き起こされる仮想ネットワークインターフェースの存在により、単一のホストが複数の異なるIPアドレスを持つ場合があります。Dorisは現在、利用可能なIPを自動的に識別することができません。そのため、複数のIPを持つデプロイホストを扱う場合、priority_networks設定を通じて正しいIPを強制的に指定する必要があります。

priority_networksはFEとBEの両方に存在する設定オプションであり、fe.confおよびbe.confファイルに含める必要があります。この設定は、FEまたはBEを起動する際にプロセスがどのIPにバインドするかを指示するために使用されます。設定例は以下のとおりです：

`priority_networks=172.16.21.0/24`

これは[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)フォーマットでの表現です。FEまたはBEはこの設定を使用して、自身のリスニングIPとして使用する一致するIPを見つけます。

**注記** : priority_networksを設定してFEまたはBEを起動することで、FEまたはBE自体が正しいIPにバインドされることが保証されます。しかし、ADD BACKENDまたはADD FRONTEND文を使用する際には、priority_networks設定に一致するIPを指定する必要もあります。そうでなければ、クラスタは通信を確立することができません。例えば：

BEの設定が：`priority_networks=172.16.21.0/24`の場合

しかし、`ADD BACKEND`を使用する際に、以下のIPが使用される場合：

```sql
ALTER SYSTEM ADD BACKEND "172.16.1.12:9050";
```
FEとBEが正常に通信できなくなります。

このような場合は、誤って追加されたBEをドロップし、正しいIPでADD BACKENDを再実行する必要があります。

同じ原理がFEにも適用されます。

BROKERは現在priority_networksオプションを持っておらず、また必要ありません。Brokerサービスはデフォルトで0.0.0.0にバインドします。ADD BROKERを使用する際は、正しくアクセス可能なBROKER IPを追加するだけで十分です。

## クラスタデプロイメント

まず、VeloDB Enterprise Coreインストールパッケージをダウンロードします。

ダウンロードされたパッケージの名前は次のようになります：velodb_doris_x.x.x.x-x86_64-avx2.tar.gz

次に、インストールパッケージを解凍します。

```
tar zxf velodb_doris_x.x.x.x-x86_64-avx2.tar.gz
```
展開後、ディレクトリには以下の内容が含まれます

```
VeloDB_doris_x.x.x.x-x86_64-avx2
|-- README.md             ## Documentation
|-- apache_hdfs_broker    ## FS_Broker
|-- audit_loader          ## Auditlog Plugin
|-- be                    ## Doris be
|-- fe                    ## Doris FE
|-- java8                 ## Java Runtime Environment (JRE) required for Doris FE/BE/Broker 
|-- jdbc_drivers          ##Database driver dependencies for running Doris FE/BE with JDBC, as well as for Multi Catalog operations.
`-- udf
```
#### FE Deployment

* 展開されたフォルダを指定されたノードにコピーします。

  他のサービスなしでFEのみをデプロイする場合は、このフォルダ内のfe、java8、jdbc_driversディレクトリのみを保持できます。その他のディレクトリは削除できます。

* FEを設定する

  1. 設定ファイルはconf/fe.confにあります。メタデータを保存する場所であるmeta_dirに注意してください。デフォルト値は${DORIS_HOME}/doris-metaです。このディレクトリは手動で作成する必要があります。

     **注意：本番環境では、Dorisインストールディレクトリの外側にある別のディレクトリを指定することを強く推奨します。できれば専用ディスク（できればSSD）上に配置してください。テストおよび開発環境ではデフォルト設定を使用できます。**

  2. fe.confでは、JAVA_OPTSのデフォルト設定でJavaヒープメモリの最大値を8GBに指定しています。利用可能なマシンメモリに基づいてこの設定を調整することをお勧めします。

* FEを開始する

  `bin/start_fe.sh --daemon`

  FEプロセスが開始され、バックグラウンドで実行されます。ログはデフォルトでlog/ディレクトリに保存されます。起動に失敗した場合は、log/fe.logまたはlog/fe.outでエラー情報を確認できます。

* FEの実行状態を確認する

  MySQLクライアントを使用してFEに接続し、以下のコマンドを実行してBEの実行状態を確認します：

  ```SQL
  SHOW FRONTENDS;
  ```
すべてが正常な場合、isAlive列はtrueになっているはずです。

* 複数のFEをデプロイする必要がある場合は、[Elastic Expansion](https://doris.apache.org/docs/dev/admin-manual/cluster-management/elastic-expansion)を参照してください。

#### BEデプロイ

* 展開したフォルダを指定のノードにコピーする

  他のサービスを使わずにBEのみをデプロイする場合は、このフォルダ内のbe、java8、jdbc_driversディレクトリのみを残すことができます。その他のディレクトリは削除できます。

* すべてのBEの設定を変更する

  be/conf/be.confを編集します。調整する主要な設定はstorage_root_pathで、これはデータ保存ディレクトリです。デフォルトではbe/storage配下にあり、このディレクトリは手動で作成する必要があります。複数のパスはセミコロン;で区切ります（最後のパスの後に;を追加しないでください）。
  
  ストレージメディア、HDD、またはSSDに基づいてストレージディレクトリを区別できます。各パスの最後に容量制限を追加でき、`,`で区切ります。ユーザーがSSDとHDDディスクを混在させていない場合は、例1と例2のように設定する必要はありません。ストレージディレクトリのみを指定してください。

  例1：

  **注意：SSDを使用する場合はディレクトリの後に`.SSD`を追加し、HDDの場合はディレクトリの後に`.HDD`を追加してください**

  `storage_root_path=/home/disk1/doris.HDD;/home/disk2/doris.SSD;/home/disk2/doris`

  **説明**

    - /home/disk1/doris.HDD：ストレージメディアがHDDであることを示します；
    - /home/disk2/doris.SSD：ストレージメディアがSSDであることを示します；
    - /home/disk2/doris：ストレージメディアがHDD（デフォルト）であることを示します

  例2：

  **注意：HDDまたはSSDディスクディレクトリに関係なく、サフィックスを追加する必要はありません。storage_root_pathパラメータでメディアを指定してください。**

  `storage_root_path=/home/disk1/doris,medium:hdd;/home/disk2/doris,medium:ssd`

  **説明**

    - /home/disk1/doris,medium:hdd：ストレージメディアがHDDであることを示します；
    - /home/disk2/doris,medium:ssd：ストレージメディアがSSDであることを示します；

* FEでのすべてのBEノードの追加

 BEノードはクラスターに含まれる前にFEで追加される必要があります。MySQLクライアントを使用してFEに接続できます：

  ```sql
  ./mysql-client -h fe_host -P query_port -uroot
  ```
提供された情報において、`fe_host`はFEノードのIPアドレスを表し、`query_port`はfe/conf/fe.confで設定されます。デフォルトのログインではrootアカウントをパスワードなしで使用します。

ログイン後、各BEを追加するために以下のコマンドを実行します：

  ```sql
  ALTER SYSTEM ADD BACKEND "be_host:heartbeat-service_port"
  ```
* BEを開始

  ```
  bin/start_be.sh --daemon
  ```
BEプロセスが開始され、バックグラウンドで実行されます。ログはデフォルトでbe/log/ディレクトリに保存されます。起動に失敗した場合は、`be/log/be.log`または`be/log/be.out`でエラー情報を確認できます。

* BE Status の確認

  MySQLクライアントを使用してFEに接続し、以下のコマンドを実行してBEの実行状況を確認してください

  ```sql
  SHOW BACKENDS;
  ```
すべてが正常な場合、isAlive列はtrueになっているはずです。

#### FS_Broker デプロイ（オプションコンポーネント）

BrokerはDorisとは独立してプラグインの形でデプロイされます。サードパーティのストレージシステムからデータをインポートする必要がある場合は、対応するBrokerをデプロイする必要があります。デフォルトで提供されているfs_brokerはHDFSとオブジェクトストレージから読み取りを行います。fs_brokerはステートレスであり、各FEおよびBEノードに対して1つずつBrokerをデプロイすることを推奨します。

FEおよびBEノードと一緒にデプロイする場合は、展開したディレクトリ内の`apache_hdfs_broker`フォルダを保持するだけで済みます。

* 対応するBroker設定を変更する

  対応するbrokerフォルダ下のbroker/conf/ディレクトリで、関連する設定を変更できます。

* Brokerを開始する

  ```
  sh bin/start_broker.sh --daemon
  ```
* Broker の追加

  Doris の FE と BE に Broker がどのノードにあるかを認識させるために、SQL コマンドを通じて Broker ノードリストを追加します。

  mysql-client を使用して起動済みの FE に接続し、以下のコマンドを実行してください：

  ```sql
  ALTER SYSTEM ADD BROKER broker_name "broker_host1:broker_ipc_port1","broker_host2:broker_ipc_port2",...;
  ```
この中で、broker_hostはBrokerが配置されているノードのIPアドレスです。broker_ipc_portはBroker設定ファイルconf/apache_hdfs_broker.confにあります。

* Brokerステータスの確認

  mysql-clientを使用して起動済みの任意のFEに接続し、以下のコマンドを実行してBrokerステータスを確認します：

  ```sql
  SHOW PROC "/brokers";
  ```
