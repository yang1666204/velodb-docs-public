---
{
  "title": "CANCEL RESTORE",
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
## Parameters

**1.`<db_name>`**

リカバリタスクが属するデータベースの名前。

## Usage Notes

- キャンセルがCOMITまたはリカバリのそれ以降の段階で行われた場合、リカバリ中のテーブルがアクセス不可能になる可能性があります。この場合、データリカバリはリカバリジョブを再度実行することによってのみ実行できます。

## Example

1. example_db配下のRESTOREタスクをキャンセルします。

```sql
CANCEL RESTORE FROM example_db;
```
