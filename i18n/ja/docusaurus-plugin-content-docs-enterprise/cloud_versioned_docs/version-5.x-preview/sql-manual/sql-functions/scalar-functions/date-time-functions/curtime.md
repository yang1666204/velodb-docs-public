---
{
  "title": "CURTIME,CURRENT_TIME",
  "description": "現在時刻を取得し、TIME型として返します。",
  "language": "ja"
}
---
## 説明

現在の時刻を取得し、TIME型として返します。

この関数はMySQLの[curtime function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_curtime)と一致しています。

## エイリアス

- CURRENT_TIME

## 構文

```sql
CURTIME([<precision>])
```
## Parameters

| Parameter     | Description                                                                                                                                  |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `<precision>` | 戻り値の小数秒部分の精度を示すオプションパラメータで、0から6の範囲の定数値である必要があります。デフォルトは0で、小数秒部分が返されないことを意味します。 |

## Return Value

現在時刻のTIME型を返します。

## Examples

```sql
mysql> select curtime();

+----------------+
| curtime()      |
+----------------+
| 15:25:47       |
+----------------+
```
```sql
mysql> select curtime(0);
+------------+
| curtime(0) |
+------------+
| 13:15:27   |
+------------+
```
```sql
mysql> select curtime(4);
+---------------+
| curtime(4)    |
+---------------+
| 15:31:03.8958 |
+---------------+
```
```sql
mysql> select curtime(7);
ERROR 1105 (HY000): errCode = 2, detailMessage = The precision must be between 0 and 6
```
