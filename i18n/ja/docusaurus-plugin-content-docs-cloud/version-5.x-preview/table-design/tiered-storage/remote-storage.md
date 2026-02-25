---
{
  "title": "リモートストレージ",
  "description": "リモートストレージは、コールドデータを外部ストレージ（オブジェクトストレージやHDFSなど）に配置することをサポートしています。",
  "language": "ja"
}
---
## 概要

リモートストレージは、外部ストレージ（オブジェクトストレージ、HDFSなど）にコールドデータを配置することをサポートしています。

:::warning Note
リモートストレージ内のデータはコピーが1つのみであり、データの信頼性はリモートストレージの信頼性に依存します。データの信頼性を確保するため、リモートストレージにerasure coding（EC）またはマルチレプリカ技術があることを確認する必要があります。
:::

## 使用方法

### S3互換ストレージへのコールドデータの保存

*手順1:* S3リソースを作成する。

```sql
CREATE RESOURCE "remote_s3"
PROPERTIES
(
    "type" = "s3",
    "s3.endpoint" = "bj.s3.com",
    "s3.region" = "bj",
    "s3.bucket" = "test-bucket",
    "s3.root.path" = "path/to/root",
    "s3.access_key" = "bbb",
    "s3.secret_key" = "aaaa",
    "s3.connection.maximum" = "50",
    "s3.connection.request.timeout" = "3000",
    "s3.connection.timeout" = "1000"
);
```
:::tip
S3 RESOURCEを作成する際、RESOURCEの作成が正しく行われることを保証するため、S3リモートへのリンク検証が実行されます。
:::

*手順2:* STORAGE POLICYを作成する。

次に、上記で作成したRESOURCEに関連付けられたSTORAGE POLICYを作成します：

```sql
CREATE STORAGE POLICY test_policy
PROPERTIES(
    "storage_resource" = "remote_s3",
    "cooldown_ttl" = "1d"
);
```
*ステップ 3:* テーブルを作成する際にSTORAGE POLICYを使用します。

```sql
CREATE TABLE IF NOT EXISTS create_table_use_created_policy 
(
    k1 BIGINT,
    k2 LARGEINT,
    v1 VARCHAR(2048)
)
UNIQUE KEY(k1)
DISTRIBUTED BY HASH (k1) BUCKETS 3
PROPERTIES(
    "enable_unique_key_merge_on_write" = "false",
    "storage_policy" = "test_policy"
);
```
:::warning Note
UNIQUE テーブルが `"enable_unique_key_merge_on_write" = "true"` で設定されている場合、この機能は使用できません。
:::

### コールドデータをHDFSに保存する

*手順 1:* HDFS RESOURCE を作成する：

```sql
CREATE RESOURCE "remote_hdfs" PROPERTIES (
        "type"="hdfs",
        "fs.defaultFS"="fs_host:default_fs_port",
        "hadoop.username"="hive",
        "hadoop.password"="hive",
        "dfs.nameservices" = "my_ha",
        "dfs.ha.namenodes.my_ha" = "my_namenode1, my_namenode2",
        "dfs.namenode.rpc-address.my_ha.my_namenode1" = "nn1_host:rpc_port",
        "dfs.namenode.rpc-address.my_ha.my_namenode2" = "nn2_host:rpc_port",
        "dfs.client.failover.proxy.provider.my_ha" = "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider"
    );
```
*Step 2:* STORAGE POLICYを作成する。

```sql
CREATE STORAGE POLICY test_policy PROPERTIES (
    "storage_resource" = "remote_hdfs",
    "cooldown_ttl" = "300"
)
```
*Step 3:* STORAGE POLICY を使用してテーブルを作成します。

```sql
CREATE TABLE IF NOT EXISTS create_table_use_created_policy (
    k1 BIGINT,
    k2 LARGEINT,
    v1 VARCHAR(2048)
)
UNIQUE KEY(k1)
DISTRIBUTED BY HASH (k1) BUCKETS 3
PROPERTIES(
"enable_unique_key_merge_on_write" = "false",
"storage_policy" = "test_policy"
);
```
:::warning Note
UNIQUEテーブルが`"enable_unique_key_merge_on_write" = "true"`で設定されている場合、この機能は使用できません。
:::

### 既存のテーブルのリモートストレージへのCooling

新しいテーブルがリモートストレージの設定をサポートすることに加えて、Dorisは既存のテーブルまたはPARTITIONにリモートストレージを設定することもサポートします。

既存のテーブルの場合、作成されたSTORAGE POLICYをテーブルに関連付けることで、リモートストレージを設定します：

```sql
ALTER TABLE create_table_not_have_policy set ("storage_policy" = "test_policy");
```
既存のPARTITIONについては、作成したSTORAGE POLICYをPARTITIONに関連付けることで、リモートストレージを設定します：

```sql
ALTER TABLE create_table_partition MODIFY PARTITION (*) SET("storage_policy"="test_policy");
```
:::tip
テーブル作成時にユーザーがテーブル全体と一部のPartitionに対して異なるStorage Policyを指定した場合、Partitionに設定されたStorage Policyは無視され、テーブルのすべてのPartitionがテーブルのPolicyを使用することに注意してください。PartitionのPolicyを他と異ならせる必要がある場合は、上記で説明した既存のPartitionにStorage Policyを関連付ける方法を使用して変更できます。

詳細については、[RESOURCE](../../sql-manual/sql-statements/cluster-management/compute-management/CREATE-RESOURCE)、[POLICY](../../sql-manual/sql-statements/cluster-management/storage-management/CREATE-STORAGE-POLICY)、[CREATE TABLE](../../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE)、[ALTER TABLE](../../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-COLUMN)などのDocsディレクトリを参照してください。
:::

### Compactionの設定

-   BEパラメータ`cold_data_compaction_thread_num`は、リモートストレージCompactionを実行する同時実行数を設定でき、デフォルトは2です。

-   BEパラメータ`cold_data_compaction_interval_sec`は、リモートストレージCompactionを実行する時間間隔を設定でき、デフォルトは1800秒（30分）です。

## 制限事項

-   リモートストレージを使用するテーブルはバックアップをサポートしていません。

-   endpoint、bucket、pathなどのリモートストレージの場所情報の変更はサポートされていません。

-   Merge-on-Writeが有効なUniqueモデルテーブルは、リモートストレージをサポートしていません。

-   ストレージポリシーは作成、変更、削除をサポートしています。ストレージポリシーを削除する前に、それを参照するテーブルがないことを確認してください。

-   ストレージポリシーが設定されると、設定を解除することはできません。

## Cold Dataの容量

### 表示

方法1：`show proc '/backends'`を通じて各BEがオブジェクトにアップロードしたサイズをRemoteUsedCapacity項目で確認できます。この方法は若干の遅延があります。

方法2：`show tablets from tableName`を通じてテーブルの各tabletが占有するサイズをRemoteDataSize項目で確認できます。

### ガベージコレクション

リモートストレージにガベージデータが生成される可能性がある状況：

1.  Rowsetのアップロードが失敗したが、一部のセグメントは正常にアップロードされた場合。

2.  アップロードされたrowsetが複数のレプリカでコンセンサスに達しなかった場合。

3.  compaction完了後のcompactionに参加したRowset。

ガベージデータは即座にクリーンアップされません。BEパラメータ`remove_unused_remote_files_interval_sec`は、リモートストレージでのガベージコレクションの時間間隔を設定でき、デフォルトは21600秒（6時間）です。

## クエリとパフォーマンス最適化

クエリパフォーマンスを最適化し、オブジェクトストレージリソースを節約するため、ローカルCacheが導入されました。リモートストレージからデータを初回クエリする際、DorisはリモートストレージからBEのローカルディスクにデータをロードしてキャッシュします。Cacheには以下の特徴があります：

-   Cacheは実際にBEのローカルディスクに保存され、メモリ空間を占有しません。

-   CacheはLRUを通じて管理され、TTLはサポートしていません。

具体的な設定については、(../../lakehouse/data-cache)を参照してください。

## FAQ

1.  `ERROR 1105 (HY000): errCode = 2, detailMessage = Failed to create repository: connect to s3 failed: Unable to marshall request to JSON: host must not be null.`

S3 SDKはデフォルトでvirtual-hostedスタイル方式を使用します。ただし、一部のオブジェクトストレージシステム（MinIOなど）では、virtual-hostedスタイルアクセスが有効化または サポートされていない場合があります。この場合、`use_path_style`パラメータを追加してpathスタイル方式の使用を強制できます：

```sql
CREATE RESOURCE "remote_s3"
PROPERTIES
(
    "type" = "s3",
    "s3.endpoint" = "bj.s3.com",
    "s3.region" = "bj",
    "s3.bucket" = "test-bucket",
    "s3.root.path" = "path/to/root",
    "s3.access_key" = "bbb",
    "s3.secret_key" = "aaaa",
    "s3.connection.maximum" = "50",
    "s3.connection.request.timeout" = "3000",
    "s3.connection.timeout" = "1000",
    "use_path_style" = "true"
);
```
2. クールダウン時間に関連するパラメータを変更すると何が起こりますか？

   クールダウン関連のパラメータの変更は、まだリモートストレージにクールされていないデータに対してのみ有効になります。すでにリモートストレージにクールされたデータには、変更は適用されません。例えば、`cooldown_ttl`を21日から7日に変更しても、すでにリモートストレージにあるデータはローカルストレージに戻されません。
