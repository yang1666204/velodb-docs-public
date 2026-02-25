---
{
  "title": "HLL (HyperLogLog)",
  "description": "HLL",
  "language": "ja"
}
---
## HLL (HyperLogLog)
### 説明
HLL

HLLはキー列として使用することはできません。HLL型の列は、Aggregateテーブル、Duplicateテーブル、Uniqueテーブルで使用できます。Aggregateテーブルで使用する場合、テーブル構築時の集計タイプはHLL_UNIONです。
ユーザーは長さとデフォルト値を指定する必要がありません。
長さは、データ集計の度合いに応じてシステム内で制御されます。
また、HLL列は、対応するhll_union_agg、hll_raw_agg、hll_cardinality、hll_hashを通じてのみクエリまたは使用できます。

HLLは個別要素の近似カウントであり、データ量が大きい場合、Count Distinctよりもパフォーマンスが優れています。
HLLのエラーは通常約1%で、時には2%に達することもあります。

### 例

    select hour, HLL_UNION_AGG(pv) over(order by hour) uv from(
       select hour, HLL_RAW_AGG(device_id) as pv
       from metric_table -- Query the accumulated UV per hour
       where datekey=20200922
    group by hour order by 1
    ) final;

### キーワード
HLL,HYPERLOGLOG
