---
{
  "title": "QUARTER_CEIL",
  "description": "QUARTERCEIL関数は、入力されたdatetime値を指定された四半期の期間の最も近い値に切り上げます。起点時刻が指定された場合、",
  "language": "ja"
}
---
## 概要

QUARTER_CEIL関数は、入力されたdatetime値を指定された四半期期間の最も近い値に切り上げます。基準時刻が指定されている場合、その時刻を期間計算のベースラインとして使用し、指定されていない場合は0001-01-01 00:00:00をデフォルトとします。この関数はDATETIME型とDATE型の処理をサポートします。

日付計算式：
$$
\begin{aligned}
&\text{quarter\_ceil}(\langle\text{date\_or\_time\_expr}\rangle, \langle\text{period}\rangle, \langle\text{origin}\rangle) = \\
&\min\{\langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{quarter} \mid \\
&k \in \mathbb{Z} \land \langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{quarter} \geq \langle\text{date\_or\_time\_expr}\rangle\}
\end{aligned}
$$
$k$はベースライン時刻から目標時刻に到達するために必要な期間数を表します

## 構文

```sql
QUARTER_CEIL(`<date_or_time_expr>`)
QUARTER_CEIL(`<date_or_time_expr>`, `<origin>`)
QUARTER_CEIL(`<date_or_time_expr>`, `<period>`)
QUARTER_CEIL(`<date_or_time_expr>`, `<period>`, `<origin>`)
```
## Parameters

| Parameter | Description |
| ---- | ---- |
| `<date_or_time_expr>` | 切り上げ対象となる日時値。date/datetimeタイプをサポートする有効な日付式です。具体的なdatetimeおよびdateフォーマットについては、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)および[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください。 |
| `<period>` | 四半期ピリオド値、タイプINT、各ピリオドに含まれる四半期数を示します |
| `<origin_datetime>` | ピリオドの開始時点、date/datetimeタイプをサポート、デフォルト値は0001-01-01 00:00:00です |

## 戻り値

DATETIMEタイプを返し、入力された日時に基づいて指定された四半期ピリオドの最も近い値に切り上げた時刻値を返します。戻り値の精度は、入力されたdatetimeパラメータの精度と一致します。

- `<period>`が非正数の場合、エラーを返します。
- いずれかのパラメータがNULLの場合、NULLを返します。
- periodが指定されていない場合、デフォルトで1四半期ピリオドになります。
- `<origin>`が指定されていない場合、デフォルトで0001-01-01 00:00:00がベースラインになります。
- 入力がDATEタイプの場合（デフォルト時刻は00:00:00に設定されます）。
- 計算結果が最大日付範囲9999-12-31 23:59:59を超える場合、エラーを返します
- `<origin>`のdatetimeが`<period>`より後の場合、計算は同じ公式に従いますが、ピリオドkは負の値になります。
- `date_or_time_expr`にスケールがある場合、返される結果もスケールを持ち、小数部分はゼロになります。

## 例

```sql
-- Default period of 1 quarter, default origin time 0001-01-01 00:00:00
SELECT QUARTER_CEIL('2023-07-13 22:28:18') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-10-01 00:00:00 |
+---------------------+

-- Period of 5 quarters, rounding up result with default origin point
SELECT QUARTER_CEIL('2023-07-13 22:28:18', 5) AS result;
+---------------------+
| result              |
+---------------------+
| 2024-10-01 00:00:00 |
+---------------------+

-- With only origin date and specified date
select QUARTER_CEIL("2023-07-13 22:28:18", "2022-07-01 00:00:00");
+-------------------------------------------------------------+
| QUARTER_CEIL("2023-07-13 22:28:18", "2022-07-01 00:00:00") |
+-------------------------------------------------------------+
| 2023-10-01 00:00:00                                         |
+-------------------------------------------------------------+

-- Input datetime exactly at period start point, returns the input datetime
SELECT QUARTER_CEIL('2023-10-01 00:00:00', 1) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-10-01 00:00:00        |
+----------------------------+

-- Specified origin time
SELECT QUARTER_CEIL('2023-07-13 22:28:18', 2, '2023-01-01 00:00:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2024-01-01 00:00:00 |
+---------------------+

--- Datetime with scale, time part and fractional digits are truncated to 0
SELECT QUARTER_CEIL('2023-07-13 22:28:18.456789', 1) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-10-01 00:00:00.000000 |
+----------------------------+

--- If <origin> datetime is after <period>, calculation follows the same formula with negative period k
SELECT QUARTER_CEIL('2022-09-13 22:28:18', 4, '2028-07-01 00:00:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2024-07-01 00:00:00 |
+---------------------+

--- Input as DATE type (default time 00:00:00)
SELECT QUARTER_CEIL('2023-07-13', 1) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-10-01 00:00:00 |
+---------------------+

-- Calculation result exceeds maximum date range 9999-12-31, returns error
SELECT QUARTER_CEIL('9999-10-13 22:28:18', 2) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation quarter_ceil of 9999-10-13 22:28:18, 2 out of range

--- Non-positive period, returns error
SELECT QUARTER_CEIL('2023-07-13 22:28:18', -1) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation quarter_ceil of 2023-07-13 22:28:18, -1 out of range

--- Any parameter is NULL, returns NULL
SELECT QUARTER_CEIL(NULL, 1), QUARTER_CEIL('2023-07-13 22:28:18', NULL) AS result;
+-----------------------+--------+
| quarter_ceil(NULL, 1) | result |
+-----------------------+--------+
| NULL                  | NULL   |
+-----------------------+--------+
```
## ベストプラクティス

[date_ceil](./date-ceil)も参照してください
