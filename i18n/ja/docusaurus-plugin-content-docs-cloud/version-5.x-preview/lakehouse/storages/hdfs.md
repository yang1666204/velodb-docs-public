---
{
  "title": "HDFS | ストレージ",
  "description": "この文書では、HDFSにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下に適用されます：",
  "language": "ja"
}
---
# HDFS

この文書はHDFSにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下に適用されます：

* Catalogプロパティ
* Table Valued Functionプロパティ
* Broker Loadプロパティ
* Exportプロパティ
* Outfileプロパティ
* バックアップとリストア

## パラメータ概要

|プロパティ名 | レガシー名 | 説明 | デフォルト値 | 必須 |
| --- | --- | --- | --- | --- | 
| hdfs.authentication.type | hadoop.security.authentication | 認証タイプを指定します。オプション値はkerberosまたはsimpleです。kerberosが選択された場合、システムはKerberos認証を使用してHDFSと通信します。simpleが使用された場合、認証が使用されないことを意味し、オープンなHDFSクラスターに適しています。kerberosを選択するには、対応するprincipalとkeytabの設定が必要です。 | simple | いいえ |
| hdfs.authentication.kerberos.principal | hadoop.kerberos.principal | 認証タイプがkerberosの場合、Kerberos principalを指定します。Kerberos principalは一意の識別文字列で、通常はサービス名、ホスト名、ドメイン名を含みます。 | - | いいえ |
| hdfs.authentication.kerberos.keytab | hadoop.kerberos.keytab | このパラメータはKerberos認証のためのkeytabファイルパスを指定します。keytabファイルは暗号化された認証情報を保存し、ユーザーが手動でパスワードを入力する必要なく、システムが自動的に認証できるようにします。 | - | いいえ |
| hdfs.impersonation.enabled | - | trueの場合、HDFSなりすまし機能を有効にします。core-site.xmlで設定されたプロキシユーザーを使用して、DorisログインユーザーのプロキシとしてHDFS操作を行います | まだサポートされていません | - |
| hadoop.username | - | 認証タイプがsimpleの場合、このユーザーがHDFSへのアクセスに使用されます。デフォルトでは、Dorisプロセスを実行しているLinuxシステムユーザーがアクセスに使用されます | - | - |
| hadoop.config.resources | - | HDFS設定ファイルディレクトリ（hdfs-site.xmlとcore-site.xmlを含む必要があります）を相対パスで指定します。デフォルトディレクトリは(FE/BE)デプロイメントディレクトリ下の/plugins/hadoop/conf/です（fe.conf/be.confのhadoop_config_dirを変更することでデフォルトパスを変更できます）。すべてのFEおよびBEノードで同じ相対パスを設定する必要があります。例：hadoop/conf/core-site.xml,hadoop/conf/hdfs-site.xml | - | - |
| dfs.nameservices | - | HDFS高可用性クラスターパラメータを手動で設定します。hadoop.config.resources設定を使用している場合、パラメータはhdfs-site.xmlから自動的に読み取られます。以下のパラメータと合わせて使用する必要があります：dfs.ha.namenodes.your-nameservice、dfs.namenode.rpc-address.your-nameservice.nn1、dfs.client.failover.proxy.provider等。 | - | - | 

> 3.1より前のバージョンについては、レガシー名を使用してください。

## 認証設定

HDFSは2つの認証方式をサポートします：

* Simple
* Kerberos

### Simple認証

Simple認証はKerberosを有効にしていないHDFSクラスターに適しています。

Simple認証を使用する場合、以下のパラメータを設定するか、デフォルト値を直接使用できます：

```sql
"hdfs.authentication.type" = "simple"
```
Simple認証モードでは、`hadoop.username`パラメータを使用してユーザー名を指定できます。指定しない場合、現在のプロセスのユーザー名がデフォルトとして使用されます。

例：

`lakers`ユーザー名を使用してHDFSにアクセス

```sql
"hdfs.authentication.type" = "simple",
"hadoop.username" = "lakers"
```
デフォルトシステムユーザーを使用してHDFSにアクセスする

```sql
"hdfs.authentication.type" = "simple"
```
### Kerberos Authentication

Kerberos認証は、Kerberosが有効になっているHDFSクラスターに適しています。

Kerberos認証を使用する場合、以下のパラメータを設定する必要があります：

```sql
"hdfs.authentication.type" = "kerberos",
"hdfs.authentication.kerberos.principal" = "<your_principal>",
"hdfs.authentication.kerberos.keytab" = "<your_keytab>"
```
Kerberos認証モードでは、Kerberosプリンシパルとkeytabファイルパスを設定する必要があります。

Dorisは`hdfs.authentication.kerberos.principal`プロパティで指定されたアイデンティティでHDFSにアクセスし、keytabで指定されたkeytabを使用してPrincipalを認証します。

> 注意:
>
> keytabファイルは、すべてのFEおよびBEノードで同じパスに存在する必要があり、Dorisプロセスを実行するユーザーはkeytabファイルに対する読み取り権限を持つ必要があります。

例:

```sql
"hdfs.authentication.type" = "kerberos",
"hdfs.authentication.kerberos.principal" = "hdfs/hadoop@HADOOP.COM",
"hdfs.authentication.kerberos.keytab" = "/etc/security/keytabs/hdfs.keytab",
```
Kerberos設定の一般的な問題のトラブルシューティングについては、[Kerberos FAQ](../best-practices/kerberos.md/#faq)を参照してください。

## HDFS HA設定

HDFS HAモードが有効になっている場合、`dfs.nameservices`関連のパラメータを設定する必要があります：

```sql
'dfs.nameservices' = '<your-nameservice>',
'dfs.ha.namenodes.<your-nameservice>' = '<nn1>,<nn2>',
'dfs.namenode.rpc-address.<your-nameservice>.<nn1>' = '<nn1_host:port>',
'dfs.namenode.rpc-address.<your-nameservice>.<nn2>' = '<nn2_host:port>',
'dfs.client.failover.proxy.provider.<your-nameservice>' = 'org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider',
```
I'm ready to translate your English technical documentation into Japanese following the rules you've specified. However, I don't see the actual text to translate after "Text:" and "Example:". 

Could you please provide the English technical documentation text that you'd like me to translate?

```sql
'dfs.nameservices' = 'nameservice1',
'dfs.ha.namenodes.nameservice1' = 'nn1,nn2',
'dfs.namenode.rpc-address.nameservice1.nn1' = '172.21.0.2:8088',
'dfs.namenode.rpc-address.nameservice1.nn2' = '172.21.0.3:8088',
'dfs.client.failover.proxy.provider.nameservice1' = 'org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider',
```
## Configuration Files

> この機能はバージョン3.1.0以降でサポートされています

DorisはHDFS設定ファイルディレクトリを`hadoop.config.resources`パラメータを通じて指定することをサポートしています。

設定ファイルディレクトリには`hdfs-site.xml`と`core-site.xml`ファイルが含まれている必要があります。デフォルトディレクトリは（FE/BE）デプロイメントディレクトリ下の`/plugins/hadoop_conf/`です。すべてのFEとBEノードは同じ相対パスを設定する必要があります。

設定ファイルにこの文書で言及された上記のパラメータが含まれている場合、ユーザーが明示的に設定したパラメータが優先されます。設定ファイルは複数のファイルを指定することができ、`hadoop/conf/core-site.xml,hadoop/conf/hdfs-site.xml`のようにカンマで区切られます。

**例:**

```sql
-- Multiple configuration files
'hadoop.config.resources'='hdfs-cluster-1/core-site.xml,hdfs-cluster-1/hdfs-site.xml'
-- Single configuration file
'hadoop.config.resources'='hdfs-cluster-2/hdfs-site.xml'
```
## HDFS IO最適化

場合によっては、HDFSの高負荷により、HDFS上のデータレプリカの読み取りに長時間かかり、全体的なクエリ効率が低下することがあります。以下では、関連する最適化設定をいくつか紹介します。

### Hedged Read

HDFS ClientはHedged Read機能を提供します。この機能は、読み取りリクエストが一定の閾値を超えても戻らない場合に、同じデータを読み取る別の読み取りスレッドを開始し、先に戻った方を使用することができます。

注意：この機能はHDFSクラスターの負荷を増加させる可能性があるため、慎重に使用してください。

以下の方法でこの機能を有効にできます：

```sql
"dfs.client.hedged.read.threadpool.size" = "128",
"dfs.client.hedged.read.threshold.millis" = "500"
```
* `dfs.client.hedged.read.threadpool.size`

    Hedged Readに使用されるスレッド数を表し、1つのHDFS Clientで共有されます。通常、1つのHDFSクラスターに対して、BEノードは1つのHDFS Clientを共有します。

* `dfs.client.hedged.read.threshold.millis`

    読み取り閾値（ミリ秒）。読み取りリクエストがこの閾値を超えても戻らない場合、Hedged Readがトリガーされます。

有効化後、Query Profileで関連パラメータを確認できます：

* `TotalHedgedRead`

    Hedged Readが開始された回数。

* `HedgedReadWins`

    Hedged Readの成功回数（開始され、元のリクエストより高速に戻った回数）。

ここでの値は単一のHDFS Clientの累積値であり、単一クエリの値ではないことに注意してください。同じHDFS Clientが複数のクエリで再利用されます。

### dfs.client.socket-timeout

`dfs.client.socket-timeout`は、Hadoop HDFSのクライアント設定パラメータで、クライアントがDataNodeまたはNameNodeとの接続確立やデータ読み取り時のソケットタイムアウトを設定するために使用され、単位はミリ秒です。このパラメータのデフォルト値は通常60,000ミリ秒です。

このパラメータ値を削減することで、クライアントはネットワーク遅延、DataNodeの応答遅延、または接続例外に遭遇した際により高速にタイムアウトし、再試行または他のノードへの切り替えが可能になります。これにより待機時間の削減とシステム応答速度の向上が期待できます。例えば、一部のテストでは、`dfs.client.socket-timeout`をより小さな値（5000ミリ秒など）に設定することで、DataNodeの遅延や故障を迅速に検出し、長時間の待機を回避できます。

注意：

* タイムアウトを小さく設定しすぎると、ネットワークの変動やノード負荷が高い際に頻繁なタイムアウトエラーが発生し、タスクの安定性に影響する可能性があります。

* 実際のネットワーク環境とシステム負荷条件に基づいて、このパラメータ値を合理的に調整し、応答速度とシステム安定性のバランスを取ることを推奨します。

* このパラメータは、クライアントがHDFSと通信する際に正しいタイムアウトを使用するよう、クライアント設定ファイル（`hdfs-site.xml`など）で設定する必要があります。

要約すると、`dfs.client.socket-timeout`パラメータを適切に設定することで、システムの安定性と信頼性を確保しながらI/O応答速度を向上させることができます。

## HDFSアクセスポート要件（NameNode & DataNodeのみ）

DorisがHDFSにアクセスするために、以下のポートを開放する必要があります：

| Service   | Port Purpose                  | Default Port | Protocol|
|-----------|-------------------------------|--------------|---------|
| NameNode  | RPC (client/metadata access)  | 8020         |TCP      |
| DataNode  | Data transfer (block I/O)     | 9866         |TCP       |

注意：
- ポートは`core-site.xml`および`hdfs-site.xml`でカスタマイズ可能です。実際の設定を使用してください。
- Kerberos認証が有効な場合、DorisはKerberos KDCサービスにもアクセス可能である必要があります。KDCはデフォルトでTCPポート88でリッスンしますが、実際のポートはKDC設定に従う必要があります。

## HDFSのデバッグ

Hadoop環境設定は複雑であり、場合によっては接続性の問題やアクセス性能の低下が発生することがあります。ユーザーが接続性の問題や基本的な性能問題を迅速にトラブルシューティングするためのサードパーティツールを以下に示します。

### HDFS Client

* Java: <https://github.com/morningman/hdfs-client-java>

* CPP: <https://github.com/morningman/hdfs-client-cpp>

これら2つのツールは、HDFSの接続性と読み取り性能を迅速に検証するために使用できます。これらのHadoop依存関係のほとんどはDoris自身のHadoop依存関係と同じであるため、DorisのHDFSアクセスシナリオを最大限シミュレートできます。

Java版はJavaを使用してHDFSにアクセスし、Doris FE側のHDFSアクセスロジックをシミュレートできます。

CPP版はC++でlibhdfsを呼び出してHDFSにアクセスし、Doris BE側のHDFSアクセスロジックをシミュレートできます。

具体的な使用方法については、各コードリポジトリのREADMEを参照してください。
