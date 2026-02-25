---
{
  "title": "DATE | String Functions",
  "description": "datetimeから日付を抽出します。",
  "language": "ja"
}
---
# DATE

## 説明

datetimeから日付を抽出します。

## 構文

```sql
DATE DATE(DATETIME datetime)
```
## Parameters

| Parameter | Description |
| -- | -- |
| datetime | 有効な日付式 |

## Return Value

datetimeの日付部分を返します。

## Examples

```sql
select date('2010-12-02 19:28:30');
```
```text
+----------------------------------------------------+
| date(cast('2010-12-02 19:28:30' as DATETIMEV2(0))) |
+----------------------------------------------------+
| 2010-12-02                                         |
+----------------------------------------------------+
```
