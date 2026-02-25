---
{
  "title": "JOBの再開",
  "description": "一時停止状態のジョブを実行中状態に復元します。実行中のジョブは、スケジュールされた周期に従って実行されます。",
  "language": "ja"
}
---
## Description

PAUSEDジョブをRUNNING状態に復元します。RUNNINGジョブはスケジュールされた期間に従って実行されます。

## Syntax

```sql
RESUME JOB where jobName = <job_name> ;
```
## 必須パラメータ

**1. `<job_name>`**
> リカバリタスクの `<job_name>`。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| 権限 | オブジェクト | 備考 |
|:--------------|:-----------|:------------------------|
| ADMIN_PRIV | Database | 現在、この操作を実行するには **ADMIN** 権限のみサポートされています |

## 例

- exampleという名前のジョブを再開する。

   ```sql
   RESUME JOB where jobName= 'example';
   ```
