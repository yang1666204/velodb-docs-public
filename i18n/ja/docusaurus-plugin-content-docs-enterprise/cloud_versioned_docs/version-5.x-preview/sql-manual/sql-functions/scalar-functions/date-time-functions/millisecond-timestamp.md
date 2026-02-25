---
{
  "title": "MILLISECOND_TIMESTAMP",
  "description": "MILLISECONDTIMESTAMP関数は、入力された日時値を、ローカル時間で調整された1970-01-01 00:00:00から計算されたUnixタイムスタンプに変換します",
  "language": "ja"
}
---
## 説明

`MILLISECOND_TIMESTAMP`関数は、入力されたdatetime値を、`1970-01-01 00:00:00`から計算されたUnixタイムスタンプ（ローカルタイムゾーンオフセットで調整）に変換します。単位はミリ秒（1秒 = 1,000ミリ秒）です。この関数は、ミリ秒精度の`DATETIME`型の処理をサポートし、変換時にタイムゾーンの違いを自動的に無視します（デフォルトの参照としてUTC時間を使用）。

## 構文

```sql
MILLISECOND_TIMESTAMP(`<datetime>`)
```
## Parameters

| Parameter    | Description                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------|
| `<datetime>` | Unixタイムスタンプに変換される日時を表します。`DATETIME`型をサポートします。具体的な日時形式については、[datetime conversion](../../../../sql-manual/basic-element/sql-data-types/conversion/datetime-conversion)を参照してください。 |

## Return Value

入力された日時に対応するUnixタイムスタンプをミリ秒単位で表す`BIGINT`整数を返します（現在のタイムゾーンに変換された総ミリ秒数）。タイムゾーンの設定については、Time Zone Managementを参照してください。

- 入力が`NULL`の場合、関数は`NULL`を返します。
- マイクロ秒を含む日時値を変換します（自動的にミリ秒に切り捨てられます）。
- 入力された日時が`1970-01-01 00:00:00.000 UTC`より前の場合、結果は負の値になります。

## Examples

```sql
-- Convert a DATETIME with millisecond precision, executed in a machine with the East 8 time zone
SELECT MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123');
+--------------------------------------------------+
| MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123') |
+--------------------------------------------------+
|                                    1737606896123 |
+--------------------------------------------------+

-- Explicitly specify the time zone as UTC
SELECT MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123 UTC');
+------------------------------------------------------+
| MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123 UTC') |
+------------------------------------------------------+
|                                        1737635696123 |
+------------------------------------------------------+

-- Convert datetime values with microseconds (automatically truncated to milliseconds)
SELECT MILLISECOND_TIMESTAMP('2024-01-01 00:00:00.123456');
+-----------------------------------------------------+
| MILLISECOND_TIMESTAMP('2024-01-01 00:00:00.123456') |
+-----------------------------------------------------+
|                                       1704038400123 |
+-----------------------------------------------------+

-- Specified time zone is out of range, returns NULL
SELECT MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123456 +15:00');
+------------------------------------------------------------+
| MILLISECOND_TIMESTAMP('2025-01-23 12:34:56.123456 +15:00') |
+------------------------------------------------------------+
|                                                       NULL |
+------------------------------------------------------------+

-- If the input datetime is before 1970 (standard UTC), returns a negative value
SELECT MILLISECOND_TIMESTAMP('1960-01-01 00:00:00 UTC');
+---------------------------------------------------+
| MILLISECOND_TIMESTAMP('1960-01-01 00:00:00 UTC') |
+---------------------------------------------------+
|                                  -315619200000000 |
+---------------------------------------------------+

-- Input type is DATE, time part is automatically set to 00:00:00.000 (results are negative in East 8 time zone)
SELECT MILLISECOND_TIMESTAMP('1970-01-01');
+-------------------------------------+
| MILLISECOND_TIMESTAMP('1970-01-01') |
+-------------------------------------+
|                           -28800000 |
+-------------------------------------+

-- Input is NULL, returns NULL
SELECT MILLISECOND_TIMESTAMP(NULL);
+-----------------------------+
| MILLISECOND_TIMESTAMP(NULL) |
+-----------------------------+
|                        NULL |
+-----------------------------+
```
