---
{
  "title": "MONTH_CEIL",
  "description": "monthceil関数は、入力されたdatetime値を指定された月間隔の最も近い上位の値に切り上げます。originが指定されている場合、",
  "language": "ja"
}
---
## 説明

month_ceil関数は、入力されたdatetime値を指定された月間隔の最も近い上位の値に切り上げます。originが指定されている場合は、それをベースラインとして使用します。そうでなければ、デフォルトで0001-01-01 00:00:00を使用します。

日付計算式：
$$
\begin{aligned}
&\text{month\_ceil}(\langle\text{date\_or\_time\_expr}\rangle, \langle\text{period}\rangle, \langle\text{origin}\rangle) = \\
&\min\{\langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{month} \mid \\
&k \in \mathbb{Z} \land \langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{month} \geq \langle\text{date\_or\_time\_expr}\rangle\}
\end{aligned}
$$
$k$は、ベースライン時刻から目標時刻に到達するために必要な期間数を表します。

## 構文

```sql
MONTH_CEIL(`<date_or_time_expr>`)
MONTH_CEIL(`<date_or_time_expr>`, `<origin>`)
MONTH_CEIL(`<date_or_time_expr>`, `<period>`)
MONTH_CEIL(`<date_or_time_expr>`, `<period>`, `<origin>`)
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<date_or_time_expr>` | 切り上げ対象となる datetime 値です。date/datetime 型をサポートする有効な日付式です。具体的な datetime および date フォーマットについては、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion) および [date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion) を参照してください。 |
| `<period>` | 月間隔値で、INT 型です。各間隔に含まれる月数を表します。 |
| `<origin>` | 間隔の開始時点です。date/datetime 型をサポートします。デフォルト値は 0001-01-01 00:00:00 です。 |

## Return Value

DATETIME 型の値を返します。これは入力 datetime に基づいて指定された月間隔の最も近い値に切り上げられた後の時間値を表します。結果の時間コンポーネントは 00:00:00 に設定され、日コンポーネントは 01 に切り詰められます。

- `<period>` が非正の数（≤0）の場合、エラーを返します。
- いずれかのパラメータが NULL の場合、NULL を返します。
- period が指定されていない場合、デフォルトで 1 ヶ月間隔になります。
- `<origin>` が指定されていない場合、デフォルトでベースラインとして 0001-01-01 00:00:00 になります。
- 入力が DATE 型の場合（デフォルト時間 00:00:00）。
- 計算結果が最大日付範囲 9999-12-31 23:59:59 を超える場合、エラーを返します。
- `<origin>` の日時が `<period>` より後の場合でも、上記の数式に従って計算されますが、period k は負の値になります。
- date_or_time_expr にスケールがある場合、返される結果にもスケールがあり、小数部分はゼロになります。

## Examples

```sql
-- Using default period of 1 month and default origin time 0001-01-01 00:00:00
SELECT MONTH_CEIL('2023-07-13 22:28:18') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-08-01 00:00:00 |
+---------------------+

-- Using 5 months as one period, rounding up with default origin point
SELECT MONTH_CEIL('2023-07-13 22:28:18', 5) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-12-01 00:00:00 |
+---------------------+

-- If input datetime is exactly at a period starting point, return the input datetime
SELECT MONTH_CEIL('2023-12-01 00:00:00', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-12-01 00:00:00        |
+----------------------------+

-- Only with origin date and specified date
select month_ceil("2023-07-13 22:28:18", "2022-07-04 00:00:00");
+----------------------------------------------------------+
| month_ceil("2023-07-13 22:28:18", "2022-07-04 00:00:00") |
+----------------------------------------------------------+
| 2023-08-04 00:00:00                                      |
+----------------------------------------------------------+

-- Specifying origin time
SELECT MONTH_CEIL('2023-07-13 22:28:18', 5, '2023-01-01 00:00:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-11-01 00:00:00 |
+---------------------+

--- If the <origin> date and time is after the <period>, it will still be calculated according to the above formula, but the period k will be negative
SELECT MONTH_CEIL('2022-09-13 22:28:18', 5, '2028-07-03 22:20:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-02-03 22:20:00 |
+---------------------+

-- Datetime with scale, time component and decimal places are all truncated to 0
SELECT MONTH_CEIL('2023-07-13 22:28:18.456789', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-12-01 00:00:00.000000 |
+----------------------------+

-- Input is of DATE type (default time 00:00:00)
SELECT MONTH_CEIL('2023-07-13', 3) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-10-01 00:00:00 |
+---------------------+

-- Calculation result exceeds maximum date range 9999-12-31, returns error
SELECT MONTH_CEIL('9999-12-13 22:28:18', 5) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation month_ceil of 9999-12-13 22:28:18, 5 out of range

-- Period is non-positive, returns error
SELECT MONTH_CEIL('2023-07-13 22:28:18', -5) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation month_ceil of 2023-07-13 22:28:18, -5 out of range

-- Any parameter is NULL, returns NULL
SELECT MONTH_CEIL(NULL, 5), MONTH_CEIL('2023-07-13 22:28:18', NULL) AS result;
+----------------------+--------+
| month_ceil(NULL, 5)  | result |
+----------------------+--------+
| NULL                 | NULL   |
+----------------------+--------+
```
