---
{
  "title": "GROUP_BIT_OR",
  "description": "単一の整数列または式のすべての値に対してビット単位のOR演算を実行します。",
  "language": "ja"
}
---
## 説明

単一の整数列または式のすべての値に対してビット単位のOR演算を実行します。

## 構文

```sql
GROUP_BIT_OR(<expr>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr>` | すべてのINT型をサポートします |

## Return Value

整数値を返します

## Example

```sql
select * from group_bit;
```
```text
+-------+
| value |
+-------+
|     3 |
|     1 |
|     2 |
|     4 |
+-------+
```
```sql
mysql> select group_bit_or(value) from group_bit;
```
```text
+-----------------------+
| group_bit_or(`value`) |
+-----------------------+
|                     7 |
+-----------------------+
```
