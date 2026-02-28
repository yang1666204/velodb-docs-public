---
{
  "title": "BITMAP_HAS_ALL",
  "description": "一つのBitmapが別のBitmapのすべての要素を含んでいるかどうかを判定します。",
  "language": "ja"
}
---
## 説明

一つのBitmapが別のBitmapのすべての要素を含んでいるかどうかを判定します。

## 構文

```sql
BITMAP_HAS_ALL(<bitmap1>, <bitmap2>)
```
## パラメータ

| Parameter   | デスクリプション       |
|-------------|-------------------|
| `<bitmap1>` | 最初のBitmap  |
| `<bitmap2>` | 2番目のBitmap |

## Return Value

`<bitmap1>`が`<bitmap2>`のすべての要素を含む場合は`true`を返します。  
`<bitmap2>`に要素が含まれていない場合は`true`を返します。  
それ以外の場合は`false`を返します。

## Examples

あるBitmapが別のBitmapのすべての要素を含んでいるかどうかを確認するには：

```sql
select bitmap_has_all(bitmap_from_string('0, 1, 2'), bitmap_from_string('1, 2'));
```
結果は次のようになります：

```text
+---------------------------------------------------------------------------+
| bitmap_has_all(bitmap_from_string('0, 1, 2'), bitmap_from_string('1, 2')) |
+---------------------------------------------------------------------------+
|                                                                         1 |
+---------------------------------------------------------------------------+
```
空のBitmapが別のBitmapのすべての要素を含んでいるかどうかを確認するには:

```sql
select bitmap_has_all(bitmap_empty(), bitmap_from_string('1, 2'));
```
結果は以下のようになります：

```text
+------------------------------------------------------------+
| bitmap_has_all(bitmap_empty(), bitmap_from_string('1, 2')) |
+------------------------------------------------------------+
|                                                          0 |
+------------------------------------------------------------+
```
