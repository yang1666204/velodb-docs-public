---
{
  "title": "CLEAN ALL QUERY STATS",
  "description": "この文は、クエリ統計をクリアするために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントはクエリ統計をクリアするために使用されます

## Syntax

```sql
CLEAN [ { ALL| DATABASE | TABLE } ] QUERY STATS [ { [ FOR <db_name>] | [ { FROM | IN } ] <table_name>]];
```
## 必要なパラメータ

**1. `ALL`**

> すべてのクエリ統計をクリアするためにALLを使用します

**2. `DATABASE`**

> データベースのクエリ統計をクリアするためにDATABASEを使用します

**3. `TABLE`**

> テーブルのクエリ統計をクリアするためにTABLEを使用します

## オプションパラメータ

**1. `<db_name>`**

> このパラメータが設定されている場合、対応するデータベースの統計がクリアされます

**2. `<table_name>`**

> このパラメータが設定されている場合、対応するテーブルの統計がクリアされます


## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| 権限    | オブジェクト   | 備考                 |
|:-------------|:---------|:--------------------------|
| ADMIN_PRIV        | ALL      | ALLが指定されている場合、ADMIN権限が必要です     |
| ALTER_PRIV        | DATABASE | データベースが指定されている場合、対応するデータベースのALTER権限が必要です |
| ADMIN_PRIV        | TABLE    | テーブルを指定する場合、そのテーブルのalter権限が必要です     |


## 例

```sql
clean all query stats
```
```sql
clean database query stats for test_query_db
```
```sql
clean table query stats from test_query_db.baseall
```
