---
{
  "title": "FIND_IN_SET",
  "description": "strlistにおけるstrの最初の出現位置を返します（カウントは1から開始されます）。",
  "language": "ja"
}
---
## 説明

strlist内でstrが最初に出現する位置を返します（カウントは1から開始されます）。

strlistはコンマ区切りの文字列です。特殊なケース：

- 見つからない場合、0を返します。
- いずれかのパラメータがNULLの場合、NULLを返します。

## 構文

```sql
FIND_IN_SET ( <str> , <strlist> )
```
## パラメータ

| Parameter   | デスクリプション |
|-------------|----------|
| `<str>`     | 検索対象の文字列 |
| `<strlist>` | 検索される文字列 |

## Return value

パラメータ`<strlist>`内でパラメータ`<str>`が最初に出現する位置。特殊なケース：

- 見つからない場合、0を返します。
- いずれかのパラメータがNULLの場合、NULLを返します。

## Example

```sql
SELECT FIND_IN_SET("b", "a,b,c")
```
```text
| find_in_set('b', 'a,b,c') |
+---------------------------+
|                         2 |
+---------------------------+
```
