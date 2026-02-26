---
{
  "title": "ANY_VALUE",
  "description": "グループ内の式または列から任意の値を返します。非NULL値が存在する場合は任意の非NULL値を返し、そうでなければNULLを返します。",
  "language": "ja"
}
---
## Description

グループ内の式または列から任意の値を返します。非NULL値が存在する場合は、任意の非NULL値を返し、そうでなければNULLを返します。

## Alias

- ANY

## Syntax

```sql
ANY_VALUE(<expr>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr>` | 集約される列または式。 |

## Return Value

非NULL値が存在する場合は任意の非NULL値を返し、そうでなければNULLを返します。

## Example

```sql
select id, any_value(name) from cost2 group by id;
```
```text
+------+-------------------+
| id   | any_value(`name`) |
+------+-------------------+
|    3 | jack              |
|    2 | jack              |
+------+-------------------+
```
