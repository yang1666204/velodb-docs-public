---
{
  "title": "YEARS_SUB",
  "description": "入力されたdatetime値から指定された年数を減算した結果である新しいdatetime値を返します。",
  "language": "ja"
}
---
## Description

入力されたdatetimeから指定された年数を減算した結果の新しいdatetime値を返します。

## Syntax

```sql
YEARS_SUB(<date>, <years>)
```
## Parameters

| Parameter | Description                                      |
|-----------|--------------------------------------------------|
| `<date>`      | 入力する日時値。DATETIME型またはDATE型を指定可能 |
| `<years>`     | 減算する年数。INT型 |

## Return Value

入力の`<date>`と同じ型（DATETIME型またはDATE型）の値を返します。入力日時から指定された年数を減算した後の時刻値を表します。

## Example

```sql
SELECT YEARS_SUB('2020-02-02 02:02:02', 1);
```
```text
+-------------------------------------+
| years_sub('2020-02-02 02:02:02', 1) |
+-------------------------------------+
| 2019-02-02 02:02:02                 |
+-------------------------------------+
```
