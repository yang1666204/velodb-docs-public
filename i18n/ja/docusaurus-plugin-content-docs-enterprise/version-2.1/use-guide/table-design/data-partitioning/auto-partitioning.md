---
{
  "title": "Auto パーティション",
  "description": "Auto Partition機能は、データインポートプロセス中に対応するパーティションが存在するかどうかの自動検出をサポートします。",
  "language": "ja"
}
---
## アプリケーションシナリオ

Auto Partition機能は、データインポートプロセス中に対応するパーティションが存在するかどうかを自動的に検出することをサポートします。パーティションが存在しない場合、パーティションは自動的に作成され、正常にインポートされます。

auto partition機能は主に、ユーザーが特定のカラムに基づいてTableをパーティション分割したいが、そのカラムのデータ分布が分散しているか予測不可能であるため、Tableの構造を構築または調整する際に必要なパーティションを正確に作成することが困難であるか、パーティション数が非常に大きいため手動で作成するには煩雑すぎるという問題を解決します。

時間型パーティションカラムを例に取ると、動的パーティショニングでは、特定の時間期間でリアルタイムデータを収容するための新しいパーティションの自動作成をサポートしています。リアルタイムユーザー行動ログなどのシナリオでは、この機能は基本的に要件を満たします。しかし、より複雑なシナリオ、例えば非リアルタイムデータを扱う場合、パーティションカラムは現在のシステム時刻とは独立しており、多数の離散値を含んでいます。この時、効率を向上させるためにこのカラムに基づいてデータをパーティション分割したいのですが、データが実際に関与する可能性のあるパーティションを事前に把握することができないか、期待される必要なパーティション数が大きすぎます。この場合、動的パーティショニングや手動で作成されたパーティションでは要求を満たすことができませんが、Auto Partitionはこのような需要をカバーします。

TableDDLが以下のようになっているとします：

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
    PARTITION p_2000 VALUES ('2000-01-01'), ('2001-01-01')),
    PARTITION p_2001 VALUES ('2001-01-01'), ('2002-01-01')),
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
このTableは大量の業務履歴データを格納しており、取引が発生した日付に基づいてパーティショニングされています。Tableを構築する際に確認できるように、事前に手動でパーティションを作成する必要があります。パーティション列のデータ範囲が変更された場合、例えば上記のTableに2022年が追加された場合、[ALTER-TABLE-PARTITION によってパーティションを作成し、Tableパーティションに変更を加える必要があります。このようなパーティションを変更したり、より細かい粒度レベルで細分化したりする必要がある場合、それらを修正するのは非常に面倒です。この時点で、Auto Partitionを使用してTableDDLを書き直すことができます。

## 構文

Tableを作成する際は、[CREATE-TABLE文の`partitions_definition`セクションを入力するために以下の構文を使用してください。

1. AUTO RANGE PARTITION:

    ```sql
      AUTO PARTITION BY RANGE(<partition_expr>)
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
### サンプル

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
List Auto Partitionは複数のパーティションカラムをサポートしており、通常のList Partitionと同じ方法で記述されます：```AUTO PARTITION BY LIST (`col1`, `col2`, ...)```

### 制約

- auto List Partitionでは、パーティション名の長さは**50文字を超えてはいけません**。この長さは対応するデータ行のパーティションカラムの内容の連結とエスケープから導出されるため、実際に許可される長さはより短い場合があります。
- auto Range Partitionでは、パーティション関数は`date_trunc`のみをサポートし、パーティションカラムは`DATE`または`DATETIME`タイプのみをサポートします。
- auto List Partitionでは、関数呼び出しはサポートされておらず、パーティションカラムは`BOOLEAN`、`TINYINT`、`SMALLINT`、`INT`、`BIGINT`、`LARGEINT`、`DATE`、`DATETIME`、`CHAR`、`VARCHAR`データタイプをサポートし、パーティション値は列挙値となります。
- auto List Partitionでは、パーティションに対応していないパーティションカラム内の既存の値ごとに、新しい独立したパーティションが作成されます。

### NULL値パーティション

セッション変数`allow_partition_column_nullable`が有効になっている場合：

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
- Auto Range Partitionでは、**null列はパーティション列としてサポートされていません**。

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
## 例

Auto Partitionを使用する場合、アプリケーションシナリオセクションの例は以下のように書き換えることができます：

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
2つの列のみを持つTableの例を見てみましょう。この時点で、新しいTableにはデフォルトパーティションがありません：

```sql
show partitions from `DAILY_TRADE_VALUE`;
Empty set (0.12 sec)
```
データを挿入して再度確認すると、Tableが対応するパーティションを作成していることが確認できます：

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
Auto Partitionによって作成されたパーティションは、手動パーティション分割によって作成されたパーティションと同じ機能を共有することが結論付けられます。

## Dynamic Partitionとの併用

DorisはAutoとDynamic Partitionの両方をサポートしています。この場合、両方の機能が有効になります：

1. Auto Partitionはデータインポート時に必要に応じて自動的にパーティションを作成します；
2. Dynamic Partitionは自動的にパーティションを作成、リサイクル、ダンプします。

2つの構文間に競合はありません。対応するclauses/attributesを同時に設定するだけです。現在の期間のパーティションがAuto PartitionまたはDynamic Partitionのどちらによって作成されたかは不確定であることに注意してください。作成方法が異なると、パーティションの命名形式が異なります。

:::info
この機能はDoris 2.1.7以降でサポートされています
:::

## ベストプラクティス

パーティションライフサイクルの制限を設定する必要があるシナリオでは、**Dynamic Partitionの作成を無効にして、パーティションの作成をAuto Partitionに委ね**、Dynamic Partitionのパーティション動的回収機能を通じてパーティションライフサイクルの管理を完了することができます：

```sql
create table auto_dynamic(
    k0 datetime(6) NOT NULL
)
auto partition by range (date_trunc(k0, 'year'))
(
)
DISTRIBUTED BY HASH(`k0`) BUCKETS 2
properties(
    "dynamic_partition.enable" = "true",
    "dynamic_partition.prefix" = "p",
    "dynamic_partition.start" = "-50",
    "dynamic_partition.end" = "0", --- Dynamic パーティション No パーティション Creation
    "dynamic_partition.time_unit" = "year",
    "replication_num" = "1"
);
```
この方法により、Auto Partitionの柔軟性とパーティション名の一貫性の両方を実現できます。

:::note
2.1.7より前の一部の初期バージョンでは、この機能は無効化されていませんでしたが、推奨されていませんでした。
:::

## パーティション Management

:::tip
2.1.6以降、Dorisは`partitions`Table関数と`auto_partition_name`関数をサポートしており、これらを使用してデータのパーティションを簡単に検索・管理できます。
:::

Auto Partitionが有効な場合、`auto_partition_name`関数を使用してパーティション名をパーティションにマッピングできます。`partitions`Table関数は、パーティション名から詳細なパーティション情報を生成します。データを挿入した後の現在のパーティションを確認するため、`DAILY_TRADE_VALUE`Tableを例に見てみましょう。

```sql
select * from partitions("catalog"="internal","database"="optest","table"="DAILY_TRADE_VALUE") where PartitionName = auto_partition_name('range', 'year', '2008-02-03');
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
| PartitionId | PartitionName   | VisibleVersion | VisibleVersionTime  | State  | PartitionKey | Range                                                                          | DistributionKey | Buckets | ReplicationNum | StorageMedium | CooldownTime        | RemoteStoragePolicy | LastConsistencyCheckTime | DataSize  | IsInMemory | ReplicaAllocation       | IsMutable | SyncWithBaseTables | UnsyncTables |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
|      127095 | p20080101000000 |              2 | 2024-11-14 17:29:02 | NORMAL | TRADE_DATE   | [types: [DATEV2]; keys: [2008-01-01]; ..types: [DATEV2]; keys: [2009-01-01]; ) | TRADE_DATE      |      10 |              1 | HDD           | 9999-12-31 23:59:59 |                     | \N                       | 985.000 B |          0 | tag.location.default: 1 |         1 |                  1 | \N           |
+-------------+-----------------+----------------+---------------------+--------+--------------+--------------------------------------------------------------------------------+-----------------+---------+----------------+---------------+---------------------+---------------------+--------------------------+-----------+------------+-------------------------+-----------+--------------------+--------------+
```
この方法により、各パーティションのIDと値を正確にフィルタリングして、後続のパーティション固有の操作（例：`insert overwrite partition`）を実行できます。

詳細な文法の説明については、auto_partition_name、partitionsを参照してください。

## 重要なポイント

- 通常のパーティションTableと同様に、aoto List Partitionは構文の違いなく複数列パーティショニングをサポートします。
- データの挿入またはインポート処理中にパーティションが作成され、インポート処理全体が完了しない場合（失敗またはキャンセル）、作成されたパーティションは自動的に削除されません。
- Auto Partitionを使用するTableは、パーティション作成方法のみが異なり、手動から自動に切り替わります。Tableおよび作成されたパーティションの元の使用方法は、非Auto PartitionTableやパーティションと同じです。
- 過度に多くのパーティションが誤って作成されることを防ぐため、Apache DorisはFE設定の`max_auto_partition_num setting`を通じて、Auto PartitionTableが収容できる最大パーティション数を制御します。この値は必要に応じて調整可能です。
- Auto Partitionが有効になっているTableにデータをインポートする際、コーディネーターは通常のTableとは異なるポーリング間隔でデータを送信します。詳細については、BE ConfigurationのOLAP_table_sink_send_interval_auto_partition_factor`を参照してください。この設定は`enable_memtable_on_sink_node`が有効になった後は影響しません。
- insert-overwriteを使用してAuto PartitionTableにデータをロードする場合、その動作はINSERT OVERWRITEドキュメントに詳細が記載されています。
- パーティションのインポートと作成時にメタデータ操作が関与する場合、インポート処理が失敗する可能性があります。
