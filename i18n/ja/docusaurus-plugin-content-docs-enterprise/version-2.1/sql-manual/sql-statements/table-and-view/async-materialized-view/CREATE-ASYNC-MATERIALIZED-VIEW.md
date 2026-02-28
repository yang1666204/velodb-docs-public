---
{
  "title": "CREATE ASYNC MATERIALIZED VIEW",
  "description": "非同期マテリアライズドビューを作成するためのステートメントです。カラム名と型は、マテリアライズドビューのSQLステートメントから派生されます。",
  "language": "ja"
}
---
## 説明

非同期マテリアライズドビューを作成するためのステートメントです。カラム名と型はマテリアライズドビューのSQLステートメントから派生されます。カスタムカラム名は許可されていますが、カラム型は定義できません。

## 構文

```sql
CREATE MATERIALIZED VIEW 
[ IF NOT EXISTS ] <materialized_view_name>
    [ (<columns_definition>) ] 
    [ BUILD <build_mode> ]
    [ REFRESH <refresh_method> [<refresh_trigger>]]
    [ [DUPLICATE] KEY (<key_cols>) ]
    [ COMMENT '<table_comment>' ]
    [ PARTITION BY (
        { <partition_col> 
            | DATE_TRUNC(<partition_col>, <partition_unit>) }
        )]
    [ DISTRIBUTED BY { HASH (<distribute_cols>) | RANDOM }
        [ BUCKETS { <bucket_count> | AUTO } ]
    ]               
    [ PROPERTIES (
          -- Table property
          <table_property>
          -- Additional table properties
          [ , ... ]) 
    ]
    AS <query>
```
どこで:

```sql
columns_definition
  : -- Column definition
    <col_name> 
      [ COMMENT '<col_comment>' ]
refresh_trigger
  : ON MANUAL
  | ON SCHEDULE EVERY <int_value> <refresh_unit> [ STARTS '<start_time>']
  | ON COMMIT
```
## 必須パラメーター

**1. `<materialized_view_name>`**

> マテリアライズドビューの識別子（つまり、名前）を指定します。Tableが作成されるデータベース内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（Unicode名前サポートが有効な場合は、任意の言語の任意の文字を使用可能）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードであってはいけません。
>
> 詳細については、識別子と予約キーワードの要件を参照してください。

**2. `<query>`**

> マテリアライズドビューを作成する際の必須パラメーターです。データを取得するSELECT文を指定します。

## オプションパラメーター

**1. `<key_cols>`**

> Tableのキーカラムです。Dorisでは、キーカラムはTableの最初のK個のカラムである必要があります。キーの制限とキーカラムの選び方についての詳細情報は、「データモデル」章の該当セクションを参照してください。

**2. `<build_mode>`**

> リフレッシュタイミング：マテリアライズドビューを作成後すぐにリフレッシュするかどうかです。
>
> IMMEDIATE：即座にリフレッシュします。デフォルトはIMMEDIATEです。
>
> DEFERRED：遅延リフレッシュです。

**3. `<refresh_method>`**

> リフレッシュ方法：
>
> COMPLETE：すべてのパーティションをリフレッシュします。
>
> AUTO：増分リフレッシュを試行し、前回のマテリアライズドビューのリフレッシュ以降に変更されたパーティションのみをリフレッシュします。増分リフレッシュができない場合は、すべてのパーティションがリフレッシュされます。

:::caution Note
パーティション化されたマテリアライズドビューがCOMPLETEリフレッシュモードを使用する場合、すべてのパーティションデータの完全リフレッシュを実行し、実質的に非パーティション化マテリアライズドビューに退化します。
:::

**4. `<refresh_trigger>`**

> トリガー方法：
>
> MANUAL：手動リフレッシュです。
>
> ON SCHEDULE：スケジュールされたリフレッシュです。
>
> ON COMMIT：トリガーされたリフレッシュで、ベースTableデータの変更がマテリアライズドビューのリフレッシュをトリガーします。

**5. `<refresh_unit>`**

> 定期リフレッシュの時間単位です。現在サポートされている単位は、MINUTE、HOUR、DAY、およびWEEKです。

**6. `<partition_col>`**

> PARTITION BYが指定されていない場合、デフォルトで1つのパーティションのみになります。
>
> パーティションフィールドが指定されている場合、そのフィールドがどのベースTableから来ているかを自動的に推論し、ベースTableと同期します（現在は内部TableとHiveTableをサポート）。内部Tableの場合、1つのパーティションフィールドのみが許可されます。
>
> マテリアライズドビューは、パーティションロールアップを通じてパーティション数を減らすこともできます。現在、パーティションロールアップ機能は`date_trunc`をサポートしています。

**7. `<partition_unit>`**

> パーティションロールアップの集約粒度です。現在サポートされている単位は、HOUR、DAY、WEEK、QUARTER、MONTH、およびYEARです。

**8. `<start_time>`**

> スケジュールされた開始時間は将来の時間である必要があり、つまり現在時刻より後である必要があります。

**9. `<table_property>`**

内部Tableで使用されるプロパティで、そのほとんどがマテリアライズドビューで使用でき、マテリアライズドビュー固有のプロパティと合わせて以下にリストします：

| プロパティ名                        | 説明                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| grace_period                     | クエリリライト中にマテリアライズドビューデータに許可される最大遅延秒数です。マテリアライズドビューのパーティションAとベースTableデータが不整合で、パーティションAの最後のリフレッシュ時間が10:15:00、現在のシステム時間が10:15:08の場合、パーティションは透過的にリライトされません。ただし、`grace_period`が10に設定されている場合、パーティションは透過的リライトに使用されます。 |
| excluded_trigger_tables          | データリフレッシュ中に無視するTable名をカンマ区切りで指定します。例：`table1,table2`。 |
| refresh_partition_num            | 単一のINSERT文でリフレッシュされるパーティション数で、デフォルトは1です。マテリアライズドビューをリフレッシュする際、最初にリフレッシュするパーティションのリストを計算し、それらを複数のINSERT文に分割して順次実行します。INSERT文が失敗した場合、タスク全体が停止します。マテリアライズドビューは単一のINSERT文の原子性を保証し、失敗したINSERTは既に正常にリフレッシュされたパーティションに影響しません。 |
| workload_group                   | マテリアライズドビューがリフレッシュタスクを実行する際に使用する`workload_group`の名前です。これは、データリフレッシュ中にマテリアライズドビューが使用するリソースを制限し、他のビジネス操作への影響を回避するために使用されます。`workload_group`の作成と使用に関する詳細情報については、[WORKLOAD-GROUP](https://doris.apache.org/zh-CN/docs/dev/admin-manual/workload-management/workload-group)ドキュメントを参照してください。 |
| partition_sync_limit             | ベースTableのパーティションフィールドが時間型の場合、このプロパティを`partition_sync_time_unit`と組み合わせて使用し、ベースTableと同期するパーティションの範囲を設定できます。例えば、2に設定し、`partition_sync_time_unit`を`MONTH`に設定すると、ベースTableの過去2ヶ月のパーティションとデータのみが同期されます。最小値は`1`です。時間の経過とともに、マテリアライズドビューは各リフレッシュ時に自動的にパーティションを追加・削除します。例えば、マテリアライズドビューが現在2月と3月のデータを持っている場合、来月は自動的に2月のデータを削除し、4月のデータを追加します。 |
| partition_sync_time_unit         | パーティションリフレッシュの時間単位で、DAY/MONTH/YEAR（デフォルトはDAY）をサポートします。 |
| partition_date_format            | ベースTableのパーティションフィールドが文字列型の場合、`partition_sync_limit`機能を使用したい場合は、日付フォーマットを設定して、`partition_date_format`設定に従ってパーティション時間を解析できます。 |
| enable_nondeterministic_function | マテリアライズドビューの定義SQLに、current_date()、now()、random()などの非決定的関数を含めることを許可するかどうかです。trueに設定すると含めることを許可し、そうでなければ許可しません。デフォルトは許可しません。 |
| use_for_rewrite                  | このマテリアライズドビューが透過的リライトに参加するかどうかを示します。falseに設定すると透過的リライトに参加しません。デフォルトはtrueです。データモデリングシナリオにおいて、マテリアライズドビューが直接クエリにのみ使用される場合、このプロパティを設定することで、マテリアライズドビューが透過的リライトに参加せず、クエリレスポンス速度を向上させることができます。 |

:::caution Note
DISTRIBUTED BY句は、Apache Doris 2.1.10より前では必須です - 省略するとエラーが発生します。
Apache Doris 2.1.10以降、指定されていない場合、デフォルトの分散はRANDOMになります。
:::

:::caution Note
Apache Doris 2.1.10/3.0.6より前では、excluded_trigger_tablesプロパティはベースTable名の指定のみをサポートしていました。
これらのバージョン以降、CatalogとDatabaseを含む完全修飾Table名（例：internal.db1.table1）をサポートするようになりました。
:::

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| 権限        | オブジェクト      | 備考                                                        |
| ----------- | ----------- | ------------------------------------------------------------ |
| CREATE_PRIV | Database    |                                                              |
| SELECT_PRIV | Table, View | `<query>`でクエリされるTableまたはビューに対するSELECT_PRIV権限が必要 |

## 注意事項

- マテリアライズドビューのDMLおよびDDL制限：

  マテリアライズドビューは、カラム型の変更、カラムの追加、削除などのスキーマ変更操作をサポートしません。カラムはマテリアライズドビューの定義SQLから派生するためです。

  マテリアライズドビューは、手動のinsert intoやinsert overwrite操作をサポートしません。

- パーティション化マテリアライズドビューの作成条件：

  > マテリアライズドビューのSQL定義とパーティションフィールドは、パーティション化増分更新を実行するために以下の条件を満たす必要があります：
  >
  > 1. マテリアライズドビューで使用されるベースTableの少なくとも1つはパーティション化Tableである必要があります。
  > 2. マテリアライズドビューで使用されるパーティション化ベースTableは、ListまたはRangeパーティション戦略を使用する必要があります。
  > 3. マテリアライズドビューの定義SQLは、パーティション By句で1つのパーティションフィールドのみを持つことができます。
  > 4. マテリアライズドビューSQLのPartition By句のパーティションフィールドは、Select句の後に現れる必要があります。
  > 5. マテリアライズドビューの定義SQLでGroup Byを使用する場合、パーティションフィールドはGroup By句の後に現れる必要があります。
  > 6. マテリアライズドビューの定義SQLでWindow関数を使用する場合、パーティションフィールドはPartition By句の後に現れる必要があります。
  > 7. データ変更はパーティション化Tableで発生する必要があります。非パーティション化Tableで発生した場合、マテリアライズドビューは完全なビルドが必要になります。
  > 8. マテリアライズドビューがJoinのNULL生成側のフィールドをパーティションフィールドとして使用する場合、パーティション化増分更新を実行できません。例えば、LEFT OUTER JOINの場合、パーティションフィールドは右側ではなく左側にある必要があります


## 例
1. 非パーティション化マテリアライズドビュー

```sql

CREATE MATERIALIZED VIEW complete_mv (
orderdate COMMENT 'Order date',
orderkey COMMENT 'Order key',
partkey COMMENT 'Part key'
)
BUILD IMMEDIATE
REFRESH AUTO
ON SCHEDULE EVERY 1 DAY STARTS '2024-12-01 20:30:00'
DISTRIBUTED BY HASH (orderkey) BUCKETS 2
PROPERTIES
("replication_num" = "1")
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
2. パーティション化されたマテリアライズドビュー

以下に示すように、パーティションカラムが指定されている場合、システムは自動的にそのカラムがどのベースTableから来ているかを識別し、ベースTableのパーティションを同期します。ベースTableは日単位でパーティション化されています（パーティションカラム: o_orderdate、パーティションタイプ: RANGE）。マテリアライズドビューは月単位でパーティション化され、DATE_TRUNC関数を使用してベースTableのパーティションを月単位でロールアップします。

```sql
CREATE TABLE IF NOT EXISTS orders  (
o_orderkey       integer not null,
o_custkey        integer not null,
o_orderstatus    char(1) not null,
o_totalprice     decimalv3(15,2) not null,
o_orderdate      date not null,
o_orderpriority  char(15) not null,  
o_clerk          char(15) not null,
o_shippriority   integer not null,
o_comment        varchar(79) not null
)
DUPLICATE KEY(o_orderkey, o_custkey)
PARTITION BY RANGE(o_orderdate)(
FROM ('2023-10-16') TO ('2023-11-30') INTERVAL 1 DAY
)
DISTRIBUTED BY HASH(o_orderkey) BUCKETS 3
PROPERTIES (
"replication_num" = "3"
);
```
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
以下の例では、パーティション列が非date_trunc関数を使用しているため、パーティション化されたマテリアライズドビューを作成できません。エラーメッセージは次の通りです：because column to check use invalid implicit expression, invalid expression is min(o_orderdate#4)

```sql
CREATE MATERIALIZED VIEW partition_mv_2
BUILD IMMEDIATE
REFRESH AUTO
ON SCHEDULE EVERY 1 DAY STARTS '2024-12-01 20:30:00'
PARTITION BY (DATE_TRUNC(min_orderdate, 'MONTH'))
DISTRIBUTED BY HASH (l_orderkey) BUCKETS 2
PROPERTIES
("replication_num" = "3")
AS
SELECT
min(o_orderdate) AS min_orderdate,
l_orderkey,
l_partkey
FROM
orders
LEFT JOIN lineitem ON l_orderkey = o_orderkey
LEFT JOIN partsupp ON ps_partkey = l_partkey
and l_suppkey = ps_suppkey
GROUP BY
o_orderdate,
l_orderkey,
l_partkey;
```
3. Materialized Viewプロパティの変更 ALTER MATERIALIZED VIEW文を使用します。

例：

```sql
ALTER MATERIALIZED VIEW partition_mv
SET (
"grace_period" = "10",
"excluded_trigger_tables" = "lineitem,partsupp"
);
```
4. マテリアライズドビューのリフレッシュモードの変更 ALTER MATERIALIZED VIEW文を使用します。
   例：

```sql
ALTER MATERIALIZED VIEW partition_mv REFRESH COMPLETE;
After running SHOW CREATE MATERIALIZED VIEW partition_mv;, you can see that the refresh mode has been changed to COMPLETE.
```
