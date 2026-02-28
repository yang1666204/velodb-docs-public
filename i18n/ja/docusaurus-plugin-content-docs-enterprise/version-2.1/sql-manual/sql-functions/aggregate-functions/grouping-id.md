---
{
  "title": "GROUPING_ID",
  "description": "GROUP BY クエリにおける行のグループ化レベルを計算します。",
  "language": "ja"
}
---
## 説明

GROUP BYクエリにおける行のグループ化レベルを計算します。GROUPING_ID関数は、指定された出力行に対してGROUP BYリスト内のどの列が集約されていないかを示す整数ビットマップを返します。この関数は、GROUP BYが指定されている場合にSELECTリスト、HAVING句、またはORDER BY句で使用できます。

## 構文

```sql
GROUPING_ID(<column_expression> [, ...])
```
## パラメータ

| パラメータ               | デスクリプション                                       |
|-------------------------|---------------------------------------------------|
| `<column_expression>`   | GROUP BY句のカラム式。     |

## Return Value

指定されたカラムのグループ化ビットマップを表すBIGINT値を返します。

## Examples

### Example A: グループ化レベルの識別

```sql
SELECT
  department,
  CASE 
    WHEN GROUPING_ID(department, level) = 0 THEN level
    WHEN GROUPING_ID(department, level) = 1 THEN CONCAT('Total: ', department)
    WHEN GROUPING_ID(department, level) = 3 THEN 'Total: Company'
    ELSE 'Unknown'
  END AS `Job Title`,
  COUNT(uid) AS `Employee Count`
FROM employee 
GROUP BY ROLLUP(department, level)
ORDER BY GROUPING_ID(department, level) ASC;
```
*期待される出力:*

```text
+--------------------+---------------------------+----------------+
| department         | Job Title                 | Employee Count |
+--------------------+---------------------------+----------------+
| Board of Directors | Senior                    |              2 |
| Technology         | Senior                    |              3 |
| Sales              | Senior                    |              1 |
| Sales              | Assistant                 |              2 |
| Sales              | Trainee                   |              1 |
| Marketing          | Senior                    |              1 |
| Marketing          | Trainee                   |              2 |
| Marketing          | Assistant                 |              1 |
| Board of Directors | Total: Board of Directors |              2 |
| Technology         | Total: Technology         |              3 |
| Sales              | Total: Sales              |              4 |
| Marketing          | Total: Marketing          |              4 |
| NULL               | Total: Company            |             13 |
+--------------------+---------------------------+----------------+
```
### 例B: GROUPING_IDを使用して結果セットをフィルタする

```sql
SELECT
  department,
  CASE 
    WHEN GROUPING_ID(department, level) = 0 THEN level
    WHEN GROUPING_ID(department, level) = 1 THEN CONCAT('Total: ', department)
    WHEN GROUPING_ID(department, level) = 3 THEN 'Total: Company'
    ELSE 'Unknown'
  END AS `Job Title`,
  COUNT(uid) AS `Count`
FROM employee 
GROUP BY ROLLUP(department, level)
HAVING `Job Title` = 'Senior';
```
*期待される出力:*

```text
+--------------------+-----------+-------+
| department         | Job Title | Count |
+--------------------+-----------+-------+
| Board of Directors | Senior    |     2 |
| Technology         | Senior    |     3 |
| Sales              | Senior    |     1 |
| Marketing          | Senior    |     1 |
+--------------------+-----------+-------+
```
