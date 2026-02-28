---
{
  "title": "TRUNCATE コマンドによるデータの削除",
  "description": "指定されたTableとそのパーティションからデータをクリアするには、このステートメントを使用します。",
  "language": "ja"
}
---
# Truncate

指定されたTableとそのパーティションからデータを削除するには、このステートメントを使用します。

## Syntax

```sql
TRUNCATE TABLE [db.]tbl [PARTITION(p1, p2, ...)];
```
- このステートメントはデータをクリアしますが、Tableまたはパーティション構造は保持されます。

- DELETEとは異なり、TRUNCATEはメタデータ操作のみを実行するため、より高速でクエリパフォーマンスに影響しません。

- この操作で削除されたデータは復旧できません。

- TableステータスはNORMALである必要があり、実行中のSCHEMA CHANGE操作がないことが条件です。

- このコマンドは実行中のインポートタスクを失敗させる可能性があります。

## Examples

**1. `example_db`データベースの`tbl`Tableをクリアする**

```sql
TRUNCATE TABLE example_db.tbl;
```
**2. Table `tbl` の `p1` と `p2` パーティションをクリアする**

```sql
TRUNCATE TABLE tbl PARTITION(p1, p2);
```
