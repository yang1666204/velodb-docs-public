---
{
  "title": "Kerberos ベストプラクティス",
  "description": "ユーザーが複数のデータソース間でのフェデレーション分析クエリにDorisを使用する場合、",
  "language": "ja"
}
---
ユーザーが複数のデータソースにわたるフェデレーション分析クエリにDorisを使用する場合、異なるクラスターが異なるKerberos認証資格情報を使用する可能性があります。

大手ファンド会社を例に挙げます。その内部データプラットフォームは複数の機能クラスターに分割され、異なる技術チームまたはビジネスチームによって保守されており、それぞれがアイデンティティ認証とアクセス制御のために独立したKerberos Realmsで構成されています：

- ProductionクラスターはDaily net asset value計算とリスク評価に使用され、厳密に分離されたデータで認可されたサービスアクセスのみを許可します（Realm: PROD.FUND.COM）。
- Analysisクラスターは戦略研究とモデルバックテストに使用され、DorisがTVFを通じてこのクラスターへの一時的なクエリを実装します（Realm: ANALYSIS.FUND.COM）。
- Data lakeクラスターはIceberg Catalogを統合して大量の履歴市場データ、ログ、およびその他のデータのアーカイブと分析を行います（Realm: LAKE.FUND.COM）。

これらのクラスターはクロスドメイン信頼関係を確立しておらず、認証情報を共有できないため、これらの異種データソースへの統一アクセスには、複数のKerberosインスタンスの認証とコンテキスト管理の同時サポートが必要です。

**本ドキュメントは、マルチKerberos環境でデータソースを設定およびアクセスする方法に焦点を当てています。**

> この機能は3.1+からサポートされています

## マルチKerberosクラスター認証設定

### krb5.conf

`krb5.conf`はKerberos設定情報、KDCの場所、Kerberosサービスのいくつかの**デフォルト値**、およびホスト名からRealmへのマッピング情報を含んでいます。

krb5.confを適用する際は、すべてのノードに配置されていることを確認してください。デフォルトの場所は`/etc/krb5.conf`です。

### realms

EXAMPLE.COMなど、多くのクライアントのKDCとKerberosネットワークを含んでいます。

複数のクラスターを設定する場合、1つの`krb5.conf`内で複数のRealmsを設定する必要があります。KDCと`admin_server`はドメイン名でも構いません。

```
[realms]
EMR-IP.EXAMPLE = {
    kdc = 172.21.16.8:88
    admin_server = 172.21.16.8
}
EMR-HOST.EXAMPLE = {
    kdc = emr_hostname
    admin_server = emr_hostname
}
```
### domain_realm

Kerberosサービスが配置されているノードのドメインからRealmへのマッピングを設定します。

```toml
[libdefaults]
dns_lookup_realm = true
dns_lookup_kdc = true
[domain_realm]
172.21.16.8 = EMR-IP.EXAMPLE
emr-host.example = EMR-HOST.EXAMPLE
```
例えば、プリンシパル`emr1/domain_name@realm.com`の場合、KDCを検索する際に`domain_name`を使用して対応するRealmを見つけます。一致しない場合、RealmのKDCを見つけることができません。

通常、DorisのBE.outまたは`log/fe.out`で`domain_realm`に関連する2種類のエラーが表示されます：

```
* Unable to locate KDC for realm/Cannot locate KDC

* No service creds
```
### keytab and principal

マルチKerberosクラスター環境では、keytabファイルは通常、`/path/to/serverA.keytab`、`/path/to/serverB.keytab`など、異なるパスを使用します。異なるクラスターにアクセスする際は、対応するkeytabを使用する必要があります。

HDFSクラスターでKerberos認証が有効になっている場合、通常`core-site.xml`ファイル内に`hadoop.security.auth_to_local`プロパティが確認できます。これはKerberos principalを短いローカルユーザー名にマッピングするために使用され、HadoopはKerberos構文ルールを再利用します。

設定されていない場合、`NoMatchingRule("No rules applied to`例外が発生する可能性があります。コードを参照してください：

[hadoop/src/core/org/apache/hadoop/security/KerberosName.java](https://github.com/hanborq/hadoop/blob/master/src/core/org/apache/hadoop/security/KerberosName.java#L399)

`hadoop.security.auth_to_local`パラメータには、上から下へとprincipalをRULEに対してマッチさせる一連のマッピングルールが含まれています。一致するマッピングルールが見つかると、ユーザー名を出力し、一致しないルールは無視されます。具体的な設定フォーマット：

```
RULE:[<principal translation>](acceptance filter)<short name substitution>
```
複数クラスター環境で異なるKerberosサービスによって使用されるプリンシパルをマッチさせるために、推奨される設定は次の通りです：

```xml
<property>
    <name>hadoop.security.auth_to_local</name>
    <value>RULE:[1:$1@$0](^.*@.*$)s/^(.*)@.*$/$1/g
           RULE:[2:$1@$0](^.*@.*$)s/^(.*)@.*$/$1/g
           DEFAULT</value>
</property>
```
上記の設定は、`core-site.xml`内の`hadoop.security.auth_to_local`プロパティを追加または置換するために使用できます。`core-site.xml`を`fe/conf`と`be/conf`に配置することで、Doris環境で有効になります。

OUTFILE、EXPORT、Broker Load、Catalog（Hive、Iceberg、Hudi）、TVF、およびその他の機能で個別に有効にする必要がある場合は、それらのプロパティで直接設定できます：

```sql
"hadoop.security.auth_to_local" = "RULE:[1:$1@$0](^.*@.*$)s/^(.*)@.*$/$1/g
                                   RULE:[2:$1@$0](^.*@.*$)s/^(.*)@.*$/$1/g
                                   DEFAULT"
```
マッピングルールが正しくマッチできるかどうかを確認するには、異なるクラスターにアクセスする際にこのエラーが発生するかどうかを確認してください：

```
NoMatchingRule: No rules applied to hadoop/domain\_name@EMR-REALM.COM
```
表示された場合、マッチングが失敗したことを示します。

## Best Practices

このセクションでは、[Apache Doris公式リポジトリ](https://github.com/apache/doris/tree/master/docker/thirdparties)が提供するDocker環境を使用して、DockerでKerberosを使用したHive/HDFSサービスを開始し、Dorisを通じてKerberos対応のHive Catalogsを作成する方法を紹介します。

### 環境の説明

* Dorisが提供するKerberosサービスを使用（2セットのHIVE、2セットのKDC）：

  * Docker起動ディレクトリ：`docker/thirdparties`

  * krb5.confテンプレート：

    [`docker-compose/kerberos/common/conf/doris-krb5.conf`](https://github.com/apache/doris/blob/master/docker/thirdparties/docker-compose/kerberos/common/conf/doris-krb5.conf)

### 1. keytabファイルと権限の準備

keytabファイルをローカルディレクトリにコピー：

```bash
mkdir -p ~/doris-keytabs
cp <hive-presto-master.keytab> ~/doris-keytabs/
cp <other-hive-presto-master.keytab> ~/doris-keytabs/
```
認証失敗を防ぐためにファイル権限を設定してください：

```bash
chmod 400 ~/doris-keytabs/*.keytab
```
### 2. krb5.confファイルの準備

1. Dorisによって提供される`krb5.conf`テンプレートファイルを使用する

2. 複数のKerberos HDFSクラスタに同時にアクセスする必要がある場合、**krb5.confをマージする**必要があり、基本的な要件は以下の通りです：

   * `[realms]`：すべてのクラスタのRealmsとKDC IPを記述する。

   * `[domain_realm]`：ドメインまたはIPからRealmへのマッピングを記述する。

   * `[libdefaults]`：統一された暗号化アルゴリズム（des3-cbc-sha1など）。

3. 例：

    ```toml
    [libdefaults]
        default_realm = LABS.TERADATA.COM
        allow_weak_crypto = true
        dns_lookup_realm = true
        dns_lookup_kdc = true

    [realms]
        LABS.TERADATA.COM = {
            kdc = 127.0.0.1
            admin_server = 127.0.0.1
        }
        OTHERREALM.COM = {
            kdc = 127.0.0.1
            admin_server = 127.0.0.1
        }

    [domain_realm]
        presto-master.docker.cluster = LABS.TERADATA.COM
        hadoop-master-2 = OTHERREALM.COM
        .labs.teradata.com = LABS.TERADATA.COM
        .otherrealm.com = OTHERREALM.COM
    ```
4. `krb5.conf`を対応するDockerディレクトリにコピーします：

    ```bash
    cp doris-krb5.conf ~/doris-kerberos/krb5.conf
    ```
### 3. Docker Kerberos環境の開始

1. ディレクトリに移動:

    ```bash
    cd docker/thirdparties
    ```
2. Kerberos環境を開始する：

    ```bash
    ./run-thirdparties-docker.sh -c kerberos
    ```
3. 起動後のサービスは以下を含みます：

   * Hive Metastore 1:9583
   * Hive Metastore 2:9683
   * HDFS 1:8520
   * HDFS 2:8620

### 4. コンテナIPの取得

DockerのIPを確認するためのコマンドを使用してください：

```bash
docker inspect <container-name> | grep IPAddress
```
または、127.0.0.1を直接使用してください（サービスがホストネットワークにマップされている場合）。

### 5. Kerberos Hive Catalogの作成

1. Hive Catalog1

    ```sql
    CREATE CATALOG IF NOT EXISTS multi_kerberos_one
    PROPERTIES (
    "type" = "hms",
    "hive.metastore.uris" = "thrift://127.0.0.1:9583",
    "fs.defaultFS" = "hdfs://127.0.0.1:8520",
    "hadoop.kerberos.min.seconds.before.relogin" = "5",
    "hadoop.security.authentication" = "kerberos",
    "hadoop.kerberos.principal" = "hive/presto-master.docker.cluster@LABS.TERADATA.COM",
    "hadoop.kerberos.keytab" = "/mnt/disk1/gq/keytabs/keytabs/hive-presto-master.keytab",
    "hive.metastore.sasl.enabled " = "true",
    "hadoop.security.auth_to_local" = "RULE:[2:$1@$0](.*@LABS.TERADATA.COM)s/@.*//
                                        RULE:[2:$1@$0](.*@OTHERLABS.TERADATA.COM)s/@.*//
                                        RULE:[2:$1@$0](.*@OTHERREALM.COM)s/@.*//
                                        DEFAULT",
    "hive.metastore.kerberos.principal" = "hive/hadoop-master@LABS.TERADATA.COM"
    );
    ```
2. Hive Catalog2

    ```sql
    CREATE CATALOG IF NOT EXISTS multi_kerberos_two
    PROPERTIES (
    "type" = "hms",
    "hive.metastore.uris" = "thrift://127.0.0.1:9683",
    "fs.defaultFS" = "hdfs://127.0.0.1:8620",
    "hadoop.kerberos.min.seconds.before.relogin" = "5",
    "hadoop.security.authentication" = "kerberos",
    "hadoop.kerberos.principal" = "hive/presto-master.docker.cluster@OTHERREALM.COM",
    "hadoop.kerberos.keytab" = "/mnt/disk1/gq/keytabs/keytabs/other-hive-presto-master.keytab",
    "hive.metastore.sasl.enabled " = "true",
    "hadoop.security.auth_to_local" = "RULE:[2:$1@$0](.*@OTHERREALM.COM)s/@.*//
                                        RULE:[2:$1@$0](.*@OTHERLABS.TERADATA.COM)s/@.*//
                                        DEFAULT",
    "hive.metastore.kerberos.principal" = "hive/hadoop-master-2@OTHERREALM.COM"
    );
    ```
この時点で、マルチKerberosクラスターアクセス設定が完了しています。両方のHiveクラスターからデータを表示し、異なるKerberos認証情報を使用できます。

## FAQ
1. javax.security.sasl.SaslException: No common protection layer between client and server
   - 原因：クライアントの`hadoop.rpc.protection`がHDFSクラスターの設定と異なっている。
   - 修正：クライアントとHDFSサーバー間で`hadoop.rpc.protection`を一致させる。

2. No valid credentials provided (Mechanism level: Illegal key size)
   - 原因：Javaはデフォルトで128ビットより大きな暗号化キーをサポートしていない。
   - 修正：Java Cryptography Extension (JCE) Unlimited Strength Policyをインストールし、JARファイルを`$JAVA_HOME/jre/lib/security`に展開してサービスを再起動する。

3. Encryption type AES256 CTS mode with HMAC SHA1-96 is not supported/enabled
   - 原因：現在のJava環境にAES256サポートがない一方で、KerberosがAES256を使用している可能性がある。
   - 修正：`[libdefaults]`の`/etc/krb5.conf`を更新してサポートされている暗号を使用するか、JCE拡張をインストールしてAES256を有効にする（上記と同様）。

4. No valid credentials provided (Mechanism level: Failed to find any Kerberos tgt)
   - 原因：Kerberosが有効なTicket Granting Ticket (TGT)を見つけることができない。以前動作していた設定では、チケットが期限切れになったかKDCが再起動した。新しい設定では、`krb5.conf`またはkeytabが正しくないか破損している。
   - 修正：`krb5.conf`とkeytabを確認し、チケットが有効であることを確認し、`kinit`で新しいチケットを取得してみる。

5. Failure unspecified at GSS-API level (Mechanism level: Checksum failed)
   - 原因：GSS-APIチェックサム失敗；`kinit`で間違ったパスワードが使用された；keytabが無効であるか古いキーバージョンを持っているためJVMがパスワードログインにフォールバックしている。
   - 修正：`kinit`で正しいパスワードを使用し、keytabが最新で有効であることを確認する。

6. Receive timed out
   - 原因：不安定なネットワークまたは大きなパケットでUDPを使用してKDCと通信している。
   - 修正：`/etc/krb5.conf`に追加してKerberosがTCPを使用するよう強制する：

```shell
[libdefaults]
udp_preference_limit = 1
```
7. javax.security.auth.login.LoginException: Unable to obtain password from user
   - 原因: Principalがkeytabと一致しない、またはアプリケーションが`krb5.conf`やkeytabを読み取れない。
   - 修正方法:
      - `klist -kt <keytab_file>`と`kinit -kt <keytab_file> <principal>`を使用してkeytabとprincipalを検証する。
      - 実行時ユーザーが読み取れるよう、`krb5.conf`とkeytabのパスと権限を確認する。
      - JVM起動オプションで正しい設定ファイルパスが指定されていることを確認する。

8. Principal not found or Could not resolve Kerberos principal name
   - 原因:
      - principalのホスト名が解決できない。
      - `_HOST`プレースホルダーがKDCに未知のホスト名に展開される。
      - DNSまたは`/etc/hosts`の設定が間違っている。
   - 修正方法:
      - principalのスペルを確認する。
      - すべての関連ノード（Doris FE/BEとKDC）で正しいホスト名とIPアドレスのエントリが設定されていることを確認する。

9. Cannot find KDC for realm "XXX"
   - 原因: 指定されたrealmに対してKDCが`krb5.conf`で設定されていない。
   - 修正方法:
      - `[realms]`セクション下のrealm名を確認する。
      - `kdc`アドレスを確認する。
      - `/etc/krb5.conf`を変更した後、BEとFEを再起動する。

10. Request is a replay
- 原因: KDCが認証リクエストが重複していると判断している。典型的な理由: ノード間の時刻のずれ、または複数のサービスが同じprincipalを共有している。
- 修正方法:
   - すべてのノードでNTPを有効にして時刻を同期させる。
   - `service/_HOST@REALM`などのサービスインスタンス固有のprincipalを使用して、共有を避ける。

11. Client not found in Kerberos database
- 原因: クライアントprincipalがKerberosデータベースに存在しない。
- 修正方法: KDCでprincipalを作成する。

12. Message stream modified (41)
- 原因: 特定のOS（例：CentOS 7）とKerberos/Javaの組み合わせでの既知の問題。
- 修正方法: ベンダーパッチまたはセキュリティアップデートを適用する。

13. Pre-authentication information was invalid (24)
- 原因:
   - 無効な事前認証データ。
   - クライアントとKDC間の時刻のずれ。
   - JDKの暗号化設定とKDCの設定が一致しない。
- 修正方法:
   - すべてのノードで時刻を同期させる。
   - 暗号化設定を合わせる。
