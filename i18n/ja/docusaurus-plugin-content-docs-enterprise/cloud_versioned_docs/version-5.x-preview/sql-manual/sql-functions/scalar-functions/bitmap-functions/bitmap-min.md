---
{
  "title": "BITMAP_MIN",
  "description": "Bitmapの最小値を計算して返します。",
  "language": "ja"
}
---
## 説明

Bitmap内の最小値を計算して返します。

## 構文

```sql
BITMAP_MIN(<bitmap>)
```
## Parameters

| Parameter  | Description                     |
|------------|---------------------------------|
| `<bitmap>` | Bitmap型の列または式 |

## Return Value

Bitmap内の最小値。  
Bitmapが空またはNULL値の場合、`NULL`を返します。

## Examples

空のBitmap内の最小値を計算するには：

```sql
select bitmap_min(bitmap_from_string('')) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
|  NULL |
+-------+
```
複数の要素を持つBitmapで最小値を計算するには：

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
```sql
select bitmap_min(bitmap_empty()) res1,bitmap_min(NULL) res2;
```
結果は以下のようになります：

```text
+------+------+
| res1 | res2 |
+------+------+
| NULL | NULL |
+------+------+
```
