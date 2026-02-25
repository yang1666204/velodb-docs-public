---
{
  "title": "I don't see any text to translate in your message. You mentioned \"Text: AI_MASK\" but there doesn't appear to be any actual English technical documentation content provided after that marker.\n\nCould you please provide the English text that you'd like me to translate into Japanese?",
  "description": "指定されたラベルに関連するテキスト内の機密情報をマスクするために使用されます。",
  "language": "ja"
}
---
## 説明

指定されたラベルに関連するテキスト内の機密情報をマスクするために使用されます。

## 構文

```sql
AI_MASK([<resource_name>], <text>, <labels>)
```
## パラメータ

|    パラメータ      | 説明                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `<resource_name>` | 指定されたリソース名                                      |
| `<text>`          | 機密情報を含む可能性があるテキスト                  |
| `<labels>`        | マスク対象のラベルの配列。例：`ARRAY('name', 'phone', 'email')` |

## 戻り値

機密情報がマスクされたテキストを返します。マスクされた部分は「[MASKED]」に置き換えられます。

入力がNULLの場合、NULLを返します。

結果は大規模言語モデルによって生成されるため、出力は変動する可能性があります。

## 例

```sql
SET default_ai_resource = 'resource_name';
SELECT AI_MASK('Wccccat is a 20-year-old Doris community contributor.', ['name', 'age']) AS Result;
```
```text
+-----------------------------------------------------+
| Result                                              |
+-----------------------------------------------------+
| [MASKED] is a [MASKED] Doris community contributor. |
+-----------------------------------------------------+
```
```sql
SELECT AI_MASK('resource_name', 'My email is rarity@example.com and my phone is 123-456-7890',
                ['email', 'phone_num']) AS RESULT;
```
```text
+-----------------------------------------------+
| RESULT                                        |
+-----------------------------------------------+
| My email is [MASKED] and my phone is [MASKED] |
+-----------------------------------------------+
```
