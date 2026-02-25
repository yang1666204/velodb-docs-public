---
{
  "title": "COS",
  "description": "パラメータのコサインを計算する",
  "language": "ja"
}
---
## Description

パラメータのコサインを計算する

## Syntax

```sql
COS(<a>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<a>` | 浮動小数点数、計算するパラメータのラジアン値 |

## Return Value

パラメータ `<a>` のコサイン値（ラジアン単位で表現）。

## Special Cases
- `a` が NaN の場合、NaN を返す
- `a` が正または負の無限大の場合、NaN を返す
- `a` が NULL の場合、NULL を返す

## Examples

```sql
select cos(1);
```
```text
+---------------------+
| cos(1.0)            |
+---------------------+
| 0.54030230586813977 |
+---------------------+
```
```sql
select cos(0);
```
```text
+------------------------+
| cos(cast(0 as DOUBLE)) |
+------------------------+
|                    1.0 |
+------------------------+
```
```sql
select cos(Pi());
```
```text
+-----------+
| cos(pi()) |
+-----------+
|        -1 |
+-----------+
```
```sql
select cos(cast('nan' as double));
```
```text
+----------------------------+
| cos(cast('nan' AS DOUBLE)) |
+----------------------------+
| NaN                        |
+----------------------------+
```
```sql
select cos(cast('inf' as double));
```
```text
+----------------------------+
| cos(cast('inf' AS DOUBLE)) |
+----------------------------+
| NaN                        |
+----------------------------+
```
```sql
select cos(cast('-inf' as double));
```
```text
+-----------------------------+
| cos(cast('-inf' AS DOUBLE)) |
+-----------------------------+
| NaN                         |
+-----------------------------+
```
