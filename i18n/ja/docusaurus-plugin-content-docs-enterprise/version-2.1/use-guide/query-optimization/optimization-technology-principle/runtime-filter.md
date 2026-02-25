---
{
  "title": "Runtime Filter",
  "description": "Runtime Filterは主に2つのタイプで構成されます：Join Runtime FilterとTopN Runtime Filterです。",
  "language": "ja"
}
---
Runtime Filterは主にJoin Runtime FilterとTopN Runtime Filterの2つのタイプで構成されています。本記事では、これら2つのタイプのRuntime Filterの動作原理、使用ガイドライン、およびチューニング方法について詳しく紹介します。

## Join Runtime Filter

Join Runtime Filter（以下JRFと呼ぶ）は、Join条件を活用してランタイムデータに基づいてJoinノードで動的にフィルタを生成する最適化技術です。この技術は、Join Probeのサイズを削減するだけでなく、データI/Oとネットワーク転送を効果的に最小化します。

### 原理

TPC-H Schemaに見られるようなJoin操作を使用してJRFの動作原理を説明します。

データベースに2つのテーブルがあると仮定します：

- Orders Table：1億行のデータを含み、注文キー（`o_orderkey`）、顧客キー（`o_custkey`）、その他の注文情報を記録します。

- Customer Table：10万行のデータを含み、顧客キー（`c_custkey`）、顧客の国（`c_nation`）、その他の顧客情報を記録します。このテーブルは25カ国の顧客を記録しており、国ごとに約4,000人の顧客がいます。

中国の顧客からの注文数を数えるため、クエリ文は次のようになります：

```sql
select count(*)
from orders join customer on o_custkey = c_custkey
where c_nation = "china"
```
このクエリの実行計画の主要コンポーネントはJoinです。以下に示します：

![Join Runtime Filter](/images/join-runtime-filter-1.jpg)

JRFなし：Scanノードがordersテーブルをスキャンし、1億行のデータを読み込みます。その後、Joinノードがこれらの1億行に対してHash Probeを実行してJoin結果を生成します。

**1. 最適化**

フィルタ条件`c_nation = 'china'`により中国以外の顧客がすべて除外されるため、customerテーブルの一部（約1/25）のみがJoinに関与します。後続のJoin条件`o_custkey = c_custkey`を考慮すると、フィルタされた結果で選択された`c_custkey`の値に注目する必要があります。フィルタされた`c_custkey`の値を集合Aとします。以降のテキストでは、集合AはJoinに参加する`c_custkey`の集合を特に指します。

集合AをIN条件としてordersテーブルにプッシュダウンすれば、ordersテーブルのScanノードは対応するordersをフィルタできます。これは`o_custkey IN (c001, c003)`というフィルタ条件を追加することに似ています。

この最適化の概念に基づき、SQLは以下のように最適化できます：

```sql
select count(*)
from orders join customer on o_custkey = c_custkey
where c_nation = "china" and o_custkey in (c001, c003)
```
最適化された実行プランを以下に示します：

![join-runtime-filter-2](/images/join-runtime-filter-2.jpg)

ordersテーブルにフィルタ条件を追加することで、Joinに参加する実際の注文数が1億から40万に削減され、クエリ速度が大幅に向上します。

**2. 実装**

上記で説明した最適化は重要ですが、オプティマイザは選択された実際の`c_custkey`値（集合A）を知らないため、最適化フェーズで固定のin-predicate filterオペレータを静的に生成することができません。

実際のアプリケーションでは、Joinノードで右側のデータを収集し、実行時に集合Aを生成し、集合AをordersテーブルのScanノードにプッシュダウンします。通常、このJRFを`RF(c_custkey -> [o_custkey])`として表記します。

Dorisは分散データベースであるため、JRFは分散シナリオに対応するための追加のマージステップが必要です。例のJoinがShuffle Joinであると仮定すると、このJoinの複数のインスタンスがordersテーブルとcustomerテーブルの個々のシャードを処理します。その結果、各Joinインスタンスは集合Aの一部のみを取得します。

現在のバージョンのDorisでは、Runtime Filter Managerとして機能するノードを選択します。各Joinインスタンスはそのシャードの`c_custkey`値に基づいてPartial JRFを生成し、それをManagerに送信します。Managerはすべての Partial JRFを収集し、それらをGlobal JRFにマージし、その後Global JRFをordersテーブルのすべてのScanインスタンスに送信します。

Global JRFを生成するプロセスを以下に示します：

![Global JRF](/images/global-JRF.jpg)

### フィルタタイプ

JRF（Join Runtime Filter）を実装するために使用できる様々なデータ構造があり、それぞれ生成、マージ、送信、適用における効率が異なり、異なるシナリオに適しています。

**1. In Filter**

JRFを実装する最もシンプルなアプローチは、In Filterの使用です。前述の例を取ると、In Filterを使用する場合、実行エンジンは左テーブルに述語`o_custkey in (...集合Aの要素のリスト...)`を生成します。このIn filter条件は、ordersテーブルをフィルタリングするために適用できます。集合Aの要素数が少ない場合、In Filterは効率的です。

しかし、集合Aの要素数が多い場合、In Filterの使用は問題となります：

1. 第一に、In Filterを生成するコストが高く、特にJRFマージが必要な場合です。異なるデータパーティションに対応するJoinノードから収集された値には重複が含まれる場合があります。例えば、`c_custkey`がテーブルの主キーでない場合、`c001`や`c003`などの値が複数回現れる可能性があり、時間のかかる重複排除プロセスが必要になります。

2. 第二に、集合Aに多くの要素が含まれる場合、JoinノードとordersテーブルのScanノード間でのデータ送信コストが重要になります。

3. 最後に、ordersテーブルのScanノードでIn述語を実行することも時間がかかります。

これらの要因を考慮して、Bloom Filterを導入します。

**2. Bloom Filter**

Bloom Filterに馴染みのない方のために説明すると、これらは重ね合わされたハッシュテーブルの集合として考えることができます。フィルタリングにBloom Filter（またはハッシュテーブル）を使用することは、以下の特性を活用します：

- 集合Aに基づいてハッシュテーブルTが生成されます。要素がハッシュテーブルTにない場合、その要素は集合Aにないと確実に結論づけることができます。ただし、その逆は真ではありません。

  したがって、`o_orderkey`がBloom Filterによってフィルタリングされた場合、Joinの右側に一致する`c_custkey`がないと結論づけることができます。しかし、ハッシュ衝突により、一致する`c_custkey`がない場合でも、一部の`o_custkey`がBloom Filterを通過する可能性があります。

  Bloom Filterは精密なフィルタリングを実現できませんが、それでも一定レベルのフィルタリング効果を提供します。

- ハッシュテーブルのバケット数がフィルタリングの精度を決定します。バケット数が多いほど、Filterはより大きく、より正確になりますが、生成、送信、使用における計算オーバーヘッドの増加というコストが伴います。

  したがって、Bloom Filterのサイズは、フィルタリング効果と使用コストの間でバランスを取る必要があります。この目的のため、`RUNTIME_BLOOM_FILTER_MIN_SIZE`と`RUNTIME_BLOOM_FILTER_MAX_SIZE`によって定義される、Bloom Filterのサイズの設定可能な範囲を設けています。

**3. Min/Max Filter**

Bloom Filter以外に、Min-Max Filterも近似フィルタリングに使用できます。データ列が順序付けられている場合、Min-Max Filterは優れたフィルタリング結果を実現できます。さらに、Min-Max Filterの生成、マージ、使用のコストは、In FilterやBloom Filterよりも大幅に低くなります。

非等価結合の場合、In FilterとBloom Filterの両方が効果的でなくなりますが、Min-Max Filterは依然として機能できます。前述の例からクエリを次のように変更するとします：

```sql
select count(*)
from orders join customer on o_custkey > c_custkey
where c_name = "China"
```
この場合、フィルタされた`c_custkey`の最大値を選択してnとして表し、それをordersテーブルのScanノードに渡すことができます。Scanノードはそれによって`o_custkey > n`である行のみを出力します。

### Join Runtime Filterの表示

特定のクエリに対してどのJRF（Join Runtime Filters）が生成されたかを確認するには、`explain`、`explain shape plan`、または`explain physical plan`コマンドを使用できます。

TPC-Hスキーマを例として、これら3つのコマンドを使用してJRFを表示する方法を詳しく説明します。

```sql
select count(*) from orders join customer on o_custkey=c_custkey;
```
**1. Explain**

従来のExplain出力では、JRF情報は通常、以下の例に示すようにJoinノードとScanノードに表示されます。

```sql
4: VHASH JOIN(258)  
| join op: INNER JOIN(PARTITIONED)[]  
|  equal join conjunct: (o_custkey[#10] = c_custkey[#0])  
|  runtime filters: RF000[bloom] <- c_custkey[#0] (150000000/134217728/16777216)  
|  cardinality=1,500,000,000  
|  vec output tuple id: 3  
|  output tuple id: 3  
|  vIntermediate tuple ids: 2  
|  hash output slot ids: 10  
|  final projections: o_custkey[#17]  
|  final project output tuple id: 3  
|  distribute expr lists: o_custkey[#10]
|  distribute expr lists: c_custkey[#0]  
|  
|---1: VEXCHANGE  
|      offset: 0  
|      distribute expr lists: c_custkey[#0]   
3: VEXCHANGE  
|  offset: 0  
|  distribute expr lists:  
  
PLAN FRAGMENT 2  
| PARTITION: HASH_PARTITIONED: o_orderkey[#8]  
| HAS_COLO_PLAN_NODE: false  
| STREAM DATA SINK  
|   EXCHANGE ID: 03  
|   HASH_PARTITIONED: o_custkey[#10]  
  
2: VOlapScanNode(242)  
|  TABLE: regression_test_nereids_tpch_shape_sf1000_p0.orders(orders)  
|  PREAGGREGATION: ON  
|  runtime filters: RF000[bloom] -> o_custkey[#10]  
|  partitions=1/1 (orders)  
|  tablets=96/96, tabletList=54990,54992,54994 ...  
|  cardinality=0, avgRowSize=0.0, numNodes=1  
|  pushAggOp=NONE
```
- Join Side: `runtime filters: RF000[bloom] <- c_custkey[#0] (150000000/134217728/16777216)`

  これは、ID 000のBloom Filterが生成されたことを示しており、`c_custkey`を入力として使用してJRFを作成します。後に続く3つの数値はBloom Filterのサイズ計算に関連しており、現時点では無視できます。

- Scan Side: `runtime filters: RF000[bloom] -> o_custkey[#10]`

  これは、JRF 000がordersテーブルのScanノードに適用され、`o_custkey`フィールドをフィルタリングすることを示しています。

**2. Shape Planの説明**

Explain Planシリーズでは、JRFの確認方法を示す例としてShape Planを使用します。

```sql
mysql> explain shape plan select count(*) from orders join customer on o_custkey=c_custkey where c_nationkey=5;  
+--------------------------------------------------------------------------------------------------------------------------+
Explain String(Nereids Planner)                                                                                            ｜
+--------------------------------------------------------------------------------------------------------------------------+
PhysicalResultSink                                                                                                         ｜  
--hashAgg[GLOBAL]                                                                                                          ｜  
----PhysicalDistribute[DistributionSpecGather]                                                                             ｜   
------hashAgg[LOCAL]                                                                                                       ｜ 
--------PhysicalProject                                                                                                    ｜
----------hashJoin[INNER_JOIN shuffle]                                                                                     ｜
------------hashCondition=((orders.o_custkey=customer.c_custkey)) otherCondition=() buildRFs:RF0 c_custkey->[o_custkey]    ｜  
--------------PhysicalProject                                                                                              ｜  
----------------Physical0lapScan[orders] apply RFs: RF0                                                                    ｜
--------------PhysicalProject                                                                                              ｜ 
----------------filter((customer.c_nationkey=5))                                                                           ｜ 
------------------Physical0lapScan[customer]                                                                               ｜
+--------------------------------------------------------------------------------------------------------------------------+
11 rows in set (0.02 sec)
```
上記に示すように:

- Join Side: `build RFs: RF0 c_custkey -> [o_custkey]` は、JRF 0が`c_custkey`データを使用して生成され、`o_custkey`に適用されることを示しています。

- Scan Side: `PhysicalOlapScan[orders] apply RFs: RF0` は、ordersテーブルがJRF 0によってフィルタされることを示しています。

**3. Profile**

実際の実行中、BEはJRFの使用詳細をProfileに出力します（`set enable_profile=true`が必要）。同じSQLクエリを例として、ProfileでJRFの実行詳細を確認できます。

- Join Side

  ```sql
  HASH_JOIN_SINK_OPERATOR  (id=3  ,  nereids_id=367):(ExecTime:  703.905us)
        -  JoinType:  INNER_JOIN
        。。。
        -  BuildRows:  617
        。。。
        -  RuntimeFilterComputeTime:  70.741us
        -  RuntimeFilterInitTime:  10.882us
  ```
これはJoinのBuild側のプロファイルです。この例では、617行の入力データでJRFの生成に70.741usかかりました。JRFのサイズとタイプはScan側に表示されます。

- Scan Side

  ```sql
  OLAP_SCAN_OPERATOR  (id=2.  nereids_id=351.  table  name  =  orders(orders)):(ExecTime:  13.32ms)
              -  RuntimeFilters:  :  RuntimeFilter:  (id  =  0,  type  =  bloomfilter,  need_local_merge:  false,  is_broadcast:  true,  build_bf_cardinality:  false,  
              。。。
              -  RuntimeFilterInfo:  
                  -  filter  id  =  0  filtered:  714.761K  (714761)
                  -  filter  id  =  0  input:  747.862K  (747862)
              。。。
              -  WaitForRuntimeFilter:  6.317ms
            RuntimeFilter:  (id  =  0,  type  =  bloomfilter):
                  -  Info:  [IsPushDown  =  true,  RuntimeFilterState  =  READY,  HasRemoteTarget  =  false,  HasLocalTarget  =  true,  Ignored  =  false]
                  -  RealRuntimeFilterType:  bloomfilter
                  -  BloomFilterSize:  1024
  ```
注意:

1. 5-6行目は入力行数とフィルタリングされた行数を示します。フィルタリングされた行数が多いほど、JRFの効果が高いことを示します。

2. 10行目の`IsPushDown = true`は、JRF計算がストレージ層にプッシュダウンされていることを示し、遅延マテリアライゼーションによってIOの削減に役立ちます。

3. 10行目の`RuntimeFilterState = READY`は、ScanノードがJRFを適用したかどうかを示します。JRFはtry-bestメカニズムを使用しているため、JRFの生成に時間がかかりすぎる場合、Scanノードは待機期間後にデータのスキャンを開始し、フィルタリングされていないデータを出力する可能性があります。

4. 12行目の`BloomFilterSize: 1024`は、Bloom Filterのサイズをバイト単位で示します。

### チューニング

Join Runtime Filterのチューニングについて、ほとんどの場合、この機能は適応的であり、ユーザーが手動でチューニングする必要はありません。ただし、パフォーマンスを最適化するために行えるいくつかの調整があります。

**1. JRFの有効化または無効化**

セッション変数`runtime_filter_mode`は、JRFを生成するかどうかを制御します。

- JRFを有効にする: `set runtime_filter_mode = GLOBAL`

- JRFを無効にする: `set runtime_filter_mode = OFF`

**2. JRFタイプの設定**

セッション変数`runtime_filter_type`は、JRFのタイプを制御し、以下が含まれます:

- `IN(1)`

- `BLOOM(2)`

- `MIN_MAX(4)`

- `IN_OR_BLOOM(8)`

`IN_OR_BLOOM` Filterは、実際のデータ行数に基づいて、BEが`IN` Filterまたは`BLOOM` Filterの生成を適応的に選択することを可能にします。

単一のJoin条件に対して複数のJRFタイプを生成するには、対応する列挙値の合計に`runtime_filter_type`を設定します。

例:

- 各Join条件に対して`BLOOM` Filterと`MIN_MAX` Filterの両方を生成する: `set runtime_filter_type = 6`

- バージョン2.1では、`runtime_filter_type`のデフォルト値は12で、`MIN_MAX` Filterと`IN_OR_BLOOM` Filterの両方を生成します。

括弧内の整数は、Runtime Filter Typesの列挙値を表します。

**3. 待機時間の設定**

前述のように、JRFはTry-bestメカニズムを使用し、Scanノードは開始前にJRFを待機します。Dorisは実行時条件に基づいて待機時間を計算します。ただし、場合によっては、計算された待機時間が十分でないことがあり、JRFが完全に効果的でなく、Scanノードが予想よりも多くの行を出力する可能性があります。Profileセクションで説明したように、ScanノードのProfileで`RuntimeFilterState = false`の場合、ユーザーは手動でより長い待機時間を設定できます。

セッション変数`runtime_filter_wait_time_ms`は、ScanノードがJRFを待機する時間を制御します。デフォルト値は1000ミリ秒です。

**4. JRFのプルーニング**

場合によっては、JRFがフィルタリングの利点を提供しないことがあります。例えば、`orders`と`customer`テーブルが主キー外部キー関係を持っているが、`customer`テーブルにフィルタリング条件がない場合、JRFへの入力はすべての`custkeys`となり、`orders`テーブルのすべての行がJRFを通過できることになります。オプティマイザーは列統計に基づいて無効なJRFをプルーニングします。

セッション変数`enable_runtime_filter_prune = true/false`は、プルーニングを実行するかどうかを制御します。デフォルト値は`true`です。

## TopN Runtime Filter

### 原理

Dorisでは、データはブロックストリーミング方式で処理されます。そのため、SQL文に`topN`オペレータが含まれている場合、Dorisはすべての結果を計算するのではなく、代わりに動的フィルターを生成して早期にデータを事前フィルタリングします。

以下のSQL文を例として考えます:

```sql
select o_orderkey from orders order by o_orderdate limit 5;
```
このSQL文の実行計画を以下に示します：

```sql
mysql> explain select o_orderkey from orders order by o_orderdate limit 5;
+-----------------------------------------------------+
| Explain String(Nereids Planner)                     |
+-----------------------------------------------------+
| PLAN FRAGMENT 0                                     |
|   OUTPUT EXPRS:                                     |
|     o_orderkey[#11]                                 |
|   PARTITION: UNPARTITIONED                          |
|                                                     |
|   HAS_COLO_PLAN_NODE: false                         |
|                                                     |
|   VRESULT SINK                                      |
|      MYSQL_PROTOCAL                                 |
|                                                     |
|   2:VMERGING-EXCHANGE                               |
|      offset: 0                                      |
|      limit: 5                                       |
|      final projections: o_orderkey[#9]              |
|      final project output tuple id: 2               |
|      distribute expr lists:                         |
|                                                     |
| PLAN FRAGMENT 1                                     |
|                                                     |
|   PARTITION: HASH_PARTITIONED: O_ORDERKEY[#0]       |
|                                                     |
|   HAS_COLO_PLAN_NODE: false                         |
|                                                     |
|   STREAM DATA SINK                                  |
|     EXCHANGE ID: 02                                 |
|     UNPARTITIONED                                   |
|                                                     |
|   1:VTOP-N(119)                                     |
|   |  order by: o_orderdate[#10] ASC                 |
|   |  TOPN OPT                                       |
|   |  offset: 0                                      |
|   |  limit: 5                                       |
|   |  distribute expr lists: O_ORDERKEY[#0]          |
|   |                                                 |
|   0:VOlapScanNode(113)                              |
|      TABLE: tpch.orders(orders), PREAGGREGATION: ON |
|      TOPN OPT:1                                     |
|      partitions=1/1 (orders)                        |
|      tablets=3/3, tabletList=135112,135114,135116   |
|      cardinality=150000, avgRowSize=0.0, numNodes=1 |
|      pushAggOp=NONE                                 |
+-----------------------------------------------------+
41 rows in set (0.06 sec)
```
`topn filter`がない場合、scanノードは`orders`テーブルから各データブロックを順次読み取り、TopNノードに渡します。TopNノードはヒープソートを通じて`orders`テーブルから現在の上位5行を維持します。

データブロックは通常約1024行を含むため、TopNノードは最初のデータブロックを処理した後、そのブロック内で5位にランクされた行を特定できます。

この`o_orderdate`が`1995-01-01`であると仮定すると、scanノードは2番目のデータブロックを出力する際に`1995-01-01`をフィルター条件として使用でき、`o_orderdate`が`1995-01-01`より大きい行をTopNノードに送信してさらに処理する必要がなくなります。

この閾値は動的に更新されます。例えば、TopNノードが2番目のフィルターされたデータブロックを処理する際により小さい`o_orderdate`を発見した場合、最初の2つのデータブロック間で5位にランクされた`o_orderdate`に閾値を更新します。

### TopN Runtime Filterの表示

Explainコマンドを使用して、オプティマイザーによって計画されたTopN Runtime Filterを調査できます。

```sql
1:VTOP-N(119)
| order by: o_orderdate[#10] ASC  
| TOPN OPT  
| offset: 0
| limit: 5  
| distribute expr lists: O_ORDERKEY[#0]  
|
 
0:VLapScanNode[113]  
    TABLE: regression_test_nereids_tpch_p0.(orders), PREAGGREGATION: ON  
    TOPN OPT: 1  
    partitions=1/1 (orders)  
    tablets=3/3, tabletList=135112,135114,135116  
    cardinality=150000, avgRowSize=0.0, numNodes=1  
    pushAggOp: NONE
```
上記の例で示すように：

1. TopNノードは`TOPN OPT`を表示し、このTopNノードがTopN Runtime Filterを生成することを示しています。

2. Scanノードは、どのTopNノードが使用するTopN Runtime Filterを生成するかを示しています。例えば、この例では、11行目は`orders`テーブルのScanノードがTopNノード1によって生成されたRuntime Filterを使用することを示しており、プランでは`TOPN OPT: 1`として表示されています。

分散データベースとして、DorisはTopNノードとScanノードが実際に動作する物理マシンを考慮します。BE間通信のコストが高いため、BEはTopN Runtime Filterを使用するかどうか、またどの程度使用するかを適応的に決定します。現在、TopNとScanが同じBE上に存在するBEレベルのTopN Runtime Filterを実装しています。これは、TopN Runtime Filterのしきい値の更新にスレッド間通信のみが必要で、比較的低コストであるためです。

### チューニング

セッション変数`topn_filter_ratio`は、TopN Runtime Filterを生成するかどうかを制御します。

SQLの`limit`句で指定される行数が少ないほど、TopN Runtime Filterのフィルタリング効果が強くなります。そのため、デフォルトでは、Dorisは`limit`数がテーブル内のデータの半分未満の場合にのみ、対応するTopN Runtime Filterの生成を有効にします。

例えば、`set topn_filter_ratio=0`を設定すると、次のクエリに対してTopN Runtime Filterの生成が無効になります：

```sql
select o_orderkey from orders order by o_orderdate limit 20;
```
