---
{
  "title": "データベースを作成",
  "description": "この文は新しいデータベースを作成するために使用されます",
  "language": "ja"
}
---
## 説明

この文は新しいデータベースを作成するために使用されます

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

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| 権限         | オブジェクト    | 備考             |
|:-----------|:------|:---------------|
| CREATE_PRIV | 対応するデータベース | 対応するデータベースに対する作成権限が必要です |


## 注意事項

dbの下のテーブルに対してデフォルトのレプリカ配置戦略を指定したい場合は、`<replication_allocation>`を指定する必要があります（tableの`<replication_allocation>`属性はdbよりも優先度が高くなります）：

  ```sql
  PROPERTIES (
    "replication_allocation" = "tag.location.default:3"
  )
  ```
dbの下のテーブルに対してデフォルトのStorage Vaultを指定したい場合、`<storage_vault_name>`を指定する必要があります（テーブルの`<storage_vault_name>`属性はdbよりも高い優先度を持ちます）：

  ```sql
  PROPERTIES (
    "storage_vault_name" = "hdfs_demo_vault"
  )
  ```
:::info Note

`storage_vault_name`のdbへの設定は、バージョン3.0.5以降でサポートされています

:::

## 例

- 新しいデータベースdb_testを作成する

   ```sql
   CREATE DATABASE db_test;
   ```
- 新しいデータベースを作成し、デフォルトのレプリカ配布を設定する：

   ```sql
   CREATE DATABASE `db_test`
   PROPERTIES (
   	"replication_allocation" = "tag.location.group_1:3"
   );
   ```
- 新しいデータベースを作成し、デフォルトのStorage Vaultを設定する：

   ```sql
   CREATE DATABASE `db_test`
   PROPERTIES (
   	"storage_vault_name" = "hdfs_demo_vault"
   );
   ```
