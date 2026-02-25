---
{
  "title": "I don't see any text following \"EXTRACT\" in your message. Could you please provide the English technical documentation text that you'd like me to translate into Japanese?",
  "description": "EXTRACT関数は、年、月、週、日、時、分、秒などの特定の時間コンポーネントを日付または時刻値から抽出するために使用されます。",
  "language": "ja"
}
---
## 説明

`EXTRACT`関数は、日付や時刻値から年、月、週、日、時、分、秒などの特定の時間コンポーネントを抽出するために使用されます。この関数は、datetimeの特定の部分を正確に取得することができます。

この関数は、MySQLの[extract function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_extract)とほぼ一貫した動作をします。違いは、Dorisが現在、以下のような複合単位入力をサポートしていないことです：

```sql
mysql> SELECT EXTRACT(YEAR_MONTH FROM '2019-07-02 01:02:03');
        -> 201907
```
## 構文

`EXTRACT(<unit> FROM <date_or_time_expr>)`

## パラメータ

| パラメータ | 説明 |
| -- | -- |
| `<unit>` | DATETIMEから指定された単位の値を抽出します。単位は year、month、week、day、hour、minute、second、または microsecond を指定できます |
| `<datetime_or_time_expr>` | date/datetime型および日時形式の文字列をサポートする有効な日付式です。具体的なdatetimeおよびdate形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion) および [date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion) を参照してください |

## 戻り値

抽出された単位に応じて、INT型の日付または時刻の抽出された部分を返します。

week単位の値の範囲は0-53で、以下のように計算されます：

- 日曜日が週の最初の日です。
- その年の最初の日曜日を含む週が第1週です。
- 最初の日曜日より前の日付は第0週に属します。

単位が year、month、day、hour、minute、second、microsecond の場合、datetimeの対応する単位の値を返します。

単位が quarter の場合、1月-3月は1、4月-6月は2、7月-9月は3、10月-12月は4を返します。

特殊ケース：

<date_or_time_expr> が NULL の場合、NULL を返します。
<unit> がサポートされていない単位の場合、エラーが報告されます。

## 例

```sql
-- Extract year, month, day, hour, minute, second, microsecond time components from datetime
select extract(year from '2022-09-22 17:01:30') as year,
extract(month from '2022-09-22 17:01:30') as month,
extract(day from '2022-09-22 17:01:30') as day,
extract(hour from '2022-09-22 17:01:30') as hour,
extract(minute from '2022-09-22 17:01:30') as minute,
extract(second from '2022-09-22 17:01:30') as second,
extract(microsecond from cast('2022-09-22 17:01:30.000123' as datetime(6))) as microsecond;

+------+-------+------+------+--------+--------+-------------+
| year | month | day  | hour | minute | second | microsecond |
+------+-------+------+------+--------+--------+-------------+
| 2022 |     9 |   22 |   17 |      1 |     30 |         123 |
+------+-------+------+------+--------+--------+-------------+

-- Extract quarter from datetime
mysql> select extract(quarter from '2023-05-15') as quarter;
+---------+
| quarter |
+---------+
|       2 |
+---------+

-- Extract week number for the corresponding date. Since the first Sunday of 2024 is on January 7th, all dates before 01-07 return 0
select extract(week from '2024-01-06') as week;
+------+
| week |
+------+
|    0 |
+------+

-- January 7th is the first Sunday, returns 1
select extract(week from '2024-01-07') as week;
+------+
| week |
+------+
|    1 |
+------+

-- Under this rule, 2024 only has weeks 0-52
select extract(week from '2024-12-31') as week;
+------+
| week |
+------+
|   52 |
+------+

-- Input unit does not exist, reports error
select extract(uint from '2024-01-07') as week;

ERROR 1105 (HY000): errCode = 2, detailMessage = Can not found function 'uint'
```
