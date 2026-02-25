---
{
  "title": "SECONDS_SUB",
  "description": "SECONDSSUB関数は、指定されたdatetime値に対して指定された秒数を減算または加算し、計算されたdatetime値を返します。",
  "language": "ja"
}
---
## 説明

SECONDS_SUB関数は、指定されたdatetime値に対して指定された秒数を減算または加算し、計算されたdatetime値を返します。この関数はDATEおよびDATETIME型の処理をサポートします。負の数が入力された場合、対応する秒数を加算することと同等です。

この関数は、SECONDを単位として使用する場合、[date_sub function](./date-sub)およびMySQLの[date_sub function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_date-sub)と一致します。

## 構文

```sql
SECONDS_SUB(<date_or_time_expr>, <seconds>)
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<date_or_time_expr>` | 必須。入力の日時値。DATE型またはDATETIME型を使用できます。特定の日時/日付フォーマットについては、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)および[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください |
| `<seconds>` | 必須。減算または加算する秒数。整数型（BIGINT）をサポートします。正の数は秒の減算を示し、負の数は秒の加算を示します。 |

## Return Value

入力日時に対応する秒数を加算した後の日時値を返します。型はDATETIMEです。

- `<seconds>`が負の場合、この関数は基準時刻に対応する秒数を加算するのと同じ動作をします（つまり、SECONDS_SUB(date, -n)はSECONDS_ADD(date, n)と同等です）。
- 入力がDATE型の場合（年、月、日のみを含む）、その時刻部分はデフォルトで00:00:00になります。
- 計算結果が日付型の有効範囲を超える場合（DATE型の場合：例外をスローします）。
- いずれかのパラメータがNULLの場合、NULLを返します。

## Examples

```sql
--- Subtract seconds from DATETIME type
SELECT SECONDS_SUB('2025-01-23 12:34:56', 30) AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:34:26 |
+---------------------+

--- Add seconds to DATETIME type (using negative number)
SELECT SECONDS_SUB('2025-01-23 12:34:56', -30) AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:35:26 |
+---------------------+

--- Subtract seconds across minute boundary
SELECT SECONDS_SUB('2023-07-14 00:00:10', 15) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 23:59:55 |
+---------------------+

--- Input is DATE type (default time 00:00:00)
SELECT SECONDS_SUB('2023-01-01', 3600) AS result;  -- Subtract 1 hour (3600 seconds)
+---------------------+
| result              |
+---------------------+
| 2022-12-31 23:00:00 |
+---------------------+

--- DATETIME with microseconds (preserves precision)
SELECT SECONDS_SUB('2023-07-13 10:30:25.123456', 2) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 10:30:23.123456 |
+----------------------------+

--- Returns NULL when input is NULL
SELECT SECONDS_SUB(NULL, 30), SECONDS_SUB('2025-01-23 12:34:56', NULL) AS result;
+-------------------------+--------+
| seconds_sub(NULL, 30)   | result |
+-------------------------+--------+
| NULL                    | NULL   |
+-------------------------+--------+

--- Calculation result exceeds date range
SELECT SECONDS_SUB('0000-01-01 00:00:00', 1) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation seconds_add of 0000-01-01 00:00:00, -1 out of range
```
