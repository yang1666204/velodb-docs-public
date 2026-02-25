---
{
  "title": "DATE_CEIL",
  "description": "dateceil関数は、指定された日付または時刻の値を、指定された時間間隔期間の最も近い開始時点まで切り上げます。",
  "language": "ja"
}
---
## 説明

date_ceil 関数は、指定された日付または時刻値を、指定された時間間隔期間の最も近い開始点まで切り上げます。期間のルールは period（単位数）と type（単位）で定義され、固定開始点 0001-01-01 00:00:00 から計算されます。

日付計算式：
$$
\begin{aligned}
&\text{date\_ceil}(\langle\text{date\_or\_time\_expr}\rangle, \langle\text{period}\rangle, \langle\text{type}\rangle) = \\
&\min\{\langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{type} \mid \\
&k \in \mathbb{Z} \land \langle\text{origin}\rangle + k \times \langle\text{period}\rangle \times \text{type} \geq \langle\text{date\_or\_time\_expr}\rangle\}
\end{aligned}
$$
$k$ はベース時刻がターゲット時刻に到達するために必要なサイクル数を表します。

$type$ は period の単位を表します

## 構文

`DATE_CEIL(<datetime>, INTERVAL <period> <type>)`

## パラメータ

| Parameter | Description |
| -- | -- |
| `date_or_time_expr` | 有効な日付式で、datetime または date 型の入力をサポートします。具体的な datetime と date の形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion) と [date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion) を参照してください |
| `period` | 各期間が構成する単位数を指定します。INT 型です。開始時点は 0001-01-01T00:00:00 です |
| `type` | YEAR、QUARTER、MONTH、WEEK、DAY、HOUR、MINUTE、SECOND のいずれかです |

## 戻り値

入力値を指定された単位に切り上げた結果を表す日付または時刻値を返します。
切り上げ結果は datetime と同じ型になります：
- 入力が DATE の場合、DATE を返します（日付部分のみ）；
- 入力が DATETIME の場合、DATETIME を返します（日付と時刻を含む）。
- scale を持つ datetime の場合、戻り値も scale を持ち、小数部は 0 になります。

特殊ケース：
- いずれかのパラメータが NULL の場合、NULL を返します；
- 切り上げ結果が日付型でサポートされる範囲を超える場合（例：'9999-12-31 23:59:59' より後）、エラーを返します；
- period パラメータが正の整数でない場合、エラーをスローします。

## 例

```sql
-- Round up seconds to the nearest 5-second interval
mysql> select date_ceil(cast("2023-07-13 22:28:18" as datetime),interval 5 second);

+------------------------------------------------------------------------+
| date_ceil(cast("2023-07-13 22:28:18" as datetime),interval 5 second) |
+------------------------------------------------------------------------+
| 2023-07-13 22:28:20.000000                                             |
+------------------------------------------------------------------------+

-- Date time parameter with scale
mysql> select date_ceil(cast("2023-07-13 22:28:18.123" as datetime(3)),interval 5 second);
+-----------------------------------------------------------------------------+
| date_ceil(cast("2023-07-13 22:28:18.123" as datetime(3)),interval 5 second) |
+-----------------------------------------------------------------------------+
| 2023-07-13 22:28:20.000                                                     |
+-----------------------------------------------------------------------------+

-- Round up to the nearest 5-minute interval
select date_ceil("2023-07-13 22:28:18",interval 5 minute);
+--------------------------------------------------------------+
| minute_ceil('2023-07-13 22:28:18', 5, '0001-01-01 00:00:00') |
+--------------------------------------------------------------+
| 2023-07-13 22:30:00                                          |
+--------------------------------------------------------------+

-- Round up to the nearest 5-week interval
select date_ceil("2023-07-13 22:28:18",interval 5 WEEK);
+--------------------------------------------------+
| date_ceil("2023-07-13 22:28:18",interval 5 WEEK) |
+--------------------------------------------------+
| 2023-08-14 00:00:00                              |
+--------------------------------------------------+

-- Round up to the nearest 5-hour interval
select date_ceil("2023-07-13 22:28:18",interval 5 hour);

+--------------------------------------------------+
| date_ceil("2023-07-13 22:28:18",interval 5 hour) |
+--------------------------------------------------+
| 2023-07-13 23:00:00                   |
+--------------------------------------------------+

-- Round up to the nearest 5-day interval
select date_ceil("2023-07-13 22:28:18",interval 5 day);

+-----------------------------------------------------------+
| day_ceil('2023-07-13 22:28:18', 5, '0001-01-01 00:00:00') |
+-----------------------------------------------------------+
| 2023-07-15 00:00:00                                       |
+-----------------------------------------------------------+

-- Round up to the nearest 5-month interval
select date_ceil("2023-07-13 22:28:18",interval 5 month);

+-------------------------------------------------------------+
| month_ceil('2023-07-13 22:28:18', 5, '0001-01-01 00:00:00') |
+-------------------------------------------------------------+
| 2023-12-01 00:00:00                                         |
+-------------------------------------------------------------+


-- Round up to the nearest 5-year interval
select date_ceil("2023-07-13 22:28:18",interval 5 year);

+-------------------------------------------------------------+
| month_ceil('2023-07-13 22:28:18', 5, '0001-01-01 00:00:00') |
+-------------------------------------------------------------+
| 2023-12-01 00:00:00                                         |
+-------------------------------------------------------------+

-- Exceeds the maximum year
mysql> select date_ceil("9999-07-13",interval 5 year);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation year_ceil of 9999-07-13 00:00:00, 5 out of range

-- Any parameter is NULL
mysql> select date_ceil("9900-07-13",interval NULL year);
+--------------------------------------------+
| date_ceil("9900-07-13",interval NULL year) |
+--------------------------------------------+
| NULL                                       |
+--------------------------------------------+

mysql> select date_ceil(NULL,interval 5 year);
+---------------------------------+
| date_ceil(NULL,interval 5 year) |
+---------------------------------+
| NULL                            |
+---------------------------------+

-- Invalid parameter, period is negative
mysql> select date_ceil("2023-01-13 22:28:18",interval -5 month);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[INVALID_ARGUMENT]Operation month_ceil of 2023-01-13 22:28:18, -5, 0001-01-01 00:00:00 out of range
```
