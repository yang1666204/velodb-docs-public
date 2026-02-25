---
{
  "title": "I notice that you've provided \"CONCAT\" as the text to translate, but this appears to be just a single word or function name. \n\nFollowing the translation rules:\n- CONCAT is a technical term/function name commonly used in programming and databases\n- Technical terms that are commonly used in English in Japanese technical documents should be kept in English\n- Function names and identifiers should not be translated\n\nTherefore, the output would be:\n\nCONCAT",
  "description": "複数の文字列を連結します。特殊なケース：",
  "language": "ja"
}
---
## 説明

複数の文字列を連結します。特殊なケース：

- パラメータ値のいずれかがNULLの場合、返される結果はNULLになります

## 構文

```sql
CONCAT ( <expr> [ , <expr> ... ] )
```
## パラメータ

| Parameter | Description |
|-----------|--------------|
| `<expr>`  | 連結される文字列 |

## 戻り値

パラメータリスト `<expr>` 連結される文字列。特殊なケース：

- パラメータ値のいずれかがNULLの場合、返される結果はNULL

## 例

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
