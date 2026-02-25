---
{
  "title": "I'm ready to translate the English technical documentation into Japanese following your specified rules. However, I notice that the text to be translated appears to end with \"ENDS_WITH\" but I don't see the actual content to translate before that marker.\n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "指定されたsuffixで文字列が終わっている場合はtrueを返し、そうでなければfalseを返します。特殊なケース：",
  "language": "ja"
}
---
## Description

文字列が指定されたサフィックスで終わる場合はtrueを返し、それ以外の場合はfalseを返します。特殊なケース：

- 2つのパラメータのいずれかがNULLの場合、NULLを返します。

## Syntax

```sql
ENDS_WITH ( <str> , <suffix> )
```
## パラメータ

| Parameter | Description |
|-----------|--------------|
| `str`     | 判定対象の元の文字列を指定します |
| `suffix`  | 判定する末尾文字列を指定します |

## 戻り値

true または false、型は `BOOLEAN` です。特殊なケース：

- 2つのパラメータのいずれかがNULLの場合、NULLを返します。

## 例

```sql
SELECT ENDS_WITH("Hello doris", "doris"),ENDS_WITH("Hello doris", "Hello")
```
```text
+-----------------------------------+-----------------------------------+
| ends_with('Hello doris', 'doris') | ends_with('Hello doris', 'Hello') |
+-----------------------------------+-----------------------------------+
|                                 1 |                                 0 |
+-----------------------------------+-----------------------------------+
```
