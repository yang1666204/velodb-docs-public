---
{
  "title": "GROUP_BIT_XOR",
  "description": "単一の整数列または式内のすべての値に対してビット単位のxor演算を実行します。",
  "language": "ja"
}
---
## 説明

単一の整数列または式内のすべての値に対してビット単位のxor演算を実行します。

## 構文

```sql
GROUP_BIT_XOR(<expr>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr>` | すべてのINT型をサポート |

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
select group_bit_xor(value) from group_bit;
```
```text
+------------------------+
| group_bit_xor(`value`) |
+------------------------+
|                      4 |
+------------------------+
```
