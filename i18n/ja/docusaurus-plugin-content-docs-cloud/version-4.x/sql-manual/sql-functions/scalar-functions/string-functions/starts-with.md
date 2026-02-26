---
{
  "title": "I'm ready to translate the English technical documentation into Japanese following your specified requirements. However, I notice that you've included \"STARTS_WITH\" at the end but haven't provided the actual text to translate.\n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "STARTSWITH関数は、文字列が指定されたプレフィックスで始まるかどうかをチェックします。文字列が指定されたプレフィックスで始まる場合はtrueを返します。",
  "language": "ja"
}
---
## 説明

STARTS_WITH関数は、文字列が指定されたプレフィックスで始まるかどうかをチェックします。文字列が指定されたプレフィックスで始まる場合はtrueを返し、そうでない場合はfalseを返します。

## 構文

```sql
STARTS_WITH(<str>, <prefix>)
```
## Parameters
| Parameter | Description                               |
| --------- | ----------------------------------------- |
| `<str>` | チェックする文字列。型：VARCHAR        |
| `<prefix>` | マッチするプレフィックス文字列。型：VARCHAR |

## Return Value

BOOLEAN型を返します。

特殊なケース：
- いずれかの引数がNULLの場合、NULLを返します

## Examples

1. マッチ成功

```sql
SELECT starts_with('hello world', 'hello');
```
```text
+-------------------------------------+
| starts_with('hello world', 'hello') |
+-------------------------------------+
|                                   1 |
+-------------------------------------+
```
2. マッチの失敗

```sql
SELECT starts_with('hello world', 'world');
```
```text
+-------------------------------------+
| starts_with('hello world', 'world') |
+-------------------------------------+
|                                   0 |
+-------------------------------------+
```
