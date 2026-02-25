---
{
  "title": "SHOW SYNC JOB",
  "description": "この文は、すべてのデータベースにおけるresident data synchronizationジョブのステータスを表示します。",
  "language": "ja"
}
---
## Description

このステートメントは、すべてのデータベースにおける常駐データ同期ジョブのステータスを表示します。

## Syntax

```sql
SHOW SYNC JOB [FROM <db_name>]
```
## オプション パラメータ

**1. `<db_name>`**
> `<db_name>`はデータベース名を表し、同期ジョブの情報を表示する対象のデータベースを指定するために使用されます。

## アクセス制御要件  
このSQLコマンドを実行するユーザーは、以下の権限のうち少なくとも1つを持っている必要があります：  

| 権限                                                                 | オブジェクト          | 備考                                   |  
| :------------------------------------------------------------------------ | :------------- | :------------------------------------- |  
| ADMIN_PRIV, SELECT_PRIV, LOAD_PRIV, ALTER_PRIV, CREATE_PRIV, DROP_PRIV, SHOW_VIEW_PRIV | Database `db_name` | この操作には、対象データベースに対して一覧表示された権限のうち少なくとも1つが必要です。 |  

## 例

1. 現在のデータベース内のすべてのデータ同期ジョブのステータスを表示します。

    ```sql
    SHOW SYNC JOB;
    ```
2. `test_db`データベース内のすべてのデータ同期ジョブのステータスを表示します。

    ```sql
    SHOW SYNC JOB FROM `test_db`;
    ```
