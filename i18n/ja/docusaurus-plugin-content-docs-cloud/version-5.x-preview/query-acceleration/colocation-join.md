---
{
  "title": "コロケーション結合",
  "description": "Colocation Joinは、一部のJoinクエリに対してローカル最適化を提供し、ノード間のデータ転送時間を削減してクエリ実行を高速化します。",
  "language": "ja"
}
---
# Colocation Join

Colocation Joinは、一部のJoinクエリに対してローカル最適化を提供し、ノード間のデータ転送時間を削減してクエリ実行を高速化します。

注意: このプロパティはCCRによって同期されません。このテーブルがCCRによってコピーされている場合、つまりPROPERTIESに`is_being_synced = true`が含まれている場合、このプロパティはこのテーブルから削除されます。

## 用語の説明

* FE: Frontend、Dorisのフロントエンドノード。メタデータ管理とリクエストアクセスを担当する。
* BE: Backend、Dorisのバックエンドノード。クエリ実行とデータストレージを担当する。
* Colocation Group (CG): CGは1つ以上のテーブルを含む。同一グループ内のテーブルは同じColocation Group Schemaと同じデータ断片化分散を持つ。
* Colocation Group Schema (CGS): CG内のテーブルとColocationに関連する一般的なスキーマ情報を記述するために使用される。バケットカラムタイプ、バケット数、コピー数を含む。

## 原理

Colocation Join機能は、同じCGSを持つテーブルのセットのCGを作成することです。これらのテーブルの対応するデータ断片が同じBEノードに配置されることを保証します。CG内のテーブルがバケットカラムでJoin操作を実行する際、ローカルデータJoinを直接実行でき、ノード間のデータ転送時間を削減できます。

テーブルのデータは最終的にバケットカラム値のHashとバケット数をモデル化することによってバケットに分配されます。テーブルのバケット数が8であると仮定すると、8つのバケット`[0, 1, 2, 3, 4, 5, 6, 7]`「バケット」があります。このようなシーケンスを`Buckets Sequence`と呼びます。各Bucketには1つ以上のTabletsがあります。テーブルが単一パーティションテーブルの場合、Bucketには1つのTabletのみがあります。マルチパーティションテーブルの場合、複数存在します。

テーブルが同じデータ分散を持つために、同じCG内のテーブルは以下の属性が同じであることを保証しなければなりません：

1. バケットカラムとバケット数

  バケットカラム、つまりテーブル作成文の`DISTRIBUTED BY HASH (col1, col2,...)`で指定されるカラムです。バケットカラムは、テーブルからのデータを異なるTabletsにHashするためにどのカラム値が使用されるかを決定します。同じCG内のテーブルは、バケットカラムのタイプと数が同一であり、バケット数が同一であることを保証しなければなりません。これにより、複数テーブルのデータ断片化を一対一で制御できます。

2. コピー数

  同じCG内のすべてのテーブルのすべてのパーティションのコピー数は同じでなければなりません。一致しない場合、Tabletのコピーが存在し、同じBE上に他のテーブル断片の対応するコピーが存在しない可能性があります。

同じCG内のテーブルは、パーティションカラムの数、範囲、タイプの一貫性は必要ありません。

バケットカラム数とバケット数を固定した後、同じCG内のテーブルは同じBuckets Sequenceを持ちます。レプリカ数は各バケット内のTabletsのレプリカ数と、それらがどのBEに保存されるかを決定します。Buckets Sequenceが`[0, 1, 2, 3, 4, 5, 6, 7]`で、BEノードが`[A, B, C, D]`の4つであると仮定します。データの可能な分散は以下の通りです：

```
+---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+
| 0 | | 1 | | 2 | | 3 | | 4 | | 5 | | 6 | | 7 |
+---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+
| A | | B | | C | | D | | A | | B | | C | | D |
|   | |   | |   | |   | |   | |   | |   | |   |
| B | | C | | D | | A | | B | | C | | D | | A |
|   | |   | |   | |   | |   | |   | |   | |   |
| C | | D | | A | | B | | C | | D | | A | | B |
+---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+
```
CGの全てのテーブルのデータは上記のルールに従って均一に分散されます。これにより、同じbarrel列の値を持つデータが同じBEノード上に配置され、ローカルデータJoinを実行できることが保証されます。

## 使用方法

### テーブルの作成

テーブルを作成する際、`PROPERTIES`で`"colocate_with"="group_name"`属性を指定できます。これは、そのテーブルがColocation Joinテーブルであり、指定されたColocation Groupに属することを意味します。

例:

```
CREATE TABLE tbl (k1 int, v1 int sum)
DISTRIBUTED BY HASH(k1)
BUCKETS 8
PROPERTIES(
  "colocate_with" = "group1"
);
```
指定されたグループが存在しない場合、Dorisは現在のテーブルのみを含むグループを自動的に作成します。Groupが既に存在する場合、Dorisは現在のテーブルがColocation Group Schemaを満たすかどうかを確認します。満たす場合、テーブルが作成されGroupに追加されます。同時に、テーブルはGroup内の既存のデータ分散ルールに基づいてフラグメントとレプリカを作成します。

Groupはデータベースに属し、その名前はデータベース内で一意です。内部ストレージはGroupの完全名`dbId_groupName`ですが、ユーザーはgroupNameのみを認識します。

バージョン2.0では、DorisはDatabase間のGroupをサポートしています。テーブルを作成する際は、Group名のプレフィックスとしてキーワード`__global__`を使用する必要があります。例：

```
CREATE TABLE tbl (k1 int, v1 int sum)
DISTRIBUTED BY HASH(k1)
BUCKETS 8
PROPERTIES(
     "colocate_with" = "__global__group1"
);
```
`__global__` でプレフィックスされたGroupは、もはやDatabaseに属さず、その名前もグローバルに一意になります。

Global Groupを作成することで、Cross-Database Colocate Joinを実現できます。



### テーブルの削除

Group内の最後のテーブルが完全に削除されたとき（完全な削除とは、ゴミ箱からの削除を意味します）。通常、`DROP TABLE`コマンドでテーブルが削除される際、デフォルトの1日間ゴミ箱に滞在した後に削除され、グループは自動的に削除されます。

### Groupの表示

以下のコマンドで、クラスター内の既存のGroup情報を表示できます。

```
SHOW PROC '/colocation_group';

+-------------+--------------+--------------+------------+----------------+----------+----------+
| GroupId     | GroupName    | TableIds     | BucketsNum | ReplicationNum | DistCols | IsStable |
+-------------+--------------+--------------+------------+----------------+----------+----------+
| 10005.10008 | 10005_group1 | 10007, 10040 | 10         | 3              | int(11)  | true     |
+-------------+--------------+--------------+------------+----------------+----------+----------+
```
* GroupId: グループのクラスター全体の一意の識別子で、前半にDB ID、後半にgroup IDが含まれます。
* GroupName: Groupの完全な名前。
* TabletIds: グループに含まれるTablesのIDのリスト。
* Buckets Num: バケットの数。
* Replication Num: コピーの数。
* DistCols: 分散カラム。
* IsStable: グループが安定しているかどうか（安定性の定義については、`Collocation replica balancing and repair`のセクションを参照してください）。

以下のコマンドでグループのデータ分散をさらに詳しく確認できます：

```
SHOW PROC '/colocation_group/10005.10008';

+-------------+---------------------+
| BucketIndex | BackendIds          |
+-------------+---------------------+
| 0           | 10004, 10002, 10001 |
| 1           | 10003, 10002, 10004 |
| 2           | 10002, 10004, 10001 |
| 3           | 10003, 10002, 10004 |
| 4           | 10002, 10004, 10003 |
| 5           | 10003, 10002, 10001 |
| 6           | 10003, 10004, 10001 |
| 7           | 10003, 10004, 10002 |
+-------------+---------------------+
```
* BucketIndex: バケットシーケンスのサブスクリプト。
* Backend Ids: バケット内のデータフラグメントが配置されているBEノードIDのリスト。

> 上記のコマンドはADMIN権限が必要です。通常のユーザービューは現時点ではサポートされていません。

### Colocate Groupの変更

作成済みのテーブルのColocation Groupプロパティを変更できます。例：

`ALTER TABLE tbl SET ("colocate_with" = "group2");`

* テーブルが以前にGroupを指定していない場合、コマンドはSchemaをチェックし、テーブルをGroupに追加します（Groupが存在しない場合は作成されます）。
* テーブルの前に他のグループが指定されている場合、コマンドはまずテーブルを元のグループから削除し、新しいグループを追加します（グループが存在しない場合は作成されます）。

以下のコマンドでテーブルのColocation属性を削除することもできます：

`ALTER TABLE tbl SET ("colocate_with" = "");`

### その他の関連操作

Colocation属性を持つテーブルにADD PARTITIONが追加され、コピー数が変更された場合、DorisはColocation Group Schemaに違反する変更かどうかをチェックし、違反している場合は拒否します。

## Colocation複製のバランシングと修復

Colocationテーブルのコピー分散はGroupで指定された分散に従う必要があるため、レプリカ修復やバランシングにおいて一般的な断片化とは異なります。

Group自体にはStable属性があり、Stableがtrueの場合、現在のGroup内のテーブルのすべてのフラグメントが変更されていないことを示し、Colocation機能を正常に使用できます。Stableがfalseの場合、Group内の一部のテーブルが修復または移行中であることを示します。この時、関連テーブルのColocation Joinは通常のJoinに退化します。

### レプリカ修復

コピーは指定されたBEノードにのみ格納できます。そのため、BEが利用できない場合（ダウンタイム、Decommissionなど）、それを置き換える新しいBEが必要になります。Dorisはまず負荷が最も低いBEを探して置き換えます。置き換え後、Bucket内の古いBE上のすべてのデータフラグメントが修復されます。移行プロセス中、GroupはUnstableとしてマークされます。

### レプリカバランシング

Dorisは、CollocationテーブルのフラグメントをすべてのBEノード間で均等に分散しようとします。一般的なテーブルのレプリカバランシングでは、粒度は単一レプリカであり、つまり各レプリカに対して単独で負荷の低いBEノードを見つけるだけで十分です。ColocationテーブルのバランシングはBucketレベルで行われ、Bucket内のすべてのレプリカが一緒に移行します。私たちは単純なバランシングアルゴリズムを採用しており、レプリカの実際のサイズに関係なく、レプリカ数のみに基づいて、Buckets SequenceをすべてのBEに均等に分散します。具体的なアルゴリズムについては、`ColocateTableBalancer.java`のコード注釈を参照してください。

> 注記1: 現在のColocationレプリカバランシングおよび修復アルゴリズムは、異機種展開されたDorisクラスターでは適切に動作しない場合があります。いわゆる異機種展開とは、BEノードのディスク容量、数、ディスクタイプ（SSDとHDD）が一致していない展開のことです。異機種展開の場合、小さなBEノードと大きなBEノードが同じ数のレプリカを格納する可能性があります。
>
> 注記2: グループがUnstable状態にある場合、その中のテーブルのJoinは通常のJoinに退化します。この時、クラスターのクエリパフォーマンスが大幅に低下する可能性があります。システムが自動的にバランシングを行うことを望まない場合は、FE設定項目`disable_colocate_balance`を設定して自動バランシングを禁止できます。その後、適切な時期に開いてください。（詳細については`Advanced Operations`セクションを参照してください）

## クエリ

Colocationテーブルは通常のテーブルと同じ方法でクエリされ、ユーザーはColocation属性を認識する必要がありません。Colocationテーブルが配置されているGroupがUnstable状態にある場合、自動的に通常のJoinに退化します。

例を示して説明します：

Table 1:

```
CREATE TABLE `tbl1` (
    `k1` date NOT NULL COMMENT "",
    `k2` int(11) NOT NULL COMMENT "",
    `v1` int(11) SUM NOT NULL COMMENT ""
) ENGINE=OLAP
AGGREGATE KEY(`k1`, `k2`)
PARTITION BY RANGE(`k1`)
(
    PARTITION p1 VALUES LESS THAN ('2019-05-31'),
    PARTITION p2 VALUES LESS THAN ('2019-06-30')
)
DISTRIBUTED BY HASH(`k2`) BUCKETS 8
PROPERTIES (
    "colocate_with" = "group1"
);
```
表 2:

```
CREATE TABLE `tbl2` (
    `k1` datetime NOT NULL COMMENT "",
    `k2` int(11) NOT NULL COMMENT "",
    `v1` double SUM NOT NULL COMMENT ""
) ENGINE=OLAP
AGGREGATE KEY(`k1`, `k2`)
DISTRIBUTED BY HASH(`k2`) BUCKETS 8
PROPERTIES (
    "colocate_with" = "group1"
);
```
クエリプランを表示します：

```
DESC SELECT * FROM tbl1 INNER JOIN tbl2 ON (tbl1.k2 = tbl2.k2);

+----------------------------------------------------+
| Explain String                                     |
+----------------------------------------------------+
| PLAN FRAGMENT 0                                    |
|  OUTPUT EXPRS:`tbl1`.`k1` |                        |
|   PARTITION: RANDOM                                |
|                                                    |
|   RESULT SINK                                      |
|                                                    |
|   2:HASH JOIN                                      |
|   |  join op: INNER JOIN                           |
|   |  hash predicates:                              |
|   |  colocate: true                                |
|   |    `tbl1`.`k2` = `tbl2`.`k2`                   |
|   |  tuple ids: 0 1                                |
|   |                                                |
|   |----1:OlapScanNode                              |
|   |       TABLE: tbl2                              |
|   |       PREAGGREGATION: OFF. Reason: null        |
|   |       partitions=0/1                           |
|   |       rollup: null                             |
|   |       buckets=0/0                              |
|   |       cardinality=-1                           |
|   |       avgRowSize=0.0                           |
|   |       numNodes=0                               |
|   |       tuple ids: 1                             |
|   |                                                |
|   0:OlapScanNode                                   |
|      TABLE: tbl1                                   |
|      PREAGGREGATION: OFF. Reason: No AggregateInfo |
|      partitions=0/2                                |
|      rollup: null                                  |
|      buckets=0/0                                   |
|      cardinality=-1                                |
|      avgRowSize=0.0                                |
|      numNodes=0                                    |
|      tuple ids: 0                                  |
+----------------------------------------------------+
```
Colocation Joinが機能する場合、Hash Join Nodeは`colocate: true`を表示します。

そうでない場合、クエリプランは以下のようになります：

```
+----------------------------------------------------+
| Explain String                                     |
+----------------------------------------------------+
| PLAN FRAGMENT 0                                    |
|  OUTPUT EXPRS:`tbl1`.`k1` |                        |
|   PARTITION: RANDOM                                |
|                                                    |
|   RESULT SINK                                      |
|                                                    |
|   2:HASH JOIN                                      |
|   |  join op: INNER JOIN (BROADCAST)               |
|   |  hash predicates:                              |
|   |  colocate: false, reason: group is not stable  |
|   |    `tbl1`.`k2` = `tbl2`.`k2`                   |
|   |  tuple ids: 0 1                                |
|   |                                                |
|   |----3:EXCHANGE                                  |
|   |       tuple ids: 1                             |
|   |                                                |
|   0:OlapScanNode                                   |
|      TABLE: tbl1                                   |
|      PREAGGREGATION: OFF. Reason: No AggregateInfo |
|      partitions=0/2                                |
|      rollup: null                                  |
|      buckets=0/0                                   |
|      cardinality=-1                                |
|      avgRowSize=0.0                                |
|      numNodes=0                                    |
|      tuple ids: 0                                  |
|                                                    |
| PLAN FRAGMENT 1                                    |
|  OUTPUT EXPRS:                                     |
|   PARTITION: RANDOM                                |
|                                                    |
|   STREAM DATA SINK                                 |
|     EXCHANGE ID: 03                                |
|     UNPARTITIONED                                  |
|                                                    |
|   1:OlapScanNode                                   |
|      TABLE: tbl2                                   |
|      PREAGGREGATION: OFF. Reason: null             |
|      partitions=0/1                                |
|      rollup: null                                  |
|      buckets=0/0                                   |
|      cardinality=-1                                |
|      avgRowSize=0.0                                |
|      numNodes=0                                    |
|      tuple ids: 1                                  |
+----------------------------------------------------+
```
HASH JOINノードは対応する理由を表示します：`colocate: false, reason: group is not stable`。同時に、EXCHANGEノードが生成されます。


## 高度な操作

### FE設定項目

* disable\_colocate\_relocate

Dorisの自動Colocationレプリカ修復を無効にするかどうか。デフォルトはfalseで、つまり無効にしない。このパラメータはColocationテーブルのレプリカ修復にのみ影響し、通常のテーブルには影響しません。

* disable\_colocate\_balance

Dorisの自動Colocationレプリカバランシングを無効にするかどうか。デフォルトはfalseで、つまり無効にしない。このパラメータはCollocationテーブルのレプリカバランスにのみ影響し、一般的なテーブルには影響しません。

ユーザーは実行時にこれらの設定を行うことができます。`HELP ADMIN SHOW CONFIG;`および`HELP ADMIN SET CONFIG;`を参照してください。

* disable\_colocate\_join

Colocation Join機能を無効にするかどうか。0.10および以前のバージョンでは、デフォルトはtrueで、つまり無効。後のバージョンでは、デフォルトがfalseになり、つまり有効になります。

* use\_new\_tablet\_scheduler

0.10および以前のバージョンでは、新しいレプリカスケジューリングロジックはColocation Join機能と互換性がないため、0.10および以前のバージョンで`disable_colocate_join = false`の場合、`use_new_tablet_scheduler = false`に設定する必要があり、つまり新しいレプリカスケジューラを無効にします。後のバージョンでは、`use_new_tablet_scheduler`はtrueになります。

### HTTP RESTful API

DorisはColocation Groupの表示と変更のために、Colocation Joinに関連するいくつかのHTTP RESTful APIを提供しています。

このAPIはFE側で実装され、`fe_host: fe_http_port`を使用してアクセスします。ADMIN権限が必要です。

1. クラスターの全Colocation情報を表示

    ```
    GET /api/colocate
    
    Return the internal Colocation info in JSON format:
    
    {
        "msg": "success",
      "code": 0,
      "data": {
        "infos": [
          ["10003.12002", "10003_group1", "10037, 10043", "1", "1", "int(11)", "true"]
        ],
        "unstableGroupIds": [],
        "allGroupIds": [{
          "dbId": 10003,
          "grpId": 12002
        }]
      },
      "count": 0 
    }
    ```
2. Groupを安定版または不安定版としてマークする

  * 安定版としてマークする

        ```
        DELETE /api/colocate/group_stable?db_id=10005&group_id=10008
        
        Returns: 200
        ```
* Unstableとしてマーク

        ```
        POST /api/colocate/group_stable?db_id=10005&group_id=10008
        
        Returns: 200
        ```
3. グループのデータ分散の設定

  インターフェースはグループのバケットシーケンス分散を強制することができます。

    ```
    POST /api/colocate/bucketseq?db_id=10005&group_id=10008
    
    Body:
    [[10004,10002],[10003,10002],[10002,10004],[10003,10002],[10002,10004],[10003,10002],[10003,10004],[10003,10004],[10003,10004],[10002,10004]]
    
    Returns: 200
    ```
Bodyはネストされた配列で表現されるBuckets Sequenceで、各Bucket内でフラグメントが分散されているBEのIDです。

このコマンドを使用する際は、FE設定の`disable_colocate_relocate`と`disable_colocate_balance`をtrueに設定する必要がある場合があることに注意してください。これにより、システムがColocationレプリカを自動的に修復またはバランシングすることを防ぎます。そうしないと、変更後にシステムによって自動的にリセットされる可能性があります。
