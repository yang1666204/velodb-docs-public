---
{
  "title": "I notice that you've provided \"LENGTH\" as the text to translate, but this appears to be just a single word or placeholder rather than actual technical documentation content. \n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
  "description": "文字列のバイト数を返します。",
  "language": "ja"
}
---
## 説明

文字列内のバイト数を返します。

## 構文

```sql
LENGTH ( <str> )
```
## Parameters

| Parameter | Description |
|-----------| --------------- |
| `<str>`   | バイト数を計算する必要がある文字列 |

## Return Value

文字列 `<str>` のバイト数。

## Example

```sql
SELECT LENGTH("abc"),length("中国")
```
```text
+---------------+------------------+
| length('abc') | length('中国')   |
+---------------+------------------+
|             3 |                6 |
+---------------+------------------+
```
