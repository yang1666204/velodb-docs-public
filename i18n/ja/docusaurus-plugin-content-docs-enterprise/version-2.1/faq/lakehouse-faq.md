---
{
  "title": "データレイクハウス FAQ",
  "description": "これは通常、誤ったKerberos認証情報が原因です。以下の手順に従ってトラブルシューティングを行うことができます：",
  "language": "ja"
}
---
## Certificate Issues

1. クエリ実行時に、エラー `curl 77: Problem with the SSL CA cert.` が発生します。これは現在のシステム証明書が古すぎることを示しており、ローカルで更新する必要があります。
   - 最新のCA証明書を `https://curl.haxx.se/docs/caextract.html` からダウンロードできます。
   - ダウンロードした `cacert-xxx.pem` を `/etc/ssl/certs/` ディレクトリに配置します。例：`sudo cp cacert-xxx.pem /etc/ssl/certs/ca-certificates.crt`

2. クエリ実行時に、エラーが発生します：`ERROR 1105 (HY000): errCode = 2, detailMessage = (x.x.x.x)[CANCELLED][INTERNAL_ERROR]error setting certificate verify locations: CAfile: /etc/ssl/certs/ca-certificates.crt CApath: none`

```
yum install -y ca-certificates
ln -s /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt /etc/ssl/certs/ca-certificates.crt
```
## Kerberos

1. Kerberosで認証されたHive Metastoreに接続する際、`GSS initiate failed`エラーが発生する。

   これは通常、Kerberos認証情報が正しくないことが原因です。以下の手順でトラブルシューティングできます：

    1. 1.2.1より前のバージョンでは、Dorisが依存するlibhdfs3ライブラリでgsaslが有効化されていませんでした。1.2.2以降のバージョンにアップデートしてください。
    2. 各コンポーネントに正しいkeytabとprincipalが設定されていることを確認し、すべてのFEおよびBEノードでkeytabファイルが存在することを確認してください。

        - `hadoop.kerberos.keytab`/`hadoop.kerberos.principal`：Hadoop hdfsアクセスに使用されます。hdfsに対応する値を入力してください。
        - `hive.metastore.kerberos.principal`：hive metastoreに使用されます。

    3. principalのIPをドメイン名に置き換えてみてください（デフォルトの`_HOST`プレースホルダーは使用しないでください）。
    4. すべてのFEおよびBEノードに`/etc/krb5.conf`ファイルが存在することを確認してください。

2. Hive CatalogでHiveデータベースに接続する際、`RemoteException: SIMPLE authentication is not enabled. Available:[TOKEN, KERBEROS]`エラーが発生する。

    `show databases`および`show tables`に問題がない状態でクエリ中にエラーが発生する場合は、以下の2つの手順に従ってください：
    - core-site.xmlとhdfs-site.xmlをfe/confおよびbe/confディレクトリに配置する。
    - BEノードでKerberos kinitを実行し、BEを再起動してからクエリを実行する。
    
    Kerberosで設定されたTableをクエリ中に`GSSException: No valid credentials provided (Mechanism level: Failed to find any Kerberos Ticket)`エラーが発生した場合、通常FEおよびBEノードを再起動することで問題が解決されます。
    
    - すべてのノードを再起動する前に、`"${DORIS_HOME}/be/conf/be.conf"`のJAVA_OPTSパラメータで`-Djavax.security.auth.useSubjectCredsOnly=false`を設定し、アプリケーションではなく基盤メカニズムを通じてJAAS認証情報を取得してください。
    - 一般的なJAASエラーの解決方法については、[JAAS トラブルシューティング](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jgss/tutorials/Troubleshooting.html)を参照してください。
    
    CatalogでKerberosを設定する際に`Unable to obtain password from user`エラーを解決するには：
    
    - 使用されるprincipalが`klist -kt your.keytab`で確認してklistに記載されていることを確認してください。
    - `yarn.resourcemanager.principal`などの設定の不備がないか、catalogの設定を確認してください。
    - 上記のチェックで問題がない場合、システムのパッケージマネージャーでインストールされたJDKバージョンが特定の暗号化アルゴリズムをサポートしていない可能性があります。手動でJDKをインストールし、`JAVA_HOME`環境変数を設定することを検討してください。
    - Kerberosは通常、暗号化にAES-256を使用します。Oracle JDKの場合、JCEをインストールする必要があります。一部のOpenJDKディストリビューションでは、無制限強度JCEが自動的に提供されるため、個別にインストールする必要がありません。
    - JCEバージョンはJDKバージョンに対応しています。JDKバージョンに基づいて適切なJCE zipパッケージをダウンロードし、`$JAVA_HOME/jre/lib/security`ディレクトリに展開してください：
      - JDK6: [JCE6](http://www.oracle.com/technetwork/java/javase/downloads/jce-6-download-429243.html)
      - JDK7: [JCE7](http://www.oracle.com/technetwork/java/embedded/embedded-se/downloads/jce-7-download-432124.html)
      - JDK8: [JCE8](http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html)
    
    KMSでHDFSにアクセス中に`java.security.InvalidKeyException: Illegal key size`エラーが発生した場合、JDKバージョンをJava 8 u162以上にアップグレードするか、対応するJCE Unlimited Strength Jurisdiction Policy Filesをインストールしてください。
    
    CatalogでKerberosを設定すると`SIMPLE authentication is not enabled. Available:[TOKEN, KERBEROS]`エラーが発生する場合は、`core-site.xml`ファイルを`"${DORIS_HOME}/be/conf"`ディレクトリに配置してください。
    
    HDFSにアクセスすると`No common protection layer between client and server`エラーが発生する場合は、クライアントとサーバーの`hadoop.rpc.protection`プロパティが一致していることを確認してください。

    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
    
    <configuration>
    
        <property>
            <name>hadoop.security.authentication</name>
            <value>kerberos</value>
        </property>
        
    </configuration>
    ```
Kerberos が設定されたBroker Loadを使用して`Cannot locate default realm.`エラーが発生する場合：
    
    Broker Load用の`start_broker.sh`スクリプトの`JAVA_OPTS`に設定項目`-Djava.security.krb5.conf=/your-path`を追加してください。

3. CatalogでKerberos設定を使用する場合、`hadoop.username`プロパティは同時に使用できません。

4. JDK 17でのKerberosアクセス

    JDK 17でDorisを実行してKerberosサービスにアクセスする場合、非推奨の暗号化アルゴリズムを使用するためアクセスに問題が発生する可能性があります。krb5.confに`allow_weak_crypto=true`プロパティを追加するか、Kerberosの暗号化アルゴリズムをアップグレードする必要があります。

    詳細については以下を参照してください：<https://seanjmullan.org/blog/2021/09/14/jdk17#kerberos>

## JDBC カタログ

1. JDBC CatalogでSQLServerへの接続エラー：`unable to find valid certification path to requested target`

   `jdbc_url`に`trustServerCertificate=true`オプションを追加してください。

2. JDBC CatalogでMySQLデータベースに接続すると中国語文字化けが発生する、または中国語文字のクエリ条件が正しく動作しない

   `jdbc_url`に`useUnicode=true&characterEncoding=utf-8`を追加してください。

   > 注：バージョン1.2.3以降、JDBC CatalogでMySQLデータベースに接続する場合、これらのパラメータは自動的に追加されます。

3. JDBC CatalogでMySQLデータベースへの接続エラー：`Establishing SSL connection without server's identity verification is not recommended`

   `jdbc_url`に`useSSL=true`を追加してください。

4. JDBC Catalogを使用してMySQLデータをDorisに同期する際、日付データの同期エラーが発生する。MySQLバージョンとMySQLドライバパッケージが一致しているか確認してください。例えば、MySQL 8以上ではドライバcom.mysql.cj.jdbc.Driverが必要です。

5. 単一フィールドが大きすぎる場合、クエリ実行時にBE側でJavaメモリOOMが発生する。

   Jdbc Scannerが JDBC を通じてデータを読み取る際、セッション変数`batch_size`がJVMでバッチごとに処理する行数を決定します。単一フィールドが大きすぎる場合、`field_size * batch_size`（概算値、JVM静的メモリとデータコピーオーバーヘッドを考慮）がJVMメモリ制限を超え、OOMが発生する可能性があります。

   解決策：

   - `set batch_size = 512;`を実行して`batch_size`の値を減らす。デフォルト値は4064です。
   - `JAVA_OPTS`の`-Xmx`パラメータを変更してBE JVMメモリを増やす。例：`-Xmx8g`。

## Hive カタログ

1. Hive CatalogでIcebergまたはHiveTableにアクセスするとエラーが報告される：`failed to get schema`または`Storage schema reading not supported`

    以下の方法を試すことができます：
    
    * `iceberg`のruntime関連jarパッケージをHiveのlib/ディレクトリに配置する。
    
    * `hive-site.xml`で設定する：

        ```
        metastore.storage.schema.reader.impl=org.apache.hadoop.hive.metastore.SerDeStorageSchemaReader
        ```
設定が完了した後、Hive Metastoreを再起動する必要があります。

    * Catalogプロパティに `"get_schema_from_table" = "true"` を追加します

        このパラメータはバージョン2.1.10および3.0.6以降でサポートされています。

2. Hive Catalogへの接続エラー: `Caused by: java.lang.NullPointerException`

   fe.logに以下のスタックトレースが含まれている場合:

    ```
    Caused by: java.lang.NullPointerException
        at org.apache.hadoop.hive.ql.security.authorization.plugin.AuthorizationMetaStoreFilterHook.getFilteredObjects(AuthorizationMetaStoreFilterHook.java:78) ~[hive-exec-3.1.3-core.jar:3.1.3]
        at org.apache.hadoop.hive.ql.security.authorization.plugin.AuthorizationMetaStoreFilterHook.filterDatabases(AuthorizationMetaStoreFilterHook.java:55) ~[hive-exec-3.1.3-core.jar:3.1.3]
        at org.apache.hadoop.hive.metastore.HiveMetaStoreClient.getAllDatabases(HiveMetaStoreClient.java:1548) ~[doris-fe.jar:3.1.3]
        at org.apache.hadoop.hive.metastore.HiveMetaStoreClient.getAllDatabases(HiveMetaStoreClient.java:1542) ~[doris-fe.jar:3.1.3]
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[?:1.8.0_181]
    ```
`create catalog` ステートメントに `"metastore.filter.hook" = "org.apache.hadoop.hive.metastore.DefaultMetaStoreFilterHookImpl"` を追加して解決してみてください。

3. Hive カタログ の作成後、`show tables` は正常に動作するが、クエリ実行時に `java.net.UnknownHostException: xxxxx` が発生する場合

    CATALOG の PROPERTIES に以下を追加してください：

    ```
    'fs.defaultFS' = 'hdfs://<your_nameservice_or_actually_HDFS_IP_and_port>'
    ```
4. Hive 1.xのorc形式のTableでは、基盤となるorcファイルスキーマ内のシステムカラム名が`_col0`、`_col1`、`_col2`などとして表示される場合があります。この場合、カタログ設定で`hive.version`を1.x.xとして追加し、hiveTable内のカラム名とマッピングしてください。

    ```sql
    CREATE CATALOG hive PROPERTIES (
        'hive.version' = '1.x.x'
    );
    ```
5. Catalogを使用してTableデータをクエリする際に、`Invalid method name`などのHive Metastoreに関連するエラーが発生する場合は、`hive.version`パラメータを設定してください。

6. ORC形式のTableをクエリする際に、FEが`Could not obtain block`または`Caused by: java.lang.NoSuchFieldError: types`を報告する場合、これはFEがデフォルトでHDFSにアクセスしてファイル情報を取得し、ファイル分割を実行することが原因である可能性があります。場合によっては、FEがHDFSにアクセスできない場合があります。これは次のパラメータを追加することで解決できます：`"hive.exec.orc.split.strategy" = "BI"`。その他のオプションにはHYBRID（デフォルト）およびETLがあります。

7. Hiveでは、HudiTableのパーティションフィールド値を見つけることができますが、Dorisでは見つけることができません。DorisとHiveは現在、Hudiをクエリする方法が異なります。Dorisでは、HudiTableのavscファイル構造にパーティションフィールドを追加する必要があります。追加しない場合、Dorisはpartition_valが空の状態でクエリを実行します（`hoodie.datasource.hive_sync.partition_fields=partition_val`が設定されていても）。

    ```
    {
        "type": "record",
        "name": "record",
        "fields": [{
            "name": "partition_val",
            "type": [
                "null",
                "string"
                ],
            "doc": "Preset partition field, empty string when not partitioned",
            "default": null
            },
            {
            "name": "name",
            "type": "string",
            "doc": "Name"
            },
            {
            "name": "create_time",
            "type": "string",
            "doc": "Creation time"
            }
        ]
    }
    ```
8. Hive外部Tableをクエリする際に、エラー`java.lang.ClassNotFoundException: Class com.hadoop.compression.lzo.LzoCodec not found`が発生した場合、Hadoop環境内で`hadoop-lzo-*.jar`を検索し、`"${DORIS_HOME}/fe/lib/"`ディレクトリに配置してFEを再起動してください。バージョン2.0.2以降では、このファイルをFEの`custom_lib/`ディレクトリ（存在しない場合は手動で作成）に配置することで、libディレクトリが置き換えられることによるクラスターアップグレード時のファイル損失を防ぐことができます。

9. serdeを`org.apache.hadoop.hive.contrib.serde2.MultiDelimitserDe`として指定してHiveTableを作成し、Tableにアクセスする際にエラー`storage schema reading not supported`が発生した場合、hive-site.xmlファイルに以下の設定を追加してHMSサービスを再起動してください：

    ```
    <property>
      <name>metastore.storage.schema.reader.impl</name>
      <value>org.apache.hadoop.hive.metastore.SerDeStorageSchemaReader</value>
   </property> 
    ```
10. エラー: `java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty`。FEログの完全なエラーメッセージは以下の通りです:

    ```
    org.apache.doris.common.UserException: errCode = 2, detailMessage = S3 list path failed. path=s3://bucket/part-*,msg=errors while get file status listStatus on s3://bucket: com.amazonaws.SdkClientException: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    org.apache.doris.common.UserException: errCode = 2, detailMessage = S3 list path exception. path=s3://bucket/part-*, err: errCode = 2, detailMessage = S3 list path failed. path=s3://bucket/part-*,msg=errors while get file status listStatus on s3://bucket: com.amazonaws.SdkClientException: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    org.apache.hadoop.fs.s3a.AWSClientIOException: listStatus on s3://bucket: com.amazonaws.SdkClientException: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    Caused by: com.amazonaws.SdkClientException: Unable to execute HTTP request: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    Caused by: javax.net.ssl.SSLException: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    Caused by: java.lang.RuntimeException: Unexpected error: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    Caused by: java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
    ```
`update-ca-trust (CentOS/RockyLinux)`を使用してFEノード上のCA証明書を更新し、その後FEプロセスを再起動してください。

11. BEエラー: `java.lang.InternalError`。`be.INFO`で以下のようなエラーが表示される場合:

    ```
    W20240506 15:19:57.553396 266457 jni-util.cpp:259] java.lang.InternalError
            at org.apache.hadoop.io.compress.zlib.ZlibDecompressor.init(Native Method)
            at org.apache.hadoop.io.compress.zlib.ZlibDecompressor.<init>(ZlibDecompressor.java:114)
            at org.apache.hadoop.io.compress.GzipCodec$GzipZlibDecompressor.<init>(GzipCodec.java:229)
            at org.apache.hadoop.io.compress.GzipCodec.createDecompressor(GzipCodec.java:188)
            at org.apache.hadoop.io.compress.CodecPool.getDecompressor(CodecPool.java:183)
            at org.apache.parquet.hadoop.CodecFactory$HeapBytesDecompressor.<init>(CodecFactory.java:99)
            at org.apache.parquet.hadoop.CodecFactory.createDecompressor(CodecFactory.java:223)
            at org.apache.parquet.hadoop.CodecFactory.getDecompressor(CodecFactory.java:212)
            at org.apache.parquet.hadoop.CodecFactory.getDecompressor(CodecFactory.java:43)
    ```
これは、Dorisの組み込み`libz.a`がシステム環境の`libz.so`と競合するためです。この問題を解決するには、まず`export LD_LIBRARY_PATH=/path/to/be/lib:$LD_LIBRARY_PATH`を実行し、その後BEプロセスを再起動してください。

12. Hiveにデータを挿入する際、`HiveAccessControlException 許可 denied: user [user_a] does not have [UPDATE] privilege on [database/table]`というエラーが発生しました。

    データ挿入後、対応する統計情報を更新する必要があり、この更新操作にはalter権限が必要です。そのため、Rangerでこのユーザーにalter権限を追加する必要があります。

## HDFS

1. HDFS 3.xにアクセスする際、`java.lang.VerifyError: xxx`エラーが発生した場合、1.2.1より前のバージョンでは、DorisはHadoopバージョン2.8に依存しています。2.10.2に更新するか、Dorisを1.2.2以降のバージョンにアップグレードする必要があります。

2. Hedged Readを使用して低速なHDFS読み取りを最適化します。場合によっては、HDFSの高負荷により、特定のHDFS上のデータレプリカの読み取り時間が長くなり、全体的なクエリ効率が低下することがあります。HDFS ClientはHedged Read機能を提供します。この機能は、読み取り要求が一定の閾値を超えても戻らない場合、同じデータを読み取る別の読み取りスレッドを開始し、最初に返された結果を使用します。

    注意：この機能はHDFSクラスターの負荷を増加させる可能性があるため、慎重に使用してください。

    この機能を有効にするには：

    ```
    create catalog regression properties (
        'type'='hms',
        'hive.metastore.uris' = 'thrift://172.21.16.47:7004',
        'dfs.client.hedged.read.threadpool.size' = '128',
        'dfs.client.hedged.read.threshold.millis' = "500"
    );
    ```
`dfs.client.hedged.read.threadpool.size` は Hedged Read に使用されるスレッド数を表し、これらは HDFS クライアント によって共有されます。通常、HDFS クラスターでは、BE ノードは HDFS クライアント を共有します。

`dfs.client.hedged.read.threshold.millis` は読み取り閾値をミリ秒で表します。読み取りリクエストが戻らずにこの閾値を超えると、Hedged Read がトリガーされます。

有効にすると、Query Profile で関連パラメータを確認できます：

`TotalHedgedRead`: Hedged Read が開始された回数。

`HedgedReadWins`: Hedged Read が成功した回数（リクエストが開始され、元のリクエストよりも速く戻った回数）

これらの値は単一の HDFS クライアント の累積値であり、単一クエリの値ではないことに注意してください。同じ HDFS クライアント は複数のクエリで再利用される可能性があります。

3. `Couldn't create proxy provider class org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider`

    FE と BE の開始スクリプトでは、環境変数 `HADOOP_CONF_DIR` が CLASSPATH に追加されます。`HADOOP_CONF_DIR` が誤って設定されている場合、存在しないパスや誤ったパスを指していると、間違った xxx-site.xml ファイルを読み込み、誤った情報を読み取る可能性があります。

    `HADOOP_CONF_DIR` が正しく設定されているかを確認するか、この環境変数を削除してください。

4. `BlockMissingExcetpion: Could not obtain block: BP-XXXXXXXXX No live nodes contain current block`

    可能な解決策は以下の通りです：
    - `hdfs fsck file -files -blocks -locations` を使用してファイルが正常かどうかを確認する。
    - `telnet` を使用して datanode との接続性を確認する。
    - datanode のログを確認する。

    以下のエラーが発生した場合：

    `org.apache.hadoop.hdfs.server.datanode.DataNode: Failed to read expected SASL data transfer protection handshake from client at /XXX.XXX.XXX.XXX:XXXXX. Perhaps the client is running an older version of Hadoop which does not support SASL data transfer protection`
    これは、現在の hdfs で暗号化転送が有効になっているが、クライアントでは有効になっていないため、エラーが発生していることを意味します。

    以下のいずれかの解決策を使用してください：
    - hdfs-site.xml と core-site.xml を be/conf と fe/conf ディレクトリにコピーする。（推奨）
    - hdfs-site.xml で対応する設定 `dfs.data.transfer.protection` を見つけ、このパラメータを catalog に設定する。

## DLF カタログ

1. DLF カタログ を使用する際、BE が JindoFS データを読み取る際に `Invalid address` が発生する場合は、ログに表示されるドメイン名と IP のマッピングを `/etc/hosts` に追加してください。

2. データを読み取る権限がない場合は、`hadoop.username` プロパティを使用して権限を持つユーザーを指定してください。

3. DLF カタログ のメタデータは DLF と一致している必要があります。DLF を使用してメタデータを管理する場合、Hive で新しくインポートされたパーティションが DLF によって同期されていない可能性があり、DLF と Hive のメタデータ間に不整合が生じる可能性があります。この問題を解決するには、Hive のメタデータが DLF によって完全に同期されるようにしてください。

## その他の問題

1. Binary 型を Doris にマッピング後、クエリ結果が文字化けする

    Doris は本来 Binary 型をサポートしていないため、さまざまなデータレイクやデータベースから Binary 型を Doris にマッピングする際は、通常 String 型を使用します。String 型は印刷可能文字のみを表示できます。Binary データの内容をクエリする必要がある場合は、`TO_BASE64()` 関数を使用して Base64 エンコーディングに変換してから、さらに処理することができます。

2. Parquet ファイルの分析

    Parquet ファイルをクエリする際、異なるシステムで生成された Parquet ファイルのフォーマットには、RowGroup の数やインデックス値などの違いがある可能性があるため、問題の特定やパフォーマンス分析のために Parquet ファイルのメタデータを確認する必要がある場合があります。ここでは、ユーザーが Parquet ファイルをより便利に分析できるように提供されるツールを紹介します：

    1. [Apache Parquet Cli 1.14.0](https://github.com/morningman/tools/releases/download/apache-parquet-cli-1.14.0/apache-parquet-cli-1.14.0.tar.xz) をダウンロードして解凍する
    2. 分析したい Parquet ファイルをローカルマシンにダウンロードし、パスを `/path/to/file.parquet` と仮定する
    3. 以下のコマンドを使用して Parquet ファイルのメタデータを分析する：

        `./parquet-tools meta /path/to/file.parquet`

    4. その他の機能については、[Apache Parquet Cli ドキュメント](https://github.com/apache/parquet-java/tree/apache-parquet-1.14.0/parquet-cli) を参照してください
