---
{
  "title": "I'm ready to translate English technical documentation into Japanese following your specifications. However, I notice that the text you want me to translate shows \"ANY_VALUE\" which appears to be a placeholder rather than actual content.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate?",
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
