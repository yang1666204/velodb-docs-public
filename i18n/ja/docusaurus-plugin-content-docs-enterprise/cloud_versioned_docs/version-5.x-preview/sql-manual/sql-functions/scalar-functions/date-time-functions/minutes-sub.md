---
{
  "title": "I don't see any text to translate in your message. You mentioned \"Text:\" followed by \"MINUTES_SUB\", but \"MINUTES_SUB\" appears to be a variable name or identifier rather than English technical documentation text that needs translation.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
  "description": "MINUTESSUB関数は、入力されたdatetime値から指定された分数を減算し、結果として得られる新しいdatetime値を返します。",
  "language": "ja"
}
---
## 説明

MINUTES_SUB関数は、入力されたdatetime値から指定された分数を減算し、結果として得られる新しいdatetime値を返します。この関数はDATEおよびDATETIME型の処理をサポートしています。

この関数は、MINUTEを単位として使用する場合、[date_sub function](./date-sub)およびMySQLの[date_sub function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_date-sub)と一致しています。

## 構文

```sql
MINUTES_SUB(`<date_or_time_expr>`, `<minutes>`)
```
## パラメータ

| パラメータ | 説明 |
| --------- | ----------- |
| `<date_or_time_expr>` | 入力日時値で、DATEまたはDATETIME型を指定できます。特定の日時/日付形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)および[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください。 |
| `<minutes>` | 減算する分数で、BIGINT型です。正または負の値を指定できます。 |

## 戻り値

指定した分数を減算した後の日時値を表すDATETIME型の値を返します。

- `<minutes>`が負の値の場合、関数は対応する分数をベース時間に加算するのと同じ動作をします（すなわち、MINUTES_SUB(date, -n)はMINUTES_ADD(date, n)と同等です）。
- 入力がDATE型の場合（年、月、日のみを含む）、時間部分はデフォルトで00:00:00になります。
- 入力日時にマイクロ秒が含まれている場合、分数を減算した後も元のマイクロ秒精度が保持されます（例：'2023-01-01 00:01:00.123456'は1分減算後に'2023-01-01 00:00:00.123456'になります）。
- 計算結果がDATETIME型の有効範囲（0000-01-01 00:00:00から9999-12-31 23:59:59.999999）を超える場合、例外がスローされます。
- いずれかのパラメータがNULLの場合、NULLを返します。

## 例

```sql
-- Subtract minutes from DATETIME
SELECT MINUTES_SUB('2020-02-02 02:02:02', 1) AS result;
+---------------------+
| result              |
+---------------------+
| 2020-02-02 02:01:02 |
+---------------------+

-- Time with microseconds (preserves precision)
SELECT MINUTES_SUB('2023-07-13 22:38:18.456789', 10) AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 22:28:18.456789 |
+----------------------------+

-- Negative minutes (equivalent to addition)
SELECT MINUTES_SUB('2023-07-13 22:23:18', -5) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 22:28:18 |
+---------------------+

-- Input is of DATE type (default time 00:00:00)
SELECT MINUTES_SUB('2023-07-13', 30) AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-12 23:30:00 |
+---------------------+

-- Any parameter is NULL, returns NULL
SELECT MINUTES_SUB(NULL, 10), MINUTES_SUB('2023-07-13 22:28:18', NULL) AS result;
+-----------------------+--------+
| MINUTES_SUB(NULL, 10) | result |
+-----------------------+--------+
| NULL                  | NULL   |
+-----------------------+--------+


-- Calculation result exceeds datetime range, throws error
SELECT MINUTES_SUB('0000-01-01 00:00:00', 1) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation minutes_add of 0000-01-01 00:00:00, -1 out of range
```
