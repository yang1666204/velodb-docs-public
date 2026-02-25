---
{
  "title": "MERGE",
  "description": "集約された中間結果は集約されて計算され、実際の結果が取得されます。",
  "language": "ja"
}
---
## Description

集約された中間結果を集約し、計算することで実際の結果を取得します。
結果の型は `AGGREGATE_FUNCTION` と一致します。

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
### Keywords
AGG_STATE, MERGE
