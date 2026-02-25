---
{
  "title": "ISNAN",
  "description": "指定された値がNaN（Not a Number）かどうかを判定します。",
  "language": "ja"
}
---
## 説明

指定された値がNaN（Not a Number）であるかどうかを判定します。

## 構文

```sql
ISNAN(<value>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<value>` | チェック対象の値。DOUBLE型またはFLOAT型である必要があります |

## Return Value

値がNaNの場合は1を返し、そうでなければ0を返します。
値がNULLの場合はNULLを返します。

## Examples

```sql
SELECT isnan(1);
```
```text
+----------+
| isnan(1) |
+----------+
|        0 |
+----------+
```
```sql
SELECT cast('nan' as double),isnan(cast('nan' as double));
```
```text
+-----------------------+------------------------------+
| cast('nan' as double) | isnan(cast('nan' as double)) |
+-----------------------+------------------------------+
|                   NaN |                            1 |
+-----------------------+------------------------------+
```
```sql
SELECT isnan(NULL)
```
```text
+-------------+
| isnan(NULL) |
+-------------+
|        NULL |
+-------------+
```
