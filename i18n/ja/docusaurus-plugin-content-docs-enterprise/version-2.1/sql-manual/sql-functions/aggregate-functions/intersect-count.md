---
{
  "title": "INTERSECT_COUNT",
  "description": "INTERSECTCOUNT関数は、Bitmapデータ構造の交差する要素の数を計算するために使用されます。",
  "language": "ja"
}
---
## 説明

INTERSECT_COUNT関数は、Bitmapデータ構造の交差する要素の数を計算するために使用されます。

## 構文

```sql
INTERSECT_COUNT(<bitmap_column>, <column_to_filter>, <filter_values>)
```
## Parameters

| Parameters | Description |
| -- | -- |
| `<bitmap_column>` | 取得する必要がある式。 |
| `<column_to_filter>` | オプション。フィルタリングする必要があるディメンションカラム。 |
| `<filter_values>` | オプション。フィルタリングディメンションカラムの異なる値。 |

## Return Value

BIGINT型の値を返します。

## Example

```sql
select dt,bitmap_to_string(user_id) from pv_bitmap where dt in (3,4);
```
```text
+------+-----------------------------+
| dt   | bitmap_to_string(`user_id`) |
+------+-----------------------------+
| 4    | 1,2,3                       |
| 3    | 1,2,3,4,5                   |
+------+-----------------------------+
```
```sql
select intersect_count(user_id,dt,3,4) from pv_bitmap;
```
```text
+----------------------------------------+
| intersect_count(`user_id`, `dt`, 3, 4) |
+----------------------------------------+
|                                      3 |
+----------------------------------------+
```
