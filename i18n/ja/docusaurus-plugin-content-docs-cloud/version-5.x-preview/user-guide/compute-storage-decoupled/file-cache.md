---
{
  "title": "ファイルキャッシュ",
  "description": "分離されたアーキテクチャでは、データはリモートストレージに保存されます。",
  "language": "ja"
}
---
# File Cache

分離アーキテクチャでは、データはリモートストレージに保存されます。Dorisデータベースは、ローカルディスクのキャッシュを利用してデータアクセスを高速化し、高度なマルチキューLRU（Least Recently Used）戦略を採用してキャッシュスペースを効率的に管理します。この戦略は特にインデックスとメタデータのアクセスパスを最適化し、頻繁にアクセスされるユーザーデータのキャッシュを最大化することを目的としています。マルチコンピュートグループ（Compute Group）シナリオにおいて、Dorisは新しいコンピュートグループが確立された際に特定のデータ（Tableやパーティションなど）をキャッシュに素早く読み込むキャッシュウォーミング機能も提供し、クエリパフォーマンスを向上させます。

## Multi-Queue LRU

### LRU

* LRUは、データアクセスキューを維持することでキャッシュを管理します。データがアクセスされると、キューの先頭に移動されます。キャッシュに新しく追加されたデータも、早期に削除されることを防ぐためにキューの先頭に配置されます。キャッシュスペースが上限に達すると、キューの末尾のデータが最初に削除されます。

### TTL (Time-To-Live)

* TTL戦略は、新しくインポートされたデータが削除されることなく、一定期間キャッシュに残ることを保証します。この期間中、データは最高の優先度を持ち、すべてのTTLデータは平等に扱われます。キャッシュスペースが不足している場合、システムは他のキューからのデータの削除を優先し、TTLデータがキャッシュに書き込めることを保証します。

* アプリケーションシナリオ：TTL戦略は、ローカル永続化が必要な小規模データTableに特に適しています。常駐Tableには、そのデータを保護するためにより長いTTL値を設定でき、動的にパーティション化されたTableには、Hot Partitionsのアクティブ時間に応じてTTL値を設定できます。

* 注意：現在、システムはキャッシュ内のTTLデータの割合を直接表示することをサポートしていません。

### Multi-Queue

* DorisはLRUベースのマルチキュー戦略を採用し、TTL属性とデータプロパティに基づいてデータを4つのタイプに分類し、TTLキュー、Indexキュー、NormalDataキュー、Disposableキューに配置します。TTL属性を持つデータはTTLキューに、TTL属性のないインデックスデータはIndexキューに、TTL属性のない通常データはNormalDataキューに、一時データはDisposableキューに配置されます。

* データの読み書きプロセス中、Dorisはキャッシュ使用率を最大化するために、読み込みと書き込みを行うキューを選択します。具体的なメカニズムは以下の通りです：

| Operation      | Queue Filled on Miss | Queue Filled on Write    |
| -------------- | --------------------- | ------------------------- |
| Import         | TTL / Index / NormalData | TTL / Index / NormalData    |
| Query          | TTL / Index / NormalData | N/A                       |
| Schema Change   | Disposable            | TTL / Index / NormalData   |
| コンパクション     | Disposable            | TTL / Index / NormalData   |
| Warm-up        | N/A                   | TTL / Index / NormalData   |

### Eviction

すべてのタイプのキャッシュは総キャッシュスペースを共有し、重要度に基づいて割合を配分できます。これらの割合は`be`設定ファイルで`file_cache_path`を使用して設定でき、デフォルトは：TTL: Normal: Index: Disposable = 50%: 30%: 10%: 10%です。

これらの割合は厳格な制限ではありません。Dorisはスペースを完全に活用するために動的に調整します。例えば、ユーザーがTTLキャッシュを利用しない場合、他のタイプは事前設定された割合を超えて、TTL用に本来配分されたスペースを使用できます。

キャッシュ削除は、ガベージコレクションまたはキャッシュスペース不足という2つの条件でトリガーされます。ユーザーがデータを削除したり、compactionタスクが終了したりすると、期限切れのキャッシュデータが非同期で削除されます。キャッシュに書き込むのに十分なスペースがない場合、削除はDisposable、Normal Data、Index、TTLの順序で行われます。例えば、Normal Dataを書き込むのに十分なスペースがない場合、DorisはLRU順でDisposable、Index、TTLデータを順次削除します。対象タイプのすべてのデータを削除してから次のタイプに移るのではなく、他のタイプが適切に機能することを保証するために、少なくとも前述の割合は保持します。このプロセスで十分なスペースが解放されない場合、そのタイプ自体のLRU削除がトリガーされます。例えば、Normal Dataを書き込む際に他のタイプから十分なスペースを解放できない場合、Normal DataはLRU順で自身のデータを削除します。

具体的に、有効期限を持つTTLキューについて、データが期限切れになると、Normal Dataキューに移動され、Normal Dataとして削除に参加します。

## Cache Warming

分離モードでは、Dorisはマルチコンピュートグループデプロイメントをサポートしており、コンピュートグループはデータを共有しますがキャッシュは共有しません。新しいコンピュートグループが作成されると、そのキャッシュは空で、クエリパフォーマンスに影響を与える可能性があります。そのため、Dorisはユーザーがリモートストレージからローカルキャッシュにデータを積極的に取得できるキャッシュウォーミング機能を提供します。この機能は以下の3つのモードをサポートします：

- **Inter-Compute Group Warming**：Compute Group AのキャッシュデータをCompute Group Bにウォームします。Dorisは定期的に各コンピュートグループで一定期間にアクセスされたTable/パーティションのホットスポット情報を収集し、この情報に基づいて特定のTable/パーティションを選択的にウォームします。
- **Table Data Warming**：Table Aのデータを新しいコンピュートグループにウォームすることを指定します。
- **パーティション Data Warming**：Table Aのパーティション`p1`のデータを新しいコンピュートグループにウォームすることを指定します。

## Compute Group Scaling

Compute Groupsをスケーリングする際、キャッシュの変動を避けるために、Dorisは最初に影響を受けるタブレットを再マッピングし、データをウォームします。

## Cache Observation

### Hotspot Information

Dorisは各コンピュートグループのキャッシュホットスポット情報を10分ごとに収集し、内部システムTableに格納します。このホットスポット情報はクエリ文を使用して表示できます。ユーザーはこの情報に基づいてキャッシュ使用をより良く計画できます。

:::info 注意
バージョン3.0.4以前では、`SHOW CACHE HOTSPOT`文を使用してキャッシュホットスポット情報統計をクエリできました。バージョン3.0.4以降、`SHOW CACHE HOTSPOT`文はキャッシュホットスポット情報統計のクエリをサポートしなくなりました。システムTable`__internal_schema.cloud_cache_hotspot`を直接クエリしてください。
:::

ユーザーは通常、コンピュートグループとデータベースTableの2つのレベルでキャッシュ使用情報に注目します。以下に、よく使用されるクエリ文と例を示します。

#### 全コンピュートグループで最も頻繁にアクセスされるTableの表示

```sql
-- Equivalent to SHOW CACHE HOTSPOT "/" before version 3.0.4
WITH t1 AS (
  SELECT
    cluster_id,
    cluster_name,
    table_id,
    table_name,
    insert_day,
    SUM(query_per_day) AS query_per_day_total,
    SUM(query_per_week) AS query_per_week_total
  FROM __internal_schema.cloud_cache_hotspot
  GROUP BY cluster_id, cluster_name, table_id, table_name, insert_day
)
SELECT
  cluster_id AS ComputeGroupId,
  cluster_name AS ComputeGroupName,
  table_id AS TableId,
  table_name AS TableName
FROM (
  SELECT
    ROW_NUMBER() OVER (
      PARTITION BY cluster_id
      ORDER BY insert_day DESC, query_per_day_total DESC, query_per_week_total DESC
    ) AS dr2,
    *
  FROM t1
) t2
WHERE dr2 = 1;
```
#### 特定のCompute Group下で最も頻繁にアクセスされるTableの表示

compute group `compute_group_name0`下で最も頻繁にアクセスされるTableを表示します。

注意: 条件`cluster_name = "compute_group_name0"`を実際のcompute group名に置き換えてください。

```sql
-- Equivalent to SHOW CACHE HOTSPOT '/compute_group_name0' before version 3.0.4
WITH t1 AS (
  SELECT
    cluster_id,
    cluster_name,
    table_id,
    table_name,
    insert_day,
    SUM(query_per_day) AS query_per_day_total,
    SUM(query_per_week) AS query_per_week_total
  FROM __internal_schema.cloud_cache_hotspot
  WHERE cluster_name = "compute_group_name0" -- Replace with the actual compute group name, e.g., "default_compute_group"
  GROUP BY cluster_id, cluster_name, table_id, table_name, insert_day
)
SELECT
  cluster_id AS ComputeGroupId,
  cluster_name AS ComputeGroupName,
  table_id AS TableId,
  table_name AS TableName
FROM (
  SELECT
    ROW_NUMBER() OVER (
      PARTITION BY cluster_id
      ORDER BY insert_day DESC, query_per_day_total DESC, query_per_week_total DESC
    ) AS dr2,
    *
  FROM t1
) t2
WHERE dr2 = 1;
```
#### 特定のコンピュートグループとTableの最も頻繁にアクセスされるパーティションの表示

コンピュートグループ `compute_group_name0` 下のTable `regression_test_cloud_load_copy_into_tpch_sf1_p1.customer` の最も頻繁にアクセスされるパーティションを表示します。

注記：条件 `cluster_name = "compute_group_name0"` と `table_name = "regression_test_cloud_load_copy_into_tpch_sf1_p1.customer"` を実際のコンピュートグループ名とデータベースTable名に置き換えてください。

```sql
-- Equivalent to SHOW CACHE HOTSPOT '/compute_group_name0/regression_test_cloud_load_copy_into_tpch_sf1_p1.customer' before version 3.0.4
SELECT
  partition_id AS PartitionId,
  partition_name AS PartitionName
FROM __internal_schema.cloud_cache_hotspot
WHERE
  cluster_name = "compute_group_name0" -- Replace with the actual compute group name, e.g., "default_compute_group"
  AND table_name = "regression_test_cloud_load_copy_into_tpch_sf1_p1.customer" -- Replace with the actual database table name, e.g., "db1.t1"
GROUP BY
  cluster_id,
  cluster_name,
  table_id,
  table_name,
  partition_id,
  partition_name;
```
### Cache Space and Hit Rate

Doris BE ノードは `curl {be_ip}:{brpc_port}/vars` を使用してキャッシュ統計を取得できます（brpc_port はデフォルトで8060）。メトリクス名はディスクパスで始まります。

上記の例では、File Cache のメトリクスプレフィックスはパスです。例えば、プレフィックス "_mnt_disk1_gavinchou_debug_doris_cloud_be0_storage_file_cache_" は "/mnt/disk1/gavinchou/debug/doris-cloud/be0_storage_file_cache/" を示します。
プレフィックスの後の部分は統計メトリクスです。例えば、"file_cache_cache_size" は、このパスの File Cache の現在のサイズが26111バイトであることを示します。

以下の表は、全メトリクスの意味を示しています（すべてのサイズ単位はバイト）：

メトリクス名（パスプレフィックスを除く） | 意味
-----|------
file_cache_cache_size | File Cache の現在の合計サイズ
file_cache_disposable_queue_cache_size | disposable queue の現在のサイズ
file_cache_disposable_queue_element_count | disposable queue の現在の要素数
file_cache_disposable_queue_evict_size | 起動以降に disposable queue から退避されたデータの合計量
file_cache_index_queue_cache_size | index queue の現在のサイズ
file_cache_index_queue_element_count | index queue の現在の要素数
file_cache_index_queue_evict_size | 起動以降に index queue から退避されたデータの合計量
file_cache_normal_queue_cache_size | normal queue の現在のサイズ
file_cache_normal_queue_element_count | normal queue の現在の要素数
file_cache_normal_queue_evict_size | 起動以降に normal queue から退避されたデータの合計量
file_cache_total_evict_size | 起動以降に File Cache 全体から退避されたデータの合計量
file_cache_ttl_cache_evict_size | 起動以降に TTL queue から退避されたデータの合計量
file_cache_ttl_cache_lru_queue_element_count | TTL queue の現在の要素数
file_cache_ttl_cache_size | TTL queue の現在のサイズ
file_cache_evict_by_heat\_[A]\_to\_[B] | キャッシュタイプB により退避されたキャッシュタイプA のデータ（時間ベースの有効期限切れ）
file_cache_evict_by_size\_[A]\_to\_[B] | キャッシュタイプB により退避されたキャッシュタイプA のデータ（容量ベースの有効期限切れ）
file_cache_evict_by_self_lru\_[A] | 新しいデータのため、独自の LRU ポリシーにより退避されたキャッシュタイプA のデータ

### SQL Profile

SQL profile のキャッシュ関連メトリクスは SegmentIterator の下にあります：

| メトリクス名                     | 意味      |
|----------------------------------|-------------|
| BytesScannedFromCache            | File Cache から読み取られたデータ量    |
| BytesScannedFromRemote           | リモートストレージから読み取られたデータ量     |
| BytesWriteIntoCache              | File Cache に書き込まれたデータ量   |
| LocalIOUseTimer                  | File Cache からの読み取りにかかった時間      |
| NumLocalIOTotal                  | File Cache が読み取られた回数     |
| NumRemoteIOTotal                 | リモートストレージが読み取られた回数      |
| NumSkipCacheIOTotal              | リモートストレージから読み取られたデータが File Cache に入らなかった回数 |
| RemoteIOUseTimer                 | リモートストレージからの読み取りにかかった時間       |
| WriteCacheIOUseTimer             | File Cache への書き込みにかかった時間        |

Query Performance Analysis を通じてクエリパフォーマンス分析を表示できます。

## 使用方法

### TTL Strategy の設定

Table作成時に、対応する PROPERTY を設定して、そのTableのデータのキャッシュに TTL ストラテジー を使用します。

- `file_cache_ttl_seconds`：新しくインポートされたデータがキャッシュに残ると予想される時間（秒単位）。

```shell
CREATE TABLE IF NOT EXISTS customer (
  C_CUSTKEY     INTEGER NOT NULL,
  C_NAME        VARCHAR(25) NOT NULL,
  C_ADDRESS     VARCHAR(40) NOT NULL,
  C_NATIONKEY   INTEGER NOT NULL,
  C_PHONE       CHAR(15) NOT NULL,
  C_ACCTBAL     DECIMAL(15,2)   NOT NULL,
  C_MKTSEGMENT  CHAR(10) NOT NULL,
  C_COMMENT     VARCHAR(117) NOT NULL
)
DUPLICATE KEY(C_CUSTKEY, C_NAME)
DISTRIBUTED BY HASH(C_CUSTKEY) BUCKETS 32
PROPERTIES(
    "file_cache_ttl_seconds"="300"
)
```
上記のTableでは、新たにインポートされたすべてのデータは300秒間キャッシュに保持されます。システムは現在、TableのTTL時間の変更をサポートしており、ユーザーは実際のニーズに基づいてTTL時間を延長または短縮することができます。

```SQL
ALTER TABLE customer set ("file_cache_ttl_seconds"="3000");
```
:::info Note

変更されたTTL値はすぐには有効にならず、一定の遅延があります。

Table作成時にTTLが設定されていない場合、ユーザーはALTER文を実行してTableのTTL属性を変更することもできます。
:::

### キャッシュウォーミング

- Inter-Compute Group Warming. `compute_group_name0`のキャッシュデータを`compute_group_name1`にウォームします。

以下のSQLを実行すると、`compute_group_name1`コンピュートグループは`compute_group_name0`コンピュートグループのアクセス情報を取得し、`compute_group_name0`のキャッシュを可能な限り忠実に復元します。

```sql
WARM UP COMPUTE GROUP compute_group_name1 WITH COMPUTE GROUP compute_group_name0
```
- Table Data Warming. Table `customer` のデータを `compute_group_name1` にウォームします。以下のSQLを実行すると、そのTableの全データがリモートストレージからローカルに取得されます。

```sql
WARM UP COMPUTE GROUP compute_group_name1 WITH TABLE customer
```
- パーティション Data Warming. Table`customer`のパーティション`p1`のデータを`compute_group_name1`にウォームします。以下のSQLを実行すると、そのパーティションのすべてのデータがリモートストレージからローカルに取得されます。

```sql
WARM UP COMPUTE GROUP compute_group_name1 with TABLE customer PARTITION p1
```
上記の3つのキャッシュウォーミングSQL文はJobID結果を返します。例えば：

```sql
WARM UP COMPUTE GROUP cloud_warm_up WITH TABLE test_warm_up;
```
その後、以下のSQLでキャッシュウォーミングの進行状況を確認できます。

```sql
SHOW WARM UP JOB WHERE ID = 13418; 
```
`FinishBatch`と`AllBatch`に基づいて現在のタスクの進行状況を確認することができます。各Batchのデータサイズは約10GBです。現在、コンピュートグループ内では一度に実行できるwarming jobは1つのみサポートされています。ユーザーは実行中のwarming jobを停止することができます。

```sql
CANCEL WARM UP JOB WHERE id = 13418;
```
## 実用例

あるユーザーは合計データ量が3TBを超える一連のデータTableを持っているが、利用可能なキャッシュ容量は1.2TBのみである。その中で、アクセス頻度の高い2つのTableがある。1つは200MBサイズのディメンションTable（`dimension_table`）で、もう1つは100GBサイズのファクトTable（`fact_table`）であり、毎日新しいデータがインポートされ、T+1クエリ操作が必要である。さらに、他の大きなTableはアクセス頻度が低い。

LRUキャッシング戦略の下では、大きなTableデータがクエリされると、キャッシュに残す必要がある小さなTableデータを置き換える可能性があり、パフォーマンスの変動を引き起こす。この問題を解決するため、ユーザーはTTLキャッシング戦略を採用し、2つのTableのTTL時間をそれぞれ1年と1日に設定する。

```shell
ALTER TABLE dimension_table set ("file_cache_ttl_seconds"="31536000");

ALTER TABLE fact_table set ("file_cache_ttl_seconds"="86400");
```
ディメンションTableについては、サイズが小さく変動性も少ないため、ユーザーは1年以内にデータに高速でアクセスできるよう、TTL時間を1年に設定します。ファクトTableについては、ユーザーは毎日Tableバックアップを実行してから完全インポートを実施する必要があるため、TTL時間は1日に設定されます。
