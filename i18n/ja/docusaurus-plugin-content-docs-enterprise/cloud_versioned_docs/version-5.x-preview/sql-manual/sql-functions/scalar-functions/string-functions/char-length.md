---
{
  "title": "CHAR_LENGTH",
  "description": "CHARLENGTH関数は、文字列内の文字数（バイト数ではない）を計算します。マルチバイト文字（中国語文字など）の場合、",
  "language": "ja"
}
---
## 説明

CHAR_LENGTH関数は、文字列内の文字数（バイト数ではない）を計算します。マルチバイト文字（中国語文字など）に対しては、文字数を返します。

現在はUTF-8エンコーディングのみをサポートしています。

## エイリアス

- CHARACTER_LENGTH

## 構文

```sql 
CHAR_LENGTH(<str>)
```
## Parameters

| Parameter | Description |
| ------- | ----------------------------------------- |
| `<str>` | 文字数を計算する文字列。型: VARCHAR |

## Return Value

INT型を返し、文字列内の文字数を表します。

特殊ケース:
- パラメータがNULLの場合、NULLを返します
- 空文字列は0を返します
- マルチバイトUTF-8文字はそれぞれ1文字としてカウントされます

## Examples

1. 英語文字

```sql
SELECT CHAR_LENGTH('hello');
```
```text
+----------------------+
| char_length('hello') |
+----------------------+
|                    5 |
+----------------------+
```
2. 中国語文字（各中国語文字は1文字としてカウントされます）

```sql
SELECT CHAR_LENGTH('中国');
```
```text
+----------------------+
| char_length('中国')  |
+----------------------+
|                    2 |
+----------------------+
```
3. NULL値の処理

```sql
SELECT CHAR_LENGTH(NULL);
```
```text
+--------------------+
| char_length(NULL)  |
+--------------------+
|               NULL |
+--------------------+
```
4. LENGTH関数との比較（LENGTHはバイト数を返す）

```sql
SELECT CHAR_LENGTH('中国') AS char_len, LENGTH('中国') AS byte_len;
```
```text
+----------+----------+
| char_len | byte_len |
+----------+----------+
|        2 |        6 |
+----------+----------+
```
