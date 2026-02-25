---
{
  "title": "Hive Metastore",
  "description": "このドキュメントでは、CREATE CATALOG文を通じてHive MetaStoreサービスに接続およびアクセスする際にサポートされるすべてのパラメータについて説明します。",
  "language": "ja"
}
---
このドキュメントでは、`CREATE CATALOG`文を通じてHive MetaStoreサービスへの接続およびアクセス時にサポートされるすべてのパラメータについて説明します。

## サポートされるCatalogタイプ

| Catalog Type | Type Identifier (type) | Description                      |
| ------------ | ---------------------- | -------------------------------- |
| Hive         | hms                    | Catalog for connecting to Hive Metastore |
| Iceberg      | iceberg                | Catalog for Iceberg table format |
| Paimon       | paimon                 | Catalog for Apache Paimon table format |

## 共通パラメータ概要

以下のパラメータは異なるCatalogタイプに共通です。

| Parameter Name                     | Former Name                       | Required | Default | Description                                                                                                                                                                              |
| ---------------------------------- | --------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hive.metastore.uris                |                                   | Yes      | None    | Hive MetastoreのURIアドレス、カンマで区切られた複数のURIをサポートします。例: 'hive.metastore.uris' = 'thrift://127.0.0.1:9083','hive.metastore.uris' = 'thrift://127.0.0.1:9083,thrift://127.0.0.1:9084' |
| hive.metastore.authentication.type | hadoop.security.authentication    | No       | simple  | Metastore認証方式: simple（デフォルト）またはkerberosをサポートします。バージョン3.0以前では、認証方式はhadoop.security.authenticationプロパティによって決定されていました。バージョン3.1以降、Hive Metastore認証方式を個別に指定できます。例: 'hive.metastore.authentication.type' = 'kerberos' |
| hive.metastore.service.principal   | hive.metastore.kerberos.principal | No       | Empty   | Hiveサーバープリンシパル、_HOSTプレースホルダーをサポートします。例: 'hive.metastore.service.principal' = 'hive/_HOST@EXAMPLE.COM'                                                               |
| hive.metastore.client.principal    | hadoop.kerberos.principal         | No       | Empty   | DorisがHive MetaStoreサービスに接続するために使用するKerberosプリンシパル。                                                                                                                  |
| hive.metastore.client.keytab       | hadoop.kerberos.keytab            | No       | Empty   | Kerberosキータブファイルパス                                                                                                                                                               |
| hive.metastore.username            | hadoop.username                   | No       | hadoop  | Hive Metastoreユーザー名、非Kerberosモードで使用                                                                                                                                      |
| hive.conf.resources                |                                   | No       | Empty   | hive-site.xml設定ファイルパス、相対パスを使用                                                                                                                             |
| hive.metastore.client.socket.timeout                |                                   | No    | デフォルト値はFE設定パラメータの`hive_metastore_client_timeout_second`、デフォルトは10秒。 | このパラメータはバージョン4.0.3以降でサポートされます。Hive Metastore Client接続を通じてメタデータにアクセスする際のタイムアウト。メタデータが大きい場合（例：パーティションが多数ある場合）、この値を増加させることができます。 |

> 注意:
>
> バージョン3.1.0より前では、旧名称を使用してください。

### 必須パラメータ

* `hive.metastore.uris`: Hive MetastoreのURIアドレスを指定する必要があります

### オプションパラメータ

* `hive.metastore.authentication.type`: 認証方式、デフォルトは`simple`、`kerberos`を選択可能

* `hive.metastore.service.principal`: Hive MetaStoreサービスのKerberosプリンシパル、Kerberos認証使用時に指定が必要です。

* `hive.metastore.client.principal`: DorisがHive MetaStoreサービスに接続するために使用するKerberosプリンシパル、Kerberos認証使用時に指定が必要です。

* `hive.metastore.client.keytab`: Kerberosキータブファイルパス、Kerberos認証使用時に指定が必要です。

* `hive.metastore.username`: Hive MetaStoreサービス接続用ユーザー名、非Kerberosモードで使用、デフォルトは`hadoop`です。

* `hive.conf.resources`: hive-site.xml設定ファイルパス、Hive Metastoreサービス接続用の設定を設定ファイルから読み取る必要がある場合に使用します。

### 認証方式

#### Simple認証

* `simple`: 非Kerberosモード、Hive Metastoreサービスに直接接続します。

#### Kerberos認証

Kerberos認証を使用してHive Metastoreサービスに接続するには、以下のパラメータを設定します：

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
Kerberos認証が有効なHive MetaStoreサービスを使用する場合、すべてのFEノードに同じkeytabファイルが存在し、Dorisプロセスを実行するユーザーがkeytabファイルに対する読み取り権限を持ち、krb5設定ファイルが適切に設定されていることを確認してください。

詳細なKerberos設定については、Kerberos Authenticationを参照してください。

### 設定ファイルパラメータ

#### `hive.conf.resources`

設定ファイルを通じてHive Metastoreサービスへの接続設定を読み取る必要がある場合、`hive.conf.resources`パラメータを設定してconfファイルパスを指定できます。

> 注意：`hive.conf.resources`パラメータは相対パスのみをサポートし、絶対パスは使用しないでください。デフォルトパスは`${DORIS_HOME}/plugins/hadoop_conf/`ディレクトリの下にあります。fe.confでhadoop_config_dirを変更することで、他のディレクトリを指定できます。

例：`'hive.conf.resources' = 'hms-1/hive-site.xml'`

## Catalogタイプ固有のデータ

以下のパラメータは、共通パラメータに加えて、各Catalogタイプに固有のものです。

### Hive Catalog

| パラメータ名        | 旧名称      | 必須     | デフォルト | 説明                                                                 |
| ------------------- | ----------- | -------- | ---------- | -------------------------------------------------------------------- |
| type                |             | Yes      | None       | Catalogタイプ、Hive Catalogの場合はhmsで固定                        |
| hive.metastore.type |             | No       | 'hms'      | メタデータCatalogタイプ、Hive Metastoreの場合はhmsで固定、HiveMetaStoreを使用する場合はhmsである必要があります |

#### 例

1. 認証なしのHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを使用してHive Catalogを作成する。

   ```sql
   CREATE CATALOG hive_hms_s3_test_catalog PROPERTIES (
       'type' = 'hms',
       'hive.metastore.uris' = 'thrift://127.0.0.1:9383',
       's3.access_key' = 'S3_ACCESS_KEY',
       's3.secret_key' = 'S3_SECRET_KEY',
       's3.region' = 's3.ap-east-1.amazonaws.com'
   );
   ```
2. Kerberos認証を有効にしたHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを使用してHive Catalogを作成します。

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
### Iceberg Catalog

| Parameter Name       | Former Name | Required | Default | Description                                                          |
| -------------------- | ----------- | -------- | ------- | -------------------------------------------------------------------- |
| type                 |             | Yes      | None    | カタログタイプ、Icebergの場合はicebergに固定                              |
| iceberg.catalog.type |             | No       | None    | メタデータカタログタイプ、Hive Metastoreの場合はhmsに固定、HiveMetaStoreを使用する際はhmsである必要があります |
| warehouse            |             | No       | None    | Icebergウェアハウスパス                                                 |

#### 例

1. メタデータサービスとしてHive Metastore、ストレージサービスとしてS3を使用するIceberg Catalogを作成します。

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
2. マルチKerberos環境において、Kerberos認証を有効にしたHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを利用するIceberg Catalogを作成する。

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
### Paimon Catalog

| Parameter Name      | Former Name | Required | Default    | Description                                                         |
| ------------------- | ----------- | -------- | ---------- | ------------------------------------------------------------------- |
| type                |             | Yes      | None       | カタログのタイプ。Paimon の場合は paimon に固定                           |
| paimon.catalog.type |             | No       | filesystem | HiveMetaStore を使用する場合は hms である必要があります。デフォルトは filesystem でメタデータをファイルシステムに保存します |
| warehouse           |             | Yes      | None       | Paimon warehouse のパス                                               |

#### 例

1. メタデータサービスとして Hive Metastore を使用し、ストレージサービスに S3 を使用する Paimon Catalog を作成します。

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
2. マルチKerberos環境において、Kerberos認証を有効にしたHive Metastoreをメタデータサービスとして使用し、S3ストレージサービスを利用するPaimon Catalogを作成します。

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
## HMS Access Port Requirements

DorisがHMSにアクセスするには、少なくとも以下のポートを開く必要があります：

| Service        | Port Purpose          | Default Port | Protocol |
|----------------|-----------------------|--------------|----------|
| Hive Metastore | Thrift (metadata access) | 9083         | TCP      |

注意事項:
- ポートは`hive-site.xml`でカスタマイズできます。常に実際の設定に従ってください。
- Kerberos認証が有効になっている場合、DorisからKerberos KDCへのネットワーク接続を確保してください。KDCはデフォルトでTCPポート88をリッスンしますが、KDC設定でカスタマイズされていない場合に限ります。

## よくある質問 (FAQ)

- Q1: hive-site.xmlは必須ですか？

    いいえ、設定を読み取る必要がある場合にのみ使用されます。

- Q2: keytabファイルは全てのノードに存在する必要がありますか？

    はい、全てのFEノードが指定されたパスにアクセスできる必要があります。

- Q3: DorisでHive/Icebergデータベース/テーブルを作成する書き戻し機能を使用する際に注意すべき点は何ですか？

    テーブル作成にはストレージ側でのメタデータ操作、つまりストレージシステムへのアクセスが含まれるため、Hive MetaStoreサービスのサーバー側でS3、OSSなどのストレージサービスのアクセスパラメータなど、対応するストレージパラメータを設定する必要があります。オブジェクトストレージを基盤ストレージシステムとして使用する場合、書き込み先のバケットが設定されたRegionと一致することを確認してください。
