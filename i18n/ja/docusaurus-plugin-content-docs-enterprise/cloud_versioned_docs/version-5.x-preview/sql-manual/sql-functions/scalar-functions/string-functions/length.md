---
{
  "title": "I notice that the text you provided is just \"LENGTH\" which appears to be a single word or placeholder. This could be:\n\n1. A technical term/constant that should remain in English\n2. A placeholder you meant to replace with actual content\n3. Part of a larger documentation that got cut off\n\nCould you please provide the complete English technical documentation text that you'd like me to translate into Japanese?",
  "description": "LENGTH関数は文字列のバイト長（バイト単位）を返します。この関数はUTF-8エンコーディングにおいて文字列が占めるバイト数を計算します。",
  "language": "ja"
}
---
## 説明

LENGTH関数は文字列のバイト長（バイト単位）を返します。この関数はUTF-8エンコーディングにおいて文字列が占めるバイト数を計算し、文字数ではありません。

**CHAR_LENGTHとの違いに注意してください:**
- `LENGTH()`はバイト数を返します
- `CHAR_LENGTH()`と`CHARACTER_LENGTH()`は文字数を返します
- ASCII文字の場合、バイト数は文字数と等しくなります
- マルチバイト文字（中国語、絵文字など）の場合、バイト数は通常文字数より大きくなります

## エイリアス
- `OCTET_LENGTH()`

## 構文

```sql
LENGTH(<str>)
```
## パラメータ

| パラメータ | 説明 |
|---------|---------------|
| `<str>` | バイト長を計算する必要がある文字列。型: VARCHAR |

## 戻り値

INT型を返し、文字列のバイト長を表します。

特殊なケース:
- パラメータがNULLの場合、NULLを返す
- 空文字列は0を返す
- 結果はUTF-8エンコーディングでのバイト数

## 例

1. ASCII文字（バイト数 = 文字数）

```sql
SELECT LENGTH('abc'), CHAR_LENGTH('abc');
```
```text
+---------------+--------------------+
| LENGTH('abc') | CHAR_LENGTH('abc') |
+---------------+--------------------+
|             3 |                  3 |
+---------------+--------------------+
```
2. 中国語文字（バイト数 > 文字数）

```sql
SELECT LENGTH('中国'), CHAR_LENGTH('中国');
```
```text
+------------------+---------------------+
| LENGTH('中国')   | CHAR_LENGTH('中国') |
+------------------+---------------------+
|                6 |                   2 |
+------------------+---------------------+
```
3. NULL値の処理

```sql
SELECT LENGTH(NULL);
```
```text
+--------------+
| LENGTH(NULL) |
+--------------+
|         NULL |
+--------------+
```
