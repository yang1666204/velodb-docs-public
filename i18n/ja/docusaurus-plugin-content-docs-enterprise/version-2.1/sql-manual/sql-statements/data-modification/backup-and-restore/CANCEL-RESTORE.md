---
{
  "title": "キャンセル復元",
  "description": "この文は実行中のRESTOREタスクをキャンセルするために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、実行中のRESTOREタスクをキャンセルするために使用されます。

## Syntax

```sql
CANCEL RESTORE FROM <db_name>;
```
## パラメータ

**1.`<db_name>`**

リカバリタスクが属するデータベースの名前。

## 使用上の注意

- キャンセルがCOMMITまたはリカバリのそれ以降の段階で行われた場合、リカバリ中のテーブルにアクセスできなくなる可能性があります。この場合、データリカバリはリカバリジョブを再度実行することによってのみ実行できます。

## 例

1. example_db配下のRESTOREタスクをキャンセルします。

```sql
CANCEL RESTORE FROM example_db;
```
