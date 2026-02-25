---
{
  "title": "INTERSECT_COUNT",
  "description": "2つ以上のビットマップの積集合を計算します 使用方法: intersectcount(bitmapcolumntocount, filtercolumn, filtervalues ...",
  "language": "ja"
}
---
## Description

2つ以上のbitmapの積集合を計算します
使用法: intersect_count(bitmap_column_to_count, filter_column, filter_values ...)
例: intersect_count(user_id, event, 'A', 'B', 'C')、これはA/B/C 3つのbitmapすべてにおけるuser_idの積集合数を求めることを意味します
filter_values内のcolumn_to_filterにマッチするbitmap_column内の要素の積集合数を計算します。つまり、bitmapの積集合数です。

## Syntax

```sql
INTERSECT_COUNT(<bitmap_column>, <column_to_filter>, <filter_values> [, ...])
```
## パラメータ

| Parameter         | Description                                      |
|------------------|--------------------------------------------------|
| `<bitmap_column>`  | 入力ビットマップパラメータカラム。サポートされる型：Bitmap。 |
| `<column_to_filter>` | フィルタリングに使用されるディメンションカラム。サポートされる型：TinyInt、SmallInt、Integer、BigInt、LargeInt。 |
| `<filter_values>`  | ディメンションカラムのフィルタリングに使用される異なる値。サポートされる型：TinyInt、SmallInt、Integer、BigInt、LargeInt。 |


## 戻り値

指定されたビットマップの積集合に含まれる要素数を返します。

## 例

```sql
-- setup
CREATE TABLE pv_bitmap (
	dt INT,
	user_id BITMAP,
	city STRING
) DISTRIBUTED BY HASH(dt) BUCKETS 1
PROPERTIES ("replication_num" = "1");
INSERT INTO pv_bitmap VALUES
	(20250801, to_bitmap(1), 'beijing'),
	(20250801, to_bitmap(2), 'beijing'),
	(20250801, to_bitmap(3), 'shanghai'),
	(20250802, to_bitmap(3), 'beijing'),
	(20250802, to_bitmap(4), 'shanghai'),
	(20250802, to_bitmap(5), 'shenzhen');
```
```sql
select intersect_count(user_id,dt,20250801) from pv_bitmap;
```
```text
+--------------------------------------+
| intersect_count(user_id,dt,20250801) |
+--------------------------------------+
|                                    3 |
+--------------------------------------+
```
