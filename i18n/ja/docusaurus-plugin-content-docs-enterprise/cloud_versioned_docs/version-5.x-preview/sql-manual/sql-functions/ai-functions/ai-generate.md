---
{
  "title": "I don't see any text to translate after \"Text:\" - it appears you've included a placeholder \"AI_GENERATE\" instead of the actual English technical documentation text.\n\nPlease provide the English text you'd like me to translate into Japanese, and I'll follow your specified requirements to produce an accurate technical translation.",
  "description": "入力プロンプトテキストに基づいてレスポンスを生成します。",
  "language": "ja"
}
---
## 説明

入力プロンプトテキストに基づいてレスポンスを生成します。

## 構文

```sql
AI_GENERATE([<resource_name>], <prompt>)
```
## Parameters

|    Parameter      | Description                                      |
| ----------------- | ------------------------------------------------|
| `<resource_name>` | 指定されたリソース名、オプション            |
| `<prompt>`        | AI生成を導くために使用されるプロンプトテキスト |

## Return Value

プロンプトに基づいて生成されたテキストコンテンツを返します。

入力がNULLの場合、NULLを返します。

結果は大規模言語モデルによって生成されるため、出力は変動する可能性があります。

## Examples

```sql
SET default_ai_resource = 'resource_name';
SELECT AI_GENERATE('Describe Apache Doris in a few words') AS Result;
```
```text
+---------------------------------------------------------+
| Result                                                  |
+---------------------------------------------------------+
| "Apache Doris is a fast, real-time analytics database." |
+---------------------------------------------------------+
```
```sql
SELECT AI_GENERATE('resource_name', 'What is the founding time of Apache Doris? Return only the date.') AS Result;
```
```text
+--------+
| Result |
+--------+
| 2017   |
+--------+
```
