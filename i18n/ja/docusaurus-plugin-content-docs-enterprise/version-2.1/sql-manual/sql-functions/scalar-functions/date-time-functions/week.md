---
{
  "title": "週",
  "description": "dateの週番号を返します。mode引数の値はデフォルトで0です。以下の表は、mode引数がどのように動作するかを説明しています。",
  "language": "ja"
}
---
## week
### 説明
#### 構文

`INT WEEK(DATE date[, INT mode])`

dateの週番号を返します。mode引数の値のデフォルトは0です。
以下の表は、mode引数がどのように動作するかを説明しています。

|Mode |週の最初の曜日      |範囲    |週1は最初の週…                |
|:----|:-----------------|:------|:-----------------------------|
|0    |Sunday            |0-53   |with a Sunday in this year    |
|1    |Monday            |0-53   |with 4 or more days this year |
|2    |Sunday            |1-53   |with a Sunday in this year    |
|3    |Monday            |1-53   |with 4 or more days this year |
|4    |Sunday            |0-53   |with 4 or more days this year |
|5    |Monday            |0-53   |with a Monday in this year    |
|6    |Sunday            |1-53   |with 4 or more days this year |
|7    |Monday            |1-53   |with a Monday in this year    |

パラメータはDateまたはDatetime型です

### 例

```
mysql> select week('2020-1-1');
+------------------+
| week('2020-1-1') |
+------------------+
|                0 |
+------------------+
```
```
mysql> select week('2020-7-1',1);
+---------------------+
| week('2020-7-1', 1) |
+---------------------+
|                  27 |
+---------------------+
```
### keywords
    WEEK
