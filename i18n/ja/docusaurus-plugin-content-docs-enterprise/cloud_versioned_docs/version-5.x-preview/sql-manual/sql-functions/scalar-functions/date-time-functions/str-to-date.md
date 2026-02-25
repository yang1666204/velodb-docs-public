---
{
  "title": "STR_TO_DATE",
  "description": "この関数は、指定されたフォーマットに基づいて、入力されたdatetime文字列をDATETIME型の値に変換します。",
  "language": "ja"
}
---
## 説明

この関数は、指定された形式に基づいて、入力されたdatetime文字列をDATETIME型の値に変換します。

この関数は、MySQLの[str_to_date関数](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_str-to-date)と一貫した動作をします。

## 構文

```sql
STR_TO_DATE(<datetime_str>, <format>)
```
## Parameters

| Parameter        | Description                                                                                                                                                                                                                                                                                                      |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<datetime_str>` | 必須。変換される日付または時刻を表す入力datetime文字列。サポートされる入力形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)および[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください |
| `<format>`       | 必須。指定されたdatetime形式文字列（`%Y-%m-%d %H:%i:%s`など）。具体的な形式パラメータについては、[DATE_FORMAT](./date-format#parameters)のドキュメントを参照してください                                                                                                               |

さらに、`<format>`は以下の代替形式をサポートし、通常の形式に従って解釈します：

| Alternative Input          | Interpreted as       |
|----------------------------|----------------------|
| `yyyyMMdd`                 | `%Y%m%d`             |
| `yyyy-MM-dd`               | `%Y-%m-%d`           |
| `yyyy-MM-dd HH:mm:ss`      | `%Y-%m-%d %H:%i:%s`  |

## Return Value
変換された日付と時刻を表すDATETIME値を返します。

日付と時刻のマッチング方法は、2つのポインターを使用して両方の文字列の開始を指します：
1. 形式文字列が%記号に遭遇すると、%の後の次の文字が日付/時刻文字列の対応する部分とのマッチングに使用されます。マッチしない場合（例：%Yが10:10:10のような時刻部分とのマッチを試行する、または%の後に%*のようなサポートされていない文字が続く）、エラーが返されます。マッチに成功した場合、次の文字に移動して解析を行います。
2. いずれかの文字列がスペース文字に遭遇した場合、それをスキップして次の文字を解析します。
3. 通常の文字をマッチングする際、両方のポインターが指す文字が等しいかどうかを確認します。等しくない場合はエラーを返し、等しい場合は次の文字を解析します。
4. 日付ポインターが文字列の終端に到達した際、日付/時刻が日付部分のみを含む場合、形式文字列は時刻部分の文字（例：%H）が含まれているかどうかを確認します。含まれている場合、時刻部分は00:00:00に設定されます。
5. 形式文字列ポインターが終端に到達すると、マッチングが終了します。
6. 最後に、マッチした時刻部分が有効かどうかを確認します（例：月は[1,12]の範囲内である必要があります）。無効な場合はエラーを返し、有効な場合は解析された日付と時刻を返します。

- いずれかのパラメータがNULLの場合、NULLを返します
- `<format>`が空文字列の場合、エラーを返します
- マッチングが失敗した場合、エラーを返します

## Examples

```sql
-- Parse using standard format specifiers
SELECT STR_TO_DATE('2025-01-23 12:34:56', '%Y-%m-%d %H:%i:%s') AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:34:56 |
+---------------------+

-- Parse using alternative format
SELECT STR_TO_DATE('2025-01-23 12:34:56', 'yyyy-MM-dd HH:mm:ss') AS result;
+---------------------+
| result              |
+---------------------+
| 2025-01-23 12:34:56 |
+---------------------+

-- Date string only (time defaults to 00:00:00)
SELECT STR_TO_DATE('20230713', 'yyyyMMdd') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-07-13 00:00:00 |
+---------------------+

-- Parse string with week number and weekday
SELECT STR_TO_DATE('200442 Monday', '%X%V %W') AS result;
+------------+
| result     |
+------------+
| 2004-10-18 |
+------------+

-- Parse abbreviated month name and 12-hour time
SELECT STR_TO_DATE('Oct 5 2023 3:45:00 PM', '%b %d %Y %h:%i:%s %p') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-10-05 15:45:00 |
+---------------------+

-- Format does not match string (returns error)
SELECT STR_TO_DATE('2023/01/01', '%Y-%m-%d') AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[INVALID_ARGUMENT]Operation str_to_date of 2023/01/01 is invalid

-- String contains extra characters (automatically ignored)
SELECT STR_TO_DATE('2023-01-01 10:00:00 (GMT)', '%Y-%m-%d %H:%i:%s') AS result;
+---------------------+
| result              |
+---------------------+
| 2023-01-01 10:00:00 |
+---------------------+

-- Parse microseconds (precision preserved)
SELECT STR_TO_DATE('2023-07-13 12:34:56.789', '%Y-%m-%d %H:%i:%s.%f') AS result;
+----------------------------+
| result                     |
+----------------------------+
| 2023-07-13 12:34:56.789000 |
+----------------------------+

-- Any parameter is NULL (returns NULL)
SELECT STR_TO_DATE(NULL, '%Y-%m-%d'), STR_TO_DATE('2023-01-01', NULL) AS result;
+--------------------------------+--------+
| str_to_date(NULL, '%Y-%m-%d')  | result |
+--------------------------------+--------+
| NULL                           | NULL   |
+--------------------------------+--------+

-- Format is an empty string (returns error)
SELECT STR_TO_DATE('2023-01-01', '') AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.3)[INVALID_ARGUMENT]Operation str_to_date of 2023-01-01 is invalid
```
