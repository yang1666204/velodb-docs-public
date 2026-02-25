---
{
  "title": "BITMAP_SUBSET_IN_RANGE",
  "description": "指定された範囲内（範囲の終端は除く）のBitmapのサブセットを返します。",
  "language": "ja"
}
---
## Description

指定された範囲内のBitmapのサブセットを返します（範囲の終端は除く）。

## Syntax

```sql
BITMAP_SUBSET_IN_RANGE(<bitmap>, <range_start_include>, <range_end_exclude>)
```
## パラメータ

| Parameter             | Description                   |
|-----------------------|-------------------------------|
| `<bitmap>`            | Bitmap値              |
| `<range_start_include>` | 範囲の開始位置（境界値を含む） |
| `<range_end_exclude>`   | 範囲の終了位置（境界値を含まない）   |

## 戻り値

指定された範囲内のBitmapのサブセット。
- パラメータがNULL値または無効な範囲の場合、NULLを返します

## 例

0から9までの範囲でBitmapのサブセットを取得するには：

```sql
select bitmap_to_string(bitmap_subset_in_range(bitmap_from_string('1,2,3,4,5'), 0, 9)) value;
```
結果は次のようになります：

```text
+-----------+
| value     |
+-----------+
| 1,2,3,4,5 |
+-----------+
```
Bitmapの2から3の範囲内のサブセットを取得するには：

```sql
select bitmap_to_string(bitmap_subset_in_range(bitmap_from_string('1,2,3,4,5'), 2, 3)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| 2     |
+-------+
```
```sql
select bitmap_to_string(bitmap_subset_in_range(bitmap_from_string('1,2,3,4,5'), 2, NULL)) value;
```
結果は以下のようになります：

```text
+-------+
| value |
+-------+
| NULL  |
+-------+
```
```sql
select bitmap_to_string(bitmap_subset_in_range(bitmap_from_string('1,2,3,4,5'), 2, -10000)) value;
```
結果は次のようになります：

```text
+-------+
| value |
+-------+
| NULL  |
+-------+
```
