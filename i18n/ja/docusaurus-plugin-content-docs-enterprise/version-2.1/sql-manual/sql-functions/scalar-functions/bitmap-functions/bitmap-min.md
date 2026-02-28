---
{
  "title": "BITMAP_MIN",
  "description": "Bitmapの最小値を計算して返します。",
  "language": "ja"
}
---
## デスクリプション

Bitmap内の最小値を計算して返します。

## Syntax

```sql
BITMAP_MIN(<bitmap>)
```
## パラメータ

| Parameter  | デスクリプション                     |
|------------|---------------------------------|
| `<bitmap>` | Bitmap型の列または式 |

## Return Value

Bitmap内の最小値。  
Bitmapが空の場合は`NULL`を返します。

## Examples

空のBitmap内の最小値を計算するには：

```sql
select bitmap_min(bitmap_from_string('')) value;
```
結果は以下のようになります：

```text
+-------+
| value |
+-------+
|  NULL |
+-------+
```
複数の要素を持つBitmapの最小値を計算するには：

```sql
select bitmap_min(bitmap_from_string('1,9999999999')) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
|     1 |
+-------+
```
