---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following your specified requirements. However, I don't see the text you want me to translate. You mentioned \"Text: QUOTE\" but there's no content after it.\n\nCould you please provide the English text you'd like me to translate?",
  "description": "引数内のすべての文字列をそのまま出力し、''で囲む",
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
