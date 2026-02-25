---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following the strict rules you've outlined. However, I notice that the text you want me to translate shows \"ANY_VALUE\" which appears to be a placeholder.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate?",
  "description": "グループ内の式または列から任意の値を返します。NULL以外の値が存在する場合は、任意のNULL以外の値を返し、そうでない場合はNULLを返します。",
  "language": "ja"
}
---
## Description

グループ内の式または列から任意の値を返します。非NULL値が存在する場合、任意の非NULL値を返します。それ以外の場合はNULLを返します。

## Alias

- ANY

## Syntax

```sql
ANY_VALUE(<expr>)
ANY(<expr>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr>` | 集約対象の列または式。サポートされる型：String、Date、DateTime、IPv4、IPv6、Bool、TinyInt、SmallInt、Integer、BigInt、LargeInt、Float、Double、Decimal、Array、Map、Struct、AggState、Bitmap、HLL、QuantileState。 |

## Return Value

NULL以外の値が存在する場合は任意のNULL以外の値を返し、そうでなければNULLを返します。
戻り値の型は入力のexpr型と一致します。

## Example

```sql
-- setup
create table t1(
        k1 int,
        k_string varchar(100),
        k_decimal decimal(10, 2)
) distributed by hash (k1) buckets 1
properties ("replication_num"="1");
insert into t1 values 
    (1, 'apple', 10.01),
    (1, 'banana', 20.02),
    (2, 'orange', 30.03),
    (2, null, null),
    (3, null, null);
```
```sql
select k1, any_value(k_string) from t1 group by k1;
```
String型: 各グループに対して、NULL以外の任意の値を返します。

```text
+------+---------------------+
| k1   | any_value(k_string) |
+------+---------------------+
|    1 | apple               |
|    2 | orange              |
|    3 | NULL                |
+------+---------------------+
```
```sql
select k1, any_value(k_decimal) from t1 group by k1;
```
Decimal型：NULL以外の高精度decimal値を返します。

```text
+------+----------------------+
| k1   | any_value(k_decimal) |
+------+----------------------+
|    1 |                10.01 |
|    2 |                30.03 |
|    3 |                 NULL |
+------+----------------------+
```
```sql
select any_value(k_string) from t1 where k1 = 3;
```
グループ内のすべての値がNULLの場合、NULLを返します。

```text
+---------------------+
| any_value(k_string) |
+---------------------+
| NULL                |
+---------------------+
```
```sql
select k1, any(k_string) from t1 group by k1;
```
エイリアス ANY を使用すると、ANY_VALUE と同じ効果が得られます。

```text
+------+---------------+
| k1   | any(k_string) |
+------+---------------+
|    1 | apple         |
|    2 | orange        |
|    3 | NULL          |
+------+---------------+
```
