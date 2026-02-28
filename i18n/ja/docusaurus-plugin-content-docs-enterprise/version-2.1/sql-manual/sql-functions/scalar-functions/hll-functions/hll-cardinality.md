---
{
  "title": "HLL_CARDINALITY",
  "description": "HLLCARDINALITY は HyperLogLog (HLL) タイプの値のカーディナリティを計算します。",
  "language": "ja"
}
---
## 説明

`HLL_CARDINALITY`はHyperLogLog (HLL)型の値のカーディナリティを計算します。これは大規模なデータセット内の重複のない要素数を推定するのに適した近似カウントアルゴリズムです。

## 構文

```sql
HLL_CARDINALITY(<hll>)
```
## パラメータ

| Parameter  | デスクリプション                                              |
| ---------- | -------------------------------------------------------- |
| `<hll>`    | カーディナリティを推定する必要があるデータセットを表すHLL型の値。 |

## Return Value

HLL型の値の推定カーディナリティを返します。これは、データセット内の異なる要素の数を表します。

## Example

```sql
select HLL_CARDINALITY(uv_set) from test_uv;
```
```text
+---------------------------+
| hll_cardinality(`uv_set`) |
+---------------------------+
|                         3 |
+---------------------------+
```
