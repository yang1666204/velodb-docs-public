---
{
  "title": "EXPLODE_NUMBERS",
  "description": "explodenumbers Table関数は整数 n を受け取り、範囲内のすべての数値を複数の行に展開し、各行には単一の数値が含まれます。",
  "language": "ja"
}
---
## デスクリプション

`explode_numbers`Table関数は整数nを受け取り、範囲内のすべての数値を複数の行に展開し、各行には単一の数値が含まれます。連続する数値のシーケンスを生成するために一般的に使用され、多くの場合LATERAL VIEWと組み合わせて使用されます。

`explode_numbers_outer`は`explode_numbers`とは異なり、Table関数が0行を生成する場合にNULL行を追加します。

## Syntax

```sql
EXPLODE_NUMBERS(<n>)
EXPLODE_NUMBERS_OUTER(<n>)
```
## パラメータ

| Parameter | デスクリプション |
| -- | -- |
| `<n>` | 整数型の入力 |

## Return Value

[0, n) の数列を返します。

- n が 0 または NULL の場合、行は返されません。

## Examples

```sql
select e1 from (select 1 k1) as t lateral view explode_numbers(5) tmp1 as e1;
```
```text
+------+
| e1   |
+------+
|    0 |
|    1 |
|    2 |
|    3 |
|    4 |
+------+
```
```sql
select e1 from (select 1 k1) as t lateral view explode_numbers(0) tmp1 as e1;
Empty set
```
```sql
select e1 from (select 1 k1) as t lateral view explode_numbers_outer(0) tmp1 as e1;
```
```text
+------+
| e1   |
+------+
| NULL |
+------+
```
