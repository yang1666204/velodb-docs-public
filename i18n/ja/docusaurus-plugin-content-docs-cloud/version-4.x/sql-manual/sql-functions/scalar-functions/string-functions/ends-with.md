---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following the rules you've specified. However, I don't see the actual text content after \"Text:\" - it appears to end with \"ENDS_WITH\" which seems to be a delimiter.\n\nCould you please provide the English text you'd like me to translate?",
  "description": "文字列が指定されたサフィックスで終わる場合はtrueを返し、そうでない場合はfalseを返します。特殊なケース：",
  "language": "ja"
}
---
## 説明

文字列が指定されたサフィックスで終わる場合はtrueを返し、そうでない場合はfalseを返します。特殊なケース：

- 2つのパラメータのいずれかがNULLの場合、NULLを返します。

## 構文

```sql
ENDS_WITH ( <str> , <suffix> )
```
## Parameters

| Parameter | Description |
|-----------|--------------|
| `str`     | 判定対象となる元の文字列を指定します |
| `suffix`  | 判定対象となる末尾文字列を指定します |

## Return value

true または false、型は `BOOLEAN` です。特殊なケース：

- 2つのパラメータのいずれかがNULLの場合、NULLを返します。

## Example

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
