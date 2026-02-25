---
{
  "title": "DROP JOB",
  "description": "ユーザーがJOBジョブを削除します。ジョブは即座に停止され、削除されます。",
  "language": "ja"
}
---
## Description

ユーザーはJOBジョブを削除します。ジョブは即座に停止され、削除されます。

## Syntax

```sql
DROP JOB where jobName = <job_name> ;
```
## 必須パラメータ

**1. `<job_name>`**
> 削除対象のタスクの`<job_name>`。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | ExecuteType | Notes |
|:--------------|:-----------|:------------------------|:------------------------|
| ADMIN_PRIV | Database | NO Streaming | 現在この操作を実行するには**ADMIN**権限のみをサポートしています |
| LOAD_PRIV | Database | Streaming |この操作を実行するために**LOAD**権限をサポートしています |

## 例

- exampleという名前のjobを削除する。

    ```sql
    DROP JOB where jobName='example';
    ```
