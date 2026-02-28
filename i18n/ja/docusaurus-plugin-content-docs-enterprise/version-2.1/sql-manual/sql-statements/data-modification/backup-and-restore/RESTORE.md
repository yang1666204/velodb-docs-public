---
{
  "title": "RESTORE",
  "description": "このステートメントは、BACKUPコマンドでバックアップされたデータを指定されたデータベースに復元するために使用されます。このコマンドは非同期操作です。",
  "language": "ja"
}
---
## 説明

このステートメントは、BACKUPコマンドによってバックアップされたデータを指定されたデータベースに復元するために使用されます。このコマンドは非同期操作です。送信が成功した後、[SHOW RESTORE](./SHOW-RESTORE.md)コマンドを通じて進行状況を確認する必要があります。

## 構文

```sql
RESTORE SNAPSHOT [<db_name>.]<snapshot_name>
FROM `<repository_name>`
[ { ON | EXCLUDE } ] (
    `<table_name>` [PARTITION (`<partition_name>`, ...)] [AS `<table_alias>`]
    [, ...] ) ]
)
[ PROPERTIES ( "<key>" = "<value>" [ , ... ] )]
```
## Required パラメータ

**1.`<db_name>`**

復元するデータが属するデータベースの名前

**2.`<snapshot_name>`**

データスナップショット名

**3.`<repository_name>`**

ウェアハウス名。[CREATE REPOSITORY](./CREATE-REPOSITORY.md)を使用してリポジトリを作成できます

**4.`[ PROPERTIES ( "<key>" = "<value>" [ , ... ] ) ]`**

復元操作の属性。形式は`<key>` = `<value>`です。現在、以下のプロパティをサポートしています：

- "backup_timestamp" = "2018-05-04-16-45-08": 復元する対応するバックアップの時間バージョンを指定します。必須です。この情報は`SHOW SNAPSHOT ON repo;`文で取得できます。
- "replication_num" = "3": 復元するTableまたはパーティションのレプリカ数を指定します。デフォルトは3です。既存のTableまたはパーティションを復元する場合、レプリカ数は既存のTableまたはパーティションのレプリカ数と同じである必要があります。同時に、複数のレプリカを格納するのに十分なホストが必要です。
- "reserve_replica" = "true": デフォルトはfalseです。このプロパティがtrueの場合、replication_numプロパティは無視され、復元されたTableまたはパーティションはバックアップ前と同じレプリケーション数になります。Table内の複数のTableまたは複数のパーティションで異なるレプリケーション数をサポートします。
- "reserve_dynamic_partition_enable" = "true": デフォルトはfalseです。このプロパティがtrueの場合、復元されたTableはバックアップ前と同じ'dynamic_partition_enable'の値を持ちます。このプロパティがtrueでない場合、復元されたTableは'dynamic_partition_enable=false'に設定されます。
- "timeout" = "3600": タスクのタイムアウト期間。デフォルトは1日です。秒単位です。
- "meta_version" = 40: 指定されたmeta_versionを使用して、以前にバックアップされたメタデータを読み取ります。このパラメータは一時的な解決策として使用され、古いバージョンのDorisでバックアップされたデータを復元する場合にのみ使用されることに注意してください。最新版のバックアップデータには既にmetaバージョンが含まれているため、指定する必要はありません。
- "clean_tables" : 復元対象に属さないTableをクリーンアップするかどうかを示します。例えば、復元前の対象dbにスナップショットにないTableが存在する場合、`clean_tables`を指定することで、これらの余分なTableを削除し、復元中にrecycle binに移動できます。
  - この機能はApache Doris 2.1.6バージョンからサポートされています
- "clean_partitions"：復元対象に属さないパーティションをクリーンアップするかどうかを示します。例えば、復元前の対象Tableにスナップショットにないパーティションが存在する場合、`clean_partitions`を指定することで、これらの余分なパーティションを削除し、復元中にrecycle binに移動できます。
  - この機能はApache Doris 2.1.6バージョンからサポートされています
- "atomic_restore"：データは最初に一時Tableにロードされ、その後元のTableがアトミックに置き換えられ、復旧プロセス中に対象Tableの読み書きが影響を受けないことを保証します。
- "force_replace"：Tableが存在し、バックアップTableとスキーマが異なる場合に強制的に置き換えます。
  - "force_replace"を有効にするには、"atomic_restore"を有効にする必要があることに注意してください

## Optional パラメータ

**1.`<table_name>`**

復元するTableの名前。指定されていない場合、データベース全体が復元されます。

- 復元が必要なTableとパーティションはON句で識別されます。パーティションが指定されていない場合、デフォルトでTableのすべてのパーティションが復元されます。指定されたTableとパーティションは、ウェアハウスバックアップに既に存在している必要があります。
- 復旧が不要なTableとパーティションはEXCLUDE句で識別されます。指定されたTableまたはパーティションを除く、ウェアハウス内の他のすべてのTableのすべてのパーティションが復元されます。

**2.`<partition_name>`**

復元するパーティションの名前。指定されていない場合、対応するTableのすべてのパーティションが復元されます。

**3.`<table_alias>`**

Tableエイリアス

## Access Control Requirements

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：
| Privilege     | Object    | 注釈 |
|:--------------|:----------|:------|
| LOAD_PRIV    | USER or ROLE    | この操作はLOAD_PRIV権限を持つユーザーまたはロールのみが実行できます  |

## Usage 注釈

- タイプOLAPのTableの復元のみサポートされています。
- 同じデータベース下では、実行中のBACKUPまたはRESTOREタスクは1つのみ存在できます。
- ウェアハウス内のバックアップされたTableを復元して、データベース内の同名の既存Tableを置き換えることができますが、2つのTableのTable構造が完全に同じであることを保証する必要があります。Table構造には、Table名、列、パーティション、Rollupなどが含まれます。
- 復旧Tableの一部のパーティションを指定でき、システムはパーティションRangeまたはListが一致するかどうかを確認します。
- ウェアハウスでバックアップされたTable名は、AS文を通じて新しいTableに復元できます。ただし、新しいTable名はデータベースに既に存在してはいけません。パーティション名は変更できません。
- 復旧操作の効率：同じクラスターサイズの場合、restore操作の時間消費は基本的にbackup操作の時間消費と同じです。復旧操作を高速化したい場合は、`replication_num`パラメータを設定して最初に1つのコピーのみを復元し、その後[ALTER TABLE PROPERTY](../../../../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-PROPERTY)でコピー数を調整してコピーを完了できます。

## Example

1. example_repoからbackup snapshot_1内のTablebackup_tblをデータベースexample_db1に復元します。時間バージョンは"2018-05-04-16-45-08"です。1つのコピーに復元します：

```sql
RESTORE SNAPSHOT example_db1.`snapshot_1`
FROM `example_repo`
ON ( `backup_tbl` )
PROPERTIES
(
    "backup_timestamp"="2018-05-04-16-45-08",
    "replication_num" = "1"
);
```
2. example_repo からバックアップ snapshot_2 内のTable backup_tbl のパーティション p1、p2、およびTable backup_tbl2 をデータベース example_db1 にリストアし、new_tbl にリネームします。タイムバージョンは "2018-05-04-17-11-01" です。デフォルトでは 3 レプリカに戻されます：

```sql
RESTORE SNAPSHOT example_db1.`snapshot_2`
FROM `example_repo`
ON
(
    `backup_tbl` PARTITION (`p1`, `p2`),
    `backup_tbl2` AS `new_tbl`
)
PROPERTIES
(
    "backup_timestamp"="2018-05-04-17-11-01"
);
```
3. example_repo から database example_db1 に backup snapshot_3 内の table backup_tbl を除くすべてのTableを復元します。時間バージョンは "2018-05-04-18-12-18" です。

```sql
RESTORE SNAPSHOT example_db1.`snapshot_3`
FROM `example_repo`
EXCLUDE ( `backup_tbl` )
PROPERTIES
(
    "backup_timestamp"="2018-05-04-18-12-18"
);
```
