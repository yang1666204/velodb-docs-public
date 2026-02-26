---
{
  "title": "XOR | ビット演算関数",
  "description": "2つのBOOLEAN値に対してビット単位の排他的OR演算を実行します。",
  "language": "ja"
}
---
# XOR

## Description
2つのBOOLEAN値に対してビット単位の排他的OR演算を実行します。

## Syntax

```sql
 <lhs> XOR <rhs>
```
## Parameters
| parameter | description                                                             |
|-----------|-------------------------------------------------------------------------|
| `<lhs>`   | 評価される最初のBOOLEAN値                                 |
| `<rhs>`   | 評価される2番目のBOOLEAN値 |

## Return Value
2つのBOOLEAN値の排他的論理和を返します。

## Examples

```sql
select true XOR false,true XOR true;
```
```text
+------------------+-----------------+
| xor(TRUE, FALSE) | xor(TRUE, TRUE) |
+------------------+-----------------+
|                1 |               0 |
+------------------+-----------------+
```
