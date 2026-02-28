---
{
  "title": "RESUME ROUTINE LOAD",
  "description": "この構文は、一時停止されたRoutine Loadジョブの1つまたはすべてを再開するために使用されます。再開されたジョブは、以前に消費されたオフセットから消費を継続します。",
  "language": "ja"
}
---
## デスクリプション

この構文は、一時停止されたRoutine Loadジョブの1つまたはすべてを再開するために使用されます。再開されたジョブは、以前に消費されたオフセットから消費を継続します。

## Syntax

```sql
RESUME [ALL] ROUTINE LOAD FOR <job_name>
```
## 必須パラメータ

**1. `<job_name>`**

> 再開するジョブの名前を指定します。ALLが指定された場合、job_nameは必要ありません。

## オプションパラメータ

**1. `[ALL]`**

> オプションパラメータです。ALLが指定された場合、一時停止されているすべてのroutine loadジョブを再開することを示します。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| 権限 | オブジェクト | 注記 |
| :-------- | :----- | :---- |
| LOAD_PRIV | Table | SHOW ROUTINE LOADはTableに対するLOAD権限が必要です |

## 注意事項

- PAUSED状態のジョブのみ再開できます
- 再開されたジョブは最後に消費した位置からデータの消費を継続します
- ジョブが長時間一時停止されていた場合、Kafkaデータの有効期限切れにより再開が失敗する可能性があります

## 例

- test1という名前のroutine loadジョブを再開します。

   ```sql
   RESUME ROUTINE LOAD FOR test1;
   ```
- すべてのroutine loadジョブを再起動します。

   ```sql
   RESUME ALL ROUTINE LOAD;
   ```
