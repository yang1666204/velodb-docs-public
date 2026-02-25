---
{
  "title": "BITOR",
  "description": "2つの整数に対してビット単位のOR演算を実行します。",
  "language": "ja"
}
---
## 説明
2つの整数に対してビット単位のOR演算を実行します。

サポートされている整数型: TINYINT, SMALLINT, INT, BIGINT, LARGEINT

## 構文

```sql
BITOR(<lhs>, <rhs>)
```
## Parameters
- `<lhs>`: 演算の最初の整数。
- `<rhs>`: 演算の2番目の整数。

## Return Value

2つの整数間のビット単位のOR演算の結果を返します。

## Examples
1. Example 1

    ```sql
    select BITOR(3,5), BITOR(4,7);
    ```
    ```text
    +------------+------------+
    | BITOR(3,5) | BITOR(4,7) |
    +------------+------------+
    |          7 |          7 |
    +------------+------------+
    ```
2. NULL引数

    ```sql
    select BITOR(3, NULL), BITOR(NULL, 5), BITOR(NULL, NULL);
    ```
    ```text
    +----------------+----------------+-------------------+
    | BITOR(3, NULL) | BITOR(NULL, 5) | BITOR(NULL, NULL) |
    +----------------+----------------+-------------------+
    |           NULL |           NULL |              NULL |
    +----------------+----------------+-------------------+
    ```
