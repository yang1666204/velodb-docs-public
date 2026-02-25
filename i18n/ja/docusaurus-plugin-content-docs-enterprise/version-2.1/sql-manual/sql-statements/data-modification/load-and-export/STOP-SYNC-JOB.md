---
{
  "title": "SYNC JOBを停止",
  "description": "データベース内で実行中の常駐データ同期ジョブを、そのjobname を指定して停止します。停止後、",
  "language": "ja"
}
---
## Description

`job_name`を指定して、データベース内で実行中の常駐データ同期ジョブを停止します。停止すると、ジョブはデータの同期を停止し、占有していたリソースを解放します。

## Syntax

```sql
STOP SYNC JOB [<db>.]<job_name>
```
## Required Parameters

**1. `<job_name>`**

> 停止するデータ同期ジョブの名前を指定します。

## Optional Parameters
**1. `<db>`**
> `[<db>.]`プレフィックスを使用してデータベースが指定された場合、ジョブはそのデータベース内で検索されます。指定されていない場合は、現在のデータベースが使用されます。


## Access Control Requirements  

任意のユーザーまたはロールがこの操作を実行できます。


## Example

1. `job_name`という名前のデータ同期ジョブを停止します。

   ```sql
   STOP SYNC JOB `job_name`;
   ```
