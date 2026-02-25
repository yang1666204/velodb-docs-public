---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following your specifications. However, I don't see any actual text to translate - the input shows \"ANY_VALUE\" which appears to be a placeholder.\n\nCould you please provide the actual English technical documentation text you'd like me to translate?",
  "description": "グループ内の式または列から任意の値を返します。NULL以外の値が存在する場合は任意のNULL以外の値を返し、そうでなければNULLを返します。",
  "language": "ja"
}
---
## 説明

グループ内の式または列から任意の値を返します。非NULL値が存在する場合は任意の非NULL値を返し、存在しない場合はNULLを返します。

## エイリアス

- ANY

## 構文

```sql
ANY_VALUE(<expr>)
```
## パラメータ

| Parameter | Description |
| -- | -- |
| `<expr>` | 集計対象の列または式。 |

## 戻り値

非NULL値が存在する場合は任意の非NULL値を返し、存在しない場合はNULLを返します。

## 例

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
