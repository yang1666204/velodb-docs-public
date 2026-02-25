---
{
  "title": "JOBの再開",
  "description": "PAUSED状態のジョブをRUNNING状態に復元します。RUNNING状態のジョブは、スケジュールされた期間に従って実行されます。",
  "language": "ja"
}
---
## 説明

PAUSED状態のジョブをRUNNING状態に復元します。RUNNING状態のジョブは、スケジュールされた期間に従って実行されます。

## 構文

```sql
RESUME JOB where jobName = <job_name> ;
```
## 必須パラメータ

**1. `<job_name>`**
> リカバリタスクの`<job_name>`。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | ExecuteType | Notes |
|:--------------|:-----------|:------------------------|:------------------------|
| ADMIN_PRIV | Database | NO Streaming | 現在この操作を実行するには**ADMIN**権限のみをサポートしています |
| LOAD_PRIV | Database | Streaming | この操作を実行するために**LOAD**権限をサポートしています |

## 例

- exampleという名前のジョブを再開する。

   ```sql
   RESUME JOB where jobName= 'example';
   ```
