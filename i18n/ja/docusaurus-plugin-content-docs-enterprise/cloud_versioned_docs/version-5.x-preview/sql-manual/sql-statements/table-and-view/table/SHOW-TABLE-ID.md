---
{
  "title": "SHOW TABLE ID",
  "description": "このステートメントは、テーブルIDに基づいて対応するデータベース名とテーブル名を検索するために使用されます。",
  "language": "ja"
}
---
### 説明

このステートメントは、table idに基づいて対応するデータベース名、テーブル名を検索するために使用されます。

## 構文

```sql
SHOW TABLE <table_id>
```
## 必須パラメータ

**1. `<table_id>`**
> データベース名、テーブル名テーブルの`<table_id>`を検索する必要があります。

## 戻り値

| Column name (Column) | Type (DataType) | Notes (Notes) |
|:--------------------|:-------------|:----------|
| DbName | String | データベース名 |
| TableName | String | テーブル名 |
| DbId | String | データベースID |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege (Privilege) | Object (Object) | Notes (Notes) |
|:--------------|:-----------|:------------------------|
| ADMIN_PRIV | Table (table) | 現在、この操作を実行するには**ADMIN**権限のみをサポートしています |

## 例

- table idに応じて、対応するデータベース名、テーブル名を検索

   ```sql
   SHOW TABLE 2261121
   ```
   ```text
   +--------+------------+---------+
   | DbName | TableName  | DbId    |
   +--------+------------+---------+
   | demo   | test_table | 2261034 |
   +--------+------------+---------+
   ```
