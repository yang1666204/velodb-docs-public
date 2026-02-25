---
{
  "title": "I understand the instructions for translating technical documentation from English to Japanese while preserving code, commands, and technical identifiers. However, I don't see any actual text to translate after \"Text:\" - it only shows \"USER\" which appears to be a placeholder or system identifier.\n\nCould you please provide the specific English technical documentation text that you'd like me to translate into Japanese?",
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

Dorisが接続されている現在のユーザー名とIPを返します。
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
