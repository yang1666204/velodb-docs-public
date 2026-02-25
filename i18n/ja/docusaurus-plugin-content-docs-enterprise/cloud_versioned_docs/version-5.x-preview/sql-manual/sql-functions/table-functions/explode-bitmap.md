---
{
  "title": "EXPLODE_BITMAP",
  "description": "explodebitmap テーブル関数は bitmap 型のデータを受け取り、bitmap の各ビットを個別の行にマッピングします。",
  "language": "ja"
}
---
## Description
`explode_bitmap`テーブル関数は、bitmap型のデータを受け取り、bitmap内の各ビットを個別の行にマッピングします。
これは一般的にbitmapデータを処理するために使用され、bitmap内の各要素を個別のレコードに展開します。[`LATERAL VIEW`](../../../query-data/lateral-view.md)と組み合わせて使用する必要があります。
`explode_bitmap_outer`は`explode_bitmap`と似ていますが、空またはNULL値を処理する際の動作が異なります。空またはNULLのbitmapを持つレコードの存在を許可し、それらを結果内でNULL行に展開します。

## Syntax

```sql
EXPLODE_BITMAP(<bitmap>)
```
## Parameters
- `<bitmap>` [`BITMAP`](../../basic-element/sql-data-types/aggregate/BITMAP.md) 型

## Return Value
- `<bitmap>` 内の各ビットに対して1行を返し、各行にはビット値が含まれます。

## Usage Notes
1. `<bitmap>` パラメータが [`BITMAP`](../../basic-element/sql-data-types/aggregate/BITMAP.md) 型でない場合、エラーが報告されます。

## Examples
0. データを準備

    ```sql
    create table example(
        k1 int
    ) properties(
        "replication_num" = "1"
    );

    insert into example values(1);
    ```
1. 通常のパラメータ

    ```sql
    select k1, e1 from example lateral view explode_bitmap(bitmap_from_string("1,3,4,5,6,10")) t2 as e1 order by k1, e1;
    ```
    ```text
    +------+------+
    | k1   | e1   |
    +------+------+
    |    1 |    1 |
    |    1 |    3 |
    |    1 |    4 |
    |    1 |    5 |
    |    1 |    6 |
    |    1 |   10 |
    +------+------+
    ```
2. 空のBITMAP

    ```sql
    select k1, e1 from example lateral view explode_bitmap(bitmap_from_string("")) t2 as e1 order by k1, e1;
    ```
    ```text
    Empty set (0.03 sec)
    ```
3. NULLパラメータ

    ```sql
    select  * from example lateral view explode_bitmap(NULL) t2 as c;
    ```
    ```text
    Empty set (0.03 sec)
    ```
4. 非配列パラメータ

    ```sql
    select  * from example lateral view explode_bitmap('abc') t2 as c;
    ```
    ```text
    ERROR 1105 (HY000): errCode = 2, detailMessage = Can not find the compatibility function signature: explode_bitmap(VARCHAR(3))
    ```
