---
{
  "title": "APPROX_COUNT_DISTINCT",
  "description": "重複のないNULL以外の要素数を返します。この関数はHyperLogLogアルゴリズムに基づいて実装されています。",
  "language": "ja"
}
---
## 説明

重複しないNULL以外の要素の数を返します。
この関数は、固定サイズのメモリを使用して列ベースを推定するHyperLogLogアルゴリズムに基づいて実装されています。このアルゴリズムは裾野における帰無分布の仮定に基づいており、精度はデータ分布に依存します。Dorisで使用される固定バケットサイズに基づくと、アルゴリズムの相対標準誤差は0.8125%です。
より詳細で具体的な分析については、[related paper](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf)を参照してください。

## 構文

```sql
APPROX_COUNT_DISTINCT(<expr>)
NDV(<expr>)
```
## Parameters

| Parameters | Description |
| -- | -- |
| `<expr>` | 値を取得する式。サポートされている型は String、Date、DateTime、IPv4、IPv6、TinyInt、Bool、SmallInt、Integer、BigInt、LargeInt、Float、Double、Decimal です。 |

## Return Value

BIGINT型の値を返します。

## Example

```sql
-- setup
create table t1(
        k1 int,
        k_string varchar(100),
        k_tinyint tinyint
) distributed by hash (k1) buckets 1
properties ("replication_num"="1");
insert into t1 values 
    (1, 'apple', 10),
    (1, 'banana', 20),
    (1, 'apple', 10),
    (2, 'orange', 30),
    (2, 'orange', 40),
    (2, 'grape', 50),
    (3, null, null);
```
```sql
select approx_count_distinct(k_string) from t1;
```
String型：すべてのk_string値の概算個別カウントを計算します。NULL値は計算に含まれません。

```text
+---------------------------------+
| approx_count_distinct(k_string) |
+---------------------------------+
|                               4 |
+---------------------------------+
```
```sql
select approx_count_distinct(k_tinyint) from t1;
```
TinyInt型: すべてのk_tinyint値の概算の個別カウントを計算します。

```text
+----------------------------------+
| approx_count_distinct(k_tinyint) |
+----------------------------------+
|                                5 |
+----------------------------------+
```
```sql
select approx_count_distinct(k1) from t1;
```
Integer型：すべてのk1値の概算個別カウントを計算します。

```text
+---------------------------+
| approx_count_distinct(k1) |
+---------------------------+
|                         3 |
+---------------------------+
```
```sql
select k1, approx_count_distinct(k_string) from t1 group by k1;
```
k1でグループ化し、各グループ内のk_stringの概算重複排除カウントを計算します。グループ内のすべてのレコードがNULLの場合、0を返します。

```text
+------+---------------------------------+
| k1   | approx_count_distinct(k_string) |
+------+---------------------------------+
|    1 |                               2 |
|    2 |                               2 |
|    3 |                               0 |
+------+---------------------------------+
```
```sql
select ndv(k_string) from t1;
```
alias NDVを使用することは、APPROX_COUNT_DISTINCTと同じ効果があります。

```text
+---------------+
| ndv(k_string) |
+---------------+
|             4 |
+---------------+
```
```sql
select approx_count_distinct(k_string) from t1 where k1 = 999;
```
クエリ結果が空の場合、0を返します。

```text
+---------------------------------+
| approx_count_distinct(k_string) |
+---------------------------------+
|                               0 |
+---------------------------------+
```
