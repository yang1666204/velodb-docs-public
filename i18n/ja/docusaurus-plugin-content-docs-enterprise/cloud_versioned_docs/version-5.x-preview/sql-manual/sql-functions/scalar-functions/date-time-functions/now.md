---
{
  "title": "今すぐ",
  "description": "NOW関数は現在のシステム日時を取得するために使用され、DATETIME型の値を返します。",
  "language": "ja"
}
---
## 説明

`NOW`関数は現在のシステム日時を取得するために使用され、`DATETIME`型の値を返します。小数秒の精度を指定するためのオプションパラメータをサポートしており、返される結果のマイクロ秒桁数を調整します。

この関数はMySQLの[now function](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_now)と一致しています。

# エイリアス
- current_timestamp()

## 構文

```sql
NOW([`<precision>`])
```
## Parameters

| Parameter | Description |
| --------- | ----------- |
| `<precision>` | 戻り値の小数秒部分の精度を示すオプションパラメータで、0から6の範囲を指定できます。デフォルトは0で、小数秒は返されません。`<br/>`JDK実装の制限により、ユーザーがJDK8でFEをビルドした場合、精度はミリ秒（小数点以下3桁）までしかサポートされず、より高い精度の桁はゼロで埋められます。より高い精度が必要な場合は、JDK11を使用してください。 |

## Return Value

現在のシステム時刻を返します。戻り値の型は`DATETIME`です。
- 指定された`<precision>`が範囲外の場合（例：負の値または6より大きい値）、関数はエラーを返します。

## Examples

```sql
---Get current time
select NOW(),NOW(3),NOW(6);
+---------------------+-------------------------+----------------------------+
| now()               | now(3)                  | now(6)                     |
+---------------------+-------------------------+----------------------------+
| 2025-01-23 11:08:35 | 2025-01-23 11:08:35.561 | 2025-01-23 11:08:35.562000 |
+---------------------+-------------------------+----------------------------+

--- Invalid precision (out of range, error)
SELECT NOW(7) AS result;
ERROR 1105 (HY000): errCode = 2, detailMessage = Invalid precision for NOW function. Precision must be between 0 and 6.

select NOW(-1);
ERROR 1105 (HY000): errCode = 2, detailMessage = Scale of Datetime/Time must between 0 and 6. Scale was set to: -1
```
