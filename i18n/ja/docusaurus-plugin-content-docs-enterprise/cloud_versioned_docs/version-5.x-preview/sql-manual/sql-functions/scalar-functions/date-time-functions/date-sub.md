---
{
  "title": "DATE_SUB",
  "description": "DATESUB関数は、指定された日付または時刻の値から指定された時間間隔を減算し、計算された日付または時刻の結果を返すために使用されます。",
  "language": "ja"
}
---
## 説明

DATE_SUB関数は、指定した日付または時刻の値から指定した時間間隔を減算し、計算された日付または時刻の結果を返すために使用されます。この関数はDATE（日付のみ）およびDATETIME（日付と時刻）タイプでの操作をサポートし、時間間隔は数値と単位の両方で定義されます。

この関数は一般的にMySQLの[date_sub function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_date-sub)と一貫した動作をしますが、違いはMySQLが複合単位の加算と減算をサポートしていることです。例えば：

```sql
SELECT DATE_SUB('2025-01-01 00:00:00',INTERVAL '1 1:1:1' DAY_SECOND);
        -> '2024-12-30 22:58:59'
```
Dorisはこの種類の入力をサポートしていません。

## エイリアス

- days_sub
- subdate

## 構文

```sql
DATE_SUB(<date_or_time_part>, <expr> <time_unit>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<date_or_time_part>` | 有効な日付値で、datetime または date 型をサポートします。具体的な datetime と date の形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion) と [date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion) を参照してください |
| `<expr>` | 減算される時間間隔で、型は `INT` です |
| `<time_unit>` | 列挙値：YEAR、QUARTER、MONTH、WEEK、DAY、HOUR、MINUTE、SECOND |

## Return Value

date と同じ型で計算結果を返します：
- 入力が DATE の場合、DATE を返します（日付部分のみ）；
- 入力が DATETIME の場合、DATETIME を返します（日付と時刻を含む）。
- scale を持つ datetime 型の場合、scale は保持されて返されます。

特殊なケース：
- いずれかのパラメータが NULL の場合、NULL を返します；
- 不正な expr（負の値）または time_unit の場合、NULL を返します；
- 計算結果が日付型でサポートされる最小値より前になる場合（例：'0000-01-01' より前）、エラーを返します。

## Examples

```sql
-- Subtract two days
mysql> select date_sub(cast('2010-11-30 23:59:59' as datetime), INTERVAL 2 DAY);

+-------------------------------------------------------------------+
| date_sub(cast('2010-11-30 23:59:59' as datetime), INTERVAL 2 DAY) |
+-------------------------------------------------------------------+
| 2010-11-28 23:59:59                                               |
+-------------------------------------------------------------------+

-- Parameter with scale, return preserves scale
mysql> select date_sub('2010-11-30 23:59:59.6', INTERVAL 4 SECOND);
+------------------------------------------------------+
| date_sub('2010-11-30 23:59:59.6', INTERVAL 4 SECOND) |
+------------------------------------------------------+
| 2010-11-30 23:59:55.6                                |
+------------------------------------------------------+

-- Subtract two months across years
mysql> select date_sub(cast('2023-01-15' as date), INTERVAL 2 MONTH);
+--------------------------------------------------------+
| date_sub(cast('2023-01-15' as date), INTERVAL 2 MONTH) |
+--------------------------------------------------------+
| 2022-11-15                                             |
+--------------------------------------------------------+

-- February 2023 has only 28 days, so subtracting one month from 2023-03-31 results in 2023-02-28
mysql> select date_sub('2023-03-31', INTERVAL 1 MONTH);
+------------------------------------------+
| date_sub('2023-03-31', INTERVAL 1 MONTH) |
+------------------------------------------+
| 2023-02-28                               |
+------------------------------------------+

-- Subtract 61 seconds
mysql> select date_sub('2023-12-31 23:59:59', INTERVAL 61 SECOND);
+-----------------------------------------------------+
| date_sub('2023-12-31 23:59:59', INTERVAL 61 SECOND) |
+-----------------------------------------------------+
| 2023-12-31 23:58:58                                 |
+-----------------------------------------------------+

-- Subtract quarters
mysql> select date_sub('2023-12-31 23:59:59', INTERVAL 61 QUARTER);
+------------------------------------------------------+
| date_sub('2023-12-31 23:59:59', INTERVAL 61 QUARTER) |
+------------------------------------------------------+
| 2008-09-30 23:59:59                                  |
+------------------------------------------------------+

-- Any parameter is NULL
mysql> select date_sub('2023-01-01', INTERVAL NULL DAY);
+-------------------------------------------+
| date_sub('2023-01-01', INTERVAL NULL DAY) |
+-------------------------------------------+
| NULL                                      |
+-------------------------------------------+

-- Exceeds minimum date
mysql> select date_sub('0000-01-01', INTERVAL 1 DAY);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation day_add of 0000-01-01, -1 out of range

select date_sub('9999-01-01', INTERVAL -1 YEAR);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[E-218]Operation year_add of 9999-01-01, 1 out of range
```
```
