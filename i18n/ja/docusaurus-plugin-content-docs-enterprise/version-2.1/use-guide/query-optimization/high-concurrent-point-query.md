---
{
  "title": "高並行ポイントクエリ最適化",
  "description": "Dorisは列指向ストレージフォーマットエンジン上に構築されています。高並行性サービスシナリオにおいて、",
  "language": "ja"
}
---
:::tip Tips
この機能は Apache Doris 2.0 バージョンからサポートされています
:::

## 説明

Dorisはカラムナストレージフォーマットエンジン上に構築されています。高並行サービスシナリオでは、ユーザーは常にシステムから行全体のデータを取得したいと考えます。しかし、Tableが幅広い場合、カラムナフォーマットはランダム読み取りIOを大幅に増幅させます。Dorisのクエリエンジンとプランナーは、ポイントクエリなどの一部のシンプルなクエリには重すぎます。このようなクエリを処理するために、FEのクエリプランでショートパスを計画する必要があります。FEはSQLクエリのアクセス層サービスで、Javaで書かれています。SQLの解析と分析も、高並行クエリでは高いCPUオーバーヘッドを引き起こします。これらの問題を解決するため、Dorisに行ストレージ、ショートクエリパス、およびPreparedStatementを導入しました。以下は、これらの最適化を有効にするためのガイドです。

## Row Store Format

olap tableでポイントルックアップのIOコストを削減するために行フォーマットをサポートしていますが、このフォーマットを有効にするには、行フォーマットストアのためにより多くのディスク容量を費やす必要があります。現在、簡単にするために`row column`と呼ばれる追加カラムに行を格納しています。Row Storageモードは、Table作成時にのみオンにすることができます。Table作成文のプロパティで以下のプロパティを指定する必要があります：

```
"store_row_column" = "true"
```
## Unique モデルでのポイントクエリの高速化

上記の行ストレージは、Unique モデル下での Merge-On-Write 戦略を有効にし、列挙中の IO オーバーヘッドを削減するために使用されます。Unique Tableの作成時に `enable_unique_key_merge_on_write` と `store_row_column` が有効になっている場合、プライマリキーのクエリはショートパスを使用して SQL 実行を最適化し、クエリの完了に必要な RPC は 1 つだけになります。以下は、クエリと行の存在確認を組み合わせることで、Unique モデル下で Merge-On-Write 戦略を有効にする例です：

```sql
CREATE TABLE `tbl_point_query` (
    `k1` int(11) NULL,
    `v1` decimal(27, 9) NULL,
    `v2` varchar(30) NULL,
    `v3` varchar(30) NULL,
    `v4` date NULL,
    `v5` datetime NULL,
    `v6` float NULL,
    `v7` datev2 NULL
) ENGINE=OLAP
UNIQUE KEY(`k1`)
COMMENT 'OLAP'
DISTRIBUTED BY HASH(`k1)` BUCKETS 1
PROPERTIES (
    "replication_allocation" = "tag.location.default: 1",
    "enable_unique_key_merge_on_write" = "true",
    "light_schema_change" = "true",
    "store_row_column" = "true"
);
```
**注意:**
1. `enable_unique_key_merge_on_write` を有効にする必要があります。ストレージエンジンでの高速ポイント検索にプライマリキーが必要なためです。

2. 条件が `select * from tbl_point_query where key = 123` のようにプライマリキーのみを含む場合、このようなクエリは短縮された高速パスを通ります。

3. ポイントクエリを実行する際に各カラムの `column unique id` に依存するため、`light_schema_change` も有効にする必要があります。

4. 単一Tableのキーカラムに対する等価クエリのみをサポートし、結合やネストされたサブクエリはサポートしません。WHERE条件はキーカラムのみで構成され、等価比較である必要があります。これは一種のキーバリュークエリと考えることができます。

5. rowstoreを有効にすると容量が拡張され、より多くのディスク容量を占有する可能性があります。特定のカラムのみをクエリする必要があるシナリオでは、Doris 3.0以降、rowstoreストレージ用に特定のカラムを指定するために `"row_store_columns"="k1,v1,v2"` の使用が推奨されます。クエリはその後、これらのカラムに選択的にアクセスできます。例えば:

   ```sql
   SELECT k1, v1, v2 FROM tbl_point_query WHERE k1 = 1
   ```
## `PreparedStatement`の使用

クエリSQLおよびSQL式の解析にかかるCPUコストを削減するため、mysqlプロトコルと完全に互換性のある`PreparedStatement`機能をFEで提供しています（現在は上記のようなポイントクエリのみをサポート）。これを有効にすると、PreparedStatementのSQLと式を事前計算し、セッションレベルのメモリバッファにキャッシュして、後で再利用されます。このようなクエリでCPUがボトルネックになった場合、`PreparedStatement`を使用することで4倍以上のパフォーマンス向上が可能です。以下は`PreparedStatement`を使用したJDBCの例です。

1. JDBC URLを設定し、サーバーサイドprepared statementを有効化

   ```
   url = jdbc:mysql://127.0.0.1:9030/ycsb?useServerPrepStmts=true
   ```
2. `PreparedStatement`の使用

   ```java
   // use `?` for placement holders, readStatement should be reused
   PreparedStatement readStatement = conn.prepareStatement("select * from tbl_point_query where k1 = ?");
   ...
   readStatement.setInt(1,1234);
   ResultSet resultSet = readStatement.executeQuery();
   ...
   readStatement.setInt(1,1235);
   resultSet = readStatement.executeQuery();
   ...
   ```
## row cacheの有効化
Dorisには、各ページの特定の列のデータを格納するページレベルのキャッシュがあります。そのため、ページキャッシュは列ベースのキャッシュです。前述の行ストレージでは、1つの行に複数の列のデータが含まれ、大きなクエリによってキャッシュが追い出される可能性があり、これによりヒット率が低下する場合があります。行キャッシュのヒット率を向上させるために、別個の行キャッシュが導入されており、DorisのLRUキャッシュメカニズムを再利用してメモリ使用量を保証します。以下のBE設定を指定することで有効化できます：

- `disable_storage_row_cache` : 行キャッシュを有効にするかどうか。デフォルトでは有効になっていません。

- `row_cache_mem_limit` : 行キャッシュが占有するメモリの割合を指定します。デフォルトはメモリの20%です。

## パフォーマンス最適化

1. 一般的に、Observerの数を増やすことでクエリ処理能力を向上させることが効果的です。

2. クエリ負荷分散：列挙中に、列挙リクエストを受け付けるFE CPUの使用率が高すぎる場合、またはリクエストレスポンスが遅くなる場合は、jdbc load balanceを使用して負荷分散を行い、リクエストを複数のノードに分散して圧力を分担できます（他にも、Nginx、proxySQLなどのクエリ負荷分散設定方法を使用できます）

3. クエリリクエストをObserver役割に向けることで、高同時実行クエリのリクエスト圧力を分担し、fe masterに送信されるクエリリクエスト数を減らすことで、通常、Fe Masterノードのクエリの時間変動の問題を解決し、より良いパフォーマンスと安定性を得ることができます

## FAQ

#### **1. 設定が正しく、concurrent enumerationを使用したショートパス最適化が使用されていることを確認する方法は？**
   
A: explain sqlで、実行プランにSHORT-CIRCUITが表示された場合、ショートパス最適化が使用されていることが証明されます

```sql
mysql> explain select * from tbl_point_query where k1 = -2147481418 ;                                                                                                                                
   +-----------------------------------------------------------------------------------------------+                                                                                                       
   | Explain String(Old Planner)                                                                   |                                                                                                       
   +-----------------------------------------------------------------------------------------------+                                                                                                       
   | PLAN FRAGMENT 0                                                                               |                                                                                                       
   |   OUTPUT EXPRS:                                                                               |                                                                                                       
   |     `test`.`tbl_point_query`.`k1`                                                            |                                                                                                       
   |     `test`.`tbl_point_query`.`v1`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v2`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v3`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v4`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v5`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v6`                                                             |                                                                                                       
   |     `test`.`tbl_point_query`.`v7`                                                             |                                                                                                       
   |   PARTITION: UNPARTITIONED                                                                    |                                                                                                       
   |                                                                                               |                                                                                                       
   |   HAS_COLO_PLAN_NODE: false                                                                   |                                                                                                       
   |                                                                                               |                                                                                                       
   |   VRESULT SINK                                                                                |                                                                                                       
   |      MYSQL_PROTOCAL                                                                           |                                                                                                       
   |                                                                                               |                                                                                                       
   |   0:VOlapScanNode                                                                             |                                                                                                       
   |      TABLE: test.tbl_point_query(tbl_point_query), PREAGGREGATION: ON                         |                                                                                                       
   |      PREDICATES: `k1` = -2147481418 AND `test`.`tbl_point_query`.`__DORIS_DELETE_SIGN__` = 0 |                                                                                                       
   |      partitions=1/1 (tbl_point_query), tablets=1/1, tabletList=360065                         |                                                                                                       
   |      cardinality=9452868, avgRowSize=833.31323, numNodes=1                                    |                                                                                                       
   |      pushAggOp=NONE                                                                           |                                                                                                       
   |      SHORT-CIRCUIT                                                                            |                                                                                                       
   +-----------------------------------------------------------------------------------------------+
```
#### **2. How to confirm that prepared statement is effective ?**

A: Dorisにリクエストを送信した後、fe.audit.logで対応するクエリリクエストを見つけ、Stmt=EXECUTE()があることを確認してください。これはprepared statementが有効であることを示しています。

```text
2024-01-02 11:15:51,248 [query] |Client=192.168.1.82:53450|User=root|Db=test|State=EOF|ErrorCode=0|ErrorMessage=|Time(ms)=49|ScanBytes=0|ScanRows=0|ReturnRows=1|StmtId=51|QueryId=b63d30b908f04dad-ab4a
   3ba21d2c776b|IsQuery=true|isNereids=false|feIp=10.16.10.6|Stmt=EXECUTE(-2147481418)|CpuTimeMS=0|SqlHash=eee20fa2ac13a4f93bd4503a87921024|peakMemoryBytes=0|SqlDigest=|TraceId=|WorkloadGroup=|FuzzyVaria
   bles=
```
#### **3. 非主キークエリで高並行ポイントルックアップの特別な最適化を使用できますか？**

A: いいえ、高並行クエリはキー列の等価クエリのみを対象とし、クエリにjoinやネストされたサブクエリを含むことはできません。

#### **4. useServerPrepStmtsは通常のクエリで有用ですか？**

A: Prepared Statementは現在、主キーがチェックされる場合にのみ有効です。

#### **5. オプティマイザの選択にはグローバル設定が必要ですか？**

A: クエリにprepared statementを使用する場合、Dorisは最高のパフォーマンスを持つクエリ方法を選択するため、手動でオプティマイザを設定する必要はありません。

#### **6. FEがボトルネックになった場合、どうすればよいですか？**

A: FEがCPUを消費しすぎている場合（つまり、%CPU使用率が高い場合）、JDBC URLで以下の設定を有効にしてください：

```
jdbc:mysql:loadbalance://[host1][:port],[host2][:port][,[host3][:port]]/${tbl_name}?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=500&prepStmtCacheSqlLimit=1024
```
- loadbalanceを有効にして、複数のFEがリクエストを処理できるようにし、FEインスタンスが多いほど良い（インスタンスごとに1つをデプロイする）。
- useServerPrepStmtsを有効にして、FEでの解析と計画のオーバーヘッドを削減する。
- cachePrepStmtsを有効にして、クライアントがプリペアドステートメントをキャッシュし、FEに頻繁にprepareリクエストを送信する必要性を削減する。
- prepStmtCacheSizeを調整して、キャッシュされるクエリテンプレートの最大数を設定する。
- prepStmtCacheSqlLimitを調整して、単一のキャッシュされるSQLテンプレートの最大長を設定する。

#### **7. コンピュート・ストレージ分離アーキテクチャにおいてクエリパフォーマンスを最適化するには？**

A:

- `set global enable_snapshot_point_query = false`。ポイントクエリはバージョンを取得するためにメタサービスへの追加RPCが必要で、高QPSの下で簡単にボトルネックになる可能性があります。falseに設定するとクエリを高速化できますが、データの可視性が低下します（パフォーマンスと一貫性のトレードオフが必要）。

- BEパラメータenable_file_cache_keep_base_compaction_output=1を設定して、ベースコンパクション後の結果データがキャッシュに保存されるようにし、リモートアクセスによるクエリジッターを回避する。
