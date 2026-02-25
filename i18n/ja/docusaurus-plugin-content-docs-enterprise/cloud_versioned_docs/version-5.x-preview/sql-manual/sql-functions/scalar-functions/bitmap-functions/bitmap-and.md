---
{
  "title": "BITMAP_AND",
  "description": "2つ以上の入力BITMAPの積集合を計算し、新しいBITMAPを返します。",
  "language": "ja"
}
---
## Description

2つ以上の入力BITMAPの積集合を計算し、新しいBITMAPを返します。

## Syntax

```sql
BITMAP_AND(<bitmap>, <bitmap>,[, <bitmap>...])
```
## Parameters

| Parameter  | Description                                                    |
|------------|----------------------------------------------------------------|
| `<bitmap>` | 交差を求める元のBITMAPの1つ |

## Return Value

BITMAPを返します
- パラメータがNULL値の場合、NULLを返します

## Examples

```sql
select bitmap_to_string(bitmap_and(bitmap_from_string('1,2,3'), bitmap_from_string('1,2'), bitmap_from_string('1,2,3,4,5'))) as res;
```
```text
+------+
| res  |
+------+
| 1,2  |
+------+
```
```sql
select bitmap_to_string(bitmap_and(bitmap_from_string('1,2,3'), bitmap_from_string('1,2'), bitmap_from_string('1,2,3,4,5'),bitmap_empty())) as res;
```
```text
+------+
| res  |
+------+
|      |
+------+
```
```sql
select bitmap_to_string(bitmap_and(bitmap_from_string('1,2,3'), bitmap_from_string('1,2'), bitmap_from_string('1,2,3,4,5'),NULL)) as res;
```
```text
+------+
| res  |
+------+
| NULL |
+------+
```
