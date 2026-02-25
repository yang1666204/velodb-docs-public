---
{
  "title": "バックアップをキャンセル",
  "description": "この文は実行中のBACKUPタスクをキャンセルするために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは実行中のBACKUPタスクをキャンセルするために使用されます。

## 構文

```sql
CANCEL BACKUP FROM <db_name>;
```
## Parameters

**1.`<db_name>`**

バックアップタスクが属するデータベースの名前。

## Example

1. example_db配下のBACKUPタスクをキャンセルします。

```sql
CANCEL BACKUP FROM example_db;
```
