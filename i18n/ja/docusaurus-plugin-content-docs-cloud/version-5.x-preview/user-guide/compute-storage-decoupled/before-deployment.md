---
{
  "title": "Doris Compute-Storage Decoupled Deployment の準備",
  "description": "この文書は、Apache Dorisのコンピュート・ストレージ分離モードのデプロイメント準備作業について説明します。",
  "language": "ja"
}
---
# Doris コンピュート・ストレージ分離デプロイメント準備

## 1. 概要

この文書では、Apache Doris のコンピュート・ストレージ分離モードのデプロイメント準備作業について説明します。分離アーキテクチャは、システムのスケーラビリティとパフォーマンスの向上を目的としており、大規模なデータ処理シナリオに適しています。

## 2. アーキテクチャコンポーネント

Doris のコンピュート・ストレージ分離アーキテクチャは、3つの主要なモジュールで構成されています：

1. **Frontend (FE)**: ユーザーリクエストを処理し、メタデータを管理します。
2. **Backend (BE)**: クエリタスクを実行するステートレスなコンピュートノードです。
3. **Meta Service (MS)**: メタデータ操作とデータリカバリを管理します。

## 3. システム要件

### 3.1 ハードウェア要件

- 最小構成: 3台のサーバー
- 推奨構成: 5台以上のサーバー

### 3.2 ソフトウェア依存関係

- FoundationDB (FDB) バージョン 7.1.38 以上
- OpenJDK 17

## 4. デプロイメント計画

### 4.1 テスト環境デプロイメント

すべてのモジュールを単一マシンにデプロイします。本番環境には適していません。

### 4.2 本番デプロイメント

- FDB を 3台以上のマシンにデプロイ
- FE と Meta Service を 3台以上のマシンにデプロイ
- BE を 3台以上のマシンにデプロイ

マシン構成が高い場合は、FDB、FE、Meta Service の混在を検討できますが、ディスクは混在させないでください。

## 5. インストール手順

### 5.1 FoundationDB のインストール

このセクションでは、提供されたスクリプト `fdb_vars.sh` と `fdb_ctl.sh` を使用して、FoundationDB (FDB) サービスの設定、デプロイ、起動を行うステップバイステップガイドを提供します。[doris tools](http://apache-doris-releases.oss-accelerate.aliyuncs.com/apache-doris-3.0.2-tools.tar.gz) をダウンロードし、`fdb` ディレクトリから `fdb_vars.sh` と `fdb_ctl.sh` を取得できます。

#### 5.1.1 マシン要件

通常、SSD を搭載した少なくとも 3台のマシンが、データの二重レプリカを持つ FoundationDB クラスターを構成し、単一マシンの障害に対応するために必要です。
SSD が利用できない場合は、データストレージには標準的なクラウドディスクまたは標準の POSIX 準拠ファイルシステムを持つローカルディスクを少なくとも使用する必要があります。そうでなければ、FoundationDB は正常に動作しない可能性があります - 例えば、JuiceFS のようなストレージソリューションを FoundationDB の基盤ストレージとして使用すべきではありません。

:::tip
開発/テスト目的のみの場合は、単一マシンで十分です。
:::

#### 5.1.2 `fdb_vars.sh` 設定

##### 必須のカスタム設定

| パラメーター | 説明 | タイプ | 例 | 注記 |
|-----------|------|------|-----|------|
| `DATA_DIRS` | FoundationDB ストレージのデータディレクトリを指定 | 絶対パスのカンマ区切りリスト | `/mnt/foundationdb/data1,/mnt/foundationdb/data2,/mnt/foundationdb/data3` | - スクリプト実行前にディレクトリが作成されていることを確認<br/>- 本番環境では SSD と分離されたディレクトリを推奨 |
| `FDB_CLUSTER_IPS` | クラスター IP を定義 | 文字列（カンマ区切りの IP アドレス） | `172.200.0.2,172.200.0.3,172.200.0.4` | - 本番クラスターには少なくとも 3つの IP アドレス<br/>- 最初の IP がコーディネーターとして使用される<br/>- 高可用性のため、マシンを異なるラックに配置 |
| `FDB_HOME` | FoundationDB のメインディレクトリを定義 | 絶対パス | `/fdbhome` | - デフォルトパスは /fdbhome<br/>- このパスが絶対パスであることを確認 |
| `FDB_CLUSTER_ID` | クラスター ID を定義 | 文字列 | `SAQESzbh` | - 各クラスター ID は一意である必要がある<br/>- `mktemp -u XXXXXXXX` を使用して生成可能 |
| `FDB_CLUSTER_DESC` | FDB クラスターの説明を定義 | 文字列 | `dorisfdb` | - デプロイメントにとって意味のあるものに変更することを推奨 |

##### オプションのカスタム設定

| パラメーター | 説明 | タイプ | 例 | 注記 |
|-----------|------|------|-----|------|
| `MEMORY_LIMIT_GB` | FDB プロセスのメモリ制限を GB で定義 | 整数 | `MEMORY_LIMIT_GB=16` | 利用可能なメモリリソースと FDB プロセス要件に基づいてこの値を調整 |
| `CPU_CORES_LIMIT` | FDB プロセスの CPU コア制限を定義 | 整数 | `CPU_CORES_LIMIT=8` | 利用可能な CPU コア数と FDB プロセス要件に基づいてこの値を設定 |

#### 5.1.3 FDB クラスターのデプロイ

`fdb_vars.sh` で環境を設定した後、`fdb_ctl.sh` スクリプトを使用して各ノードに FDB クラスターをデプロイできます。

```bash
./fdb_ctl.sh deploy
```
このコマンドは、FDBクラスターのデプロイメントプロセスを開始します。

### 5.1.4 FDBサービスの開始

FDBクラスターがデプロイされたら、`fdb_ctl.sh`スクリプトを使用して各ノードでFDBサービスを開始できます。

```bash
./fdb_ctl.sh start
```
このコマンドはFDBサービスを開始し、クラスターを運用可能な状態にして、MetaServiceの設定に使用できるFDBクラスター接続文字列を取得します。

### 5.2 OpenJDK 17のインストール

1. [OpenJDK 17](https://download.java.net/java/GA/jdk17.0.1/2a2082e5a09d4267845be086888add4f/12/GPL/openjdk-17.0.1_linux-x64_bin.tar.gz)をダウンロードします
2. 展開して環境変数JAVA_HOMEを設定します。

## 6. 次のステップ

上記の準備を完了した後、デプロイメントを続行するために以下のドキュメントを参照してください：

1. [Deployment](./compilation-and-deployment.md)
2. [Managing Compute Group](./managing-compute-cluster.md)
3. [Managing Storage Vault](./managing-storage-vault.md)

## 7. 注意事項

- すべてのノード間で時刻同期を確実に行う
- FoundationDBデータを定期的にバックアップする
- 実際の負荷に基づいてFoundationDBとDorisの設定パラメータを調整する
- データストレージにはPOSIX準拠のファイルシステムを持つ標準的なクラウドディスクまたはローカルディスクを使用する。そうでなければ、FoundationDBが正常に動作しない場合があります。
	* 例えば、JuiceFSなどのストレージソリューションはFoundationDBのストレージバックエンドとして使用すべきではありません。

## 8. 参考資料

- [FoundationDB Official Documentation](https://apple.github.io/foundationdb/index.html)
- [Apache Doris Official Website](https://doris.apache.org/)
