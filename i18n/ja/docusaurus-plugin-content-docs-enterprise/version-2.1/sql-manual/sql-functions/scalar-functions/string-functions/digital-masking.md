---
{
  "title": "DIGITAL_MASKING",
  "description": "digitalmasking関数は数値をマスキングするために使用されます。指定されたマスキングルールに基づいて、数値内の特定の文字が.に置き換えられます。",
  "language": "ja"
}
---
## 概要

`digital_masking` 関数は数値をマスクするために使用されます。指定されたマスキングルールに基づいて、数値内の特定の文字が * に置き換えられます。この関数は元の関数 `concat(left(id, 3), '****', right(id, 4))` のエイリアスです。

## 構文

```sql
DIGITAL_MASKING( <digital_number> )
```
## パラメータ

| Parameter | デスクリプション |
| -- | -- |
| `<digital_number>` | マスクする必要のあるデジタル文字列 |

## Return Value

マスクされたデジタル文字列を返します。

## Examples

```sql
select digital_masking(13812345678);
```
```
+------------------------------+
| digital_masking(13812345678) |
+------------------------------+
| 138****5678                  |
+------------------------------+
```
