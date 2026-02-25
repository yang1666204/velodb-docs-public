---
{
  "title": "I don't see any text to translate in your message. You've provided the instruction \"AI_FIXGRAMMAR\" but no actual English technical documentation text to translate into Japanese.\n\nPlease provide the English text you'd like me to translate, and I'll translate it following the guidelines you've specified.",
  "description": "テキストの文法エラーを修正するために使用されます。",
  "language": "ja"
}
---
## 説明

テキストの文法エラーを修正するために使用されます。

## 構文

```sql
AI_FIXGRAMMAR([<resource_name>], <text>)
```
## Parameters

|    Parameter      | Description                                 |
| ----------------- | ------------------------------------------- |
| `<resource_name>` | 指定するリソース名、オプション |
| `<text>`          | 文法修正を行うテキスト |

## Return Value

文法修正後のテキスト文字列を返します。

いずれかの入力がNULLの場合、NULLを返します。

結果は大規模言語モデルによって生成されるため、出力が変動する場合があります。

## Examples

```sql
SET default_ai_resource = 'resource_name';
SELECT AI_FIXGRAMMAR('Apache Doris a great system DB') AS Result;
```
```text
+------------------------------------------+
| Result                                   |
+------------------------------------------+
| Apache Doris is a great database system. |
+------------------------------------------+
```
```sql
SELECT AI_FIXGRAMMAR('resource_name', 'I am like to using Doris') AS Result;
```
```text
+--------------------+
| Result             |
+--------------------+
| I like using Doris |
+--------------------+
```
