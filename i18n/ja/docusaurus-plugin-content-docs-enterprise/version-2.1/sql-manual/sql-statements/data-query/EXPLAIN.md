---
{
  "title": "EXPLAIN",
  "description": "EXPLAIN文は、指定されたクエリに対するDorisのクエリ実行計画を表示します。",
  "language": "ja"
}
---
## 説明

EXPLAIN文は、指定されたクエリに対するDorisのクエリ実行計画を表示します。Dorisのクエリオプティマイザーは、統計データ、データ特性、HASH JOIN、パーティショニング、バケッティングなどの機能を使用して効率的な計画を作成することを目的としています。ただし、理論的および実用的な制約により、計画が期待通りのパフォーマンスを発揮しない場合があります。

パフォーマンスを向上させるには、現在の計画を分析することが不可欠です。この記事では、最適化のためのEXPLAIN文の使用方法について説明します。



## 構文

```plain text
{EXPLAIN | DESC} [VERBOSE] <query_block>
```
## 必須パラメータ

**<query_block>**

> 実行計画を取得したいクエリ文です。

## オプションパラメータ

**[VERBOSE]**

> 詳細情報を表示するかどうかは`VERBOSE`指定により決定されます。`VERBOSE`を指定すると、各オペレータの詳細、使用するtuple ID、各tupleの詳細説明を含む包括的な詳細が表示されます。指定しない場合は、簡潔な情報が提供されます。


## 戻り値

### 基本概念

`EXPLAIN`で表示される情報をより理解するために、Doris実行計画のいくつかの中核概念を紹介します。

| 名前      | 説明                                                  |
| :-------- | :----------------------------------------------------------- |
| PLAN      | 実行計画。クエリは実行プランナーによって実行計画に変換され、その後実行エンジンによって実行されます。 |
| FRAGMENT  | 実行フラグメント。Dorisは分散実行エンジンであるため、完全な実行計画は複数の単一ノード実行フラグメントに分割されます。FRAGMENTTableは完全な単一ノード実行フラグメントを表します。複数のFRAGMENTが組み合わさって完全なPLANを形成します。 |
| PLAN NODE | オペレータ。実行計画の最小単位。FRAGMENTは複数のオペレータで構成されます。各オペレータは集計、結合などの特定の実行ロジックを担当します。 |

### 戻り値の構造

DorisのEXPLAIN`文の結果は完全なPLANです。PLAN内では、FRAGMENTは実行順序に基づいて後ろから前へ順序付けされます。各FRAGMENT内では、オペレータ（PLAN NODE）も実行順序に基づいて後ろから前へ順序付けされます。

以下に例を示します：

```sql
+--------------------------------------------------+
| Explain String(Nereids Planner)                  |
+--------------------------------------------------+
| PLAN FRAGMENT 0                                  |
|   OUTPUT EXPRS:                                  |
|     cnt[#10]                                     |
|     cnt[#11]                                     |
|   PARTITION: UNPARTITIONED                       |
|                                                  |
|   HAS_COLO_PLAN_NODE: false                      |
|                                                  |
|   VRESULT SINK                                   |
|      MYSQL_PROTOCAL                              |
|                                                  |
|   7:VEXCHANGE                                    |
|      offset: 0                                   |
|      distribute expr lists:                      |
|                                                  |
| PLAN FRAGMENT 1                                  |
|                                                  |
|   PARTITION: RANDOM                              |
|                                                  |
|   HAS_COLO_PLAN_NODE: false                      |
|                                                  |
|   STREAM DATA SINK                               |
|     EXCHANGE ID: 07                              |
|     UNPARTITIONED                                |
|                                                  |
|   6:VHASH JOIN(354)                              |
|   |  join op: INNER JOIN(BROADCAST)[]            |
|   |  equal join conjunct: cnt[#7] = cnt[#5]      |
|   |  cardinality=1                               |
|   |  vec output tuple id: 8                      |
|   |  vIntermediate tuple ids: 7                  |
|   |  hash output slot ids: 5 7                   |
|   |  distribute expr lists:                      |
|   |  distribute expr lists:                      |
|   |                                              |
|   |----4:VEXCHANGE                               |
|   |       offset: 0                              |
|   |       distribute expr lists:                 |
|   |                                              |
|   5:VEXCHANGE                                    |
|      offset: 0                                   |
|      distribute expr lists:                      |
|                                                  |
| PLAN FRAGMENT 2                                  |
|   ...                                            |
|                                                  |
| PLAN FRAGMENT 3                                  |
|   ...                                            |
+--------------------------------------------------+
```
オペレータは破線でその子ノードとリンクされています。オペレータが複数の子を持つ場合、それらは垂直に配置され、右から左の順序を表現します。上記の例では、オペレータ6（VHASH JOIN）は左の子としてオペレータ5（EXCHANGE）を、右の子としてオペレータ4（EXCHANGE）を持ちます。


### Fragmentフィールド説明


| 名前               | 説明                                                  |
| :----------------- | :----------------------------------------------------------- |
| PARTITION          | 現在のFragmentのデータ分散を表示                       |
| HAS_COLO_PLAN_NODE | fragmentにcolocateオペレータが含まれているかを示す        |
| Sink               | fragmentのデータ出力方式、詳細は以下のTableを参照 |



**Sink方式**


| 名前               | 説明                                                  |
| :----------------- | :----------------------------------------------------------- |
| STREAM DATA SINK   | 次のFragmentにデータを出力します。2行の情報が含まれます。<br />1行目：データの送信先となるダウンストリームのEXCHANGE NODE。<br />2行目：データ分散の方式。<br />  - UNPARTITIONEDは各ダウンストリームインスタンスが完全なデータセットを受信することを意味します。これは通常、broadcast joinや、global limitやorder byなどの単一インスタンスロジックが必要な場合に発生します。<br /> - RANDOMは各ダウンストリームインスタンスが重複のないランダムなデータサブセットを受信することを意味します。<br /> - HASH_PARTITIONEDはリストされたslotをキーとしてハッシュし、データシャードを同じダウンストリームインスタンスに送信します。これはpartition hash joinのアップストリームや2段階集約の第2段階でよく使用されます。 |
| RESULT SINK        | 結果データをFEに送信します。1行目はデータ送信に使用されるプロトコルを示し、現在MySQLとarrowプロトコルをサポートしています。 |
| OLAP TABLE SINK    | OLAPTableにデータを書き込みます。                                |
| MultiCastDataSinks | 複数のSTREAM DATA SINKを含むマルチキャストオペレータです。各STREAM DATA SINKは完全なデータセットをそのダウンストリームに送信します。 |



### Tuple情報説明

VERBOSEモードを使用すると、Tuple情報が出力されます。Tuple情報はデータ行内のSLOTの詳細を説明し、SLOTタイプ、nullable状態などが含まれます。

出力には複数のTupleDescriptorが含まれ、それぞれに複数のSlotDescriptorが含まれます。以下に例を示します：

```sql
Tuples:
TupleDescriptor{id=0, tbl=t1}
  SlotDescriptor{id=0, col=c1, colUniqueId=0, type=int, nullable=true, isAutoIncrement=false, subColPath=null}
  SlotDescriptor{id=2, col=c3, colUniqueId=2, type=int, nullable=true, isAutoIncrement=false, subColPath=null}
```
#### TupleDescriptor

| Name | デスクリプション                                                  |
| :--- | :----------------------------------------------------------- |
| id   | tuple descriptorのid                                         |
| tbl  | タプルに対応するTable、該当しない場合は`null`             |

#### SlotDescriptor

| Name            | デスクリプション                                                  |
| :-------------- | :----------------------------------------------------------- |
| id              | slot descriptorのid                                          |
| col             | スロットに対応するカラム、該当しない場合は空白               |
| colUniqueId     | 対応するカラムの一意のid、該当しない場合は-1                 |
| type            | スロットの型                                                 |
| nullable        | 対応するデータがnullになり得るかを示す                       |
| isAutoIncrement | カラムが自動インクリメントかを示す                           |
| subColPath      | カラム内のサブカラムパス、現在はvariant型のみに適用される     |

### オペレータの説明

#### オペレータ一覧

| Name                  | デスクリプション                                                  |
| :-------------------- | :----------------------------------------------------------- |
| AGGREGATE             | 集約オペレータ                                               |
| ANALYTIC              | ウィンドウ関数オペレータ                                     |
| ASSERT NUMBER OF ROWS | 下流の出力行数をチェックするオペレータ                       |
| EXCHANGE              | データ交換受信オペレータ                                     |
| MERGING-EXCHANGE      | ソートと行制限機能を持つデータ交換受信オペレータ             |
| HASH JOIN             | ハッシュ結合オペレータ                                       |
| NESTED LOOP JOIN      | ネストループ結合オペレータ                                   |
| PartitionTopN         | パーティション内データの事前フィルタリングオペレータ         |
| REPEAT_NODE           | データ複製オペレータ                                         |
| DataGenScanNode       | Table値関数オペレータ                                     |
| EsScanNode            | ESTableスキャンオペレータ                                 |
| HIVE_SCAN_NODE        | HiveTableスキャンオペレータ                               |
| HUDI_SCAN_NODE        | HudiTableスキャンオペレータ                               |
| ICEBERG_SCAN_NODE     | IcebergTableスキャンオペレータ                            |
| PAIMON_SCAN_NODE      | PaimonTableスキャンオペレータ                             |
| JdbcScanNode          | JdbcTableスキャンオペレータ                               |
| OlapScanNode          | OlapTableスキャンオペレータ                               |
| SELECT                | フィルタリングオペレータ                                     |
| UNION                 | 集合和演算オペレータ                                         |
| EXCEPT                | 集合差演算オペレータ                                         |
| INTERSECT             | 集合積演算オペレータ                                         |
| SORT                  | ソートオペレータ                                             |
| TOP-N                 | ソートして上位N件を返すオペレータ                            |
| TABLE FUNCTION NODE   | Table関数オペレータ（lateral view）                       |

#### 共通フィールド

| Name                    | デスクリプション                                                  |
| :---------------------- | :----------------------------------------------------------- |
| limit                   | 出力行数を制限する                                           |
| offset                  | 出力前にスキップする行数                                     |
| conjuncts               | 現在のノードの結果をフィルタリングする。射影の前に実行される。 |
| projections             | 現在のオペレータ後の射影操作。conjunctsの後に実行される。     |
| project output tuple id | 射影後の出力タプル。データタプル内のスロット配置はtuple descで確認できる。 |
| cardinality             | オプティマイザによる推定行数                                 |
| distribute expr lists   | 現在のノードの子ノードの元のデータ分散方法                   |
| Expression's slot id    | slot idに対応する具体的なスロットはverboseモードのタプルリストで確認できる。このリストはスロット型やnullable属性などの情報を提供する。式の後に`[#5]`として表現される。 |

#### AGGREGATE

| Name                | デスクリプション                                                  |
| :------------------ | :----------------------------------------------------------- |
| (Aggregation Phase) | 集約フェーズは2つの用語で表される。<br />最初の用語はupdate（ローカル集約）またはmerge（グローバル集約）のいずれか。<br />2番目の用語は現在のデータがシリアライズされているか（serialize）、最終計算が完了しているか（finalize）を示す。 |
| STREAMING           | 多段階集約切り捨てにおけるローカル集約オペレータのみがこのフラグを持つ。現在の集約ノードがSTREAMINGモードを使用する可能性があることを示し、入力データが実際の計算なしに次の集約段階に直接渡される。 |
| output              | 現在の集約オペレータの出力。すべてのローカル事前集約関数にはpartialが接頭辞として付く。 |
| group by            | 集約のキー                                                   |

#### ANALYTIC

| Name         | デスクリプション                                                  |
| :----------- | :----------------------------------------------------------- |
| functions    | 現在のウィンドウ関数の名前                                   |
| partition by | ウィンドウ関数のover句のpartition by句に対応。ウィンドウ化式。 |
| order by     | ウィンドウ内のソート式と順序                                 |
| window       | ウィンドウ範囲                                               |

#### ASSERT NUMBER OF ROWS

| Name | デスクリプション                                  |
| :--- | :------------------------------------------- |
| EQ   | 下流出力はこの行数制約と一致しなければならない |

#### HASH JOIN

| Name                  | デスクリプション                                                  |
| :-------------------- | :----------------------------------------------------------- |
| join op               | 結合の種類                                                   |
| equal join conjunct   | 結合条件の等価条件                                           |
| other join predicates | 結合条件の等価条件を除く条件                                 |
| mark join predicates  | mark joinで使用される条件                                    |
| other predicates      | 結合実行後のフィルタリング述語                               |
| runtime filters       | 生成されたランタイムフィルタ                                 |
| output slot ids       | 最終出力スロットのリスト                                     |
| hash output slot ids  | ハッシュ結合実行後、ただし他の結合条件適用前の出力スロットのリスト |
| isMarkJoin            | mark joinかどうかを示す                                      |

#### NESTED LOOP JOIN

| Name                 | デスクリプション                |
| :------------------- | :------------------------- |
| join op              | 結合操作の種類             |
| join conjuncts       | 結合の条件                 |
| mark join predicates | mark joinで使用される条件  |
| predicates           | 結合後のフィルタ述語       |
| runtime filters      | 生成されたランタイムフィルタ |
| output slot ids      | 最終出力スロットのリスト   |
| isMarkJoin           | mark joinかどうか          |

#### PartitionTopN

| Name                 | デスクリプション                                                  |
| :------------------- | :----------------------------------------------------------- |
| functions            | グループフィルタ最適化を適用するウィンドウ関数               |
| has global limit     | 行数のグローバル制限の有無                                   |
| partition limit      | 各パーティション内の行数制限                                 |
| partition topn phase | 現在のフェーズ：パーティションキーによるシャッフル後のグローバルフェーズの場合はTWO_PHASE_GLOBAL_PTOPN、パーティションキーによるシャッフル前のローカルフェーズの場合はTWO_PHASE_LOCAL_PTOPN |

#### REPEAT_NODE

| Name   | デスクリプション                                                  |
| :----- | :----------------------------------------------------------- |
| repeat | 各行の反復回数と集約カラム対応のslot id                      |
| exprs  | 反復後の出力データの式のリスト                               |

#### DataGenScanNode

| Name                 | デスクリプション      |
| :------------------- | :--------------- |
| table value function | Table関数名   |

#### EsScanNode

| Name              | デスクリプション                  |
| :---------------- | :--------------------------- |
| SORT COLUMN       | 結果ソート用カラム           |
| LOCAL_PREDICATES  | Doris内で実行されるフィルタ  |
| REMOTE_PREDICATES | ES内で実行されるフィルタ     |
| ES index/type     | クエリ用のESインデックスと型 |

#### HIVE_SCAN_NODE

| Name          | デスクリプション                            |
| :------------ | :------------------------------------- |
| inputSplitNum | スキャン分割数                         |
| totalFileSize | スキャンされる総ファイルサイズ         |
| scanRanges    | スキャン分割の情報                     |
| partition     | スキャンされるパーティション数         |
| backends      | 各BEがスキャンする具体的なデータ情報   |
| cardinality   | オプティマイザによる推定行数           |
| avgRowSize    | オプティマイザによる推定平均行サイズ   |
| numNodes      | 現在のオペレータが使用するBE数         |
| pushdown agg  | スキャンにプッシュダウンされた集約     |

#### HUDI_SCAN_NODE

| Name                 | デスクリプション                            |
| :------------------- | :------------------------------------- |
| inputSplitNum        | スキャン分割数                         |
| totalFileSize        | スキャンされる総ファイルサイズ         |
| scanRanges           | スキャン分割の情報                     |
| partition            | スキャンされるパーティション数         |
| backends             | 各BEがスキャンする具体的なデータ情報   |
| cardinality          | オプティマイザによる推定行数           |
| avgRowSize           | オプティマイザによる推定平均行サイズ   |
| numNodes             | 現在のオペレータが使用するBE数         |
| pushdown agg         | スキャンにプッシュダウンされた集約     |
| hudiNativeReadSplits | ネイティブ方式で読み取られた分割数     |

#### ICEBERG_SCAN_NODE

| Name                     | デスクリプション                            |
| :----------------------- | :------------------------------------- |
| inputSplitNum            | スキャン分割数                         |
| totalFileSize            | スキャンされる総ファイルサイズ         |
| scanRanges               | スキャン分割の情報                     |
| partition                | スキャンされるパーティション数         |
| backends                 | 各BEがスキャンする具体的なデータ情報   |
| cardinality              | オプティマイザによる推定行数           |
| avgRowSize               | オプティマイザによる推定平均行サイズ   |
| numNodes                 | 現在のオペレータが使用するBE数         |
| pushdown agg             | スキャンにプッシュダウンされた集約     |
| icebergPredicatePushdown | iceberg APIにプッシュダウンされたフィルタ |

#### PAIMON_SCAN_NODE

| Name                   | デスクリプション                            |
| :--------------------- | :------------------------------------- |
| inputSplitNum          | スキャン分割数                         |
| totalFileSize          | スキャンされる総ファイルサイズ         |
| scanRanges             | スキャン分割の情報                     |
| partition              | スキャンされるパーティション数         |
| backends               | 各BEがスキャンする具体的なデータ情報   |
| cardinality            | オプティマイザによる推定行数           |
| avgRowSize             | オプティマイザによる推定平均行サイズ   |
| numNodes               | 現在のオペレータが使用するBE数         |
| pushdown agg           | スキャンにプッシュダウンされた集約     |
| paimonNativeReadSplits | ネイティブ方式で読み取られた分割数     |

#### JdbcScanNode

| Name  | デスクリプション                |
| :---- | :------------------------- |
| TABLE | スキャンするJDBC側Table名 |
| QUERY | スキャンに使用されるクエリ |

#### OlapScanNode

| Name           | デスクリプション                                                  |
| :------------- | :----------------------------------------------------------- |
| TABLE          | スキャンされるTable。括弧内は一致した同期マテリアライズドビューの名前を示す。 |
| SORT INFO      | SCANの事前ソートが計画されている場合に存在。SCAN出力の部分的事前ソートと事前切り捨てを示す。 |
| SORT LIMIT     | SCANの事前ソートが計画されている場合に存在。事前切り捨ての切り捨て長を示す。 |
| TOPN OPT       | TOP-N Runtime Filterが計画されている場合に存在。            |
| PREAGGREGATION | 事前集約が有効かを示す。MOR集約と主キーモデルに関連。ONはストレージ層のデータが上位層のニーズを満たし追加集約が不要であることを意味する。OFFは追加集約が実行されることを意味する。 |
| partitions     | 現在スキャンされるパーティション数、総パーティション数、スキャンされるパーティション名のリスト。 |
| tablets        | スキャンされるタブレット数とTable内の総タブレット数。     |
| tabletList     | スキャンされるタブレットのリスト。                           |
| avgRowSize     | オプティマイザによる推定行サイズ。                           |
| numNodes       | 現在のスキャンに割り当てられたBE数。                         |
| pushAggOp      | zonemapメタデータを読み取ることで結果が返される。MIN、MAX、COUNT集約情報をサポート。 |

#### UNION

| Name           | デスクリプション                                                  |
| :------------- | :----------------------------------------------------------- |
| constant exprs | 出力に含まれる定数式のリスト。                               |
| child exprs    | この式リストを通して投影された子の出力を集合演算子への入力とする。 |

#### EXCEPT

| Name        | デスクリプション                                                  |
| :---------- | :----------------------------------------------------------- |
| child exprs | この式リストを通して投影された子の出力を集合演算子への入力とする。 |

#### INTERSECT

| Name        | デスクリプション                                                  |
| :---------- | :----------------------------------------------------------- |
| child exprs | この式リストを通して投影された子の出力を集合演算子への入力とする。 |

#### SORT

| Name     | デスクリプション                    |
| :------- | :----------------------------- |
| order by | ソートキーと具体的なソート順序。 |

#### TABLE FUNCTION NODE

| Name                  | デスクリプション                              |
| :-------------------- | :--------------------------------------- |
| table function        | 使用されるTable関数の名前。           |
| lateral view tuple id | 新しく生成されたカラムに対応するタプルID。 |
| output slot id        | カラム剪定後に出力されるカラムのスロットIDのリスト。 |

#### TOP-N

| Name          | デスクリプション                                        |
| :------------ | :------------------------------------------------- |
| order by      | ソートキーと具体的なソート順序。                   |
| TOPN OPT      | TOP-Nランタイムフィルタ最適化が適用された場合に存在。 |
| OPT TWO PHASE | TOP-N遅延マテリアライゼーションが適用された場合に存在。 |
