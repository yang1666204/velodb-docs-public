---
{
  "title": "I don't see any text to translate in your message. You've provided \"MINUTES_SUB\" which appears to be a variable name or identifier that should not be translated according to your rules.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
  "description": "日時値から指定された分数を減算し、新しい日時値を返します。",
  "language": "ja"
}
---
## Description

datetime値から指定した分数を減算し、新しいdatetime値を返します。

## Syntax

```sql
MINUTES_SUB(<date>, <minutes>)
```
## Parameters

| Parameter | Description                                      |
|-----------|--------------------------------------------------|
| `<datetime>`  | 入力するdatetime値。DATE、DATETIME、またはDATETIMEV2型を指定可能 |
| `<minutes>`   | 減算する分数。INT型で正または負の値を指定可能 |

## Return Value

指定された分数を減算した後のdatetime値を表すDATETIME型の値を返します。

## Example

```sql
SELECT MINUTES_SUB("2020-02-02 02:02:02", 1);
```
```text
+--------------------------------------------------------------+
| minutes_sub(cast('2020-02-02 02:02:02' as DATETIMEV2(0)), 1) |
+--------------------------------------------------------------+
| 2020-02-02 02:01:02                                          |
+--------------------------------------------------------------+
```
**注意:**
- 減算する分数が負の値の場合、対応する分数が実質的に加算されます。
- この関数は時間や日をまたぐケースを自動的に処理します。
- 入力パラメータがNULLの場合、関数はNULLを返します。
- 結果は元の時刻の秒の部分を保持します。
