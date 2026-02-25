---
{
  "title": "バックアップ",
  "description": "この文は指定されたデータベース配下のデータをバックアップするために使用されます。このコマンドは非同期操作です。",
  "language": "ja"
}
---
## Description

このステートメントは、指定されたデータベース配下のデータをバックアップするために使用されます。このコマンドは非同期操作です。送信が成功した後、[SHOW BACKUP](./SHOW-BACKUP.md)コマンドを通じて進捗を確認する必要があります。

## Syntax

```sql
BACKUP SNAPSHOT [<db_name>.]<snapshot_name>
TO `<repository_name>`
[ { ON | EXCLUDE } ]
    ( <table_name> [ PARTITION ( <partition_name> [, ...] ) ]
    [, ...] ) ]

[ PROPERTIES ( "<key>" = "<value>" [ , ... ] )]
```
## 必須パラメータ

**1.`<db_name>`**

バックアップ対象のデータが属するデータベースの名前。

**2.`<snapshot_name>`**

データスナップショット名を指定します。スナップショット名は重複できず、グローバルに一意である必要があります。

**3.`<repository_name>`**

ウェアハウス名。[CREATE REPOSITORY](./CREATE-REPOSITORY.md)でリポジトリを作成できます。

## オプションパラメータ

**1.`<table_name>`**

バックアップ対象のテーブル名。指定しない場合、データベース全体がバックアップされます。

- ON句は、バックアップが必要なテーブルとパーティションを識別します。パーティションが指定されていない場合、デフォルトでテーブルのすべてのパーティションがバックアップされます
- バックアップが不要なテーブルとパーティションはEXCLUDE句で識別されます。指定されたテーブルまたはパーティションを除く、このデータベース内のすべてのテーブルのすべてのパーティションデータをバックアップします。

**2.`<partition_name>`**

バックアップ対象のパーティション名。指定しない場合、対応するテーブルのすべてのパーティションがバックアップされます。

**3.`[ PROPERTIES ( "<key>" = "<value>" [ , ... ] ) ]`**

データスナップショット属性。形式：`<key>` = `<value>`。現在、以下のプロパティをサポートしています：

- "type" = "full": これが完全更新であることを示します（デフォルト）
- "timeout" = "3600": タスクのタイムアウト期間。デフォルトは1日。秒単位。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：
| 権限     | オブジェクト    | 備考 |
|:--------------|:----------|:------|
| LOAD_PRIV    | USER or ROLE    | この操作はLOAD_PRIV権限を持つユーザーまたはロールのみが実行できます  |

## 使用上の注意

- OLAP型のテーブルのバックアップのみサポートされています。
- 同一データベース配下では、一度に実行できるバックアップ操作は1つのみです。
- バックアップ操作は、指定されたテーブルまたはパーティションの基底テーブルと同期マテリアライズドビューをバックアップし、1つのレプリカのみがバックアップされます。非同期マテリアライズドビューはサポートされていません。
- バックアップ操作の効率：バックアップ操作の効率は、データ量、Compute Nodeの数、ファイル数に依存します。バックアップデータシャードが配置されている各Compute Nodeは、バックアップ操作のアップロードフェーズに参加します。ノード数が多いほど、アップロード効率が高くなります。ファイルデータ量は、シャード数と各シャード内のファイル数のみを指します。シャード数が多い場合、またはシャード内に小さなファイルが多数ある場合、バックアップ操作時間が増加する可能性があります。

## 例

1. example_db配下のテーブルexample_tblをウェアハウスexample_repoに完全バックアップ：

```sql
BACKUP SNAPSHOT example_db.snapshot_label1
TO example_repo
ON (example_tbl)
PROPERTIES ("type" = "full");
```
2. フルバックアップの下で、example_dbのテーブルexample_tblのp1、p2パーティション、およびテーブルexample_tbl2をウェアハウスexample_repoに：

```sql
BACKUP SNAPSHOT example_db.snapshot_label2
TO example_repo
ON
(
    example_tbl PARTITION (p1,p2),
    example_tbl2
);
```
3. example_db配下のテーブルexample_tblを除く、すべてのテーブルの完全バックアップをウェアハウスexample_repoに実行する場合：

```sql
BACKUP SNAPSHOT example_db.snapshot_label3
TO example_repo
EXCLUDE (example_tbl);
```
4. example_db 配下のテーブルを example_repo リポジトリに完全にバックアップする：

```sql
BACKUP SNAPSHOT example_db.snapshot_label3
TO example_repo;
```
