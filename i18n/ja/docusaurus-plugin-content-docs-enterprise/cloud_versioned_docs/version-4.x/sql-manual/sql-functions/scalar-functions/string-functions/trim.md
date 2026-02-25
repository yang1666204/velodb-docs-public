---
{
  "title": "I'm ready to translate your technical documentation. However, I don't see the actual text content to translate - only the word \"TRIM\" appears at the end of your message. \n\nCould you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "このコマンドは、文字列の両端にあるスペースまたは指定された文字を削除するために使用されます。rhsパラメータが指定されていない場合、",
  "language": "ja"
}
---
## 説明

このコマンドは、文字列の両端にあるスペースまたは指定された文字を削除するために使用されます。rhsパラメータが指定されていない場合、strの左右の部分の先頭に連続して現れるスペースを削除します。それ以外の場合は、rhsを削除します。

## 構文

```sql
TRIM( <str> [ , <rhs>])
```
## 必須パラメータ

| Parameters | Description |
|------|------|
| `<str>` | 文字列の両端のスペースを削除する


## オプションパラメータ

| Parameters | Description |
|------|------|
| `<rhs>` | 指定された文字を削除する |

## 戻り値

両端のスペースまたは指定された文字を削除した後の文字列


## Example

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
