---
{
  "title": "CURRENT_CATALOG",
  "description": "現在のsqlクライアント接続のカタログを取得します。",
  "language": "ja"
}
---
## Description

現在のsqlクライアント接続のカタログを取得します。

## Syntax

```sql
CURRENT_CATALOG()
```
## 戻り値

現在のsqlクライアント接続のカタログ名。

## 例

```sql
select current_catalog();
```
```text
+-------------------+
| current_catalog() |
+-------------------+
| internal          |
+-------------------+
```
