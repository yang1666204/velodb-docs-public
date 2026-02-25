---
{
  "title": "自動パーティション",
  "description": "Auto Partition機能は、データインポート処理中に対応するパーティションが存在するかどうかの自動検出をサポートします。",
  "language": "ja"
}
---
## アプリケーションシナリオ

Auto Partition機能は、データインポート処理中に対応するパーティションが存在するかどうかの自動検出をサポートします。存在しない場合、パーティションは自動的に作成され、正常にインポートされます。

auto partition機能は主に、ユーザーが特定の列に基づいてテーブルをパーティション化することを期待しているものの、その列のデータ分布が分散していたり予測不可能であったりするため、テーブルの構造を構築または調整する際に必要なパーティションを正確に作成することが困難であったり、パーティション数が非常に多くて手動で作成するには煩雑すぎるという問題を解決します。

時間型のパーティション列を例に取ると、動的パーティショニングでは、特定の時間帯のリアルタイムデータに対応するために新しいパーティションの自動作成をサポートしています。リアルタイムユーザー行動ログなどのシナリオでは、この機能は基本的に要件を満たします。しかし、より複雑なシナリオ、例えば非リアルタイムデータを扱う場合、パーティション列は現在のシステム時刻とは独立しており、大量の離散値を含んでいます。この時、効率を向上させるためにこの列に基づいてデータをパーティション化したいのですが、データが実際に関わる可能性のあるパーティションを事前に把握できなかったり、期待される必要なパーティション数が多すぎたりします。この場合、動的パーティショニングや手動で作成されたパーティションでは我々のニーズを満たすことができませんが、Auto Partitionはそのようなニーズをカバーします。

テーブルのDDLが以下のとおりであると仮定します：

```sql
CREATE TABLE `DAILY_TRADE_VALUE`
(
    `TRADE_DATE`              datev2 NOT NULL COMMENT 'TRADE_DATE',
    `TRADE_ID`                varchar(40) NOT NULL COMMENT 'TRADE_ID',
    ......
)
UNIQUE KEY(`TRADE_DATE`, `TRADE_ID`)
PARTITION BY RANGE(`TRADE_DATE`)
(
    PARTITION p_2000 VALUES [('2000-01-01'), ('2001-01-01')),
    PARTITION p_2001 VALUES [('2001-01-01'), ('2002-01-01')),
    PARTITION p_2002 VALUES [('2002-01-01'), ('2003-01-01')),
    PARTITION p_2003 VALUES [('2003-01-01'), ('2004-01-01')),
    PARTITION p_2004 VALUES [('2004-01-01'), ('2005-01-01')),
    PARTITION p_2005 VALUES [('2005-01-01'), ('2006-01-01')),
    PARTITION p_2006 VALUES [('2006-01-01'), ('2007-01-01')),
    PARTITION p_2007 VALUES [('2007-01-01'), ('2008-01-01')),
    PARTITION p_2008 VALUES [('2008-01-01'), ('2009-01-01')),
    PARTITION p_2009 VALUES [('2009-01-01'), ('2010-01-01')),
    PARTITION p_2010 VALUES [('2010-01-01'), ('2011-01-01')),
    PARTITION p_2011 VALUES [('2011-01-01'), ('2012-01-01')),
    PARTITION p_2012 VALUES [('2012-01-01'), ('2013-01-01')),
    PARTITION p_2013 VALUES [('2013-01-01'), ('2014-01-01')),
    PARTITION p_2014 VALUES [('2014-01-01'), ('2015-01-01')),
    PARTITION p_2015 VALUES [('2015-01-01'), ('2016-01-01')),
    PARTITION p_2016 VALUES [('2016-01-01'), ('2017-01-01')),
    PARTITION p_2017 VALUES [('2017-01-01'), ('2018-01-01')),
    PARTITION p_2018 VALUES [('2018-01-01'), ('2019-01-01')),
    PARTITION p_2019 VALUES [('2019-01-01'), ('2020-01-01')),
    PARTITION p_2020 VALUES [('2020-01-01'), ('2021-01-01')),
    PARTITION p_2021 VALUES [('2021-01-01'), ('2022-01-01'))
)
DISTRIBUTED BY HASH(`TRADE_DATE`) BUCKETS 10
PROPERTIES (
  "replication_num" = "1"
);
```
テーブルには大量のビジネス履歴データが格納され、トランザクションが発生した日付に基づいてパーティション分割されています。テーブルを構築する際に見ることができるように、事前に手動でパーティションを作成する必要があります。パーティション分割されたカラムのデータ範囲が変更された場合、例えば上記のテーブルに2022年が追加された場合、[ALTER-TABLE-PARTITION](../../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-PARTITION)によってパーティションを作成し、テーブルパーティションを変更する必要があります。そのようなパーティションを変更したり、より細かい粒度レベルで細分化したりする必要がある場合、それらを修正するのは非常に煩雑です。この時点でAuto Partitionを使用してテーブルDDLを書き直すことができます。

## 構文

テーブルを作成する際は、[CREATE-TABLE](../../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE)文の`partitions_definition`セクションに以下の構文を使用してください。

1. AUTO RANGE PARTITION:

    ```sql
      [AUTO] PARTITION BY RANGE(<partition_expr>)
      <origin_partitions_definition>
    ```
どこで

    ```sql
      partition_expr ::= date_trunc ( <partition_column>, '<interval>' )
    ```
2. AUTO LIST PARTITION:

    ```sql
        AUTO PARTITION BY LIST(`partition_col1` [, `partition_col2`, ...])
        <origin_partitions_definition>
    ```
### Sample

1. AUTO RANGE PARTITION

    ```sql
      CREATE TABLE `date_table` (
          `TIME_STAMP` datev2 NOT NULL
      ) ENGINE=OLAP
      DUPLICATE KEY(`TIME_STAMP`)
      AUTO PARTITION BY RANGE (date_trunc(`TIME_STAMP`, 'month'))
      (
      )
      DISTRIBUTED BY HASH(`TIME_STAMP`) BUCKETS 10
      PROPERTIES (
      "replication_allocation" = "tag.location.default: 1"
      );
    ```
AUTO RANGE PARTITIONでは、`AUTO`キーワードを省略することができ、省略した場合でも自動パーティショニングの意味を表します。

2. AUTO LIST PARTITION

    ```sql
      CREATE TABLE `str_table` (
          `str` varchar not null
      ) ENGINE=OLAP
      DUPLICATE KEY(`str`)
      AUTO PARTITION BY LIST (`str`)
      ()
      DISTRIBUTED BY HASH(`str`) BUCKETS 10
      PROPERTIES (
      "replication_allocation" = "tag.location.default: 1"
      );
    ```
List Auto Partitionは複数のパーティションカラムをサポートしており、通常のList Partitionと同じ方法で記述します：```AUTO PARTITION BY LIST (`col1`, `col2`, ...)```

### 制約

- auto List Partitionでは、パーティション名の長さは**50文字を超えてはいけません**。この長さは対応するデータ行のパーティションカラムの内容の連結とエスケープから導出されるため、実際に許可される長さはより短い場合があります。
- auto Range Partitionでは、パーティション関数は`date_trunc`のみをサポートし、パーティションカラムは`DATE`または`DATETIME`型のみをサポートします。
- auto List Partitionでは、関数呼び出しはサポートされておらず、パーティションカラムは`BOOLEAN`、`TINYINT`、`SMALLINT`、`INT`、`BIGINT`、`LARGEINT`、`DATE`、`DATETIME`、`CHAR`、`VARCHAR`データ型をサポートし、パーティション値は列挙値になります。
- auto List Partitionでは、パーティションカラムの既存の値でパーティションに対応しないものすべてに対して、新しい独立したパーティションが作成されます。

### NULL値パーティション

セッション変数`allow_partition_column_nullable`が有効な場合：

- Auto List Partitionでは、対応するNULL値パーティションが自動的に作成されます：

    ```sql
      create table auto_null_list(
        k0 varchar null
      )
      auto partition by list (k0)
      (
      )
      DISTRIBUTED BY HASH(`k0`) BUCKETS 1
      properties("replication_num" = "1");

      insert into auto_null_list values (null);

      select * from auto_null_list;
      +------+
      | k0   |
      +------+
      | NULL |
      +------+

      select * from auto_null_list partition(pX);
      +------+
      | k0   |
      +------+
      | NULL |
      +------+
    ```
- Auto Range Partitionでは、**nullカラムはパーティションカラムとしてサポートされていません**。

    ```sql
      CREATE TABLE `range_table_nullable` (
        `k1` INT,
        `k2` DATETIMEV2(3),
        `k3` DATETIMEV2(6)
      ) ENGINE=OLAP
      DUPLICATE KEY(`k1`)
      AUTO PARTITION BY RANGE (date_trunc(`k2`, 'day'))
      ()
      DISTRIBUTED BY HASH(`k1`) BUCKETS 16
      PROPERTIES (
      "replication_allocation" = "tag.location.default: 1"
      );

    ERROR 1105 (HY000): errCode = 2, detailMessage = AUTO RANGE PARTITION doesn't support NULL column
    ```
## Example

Auto Partitionを使用する場合、Application scenariosセクションの例は以下のように書き換えることができます：

```sql
CREATE TABLE `DAILY_TRADE_VALUE`
(
    `TRADE_DATE`              datev2 NOT NULL COMMENT '交易日期',
    `TRADE_ID`                varchar(40) NOT NULL COMMENT '交易编号',
    ......
)
UNIQUE KEY(`TRADE_DATE`, `TRADE_ID`)
AUTO PARTITION BY RANGE (date_trunc(`TRADE_DATE`, 'year'))
(
)
DISTRIBUTED BY HASH(`TRADE_DATE`) BUCKETS 10
PROPERTIES (
  "replication_num" = "1"
);
```
2つの列のみを持つテーブルの例を取ってください。この時点で、新しいテーブルにはデフォルトのパーティションがありません：

```sql
show partitions from `DAILY_TRADE_VALUE`;
Empty set (0.12 sec)
```
データを挿入して再度確認すると、テーブルが対応するパーティションを作成していることがわかります：

```sql
insert into `DAILY_TRADE_VALUE` values ('2012-12-13', 1), ('2008-02-03', 2), ('2014-11-11', 3);

show partitions from `DAILY_TRADE_VALUE`;
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+----------+------------+-------------------------+-----------+
| PartitionId | PartitionName   | VisibleVersion | VisibleVersionTime  | State  | PartitionKey | Range                                                                          | DistributionKey | Buckets | ReplicationNum | StorageMedium | CooldownTime        | RemoteStoragePolicy | LastConsistencyCheckTime | DataSize | IsInMemory | ReplicaAllocation       | IsMutable |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+----------+------------+-------------------------+-----------+
| 180060      | p20080101000000 | 2              | 2023-09-18 21:49:29 | NORMAL | TRADE_DATE   | [types: [DATEV2]; keys: [2008-01-01]; ..types: [DATEV2]; keys: [2009-01-01]; ) | TRADE_DATE      | 10      | 1              | HDD           | 9999-12-31 23:59:59 |                     | NULL                     | 0.000    | false      | tag.location.default: 1 | true      |
| 180039      | p20120101000000 | 2              | 2023-09-18 21:49:29 | NORMAL | TRADE_DATE   | [types: [DATEV2]; keys: [2012-01-01]; ..types: [DATEV2]; keys: [2013-01-01]; ) | TRADE_DATE      | 10      | 1              | HDD           | 9999-12-31 23:59:59 |                     | NULL                     | 0.000    | false      | tag.location.default: 1 | true      |
| 180018      | p20140101000000 | 2              | 2023-09-18 21:49:29 | NORMAL | TRADE_DATE   | [types: [DATEV2]; keys: [2014-01-01]; ..types: [DATEV2]; keys: [2015-01-01]; ) | TRADE_DATE      | 10      | 1              | HDD           | 9999-12-31 23:59:59 |                     | NULL                     | 0.000    | false      | tag.location.default: 1 | true      |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+----------+------------+-------------------------+-----------+
```
Auto Partitionによって作成されたパーティションは、手動パーティショニングによって作成されたパーティションと同じ機能を共有すると結論付けることができます。

## Dynamic Partitionとの併用

DorisはAutoとDynamic Partitionの両方をサポートしています。この場合、両方の機能が有効になります：

1. Auto Partitionは、データインポート時に必要に応じて自動的にパーティションを作成します；
2. Dynamic Partitionは、パーティションの作成、リサイクル、ダンプを自動的に行います。

2つの構文に競合はないため、対応するclauses/attributesを同時に設定するだけです。現在の期間のパーティションがAuto PartitionまたはDynamic Partitionのどちらによって作成されるかは不確実であることに注意してください。作成方法の違いにより、パーティションの命名形式が異なります。

## ライフサイクル管理

:::info
Dorisはライフサイクル管理のための自動パーティショニングと動的パーティショニングの同時使用をサポートしていますが、現在は推奨されていません。
:::

AUTO RANGE PARTITIONテーブルでは、`partition.retention_count`プロパティがサポートされており、これは正の整数値をパラメータとして受け取り（`N`と表記）、**すべての履歴パーティションの中で、パーティション値が最大の上位`N`個の履歴パーティションのみ**が保持されることを示します。現在および将来のパーティションはすべて保持されます。具体的には：

- RANGEパーティションは常に重複しないため、`partition A's value > partition B's value`は`partition A's lower bound value > partition B's upper bound value`と同等であり、これは`partition A's upper bound value > partition B's upper bound value`と同等です。
- 履歴パーティションとは、**上限値が現在時刻以下のパーティション**を指します。
- 現在および将来のパーティションとは、**下限値が現在時刻以上のパーティション**を指します。

例えば：

```sql
create table auto_recycle(
    k0 datetime(6) not null
)
AUTO PARTITION BY RANGE (date_trunc(k0, 'day')) ()
DISTRIBUTED BY HASH(`k0`) BUCKETS 1
properties(
    "partition.retention_count" = "3"
);
```
これは履歴の中で最大の日付値を持つ上位3つのパーティションのみを保持することを表します。現在の日付が`2025-10-21`で、`2025-10-16`から`2025-10-23`まで各日のデータを挿入し、1回のリサイクル後、図に示すように、残りのパーティションは以下の通りです：

![Recycle](/images/blogs/auto-partition-lifetime1.png)

- p20251018000000
- p20251019000000
- p20251020000000 (このパーティション以上：3つの履歴パーティションのみを保持)
- p20251021000000 (このパーティション以下：現在と将来のパーティションは影響を受けない)
- p20251022000000
- p20251023000000

## Auto Bucketとの結合

AUTO RANGE PARTITIONのみが[Auto Bucket](./data-bucketing.md#auto-setting-bucket-number)機能と組み合わせて使用できます。この機能を使用する場合、Dorisはデータインポートが時間順に増分的であり、各インポートは1つのパーティションのみに関わると想定します。つまり、この使用方法はバッチごとに増分的にインポートされるテーブルに対してのみ推奨されます。

:::warning Note!
データインポート方法が上記のパターンに準拠せず、自動パーティショニングと自動バケッティングの両方が同時に使用される場合、新しいパーティションのバケット数が極めて不適切になる可能性があり、クエリパフォーマンスに大きく影響する可能性があります。
:::

## パーティション管理

:::tip
2.1.6以降、Dorisは`partitions`テーブル関数と`auto_partition_name`関数をサポートしており、これらを使用してデータのパーティションを簡単に検索・管理できます。
:::

Auto Partitionが有効な場合、パーティション名は`auto_partition_name`関数を使用してパーティションにマッピングできます。`partitions`テーブル関数は、パーティション名から詳細なパーティション情報を生成します。`DAILY_TRADE_VALUE`テーブルを例に、データを挿入した後の現在のパーティションを見てみましょう：

```sql
select * from partitions("catalog"="internal","database"="optest","table"="DAILY_TRADE_VALUE") where PartitionName = auto_partition_name('range', 'year', '2008-02-03');
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
| PartitionId | PartitionName   | VisibleVersion | VisibleVersionTime  | State  | PartitionKey | Range                                                                          | DistributionKey | Buckets | ReplicationNum | StorageMedium | CooldownTime        | RemoteStoragePolicy | LastConsistencyCheckTime | DataSize  | IsInMemory | ReplicaAllocation       | IsMutable | SyncWithBaseTables | UnsyncTables |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
|      127095 | p20080101000000 |              2 | 2024-11-14 17:29:02 | NORMAL | TRADE_DATE   | [types: [DATEV2]; keys: [2008-01-01]; ..types: [DATEV2]; keys: [2009-01-01]; ) | TRADE_DATE      |      10 |              1 | HDD           | 9999-12-31 23:59:59 |                     | \N                       | 985.000 B |          0 | tag.location.default: 1 |         1 |                  1 | \N           |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
```
このように各パーティションのIDと値を正確にフィルタリングして、後続のパーティション固有の操作（例：`insert overwrite partition`）を実行できます。

詳細な文法説明については、以下を参照してください：[auto_partition_name](../../sql-manual/sql-functions/scalar-functions/string-functions/auto-partition-name)、[partitions](../../sql-manual/sql-functions/table-valued-functions/partitions)。

## 重要なポイント

- 通常のパーティション化テーブルと同様に、auto List Partitionは構文に違いがなく、マルチカラムパーティショニングをサポートします。
- データの挿入やインポートプロセス中にパーティションが作成され、インポートプロセス全体が完了しない場合（失敗またはキャンセル）、作成されたパーティションは自動的に削除されません。
- Auto Partitionを使用するテーブルは、パーティション作成方法のみが手動から自動に変わり、テーブルと作成されたパーティションの本来の使用方法は、Auto Partitionではないテーブルやパーティションと同じです。
- 過度に多くのパーティションが誤って作成されることを防ぐため、Apache DorisはFE設定の`max_auto_partition_num setting`を通じて、Auto Partitionテーブルが収容できる最大パーティション数を制御します。この値は必要に応じて調整可能です。
- Auto Partitionが有効なテーブルにデータをインポートする際、コーディネーターは通常のテーブルとは異なるポーリング間隔でデータを送信します。詳細はBE ConfigurationのOLAP_table_sink_send_interval_auto_partition_factor`を参照してください。この設定は`enable_memtable_on_sink_node`が有効になった後は影響しません。
- [insert-overwrite](../../sql-manual/sql-statements/data-modification/DML/INSERT-OVERWRITE)を使用してAuto PartitionテーブルにデータをロードするとINSERT OVERWRITEドキュメントに詳細な動作が記載されています。
- インポート時とパーティション作成時にメタデータ操作が含まれる場合、インポートプロセスが失敗する可能性があります。
