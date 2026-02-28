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
* バックアップと復元

## パラメータ概要

|Property Name | Legacy Name | デスクリプション | デフォルト値 | Required |
| --- | --- | --- | --- | --- | 
| hdfs.authentication.type | hadoop.security.authentication | 認証タイプを指定します。オプション値はkerberosまたはsimpleです。kerberosが選択された場合、システムはKerberos認証を使用してHDFSと相互作用します。simpleが使用された場合、認証が使用されないことを意味し、オープンなHDFSクラスタに適しています。kerberosを選択する場合は、対応するprincipalとkeytabの設定が必要です。 | simple | No |
| hdfs.authentication.kerberos.principal | hadoop.kerberos.principal | 認証タイプがkerberosの場合、Kerberos principalを指定します。Kerberos principalは一意のアイデンティティ文字列で、通常、サービス名、ホスト名、ドメイン名が含まれます。 | - | No |
| hdfs.authentication.kerberos.keytab | hadoop.kerberos.keytab | このパラメータは、Kerberos認証用のkeytabファイルパスを指定します。keytabファイルは暗号化された認証情報を保存し、ユーザーが手動でパスワードを入力することなく、システムが自動的に認証できるようにします。 | - | No |
| hdfs.impersonation.enabled | - | trueの場合、HDFSなりすまし機能を有効にします。core-site.xmlで設定されたプロキシユーザーを使用して、DorisログインユーザーをHDFS操作のためにプロキシします | まだサポートされていません | - |
| hadoop.username | - | 認証タイプがsimpleの場合、このユーザーはHDFSへのアクセスに使用されます。デフォルトでは、Dorisプロセスを実行するLinuxシステムユーザーがアクセスに使用されます | - | - |
| hadoop.config.resources | - | HDFS設定ファイルディレクトリを指定します（hdfs-site.xmlとcore-site.xmlを含む必要があります）、相対パスを使用します。デフォルトディレクトリは（FE/BE）デプロイメントディレクトリ下の/plugins/hadoop/conf/です（fe.conf/be.confでhadoop_config_dirを変更することでデフォルトパスを変更できます）。すべてのFEとBEノードは同じ相対パスを設定する必要があります。例：hadoop/conf/core-site.xml,hadoop/conf/hdfs-site.xml | - | - |
| dfs.nameservices | - | HDFS高可用性クラスタパラメータを手動で設定します。hadoop.config.resources設定を使用する場合、パラメータはhdfs-site.xmlから自動的に読み取られます。以下のパラメータと組み合わせて使用する必要があります：dfs.ha.namenodes.your-nameservice、dfs.namenode.rpc-address.your-nameservice.nn1、dfs.client.failover.proxy.provider など。 | - | - | 

> バージョン3.1より前では、レガシー名を使用してください。

## 認証設定

HDFSは2つの認証方法をサポートしています：

* Simple
* Kerberos

### Simple認証

Simple認証は、Kerberosが有効化されていないHDFSクラスタに適しています。

Simple認証を使用する場合、以下のパラメータを設定するか、デフォルト値を直接使用できます：

```sql
"hdfs.authentication.type" = "simple"
```
Simple認証モードでは、`hadoop.username`パラメータを使用してユーザー名を指定することができます。指定されない場合、現在のプロセスのユーザー名がデフォルトとして使用されます。

例:

`lakers`ユーザー名を使用してHDFSにアクセスする

```sql
"hdfs.authentication.type" = "simple",
"hadoop.username" = "lakers"
```
デフォルトシステムユーザーを使用したHDFSへのアクセス

```sql
"hdfs.authentication.type" = "simple"
```
### Kerberos 認証

Kerberos認証は、Kerberosが有効になっているHDFSクラスターに適しています。

Kerberos認証を使用する場合、以下のパラメータを設定する必要があります：

```sql
"hdfs.authentication.type" = "kerberos",
"hdfs.authentication.kerberos.principal" = "<your_principal>",
"hdfs.authentication.kerberos.keytab" = "<your_keytab>"
```
Kerberos認証モードでは、Kerberosプリンシパルとkeytabファイルパスを設定する必要があります。

Dorisは`hdfs.authentication.kerberos.principal`プロパティで指定されたアイデンティティでHDFSにアクセスし、keytabで指定されたkeytabを使用してPrincipalを認証します。

> 注意：
>
> keytabファイルは、すべてのFEおよびBEノード上に同じパスで存在している必要があり、Dorisプロセスを実行するユーザーはkeytabファイルに対する読み取り権限を持っている必要があります。

例：

```sql
"hdfs.authentication.type" = "kerberos",
"hdfs.authentication.kerberos.principal" = "hdfs/hadoop@HADOOP.COM",
"hdfs.authentication.kerberos.keytab" = "/etc/security/keytabs/hdfs.keytab",
```
## HDFS HA 構成

HDFS HAモードが有効になっている場合、`dfs.nameservices`関連のパラメータを設定する必要があります：

```sql
'dfs.nameservices' = '<your-nameservice>',
'dfs.ha.namenodes.<your-nameservice>' = '<nn1>,<nn2>',
'dfs.namenode.rpc-address.<your-nameservice>.<nn1>' = '<nn1_host:port>',
'dfs.namenode.rpc-address.<your-nameservice>.<nn2>' = '<nn2_host:port>',
'dfs.client.failover.proxy.provider.<your-nameservice>' = 'org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider',
```
Example:
```sql
'dfs.nameservices' = 'nameservice1',
'dfs.ha.namenodes.nameservice1' = 'nn1,nn2',
'dfs.namenode.rpc-address.nameservice1.nn1' = '172.21.0.2:8088',
'dfs.namenode.rpc-address.nameservice1.nn2' = '172.21.0.3:8088',
'dfs.client.failover.proxy.provider.nameservice1' = 'org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider',
```
## 構成 Files

> この機能はバージョン3.1.0以降でサポートされています

Dorisは`hadoop.config.resources`パラメータを通じてHDFS設定ファイルディレクトリの指定をサポートしています。

設定ファイルディレクトリには`hdfs-site.xml`と`core-site.xml`ファイルが含まれている必要があります。デフォルトディレクトリは(FE/BE)デプロイメントディレクトリ下の`/plugins/hadoop_conf/`です。すべてのFEおよびBEノードで同じ相対パスを設定する必要があります。

設定ファイルにこのドキュメントで言及されている上記のパラメータが含まれている場合、ユーザーが明示的に設定したパラメータが優先されます。設定ファイルは`hadoop/conf/core-site.xml,hadoop/conf/hdfs-site.xml`のように、カンマで区切って複数のファイルを指定できます。

**例:**

```sql
-- Multiple configuration files
'hadoop.config.resources'='hdfs-cluster-1/core-site.xml,hdfs-cluster-1/hdfs-site.xml'
-- Single configuration file
'hadoop.config.resources'='hdfs-cluster-2/hdfs-site.xml'
```
## HDFS IO最適化

場合によっては、HDFSの高い負荷により、HDFS上のデータレプリカの読み取りに長時間を要し、全体的なクエリ効率が低下することがあります。以下では、関連する最適化設定について説明します。

### Hedged Read

HDFS ClientはHedged Read機能を提供します。この機能は、読み取りリクエストが一定の閾値を超えても戻らない場合に、同じデータを読み取るための別の読み取りスレッドを開始し、最初に戻ってきた方を使用します。

注意：この機能はHDFSクラスタの負荷を増加させる可能性があります。慎重に使用してください。

以下の方法でこの機能を有効にできます：

```sql
"dfs.client.hedged.read.threadpool.size" = "128",
"dfs.client.hedged.read.threshold.millis" = "500"
```
* `dfs.client.hedged.read.threadpool.size`

    Hedged Readに使用されるスレッド数を表します。これらのスレッドは一つのHDFS Clientで共有されます。通常、一つのHDFSクラスターに対して、BEノードは一つのHDFS Clientを共有します。

* `dfs.client.hedged.read.threshold.millis`

    ミリ秒単位の読み取り閾値です。読み取りリクエストがこの閾値を超えても返却されない場合、Hedged Readがトリガーされます。

有効化後、Query Profileで関連パラメータを確認できます：

* `TotalHedgedRead`

    Hedged Readが開始された回数。

* `HedgedReadWins`

    成功したHedged Read試行回数（開始され、元のリクエストより速く返却された回数）。

ここでの値は単一のHDFS Clientの累積値であり、単一クエリの値ではないことに注意してください。同じHDFS Clientが複数のクエリで再利用されます。

### dfs.client.socket-timeout

`dfs.client.socket-timeout`はHadoop HDFSのクライアント設定パラメータで、クライアントがDataNodeやNameNodeとの接続確立やデータ読み取り時のソケットタイムアウトをミリ秒単位で設定するために使用されます。このパラメータのデフォルト値は通常60,000ミリ秒です。

このパラメータ値を小さくすることで、ネットワーク遅延、DataNodeの応答遅延、または接続例外に遭遇した際に、クライアントがより速くタイムアウトして再試行したり他のノードに切り替えることができます。これにより待機時間を短縮し、システムの応答速度を向上させることができます。例えば、いくつかのテストでは、`dfs.client.socket-timeout`をより小さな値（5000ミリ秒など）に設定することで、DataNodeの遅延や障害を素早く検出し、長時間の待機を回避できます。

注意点：

* タイムアウトを小さく設定しすぎると、ネットワークの変動やノードの高負荷時に頻繁なタイムアウトエラーが発生し、タスクの安定性に影響する可能性があります。

* 実際のネットワーク環境とシステム負荷状況に基づいて、応答速度とシステム安定性のバランスを取るため、このパラメータ値を合理的に調整することが推奨されます。

* このパラメータはクライアント設定ファイル（`hdfs-site.xml`など）に設定して、クライアントがHDFSとの通信時に正しいタイムアウトを使用することを保証する必要があります。

まとめると、`dfs.client.socket-timeout`パラメータを適切に設定することで、システムの安定性と信頼性を確保しながらI/O応答速度を向上させることができます。

## HDFSアクセスポート要件（NameNode & DataNodeのみ）

DorisがHDFSにアクセスするには、以下のポートが開放されている必要があります：

| サービス   | ポートの用途                    | デフォルトポート | プロトコル |
|------------|--------------------------------|-----------------|-----------|
| NameNode   | RPC（クライアント/メタデータアクセス）| 8020           |TCP        |
| DataNode   | データ転送（ブロックI/O）        | 9866           |TCP        |

注意点：
- ポートは`core-site.xml`と`hdfs-site.xml`でカスタマイズされている場合があります。実際の設定を使用してください。
- Kerberos認証が有効になっている場合、DorisはKerberos KDCサービスにも到達できる必要があります。KDCはデフォルトでTCPポート88をリスンしますが、実際のポートはKDC設定に従う必要があります。

## HDFSのデバッグ

Hadoop環境の設定は複雑で、場合によっては接続問題やアクセス性能の低下が発生することがあります。ユーザーが接続問題と基本的な性能問題を迅速にトラブルシューティングするのに役立つサードパーティツールをいくつか紹介します。

### HDFS クライアント

* Java: <https://github.com/morningman/hdfs-client-java>

* CPP: <https://github.com/morningman/hdfs-client-cpp>

これら2つのツールは、HDFS接続性と読み取り性能を迅速に検証するために使用できます。これらのHadoop依存関係の大部分はDoris自身のHadoop依存関係と同じであるため、最大限DorisのHDFSアクセスシナリオをシミュレートできます。

Java版はJavaを使用してHDFSにアクセスし、Doris FE側のHDFSアクセスロジックをシミュレートできます。

CPP版はC++でlibhdfsを呼び出してHDFSにアクセスし、Doris BE側のHDFSアクセスロジックをシミュレートできます。

具体的な使用方法については、各コードリポジトリのREADMEを参照してください。
