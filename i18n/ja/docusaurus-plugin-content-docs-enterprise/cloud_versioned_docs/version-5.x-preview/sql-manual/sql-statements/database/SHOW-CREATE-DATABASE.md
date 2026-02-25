---
{
  "title": "SHOW CREATE DATABASE",
  "description": "この文は、doris組み込みデータベースまたはカタログデータベースの作成情報を確認します。",
  "language": "ja"
}
---
## Description

このステートメントは、doris組み込みデータベースまたはcatalogデータベースの作成情報を確認します。

## Syntax

```sql
SHOW CREATE DATABASE [<catalog>.]<db_name>;
```
## 必須パラメータ

** 1. `<db_name>`**
>  データベース名

## オプションパラメータ

** 1. `<catalog>`**
>  テーブルが内部か外部かを示す

## 戻り値

| Column | Description |
|:---------|:-----------|
| Database | データベース名 |
| Create Database | 対応するデータベース作成文 |

## 権限制御

このSQLコマンドを実行するユーザーは、最低限以下の権限を持っている必要があります：

| Permissions         | Object    | Notes             |
|:-----------|:------|:---------------|
| SELECT_PRIV | 対応するデータベース | 対応するデータベースに対する読み取り権限が必要 |

## 例

- dorisでtestデータベースの作成を表示する

   ```sql
   SHOW CREATE DATABASE test;
   ```
   ```text
   +----------+------------------------+
   | Database | Create Database        |
   +----------+------------------------+
   | test     | CREATE DATABASE `test` |
   +----------+------------------------+
   ```
- hive カタログ内のデータベース hdfs_text の作成情報を表示する

   ```sql
   SHOW CREATE DATABASE hdfs_text;
   ```
   ```text
   +-----------+------------------------------------------------------------------------------------+                         
   | Database  | Create Database                                                                    |                         
   +-----------+------------------------------------------------------------------------------------+                         
   | hdfs_text | CREATE DATABASE `hdfs_text` LOCATION 'hdfs://HDFS1009138/hive/warehouse/hdfs_text' |                         
   +-----------+------------------------------------------------------------------------------------+  
   ```
