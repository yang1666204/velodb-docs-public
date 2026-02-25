---
{
  "title": "RESUME SYNC JOB",
  "description": "データベース内でjobname によって中断されているresident data synchronizationジョブを再開します。再開されると、",
  "language": "ja"
}
---
## 説明

データベース内で中断されている常駐データ同期ジョブを`job_name`によって再開します。再開されると、ジョブは中断前の最新の位置から継続してデータの同期を行います。

## 構文

```sql
RESUME SYNC JOB [<db>.]<job_name>
```
## Required Parameters

**1. `<job_name>`**

> 再開するデータ同期ジョブの名前を指定します。

## Optional Parameters
**1. `<db>`**
> `[<db>.]`プレフィックスを使用してデータベースが指定された場合、ジョブはそのデータベースで検索されます。そうでない場合は、現在のデータベースが使用されます。

## Access Control Requirements

任意のユーザーまたはロールがこの操作を実行できます。

## Examples

1. `job_name`という名前のデータ同期ジョブを再開します。

   ```sql
   RESUME SYNC JOB `job_name`;
   ```
