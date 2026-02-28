---
{
  "title": "MICROSECOND",
  "description": "datetime値からマイクロ秒の部分を抽出します。返される範囲は0から999999です。",
  "language": "ja"
}
---
## 説明

datetime値からマイクロ秒部分を抽出します。戻り値の範囲は0から999999です。

## 構文

```sql
MICROSECOND(<date>)
```
## パラメータ

| Parameter | デスクリプション                                      |
|-----------|--------------------------------------------------|
| `<date>`      | 精度が0より大きいDATETIMEV2型の入力datetime値 |

## Return Value

datetime値のマイクロ秒部分を表すINT型を返します。範囲は0から999999です。精度が6未満の入力の場合、不足する桁は0で埋められます。

## Example

```sql
SELECT MICROSECOND(CAST('1999-01-02 10:11:12.000123' AS DATETIMEV2(6))) AS microsecond;
```
```text
+-------------+
| microsecond |
+-------------+
|         123 |
+-------------+
```
