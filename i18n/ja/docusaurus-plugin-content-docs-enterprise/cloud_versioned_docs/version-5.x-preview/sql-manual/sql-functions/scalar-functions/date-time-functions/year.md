---
{
  "title": "YEAR",
  "description": "YEAR関数は、指定された日付または時刻の値から年の部分を抽出し、年を整数として返します。",
  "language": "ja"
}
---
## 説明
YEAR関数は、指定された日付または時刻値から年の部分を抽出し、年を整数として返します。DATEおよびDATETIME型の処理をサポートしています。

この関数は、MySQLの[year function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_year)と一貫した動作をします。

## 構文

```sql
YEAR(`<date_or_time_expr>`)
```
## Parameters

| Parameter | Description |
|-----------|-------------|
| `<date_or_time_expr>` | 年を抽出する日時値。date/datetime型をサポートします。datetime及びdate形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)と[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください |

## Return Value

date/datetime型の年の部分を返します。INT型、範囲は0-9999です。

- 入力パラメータがNULLの場合、NULLを返します

## Examples

```sql
-- Extract year from DATE type
SELECT YEAR('1987-01-01') AS year_date;
+-----------+
| year_date |
+-----------+
|      1987 |
+-----------+

-- Extract year from DATETIME type (ignoring hours, minutes, seconds)
SELECT YEAR('2024-05-20 14:30:25') AS year_datetime;
+---------------+
| year_datetime |
+---------------+
|          2024 |
+---------------+

-- Input is NULL (returns NULL)
SELECT YEAR(NULL) AS null_input;
+------------+
| null_input |
+------------+
| NULL       |
+------------+
```
