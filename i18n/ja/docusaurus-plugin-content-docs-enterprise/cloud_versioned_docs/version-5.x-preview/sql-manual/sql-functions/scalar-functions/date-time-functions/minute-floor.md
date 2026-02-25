---
{
  "title": "MINUTE_FLOOR",
  "description": "minutefloor関数は、入力されたdatetime値を指定された分間隔の最も近い値に切り下げます。originが指定された場合、",
  "language": "ja"
}
---
## 説明

minute_floor関数は、入力されたdatetime値を指定された分間隔の最も近い値に切り下げます。originが指定されている場合、それをベースラインとして使用し、そうでなければデフォルトで0001-01-01 00:00:00を使用します。

日付計算式：
$$
\begin{aligned}
&\text{minute\_floor}(\langle\text{date\_or\_time\_expr}\rangle, \langle\text{period}\rangle, \langle\text{origin}\rangle) = \\
&\max\{\langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{minute} \mid \\
&k \in \mathbb{Z} \land \langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{minute} \leq \langle\text{date\_or\_time\_expr}\rangle\}
\end{aligned}
$$
$k$は、ベースライン時刻から対象時刻までの期間数を表します。

## 構文

```sql
MINUTE_FLOOR(`<datetime>`)
MINUTE_FLOOR(`<datetime>`, `<origin>`)
MINUTE_FLOOR(`<datetime>`, `<period>`)
MINUTE_FLOOR(`<datetime>`, `<period>`, `<origin>`)
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<datetime>` | 切り捨てる対象のdatetime値で、DATETIME型です。特定のdatetime形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)を参照してください |
| `<period>` | 分間隔の値で、INT型です。各間隔に含まれる分数を表します。 |
| `<origin>` | 間隔の開始時点で、DATETIME型です。デフォルト値は0001-01-01 00:00:00です。 |

## Return Value

DATETIME型の値を返します。これは、入力されたdatetimeに基づいて、指定された分間隔の最も近い値に切り捨てた後の時刻値を表します。戻り値の精度は、入力パラメータdatetimeの精度と同じです。

- `<period>`が非正の数（≤0）の場合、エラーを返します。
- いずれかのパラメータがNULLの場合、NULLを返します。
- periodが指定されていない場合、デフォルトで1分間隔になります。
- `<origin>`が指定されていない場合、デフォルトで0001-01-01 00:00:00がベースラインになります。
- 入力がDATE型（年、月、日のみを含む）の場合、その時刻部分はデフォルトで00:00:00になります。
- `<origin>`の日時が`<period>`より後の場合でも、上記の公式に従って計算されますが、期間kは負の値になります。
- `date_or_time_expr`にスケールがある場合、返される結果にもスケールがあり、小数部分はゼロになります。

## Examples

```sql
-- Using default period of one minute and default origin time 0001-01-01 00:00:00
SELECT MINUTE_FLOOR('2023-07-13 22:28:18') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 22:28:00 |
+---------------------+

-- Using five minutes as one period, rounding down with default origin point
SELECT MINUTE_FLOOR('2023-07-13 22:28:18.123', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 22:25:00.000    |
+----------------------------+

-- If input datetime is exactly at a period starting point, return the input datetime
SELECT MINUTE_FLOOR('2023-07-13 22:25:00', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 22:25:00.000000 |
+----------------------------+

-- Only with origin date and specified date
select minute_floor("2023-07-13 22:28:18", "2023-07-01 12:21:23");
+------------------------------------------------------------+
| minute_floor("2023-07-13 22:28:18", "2023-07-01 12:21:23") |
+------------------------------------------------------------+
| 2023-07-13 22:27:23                                        |
+------------------------------------------------------------+

-- Specifying origin time
SELECT MINUTE_FLOOR('2023-07-13 22:28:18', 5, '2023-07-13 22:20:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 22:25:00 |
+---------------------+

-- Datetime with scale, all decimal places are truncated to 0
SELECT MINUTE_FLOOR('2023-07-13 22:28:18.456789', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 22:25:00.000000 |
+----------------------------+

-- Input is of DATE type (default time 00:00:00)
SELECT MINUTE_FLOOR('2023-07-13', 30) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 00:00:00 |
+---------------------+

--- If the <origin> date and time is after the <period>, it will still be calculated according to the above formula, but the period k will be negative
SELECT MINUTE_floor('0001-01-01 12:32:18', 5, '2028-07-03 22:20:00') AS result;
+---------------------+
| result              |
+---------------------+
| 0001-01-01 12:30:00 |
+---------------------+

-- Period is non-positive, returns error
SELECT MINUTE_FLOOR('2023-07-13 22:28:18', -5) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation minute_floor of 2023-07-13 22:28:18, -5 out of range

-- Any parameter is NULL, returns NULL
SELECT MINUTE_FLOOR(NULL, 5), MINUTE_FLOOR('2023-07-13 22:28:18', NULL) AS result;
+------------------------+--------+
| minute_floor(NULL, 5)  | result |
+------------------------+--------+
| NULL                   | NULL   |
+------------------------+--------+
```
