---
{
  "title": "EXPLODE",
  "description": "explode関数は配列を入力として受け取り、配列の各要素を個別の行にマッピングします。",
  "language": "ja"
}
---
## Description

`explode`関数は配列を入力として受け取り、配列の各要素を個別の行にマップします。この関数は通常、LATERAL VIEWと組み合わせて使用され、ネストされたデータ構造を標準的なテーブル形式に平坦化します。explodeと`explode_outer`の主な違いは、空の値の処理方法にあります。

## Syntax

```sql
EXPLODE(<array>)
EXPLODE_OUTER(<array>)
```
## 必須パラメータ

| Parameter | Description |
| -- | -- |
| `<arr>` | 	配列型 |

## 戻り値

配列が空でないか、またはNULLでない場合、`explode`と`explode_outer`の戻り値は同じです。

データが空またはNULLの場合：

`explode`は行を生成せず、これらのレコードをフィルタリングします。

`explode_outer`は、配列が空の場合、単一の行を生成しますが、展開された列の値はNULLになります。配列がNULLの場合も、行を保持してNULLを返します。

## 例

```
select e1 from (select 1 k1) as t lateral view explode([1,2,3]) tmp1 as e1;
```
```text
+------+
| e1   |
+------+
|    1 |
|    2 |
|    3 |
+------+
```
```sql
select e1 from (select 1 k1) as t lateral view explode_outer(null) tmp1 as e1;
```
``` text
+------+
| e1   |
+------+
| NULL |
+------+
```
```sql
select e1 from (select 1 k1) as t lateral view explode([]) tmp1 as e1;
Empty set (0.010 sec)
```
```sql
select e1 from (select 1 k1) as t lateral view explode([null,1,null]) tmp1 as e1;
```
```text
+------+
| e1   |
+------+
| NULL |
|    1 |
| NULL |
+------+
```
```sql
select e1 from (select 1 k1) as t lateral view explode_outer([null,1,null]) tmp1 as e1;
```
```text
+------+
| e1   |
+------+
| NULL |
|    1 |
| NULL |
+------+
```
