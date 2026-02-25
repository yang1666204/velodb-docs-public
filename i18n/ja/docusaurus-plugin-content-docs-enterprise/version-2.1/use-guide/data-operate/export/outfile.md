---
{
  "title": "SELECT INTO OUTFILE",
  "description": "この文書では、SELECT INTO OUTFILE コマンドを使用してクエリ結果のエクスポート操作を実行する方法について説明します。",
  "language": "ja"
}
---
この文書では、クエリ結果のエクスポート操作を実行するための`SELECT INTO OUTFILE`コマンドの使用方法を紹介します。

`SELECT INTO OUTFILE`コマンドは、`SELECT`部分の結果データを、オブジェクトストレージやHDFSを含む指定されたファイル形式でターゲットストレージシステムにエクスポートします。

`SELECT INTO OUTFILE`は同期コマンドであり、コマンドの返却はエクスポートが完了したことを意味します。エクスポートが成功した場合、エクスポートされたファイルの数、サイズ、パスなどの情報が返却されます。エクスポートが失敗した場合、エラー情報が返却されます。

`SELECT INTO OUTFILE`と`EXPORT`のどちらを選択するかについては、[Export Overview](./export-overview.md)を参照してください。

`SELECT INTO OUTFILE`コマンドの詳細な説明については、SELECT INTO OUTFILEを参照してください。

## 適用シナリオ

`SELECT INTO OUTFILE`は以下のシナリオに適用できます：

- エクスポートするデータがフィルタリング、集計、結合などの複雑な計算ロジックを経る必要がある場合。
- 同期タスクを実行する必要があるシナリオに適している。

`SELECT INTO OUTFILE`を使用する際は、以下の制限事項に注意してください：

- テキストの圧縮形式はサポートされていません。
- バージョン2.1のパイプラインエンジンは並行エクスポートをサポートしていません。

## クイックスタート
### テーブルの作成とデータのインポート

```sql
CREATE TABLE IF NOT EXISTS tbl (
    `c1` int(11) NULL,
    `c2` string NULL,
    `c3` bigint NULL
)
DISTRIBUTED BY HASH(c1) BUCKETS 20
PROPERTIES("replication_num" = "1");


insert into tbl values
    (1, 'doris', 18),
    (2, 'nereids', 20),
    (3, 'pipelibe', 99999),
    (4, 'Apache', 122123455),
    (5, null, null);
```
### HDFSへのエクスポート

クエリ結果をディレクトリ `hdfs://path/to/` にエクスポートし、エクスポート形式としてParquetを指定します：

```sql
SELECT c1, c2, c3 FROM tbl
INTO OUTFILE "hdfs://ip:port/path/to/result_"
FORMAT AS PARQUET
PROPERTIES
(
    "fs.defaultFS" = "hdfs://ip:port",
    "hadoop.username" = "hadoop"
);
```
### Object Storageへのエクスポート

クエリ結果をs3ストレージの`s3://bucket/export/`ディレクトリにエクスポートし、エクスポート形式をORCとして指定します。`sk`（secret key）や`ak`（access key）などの情報を提供する必要があります。

```sql
SELECT * FROM tbl
INTO OUTFILE "s3://bucket/export/result_"
FORMAT AS ORC
PROPERTIES(
    "s3.endpoint" = "xxxxx",
    "s3.region" = "xxxxx",
    "s3.secret_key"="xxxx",
    "s3.access_key" = "xxxxx"
);
```
## エクスポート手順

### エクスポート先

`SELECT INTO OUTFILE`は現在、以下のストレージ場所へのエクスポートをサポートしています：

- Object Storage: Amazon S3, COS, OSS, OBS, Google GCS
- HDFS

### サポートされるファイルタイプ

`SELECT INTO OUTFILE`は現在、以下のファイル形式のエクスポートをサポートしています：

* Parquet
* ORC
* csv
* csv\_with\_names
* csv\_with\_names\_and\_types

### エクスポートの並行性

セッション変数`enable_parallel_outfile`を通じて並行エクスポートを有効にできます。

`SET enable_parallel_outfile=true;`

並行エクスポートは、マルチノードとマルチスレッドを使用して結果データをエクスポートし、全体的なエクスポートのスループットを向上させます。ただし、並行エクスポートではより多くのファイルが生成される可能性があります。

この変数をオンにしても、グローバルソートを含むクエリなど、一部のクエリは並行エクスポートを実行できないことに注意してください。エクスポートコマンドから返される行数が1より大きい場合、並行エクスポートが有効になっていることを意味します。

## エクスポート例

### High Availabilityが有効なHDFSクラスターへのエクスポート

HDFSでhigh availabilityが有効になっている場合、以下のようなHA（High Availability）情報を提供する必要があります：

```sql
SELECT c1, c2, c3 FROM tbl
INTO OUTFILE "hdfs://HDFS8000871/path/to/result_"
FORMAT AS PARQUET
PROPERTIES
(
    "fs.defaultFS" = "hdfs://HDFS8000871",
    "hadoop.username" = "hadoop",
    "dfs.nameservices" = "your-nameservices",
    "dfs.ha.namenodes.your-nameservices" = "nn1,nn2",
    "dfs.namenode.rpc-address.HDFS8000871.nn1" = "ip:port",
    "dfs.namenode.rpc-address.HDFS8000871.nn2" = "ip:port",
    "dfs.client.failover.proxy.provider.HDFS8000871" = "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider"
);
```
### 高可用性とKerberos認証が有効になっているHDFSクラスターへのエクスポート

HDFSクラスターで高可用性が有効になっており、Kerberos認証が有効になっている場合は、以下のSQL文を参照してください：

```sql
SELECT * FROM tbl
INTO OUTFILE "hdfs://path/to/result_"
FORMAT AS PARQUET
PROPERTIES
(
    "fs.defaultFS"="hdfs://hacluster/",
    "hadoop.username" = "hadoop",
    "dfs.nameservices"="hacluster",
    "dfs.ha.namenodes.hacluster"="n1,n2",
    "dfs.namenode.rpc-address.hacluster.n1"="192.168.0.1:8020",
    "dfs.namenode.rpc-address.hacluster.n2"="192.168.0.2:8020",
    "dfs.client.failover.proxy.provider.hacluster"="org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider",
    "dfs.namenode.kerberos.principal"="hadoop/_HOST@REALM.COM",
    "hadoop.security.authentication"="kerberos",
    "hadoop.kerberos.principal"="doris_test@REALM.COM",
    "hadoop.kerberos.keytab"="/path/to/doris_test.keytab"
);
```
### エクスポート成功インジケーターファイルの生成

`SELECT INTO OUTFILE`コマンドは同期コマンドです。したがって、SQLの実行中にタスク接続が切断される可能性があり、エクスポートされたデータが正常に終了したか、または完了しているかを知ることができなくなります。この場合、`success_file_name`パラメータを使用して、エクスポートが成功した後にディレクトリ内にファイルインジケーターを生成するよう要求できます。

Hiveと同様に、ユーザーはエクスポートディレクトリ内に`success_file_name`パラメータで指定されたファイルが存在するかどうかを確認することで、エクスポートが正常に終了したか、エクスポートディレクトリ内のファイルが完全であるかを判断できます。

例：selectステートメントのクエリ結果をオブジェクトストレージ`s3://bucket/export/`にエクスポートします。エクスポート形式を`csv`として指定します。エクスポート成功インジケーターファイルの名前を`SUCCESS`として指定します。エクスポートが完了すると、インジケーターファイルが生成されます。

```sql
SELECT k1,k2,v1 FROM tbl1 LIMIT 100000
INTO OUTFILE "s3://bucket/export/result_"
FORMAT AS CSV
PROPERTIES
(
    "s3.endpoint" = "xxxxx",
    "s3.region" = "xxxxx",
    "s3.secret_key"="xxxx",
    "s3.access_key" = "xxxxx",
    "column_separator" = ",",
    "line_delimiter" = "\n",
    "success_file_name" = "SUCCESS"
);
```
エクスポートが完了すると、もう1つのファイルが書き込まれ、このファイルのファイル名は`SUCCESS`です。

### エクスポート前のエクスポートディレクトリのクリア

```sql
SELECT * FROM tbl1
INTO OUTFILE "s3://bucket/export/result_"
FORMAT AS CSV
PROPERTIES
(
    "s3.endpoint" = "xxxxx",
    "s3.region" = "xxxxx",
    "s3.secret_key"="xxxx",
    "s3.access_key" = "xxxxx",
    "column_separator" = ",",
    "line_delimiter" = "\n",
    "delete_existing_files" = "true"
);
```
`"delete_existing_files" = "true"` が設定されている場合、エクスポートジョブは最初に `s3://bucket/export/` ディレクトリ下のすべてのファイルとディレクトリを削除し、その後このディレクトリにデータをエクスポートします。

`delete_existing_files` パラメータを使用する場合は、`fe.conf` に `enable_delete_existing_files = true` の設定を追加し、FE を再起動する必要があります。その後で初めて `delete_existing_files` パラメータが有効になります。この操作は外部システムのデータを削除するため、高リスクな操作となります。外部システムの権限とデータセキュリティについては各自で確保してください。


### エクスポートファイルのサイズの設定

```sql
SELECT * FROM tbl
INTO OUTFILE "s3://path/to/result_"
FORMAT AS ORC
PROPERTIES(
    "s3.endpoint" = "xxxxx",
    "s3.region" = "xxxxx",
    "s3.secret_key"="xxxx",
    "s3.access_key" = "xxxxx",
    "max_file_size" = "2048MB"
);
```
`"max_file_size" = "2048MB"`が指定されているため、最終的に生成されるファイルが2GBを超えない場合は、ファイルは1つだけになります。2GBを超える場合は、複数のファイルになります。

## 注意事項

1. エクスポートデータ量とエクスポート効率

	`SELECT INTO OUTFILE`機能は本質的にSQLクエリコマンドを実行しています。並行エクスポートが有効でない場合、クエリ結果は単一のBEノードで単一スレッドによってエクスポートされます。そのため、全体のエクスポート時間には、クエリ自体が消費する時間と最終結果セットの書き出しが消費する時間が含まれます。並行エクスポートを有効にすることで、エクスポート時間を短縮できます。

2. エクスポートタイムアウト

	エクスポートコマンドのタイムアウト期間は、クエリのタイムアウト期間と同じです。大量のデータによりエクスポートデータがタイムアウトする場合は、セッション変数`query_timeout`を設定してクエリタイムアウト期間を適切に延長することができます。

3. エクスポートファイルの管理

	Dorisはエクスポートされたファイルを管理しません。ファイルが正常にエクスポートされた場合も、エクスポート失敗後に残されたファイルも、ユーザーが自分で処理する必要があります。

	また、`SELECT INTO OUTFILE`コマンドは、ファイルやファイルパスが存在するかどうかをチェックしません。`SELECT INTO OUTFILE`コマンドが自動的にパスを作成するか既存のファイルを上書きするかは、完全にリモートストレージシステムのセマンティクスによって決まります。

4. クエリ結果セットが空の場合

	結果セットが空のエクスポートの場合でも、空のファイルが生成されます。

5. ファイル分割

	ファイル分割では、1行のデータが完全に単一のファイルに格納されることが保証されます。そのため、ファイルのサイズは厳密に`max_file_size`と等しくなりません。

6. 非表示文字を持つ関数

	BITMAPやHLL型など、出力が非表示文字である一部の関数については、CSVファイル形式にエクスポートされる際、出力は`\N`になります。

## 付録

### ローカルファイルシステムへのエクスポート

ローカルファイルシステムへのエクスポート機能は、デフォルトで無効になっています。この機能はローカルでのデバッグと開発にのみ使用され、本番環境では使用すべきではありません。

この機能を有効にしたい場合は、`fe.conf`に`enable_outfile_to_local=true`を追加してFEを再起動してください。

例：tblテーブルのすべてのデータをローカルファイルシステムにエクスポートし、エクスポートジョブのファイル形式をcsv（デフォルト形式）に設定し、列区切り文字を`,`に設定します。

```sql
SELECT c1, c2 FROM db.tbl
INTO OUTFILE "file:///path/to/result_"
FORMAT AS CSV
PROPERTIES(
    "column_separator" = ","
);
```
この関数は、BEが配置されているノードのディスクにデータをエクスポートして書き込みます。複数のBEノードがある場合、データはエクスポートタスクの並行性に応じて異なるBEノードに分散され、各ノードはデータの一部を持つことになります。

この例のように、最終的にBEノードの`/path/to/`の下に`result_c6df5f01bd664dde-a2168b019b6c2b3f_0.csv`のような一連のファイルが生成されます。

具体的なBEノードのIPは、以下のように返される結果に表示されます：

```
+------------+-----------+----------+--------------------------------------------------------------------------+
| FileNumber | TotalRows | FileSize | URL                                                                      |
+------------+-----------+----------+--------------------------------------------------------------------------+
|          1 |   1195072 |  4780288 | file:///172.20.32.136/path/to/result_c6df5f01bd664dde-a2168b019b6c2b3f_* |
|          1 |   1202944 |  4811776 | file:///172.20.32.136/path/to/result_c6df5f01bd664dde-a2168b019b6c2b40_* |
|          1 |   1198880 |  4795520 | file:///172.20.32.137/path/to/result_c6df5f01bd664dde-a2168b019b6c2b43_* |
|          1 |   1198880 |  4795520 | file:///172.20.32.137/path/to/result_c6df5f01bd664dde-a2168b019b6c2b45_* |
+------------+-----------+----------+--------------------------------------------------------------------------+
```
:::caution
この関数は本番環境には適しておらず、エクスポートディレクトリの権限とデータセキュリティについては各自で確保してください。
:::
