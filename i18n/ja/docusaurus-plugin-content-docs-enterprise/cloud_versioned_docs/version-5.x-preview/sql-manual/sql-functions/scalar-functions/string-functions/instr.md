---
{
  "title": "I don't see any text to translate after \"Text:\" in your message. You mentioned \"INSTR\" but that appears to be just an identifier or placeholder rather than the actual technical documentation content you want me to translate.\n\nCould you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "INSTR関数は、メイン文字列内で部分文字列が最初に出現する位置を返します。位置のカウントは1から開始されます。",
  "language": "ja"
}
---
## 説明

INSTR関数は、メイン文字列内の部分文字列の最初の出現位置を返します。位置のカウントは1から始まります。これは完全一致をサポートし、大文字小文字を区別する、一般的に使用される文字列検索関数です。この関数は、テキスト処理、データクリーニング、文字列分析において広く使用されています。

## 構文

```sql
INSTR(<str>, <substr>)
```
## Parameters

| Parameter | Description |
|--------|-----------|
| `<str>` | 検索対象のメイン文字列。型: VARCHAR |
| `<substr>` | 検索する部分文字列。型: VARCHAR |

## Return Value

INT型を返し、メイン文字列内で部分文字列が最初に出現する位置を表します。

検索ルール:
- 1から始まる位置インデックスを返します（0からではない）
- 部分文字列が存在しない場合、0を返します
- 検索は大文字小文字を区別します
- UTF-8マルチバイト文字の正確な位置計算をサポートします
- 空文字列の特別な処理

特殊ケース:
- いずれかのパラメータがNULLの場合、NULLを返します
- 部分文字列が空文字列の場合、1を返します（空文字列は任意の位置に「存在」する）
- メイン文字列が空で部分文字列が空でない場合、0を返します
- 特殊文字や記号を含む部分文字列の検索をサポートします

## Examples

1. 基本的な文字検索

```sql
SELECT INSTR('abc', 'b'), INSTR('abc', 'd');
```
```text
+-------------------+-------------------+
| INSTR('abc', 'b') | INSTR('abc', 'd') |
+-------------------+-------------------+
|                 2 |                 0 |
+-------------------+-------------------+
```
2. 部分文字列検索

```sql
SELECT INSTR('hello world', 'world'), INSTR('hello world', 'WORLD');
```
```text
+------------------------------+------------------------------+
| INSTR('hello world', 'world') | INSTR('hello world', 'WORLD') |
+------------------------------+------------------------------+
|                            7 |                            0 |
+------------------------------+------------------------------+
```
3. NULL値の処理

```sql
SELECT INSTR(NULL, 'test'), INSTR('test', NULL);
```
```text
+---------------------+---------------------+
| INSTR(NULL, 'test') | INSTR('test', NULL) |
+---------------------+---------------------+
| NULL                | NULL                |
+---------------------+---------------------+
```
4. 空文字列の処理

```sql
SELECT INSTR('hello', ''), INSTR('', 'world');
```
```text
+--------------------+---------------------+
| INSTR('hello', '') | INSTR('', 'world') |
+--------------------+---------------------+
|                  1 |                   0 |
+--------------------+---------------------+
```
