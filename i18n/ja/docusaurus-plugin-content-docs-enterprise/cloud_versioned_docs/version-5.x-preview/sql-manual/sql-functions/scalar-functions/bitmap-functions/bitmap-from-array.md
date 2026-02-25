---
{
  "title": "BITMAP_FROM_ARRAY",
  "description": "TINYINT/SMALLINT/INT/BIGINT型の配列をBITMAPに変換します。入力フィールドが不正な場合、結果はNULLを返します。",
  "language": "ja"
}
---
## Description

TINYINT/SMALLINT/INT/BIGINT型の配列をBITMAPに変換します。入力フィールドが不正な場合、結果はNULLを返します。

## Syntax

```sql
BITMAP_FROM_ARRAY(<arr>)
```
## Parameters

| Parameter | Description |
|-----------|-------------|
| `<arr>`   | 整数配列 |

## Return Value

BITMAPを返します
- 入力フィールドが無効な場合、結果はNULLです

## Examples

```sql
SELECT bitmap_to_string(bitmap_from_array(array(1, 0, 1, 1, 0, 1, 0))) AS bs;
```
```text
+------+
| bs   |
+------+
| 0,1  |
+------+
```
```sql
SELECT bitmap_to_string(bitmap_from_array(NULL)) AS bs;
```
```text
+------+
| bs   |
+------+
| NULL |
+------+
```
```sql
select bitmap_to_string(bitmap_from_array([1,2,3,-1]));
```
```text
+-------------------------------------------------+
| bitmap_to_string(bitmap_from_array([1,2,3,-1])) |
+-------------------------------------------------+
| NULL                                            |
+-------------------------------------------------+
```
