---
{
  "title": "Compute-Storage分離クラスターのデプロイ",
  "description": "Manager により、物理マシン、仮想マシン、クラウドサーバー上に Doris クラスターをデプロイでき、環境チェックを自動的に実行し...",
  "language": "ja"
}
---
# 計算ストレージ分離クラスターのデプロイ

Managerを使用すると、物理マシン、仮想マシン、クラウドサーバー上にDorisクラスターをデプロイでき、環境チェックとクラスター設定を自動的に実行します。新しい計算ストレージ分離クラスターを作成するには、**現在のクラスター**タブの下にある**新規作成/引き継ぎクラスター**を選択し、**計算ストレージ分離クラスターの作成**を選択します。

## 注意事項

* FEマシンは同時にFoundationDBをデプロイするため、少なくとも48GBのメモリが必要です。
* 1台のサーバーに1つのFEと1つのBEを混在でデプロイできますが、複数のFEとBEインスタンスはデプロイできません。
* デプロイ前に、[Cluster Planning](https://doris.apache.org/zh-CN/docs/dev/install/preparation/cluster-planning)を参照してノード数を見積もることができます。
* マシンを追加する際は、ホスト名ではなく**IPアドレス**を指定する必要があります。

## ステップ1：環境設定

クラスター環境を設定する際は、クラスター名を設定し、デプロイバージョンを選択し、プロンプトに従ってデータベースのrootパスワードを指定する必要があります。

また、計算ストレージ分離クラスター用の共有ストレージを設定する必要があります。

![config-env-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-env-separating.png)

## ステップ2：ホスト登録

ホストを登録する際は、まずホストIPを追加し、次に各ホストのAgentサービスを開始する必要があります。

1.  **ホストIPの追加とAgentポートの指定**

    ![register-host-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/register-host-separating.png)

    ホストIPを追加する際は、IPV4とIPV6の両方の形式がサポートされています。

2.  **指定したホストへのAgentサービスのインストール**

    ![install-agent-separating.png](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/install-agent-separating.png)

    Agentのインストールでは、登録された各ホストでマシンパラメータをチェックし、Agentサービスをワンクリックでデプロイする必要があります。

    Agentサービスをデプロイした後、Agentのステータスが正常であることを確認してください。

## ステップ3：FE設定

![config-fe-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-fe-separating.png)

FEを追加する際は、[FE Role](https://doris.apache.org/zh-CN/docs/dev/gettingStarted/what-is-apache-doris#%E5%AD%98%E7%AE%97%E4%B8%80%E4%BD%93%E6%9E%B6%E6%9E%84)を指定する必要があります。高可用性アーキテクチャを形成するため、3つのFE Followerを指定することを推奨します。

FE設定を指定する際は、一般設定を選択するか、特定のFE設定を個別に変更できます。一貫性のあるFE設定を確保するため、一般設定の使用を推奨します。

設定の説明は以下の通りです：

| パラメータ        | 説明                                                                     |
| :--------------- | :------------------------------------------------------------------------------ |
| Http Port        | FE上のHTTP Serverポート、デフォルト8030                                            |
| Query Port       | FE上のMySQL Serverポート、デフォルト9030                                           |
| RPC Port         | FE上のThrift Serverポート、各FEの設定は一致させる必要があります、デフォルト9020 |
| Editlog Port     | FE上のbdbje通信ポート、デフォルト9010                                    |
| Deployment Directory | Dorisデプロイメントルートディレクトリ                                                 |
| Metadata Storage Directory | FEメタデータ格納ディレクトリ                                                 |
| Log Directory    | FEログディレクトリ                                                                |

## ステップ4：BE設定

![config-be-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-be-separating.png)

BEノードを追加する際は、まず計算グループを計画し、次に各計算グループにBEノードを追加する必要があります。

上の画像に示すように、2つのリソースグループが作成され、各リソースグループに1つのBEノードが追加されています。

設定の説明は以下の通りです：

| パラメータ          | 説明                                                                     |
| :----------------- | :------------------------------------------------------------------------------ |
| BE Port            | BE上のThrift Serverポート、FEからのリクエストを受信するために使用、デフォルト9060        |
| Webserver Port     | BE上のHTTP Serverポート、デフォルト8040                                            |
| Heartbeat Port     | BE上のハートビートサービスポート（Thrift）、FEからのハートビートを受信するために使用、デフォルト9050 |
| BRPC Port          | BE上のBRPCポート、BE間の通信に使用、デフォルト8060               |
| Deployment Directory | Dorisデプロイメントルートディレクトリ                                                 |
| Data Storage Directory | BEデータ格納ディレクトリ                                                       |
| Log Directory      | BEログ格納ディレクトリ                                                        |
| External Table Cache Directory | 連合分析ファイルキャッシュディレクトリ                                           |
| Total File Cache Size | 連合分析ファイルキャッシュサイズ                                                |
| Single Query Cache Limit | 連合分析単一クエリキャッシュサイズ制限                                  |

## ステップ5：その他の設定

![config-others-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-others-separating.png)

クラスターパラメータを設定する際は、サービスを自動的に開始するかどうか、およびテーブル名の大文字小文字を区別するかどうかを選択できます。
