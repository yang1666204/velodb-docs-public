---
{
  "title": "OUTFILE",
  "description": "この文は、SELECT INTO OUTFILE コマンドを使用してクエリ結果をファイルにエクスポートするために使用されます。現在、リモートストレージへのエクスポートをサポートしており、",
  "language": "ja"
}
---
## 説明

このステートメントは、`SELECT INTO OUTFILE`コマンドを使用してクエリ結果をファイルにエクスポートするために使用されます。現在、Brokerプロセス、S3プロトコル、またはHDFSプロトコルを通じて、HDFS、S3、BOS、COS（Tencent Cloud）などのリモートストレージへのエクスポートをサポートしています。

## 構文

```sql
<query_stmt>
INTO OUTFILE "<file_path>"
[ FORMAT AS <format_as> ]
[ <properties> ]
```
## 必須パラメータ

**1. `<query_stmt>`**  

  クエリステートメントは有効なSQL文である必要があります。[クエリステートメントドキュメント](../../data-query/SELECT.md)を参照してください。

**2. `<file_path>`**

  file_pathはファイルが保存されるパスとファイルプレフィックスを指します。例：`hdfs://path/to/my_file_`  

  最終的なファイル名は`my_file_`、ファイル番号、ファイル形式の拡張子で構成されます。ファイルのシリアル番号は0から始まり、番号は分割されるファイル数です。例：  
   - my_file_abcdefg_0.csv
   - my_file_abcdefg_1.csv
   - my_file_abcdegf_2.csv

  ファイルプレフィックスを省略して、ファイルディレクトリのみを指定することも可能です。例：`hdfs://path/to/`  

## オプションパラメータ

**1. `<format_as>`**

   エクスポート形式を指定します。サポートされる形式は以下の通りです：   
   - `CSV` (デフォルト)
   - `PARQUET`
   - `CSV_WITH_NAMES`
   - `CSV_WITH_NAMES_AND_TYPES`
   - `ORC`

   > 注意：PARQUET、CSV_WITH_NAMES、CSV_WITH_NAMES_AND_TYPES、ORCはバージョン1.2以降でサポートされています。

**2. `<properties>`**

```sql
[ PROPERTIES ("<key>"="<value>" [, ... ]) ]
```  
関連プロパティを指定します。現在、Brokerプロセス、S3プロトコル、またはHDFSプロトコル経由でのエクスポートがサポートされています。

**ファイルプロパティ**
- `column_separator`: 列区切り文字、CSV形式でのみ使用されます。バージョン1.2以降ではマルチバイトがサポートされています。例: "\\x01", "abc"。
- `line_delimiter`: 行区切り文字、CSV形式でのみ使用されます。バージョン1.2以降ではマルチバイトがサポートされています。例: "\\x01", "abc"。
- `max_file_size`: 単一ファイルのサイズ制限、結果がこの値を超える場合、複数のファイルに分割されます。max_file_sizeの値の範囲は[5MB, 2GB]で、デフォルトは1GBです。（ファイル形式としてORCが指定された場合、実際の分割ファイルのサイズは64MBの倍数になります。例: max_file_size = 5MBを指定した場合、実際には64MBが分割として使用されます；max_file_size = 65MBを指定した場合、実際には128MBが分割ポイントとして使用されます。）
- `delete_existing_files`: デフォルト`false`。trueに指定された場合、まずfile_pathで指定されたディレクトリ内のすべてのファイルを削除してから、そのディレクトリにデータをエクスポートします。例: "file_path" = "/user/tmp"の場合、"/user/"以下のすべてのファイルとディレクトリを削除します；"file_path" = "/user/tmp/"の場合、"/user/tmp/"以下のすべてのファイルとディレクトリを削除します
- `file_suffix`: エクスポートファイルの接尾辞を指定します。このパラメータが指定されない場合、ファイル形式のデフォルト接尾辞が使用されます。

**Brokerプロパティ** _(`broker`プレフィックスが必要)_
- `broker.name: broker`: broker名
- `broker.hadoop.security.authentication`: 認証方法としてkerberosを指定
- `broker.kerberos_principal`: kerberosのプリンシパルを指定
- `broker.kerberos_keytab`: kerberosのkeytabファイルのパスを指定します。このファイルは、brokerプロセスが配置されているサーバー上のファイルへの絶対パスである必要があり、Brokerプロセスからアクセス可能である必要があります

**HDFSプロパティ**
- `fs.defaultFS`: namenodeアドレスとポート
- `hadoop.username`: hdfsユーザー名
- `dfs.nameservices`: hadoopでHAが有効な場合、fs nameserviceを設定してください。hdfs-site.xmlを参照
- `dfs.ha.namenodes.[nameservice ID]`: nameservice内の各NameNodeの一意識別子。hdfs-site.xmlを参照
- `dfs.namenode.rpc-address.[nameservice ID].[name node ID]`: 各NameNodeがリッスンする完全修飾RPCアドレス。hdfs-site.xmlを参照
- `dfs.client.failover.proxy.provider.[nameservice ID]`: HDFSクライアントがActive NameNodeに接続するために使用するJavaクラス、通常はorg.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProviderです

**kerberos認証が有効なHadoopクラスターの場合、追加のプロパティを設定する必要があります：**
- `dfs.namenode.kerberos.principal`: HDFS namenodeサービスプリンシパル
- `hadoop.security.authentication`: kerberos
- `hadoop.kerberos.principal`: DorisがHDFSに接続する際に使用するKerberosプリンシパル。
- `hadoop.kerberos.keytab`: HDFSクライアントのkeytabの場所。

S3プロトコルの場合、S3プロトコル設定を直接実行できます：
- `s3.endpoint`
- `s3.access_key`
- `s3.secret_key`
- `s3.region`
- `use_path_style`: （オプション）デフォルトfalse。S3 SDKはデフォルトでvirtual-hosted styleを使用します。ただし、一部のオブジェクトストレージシステムでは、virtual-hosted styleアクセスが有効でない、またはサポートされていない場合があります。このとき、use_path_styleパラメータを追加してpath styleアクセス方法の使用を強制できます。

> `delete_existing_files`パラメータを使用するには、fe.confファイルに`enable_delete_existing_files = true`設定を追加してFEを再起動する必要があることに注意してください。その後で`delete_existing_files`パラメータが有効になります。`delete_existing_files = true`の設定は危険な操作であり、テスト環境でのみ使用することを推奨します。

## 戻り値

`Outfile`ステートメントが返す結果は以下のように説明されます：

| Column           | DataType     | Note                                                                                                           |
|------------------|--------------|----------------------------------------------------------------------------------------------------------------|
| FileNumber       | int          | 生成されたファイルの総数。                                                                           |
| TotalRows        | int          | 結果セット内の行数。                                                                          |
| FileSize         | int          | エクスポートされたファイルの総サイズ（バイト単位）。                                                                |
| URL              | string       | エクスポートされたファイルパスのプレフィックス。複数のファイルは`_0`、`_1`のような接尾辞で連続的に番号付けされます。 |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| Privilege        | Object     | 注釈                                           |
|:-----------------|:-----------|:------------------------------------------------|
| SELECT_PRIV      | Database   | データベースとTableへの読み取りアクセスが必要です。 |

## 使用上の注意

### データ型マッピング

- すべてのファイル形式で基本データ型のエクスポートがサポートされていますが、現在csv/orc/csv_with_names/csv_with_names_and_typesのみが複合データ型（ARRAY/MAP/STRUCT）のエクスポートをサポートしています。ネストした複合データ型はサポートされていません。

- ParquetとORCファイル形式には独自のデータ型があります。Dorisのエクスポート機能は、DorisデータタイプをParquet/ORCファイル形式の対応するデータ型に自動的にエクスポートできます。以下は、DorisデータタイプとParquet/ORCファイル形式データタイプのデータタイプマッピング関係です：

1. DorisデータタイプからORCデータタイプへのマッピング関係は：
   | Doris タイプ              | Orc タイプ  |
   |-------------------------|-----------|
   | boolean                 | boolean   |
   | tinyint                 | tinyint   |
   | smallint                | smallint  |
   | int                     | int       |
   | bigint                  | bigint    |
   | largeInt                | string    |
   | date                    | string    |
   | datev2                  | string    |
   | datetime                | string    |
   | datetimev2              | timestamp |
   | float                   | float     |
   | double                  | double    |
   | char / varchar / string | string    |
   | decimal                 | decimal   |
   | struct                  | struct    |
   | map                     | map       |
   | array                   | array     |

2. DorisがParquetファイル形式にデータをエクスポートする場合、DorisメモリデータはまずArrowメモリデータ形式に変換され、その後Arrowによってparaquetファイル形式が書き込まれます。DorisデータタイプからARROWデータタイプへのマッピング関係は：
   | Doris タイプ              | Arrow タイプ |
   |-------------------------|------------|
   | boolean                 | boolean    |
   | tinyint                 | int8       |
   | smallint                | int16      |
   | int                     | int32      |
   | bigint                  | int64      |
   | largeInt                | utf8       |
   | date                    | utf8       |
   | datev2                  | utf8       |
   | datetime                | utf8       |
   | datetimev2              | utf8       |
   | float                   | float32    |
   | double                  | float64    |
   | char / varchar / string | utf8       |
   | decimal                 | decimal128 |
   | struct                  | struct     |
   | map                     | map        |
   | array                   | list       |

### エクスポートデータ量とエクスポート効率

この機能は本質的にSQLクエリコマンドを実行します。最終結果はシングルスレッドでの出力です。そのため、エクスポート全体の所要時間には、クエリ自体の所要時間と最終結果セット書き込みの所要時間が含まれます。クエリが大きい場合は、セッション変数`query_timeout`を設定してクエリタイムアウトを適切に延長する必要があります。

### エクスポートファイルの管理

Dorisはエクスポートされたファイルを管理しません。エクスポートが成功した場合や、エクスポートが失敗した後の残りファイルを含め、すべてユーザーが処理する必要があります。

### ローカルファイルへのエクスポート
ローカルファイルにエクスポートするには、fe.confで`enable_outfile_to_local=true`を設定する必要があります。

   ```sql
   select * from tbl1 limit 10
   INTO OUTFILE "file:///home/work/path/result_";
   ```
ローカルファイルへのエクスポート機能は、パブリッククラウドユーザーには利用できず、プライベート展開でのみ利用可能です。また、デフォルトユーザーはクラスターノードに対する完全な制御権を持ちます。Dorisは、ユーザーが入力したエクスポートパスの妥当性をチェックしません。Dorisのプロセスユーザーがそのパスに対する書き込み権限を持たない場合、またはパスが存在しない場合、エラーが報告されます。同時に、セキュリティ上の理由から、このパスに同じ名前のファイルが既に存在する場合も、エクスポートは失敗します。

Dorisはローカルにエクスポートされたファイルを管理せず、ディスク容量などもチェックしません。これらのファイルは、クリーニングなどを含めてユーザーが管理する必要があります。

### 結果の整合性保証

このコマンドは同期コマンドであるため、実行プロセス中にタスク接続が切断される可能性があり、エクスポートされたデータが正常に終了したか、または完全であるかを確認できない場合があります。この場合、`success_file_name`パラメータを使用して、タスクが成功した後にディレクトリ内に成功ファイル識別子を生成するよう要求できます。ユーザーはこのファイルを使用してエクスポートが正常に終了したかを判断できます。

### 並行エクスポート

セッション変数`set enable_parallel_outfile = true;`を設定すると、outfileを使用した並行エクスポートが有効になります。詳細な使用方法については、Export Query Resultを参照してください。

## 例

- brokerメソッドを使用してエクスポートし、簡単なクエリ結果をファイル`hdfs://path/to/result.txt`にエクスポートします。エクスポート形式をCSVとして指定します。`my_broker`を使用し、kerberos認証情報を設定します。列区切り文字を`,`、行区切り文字を`\n`として指定します。

    ```sql
    SELECT * FROM tbl
    INTO OUTFILE "hdfs://path/to/result_"
    FORMAT AS CSV
    PROPERTIES
    (
        "broker.name" = "my_broker",
        "broker.hadoop.security.authentication" = "kerberos",
        "broker.kerberos_principal" = "doris@YOUR.COM",
        "broker.kerberos_keytab" = "/home/doris/my.keytab",
        "column_separator" = ",",
        "line_delimiter" = "\n",
        "max_file_size" = "100MB"
    );
    ```
最終的に生成されるファイルが100MBより大きくない場合は、`result_0.csv`になります。
   100MBより大きい場合は、`result_0.csv, result_1.csv, ...`になる可能性があります。

- シンプルなクエリ結果を`hdfs://path/to/result.parquet`ファイルにエクスポートします。エクスポート形式をPARQUETとして指定します。`my_broker`を使用し、kerberos認証情報を設定します。

    ```sql
    SELECT c1, c2, c3 FROM tbl
    INTO OUTFILE "hdfs://path/to/result_"
    FORMAT AS PARQUET
    PROPERTIES
    (
        "broker.name" = "my_broker",
        "broker.hadoop.security.authentication" = "kerberos",
        "broker.kerberos_principal" = "doris@YOUR.COM",
        "broker.kerberos_keytab" = "/home/doris/my.keytab"
    );
    ```
- CTE文のクエリ結果をファイル`hdfs://path/to/result.txt`にエクスポートします。デフォルトのエクスポート形式はCSVです。`my_broker`を使用し、hdfs高可用性情報を設定します。デフォルトの行および列の区切り文字を使用します。

    ```sql
    WITH
    x1 AS
    (SELECT k1, k2 FROM tbl1),
    x2 AS
    (SELECT k3 FROM tbl2)
    SELEC k1 FROM x1 UNION SELECT k3 FROM x2
    INTO OUTFILE "hdfs://path/to/result_"
    PROPERTIES
    (
        "broker.name" = "my_broker",
        "broker.username"="user",
        "broker.password"="passwd",
        "broker.dfs.nameservices" = "my_ha",
        "broker.dfs.ha.namenodes.my_ha" = "my_namenode1, my_namenode2",
        "broker.dfs.namenode.rpc-address.my_ha.my_namenode1" = "nn1_host:rpc_port",
        "broker.dfs.namenode.rpc-address.my_ha.my_namenode2" = "nn2_host:rpc_port",
        "broker.dfs.client.failover.proxy.provider" = "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider"
    );
    ```
最終的に生成されるファイルが1GB以下の場合は `result_0.csv` になります。
1GBを超える場合は `result_0.csv, result_1.csv, ...` のようになる可能性があります。

- UNION文のクエリ結果を `bos://bucket/result.txt` ファイルにエクスポートします。エクスポート形式をPARQUETとして指定します。`my_broker` を使用し、hdfs高可用性情報を設定します。PARQUET形式では列区切り文字を指定する必要はありません。
   エクスポート完了後、識別ファイルが生成されます。

    ```sql
    SELECT k1 FROM tbl1 UNION SELECT k2 FROM tbl1
    INTO OUTFILE "bos://bucket/result_"
    FORMAT AS PARQUET
    PROPERTIES
    (
        "broker.name" = "my_broker",
        "broker.bos_endpoint" = "http://bj.bcebos.com",
        "broker.bos_accesskey" = "xxxxxxxxxxxxxxxxxxxxxxxxxx",
        "broker.bos_secret_accesskey" = "yyyyyyyyyyyyyyyyyyyyyyyyyy"
    );
    ```
- select文のクエリ結果をファイル`s3a://${bucket_name}/path/result.txt`にエクスポートします。エクスポート形式はcsvとして指定してください。
   エクスポートが完了すると、アイデンティティファイルが生成されます。

    ```sql
    select k1,k2,v1 from tbl1 limit 100000
    into outfile "s3a://my_bucket/export/my_file_"
    FORMAT AS CSV
    PROPERTIES
    (
        "broker.name" = "hdfs_broker",
        "broker.fs.s3a.access.key" = "xxx",
        "broker.fs.s3a.secret.key" = "xxxx",
        "broker.fs.s3a.endpoint" = "https://cos.xxxxxx.myqcloud.com/",
        "column_separator" = ",",
        "line_delimiter" = "\n",
        "max_file_size" = "1024MB",
        "success_file_name" = "SUCCESS"
    )
    ```
最終生成されたファイルが1GBを超えない場合、`my_file_0.csv`となります。
   1GBを超える場合、`my_file_0.csv, result_1.csv, ...`となる可能性があります。
   cosで確認してください

          1. 存在しないパスは自動的に作成されます
          2. Access.key/secret.key/endpointはcosの担当者に確認する必要があります。特にendpointの値にはbucket_nameを入力する必要がありません。

- s3プロトコルを使用してbosにエクスポートし、並行エクスポートを有効にします。

    ```sql
    set enable_parallel_outfile = true;
    select k1 from tb1 limit 1000
    into outfile "s3://my_bucket/export/my_file_"
    format as csv
    properties
    (
        "s3.endpoint" = "http://s3.bd.bcebos.com",
        "s3.access_key" = "xxxx",
        "s3.secret_key" = "xxx",
        "s3.region" = "bd"
    )
    ```
結果ファイルには`my_file_{fragment_instance_id}_`のプレフィックスが付けられます。

- s3プロトコルを使用してbosにエクスポートし、セッション変数の並行エクスポートを有効にします。
   注意：ただし、クエリステートメントにトップレベルのソートノードがあるため、このクエリに対して並行エクスポートされたセッション変数が有効になっていても、並行してエクスポートすることはできません。

    ```sql
    set enable_parallel_outfile = true;
    select k1 from tb1 order by k1 limit 1000
    into outfile "s3://my_bucket/export/my_file_"
    format as csv
    properties
    (
        "s3.endpoint" = "http://s3.bd.bcebos.com",
        "s3.access_key" = "xxxx",
        "s3.secret_key" = "xxx",
        "s3.region" = "bd"
    )
    ```
- hdfs exportを使用して、シンプルなクエリ結果をファイル`hdfs://${host}:${fileSystem_port}/path/to/result.txt`にエクスポートします。エクスポート形式をCSVとして指定し、ユーザー名をworkとして指定します。列区切り文字を`,`、行区切り文字を`\n`として指定します。

    ```sql
    -- fileSystem_port 默认值为 9000
    SELECT * FROM tbl
    INTO OUTFILE "hdfs://${host}:${fileSystem_port}/path/to/result_"
    FORMAT AS CSV
    PROPERTIES
    (
        "fs.defaultFS" = "hdfs://ip:port",
        "hadoop.username" = "work"
    );
    ```
Hadoopクラスタが高可用性でKerberos認証が有効になっている場合、以下のSQL文を参照できます：

    ```sql
    SELECT * FROM tbl
    INTO OUTFILE "hdfs://path/to/result_"
    FORMAT AS CSV
    PROPERTIES
    (
    'fs.defaultFS'='hdfs://hacluster/',
    'dfs.nameservices'='hacluster',
    'dfs.ha.namenodes.hacluster'='n1,n2',
    'dfs.namenode.rpc-address.hacluster.n1'='192.168.0.1:8020',
    'dfs.namenode.rpc-address.hacluster.n2'='192.168.0.2:8020',
    'dfs.client.failover.proxy.provider.hacluster'='org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider',
    'dfs.namenode.kerberos.principal'='hadoop/_HOST@REALM.COM'
    'hadoop.security.authentication'='kerberos',
    'hadoop.kerberos.principal'='doris_test@REALM.COM',
    'hadoop.kerberos.keytab'='/path/to/doris_test.keytab'
    );
    ```
最終的に生成されるファイルが100MBを超えない場合、ファイル名は `result_0.csv` になります。
100MBを超える場合、`result_0.csv, result_1.csv, ...` のようになる可能性があります。

- select文のクエリ結果をTencent Cloud Object Storage (COS)の `cosn://${bucket_name}/path/result.txt` ファイルにエクスポートします。エクスポート形式はcsvとして指定します。
   エクスポートが完了すると、識別ファイルが生成されます。

    ```sql
    select k1,k2,v1 from tbl1 limit 100000
    into outfile "cosn://my_bucket/export/my_file_"
    FORMAT AS CSV
    PROPERTIES
    (
        "broker.name" = "broker_name",
        "broker.fs.cosn.userinfo.secretId" = "xxx",
        "broker.fs.cosn.userinfo.secretKey" = "xxxx",
        "broker.fs.cosn.bucket.endpoint_suffix" = "cos.xxxxxx.myqcloud.com",
        "column_separator" = ",",
        "line_delimiter" = "\n",
        "max_file_size" = "1024MB",
        "success_file_name" = "SUCCESS"
    )
    ```
