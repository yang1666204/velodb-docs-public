---
{
  "title": "SECOND_CEIL",
  "description": "secondceil関数は、入力されたdatetime値を指定された秒の期間の最も近い上位の値に切り上げます。originが指定されている場合は、それを基準として使用します。",
  "language": "ja"
}
---
## 説明

second_ceil関数は、入力されたdatetime値を、指定された秒周期の最も近い上位の値に切り上げます。originが指定されている場合はそれを基準として使用し、指定されていない場合はデフォルトで0001-01-01 00:00:00を使用します。

日付計算式:
$$
\begin{aligned}
&\text{second\_ceil}(\langle\text{date\_or\_time\_expr}\rangle, \langle\text{period}\rangle, \langle\text{origin}\rangle) = \\
&\min\{\langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{second} \mid \\
&k \in \mathbb{Z} \land \langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{second} \geq \langle\text{date\_or\_time\_expr}\rangle\}
\end{aligned}
$$
$k$は基準時刻から目標時刻に到達するために必要な周期数を表します。

## 構文

```sql
SECOND_CEIL(<datetime>[, <period>][, <origin_datetime>])
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<datetime>` | 必須。入力datetime値。datetime型をサポート。具体的なdatetime形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)を参照。 |
| `<period>` | オプション。各期間を構成する秒数を示す。正の整数型（INT）をサポート。デフォルトは1秒。 |
| `<origin_datetime>` | オプション。アライメントの開始点。datetime型およびdatetime形式に準拠する文字列をサポート。指定されない場合、デフォルトは0001-01-01T00:00:00。 |

## 戻り値

DATETIME型の値を返し、入力datetimeに基づいて指定された秒期間の最も近い値に切り上げた後の時刻値を表します。戻り値の精度は入力datetimeパラメータの精度と一致します。

- `<period>`が非正整数（≤0）の場合、エラーを返します。
- いずれかのパラメータがNULLの場合、NULLを返します。
- periodが指定されない場合、デフォルトで1秒期間となります。
- `<origin>`が指定されない場合、デフォルトで0001-01-01 00:00:00を基準とします。
- 入力がDATE型（年、月、日のみ含む）の場合、その時刻部分はデフォルトで00:00:00となります。
- 計算結果がDATETIME型の有効範囲（0000-01-01 00:00:00から9999-12-31 23:59:59.999999）を超える場合、エラーを返します。
- スケール付きdatetimeの場合、すべての小数部は0に切り捨てられます。
- `<origin>`の日時が`<period>`より後の場合でも、上記の式に従って計算されますが、期間kは負になります。

## Examples

```sql
-- Default period of 1 second, default starting time 0001-01-01 00:00:00
SELECT SECOND_CEIL('2025-01-23 12:34:56') AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:34:56 |
+---------------------+

-- 5-second period, upward rounding result with default starting point
SELECT SECOND_CEIL('2025-01-23 12:34:56', 5) AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:35:00 |
+---------------------+

-- Only with origin date and specified date
select second_ceil("2023-07-13 22:28:18", "2023-07-13 22:13:12.123");
+---------------------------------------------------------------+
| second_ceil("2023-07-13 22:28:18", "2023-07-13 22:13:12.123") |
+---------------------------------------------------------------+
| 2023-07-13 22:28:18.123                                       |
+---------------------------------------------------------------+

-- Specify starting time (origin)
SELECT SECOND_CEIL('2025-01-23 12:34:56', 10, '2025-01-23 12:00:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:35:00 |
+---------------------+

-- If the <origin> date and time is after the <period>, it will still be calculated according to the above formula, but the period k will be negative.
SELECT SECOND_CEIL('2025-01-23 12:34:56', 10, '2029-01-23 12:00:00') AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:35:00 |
+---------------------+

-- Datetime with microseconds, decimal places truncated to 0 after rounding
SELECT SECOND_CEIL('2025-01-23 12:34:56.789', 5) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2025-01-23 12:35:00.000000 |
+----------------------------+

-- Input is DATE type (default time 00:00:00)
SELECT SECOND_CEIL('2025-01-23', 30) AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 00:00:00 |
+---------------------+

-- Calculation result exceeds maximum datetime range, returns error
SELECT SECOND_CEIL('9999-12-31 23:59:59', 2) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation second_ceil of 9999-12-31 23:59:59, 2 out of range

-- Period is non-positive, returns error
mysql> SELECT SECOND_CEIL('2025-01-23 12:34:56', -3) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation second_ceil of 2025-01-23 12:34:56, -3 out of range

-- Any parameter is NULL, returns NULL
SELECT SECOND_CEIL(NULL, 5), SECOND_CEIL('2025-01-23 12:34:56', NULL) AS result;
+------------------------+--------+
| second_ceil(NULL, 5)   | result |
+------------------------+--------+
| NULL                   | NULL   |
+------------------------+--------+
```
