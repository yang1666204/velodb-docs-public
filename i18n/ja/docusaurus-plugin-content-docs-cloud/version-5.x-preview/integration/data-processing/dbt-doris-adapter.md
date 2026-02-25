---
{
  "title": "DBT Doris Adapter",
  "description": "DBT(Data Build Tool)は、ELT（抽出、ロード、変換）におけるT（変換）の実行に焦点を当てたコンポーネントです - 「データ変換」のリンク...",
  "language": "ja"
}
---
# DBT Doris Adapter

[DBT(Data Build Tool)](https://docs.getdbt.com/docs/introduction) は、ELT（extraction, loading, transformation）におけるT（Transform）、つまり「データ変換」の部分に特化したコンポーネントです。
`dbt-doris`アダプターは`dbt-core` 1.5.0をベースに開発されており、`mysql-connector-python`ドライバーに依存してdorisへのデータ変換を行います。

git: https://github.com/apache/doris/tree/master/extension/dbt-doris

## version

| doris   | python       | dbt-core |
|---------|--------------|----------|
| >=1.2.5 | >=3.8,<=3.10 | >=1.5.0  |


## dbt-doris adapter使用方法

### dbt-doris adapterインストール
pip installを使用：

```shell
pip install dbt-doris
```
バージョンを確認:

```shell
dbt --version
```
コマンドが見つからない場合: dbt:

```shell
ln -s /usr/local/python3/bin/dbt /usr/bin/dbt
```
### dbt-doris adapter プロジェクト初期化

```shell
dbt init 
```
ユーザーは dbt プロジェクトを init するために以下の情報を準備する必要があります

| name     | default | meaning                                                                                                                                   |  
|----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
| project  |         | プロジェクト名                                                                                                                              | 
| database |         | アダプタを選択するために対応する番号を入力してください                                                                                      | 
| host     |         | doris host                                                                                                                                | 
| port     | 9030    | doris MySQL Protocol Port                                                                                                                 |
| schema   |         | dbt-doris では、これは database と同等です。データベース名                                                                                 |
| username |         | doris username                                                                                                                            |
| password |         | doris password                                                                                                                            |
| threads  | 1       | dbt-doris での並列性（クラスタ機能と一致しない並列性を設定すると、dbt 実行失敗のリスクが高まります）                                        |


### dbt-doris adapter run
dbt run のドキュメントについては、[こちら](https://docs.getdbt.com/docs/get-started/run-your-dbt-projects)を参照してください。
プロジェクトディレクトリに移動し、デフォルトの dbt モデルを実行します：

```shell
dbt run 
```
model：`my_first_dbt_model`と`my_second_dbt_model`

これらはそれぞれ`table`と`view`としてマテリアライズされます。
その後、dorisにログインして`my_first_dbt_model`と`my_second_dbt_model`のデータ結果とテーブル作成文を確認してください。
### dbt-doris adapter Materialization
dbt-doris Materializationは以下の3つをサポートします：
1. view
2. table
3. incremental

#### View

`view`をマテリアライゼーションとして使用すると、モデルは実行されるたびにcreate view as文によってビューとして再構築されます。（デフォルトでは、dbtのマテリアライゼーション方法はviewです）

``` 
Advantages: No extra data is stored, and views on top of the source data will always contain the latest records.
Disadvantages: View queries that perform large transformations or are nested on top of other views are slow.
Recommendation: Usually start with the view of the model and only change to another materialization if there are performance issues. Views are best suited for models that do not undergo major transformations, such as renaming, column changes.
```
config：

```yaml
models:
  <resource-path>:
    +materialized: view
```
または model ファイルに記述してください

```jinja
{{ config(materialized = "view") }}
```
#### Table

`table` materialization modeを使用する場合、モデルは各実行時に `create table as select` ステートメントでテーブルとして再構築されます。
dbtのtablet materializationについて、dbt-dorisはデータ変更のアトミック性を保証するために以下の手順を使用します：
1. 最初に一時テーブルを作成します：`create table this_table_temp as {{ model sql}}`。
2. `this_table` が存在しないかどうか、つまり初回作成かどうかを判定し、`rename` を実行して一時テーブルを最終テーブルに変更します。
3. すでに存在する場合は、`alter table this_table REPLACE WITH TABLE this_table_temp PROPERTIES('swap' = 'False')` を実行します。この操作はテーブル名を交換し、`this_table_temp` 一時テーブルを削除することができ、[this](../../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-REPLACE) がDorisのトランザクションメカニズムを通じてこの操作のアトミック性を保証します。

``` 
Advantages: table query speed will be faster than view.
Disadvantages: The table takes a long time to build or rebuild, additional data will be stored, and incremental data synchronization cannot be performed.
Recommendation: It is recommended to use the table materialization method for models queried by BI tools or models with slow operations such as downstream queries and conversions.
```
config:

```yaml
models:
  <resource-path>:
    +materialized: table
    +duplicate_key: [ <column-name>, ... ],
    +replication_num: int,
    +partition_by: [ <column-name>, ... ],
    +partition_type: <engine-type>,
    +partition_by_init: [<pertition-init>, ... ]
    +distributed_by: [ <column-name>, ... ],
    +buckets: int | 'auto',
    +properties: {<key>:<value>,...}
```
または、modelファイルに記述してください：

```jinja
{{ config(
    materialized = "table",
    duplicate_key = [ "<column-name>", ... ],
    replication_num = "<int>"
    partition_by = [ "<column-name>", ... ],
    partition_type = "<engine-type>",
    partition_by_init = ["<pertition-init>", ... ]
    distributed_by = [ "<column-name>", ... ],
    buckets = "<int>" | "auto",
    properties = {"<key>":"<value>",...}
      ...
    ]
) }}
```
上記の設定項目の詳細は以下の通りです：

| item                 | description                                                | Required? |
|---------------------|------------------------------------------------------------|-----------|
| `materialized`      | テーブルのマテリアライズ形式（Doris Duplicateテーブル）             | Required  |
| `duplicate_key`     | Doris Duplicateキー                                        | Optional  |
| `replication_num`   | テーブルレプリカ数                                            | Optional  |
| `partition_by`      | テーブルパーティション列                                        | Optional  |
| `partition_type`    | テーブルパーティションタイプ、`range`または`list`（デフォルト：`RANGE`） | Optional  |
| `partition_by_init` | 初期化されたテーブルパーティション                                | Optional  |
| `distributed_by`    | テーブル分散列                                              | Optional  |
| `buckets`           | バケットサイズ                                              | Optional  |
| `properties`        | Dorisテーブルプロパティ                                      | Optional  |




#### Incremental

dbtの前回実行時のincrementalモデル結果に基づいて、レコードがテーブルに増分挿入または更新されます。
dorisの増分を実現する方法は2つあります。`incremental_strategy`には2つの増分戦略があります：
* `insert_overwrite`：doris `unique`モデルに依存します。増分要件がある場合は、モデルのデータを初期化する際にマテリアライゼーションをincrementalとして指定し、集約列を指定して集約することで増分データのカバレッジを実現します。
* `append`：doris `duplicate`モデルに依存し、増分データのみを追加し、履歴データの変更は行いません。そのためunique_keyを指定する必要はありません。

``` 
Advantages: Significantly reduces build time by only converting new records.
Disadvantages: incremental mode requires additional configuration, which is an advanced usage of dbt, and requires the support of complex scenarios and the adaptation of corresponding components.
Recommendation: The incremental model is best for event-based scenarios or when dbt runs become too slow
```
config:

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +incremental_strategy: <strategy>
    +unique_key: [ <column-name>, ... ],
    +replication_num: int,
    +partition_by: [ <column-name>, ... ],
    +partition_type: <engine-type>,
    +partition_by_init: [<pertition-init>, ... ]
    +distributed_by: [ <column-name>, ... ],
    +buckets: int | 'auto',
    +properties: {<key>:<value>,...}
```
またはmodel fileに記述します：

```jinja
{{ config(
    materialized = "incremental",
    incremental_strategy = "<strategy>"
    unique_key = [ "<column-name>", ... ],
    replication_num = "<int>"
    partition_by = [ "<column-name>", ... ],
    partition_type = "<engine-type>",
    partition_by_init = ["<pertition-init>", ... ]
    distributed_by = [ "<column-name>", ... ],
    buckets = "<int>" | "auto",
    properties = {"<key>":"<value>",...}
      ...
    ]
) }}
```
上記の設定項目の詳細は以下の通りです：

| item                 | description                                                       | Required? |
|----------------------------|-------------------------------------------------------------------|-----------|
| `materialized`             | テーブルのマテリアライズ形式（Doris Duplicate/Uniqueテーブル） | Required  |
| `incremental_strategy`     | インクリメンタル戦略                                              | Optional  |
| `unique_key`               | Doris Unique key                                                  | Optional  |
| `replication_num`          | テーブルレプリカ数                                          | Optional  |
| `partition_by`             | テーブルパーティションカラム                                            | Optional  |
| `partition_type`           | テーブルパーティションタイプ、`range`または`list`（デフォルト：`RANGE`）        | Optional  |
| `partition_by_init`        | 初期化されたテーブルパーティション                                      | Optional  |
| `distributed_by`           | テーブル分散カラム                                          | Optional  |
| `buckets`                  | バケットサイズ                                                       | Optional  |
| `properties`               | Dorisテーブルプロパティ                                            | Optional  |



### dbt-doris adapter seed

[`seed`](https://docs.getdbt.com/faqs/seeds/build-one-seed)は、csvなどのデータファイルをロードするために使用される機能モジュールです。ファイルをライブラリにロードしてモデル構築に参加させる方法ですが、以下の注意点があります：
1. Seedは生データのロード（例：本番データベースからの大きなCSVエクスポート）に使用すべきではありません。
2. Seedはバージョン管理されているため、ビジネス固有のロジックを含むファイル（例：国コードのリストや従業員のユーザーID）に最も適しています。
3. dbtのseed機能を使用したCSVのロードは、大きなファイルに対してはパフォーマンスが良くありません。これらのCSVをDorisにロードする場合は、`streamload`の使用を検討してください。

ユーザーはdbtプロジェクトディレクトリ下のseedsディレクトリを確認し、その中にcsvファイルとseed設定ファイルをアップロードして実行できます

```shell
 dbt seed --select seed_name
```
一般的なseed設定ファイル作成方法では、カラム型の定義がサポートされています：

```yaml
seeds:
  seed_name: 
    config: 
      schema: demo_seed 
      full_refresh: true
      replication_num: 1
      column_types:
        id: bigint
        phone: varchar(32)
        ip: varchar(15)
        name: varchar(20)
        cost: DecimalV3(19,10)
```
## 使用例

### View Model サンプル参照

```sql
{{ config(materialized='view') }}

select
    u.user_id,
    max(o.create_time) as create_time,
    sum (o.cost) as balance
from {{ ref('sell_order') }} as o
left join {{ ref('sell_user') }} as u
on u.account_id=o.account_id
group by u.user_id
order by u.user_id
```
### Table Model サンプルリファレンス

```sql
{{ config(materialized='table') }}

select
    u.user_id,
    max(o.create_time) as create_time,
    sum (o.cost) as balance
from {{ ref('sell_order') }} as o
left join {{ ref('sell_user') }} as u
on u.account_id=o.account_id
group by u.user_id
order by u.user_id
```
### Incremental model sample reference (duplicate mode)

duplicate modeでテーブルを作成し、データの集約を行わず、unique_keyを指定しない

```sql
{{ config(
    materialized='incremental', 
    replication_num=1
) }}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select * from source_data
```
### Incremental model sample reference (unique mode)

unique modeでテーブルを作成し、データを集約します。unique_keyを指定する必要があります。

```sql
{{ config(
materialized='incremental', 
unique_key=['account_id','create_time']
) }}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select * from source_data
```
### Incremental model full refresh サンプルリファレンス

```sql
{{ config(
    materialized='incremental', 
    full_refresh = true
)}}

select * from
 {{ source('dbt_source', 'sell_user') }}
```
### bucketing rulesの設定例

ここでbucketsには、autoまたは正の整数を設定できます。これらはそれぞれ自動bucketing、および固定数のbucketsの設定を表します。

```sql
{{ config(
    materialized='incremental', 
    unique_key=['account_id',"create_time"], 
    distributed_by=['account_id'], 
    buckets='auto' 
) }}

with source_data as (
    select
        *
    from {{ ref('sell_order') }}
)

select
    *
    from source_data

{% if is_incremental() %}
    where
    create_time > (select max(create_time) from {{this}})
{% endif %}
```
### レプリカ数の設定例リファレンス

```sql
{{ config(
    materialized='table', 
    replication_num=1
)}}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select * from source_data
```
### Dynamic partition サンプルリファレンス

```sql
{{ config(
    materialized='incremental', 
    partition_by = 'create_time',
    partition_type = 'range', 
        -- The properties here are the properties in the create table statement, which contains the configuration related to dynamic partitioning    
    properties = {
        "dynamic_partition.time_unit":"DAY",
        "dynamic_partition.end":"8",
        "dynamic_partition.prefix":"p",
        "dynamic_partition.buckets":"4",
        "dynamic_partition.create_history_partition":"true",
        "dynamic_partition.history_partition_num":"3"
    }
) }}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select
    *
    from source_data

{% if is_incremental() %}
    where    
    create_time = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
{% endif %}
```
### 従来のパーティション サンプル リファレンス

```sql
{{ config(
    materialized='incremental', 
    partition_by = 'create_time',
    partition_type = 'range',  
        -- partition_by_init here refers to the historical partitions for creating partition tables. The historical partitions of the current doris version need to be manually specified.    
    partition_by_init = [
        "PARTITION `p20240601` VALUES [(\"2024-06-01\"),  (\"2024-06-02\"))",
        "PARTITION `p20240602` VALUES [(\"2024-06-02\"),  (\"2024-06-03\"))"
    ]
 )}}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select
    *
    from source_data

{% if is_incremental() %}
    where
    -- If the my_date variable is provided, use this path (via the dbt run --vars '{"my_date": "\"2024-06-03\""}' command). If the my_date variable is not provided (directly using dbt run), use the day before the current date. For the incremental selection here, it is recommended to directly use doris's CURDATE() function, which is also a common path in production environments.
    create_time = {{ var('my_date' , 'DATE_SUB(CURDATE(), INTERVAL 1 DAY)') }} 

{% endif %}
```
### バッチ日付設定パラメータサンプルリファレンス

```sql
{{ config(
    materialized='incremental', 
    partition_by = 'create_time',
    partition_type = 'range',
    ...
)}}

with source_data as (
    select
        *
    from {{ ref('sell_order2') }}
)

select
    *
    from source_data

{% if is_incremental() %}
    where
    -- If the my_date variable is provided, use this path (via the dbt run --vars '{"my_date": "\"2024-06-03\""}' command). If the my_date variable is not provided (directly using dbt run), use the day before the current date. For the incremental selection here, it is recommended to directly use doris's CURDATE() function, which is also a common path in production environments.
    create_time = {{ var('my_date' , 'DATE_SUB(CURDATE(), INTERVAL 1 DAY)') }} 

{% endif %}
```
