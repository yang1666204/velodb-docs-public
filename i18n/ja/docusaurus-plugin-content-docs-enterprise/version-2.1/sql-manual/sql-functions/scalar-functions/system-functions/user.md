---
{
  "title": "USER",
  "description": "Dorisが接続している現在のユーザー名とIPを取得します。",
  "language": "ja"
}
---
## 説明

Dorisが接続されているユーザーとIPの現在の情報を取得します。

## 構文

```sql
USER()
```
## Return Value

Dorisが接続している現在のユーザー名とIPを返します。
形式:`<user_name>@<ip>`

## Examples

```sql
select user();
```
```text
+---------------------+
| user()              |
+---------------------+
| 'root'@'10.244.2.5' |
+---------------------+
```
