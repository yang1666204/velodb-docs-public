---
{
  "title": "共通テーブル式",
  "description": "Common Table Expression (CTE)は、SQL文のスコープ内で複数回参照可能な一時的な結果セットを定義します。",
  "language": "ja"
}
---
## 説明

Common Table Expression (CTE)は、SQL文のスコープ内で複数回参照できる一時的な結果セットを定義します。CTEは主にSELECT文で使用されます。

CTEを指定するには、1つ以上のカンマ区切りの句を持つ`WITH`句を使用します。各句は結果セットを生成するサブクエリを提供し、サブクエリに名前を関連付けます。

Dorisは入れ子のCTEをサポートしています。`WITH`句を含む文内では、各CTE名を参照して対応するCTEの結果セットにアクセスできます。CTE名は他のCTEで参照できるため、他のCTEに基づいてCTEを定義することができます。

Dorisは再帰CTEを**サポートしていません**。詳細については、[recursive CTE](https://dev.mysql.com/doc/refman/8.4/en/with.html#common-table-expressions-recursive)に関するMySQLマニュアルをお読みください。

## 例

### 単純なCTE

次の例では、WITH句内でcte1とcte2という名前のCTEを定義し、WITH句の下の最上位レベルのSELECTでそれらを参照しています：

```sql
WITH
  cte1 AS (SELECT a, b FROM table1),
  cte2 AS (SELECT c, d FROM table2)
SELECT b, d FROM cte1 JOIN cte2
WHERE cte1.a = cte2.c;
```
### ネストされたCTE

```sql
WITH
  cte1 AS (SELECT a, b FROM table1),
  cte2 AS (SELECT c, d FROM cte1)
SELECT b, d FROM cte1 JOIN cte2
WHERE cte1.a = cte2.c;
```
### 再帰CTE（サポート対象外）

```sql
WITH r_cte AS (
  SELECT 1 AS user_id, 2 as manager_id
  UNION ALL
  SELECT user_id, manager_id FROM r_cte INNER JOIN (SELECT 1 AS user_id, 2 as manager_id) t ON r_cte.manager_id = t.user_id
)
SELECT * FROM r_cte
