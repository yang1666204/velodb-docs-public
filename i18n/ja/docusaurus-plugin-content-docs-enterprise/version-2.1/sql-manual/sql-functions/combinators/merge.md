---
{
  "title": "MERGE",
  "description": "集約された中間結果が集約され、計算されて実際の結果が取得されます。",
  "language": "ja"
}
---
## Description

集約された中間結果が集約され、計算されて実際の結果を取得します。
結果の型は`AGGREGATE_FUNCTION`と一致します。

## Syntax

`AGGREGATE_FUNCTION_MERGE(agg_state)`

## Example

```
mysql [test]>select avg_merge(avg_state(1)) from d_table;
+-------------------------+
| avg_merge(avg_state(1)) |
+-------------------------+
|                       1 |
+-------------------------+
```
### キーワード
AGG_STATE、MERGE
