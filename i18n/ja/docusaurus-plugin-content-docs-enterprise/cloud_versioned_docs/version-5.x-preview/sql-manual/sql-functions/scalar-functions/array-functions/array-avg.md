---
{
  "title": "ARRAY_AVG",
  "language": "ja"
}
---
## array_avg

<version since="2.0.0">

</version>

## 説明

配列内のすべての数値要素の平均を計算します。この関数は配列内のnull値と非数値要素をスキップし、有効な数値要素のみを対象として平均を計算します。

## 構文

```sql
array_avg(ARRAY<T> arr)
```
### パラメータ

- `arr`：ARRAY<T> 型、平均を計算する配列。列名または定数値をサポートします。

**T でサポートされる型：**
- 数値型：TINYINT、SMALLINT、INT、BIGINT、LARGEINT、FLOAT、DOUBLE、DECIMAL
- 文字列型：CHAR、VARCHAR、STRING（数値への変換を試行します）
- 真偽値型：BOOLEAN（数値への変換を試行します）

### 戻り値

戻り値の型：入力型に基づいて自動選択

戻り値の意味：
- 配列内のすべての有効な数値要素の平均を返します
- NULL：配列が空の場合、またはすべての要素が NULL であるか数値に変換できない場合

使用上の注意：
- 配列に他の型（文字列など）が含まれている場合、要素を DOUBLE 型に変換しようと試みます。変換に失敗した要素はスキップされ、平均計算に含まれません
- この関数は、すべての要素を互換性のある数値型に変換して平均計算を試行します。平均の戻り値の型は入力型に基づいて自動選択されます：
  - 入力が DOUBLE または FLOAT の場合、DOUBLE を返します
  - 入力が整数型の場合、DOUBLE を返します
  - 入力が DECIMAL の場合、DECIMAL を返し、元の精度とスケールを維持します
- 空の配列は NULL を返し、要素が1つだけの配列はその要素の値を返します
- 配列が NULL の場合、型変換エラーが返されます
- ネストした配列、MAP、STRUCT およびその他の複合型は平均計算をサポートしておらず、呼び出すとエラーが発生します
- 配列要素の null 値について：null 要素は平均計算に含まれません

### 例

```sql
CREATE TABLE array_avg_test (
    id INT,
    int_array ARRAY<INT>,
    double_array ARRAY<DOUBLE>,
    mixed_array ARRAY<STRING>
)
DUPLICATE KEY(id)
DISTRIBUTED BY HASH(id) BUCKETS 3
PROPERTIES (
    "replication_num" = "1"
);

INSERT INTO array_avg_test VALUES
(1, [1, 2, 3, 4, 5], [1.1, 2.2, 3.3, 4.4, 5.5], ['1', '2', '3', '4', '5']),
(2, [10, 20, 30], [10.5, 20.5, 30.5], ['10', '20', '30']),
(3, [], [], []),
(4, NULL, NULL, NULL),
(5, [1, null, 3, null, 5], [1.1, null, 3.3, null, 5.5], ['1', null, '3', null, '5']);
```
**クエリの例:**

double_arrayの平均を計算する:

```sql
SELECT array_avg(double_array) FROM array_avg_test WHERE id = 1;
+-------------------------+
| array_avg(double_array) |
+-------------------------+
|                     3.3 |
+-------------------------+
```
混合型配列の平均を計算します。文字列は数値に変換されます：

```sql
SELECT array_avg(mixed_array) FROM array_avg_test WHERE id = 1;
+------------------------+
| array_avg(mixed_array) |
+------------------------+
|                      3 |
+------------------------+
```
空の配列はNULLを返します：

```sql
SELECT array_avg(int_array) FROM array_avg_test WHERE id = 3;
+----------------------+
| array_avg(int_array) |
+----------------------+
|                 NULL |
+----------------------+
```
NULL配列はNULLを返します：

```sql
SELECT array_avg(int_array) FROM array_avg_test WHERE id = 4;
+----------------------+
| array_avg(int_array) |
+----------------------+
|                 NULL |
+----------------------+
```
null値を含む配列では、null要素は計算に含まれません：

```sql
SELECT array_avg(int_array) FROM array_avg_test WHERE id = 5;
+----------------------+
| array_avg(int_array) |
+----------------------+
|                    3 |
+----------------------+
```
複合型の例：

ネストされた配列型はサポートされておらず、エラーになります：

```sql
SELECT array_avg([[1,2,3]]);
ERROR 1105 (HY000): errCode = 2, detailMessage = array_avg([[1, 2, 3]]) does not support type: ARRAY<TINYINT>
```
Map型はサポートされておらず、エラーになります：

```sql
SELECT array_avg([{'k':1},{'k':2}]);
ERROR 1105 (HY000): errCode = 2, detailMessage = array_avg([map('k', 1), map('k', 2)]) does not support type: MAP<VARCHAR(1),TINYINT>
```
パラメータ数が間違っている場合のエラー:

```sql
SELECT array_avg([1,2,3], [4,5,6]);
ERROR 1105 (HY000): errCode = 2, detailMessage = Can not found function 'array_avg' which has 2 arity. Candidate functions are: [array_avg(Expression)]
```
非配列型を渡した場合のエラー：

```sql
SELECT array_avg('not_an_array');
ERROR 1105 (HY000): errCode = 2, detailMessage = Can not find the compatibility function signature: array_avg(VARCHAR(12))
```
Array がNULLです。型変換エラーを返します。

```
mysql> SELECT array_max(NULL);
ERROR 1105 (HY000): errCode = 2, detailMessage = class org.apache.doris.nereids.types.NullType cannot be cast to class org.apache.doris.nereids.types.ArrayType (org.apache.doris.nereids.types.NullType and org.apache.doris.nereids.types.ArrayType are in unnamed module of loader 'app')
```
### Keywords

ARRAY, AVG, ARRAY_AVG
