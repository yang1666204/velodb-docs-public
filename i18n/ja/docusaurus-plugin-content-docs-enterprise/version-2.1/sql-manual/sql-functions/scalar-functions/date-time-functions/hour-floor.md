---
{
  "title": "HOUR_FLOOR",
  "description": "指定された時間間隔期間の最も近い切り捨てられたタイムスタンプに日付を変換します。",
  "language": "ja"
}
---
## 説明

日付を指定された時間間隔期間の最も近い切り下げられたタイムスタンプに変換します。

## 構文

```sql
HOUR_FLOOR(<datetime>)
HOUR_FLOOR(<datetime>, <origin>)
HOUR_FLOOR(<datetime>, <period>)
HOUR_FLOOR(<datetime>, <period>, <origin>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<datetime>` | 有効な日付表現 |
| `<period>` | 各期間を構成する時間数を指定 |
| `<origin>` | 時間の開始点。指定されない場合、デフォルトは0001-01-01T00:00:00 |

## Return Value

指定された時間間隔期間の最も近い切り下げされたタイムスタンプを返します。

## Examples

```sql
select hour_floor("2023-07-13 22:28:18", 5);
```
```text
+-------------------------------------------------------------+
| hour_floor(cast('2023-07-13 22:28:18' as DATETIMEV2(0)), 5) |
+-------------------------------------------------------------+
| 2023-07-13 21:00:00                                         |
+-------------------------------------------------------------+
```
