---
{
  "title": "CANCEL RESTORE",
  "description": "このステートメントは、実行中のRESTOREタスクをキャンセルするために使用されます。",
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

復旧タスクが属するデータベースの名前。

## Usage Notes

- COMMITまたは復旧の後期段階でキャンセルが行われた場合、復旧中のテーブルにアクセスできなくなる可能性があります。この場合、復旧ジョブを再度実行することによってのみデータ復旧を実行できます。

## Example

1. example_db配下のRESTOREタスクをキャンセルする。

```sql
CANCEL RESTORE FROM example_db;
```
