---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following the strict rules you've outlined. However, I don't see the actual text content to translate after \"Text:\" - it only shows \"USER\" at the end.\n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "Dorisが接続している現在のユーザー名とIPを取得します。",
  "language": "ja"
}
---
## 説明

Dorisが接続している現在のユーザー名とIPを取得します。

## 構文

```sql
USER()
```
## 戻り値

Dorisが接続している現在のユーザー名とIPを返します。
形式:`<user_name>@<ip>`

## 例

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
