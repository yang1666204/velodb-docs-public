---
{
  "title": "LEAD",
  "description": "LEAD()は、セルフ結合を実行することなく後続の行からデータにアクセスするために使用されるウィンドウ関数です。",
  "language": "ja"
}
---
## 説明

LEAD()は、自己結合を実行することなく後続の行からデータにアクセスするために使用されるウィンドウ関数です。パーティション内の現在の行からN行後の値を取得します。

## 構文

```sql
LEAD ( <expr> [ , <offset> [ , <default> ] ] )
```
## パラメータ
| Parameter           | デスクリプション                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| expr                | 値を取得する必要がある式                                                                                                          |
| offset              | 後方に検索する行数 |
| default             | offsetがウィンドウ範囲を超えた場合に返すデフォルト値                                                            |

## Return Value

入力式と同じデータ型を返します。

## Examples

各営業担当者の現在の売上と翌日の売上の差を計算します：

```sql
select stock_symbol, closing_date, closing_price,    
case   
(lead(closing_price,1, 0)   
over (partition by stock_symbol order by closing_date)-closing_price) > 0   
when true then "higher"   
when false then "flat or lower"    
end as "trending"   
from stock_ticker    
order by closing_date;
```
```text
+--------------+---------------------+---------------+---------------+
| stock_symbol | closing_date        | closing_price | trending      |
| ------------ | ------------------- | ------------- | ------------- |
| JDR          | 2014-09-13 00:00:00 | 12.86         | higher        |
| JDR          | 2014-09-14 00:00:00 | 12.89         | higher        |
| JDR          | 2014-09-15 00:00:00 | 12.94         | flat or lower |
| JDR          | 2014-09-16 00:00:00 | 12.55         | higher        |
| JDR          | 2014-09-17 00:00:00 | 14.03         | higher        |
| JDR          | 2014-09-18 00:00:00 | 14.75         | flat or lower |
| JDR          | 2014-09-19 00:00:00 | 13.98         | flat or lower |
+--------------+---------------------+---------------+---------------+
```
