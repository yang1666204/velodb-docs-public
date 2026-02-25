---
{
  "title": "I don't see any text to translate after \"Text:\" and \"TRIM\". Could you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "TRIM関数は、文字列の両端から連続するスペースまたは指定された文字列を削除するために使用されます。第2パラメータが指定されていない場合、",
  "language": "ja"
}
---
## 説明

TRIM関数は、文字列の両端から連続する空白文字または指定された文字列を削除するために使用されます。第2パラメータが指定されていない場合は、先頭と末尾の空白文字が削除されます。指定されている場合は、両端から指定された完全な文字列を削除します。

## 構文

```sql
TRIM(<str>[, <rhs>])
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<str>` | 処理される文字列。型: VARCHAR |
| `<rhs>` | オプションパラメータ、両端から削除される文字。型: VARCHAR |

## Return Value

VARCHAR型の値を返します。

特殊なケース:
- いずれかのパラメータがNULLの場合、NULLが返されます
- rhsが指定されていない場合、先頭と末尾の空白を削除します
- rhsが指定されている場合、両端から完全なrhs文字列を削除します（文字単位ではありません）

## Examples

1. 先頭と末尾の空白を削除

```sql
SELECT trim('   ab d   ') str;
```
```text
+------+
| str  |
+------+
| ab d |
+------+
```
2. 両端から指定された文字列を削除

```sql
SELECT trim('ababccaab', 'ab') str;
```
```text
+---------+
| str     |
+---------+
| ababcca |
+---------+
```
3. UTF-8文字サポート

```sql
SELECT trim('   ṭṛì ḍḍumai   ');
```
```text
+------------------------------+
| trim('   ṭṛì ḍḍumai   ')     |
+------------------------------+
| ṭṛì ḍḍumai                   |
+------------------------------+
```
4. プレフィックス/サフィックスが一致しない場合は、元の文字列を返す

```sql
SELECT trim('Hello World', 'xyz');
```
```text
+--------------------------------+
| trim('Hello World', 'xyz')     |
+--------------------------------+
| Hello World                    |
+--------------------------------+
```
5. NULL値の処理

```sql
SELECT trim(NULL), trim('Hello', NULL);
```
```text
+------------+-----------------------+
| trim(NULL) | trim('Hello', NULL)   |
+------------+-----------------------+
| NULL       | NULL                  |
+------------+-----------------------+
```
6. 空文字列の処理

```sql
SELECT trim(''), trim('abc', '');
```
```text
+----------+------------------+
| trim('') | trim('abc', '')  |
+----------+------------------+
|          | abc              |
+----------+------------------+
```
7. 両端からの繰り返しパターンの除去

```sql
SELECT trim('abcabcabc', 'abc');
```
```text
+------------------------------+
| trim('abcabcabc', 'abc')     |
+------------------------------+
|                              |
+------------------------------+
```
8. 非対称削除

```sql
SELECT trim('abcHelloabc', 'abc');
```
```text
+--------------------------------+
| trim('abcHelloabc', 'abc')     |
+--------------------------------+
| Hello                          |
+--------------------------------+
```
### キーワード

    TRIM
