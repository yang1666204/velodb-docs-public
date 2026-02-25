---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following your specified requirements. However, I don't see the actual text that needs to be translated. The text ends with \"USER\" which appears to be incomplete.\n\nCould you please provide the complete English text that you'd like me to translate?",
  "description": "Dorisが接続している現在のユーザー名とIPを取得します。",
  "language": "ja"
}
---
## Description

Dorisが接続している現在のユーザー名とIPを取得します。

## Syntax

```sql
USER()
```
## 戻り値

Dorisが接続している現在のユーザー名とIPを返します。
format:`<user_name>@<ip>`

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
