---
{
  "title": "I'm ready to translate English technical documentation into Japanese following your specifications. However, I don't see the actual text to translate in your message - it just shows \"AI_TRANSLATE\" at the end.\n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "指定された言語にテキストを翻訳するために使用されます。",
  "language": "ja"
}
---
## 説明

テキストを指定された言語に翻訳するために使用されます。

## 構文

```sql
AI_TRANSLATE([<resource_name>], <text>, <target_language>)
```
## Parameters

|    Parameter      | Description             |
| ----------------- | ---------------------- |
| `<resource_name>` | 指定されたリソース名 |
| `<text>`          | 翻訳するテキスト  |
| `<target_language>` | ターゲット言語   |

## Return Value

翻訳されたテキスト文字列を返します。

いずれかの入力がNULLの場合、NULLを返します。

結果は大規模言語モデルによって生成されるため、出力は変動する可能性があります。

## Examples

```sql
SET default_ai_resource = 'resourse_name';
SELECT AI_TRANSLATE('In my mind, doris is the best databases management system.', 'zh-CN') AS Result;
```
```text
+----------------------------------------------------------------+
| Result                                                         |
+----------------------------------------------------------------+
| 在我心目中，Doris是最优秀的数据库管理系统。                    |
+----------------------------------------------------------------+
```
```sql
SELECT AI_Translate('resource_name', 'This is an example', 'French') AS Result;
```
```text
+------------------+
| Result           |
+------------------+
| Voici un exemple |
+------------------+
```
