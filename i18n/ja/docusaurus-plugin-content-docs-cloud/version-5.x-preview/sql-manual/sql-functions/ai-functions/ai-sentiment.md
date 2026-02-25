---
{
  "title": "I notice that you've provided \"AI_SENTIMENT\" as the text to translate, but this appears to be a configuration key, variable name, or identifier rather than actual documentation text that needs translation.\n\nAccording to the rules you specified, I should not translate code blocks, inline code, configuration keys, or product names. \"AI_SENTIMENT\" falls into the category of configuration keys/identifiers that should remain untranslated.\n\nIf this is indeed the complete text you want me to work with, the output would simply be:\n\nAI_SENTIMENT\n\nIf you intended to provide a longer piece of technical documentation that includes \"AI_SENTIMENT\" along with other text, please provide the complete text and I'll translate the documentation portions while keeping identifiers like \"AI_SENTIMENT\" unchanged.",
  "description": "テキストの感情を分析するために使用されます。",
  "language": "ja"
}
---
## 説明

テキストの感情分析を行うために使用されます。

## 構文

```sql
AI_SENTIMENT([<resource_name>], <text>)
```
## Parameters

|    Parameter      | Description                |
| ----------------- | ------------------------- |
| `<resource_name>` | 指定されたリソース名|
| `<text>`          | センチメント分析を行うテキスト |

## Return Value

センチメント分析結果を返します。可能な値は以下の通りです：
- positive
- negative
- neutral
- mixed

いずれかの入力がNULLの場合、NULLを返します。

結果は大規模言語モデルによって生成されるため、出力が変動する場合があります。

## Examples

```sql
SET default_ai_resource = 'resource_name';
SELECT AI_SENTIMENT('Apache Doris is a great DB system.') AS Result;
```
```text
+----------+
| Result   |
+----------+
| positive |
+----------+
```
```sql
SELECT AI_SENTIMENT('resource_name', 'I hate sunny days.') AS Result;
```
```text
+----------+
| Result   |
+----------+
| negative |
+----------+
```
