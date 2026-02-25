---
{
  "title": "I don't see any text to translate after \"CONCAT\". Could you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "複数の文字列を連結します。特殊なケース:",
  "language": "ja"
}
---
## Description

複数の文字列を連結します。特殊なケース：

- パラメータ値のいずれかがNULLの場合、返される結果はNULLです

## Syntax

```sql
CONCAT ( <expr> [ , <expr> ... ] )
```
## Parameters

| Parameter | Description |
|-----------|--------------|
| `<expr>`  | 連結される文字列 |

## Return value

パラメータリスト `<expr>` 連結される文字列。特別な場合：

- パラメータ値のいずれかがNULLの場合、返される結果はNULLです

## Example

```sql
SELECT  CONCAT("a", "b"),CONCAT("a", "b", "c"),CONCAT("a", null, "c")
```
```text
+------------------+-----------------------+------------------------+
| concat('a', 'b') | concat('a', 'b', 'c') | concat('a', NULL, 'c') |
+------------------+-----------------------+------------------------+
| ab               | abc                   | NULL                   |
+------------------+-----------------------+------------------------+
```
