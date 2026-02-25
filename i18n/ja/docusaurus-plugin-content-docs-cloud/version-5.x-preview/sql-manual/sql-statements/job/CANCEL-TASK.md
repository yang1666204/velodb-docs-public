---
{
  "title": "タスクをキャンセル",
  "description": "CREATE JOB文によって作成された実行中のタスクをキャンセルします。",
  "language": "ja"
}
---
## Description

CREATE JOB文によって作成された実行中のタスクをキャンセルします。

- タスクはCREATE JOB文によって作成されたものである必要があります。
- 実行中のタスクである必要があります。
- この機能はバージョン2.1.0からサポートされています。

## Syntax

```sql
CANCEL TASK WHERE jobName = '<job_name>' AND taskId = '<task_id>';
```
## Required Parameters

**<job_name>**

> ジョブ名です。文字列型です。

**<task_id>**

> タスクIDです。整数型です。tasksテーブル値関数を通して照会できます。例：SELECT * FROM tasks('type'='insert')。詳細については、「taskテーブル値関数」を参照してください。

## Access Control Requirements

このSQLコマンドを実行するユーザーは、少なくともADMIN_PRIV権限を持っている必要があります。

## Examples

jobName 'example' およびtaskId 378912のバックグラウンドタスクをキャンセルします。

```sql
CANCEL TASK WHERE jobName='example' AND taskId=378912
```
