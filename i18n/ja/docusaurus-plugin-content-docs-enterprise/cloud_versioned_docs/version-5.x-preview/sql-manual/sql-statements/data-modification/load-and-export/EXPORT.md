---
{
  "title": "EXPORT | ロードとエクスポート",
  "description": "EXPORT コマンドは、指定されたテーブルからデータを指定された場所のファイルにエクスポートするために使用されます。",
  "language": "ja"
}
---
# EXPORT

## 説明

`EXPORT`コマンドは、指定されたテーブルから指定された場所のファイルにデータをエクスポートするために使用されます。現在、Brokerプロセス、S3プロトコル、またはHDFSプロトコルを通じて、HDFS、S3、BOS、COS（Tencent Cloud）などのリモートストレージへのエクスポートをサポートしています。

`EXPORT`は非同期操作です。このコマンドは`EXPORT JOB`をDorisに送信し、送信が成功すると即座に戻ります。実行後の進行状況を確認するには、[SHOW EXPORT](./SHOW-EXPORT)コマンドを使用できます。

## 構文:

  ```sql
  EXPORT TABLE <table_name>
  [ PARTITION ( <partation_name> [ , ... ] ) ]
  [ <where_clause> ]
  TO <export_path>
  [ <properties> ]
  WITH <target_storage>
  [ <broker_properties> ];
  ```
## 必須パラメータ

**1. `<table_name>`**

  エクスポート対象のテーブル名。Dorisローカルテーブル、ビュー、カタログ外部テーブルからのデータエクスポートをサポートします。

**2. `<export_path>`**

  エクスポートファイルパス。ディレクトリまたは`hdfs://path/to/my_file_`のようなファイルプレフィックス付きのファイルディレクトリを指定できます。

## オプションパラメータ

**1. `<where_clause>`**

  エクスポートデータのフィルタ条件を指定できます。

**2. `<partation_name>`**

  指定したテーブルの特定のパーティションのみをエクスポートできます。Dorisローカルテーブルでのみ有効です。

**3. `<properties>`**

  一部のエクスポートパラメータを指定するために使用されます。

  ```sql
  [ PROPERTIES ("<key>"="<value>" [, ... ]) ]
  ```
以下のパラメータを指定できます：
  - `label`: このExportタスクのLabelを指定するオプションパラメータ。指定されていない場合、システムはランダムにLabelを生成します。

  - `column_separator`: エクスポート時の列区切り文字を指定します。デフォルトは`\t`で、マルチバイトをサポートします。このパラメータはCSVファイル形式でのみ使用されます。

  - `line_delimiter`: エクスポート時の行区切り文字を指定します。デフォルトは`\n`で、マルチバイトをサポートします。このパラメータはCSVファイル形式でのみ使用されます。

  - `columns`: エクスポートテーブルの特定の列を指定します。

  - `format`: エクスポートジョブのファイル形式を指定します。サポート形式：parquet、orc、csv、csv_with_names、csv_with_names_and_types。デフォルトはCSV形式です。

  - `max_file_size`: エクスポートジョブの単一ファイルサイズ制限。結果がこの値を超える場合、複数のファイルに分割されます。`max_file_size`の値範囲は[5MB, 2GB]で、デフォルトは1GBです。（orcファイル形式へのエクスポートを指定した場合、実際の分割ファイルサイズは64MBの倍数になります。例：max_file_size = 5MBを指定すると実際は64MBで分割、max_file_size = 65MBを指定すると実際は128MBで分割）

  - `parallelism`: エクスポートジョブの並行度、デフォルトは`1`。エクスポートジョブは`parallelism`数のスレッドを開始して`select into outfile`文を実行します。（Parallelismの数がテーブル内のTablets数より大きい場合、システムは自動的にParallelismをTablets数のサイズに設定します。つまり、各`select into outfile`文が1つのTabletを担当します）

  - `delete_existing_files`: デフォルトは`false`。`true`に指定すると、まず`export_path`で指定されたディレクトリ内のすべてのファイルを削除してから、そのディレクトリにデータをエクスポートします。例："export_path" = "/user/tmp"の場合、"/user/"配下のすべてのファイルとディレクトリを削除、"file_path" = "/user/tmp/"の場合、"/user/tmp/"配下のすべてのファイルとディレクトリを削除します。

  - `with_bom`: デフォルトは`false`。`true`に指定すると、エクスポートファイルのエンコーディングはBOM付きUTF8エンコーディングになります（csv関連ファイル形式でのみ有効）。

  - `data_consistency`: `none` / `partition`に設定可能、デフォルトは`partition`。エクスポートテーブルをどの粒度で分割するかを示し、`none`はTabletsレベル、`partition`はPartitionレベルを表します。

  - `timeout`: エクスポートジョブのタイムアウト、デフォルトは2時間、単位は秒。

  - `compress_type`: （2.1.5以降でサポート）エクスポートファイル形式をParquet / ORC ファイルに指定する際、Parquet / ORC ファイルが使用する圧縮方法を指定できます。Parquetファイル形式はSNAPPY、GZIP、BROTLI、ZSTD、LZ4、PLAINの圧縮方法を指定可能で、デフォルト値はSNAPPYです。ORCファイル形式はPLAIN、SNAPPY、ZLIB、ZSTDの圧縮方法を指定可能で、デフォルト値はZLIBです。このパラメータはバージョン2.1.5以降でサポートされています。（PLAINは無圧縮を意味します）。バージョン3.1.1以降、CSV形式の圧縮アルゴリズム指定をサポートし、現在"plain"、"gz"、"bz2"、"snappyblock"、"lz4block"、"zstd"をサポートしています。

  :::caution Note  
  delete_existing_filesパラメータを使用するには、fe.confに設定`enable_delete_existing_files = true`を追加してfeを再起動する必要があり、その後delete_existing_filesが有効になります。delete_existing_files = trueは危険な操作のため、テスト環境でのみ使用することを推奨します。  
  :::  

**4. `<target_storage>`**  
    ストレージメディア、オプションはBROKER、S3、HDFS。  

**5. `<broker_properties>`**  
    `<target_storage>`の異なるストレージメディアに応じて、異なるプロパティを指定する必要があります。  

- **BROKER**  
  Brokerプロセスを通じてリモートストレージにデータを書き込むことができます。ここではBrokerが使用するための関連接続情報を定義する必要があります。

  ```sql
  WITH BROKER "broker_name"
  ("<key>"="<value>" [,...])
  ```  
**Broker関連プロパティ：**  
  - `username`: ユーザー名
  - `password`: パスワード
  - `hadoop.security.authentication`: 認証方式をkerberosとして指定
  - `kerberos_principal`: kerberosプリンシパルを指定
  - `kerberos_keytab`: kerberosキータブファイルのパスを指定。このファイルはBrokerプロセスが配置されているサーバー上の絶対パスであり、Brokerプロセスからアクセス可能である必要があります

- **HDFS**  

  データはリモートHDFSに直接書き込むことができます。

  ```sql
  WITH HDFS ("<key>"="<value>" [,...])
  ```  
**HDFS関連プロパティ:**  
  - `fs.defaultFS`: namenodeアドレスとポート
  - `hadoop.username`: HDFSユーザー名
  - `dfs.nameservices`: ネームサービス名、hdfs-site.xmlと一致させる
  - `dfs.ha.namenodes.[nameservice ID]`: namenodeのIDリスト、hdfs-site.xmlと一致させる
  - `dfs.namenode.rpc-address.[nameservice ID].[name node ID]`: NameノードのRPCアドレス、namenode数と同じ数、hdfs-site.xmlと一致させる   

  **kerberos認証が有効なHadoopクラスターの場合、以下の追加のPROPERTIES属性を設定する必要があります:**
  - `dfs.namenode.kerberos.principal`: HDFS namenodeサービスのプリンシパル名
  - `hadoop.security.authentication`: 認証方法をkerberosに設定
  - `hadoop.kerberos.principal`: DorisがHDFSに接続する際に使用するKerberosプリンシパルを設定
  - `hadoop.kerberos.keytab`: keytabのローカルファイルパスを設定  

- **S3**  

  データはリモートS3オブジェクトストレージに直接書き込み可能です。

  ```sql
  WITH S3 ("<key>"="<value>" [,...])
  ```  
**S3 関連のプロパティ:**
  - `s3.endpoint`
  - `s3.region`
  - `s3.secret_key`
  - `s3.access_key`
  - `use_path_style`: （オプション）デフォルトは `false` です。S3 SDK はデフォルトで Virtual-hosted Style を使用します。ただし、一部のオブジェクトストレージシステムでは Virtual-hosted Style アクセスが有効化されていないか、サポートされていない場合があります。この場合、`use_path_style` パラメータを追加して Path Style アクセスの使用を強制できます。

## 戻り値

| カラム名            | タイプ  | 説明                                                                |
|---------------------|--------|---------------------------------------------------------------------|
| jobId               | long   | エクスポートジョブの一意識別子。                                      |
| label               | string | エクスポートジョブのラベル。                                          |
| dbId                | long   | データベースの識別子。                                                |
| tableId             | long   | テーブルの識別子。                                                    |
| state               | string | ジョブの現在の状態。                                                  |
| path                | string | エクスポートファイルのパス。                                          |
| partitions          | string | エクスポートされたパーティション名のリスト。複数のパーティション名はカンマで区切られます。|
| progress            | int    | エクスポートジョブの現在の進行状況（パーセンテージ）。                |
| createTimeMs        | string | ジョブ作成時刻のミリ秒値、日時形式でフォーマットされます。            |
| exportStartTimeMs   | string | エクスポートジョブ開始時刻のミリ秒値、日時形式でフォーマットされます。 |
| exportFinishTimeMs  | string | エクスポートジョブ終了時刻のミリ秒値、日時形式でフォーマットされます。 |
| failMsg             | string | エクスポートジョブが失敗した際のエラーメッセージ。                    |


## アクセス制御

この SQL コマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります:

| 権限        | オブジェクト | 説明                                     |
|:------------|:-------------|:-----------------------------------------|
| SELECT_PRIV | Database     | データベースとテーブルに対する読み取り権限が必要です。 |


## 注意事項

### 並行実行

Export ジョブは `parallelism` パラメータを設定して、データを並行してエクスポートできます。`parallelism` パラメータは実際には EXPORT ジョブを実行するスレッド数を指定します。`"data_consistency" = "none"` が設定されている場合、各スレッドはテーブルの Tablets の一部をエクスポートする責任を負います。

Export ジョブの基盤となる実行ロジックは実際には `SELECT INTO OUTFILE` ステートメントです。`parallelism` パラメータで設定された各スレッドは独立した `SELECT INTO OUTFILE` ステートメントを実行します。

Export ジョブを複数の `SELECT INTO OUTFILE` に分割する具体的なロジックは: テーブルのすべての tablets をすべての並列スレッドに均等に分散します。例えば:
- num(tablets) = 40、parallelism = 3 の場合、これらの 3 つのスレッドはそれぞれ 14、13、13 tablets を担当します。
- num(tablets) = 2、parallelism = 3 の場合、Doris は自動的に parallelism を 2 に設定し、各スレッドが 1 つの tablet を担当します。

スレッドが担当する tablets が `maximum_tablets_of_outfile_in_export` 値（デフォルトは 10、fe.conf に `maximum_tablets_of_outfile_in_export` パラメータを追加することで変更可能）を超える場合、そのスレッドは複数の `SELECT INTO OUTFILE` ステートメントに分割されます。例えば:
- スレッドが 14 tablets を担当し、`maximum_tablets_of_outfile_in_export = 10` の場合、このスレッドは 2 つの `SELECT INTO OUTFILE` ステートメントを担当します。最初の `SELECT INTO OUTFILE` ステートメントは 10 tablets をエクスポートし、2 番目の `SELECT INTO OUTFILE` ステートメントは 4 tablets をエクスポートします。これら 2 つの `SELECT INTO OUTFILE` ステートメントは、このスレッドによって順次実行されます。

エクスポートするデータ量が非常に大きい場合、`parallelism` パラメータを適切に増やして並行エクスポートを増加させることを検討できます。マシンのコアが不足しており `parallelism` を増やせない一方で、エクスポートテーブルに多くの Tablets がある場合、`maximum_tablets_of_outfile_in_export` を増やして `SELECT INTO OUTFILE` ステートメントが担当する tablets 数を増やすことを検討でき、これによってもエクスポートを高速化できます。

Partition 粒度で Table をエクスポートしたい場合、Export プロパティ `"data_consistency" = "partition"` を設定できます。この場合、Export タスクの並行スレッドは Partition 粒度で複数の Outfile ステートメントに分割されます。異なる Outfile ステートメントは異なる Partitions をエクスポートし、同じ Outfile ステートメントによってエクスポートされるデータは同じ Partition に属する必要があります。例えば: `"data_consistency" = "partition"` を設定後

- num(partition) = 40、parallelism = 3 の場合、これらの 3 つのスレッドはそれぞれ 14、13、13 Partitions を担当します。
- num(partition) = 2、parallelism = 3 の場合、Doris は自動的に Parallelism を 2 に設定し、各スレッドが 1 つの Partition を担当します。


### メモリ制限

通常、Export ジョブのクエリプランには `scan-export` の 2 つの部分しかなく、過度なメモリを必要とする計算ロジックは含まれません。そのため、通常はデフォルトのメモリ制限 2GB で要件を満たせます。

ただし、一部のシナリオでは、クエリプランが同じ BE 上で過度に多くの Tablets をスキャンする必要がある場合や、Tablet データのバージョンが過度に多い場合、メモリ不足を引き起こす可能性があります。Session 変数 `exec_mem_limit` を調整してメモリ使用制限を増やすことができます。

### その他の事項

- 一度に大量のデータをエクスポートすることは推奨されません。1 つの Export ジョブの推奨最大エクスポートデータ量は数十 GB です。過度に大きなエクスポートは、より多くのガベージファイルとより高い再試行コストを引き起こします。テーブルデータ量が過度に大きい場合は、パーティション別にエクスポートすることが推奨されます。

- Export ジョブが失敗した場合、既に生成されたファイルは削除されず、ユーザーが手動で削除する必要があります。

- Export ジョブはデータをスキャンして IO リソースを占有するため、システムクエリレイテンシに影響を与える可能性があります。

- 現在 Export 中は、Tablets バージョンが一致するかどうかの簡単なチェックのみが実行されます。Export 実行中はテーブルに対してデータインポート操作を実行しないことが推奨されます。

- Export Job では最大 2000 パーティションのエクスポートが可能です。`fe.conf` にパラメータ `maximum_number_of_export_partitions` を追加し、FE を再起動してこの設定を変更できます。


## 例

### データをローカルにエクスポート
> データをローカルファイルシステムにエクスポートするには、`fe.conf` に `enable_outfile_to_local=true` を追加して FE を再起動する必要があります。

- Test テーブルの全データをローカルストレージにエクスポートし、デフォルトで CSV 形式ファイルをエクスポート

```sql
EXPORT TABLE test TO "file:///home/user/tmp/";
```
- Test テーブルの k1,k2 列をローカルストレージにエクスポートし、デフォルトで CSV ファイル形式でエクスポートして、Label を設定する

```sql
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "label" = "label1",
  "columns" = "k1,k2"
);
```
- Test tableで`k1 < 50`の行をローカルストレージにエクスポートし、デフォルトでCSV形式ファイルをエクスポートして、列区切り文字として`,`を使用する

```sql
EXPORT TABLE test WHERE k1 < 50 TO "file:///home/user/tmp/"
PROPERTIES (
  "columns" = "k1,k2",
  "column_separator"=","
);
```
- Test テーブルのパーティション p1,p2 をローカルストレージにエクスポートします。デフォルトでは csv 形式のファイルをエクスポートします

```sql
EXPORT TABLE test PARTITION (p1,p2) TO "file:///home/user/tmp/" 
PROPERTIES ("columns" = "k1,k2");
```
- Test テーブルの全データをローカルストレージにエクスポートし、他の形式のファイルをエクスポートする

```sql
-- parquet
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "columns" = "k1,k2",
  "format" = "parquet"
);

-- orc
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "columns" = "k1,k2",
  "format" = "orc"
);

-- csv(csv_with_names) , Use 'AA' as the column separator and 'zz' as the row separator
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "format" = "csv_with_names",
  "column_separator"="AA",
  "line_delimiter" = "zz"
);

-- csv(csv_with_names_and_types) 
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "format" = "csv_with_names_and_types"
);
```
- `max_file_sizes`プロパティを設定する  
   エクスポートされたファイルが5MBを超える場合、データは複数のファイルに分割され、各ファイルは最大5MBになります。

```sql
-- When the exported file is larger than 5MB, the data will be split into multiple files, with each file having a maximum size of 5MB.
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "format" = "parquet",
  "max_file_size" = "5MB"
);
```
- `parallelism`プロパティを設定する

```sql
EXPORT TABLE test TO "file:///home/user/tmp/"
PROPERTIES (
  "format" = "parquet",
  "max_file_size" = "5MB",
  "parallelism" = "5"
);
```
- `delete_existing_files` プロパティを設定する  
    Export がデータをエクスポートする際、まず `/home/user/` ディレクトリ配下のすべてのファイルとディレクトリを削除し、その後このディレクトリにデータをエクスポートします。

```sql
-- When exporting data, all files and directories under the `/home/user/` directory will be deleted first, and then the data will be exported to this directory.
EXPORT TABLE test TO "file:///home/user/tmp"
PROPERTIES (
  "format" = "parquet",
  "max_file_size" = "5MB",
  "delete_existing_files" = "true"
);
```
### S3へのエクスポート

- s3_testテーブルの全データをS3にエクスポートし、非表示文字`\x07`を列または行の区切り文字として使用します。minioにデータをエクスポートする必要がある場合は、`use_path_style`=`true`を指定する必要もあります。

```sql
EXPORT TABLE s3_test TO "s3://bucket/a/b/c" 
PROPERTIES (
  "column_separator"="\\x07", 
  "line_delimiter" = "\\x07"
) WITH S3 (
  "s3.endpoint" = "xxxxx",
  "s3.region" = "xxxxx",
  "s3.secret_key"="xxxx",
  "s3.access_key" = "xxxxx"
)
```
### HDFSへのエクスポート

- Testテーブルの全データをHDFSにエクスポートします。エクスポートファイル形式はParquet、エクスポートジョブの単一ファイルサイズ制限は512MB、すべてのファイルを指定されたディレクトリに保持します。

```sql
EXPORT TABLE test TO "hdfs://hdfs_host:port/a/b/c/" 
PROPERTIES(
    "format" = "parquet",
    "max_file_size" = "512MB",
    "delete_existing_files" = "false"
)
with HDFS (
"fs.defaultFS"="hdfs://hdfs_host:port",
"hadoop.username" = "hadoop"
);
```
### Broker Node経由でのエクスポート
最初にBrokerプロセスを開始し、このBrokerをFEに追加する必要があります。
- TestテーブルのすべてのデータをHDFSにエクスポートする

```sql
EXPORT TABLE test TO "hdfs://hdfs_host:port/a/b/c" 
WITH BROKER "broker_name" 
(
  "username"="xxx",
  "password"="yyy"
);
```
- testTblテーブルのパーティションp1、p2をHDFSにエクスポートし、","を列区切り文字として使用し、Labelを指定する

```sql
EXPORT TABLE testTbl PARTITION (p1,p2) TO "hdfs://hdfs_host:port/a/b/c" 
PROPERTIES (
  "label" = "mylabel",
  "column_separator"=","
) 
WITH BROKER "broker_name" 
(
  "username"="xxx",
  "password"="yyy"
);
```
- testTbl テーブルの全データを HDFS にエクスポートし、非表示文字 `\x07` を列または行の区切り文字として使用する。

```sql
EXPORT TABLE testTbl TO "hdfs://hdfs_host:port/a/b/c" 
PROPERTIES (
  "column_separator"="\\x07", 
  "line_delimiter" = "\\x07"
) 
WITH BROKER "broker_name" 
(
  "username"="xxx", 
  "password"="yyy"
)
```
