---
{
  "title": "COUNT",
  "description": "指定された列のNULL以外のレコード数、または総レコード数を返します。",
  "language": "ja"
}
---
## 説明

指定した列の非NULL レコード数、または総レコード数を返します。

## 構文

```sql
COUNT(DISTINCT <expr> [,<expr>,...])
COUNT(*)
COUNT(<expr>)
```
## パラメータ

| Parameter | デスクリプション |
| -- | -- |
| `<expr>` | 条件式（カラム名） |

## Return Value

戻り値は数値型です。exprがNULLの場合、パラメータ統計は生成されません。

## Example

```sql
select * from test_count;
```
```text
+------+------+------+
| id   | name | sex  |
+------+------+------+
|    1 | 1    |    1 |
|    2 | 2    |    1 |
|    3 | 3    |    1 |
|    4 | 0    |    1 |
|    4 | 4    |    1 |
|    5 | NULL |    1 |
+------+------+------+
```
```sql
select count(*) from test_count;
```
```text
+----------+
| count(*) |
+----------+
|        6 |
+----------+
```
```sql
select count(name) from test_insert;
```
```text
+-------------+
| count(name) |
+-------------+
|           5 |
+-------------+
```
```sql
select count(distinct sex) from test_insert;
```
```text
+---------------------+
| count(DISTINCT sex) |
+---------------------+
|                   1 |
+---------------------+
```
```sql
select count(distinct id,sex) from test_insert;
```
```text
+-------------------------+
| count(DISTINCT id, sex) |
+-------------------------+
|                       5 |
+-------------------------+
```
