---
{
  "title": "I understand the requirements for translating English technical documentation into Japanese. However, I don't see the actual text content between the \"QUOTE\" markers that you'd like me to translate. \n\nCould you please provide the English technical documentation text that needs to be translated?",
  "description": "引数内のすべての文字列をそのまま出力し、それらを''で囲む",
  "language": "ja"
}
---
## quote
### description
#### Syntax

`VARCHAR quote(VARCHAR str)`

引数内のすべての文字列をそのまま出力し、''で囲みます

### example

```sql
mysql> select quote('hello world!\\t');
+-------------------------+
| quote('hello world!\t') |
+-------------------------+
| 'hello world!\t'        |
+-------------------------+
```
### keywords
    QUOTE
