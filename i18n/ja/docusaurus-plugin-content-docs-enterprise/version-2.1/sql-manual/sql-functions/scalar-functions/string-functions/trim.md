---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following all the specified rules. However, I don't see any text to translate after \"Text:\" - it just shows \"TRIM\" which appears to be a placeholder or instruction.\n\nCould you please provide the actual English technical documentation text you'd like me to translate?",
  "description": "このコマンドは、文字列の両端のスペースまたは指定された文字を削除するために使用されます。rhsパラメータが指定されていない場合、",
  "language": "ja"
}
---
## 説明

このコマンドは、文字列の両端にあるスペースまたは指定された文字を削除するために使用されます。rhsパラメータが指定されていない場合、strの左右の部分の先頭に連続して現れるスペースを削除します。それ以外の場合は、rhsを削除します

## 構文

```sql
TRIM( <str> [ , <rhs>])
```
## 必須パラメータ

| パラメータ | 説明 |
|------|------|
| `<str>` | 文字列の両端のスペースを削除する


## オプションパラメータ

| パラメータ | 説明 |
|------|------|
| `<rhs>` | 指定した文字を削除する |

## 戻り値

両端のスペースまたは指定した文字を削除した後の文字列


## 例

```sql
SELECT trim('   ab d   ') str;
```
```sql
+------+
| str  |
+------+
| ab d |
+------+
```
```sql
SELECT trim('ababccaab','ab') str;
```
```sql
+------+
| str  |
+------+
| cc   |
+------+
```
