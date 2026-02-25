---
{
  "title": "WEEKS_ADD",
  "description": "WEEKSADD関数は、指定された日付または時刻値に対して指定された週数を追加（または減算）するために使用されます。",
  "language": "ja"
}
---
## 説明

WEEKS_ADD関数は、指定された日付または時刻値に指定した週数を加算（または減算）するために使用され、元の日付に7日を加算/減算することと等価で、調整された日付または時刻を返します。

この関数は、MySQLでWEEKを単位として使用する[weeks_add function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_weeks-add)と一貫した動作をします。

## 構文

```sql
WEEKS_ADD(`<datetime_or_date_expr>`, `<weeks_value>`)
```
## Parameters
| Parameter | Description |
|-----------|-------------|
| `<datetime_or_date_expr>` | 入力datetime値、date/datetimeタイプをサポートします。datetimeとdateフォーマットについては、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)と[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください |
| `<weeks_value>` | INTタイプの整数、追加または減算する週数を表します（正の値は追加、負の値は減算） |

## 戻り値

指定された週数を追加したdatetimeを返します。

- 入力がDATEタイプの場合、戻り値はDATEタイプのままです（年、月、日のみ調整）。
- 入力がDATETIMEタイプの場合、戻り値はDATETIMEタイプのままです（年、月、日は調整され、時、分、秒は変更されません）。
- `<weeks_value>`が負の数の場合は週を減算することを示します。
- いずれかの入力パラメータがNULLの場合、NULLを返します
- 計算結果が有効な日付タイプの範囲（0000-01-01 00:00:00から9999-12-31 23:59:59）を超える場合、エラーを返します

## Examples

```sql
-- DATETIME type add 1 week (basic functionality, hours, minutes, seconds remain unchanged)
SELECT WEEKS_ADD('2023-10-01 08:30:45', 1) AS add_1_week_datetime;
+---------------------+
| add_1_week_datetime |
+---------------------+
| 2023-10-08 08:30:45 |
+---------------------+

-- DATETIME type subtract 1 week (negative weeks, cross-month)
SELECT WEEKS_ADD('2023-10-01 14:20:10', -1) AS subtract_1_week_datetime;
+--------------------------+
| subtract_1_week_datetime |
+--------------------------+
| 2023-09-24 14:20:10      |
+--------------------------+

-- DATE type add 2 weeks (only adjust date, no time portion)
SELECT WEEKS_ADD('2023-05-20', 2) AS add_2_week_date;
+-----------------+
| add_2_week_date |
+-----------------+
| 2023-06-03      |
+-----------------+

-- Cross-year addition (late December plus 1 week, to early January next year)
SELECT WEEKS_ADD('2023-12-25', 1) AS cross_year_add;
+----------------+
| cross_year_add |
+----------------+
| 2024-01-01     |
+----------------+

-- Input is NULL (returns NULL)
SELECT WEEKS_ADD(NULL, 5) AS null_input;
+------------+
| null_input |
+------------+
| NULL       |
+------------+
```
