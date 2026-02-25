---
{
  "title": "DAY",
  "description": "日付から日の情報を取得します。戻り値は1から31の範囲です。",
  "language": "ja"
}
---
## Description

日付から日の情報を取得します。戻り値の範囲は1から31です。

## Alias

- dayofmonth

## Syntax

```sql
DAY(<dt>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| <`dt`> | 有効な日付式 |

## Return Value

指定された日付から日の情報を返します。

## Examples

```sql
select day('1987-01-31');
```
```text
+----------------------------+
| day('1987-01-31 00:00:00') |
+----------------------------+
|                         31 |
+----------------------------+
```
