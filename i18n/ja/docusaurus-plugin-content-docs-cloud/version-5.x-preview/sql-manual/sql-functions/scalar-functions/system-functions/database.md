---
{
  "title": "データベース",
  "description": "現在のsqlクライアント接続のデータベースを取得します。",
  "language": "ja"
}
---
## Description

現在のsqlクライアント接続のデータベースを取得します。

## Alias

- SCHEMA

## Syntax

```sql
DATABASE()
```
または

```sql
SCHEMA()
```
## Return Value

現在のsqlクライアントに接続されているデータベースの名前。

## Examples

```sql
select database(),schema();
```
```text
+------------+------------+
| database() | database() |
+------------+------------+
| test       | test       |
+------------+------------+
```
