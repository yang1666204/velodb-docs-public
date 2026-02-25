---
{
  "title": "RANK",
  "description": "RANK()は、順序付けられたデータセット内の値のランクを返すウィンドウ関数です。ランキングは1から始まり、順次増加します。",
  "language": "ja"
}
---
## 説明

RANK() は、順序付けされたデータセット内の値の順位を返すウィンドウ関数です。順位は1から始まり、順次増加します。同一の値が発生した場合、それらは同じ順位を受け取りますが、これにより順位シーケンスにギャップが生じます。例えば、最初の2行が順位1で同点の場合、次の異なる値は順位3になります（2ではありません）。

## 構文

```sql
RANK()
```
## 戻り値

BIGINT型のランク値を返します。同一の値に対しては同じランクを返しますが、シーケンスにギャップを作成します。

## 例

```sql
SELECT 
    department,
    employee_name,
    salary,
    RANK() OVER (
        PARTITION BY department 
        ORDER BY salary DESC
    ) as salary_rank
FROM employees;
```
```text
+------------+---------------+--------+-------------+
| department | employee_name | salary | salary_rank |
+------------+---------------+--------+-------------+
| Sales      | Alice        | 10000  | 1           |
| Sales      | Bob          | 10000  | 1           |
| Sales      | Charlie      | 8000   | 3           |  -- Note this is 3, not 2
| IT         | David        | 12000  | 1           |
| IT         | Eve          | 11000  | 2           |
| IT         | Frank        | 11000  | 2           |
| IT         | Grace        | 9000   | 4           |  -- Note this is 4, not 3
+------------+---------------+--------+-------------+
```
この例では、データは部門ごとに分割され、各部門内で給与によってランク付けされます。同一の給与が発生した場合（AliceとBob、EveとFrankのように）、それらは同じランクを受け取りますが、これにより後続のランキングにギャップが生じます。
