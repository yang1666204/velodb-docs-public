---
{
  "title": "I notice that your message ends with \"Text: CONV\" but there doesn't appear to be any actual technical documentation text provided after that for me to translate. Could you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "入力パラメータに対して基数変換を行います。",
  "language": "ja"
}
---
## 説明

入力パラメータに対して基数変換を行います。

## 構文

```sql
CONV(<input>, <from_base>, <to_base>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<input>` | 変換対象のパラメータ。文字列または整数 |
| `<from_base>` | 数値。変換元の基数。`[2,36]`の範囲内 |
| `<to_base>` | 数値。変換先の基数。`[2,36]`の範囲内 |

## Return Value

変換先の基数`<to_base>`で変換された数値が文字列として返される。

## Examples

```sql
SELECT CONV(15,10,2);
```
```text
+-----------------+
| conv(15, 10, 2) |
+-----------------+
| 1111            |
+-----------------+
```
```sql
SELECT CONV('ff',16,10);
```
```text
+--------------------+
| conv('ff', 16, 10) |
+--------------------+
| 255                |
+--------------------+
```
```sql
SELECT CONV(230,10,16);
```
```text
+-------------------+
| conv(230, 10, 16) |
+-------------------+
| E6                |
+-------------------+
```
