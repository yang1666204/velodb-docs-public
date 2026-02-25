---
{
  "title": "SHOW SNAPSHOT",
  "description": "この文は、リポジトリに既に存在するバックアップを表示するために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、リポジトリに既に存在するバックアップを表示するために使用されます。

## Syntax

```sql
SHOW SNAPSHOT ON `<repo_name>`
[WHERE SNAPSHOT = "<snapshot_name>" [AND TIMESTAMP = "<backup_timestamp>"]];
```
## Parameters

**1.`<repo_name>`**

選択したリポジトリ名をバックアップします。

**2.`<snapshot_name>`**

バックアップ名。

**3.`<backup_timestamp>`**

バックアップタイムスタンプ。

## Return Value

| Column | Description |
| -- | -- |
| Snapshot | バックアップの名前 |
| Timestamp | バックアップの時刻バージョンに対応 |
| Status | バックアップの時刻バージョンに対応 |
| Database | バックアップデータが元々属していたデータベースの名前 |
| Details | Json形式で、バックアップ全体のデータディレクトリとファイル構造を表示 |

## Example

1. リポジトリexample_repoの既存のバックアップを表示

```sql
SHOW SNAPSHOT ON example_repo;
```
2. リポジトリ example_repo 内の backup1 という名前のバックアップのみを表示する：

```sql
SHOW SNAPSHOT ON example_repo WHERE SNAPSHOT = "backup1";
```
3. warehouse example_repo内のbackup1という名前のバックアップの詳細を、時刻バージョン"2018-05-05-15-34-26"で表示する：

```sql
SHOW SNAPSHOT ON example_repo WHERE SNAPSHOT = "backup1" AND TIMESTAMP = "2018-05-05-15-34-26";
```
