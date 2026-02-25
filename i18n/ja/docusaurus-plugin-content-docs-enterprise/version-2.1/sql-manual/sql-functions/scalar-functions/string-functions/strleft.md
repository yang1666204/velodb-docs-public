---
{
  "title": "I notice that you've provided \"STRLEFT\" as the text to translate, but this appears to be just a single term or function name rather than a complete technical documentation text with sentences and paragraphs.\n\nSince \"STRLEFT\" appears to be a function name or technical identifier, according to your rules I should not translate it. However, you've asked me to translate it as if it were documentation text.\n\nCould you please clarify if:\n1. This is indeed the complete text you want translated, or\n2. If you meant to include additional documentation text that explains what STRLEFT does?\n\nIf \"STRLEFT\" is the complete text and you want me to treat it as documentation content rather than a code identifier, please confirm and I'll provide the appropriate translation.",
  "description": "STRLEFT関数は、文字列の左側から指定された文字数を返します。長さはUTF8文字で測定されます。",
  "language": "ja"
}
---
## 説明

STRLEFT関数は、文字列の左側から指定した文字数を返します。長さはUTF8文字で測定されます。

## エイリアス

LEFT

## 構文

```sql
STRLEFT(<str>, <len>)
```
## パラメータ
| パラメータ | 説明                                   |
| --------- | ------------------------------------- |
| `<str>` | 抽出元の文字列。型：VARCHAR     |
| `<len>` | 返す文字数。型：INT |

## 戻り値

抽出されたサブストリングを表すVARCHAR型を返します。

特殊なケース：
- いずれかの引数がNULLの場合、NULLを返します
- lenが0以下の場合、空文字列""を返します
- lenが文字列の長さより大きい場合、文字列全体を返します

## 例

1. 基本的な使用法

```sql
SELECT strleft('Hello doris', 5);
```
```text
+---------------------------+
| strleft('Hello doris', 5) |
+---------------------------+
| Hello                     |
+---------------------------+
```
2. 負の長さの処理

```sql
SELECT strleft('Hello doris', -5);
```
```text
+----------------------------+
| strleft('Hello doris', -5) |
+----------------------------+
|                            |
+----------------------------+
```
3. NULLパラメータの処理

```sql
SELECT strleft('Hello doris', NULL);
```
```text
+------------------------------+
| strleft('Hello doris', NULL) |
+------------------------------+
| NULL                         |
+------------------------------+
```
4. NULL文字列の処理

```sql
SELECT strleft(NULL, 3);
```
```text
+------------------+
| strleft(NULL, 3) |
+------------------+
| NULL             |
+------------------+
```
