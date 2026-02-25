---
{
  "title": "概要",
  "description": "ウィンドウ関数（分析関数とも呼ばれる）は、元の行を保持しながら計算を実行する特別な組み込み関数です。",
  "language": "ja"
}
---
## 説明

[Window functions](../../../query-data/window-function)（analytic functionsとも呼ばれる）は、元の行を保持しながら計算を実行する特別な組み込み関数です。集約関数とは異なり、window functionsは以下の特徴があります：

- GROUP BYグループ化ではなく、特定のウィンドウ範囲内でデータを処理する
- 結果セットの各行に対して値を計算する
- SELECTリストに追加の列を加えることができる
- クエリ処理の最後に実行される（JOIN、WHERE、GROUP BYの後）

Window functionsは、トレンド分析、外れ値計算、データバケット化のために、金融や科学計算でよく使用されます。

## 構文

```sql
<FUNCTION> ( [ <ARGUMENTS> ] ) OVER ( [ <windowDefinition> ] )
```
そして：

```sql
windowDefinition ::=

[ PARTITION BY <expr1> [, ...] ]
[ ORDER BY <expr2> [ ASC | DESC ] [ NULLS { FIRST | LAST } ] [, ...] ]
[ <windowFrameClause> ]
```
そして:

```sql
windowFrameClause ::=
{
  | { ROWS } <n> PRECEDING
  | { ROWS } CURRENT ROW
  | { ROWS } BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
  | { ROWS | RANGE } UNBOUNDED PRECEDING
  | { ROWS | RANGE } BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  | { ROWS | RANGE } BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  | { ROWS } BETWEEN <n> { PRECEDING | FOLLOWING } AND <n> { PRECEDING | FOLLOWING }
  | { ROWS } BETWEEN UNBOUNDED PRECEDING AND <n> { PRECEDING | FOLLOWING }
  | { ROWS } BETWEEN <n> { PRECEDING | FOLLOWING } AND UNBOUNDED FOLLOWING
}
```
## Parameters

`<FUNCTION>`
> ウィンドウ関数の名前。すべての集計関数に加えて、特殊なウィンドウ関数が含まれます：DENSE_RANK()、FIRST_VALUE()、LAG()、LAST_VALUE()、LEAD()、RANK()、ROW_NUMBER()、NTH_VALUE()、PERCENT_RANK()、CUME_DIST()、NTILE()。

`<ARGUMENTS>`
> オプション。ウィンドウ関数の入力引数。引数の型と数量は、使用される特定の関数によって異なります。

`<PARTITION_BY>`
> オプション。GROUP BYと同様に、指定された列でデータをグループ化し、各パーティション内で計算を実行します。

`<ORDER_BY>`
> オプション。各パーティション内でデータをソートするために使用されます。パーティションが指定されていない場合は、データセット全体をソートします。ただし、このORDER BYは、SQL文の末尾に現れる一般的なORDER BYとは異なります。OVER句で指定されるソートは、そのパーティション内のデータにのみ適用されるのに対し、SQL文の末尾のORDER BYは、最終的なクエリ結果のすべての行の順序を制御します。この2つは共存できます。
> さらに、OVER句でORDER BYが明示的に指定されていない場合、パーティション内のデータはランダムになる可能性があり、予測できない最終結果につながる可能性があります。ソート列が明示的に提供されているが重複値が含まれている場合でも、結果は不安定になる可能性があります。具体例については、以下の[ケーススタディ](#section1)を参照してください。

`<windowFrameClause>`
> オプション。ウィンドウフレームを定義するために使用されます。現在、RANGEとROWSの2つのタイプがサポートされています。
> N PRECEDING/FOLLOWINGの場合（Nは正の整数）、現在の行を基準とした滑り窓の範囲を表します。現在、これはROWSウィンドウでのみサポートされているため、現在の行を基準とした物理的なオフセットを示します。RANGEタイプには現在いくつかの制限があります：BOTH UNBOUNDED BOUNDARYまたはONE UNBOUNDED BOUNDARY AND ONE CURRENT ROWのいずれかである必要があります。フレームが指定されていない場合、デフォルトの暗黙的フレームはRANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROWです。

## 戻り値

入力式と同じデータ型を返します。

<a id="section1"></a>
## 分析関数データの一意な順序付け

**1. 一貫性のない戻り結果の問題**

ウィンドウ関数のORDER BY句がデータの一意な順序付けを生成できない場合（ORDER BY式が重複値を生成する場合など）、行の順序は不確定になります。これは、これらの行の戻り順序が複数のクエリ実行にわたって変化する可能性があることを意味し、ウィンドウ関数から一貫性のない結果が生じます。

次の例は、連続した実行でクエリが異なる結果を返す方法を示しています。この一貫性のなさは主に、ORDER BY dateidがSUMウィンドウ関数に対して一意な順序付けを提供していないことに起因します。

```sql
CREATE TABLE test_window_order 
    (item_id int,
    date_time date,
    sales double)
distributed BY hash(item_id)
properties("replication_num" = 1);

INSERT INTO test_window_order VALUES
(1, '2024-07-01', 100),
(2, '2024-07-01', 100),
(3, '2024-07-01', 140);

SELECT
    item_id, date_time, sales,
    sum(sales) OVER (ORDER BY date_time ROWS BETWEEN 
        UNBOUNDED PRECEDING AND CURRENT ROW) sum
FROM
    test_window_order;
```
ソート列 `date_time` に重複する値があるため、以下の2つのクエリ結果が観察される可能性があります：

```sql
+---------+------------+-------+------+
| item_id | date_time  | sales | sum  |
+---------+------------+-------+------+
|       1 | 2024-07-01 |   100 |  100 |
|       3 | 2024-07-01 |   140 |  240 |
|       2 | 2024-07-01 |   100 |  340 |
+---------+------------+-------+------+
3 rows in set (0.03 sec)
```
**2. Solution**

この問題に対処するには、`item_id`などの一意の値を持つ列を`ORDER BY`句に追加して、順序の一意性を確保することができます。

```sql
SELECT
        item_id,
        date_time,
        sales,
        sum(sales) OVER (
        ORDER BY item_id,
        date_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) sum
FROM
        test_window_order;
```
これにより、一貫したクエリ出力が得られます：

```sql
+---------+------------+-------+------+
| item_id | date_time  | sales | sum  |
+---------+------------+-------+------+
|       1 | 2024-07-01 |   100 |  100 |
|       2 | 2024-07-01 |   100 |  200 |
|       3 | 2024-07-01 |   140 |  340 |
+---------+------------+-------+------+
3 rows in set (0.03 sec)
```
