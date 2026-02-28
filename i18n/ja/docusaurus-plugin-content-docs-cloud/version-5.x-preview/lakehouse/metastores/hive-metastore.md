---
{
  "title": "Hive Metastore",
  "description": "このドキュメントでは、CREATE CATALOG文を通じてHive MetaStoreサービスに接続およびアクセスする際にサポートされているすべてのパラメータについて説明します。",
  "language": "ja"
}
---
この文書では、`CREATE CATALOG`文を使用してHive MetaStoreサービスに接続し、アクセスする際のサポートされているすべてのパラメータについて説明します。

## サポートされているCatalogタイプ

| カタログ タイプ | タイプ Identifier (type) | デスクリプション                      |
| ------------ | ---------------------- | -------------------------------- |
| Hive         | hms                    | カタログ for connecting to Hive Metastore |
| Iceberg      | iceberg                | カタログ for Iceberg table format |
| Paimon       | paimon                 | カタログ for Apache Paimon table format |

## 共通パラメータ概要

以下のパラメータは、異なるCatalogタイプに共通するものです。

| パラメータ名                     | 旧称                       | Required | Default | デスクリプション                                                                                                                                                                              |
| ---------------------------------- | --------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hive.metastore.uris                |                                   | Yes      | None    | Hive MetastoreのURIアドレス、カンマで区切って複数のURIをサポートします。例: 'hive.metastore.uris' = 'thrift://127.0.0.1:9083','hive.metastore.uris' = 'thrift://127.0.0.1:9083,thrift://127.0.0.1:9084' |
| hive.metastore.authentication.type | hadoop.security.authentication    | No       | simple  | Metastore認証方法：simple（デフォルト）またはkerberosをサポートします。バージョン3.0以前では、認証方法はhadoop.security.authenticationプロパティによって決定されていました。バージョン3.1以降では、Hive Metastore認証方法を個別に指定できます。例: 'hive.metastore.authentication.type' = 'kerberos' |
| hive.metastore.service.principal   | hive.metastore.kerberos.principal | No       | Empty   | Hiveサーバープリンシパル、_HOSTプレースホルダーをサポートします。例: 'hive.metastore.service.principal' = 'hive/_HOST@EXAMPLE.COM'                                                               |
| hive.metastore.client.principal    | hadoop.kerberos.principal         | No       | Empty   | DorisがHive MetaStoreサービスに接続するために使用するKerberosプリンシパル。                                                                                                                  |
| hive.metastore.client.keytab       | hadoop.kerberos.keytab            | No       | Empty   | Kerberosキータブファイルパス                                                                                                                                                               |
| hive.metastore.username            | hadoop.username                   | No       | hadoop  | Hive Metastoreユーザー名、非Kerberosモードで使用                                                                                                                                      |
| hive.conf.resources                |                                   | No       | Empty   | hive-site.xml設定ファイルパス、相対パスを使用                                                                                                                             |
| hive.metastore.client.socket.timeout                |                                   | No    | デフォルト値はFE設定パラメータの`hive_metastore_client_timeout_second`で、デフォルトは10秒です。 | このパラメータはバージョン4.0.3以降でサポートされています。Hive Metastore Client接続を介したメタデータアクセスのタイムアウト。メタデータが大きい場合（例：パーティションが多数存在する場合）、この値を増やすことができます。 |

> 注意：
>
> バージョン3.1.0より前の場合は、従来の名前を使用してください。

### 必須パラメータ

* `hive.metastore.uris`: Hive MetastoreのURIアドレスを必ず指定する

### オプションパラメータ

* `hive.metastore.authentication.type`: 認証方法、デフォルトは`simple`、オプションで`kerberos`

* `hive.metastore.service.principal`: Hive MetaStoreサービスのKerberosプリンシパル、Kerberos認証を使用する場合に指定が必要です。

* `hive.metastore.client.principal`: DorisがHive MetaStoreサービスに接続するために使用するKerberosプリンシパル、Kerberos認証を使用する場合に指定が必要です。

* `hive.metastore.client.keytab`: Kerberosキータブファイルパス、Kerberos認証を使用する場合に指定が必要です。

* `hive.metastore.username`: Hive MetaStoreサービスに接続するためのユーザー名、非Kerberosモードで使用、デフォルトは`hadoop`。

* `hive.conf.resources`: hive-site.xml設定ファイルパス、Hive Metastoreサービスへの接続設定を設定ファイルから読み込む必要がある場合に使用します。

### 認証方法

#### Simple認証

* `simple`: 非Kerberosモード、Hive Metastoreサービスに直接接続します。

#### Kerberos認証

Hive Metastoreサービスへの接続でKerberos認証を使用するには、以下のパラメータを設定します：

* `hive.metastore.authentication.type`: `kerberos`に設定

* `hive.metastore.service.principal`: Hive MetaStoreサービスのKerberosプリンシパル

* `hive.metastore.client.principal`: DorisがHive MetaStoreサービスに接続するために使用するKerberosプリンシパル

* `hive.metastore.client.keytab`: Kerberosキータブファイルパス

```sql
'hive.metastore.authentication.type' = 'kerberos',
'hive.metastore.service.principal' = 'hive/_HOST@EXAMPLE.COM',
'hive.metastore.client.principal' = 'hive/doris.cluster@EXAMPLE.COM',
'hive.metastore.client.keytab' = '/etc/security/keytabs/hive.keytab'
```
Kerberos認証が有効なHive MetaStoreサービスを使用する場合は、すべてのFEノードに同じkeytabファイルが存在すること、Dorisプロセスを実行するユーザーがkeytabファイルへの読み取り権限を持つこと、およびkrb5設定ファイルが適切に設定されていることを確認してください。

一般的なKerberos設定の問題とベストプラクティスについては、[Kerberos](../best-practices/kerberos.md)を参照してください。

### 設定ファイルパラメータ

#### `hive.conf.resources`

設定ファイルを通じてHive Metastoreサービスへの接続設定を読み取る必要がある場合は、`hive.conf.resources`パラメータを設定してconfファイルのパスを指定できます。

> 注意: `hive.conf.resources`パラメータは相対パスのみをサポートしており、絶対パスは使用しないでください。デフォルトパスは`${DORIS_HOME}/plugins/hadoop_conf/`ディレクトリ以下です。fe.confのhadoop_config_dirを変更することで、他のディレクトリを指定できます。

例: `'hive.conf.resources' = 'hms-1/hive-site.xml'`

## Catalogタイプ固有のデータ

以下のパラメータは、共通パラメータに加えて、各Catalogタイプに固有のものです。

### Hive カタログ

| パラメータ名        | 旧名称      | 必須     | デフォルト | 説明                                                                 |
| ------------------- | ----------- | -------- | ------- | -------------------------------------------------------------------- |
| type                |             | はい     | なし    | Catalogタイプ、Hive Catalogの場合はhmsに固定                        |
| hive.metastore.type |             | いいえ   | 'hms'   | メタデータCatalogタイプ、Hive Metastoreの場合はhmsに固定、HiveMetaStoreを使用する場合はhmsでなければならない |

#### 例

1. 認証なしのHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを使用するHive Catalogを作成します。

   ```sql
   CREATE CATALOG hive_hms_s3_test_catalog PROPERTIES (
       'type' = 'hms',
       'hive.metastore.uris' = 'thrift://127.0.0.1:9383',
       's3.access_key' = 'S3_ACCESS_KEY',
       's3.secret_key' = 'S3_SECRET_KEY',
       's3.region' = 's3.ap-east-1.amazonaws.com'
   );
   ```
2. メタデータサービスとしてKerberos認証を有効にしたHive Metastoreを使用し、S3ストレージサービスを使ったHive Catalogを作成します。

   ```sql
    CREATE CATALOG hive_hms_on_oss_kerberos_new_catalog PROPERTIES (
       'type' = 'hms',
       'hive.metastore.uris' = 'thrift://127.0.0.1:9583',
       'hive.metastore.client.principal'='hive/presto-master.docker.cluster@LABS.TERADATA.COM',
       'hive.metastore.client.keytab' = '/mnt/keytabs/keytabs/hive-presto-master.keytab',
       'hive.metastore.service.principal' = 'hive/hadoop-master@LABS.TERADATA.COM',
       'hive.metastore.authentication.type'='kerberos',
       'hadoop.security.auth_to_local' = 'RULE:[2:\$1@\$0](.*@LABS.TERADATA.COM)s/@.*//
                          RULE:[2:\$1@\$0](.*@OTHERLABS.TERADATA.COM)s/@.*//
                          RULE:[2:\$1@\$0](.*@OTHERREALM.COM)s/@.*//
                          DEFAULT',
       'oss.access_key' = 'OSS_ACCESS_KEY',
       'oss.secret_key' = 'OSS_SECRET_KEY',
       'oss.endpoint' = 'oss-cn-beijing.aliyuncs.com'
   );
   ```
### Iceberg カタログ

| パラメータ名       | 旧称 | Required | Default | デスクリプション                                                          |
| -------------------- | ----------- | -------- | ------- | -------------------------------------------------------------------- |
| type                 |             | Yes      | None    | カタログタイプ、Icebergの場合はicebergで固定                          |
| iceberg.catalog.type |             | No       | None    | メタデータカタログタイプ、Hive Metastoreの場合はhmsで固定、HiveMetaStore使用時はhmsである必要があります |
| warehouse            |             | No       | None    | Icebergウェアハウスパス                                               |

#### Examples

1. S3ストレージサービスを使用し、メタデータサービスとしてHive Metastoreを使用するIceberg Catalogを作成します。

    ```sql
     CREATE CATALOG iceberg_hms_s3_test_catalog PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'hms',
        'hive.metastore.uris' = 'thrift://127.0.0.1:9383',
        'warehouse' = 's3://doris/iceberg_warehouse/',
        's3.access_key' = 'S3_ACCESS_KEY',
        's3.secret_key' = 'S3_SECRET_KEY',
        's3.region' = 's3.ap-east-1.amazonaws.com'
    );
    ```
2. multi-Kerberosの環境で、Kerberos認証が有効になったHive MetastoreをメタデータサービスとしてS3ストレージサービスと組み合わせて使用し、Iceberg Catalogを作成します。

    ```sql
    CREATE CATALOG IF NOT EXISTS iceberg_hms_on_oss_kerberos_new_catalog PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'hms',
        'hive.metastore.uris' = 'thrift://127.0.0.1:9583',
        'warehouse' = 'oss://doris/iceberg_warehouse/',
        'hive.metastore.client.principal'='hive/presto-master.docker.cluster@LABS.TERADATA.COM',
        'hive.metastore.client.keytab' = '/mnt/keytabs/keytabs/hive-presto-master.keytab',
        'hive.metastore.service.principal' = 'hive/hadoop-master@LABS.TERADATA.COM',
        'hive.metastore.authentication.type'='kerberos',
        'hadoop.security.auth_to_local' = 'RULE:[2:\$1@\$0](.*@LABS.TERADATA.COM)s/@.*//
                           RULE:[2:\$1@\$0](.*@OTHERLABS.TERADATA.COM)s/@.*//
                           RULE:[2:\$1@\$0](.*@OTHERREALM.COM)s/@.*//
                           DEFAULT',
        'oss.access_key' = 'OSS_ACCESS_KEY',
        'oss.secret_key' = 'OSS_SECRET_KEY',
        'oss.endpoint' = 'oss-cn-beijing.aliyuncs.com'
    );
    ```
### Paimon カタログ

| パラメータ名      | 旧称 | Required | Default    | デスクリプション                                                         |
| ------------------- | ----------- | -------- | ---------- | ------------------------------------------------------------------- |
| type                |             | Yes      | None       | カタログタイプ、Paimonの場合はpaimonに固定                                          |
| paimon.catalog.type |             | No       | filesystem | HiveMetaStoreを使用する場合はhmsを指定する必要があります。デフォルトはfilesystemでメタデータをファイルシステムに保存します |
| warehouse           |             | Yes      | None       | Paimonウェアハウスパス                                                      |

#### 例

1. Hive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを使用するPaimon Catalogを作成します。

    ```sql
     CREATE CATALOG IF NOT EXISTS paimon_hms_s3_test_catalog PROPERTIES (
        'type' = 'paimon',
        'paimon.catalog.type' = 'hms',
        'hive.metastore.uris' = 'thrift://127.0.0.1:9383',
        'warehouse' = 's3://doris/paimon_warehouse/',
        's3.access_key' = 'S3_ACCESS_KEY',
        's3.secret_key' = 'S3_SECRET_KEY',
        's3.region' = 's3.ap-east-1.amazonaws.com'
    );
    ```
2. マルチKerberos環境において、Kerberos認証が有効化されたHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを利用するPaimon Catalogを作成する。

    ```sql
     CREATE CATALOG IF NOT EXISTS paimon_hms_on_oss_kerberos_new_catalog PROPERTIES (
        'type' = 'paimon',
        'paimon.catalog.type' = 'hms',
        'hive.metastore.uris' = 'thrift://127.0.0.1:9583',
        'warehouse' = 's3://doris/iceberg_warehouse/',
        'hive.metastore.client.principal'='hive/presto-master.docker.cluster@LABS.TERADATA.COM',
        'hive.metastore.client.keytab' = '/mnt/keytabs/keytabs/hive-presto-master.keytab',
        'hive.metastore.service.principal' = 'hive/hadoop-master@LABS.TERADATA.COM',
        'hive.metastore.authentication.type'='kerberos',
        'hadoop.security.auth_to_local' = 'RULE:[2:\$1@\$0](.*@LABS.TERADATA.COM)s/@.*//
                           RULE:[2:\$1@\$0](.*@OTHERLABS.TERADATA.COM)s/@.*//
                           RULE:[2:\$1@\$0](.*@OTHERREALM.COM)s/@.*//
                           DEFAULT',
        'oss.access_key' = 'OSS_ACCESS_KEY',
        'oss.secret_key' = 'OSS_SECRET_KEY',
        'oss.endpoint' = 'oss-cn-beijing.aliyuncs.com'
    );
    ```
## HMS Access Port要件

DorisがHMSにアクセスするには、最低限以下のポートが開かれている必要があります：

| Service        | Port Purpose          | Default Port | Protocol |
|----------------|-----------------------|--------------|----------|
| Hive Metastore | Thrift (metadata access) | 9083         | TCP      |

注意事項：
- ポートは`hive-site.xml`でカスタマイズされる場合があります。必ず実際の設定に従ってください。
- Kerberos認証が有効になっている場合は、DorisからKerberos KDCへのネットワーク接続を確保してください。KDCは、KDC設定でカスタマイズされていない限り、デフォルトでTCPポート88でリッスンします。

## よくある質問（FAQ）

- Q1: hive-site.xmlは必須ですか？

    いいえ、設定をそこから読み込む必要がある場合のみ使用されます。

- Q2: keytabファイルはすべてのノードに存在する必要がありますか？

    はい、すべてのFEノードが指定されたパスにアクセスできる必要があります。

- Q3: ライトバック機能、つまりDorisでHive/Icebergデータベース/Tableを作成する際に注意すべきことは何ですか？

    Tableの作成にはストレージ側でのメタデータ操作、つまりストレージシステムへのアクセスが含まれるため、Hive MetaStoreサービスのサーバー側では、S3やOSSなどのストレージサービスのアクセスパラメータなど、対応するストレージパラメータを設定する必要があります。オブジェクトストレージを基盤ストレージシステムとして使用する場合は、書き込み対象のバケットが設定されたRegionと一致することを確認してください。
