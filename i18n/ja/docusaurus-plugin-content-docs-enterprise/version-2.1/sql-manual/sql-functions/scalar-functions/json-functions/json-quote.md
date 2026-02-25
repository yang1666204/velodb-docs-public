---
{
  "title": "I'm ready to translate the English technical documentation text into Japanese following your specified requirements. However, I don't see any text after \"JSON_QUOTE\" in your message. Could you please provide the actual English text that you'd like me to translate?",
  "description": "jsonvalueを二重引用符（\"）で囲み、含まれている特殊文字をエスケープしてください。",
  "language": "ja"
}
---
## Description
json_value を二重引用符 (") で囲み、含まれる特殊文字をエスケープします。

## Syntax

```sql
JSON_QUOTE (<a>)
```
## Parameters

| Parameter | Description                                       |
|-----------|------------------------------------------|
| `<a>`     | 囲まれるjson_valueの値。   |


## Return Values
json_valueを返します。特別なケースは以下の通りです：
* 渡されたパラメータがNULLの場合、NULLを返します。

### Examples

```sql
SELECT json_quote('null'), json_quote('"null"');
```
```text
+--------------------+----------------------+
| json_quote('null') | json_quote('"null"') |
+--------------------+----------------------+
| "null"             | "\"null\""           |
+--------------------+----------------------+
```
```sql
SELECT json_quote('[1, 2, 3]');
```
```text
+-------------------------+
| json_quote('[1, 2, 3]') |
+-------------------------+
| "[1, 2, 3]"             |
+-------------------------+
```
```sql
SELECT json_quote(null);
```
```text
+------------------+
| json_quote(null) |
+------------------+
| NULL             |
+------------------+
```
```sql
select json_quote("\n\b\r\t");
```
```text
+------------------------+
| json_quote('\n\b\r\t') |
+------------------------+
| "\n\b\r\t"             |
+------------------------+
```
