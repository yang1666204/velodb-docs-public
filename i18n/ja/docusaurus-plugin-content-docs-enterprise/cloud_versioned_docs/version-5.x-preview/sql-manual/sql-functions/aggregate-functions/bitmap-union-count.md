---
{
  "title": "BITMAP_UNION_COUNT",
  "description": "入力されたBitmapの和集合を計算し、そのカーディナリティを返します。",
  "language": "ja"
}
---
## 説明

入力されたBitmapの和集合を計算し、そのカーディナリティを返します。

## 構文

```sql
BITMAP_UNION_COUNT(<expr>)
```
## Arguments

| Argument | Description |
| -- | -- |
| `<expr>` | Bitmapをサポートするデータ型 |

## Return Value

Bitmap unionのサイズ、つまり異なる要素の数を返します。グループに有効なデータがない場合は0を返します。

## Example

```sql
-- setup
CREATE TABLE pv_bitmap (
    dt INT,
    page INT,
    user_id BITMAP
) DISTRIBUTED BY HASH(dt) BUCKETS 1
PROPERTIES ("replication_num" = "1");
INSERT INTO pv_bitmap VALUES
    (1, 100, to_bitmap(100)),
    (1, 100, to_bitmap(200)),
    (1, 100, to_bitmap(300)),
    (2, 200, to_bitmap(300));
```
```sql
select bitmap_union_count(user_id) from pv_bitmap;
```
個別のuser_id値の数を数えます。

```text
+-----------------------------+
| bitmap_union_count(user_id) |
+-----------------------------+
|                           3 |
+-----------------------------+
```
```sql
select bitmap_union_count(user_id) from pv_bitmap where user_id is null;
```
```text
+-----------------------------+
| bitmap_union_count(user_id) |
+-----------------------------+
|                           0 |
+-----------------------------+
```
