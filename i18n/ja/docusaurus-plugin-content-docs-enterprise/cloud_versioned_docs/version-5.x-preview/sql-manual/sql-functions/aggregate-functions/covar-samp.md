---
{
  "title": "COVAR_SAMP",
  "description": "2つの変数間の標本共分散を計算します。入力変数のいずれかがNULLの場合、その行は計算に含まれません。",
  "language": "ja"
}
---
## Description

2つの変数間の標本共分散を計算します。入力変数のいずれかがNULLの場合、その行は計算に含まれません。

## Syntax

```sql
COVAR_SAMP(<expr1>, <expr2>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr1>` | 計算する式の一つです。サポートされる型は Double です。 |
| `<expr2>` | 計算する式の一つです。サポートされる型は Double です。 |

## Return Value

expr1 と expr2 のサンプル共分散を返します。戻り値の型は Double です。
グループに有効なデータが存在しない場合は、NULL を返します。

## Example

```sql
-- setup
create table baseall(
    id int,
    x double,
    y double
) distributed by hash(id) buckets 1
properties ("replication_num"="1");

insert into baseall values
    (1, 1.0, 2.0),
    (2, 2.0, 3.0),
    (3, 3.0, 4.0),
    (4, 4.0, NULL),
    (5, NULL, 5.0);
```
```sql
select covar_samp(x,y) from baseall;
```
```text
+-----------------+
| covar_samp(x,y) |
+-----------------+
|               1 |
+-----------------+
```
```sql
select id, covar_samp(x, y) from baseall group by id;
```
```text
+------+------------------+
| id   | covar_samp(x, y) |
+------+------------------+
|    1 |                0 |
|    2 |                0 |
|    3 |                0 |
|    4 |             NULL |
|    5 |             NULL |
+------+------------------+
```
|    4 |             NULL |
|    5 |             NULL |
+------+------------------+

```
