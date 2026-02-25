---
{
  "title": "MILLISECOND_TIMESTAMP",
  "description": "MILLISECONDTIMESTAMP関数は、DATETIME値を1970-01-01 00:00:00 UTCを起点とするUnixタイムスタンプ（ミリ秒単位）に変換します。",
  "language": "ja"
}
---
## 概要

`MILLISECOND_TIMESTAMP`関数は、`DATETIME`値を`1970-01-01 00:00:00 UTC`から開始するUnixタイムスタンプ（ミリ秒）に変換します。


## 構文

```sql
MILLISECOND_TIMESTAMP(<datetime>)
```
## Parameters

| Parameter    | Description                                                                           |
|--------------|---------------------------------------------------------------------------------------|
| `<datetime>` | 必須。Unix タイムスタンプ（ミリ秒）に変換される DATETIME 値。 |

## Return Value

- 入力された datetime 値に対応する Unix タイムスタンプ（ミリ秒）を表す整数を返します。
- `<datetime>` が NULL の場合、関数は NULL を返します。
- `<datetime>` が有効な範囲外の場合、関数はエラーまたは予期しない値を返す可能性があります。

## Example

```sql
SELECT MILLISECOND_TIMESTAMP('2025-01-23 12:34:56');
```
```text
+---------------------------------------------------------------------+
| millisecond_timestamp(cast('2025-01-23 12:34:56' as DATETIMEV2(0))) |
+---------------------------------------------------------------------+
|                                                       1737606896000 |
+---------------------------------------------------------------------+
```
