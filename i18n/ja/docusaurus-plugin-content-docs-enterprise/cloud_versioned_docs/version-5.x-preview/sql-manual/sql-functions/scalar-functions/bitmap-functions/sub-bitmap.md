---
{
  "title": "SUB_BITMAP",
  "description": "指定された位置から開始し、指定された基数制限によって制限されたBitmap要素のサブセットを抽出します。",
  "language": "ja"
}
---
## 説明

指定された位置から開始し、指定された基数制限によって制限されたBitmap要素のサブセットを抽出し、そのサブセットを新しいBitmapとして返します。

## 構文

```sql
SUB_BITMAP(<bitmap>, <position>, <cardinality_limit>)
```
## Parameters

| Parameter             | Description                   |
|-----------------------|-------------------------------|
| `<bitmap>`            | Bitmap値              |
| `<position>`          | 開始位置（含む）、インデックスが負の場合、最後の要素は-1になります。 |
| `<cardinality_limit>` | 要素の最大数 |

## Return Value

指定された範囲と制限内のBitmapのサブセット。
- パラメータがNULLの場合、NULLを返します


## Examples

位置0から開始し、cardinality制限を3とするBitmapのサブセットを取得するには：

```sql
select bitmap_to_string(sub_bitmap(bitmap_from_string('1,0,1,2,3,1,5'), 0, 3)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| 0,1,2 |
+-------+
```
position -3から開始してcardinality制限を2とするBitmapのサブセットを取得するには：

```sql
select bitmap_to_string(sub_bitmap(bitmap_from_string('1,0,1,2,3,1,5'), -3, 2)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| 2,3   |
+-------+
```
position 2から開始してカーディナリティの上限を100とするBitmapのサブセットを取得するには：

```sql
select bitmap_to_string(sub_bitmap(bitmap_from_string('1,0,1,2,3,1,5'), 2, 100)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| 2,3,5 |
+-------+
```
```sql
select bitmap_to_string(sub_bitmap(bitmap_from_string('1,0,1,2,3,1,5'), 2, NULL)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| NULL  |
+-------+
```
