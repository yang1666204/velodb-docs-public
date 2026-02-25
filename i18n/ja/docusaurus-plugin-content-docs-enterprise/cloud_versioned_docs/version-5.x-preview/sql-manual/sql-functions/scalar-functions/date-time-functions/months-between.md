---
{
  "title": "MONTHS_BETWEEN",
  "description": "MONTHSDIFF関数とは異なり、MONTHSBETWEEN関数は日の部分を無視せず、以下を表す浮動小数点数を返します",
  "language": "ja"
}
---
## 説明

[MONTHS_DIFF関数](./months-diff)とは異なり、MONTHS_BETWEEN関数は日の要素を無視せず、日付に表示される月の単位の単純な差ではなく、実際の月の差を表す浮動小数点数を返します。

MONTHS_BETWEEN関数は、2つのdatetime値間の月の差を計算するために使用され、浮動小数点の結果を返します。この関数は、DATEとDATETIME型の処理をサポートし、オプションのパラメータを通じて結果が丸められるかどうかを制御できます。

この関数は、Oracleの[MONTHS_BETWEEN関数](https://docs.oracle.com/cd/E11882_01/olap.112/e23381/row_functions042.htm#OLAXS434)と一貫した動作をします。

## 構文

```sql
MONTHS_BETWEEN(`<date_or_time_expr1>`, `<date_or_time_expr2>` [, `<round_type>`])
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<date_or_time_expr1>` | 終了日。date/datetimeタイプをサポートします。具体的なdatetimeとdateフォーマットについては、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)と[date conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/date-conversion)を参照してください。 |
| `<date_or_time_expr2>` | 開始日。date/datetimeタイプおよびdatetimeフォーマットに準拠した文字列をサポートします。 |
| `<round_type>` | 結果を小数点第8位に四捨五入するかどうか。`true`または`false`をサポートします。デフォルトは`true`です。 |

## Return Value

`<date_or_time_expr1>`から`<date_or_time_expr2>`を減算して得られる月数を、DOUBLE型で返します。

Result = (`<date_or_time_expr1>`.year - `<date_or_time_expr2>`.year) * 12 + `<date_or_time_expr1>`.month - `<date_or_time_expr2>`.month + (`<date_or_time_expr1>`.day - `<date_or_time_expr2>`.day) / 31.0

- `<date_or_time_expr1>`または`<date_or_time_expr2>`がNULL、もしくは両方がNULLの場合、NULLを返します
- `<round_type>`がtrueの場合、結果は小数点第8位に四捨五入されます。そうでなければ、DOUBLE精度（小数点第15位）を維持します
- `<date_or_time_expr1>`が`<date_or_time_expr2>`より早い場合、負の値を返します
- 時間成分（時、分、秒）は計算に影響しません。日付成分（年、月、日）のみが使用されます

`<date_or_time_expr1>`と`<date_or_time_expr2>`が以下の条件を満たす場合、この関数は整数の月差分を返します（日の差による小数部分は無視されます）：

- 両方の日付がそれぞれの月の最終日である場合（例：2024-01-31と2024-02-29）
- 両方の日付が同じ日成分を持つ場合（例：2024-01-15と2024-03-15）

## Examples

```sql
--- Month difference between two dates
SELECT MONTHS_BETWEEN('2020-12-26', '2020-10-25') AS result;
+------------+
| result     |
+------------+
| 2.03225806 |
+------------+

--- Including time components (does not affect result)
SELECT MONTHS_BETWEEN('2020-12-26 15:30:00', '2020-10-25 08:15:00') AS result;
+------------+
| result     |
+------------+
| 2.03225806 |
+------------+

--- Disable rounding (preserve original precision)
SELECT MONTHS_BETWEEN('2020-10-25', '2020-12-26', false) AS result;
+---------------------+
| result              |
+---------------------+
| -2.032258064516129  |
+---------------------+

--- Both are month-end dates (special handling, returns integer)
SELECT MONTHS_BETWEEN('2024-02-29', '2024-01-31') AS result;
+--------+
| result |
+--------+
|      1 |
+--------+

--- Same day component (special handling, returns integer)
SELECT MONTHS_BETWEEN('2024-03-15', '2024-01-15') AS result;
+--------+
| result |
+--------+
|      2 |
+--------+

--- Different day components and not month-end
SELECT MONTHS_BETWEEN('2024-02-29', '2024-01-30') AS result;
+------------+
| result     |
+------------+
| 0.96774194 |
+------------+

--- Input is NULL (returns NULL)
SELECT MONTHS_BETWEEN(NULL, '2024-01-01') AS result;
+--------+
| result |
+--------+
| NULL   |
+--------+
```
