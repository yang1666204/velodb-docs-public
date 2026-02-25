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
> 削除するタスクの`<job_name>`。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| Privilege | Object | Notes |
|:--------------|:-----------|:------------------------|
| ADMIN_PRIV | Database | 現在この操作を実行するには**ADMIN**権限のみサポートされています |

## 例

- exampleという名前のジョブを削除する。

    ```sql
    DROP JOB where jobName='example';
    ```
