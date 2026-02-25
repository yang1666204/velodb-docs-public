---
{
  "title": "SHOW PARTITION ID",
  "description": "この文は、パーティションIDに基づいて対応するデータベース名、テーブル名、およびパーティション名を見つけるために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、パーティションIDに基づいて対応するデータベース名、テーブル名、およびパーティション名を検索するために使用されます。

## 構文

```sql
SHOW PARTITION <partition_id>
```
## 必須パラメータ

**1. `<partition_id>`**

> partition id

## アクセス制御要件

このSQLを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege                  | Object | Notes |
|---------------------|----|----|
| ADMIN_PRIV |    |    |

## 例

1. partition IDに基づいて、対応するデータベース名、テーブル名、パーティション名を見つける場合。

    ```sql
    SHOW PARTITION 10002;
    ```
