---
{
  "title": "CREATE DATABASE",
  "description": "この文は新しいデータベースを作成するために使用されます",
  "language": "ja"
}
---
## 説明

このステートメントは新しいデータベースを作成するために使用されます

## 構文

```sql
CREATE DATABASE [IF NOT EXISTS] <db_name>
    [PROPERTIES ("<key>"="<value>"[, ... ])];
```
## 必須パラメータ

** 1. `<db_name>`**
>  データベース名

## オプションパラメータ

** 1. `<PROPERTIES>`**
>  このデータベースに関する追加情報

## 権限制御

このSQLコマンドを実行するユーザーは、最低限以下の権限を持っている必要があります：

| 権限         | オブジェクト    | 備考             |
|:-----------|:------|:---------------|
| CREATE_PRIV | 対応するデータベース | 対応するデータベースに対する作成権限が必要です |


## 注意事項

db配下のTableに対してデフォルトのレプリカ配布戦略を指定したい場合は、`<replication_allocation>`を指定する必要があります（tableの`<replication_allocation>`属性はdbよりも高い優先度を持ちます）：

  ```sql
  PROPERTIES (
    "replication_allocation" = "tag.location.default:3"
  )
  ```
## Example

- 新しいデータベース db_test を作成する

   ```sql
   CREATE DATABASE db_test;
   ```
- 新しいデータベースを作成し、デフォルトのレプリカ配布を設定します：

   ```sql
   CREATE DATABASE `db_test`
   PROPERTIES (
   	"replication_allocation" = "tag.location.group_1:3"
   );
   ```
