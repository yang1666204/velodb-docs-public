---
{
  "title": "ネガティブ",
  "description": "パラメータ x の負の値を返します。",
  "language": "ja"
}
---
## 説明

パラメータ x の負の値を返します。

## 構文

```sql
NEGATIVE(<x>)
```
## Parameters

| Parameter | Description |
|-----------|------------|
| `<x>` | 独立変数は `BIGINT, DOUBLE, and DECIMAL` の型をサポートします |

## Return value

整数または浮動小数点数を返します。特殊なケース：

- パラメータがNULLの場合、NULLを返します。
- パラメータが0の場合、0を返します。

## Example

```sql
SELECT negative(-10);
```
```text
+---------------+
| negative(-10) |
+---------------+
|            10 |
+---------------+
```
```sql
SELECT negative(12);
```
```text
+--------------+
| negative(12) |
+--------------+
|          -12 |
+--------------+
```
```sql
SELECT negative(0);
```
```text
+-------------+
| negative(0) |
+-------------+
|           0 |
+-------------+
```
```sql
SELECT negative(null);
```
```text
+----------------+
| negative(NULL) |
+----------------+
|           NULL |
+----------------+
```
