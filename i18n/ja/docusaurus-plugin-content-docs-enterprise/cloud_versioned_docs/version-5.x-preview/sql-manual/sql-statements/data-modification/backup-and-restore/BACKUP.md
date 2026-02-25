---
{
  "title": "BACKUP",
  "description": "この文は、指定されたデータベース配下のデータをバックアップするために使用されます。このコマンドは非同期操作です。",
  "language": "ja"
}
---
## 説明

このステートメントは、指定されたデータベース下のデータをバックアップするために使用されます。このコマンドは非同期操作です。送信が成功した後、[SHOW BACKUP](./SHOW-BACKUP.md) コマンドを通じて進行状況を確認する必要があります。

## 構文

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

バックアップするデータが属するデータベースの名前。

**2.`<snapshot_name>`**

データスナップショット名を指定します。スナップショット名は重複できず、グローバルに一意である必要があります。

**3.`<repository_name>`**

リポジトリ名。[CREATE REPOSITORY](./CREATE-REPOSITORY.md)でリポジトリを作成できます。

## オプションパラメータ

**1.`<table_name>`**

バックアップするテーブルの名前。指定しない場合、データベース全体がバックアップされます。

- ON句は、バックアップが必要なテーブルとパーティションを識別します。パーティションが指定されていない場合、デフォルトでテーブルのすべてのパーティションがバックアップされます
- バックアップが不要なテーブルとパーティションは、EXCLUDE句で識別されます。指定されたテーブルまたはパーティションを除く、このデータベース内のすべてのテーブルのすべてのパーティションデータをバックアップします。

**2.`<partition_name>`**

バックアップするパーティションの名前。指定しない場合、対応するテーブルのすべてのパーティションがバックアップされます。

**3.`[ PROPERTIES ( "<key>" = "<value>" [ , ... ] ) ]`**

データスナップショット属性、形式：`<key>` = `<value>`。現在以下のプロパティをサポートしています：

- "type" = "full": これがフル更新であることを示します（デフォルト）
- "timeout" = "3600": タスクタイムアウト期間、デフォルトは1日。単位は秒。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：
| 権限     | オブジェクト    | 注記 |
|:--------------|:----------|:------|
| LOAD_PRIV    | USER or ROLE    | この操作はLOAD_PRIV権限を持つユーザーまたはロールのみが実行できます  |

## 使用上の注意

- OLAP タイプのテーブルのバックアップのみサポートされています。
- 同一データベース下では、一度に一つのバックアップ操作のみ実行できます。
- バックアップ操作では、指定されたテーブルまたはパーティションの基底テーブルと[同期マテリアライズドビュー](../../../../query-acceleration/materialized-view/sync-materialized-view.md)がバックアップされ、一つのレプリカのみがバックアップされます。[非同期マテリアライズドビュー](../../../../query-acceleration/materialized-view/async-materialized-view/overview.md)はサポートされていません。
- バックアップ操作の効率性：バックアップ操作の効率性は、データ量、Compute Nodeの数、ファイル数に依存します。バックアップデータシャードが配置されている各Compute Nodeは、バックアップ操作のアップロードフェーズに参加します。ノード数が多いほど、アップロード効率は高くなります。ファイルデータ量はシャード数と各シャード内のファイル数のみを指します。シャードが多い場合、またはシャード内に小さなファイルが多い場合、バックアップ操作時間が増加する可能性があります。

## 例

1. example_db下のテーブルexample_tblをリポジトリexample_repoに完全バックアップする：

```sql
BACKUP SNAPSHOT example_db.snapshot_label1
TO example_repo
ON (example_tbl)
PROPERTIES ("type" = "full");
```
2. 完全バックアップの下で、example_db、テーブル example_tbl の p1、p2 パーティション、およびテーブル example_tbl2 をウェアハウス example_repo に：

```sql
BACKUP SNAPSHOT example_db.snapshot_label2
TO example_repo
ON
(
    example_tbl PARTITION (p1,p2),
    example_tbl2
);
```
3. example_db下のexample_tblテーブルを除く全テーブルのフルバックアップをwarehouse example_repoに実行:

```sql
BACKUP SNAPSHOT example_db.snapshot_label3
TO example_repo
EXCLUDE (example_tbl);
```
4. example_db 下のテーブルを example_repo リポジトリに完全バックアップする：

```sql
BACKUP SNAPSHOT example_db.snapshot_label3
TO example_repo;
```
