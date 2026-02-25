---
{
  "title": "PERCENTILE_ARRAY",
  "description": "PERCENTILEARRAY関数は正確なパーセンタイル配列を計算し、複数のパーセンタイル値を一度に計算することを可能にします。",
  "language": "ja"
}
---
## 概要

`PERCENTILE_ARRAY`関数は正確なパーセンタイル配列を計算し、複数のパーセンタイル値を一度に算出できます。この関数は主に小さなデータセットに適しています。

主な特徴：
1. 正確な計算：近似ではなく正確なパーセンタイル結果を提供
2. バッチ処理：単一の操作で複数のパーセンタイルを計算可能
3. 適用範囲：小規模なデータセットの処理に最適


## 構文

```sql
PERCENTILE_ARRAY(<col>, <array_p>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<col>` | パーセンタイルを計算する列 |
| `<array_p>` | パーセンタイル配列、各要素は `[0.0, 1.0]` の範囲内である必要があります。例：`[0.5, 0.95, 0.99]` |

## Return Value

計算されたパーセンタイル値を含む `DOUBLE` 型の配列を返します。

## Examples

```sql
-- Create sample table
CREATE TABLE sales_data (
    id INT,
    amount DECIMAL(10, 2)
) DUPLICATE KEY(`id`)
DISTRIBUTED BY HASH(`id`) BUCKETS AUTO
PROPERTIES (
    "replication_allocation" = "tag.location.default: 1"
);

-- Insert sample data
INSERT INTO sales_data VALUES
(1, 10.5),
(2, 15.2),
(3, 20.1),
(4, 25.8),
(5, 30.3),
(6, 35.7),
(7, 40.2),
(8, 45.9),
(9, 50.4),
(10, 100.6);

-- Calculate multiple percentiles
SELECT percentile_array(amount, [0.25, 0.5, 0.75, 0.9]) as percentiles
FROM sales_data;
```
```text
+-----------------------------------------+
| percentiles                             |
+-----------------------------------------+
| [21.25, 32.5, 43.75, 54.99999999999998] |
+-----------------------------------------+
```
