---
{
  "title": "DENSE_RANK",
  "description": "DENSERANK() は、グループ内でランキングを計算するために使用されるウィンドウ関数です。RANK() とは異なり、DENSERANK() はギャップなしで連続したランキングを返します。",
  "language": "ja"
}
---
## Description

DENSE_RANK()は、グループ内でランキングを計算するために使用されるウィンドウ関数です。RANK()とは異なり、DENSE_RANK()はギャップなしで連続したランキングを返します。ランキング値は1から始まり、順次増分されます。同一の値がある場合、それらは同じランクを受け取ります。

## Syntax

```sql
DENSE_RANK()
```
## 戻り値

1から始まるBIGINT型のランキング値を返します。

## 例

```sql
select x, y, dense_rank() over(partition by x order by y) as rank from int_t;
```
```text
+-----+-----+------+
| x   | y   | rank |
| --- | --- | ---- |
| 1   | 1   | 1    |
| 1   | 2   | 2    |
| 1   | 2   | 2    | -- Same values receive the same rank |
| 2   | 1   | 1    |
| 2   | 2   | 2    |
| 2   | 3   | 3    | -- Rankings are consecutive, no gaps |
| 3   | 1   | 1    |
| 3   | 1   | 1    |
| 3   | 2   | 2    |
+-----+-----+------+
```
