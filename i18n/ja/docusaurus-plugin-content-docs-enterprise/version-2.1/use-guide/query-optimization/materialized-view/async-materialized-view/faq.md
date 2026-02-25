---
{
  "title": "FAQ",
  "description": "Dorisは内部的にマテリアライズドビューとベーステーブル間のパーティション対応を計算し、ベーステーブルのバージョンを記録します",
  "language": "ja"
}
---
## ビルドとリフレッシュ

### Q1: Dorisはマテリアライズドビューでどのパーティションをリフレッシュする必要があるかをどのように判断しますか？

Dorisは内部的にマテリアライズドビューとベーステーブル間のパーティション対応関係を計算し、最後の成功したリフレッシュ後にマテリアライズドビューが使用したベーステーブルパーティションのバージョンを記録します。例えば、マテリアライズドビューmv1がベーステーブルt1とt2から作成され、t1に基づいてパーティション化されている場合。

mv1のパーティションp202003がベーステーブルt1のパーティションp20200301とp20200302に対応すると仮定すると、p202003をリフレッシュした後、Dorisはパーティションp20200301とp20200302、およびテーブルt2の現在のバージョンを記録します。

次回のリフレッシュ時に、Dorisはp20200301、p20200302、t2のバージョンが変更されているかを確認します。これらのいずれかが変更されている場合、p202003をリフレッシュする必要があることを示します。

また、t2への変更がmv1のリフレッシュをトリガーすることなく受け入れられる場合は、マテリアライズドビューの`excluded_trigger_tables`プロパティを使用してこれを設定できます。

### Q2: マテリアライズドビューが多くのリソースを消費し、他のビジネス運用に影響を与える場合、どうすればよいですか？

マテリアライズドビューのプロパティを通じてworkload_groupを指定することで、マテリアライズドビューのリフレッシュタスクに割り当てられるリソースを制御できます。

メモリ割り当てが少なすぎて、単一パーティションのリフレッシュにより多くのメモリが必要な場合、タスクが失敗する可能性があることに注意が必要です。このトレードオフはビジネス要件に基づいて慎重に検討する必要があります。

### Q3: 既存のマテリアライズドビューに基づいて新しいマテリアライズドビューを作成できますか？

はい、これはDoris 2.1.3以降でサポートされています。ただし、各マテリアライズドビューはデータ更新時に独自のリフレッシュロジックを採用します。例えば、mv2がmv1に基づいており、mv1がt1に基づいている場合、mv2のリフレッシュ中にmv1とt1間の同期は考慮されません。

### Q4: Dorisではどの外部テーブルがサポートされていますか？

Dorisでサポートされているすべての外部テーブルを使用してマテリアライズドビューを作成できます。ただし、現在パーティションリフレッシュをサポートしているのはHiveのみで、他のタイプのサポートは将来計画されています。

### Q5: マテリアライズドビューがHiveと同じデータを表示しているが、実際には一貫性がない。

マテリアライズドビューはCatalogを通じて取得された結果との一貫性のみを保証します。Catalogにはメタデータとデータキャッシングが含まれているため、マテリアライズドビューとHiveデータの一貫性を確保するには、`REFRESH CATALOG`などの方法を使用してCatalogをリフレッシュし、CatalogデータをHiveと同期する必要がある場合があります。

### Q6: マテリアライズドビューはスキーマ変更をサポートしていますか？

いいえ、マテリアライズドビューの列属性はマテリアライズドビュー自体のSQL定義から派生するため、スキーマ変更はサポートされていません。明示的なカスタム変更は許可されていません。

### Q7: マテリアライズドビューが使用するベーステーブルはスキーマ変更を行うことができますか？

はい、スキーマ変更は許可されています。ただし、変更後、このベーステーブルを使用するマテリアライズドビューのステータスはNORMALからSCHEMA_CHANGEに変更され、この時点でマテリアライズドビューは透過的な書き換えに使用できませんが、マテリアライズドビューへの直接クエリは影響を受けません。マテリアライズドビューの次のリフレッシュタスクが成功すると、ステータスはNORMALに戻ります。

### Q8: プライマリキーモデルのテーブルを使用してマテリアライズドビューを作成できますか？

マテリアライズドビューのベーステーブルのデータモデルに制限はありません。ただし、マテリアライズドビュー自体は詳細モデルのみ可能です。

### Q9: マテリアライズドビューにインデックスを作成できますか？

はい。

### Q10: マテリアライズドビューはリフレッシュ中にテーブルをロックしますか？

リフレッシュ中に短時間のテーブルロックが発生しますが、継続的にテーブルロックを占有することはありません（データインポート時のロック時間とほぼ同等）。

### Q11: マテリアライズドビューはリアルタイムに近いシナリオに適していますか？

特に適していません。マテリアライズドビューをリフレッシュする最小単位はパーティションであり、大量のデータボリュームに対して大量のリソースを消費する可能性があり、リアルタイム機能が不足しています。代わりに同期マテリアライズドビューや他の方法の使用を検討してください。

### Q12: パーティション化されたマテリアライズドビューのビルド時にエラーが発生

エラーメッセージ：

```sql
Unable to find a suitable base table for partitioning
```
このエラーは通常、マテリアライズドビューのSQL定義とパーティショニングフィールドの選択が増分パーティション更新を許可せず、パーティション化されたマテリアライズドビューの作成中にエラーが発生したことを示しています。

- 増分パーティション更新の場合、マテリアライズドビューのSQL定義とパーティショニングフィールドの選択は特定の要件を満たす必要があります。詳細については、Materialized View Refresh Modesを参照してください。

- 最新のコードはパーティションビルド失敗の理由を示すことができ、エラーの概要と説明がAppendix 2で提供されています。

Example:

```sql
CREATE TABLE IF NOT EXISTS orders (
  o_orderkey INTEGER NOT NULL, 
  o_custkey INTEGER NOT NULL, 
  o_orderstatus CHAR(1) NOT NULL, 
  o_totalprice DECIMALV3(15, 2) NOT NULL, 
  o_orderdate DATE NOT NULL, 
  o_orderpriority CHAR(15) NOT NULL, 
  o_clerk CHAR(15) NOT NULL, 
  o_shippriority INTEGER NOT NULL, 
  O_COMMENT VARCHAR(79) NOT NULL
) DUPLICATE KEY(o_orderkey, o_custkey) PARTITION BY RANGE(o_orderdate) (
  FROM 
    ('2024-05-01') TO ('2024-06-30') INTERVAL 1 DAY
) DISTRIBUTED BY HASH(o_orderkey) BUCKETS 3 PROPERTIES ("replication_num" = "1");


CREATE TABLE IF NOT EXISTS lineitem (
  l_orderkey INTEGER NOT NULL, 
  l_partkey INTEGER NOT NULL, 
  l_suppkey INTEGER NOT NULL, 
  l_linenumber INTEGER NOT NULL, 
  l_quantity DECIMALV3(15, 2) NOT NULL, 
  l_extendedprice DECIMALV3(15, 2) NOT NULL, 
  l_discount DECIMALV3(15, 2) NOT NULL, 
  l_tax DECIMALV3(15, 2) NOT NULL, 
  l_returnflag CHAR(1) NOT NULL, 
  l_linestatus CHAR(1) NOT NULL, 
  l_shipdate DATE NOT NULL, 
  l_commitdate DATE NOT NULL, 
  l_receiptdate DATE NOT NULL, 
  l_shipinstruct CHAR(25) NOT NULL, 
  l_shipmode CHAR(10) NOT NULL, 
  l_comment VARCHAR(44) NOT NULL
) DUPLICATE KEY(
  l_orderkey, l_partkey, l_suppkey, 
  l_linenumber
) DISTRIBUTED BY HASH(l_orderkey) BUCKETS 3 PROPERTIES ("replication_num" = "1");
```
以下のマテリアライズドビューの定義では、`orders.o_orderdate`がマテリアライズドビューのパーティショニングフィールドとして選択された場合、増分パーティション更新が可能になります。逆に、`lineitem.l_shipdate`を使用した場合、増分更新は有効になりません。

理由：

1. `lineitem.l_shipdate`はベーステーブルのパーティショニングカラムではなく、`lineitem`にはパーティショニングカラムが定義されていません。

2. `lineitem.l_shipdate`は`outer join`操作中に`null`値を生成するカラムです。

```sql
CREATE MATERIALIZED VIEW mv_1 BUILD IMMEDIATE REFRESH AUTO ON MANUAL partition by(o_orderdate) DISTRIBUTED BY RANDOM BUCKETS 2 PROPERTIES ('replication_num' = '1') AS 
SELECT 
  l_linestatus, 
  sum(
    l_extendedprice * (1 - l_discount)
  ) AS revenue, 
  o_orderdate, 
  o_shippriority 
FROM 
  orders 
  LEFT JOIN lineitem ON l_orderkey = o_orderkey 
WHERE 
  o_orderdate <= DATE '2024-06-30' 
  AND o_orderdate >= DATE '2024-05-01' 
GROUP BY 
  l_linestatus, 
  o_orderdate, 
  o_shippriority;
```
### Q13: マテリアライズドビューの作成時にエラーが発生

エラーメッセージ:

```sql
ERROR 1105 (HY000): errCode = 2, detailMessage = Syntax error in line 1:
BUILD IMMEDIATE REFRESH AUTO ON MANUAL
```
理由として以下が考えられます：

1. 非同期マテリアライズドビューを作成するステートメントは、新しいoptimizerでのみサポートされています。新しいoptimizerを使用していることを確認してください：

    ```sql
    SET enable_nereids_planner = true;
    ```
2. refresh キーワードにタイポグラフィカルエラーがあるか、マテリアライズドビューのSQL定義に構文エラーがある可能性があります。マテリアライズドビューのSQL定義と作成文の正確性を確認してください。

### Q14: マテリアライズドビューが正常にリフレッシュされた後でも、まだデータがない

マテリアライズドビューは、ベーステーブルまたはベーステーブルパーティションからバージョン情報を取得する能力に基づいて、データを更新する必要があるかどうかを判断します。

現在バージョン情報の取得をサポートしていないデータレイク（JDBC Catalog など）に遭遇した場合、リフレッシュプロセスはマテリアライズドビューを更新する必要がないと判断します。そのため、マテリアライズドビューを作成またはリフレッシュする際は、auto ではなく complete を指定する必要があります。

データレイクに対するマテリアライズドビューサポートの進捗については、[Data Lake Support Status.](./overview.md) を参照してください。


### Q15: パーティション化されたマテリアライズドビューが常にフルリフレッシュされるのはなぜですか？
マテリアライズドビューのパーティションの増分リフレッシュは、ベーステーブルパーティションからのバージョン情報に依存します。前回のリフレッシュ以降にベーステーブルパーティションのデータが変更された場合、マテリアライズドビューは対応するパーティションをリフレッシュします。
パーティション化されたマテリアライズドビューがフルリフレッシュされている場合、考えられる理由は以下の通りです：

マテリアライズドビューの定義SQLで参照されているパーティション追跡されていないテーブルで変更が発生し、どのパーティションを更新する必要があるかを判断できないため、フルリフレッシュが強制されます。
例えば：
このマテリアライズドビューは orders テーブルの o_orderdate パーティションを追跡していますが、lineitem や partsupp でデータが変更された場合、システムはどのパーティションを更新する必要があるかを判断できず、フルリフレッシュが実行されます。

```sql

CREATE MATERIALIZED VIEW partition_mv
BUILD IMMEDIATE
REFRESH AUTO
ON SCHEDULE EVERY 1 DAY STARTS '2024-12-01 20:30:00'
PARTITION BY (DATE_TRUNC(o_orderdate, 'MONTH'))
DISTRIBUTED BY HASH (l_orderkey) BUCKETS 2
PROPERTIES
("replication_num" = "3")
AS
SELECT
o_orderdate,
l_orderkey,
l_partkey
FROM
orders
LEFT JOIN lineitem ON l_orderkey = o_orderkey
LEFT JOIN partsupp ON ps_partkey = l_partkey
and l_suppkey = ps_suppkey;
```
マテリアライズドビューが追跡しているベーステーブルを確認するには、以下を実行します

```sql
SELECT *
FROM mv_infos('database'='db_name')
WHERE Name = 'partition_mv' \G
```
返された結果では、MvPartitionInfoにpartitionType=FOLLOW_BASE_TABLEが表示されており、これはマテリアライズドビューのパーティションがベーステーブルのパーティションに従うことを示しています。
relatedColにはo_orderdateが表示されており、これはマテリアライズドビューのパーティションがo_orderdate列に基づいていることを意味します。

```text
Id: 1752809156450
Name: partition_mv
JobName: inner_mtmv_1752809156450
State: NORMAL
SchemaChangeDetail:
RefreshState: SUCCESS
RefreshInfo: BUILD IMMEDIATE REFRESH AUTO ON SCHEDULE EVERY 1 DAY STARTS "2025-12-01 20:30:00"
QuerySql: SELECT
`internal`.`doc_db`.`orders`.`o_orderdate`,
`internal`.`doc_db`.`lineitem`.`l_orderkey`,
`internal`.`doc_db`.`lineitem`.`l_partkey`
FROM
`internal`.`doc_db`.`orders`
LEFT JOIN `internal`.`doc_db`.`lineitem` ON `internal`.`doc_db`.`lineitem`.`l_orderkey` = `internal`.`doc_db`.`orders`.`o_orderkey`
LEFT JOIN `internal`.`doc_db`.`partsupp` ON `internal`.`doc_db`.`partsupp`.`ps_partkey` = `internal`.`doc_db`.`lineitem`.`l_partkey`
and `internal`.`doc_db`.`lineitem`.`l_suppkey` = `internal`.`doc_db`.`partsupp`.`ps_suppkey`
MvPartitionInfo: MTMVPartitionInfo{partitionType=EXPR, relatedTable=orders, relatedCol='o_orderdate', partitionCol='o_orderdate'}
SyncWithBaseTables: 1
```
解決策：

lineitemテーブルやpartsuppテーブルの変更がマテリアライズドビューに影響しない場合は、`excluded_trigger_tables`プロパティを設定することで、これらのテーブルが完全なリフレッシュをトリガーしないよう除外することができます：
`ALTER MATERIALIZED VIEW partition_mv set("excluded_trigger_tables"="lineitem,partsupp");`


## クエリと透過的リライト

### Q1: マテリアライズドビューがヒットしているかを確認する方法、および非ヒットの理由を見つける方法は？

`explain query_sql`を使用してマテリアライズドビューのヒット状況の概要を確認することができます。

例えば、以下のマテリアライズドビューを考えてみましょう：

```sql
CREATE MATERIALIZED VIEW mv11
BUILD IMMEDIATE REFRESH AUTO ON MANUAL
partition by(l_shipdate)
DISTRIBUTED BY HASH(l_orderkey) BUCKETS 10
PROPERTIES ('replication_num' = '1') 
AS
SELECT l_shipdate, l_orderkey, O_ORDERDATE, count(*)
FROM lineitem  
LEFT OUTER JOIN orders on l_orderkey = o_orderkey
GROUP BY l_shipdate, l_orderkey, O_ORDERDATE;
```
クエリは以下のようになります：

```sql
explain
SELECT l_shipdate, l_orderkey, O_ORDERDATE, count(*)
FROM lineitem  
LEFT OUTER JOIN orders on l_orderkey = o_orderkey
GROUP BY l_shipdate, l_orderkey, O_ORDERDATE;
```
- マテリアライズドビューのヒット情報はプランの最後にあります。

- **MaterializedViewRewriteSuccessAndChose:** 透過的書き換えが成功したことを示し、Cost-Based Optimizer (CBO) によって選択されたマテリアライズドビューの名前をリストします。

- **MaterializedViewRewriteSuccessButNotChose:** 透過的書き換えが成功したことを示しますが、CBO によって選択されなかったマテリアライズドビューの名前をリストします。選択されないということは、実行プランでこれらのマテリアライズドビューが使用されないことを意味します。

- **MaterializedViewRewriteFail:** 透過的書き換え失敗の失敗と理由の要約をリストします。

- `explain` 出力の最後に `MaterializedView` 情報がない場合、マテリアライズドビューが使用不可能な状態にあり、したがって透過的書き換えに参加できないことを意味します。（マテリアライズドビューがいつ使用不可能になるかの詳細については、「使用法と実践 - マテリアライズドビューステータスの確認」セクションを参照してください。）

以下は出力例です：

```sql
| MaterializedView                                                                   |
| MaterializedViewRewriteSuccessAndChose:                                            |
| internal#regression_test_nereids_rules_p0_mv#mv11,                                 |
|                                                                                    |
| MaterializedViewRewriteSuccessButNotChose:                                         |
|                                                                                    |
| MaterializedViewRewriteFail:                                                       |
+------------------------------------------------------------------------------------+
```
### Q2: マテリアライズドビューがヒットしない理由は何ですか？

まず、マテリアライズドビューがヒットするかどうかを確認するには、以下のSQLを実行してください（詳細は[Queries and Transparent Rewriting - Q1](#q1-how-does-doris-determine-which-partitions-need-to-be-refreshed-for-a-materialized-view)を参照）：

```Plain
explain
your_query_sql;
```
ヒットしない場合、以下の理由が考えられます：

- Doris バージョン 2.1.3 以前では、マテリアライズドビューの透過的リライト機能はデフォルトで無効になっています。透過的リライトを実現するには、対応するスイッチを有効にする必要があります。具体的なスイッチ値については、async-materialized view 関連のスイッチを参照してください。

- マテリアライズドビューが使用できない状態にある可能性があり、透過的リライトがヒットしません。マテリアライズドビューのビルド状況を確認するには、マテリアライズドビューのステータス確認に関するセクションを参照してください。

- 最初の2つのステップを確認した後でもマテリアライズドビューがヒットしない場合、SQL で定義されたマテリアライズドビューとクエリ SQL が、マテリアライズドビューの現在のリライト機能の範囲外である可能性があります。詳細については、Materialized View Transparent Rewriting Capabilities を参照してください。

- ヒットに失敗した詳細情報と説明については、[付録 1](#reference) を参照してください。

以下は、マテリアライズドビューの透過的リライトが失敗した例です：

**ケース 1:**

マテリアライズドビュー作成 SQL:

```sql
CREATE MATERIALIZED VIEW mv11
BUILD IMMEDIATE REFRESH AUTO ON MANUAL
partition by(l_shipdate)
DISTRIBUTED BY HASH(l_orderkey) BUCKETS 10
PROPERTIES ('replication_num' = '1') 
AS
SELECT l_shipdate, l_orderkey, O_ORDERDATE, count(*)
FROM lineitem  
LEFT OUTER JOIN orders on l_orderkey = o_orderkey
GROUP BY l_shipdate, l_orderkey, O_ORDERDATE;
```
クエリ実行:

```sql
explain
SELECT l_shipdate, l_linestatus, O_ORDERDATE, count(*)
FROM orders 
LEFT OUTER JOIN lineitem on l_orderkey = o_orderkey
GROUP BY l_shipdate, l_linestatus, O_ORDERDATE;
```
`Explain`出力:

```sql
| MaterializedView                                                                                          |
| MaterializedViewRewriteSuccessAndChose:                                                                   |
|                                                                                                           |
| MaterializedViewRewriteSuccessButNotChose:                                                                |
|                                                                                                           |
| MaterializedViewRewriteFail:                                                                              |
|   Name: internal#doc_test#mv11                                                                            |
|   FailSummary: View struct info is invalid, The graph logic between query and view is not consistent      |
```
出力では、`MaterializedViewRewriteFail`は失敗の概要を示し、`The graph logic between query and view is not consistent`はクエリとマテリアライズドビューの結合ロジックが同じでないことを示します。これは結合タイプまたは結合されるテーブルが異なることを意味します。

上記の例では、クエリとマテリアライズドビューのテーブル結合順序が一致しないため、エラーが発生しています。透過的リライト失敗の概要と説明については、付録1を参照してください。

**Case 2:**

クエリ実行:

```sql
explain
SELECT l_shipdate, l_linestatus, O_ORDERDATE, count(*)
FROM lineitem  
LEFT OUTER JOIN orders on l_orderkey = o_orderkey
GROUP BY l_shipdate, l_linestatus, O_ORDERDATE;
```
`Explain` 出力:

```sql
| MaterializedView                                                                                                          |
| MaterializedViewRewriteSuccessAndChose:                                                                                   |
|                                                                                                                           |
| MaterializedViewRewriteSuccessButNotChose:                                                                                |
|                                                                                                                           |
| MaterializedViewRewriteFail:                                                                                              |
|   Name: internal#doc_test#mv11                                                                                            |
|   FailSummary: View struct info is invalid, View dimensions doesn't not cover the query dimensions                        |
```
失敗サマリー `View dimensions doesn't cover the query dimensions` は、クエリ内の `GROUP BY` フィールドがマテリアライズドビューの `GROUP BY` フィールドから取得できないため、エラーが発生したことを示しています。

### Q3: マテリアライズドビューの状態が変更され、使用不可能になる状況とは？

ここでいう「使用不可能」とは、マテリアライズドビューが透明な書き換えに使用できないことを意味しますが、直接クエリすることは可能です。

- フルマテリアライズドビューの場合、ベースとなるテーブルデータの変更やSchema Changeによって、マテリアライズドビューが使用不可能になる可能性があります。

- パーティション化されたマテリアライズドビューの場合、ベースとなるテーブルデータの変更によって対応するパーティションが使用不可能になり、ベースとなるテーブルのSchema Changeによってマテリアライズドビュー全体が使用不可能になる可能性があります。

現在、マテリアライズドビューのリフレッシュ失敗も使用不可能にする可能性があります。ただし、失敗したマテリアライズドビューでも透明な書き換えに使用できるようにする最適化が計画されています。

### Q4: マテリアライズドビューへの直接クエリでデータが返されない場合は？

マテリアライズドビューがまだ構築中であるか、構築が失敗した可能性があります。

マテリアライズドビューのステータスを確認してこれを確認できます。具体的な方法については、マテリアライズドビューのステータス表示に関するセクションを参照してください。

### Q5: マテリアライズドビューで使用されるベーステーブルのデータが変更されたが、マテリアライズドビューがまだリフレッシュされていない場合、透明な書き換えの動作はどうなりますか？

async-materialized viewsとベースとなるテーブル間のデータには一定の遅延があります。

**1. 内部テーブルとデータ変更を感知できる外部テーブル（Hiveなど）の場合：ベースとなるテーブルデータが変更された際、マテリアライズドビューが使用可能かどうかは** **`grace_period`** **閾値によって決まります。**

`grace_period` は、マテリアライズドビューとベースとなるテーブル間のデータ不整合を許容する期間です。例えば：

- `grace_period` が0に設定されている場合、マテリアライズドビューがベースとなるテーブルデータと一致している必要があり、透明な書き換えに使用できることを意味します。外部テーブル（Hiveを除く）の場合、データ変更を感知できないため、それらを使用するマテリアライズドビューは依然として透明な書き換えに使用できます（ただし、データが不整合の可能性があります）。

- `grace_period` が10秒に設定されている場合、マテリアライズドビューデータとベースとなるテーブルデータ間で最大10秒の遅延を許可します。遅延が10秒以内であれば、マテリアライズドビューは依然として透明な書き換えに使用できます。

**2. パーティション化されたマテリアライズドビューの場合、一部のパーティションが無効になった場合、2つのシナリオがあります：**

- クエリが無効なパーティションからのデータを使用しない場合、マテリアライズドビューは依然として使用可能です。

- クエリが無効なパーティションからのデータを使用し、データ遅延が `grace_period` 以内である場合、マテリアライズドビューは依然として使用可能です。遅延が `grace_period` を超える場合、元のテーブルとマテリアライズドビューをunionすることでクエリに応答できます。これには `enable_materialized_view_union_rewrite` スイッチを有効にする必要があり、バージョン2.1.5からデフォルトで有効になっています。

## リファレンス

### 1 マテリアライズドビュー関連の設定

| 設定                                                        | 説明                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| SET enable_nereids_planner = true;                           | マテリアライズドビューの書き換えに必要な新しいオプティマイザーを有効にします。 |
| SET enable_materialized_view_rewrite = true;                 | クエリ書き換えを有効または無効にします。デフォルト：有効。       |
| SET materialized_view_rewrite_enable_contain_external_table = true; | 外部テーブルを含むマテリアライズドビューの書き換えへの参加を許可します。デフォルト：無効。 |
| SET materialized_view_rewrite_success_candidate_num = 3;     | CBOで考慮される書き換え成功候補の最大数。デフォルト：3。 |
| SET enable_materialized_view_union_rewrite = true;           | データが不十分な場合のベーステーブルとマテリアライズドビュー間のUNION ALLを許可します。デフォルト：有効。 |
| SET enable_materialized_view_nest_rewrite = true;            | ネストされたマテリアライズドビューの書き換えを有効にします。デフォルト：無効。 |
| SET materialized_view_relation_mapping_max_count = 8;        | 書き換え時の関係マッピングの最大数。デフォルト：8。 |

### 2 透明な書き換え失敗のサマリーと説明

| サマリー                                                      | 説明                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| View struct info is invalid                                  | マテリアライズドビューの構造情報が無効です。現在、書き換えでサポートされているSQLパターンには、クエリとマテリアライズドビューの両方でのjoin、およびマテリアライズドビューでjoinありまたはなしでのクエリでの集約が含まれます。このエラーは透明な書き換え中によく表示されます。各書き換えルールは特定のSQLパターンを担当しているためです。必要なパターンと一致しないルールがヒットした場合、このエラーが発生しますが、通常は書き換え失敗の主要な原因ではありません。 |
| Materialized view rule exec fail                             | 通常、透明な書き換えルールの実行中の例外を示します。調査するには、EXPLAIN memo plan query_sqlを使用して特定の例外スタックを表示してください。 |
| Match mode is invalid                                        | クエリ内のテーブル数がマテリアライズドビュー内のテーブル数と一致せず、書き換えがサポートされていません。 |
| Query to view table mapping is null                          | クエリとマテリアライズドビューテーブル間のマッピング生成に失敗しました。 |
| queryToViewTableMappings are over the limit and be intercepted | クエリ内の自己結合テーブルが多すぎて書き換え空間の過度な拡張を引き起こし、透明な書き換えを停止しました。 |
| Query to view slot mapping is null                           | クエリとマテリアライズドビューテーブル間のスロットマッピングに失敗しました。 |
| The graph logic between query and view is not consistent     | クエリとマテリアライズドビュー間のjoinタイプまたは結合されるテーブルが異なります。 |
| Predicate compensate fail                                    | 通常、クエリの条件範囲がマテリアライズドビューの範囲を超える場合に発生します。例：クエリがa > 10だがマテリアライズドビューがa > 15。 |
| Rewrite compensate predicate by view fail                    | 述語補償が失敗しました。通常、クエリに補償が必要な追加条件があるが、それらの条件で使用される列がマテリアライズドビューのSELECT句に現れないためです。 |
| Calc invalid partitions fail                                 | パーティション化されたマテリアライズドビューの場合、クエリで使用されるパーティションが有効かどうかの計算に失敗しました。 |
| mv can not offer any partition for query                     | クエリはマテリアライズドビューの無効なパーティションのみを使用します（最後のリフレッシュ以降にデータが変更された）。show partitions from mv_name（SyncWithBaseTables=falseはリフレッシュが必要であることを示す）でパーティションの有効性を確認してください。grace_period（秒単位）を設定してデータ遅延を許可してください。 |
| Add filter to base table fail when union rewrite             | クエリがマテリアライズドビューの無効なパーティションを使用し、マテリアライズドビューとベーステーブルのunion allの試行に失敗しました。 |
| RewrittenPlan output logical properties is different with target group | 書き換え後、マテリアライズドビューの出力論理プロパティが元のクエリのものと一致しません。 |
| Rewrite expressions by view in join fail                     | join書き換えにおいて、クエリで使用されるフィールドまたは式がマテリアライズドビューに存在しません。 |
| Rewrite expressions by view in scan fail                     | 単一テーブル書き換えにおいて、クエリで使用されるフィールドまたは式がマテリアライズドビューに存在しません。 |
| Split view to top plan and agg fail, view doesn't not contain aggregate | 集約書き換え中に、マテリアライズドビューに集約関数が含まれていません。 |
| Split query to top plan and agg fail                         | 集約書き換え中に、クエリに集約関数が含まれていません。 |
| rewritten expression contains aggregate functions when group equals aggregate rewrite | クエリとマテリアライズドビューが同じGROUP BYを持つ場合、書き換えられた式に集約関数が含まれています。 |
| Can not rewrite expression when no roll up                   | クエリとマテリアライズドビューが同じGROUP BYを持つ場合、式の書き換えに失敗しました。 |
| Query function roll up fail                                  | 集約書き換え中に、集約関数のroll-upが失敗しました。 |
| View dimensions do not cover the query dimensions            | クエリのGROUP BYがマテリアライズドビューのGROUP BYに存在しないディメンションを使用しています。 |
| View dimensions don't not cover the query dimensions in bottom agg | 上記と同様ですが、下位レベルの集約に特有です。 |
| View dimensions do not cover the query group set dimensions  | クエリのGROUP SETSがマテリアライズドビューのGROUP BYに存在しないディメンションを使用しています。 |
| The only one of query or view is scalar aggregate and can not rewrite expression meanwhile | クエリにはGROUP BYがありますが、マテリアライズドビューにはありません。 |
| Both query and view have group sets, or query doesn't have but view has, not supported | クエリとマテリアライズドビューの両方にGROUP SETS があるか、マテリアライズドビューのみにある場合の、サポートされていない透明な書き換えシナリオです。 |

### 3 非同期マテリアライズドビューパーティション構築失敗の理由

パーティション化されたマテリアライズドビューのリフレッシュメカニズムは、増分パーティション更新に依存しています：

- 最初に、マテリアライズドビューのパーティション列がベーステーブルのパーティション列にマップできるかどうかを計算します。

- 次に、それが1:1または1:nのマッピング関係であるかどうか、具体的なマッピング関係を決定します。

| 概要                                                         | 説明                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Partition column cannot be found in the SQL SELECT column    | マテリアライズドビュー定義でPARTITION BY後に使用される列は、マテリアライズドビューを定義するSQLのSELECT句に現れる必要があります。 |
| Cannot find a valid partition track column, because %s       | 適切なパーティション列を特定できません。具体的な理由は「because」に続きます。 |
| Partition track does not support mark join                   | マテリアライズドビューのパーティションフィールドが参照する列が、mark joinの入力テーブルのパーティション列であり、現在サポートされていません。 |
| Partition column is in an unsupported join null generation side | マテリアライズドビューのパーティションフィールドの参照列がjoinのnull生成側（LEFT JOINの右側など）にあります。 |
| Relation should be LogicalCatalogRelation                    | マテリアライズドビューが参照するパーティションベーステーブルのスキャンタイプはLogicalCatalogRelationである必要があります。他のタイプは現在サポートされていません。 |
| Self join does not support partition update                  | 自己結合を含むSQLクエリの場合、マテリアライズドビューの構築は現在サポートされていません。 |
| Partition track already has a related base table column      | マテリアライズドビューが参照するパーティション列は、現在単一のベーステーブルのパーティション列の参照のみサポートしています。 |
| Relation base table is not MTMVRelatedTableIf                | マテリアライズドビューが参照するパーティションベーステーブルがMTMVRelatedTableIfを継承していません。これはテーブルがパーティション化可能かどうかを示します。 |
| The related base table is not a partition table              | マテリアライズドビューで使用されるベーステーブルがパーティションテーブルではありません。 |
| The related base table partition column doesn't contain the MV partition | マテリアライズドビューのPARTITION BY後に参照される列が、パーティションベーステーブルに存在しません。 |
| Group BY sets are empty, does not contain the target partition | マテリアライズドビューを定義するSQLが集約を使用していますが、GROUP BY句が空です。 |
| Window partition sets do not contain the target partition    | ウィンドウ関数が使用されていますが、マテリアライズドビューが参照するパーティション列がPARTITION BY句にありません。 |
| Unsupported plan operation in track partition                | マテリアライズドビューを定義するSQLがORDER BYなどのサポートされていない操作を使用しています。 |
| Context partition column should be a slot from column        | ウィンドウ関数が使用され、PARTITION BY句において、マテリアライズドビューが参照するパーティション列が単純な列ではなく式になっています。 |
| Partition expressions use more than one slot reference       | GROUP BYまたはPARTITION BY後のパーティション列が、単純な列ではなく複数の列を含む式です。例：GROUP BY partition_col + other_col。 |
| Column to check using invalid implicit expression            | マテリアライズドビューのパーティション列はdate_trunkでのみ使用でき、パーティション列を使用する式はdate_trunkなどのみ可能です。 |
| Partition column time unit level should be greater than SQL SELECT column | マテリアライズドビューにおいて、PARTITION BY後のdate_trunkの時間単位粒度が、マテリアライズドビューを定義するSQL内のSELECT後に現れる時間単位粒度よりも小さいです。例えば、マテリアライズドビューが `PARTITION BY(date_trunc(col, 'day'))` を使用しているが、マテリアライズドビューを定義するSQLのSELECT後に `date_trunc(col, 'month')` がある場合。 |
