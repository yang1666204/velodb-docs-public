---
{
  "title": "ARRAY_DISTINCT",
  "language": "ja"
}
---
## array_distinct

<version since="2.0.0">

</version>

## 説明

配列から重複する要素を削除し、一意の要素を含む新しい配列を返します。この関数は要素の元の順序を維持し、各要素の最初の出現のみを保持します。

## 構文

```sql
array_distinct(ARRAY<T> arr)
```
### パラメータ

- `arr`：ARRAY\<T> 型、重複除去を行う配列。カラム名または定数値をサポートします。

**T でサポートされる型:**
- 数値型: TINYINT, SMALLINT, INT, BIGINT, LARGEINT, FLOAT, DOUBLE, DECIMAL
- 文字列型: CHAR, VARCHAR, STRING
- 日付時刻型: DATE, DATETIME, DATEV2, DATETIMEV2
- 真偽値型: BOOLEAN
- IP型: IPV4, IPV6

### 戻り値

戻り値の型: ARRAY\<T>

戻り値の意味:
- 元の配列からすべての一意の要素を含む重複除去された配列
- 元の要素の順序を維持します
- NULL: 入力配列がNULLの場合

使用上の注意:
- この関数は配列を左から右に走査し、各要素の最初の出現を保持して、後続の重複要素を削除します
- 空の配列は空の配列を返し、NULL配列はNULLを返します
- 重複除去は元の配列内の要素の相対的な順序を維持し、並び替えは行いません
- 配列要素内のnull値について: null要素は重複除去され、複数のnullは1つだけ保持されます

### 例

**クエリの例:**

整数配列の重複除去、元の配列 [1, 2, 3, 4, 5] には重複する要素がないため、重複除去後の結果は元の配列と同じになります。

```sql
SELECT array_distinct([1, 2, 3, 4, 5]);
+---------------------------------+
| array_distinct([1, 2, 3, 4, 5]) |
+---------------------------------+
| [1, 2, 3, 4, 5]                 |
+---------------------------------+
```
String配列の重複除去：重複する文字列要素を削除します。元の配列['a', 'b', 'a', 'c', 'b', 'd']では、'a'が2回出現し（最初の出現を保持）、'b'が2回出現し（最初の出現を保持）、重複除去後は["a", "b", "c", "d"]になります。

```sql
SELECT array_distinct(['a', 'b', 'a', 'c', 'b', 'd']);
+------------------------------------------------+
| array_distinct(['a', 'b', 'a', 'c', 'b', 'd']) |
+------------------------------------------------+
| ["a", "b", "c", "d"]                           |
+------------------------------------------------+
```
null値を含む配列：null要素も重複除去されます。複数のnullは1つだけが保持されます。元の配列[1, null, 2, null, 3, null]では、nullが3回出現していますが、重複除去後は最初のnullのみが保持され、結果として[1, null, 2, 3]となります。

```sql
SELECT array_distinct([1, null, 2, null, 3, null]);
+---------------------------------------------+
| array_distinct([1, null, 2, null, 3, null]) |
+---------------------------------------------+
| [1, null, 2, 3]                             |
+---------------------------------------------+
```
IPタイプ配列の重複除去：IPv4アドレス配列の重複除去。元の配列['192.168.1.1', '192.168.1.2', '192.168.1.1']では、'192.168.1.1'が2回出現していますが、重複除去後はアドレスの最初の出現のみが保持され、結果として[192.168.1.1, 192.168.1.2]となります。

```sql
SELECT array_distinct(CAST(['192.168.1.1', '192.168.1.2', '192.168.1.1'] AS ARRAY<IPV4>));
+------------------------------------------------------------------------------------+
| array_distinct(CAST(['192.168.1.1', '192.168.1.2', '192.168.1.1'] AS ARRAY<IPV4>)) |
+------------------------------------------------------------------------------------+
| ["192.168.1.1", "192.168.1.2"]                                                     |
+------------------------------------------------------------------------------------+
```
IPv6 type array deduplication: IPv6アドレス配列の重複除去。元の配列 ['2001:db8::1', '2001:db8::2', '2001:db8::1'] では、'2001:db8::1' が2回出現していますが、重複除去後はそのアドレスの最初の出現のみが保持され、結果として [2001:db8::1, 2001:db8::2] となります。

```sql
SELECT array_distinct(CAST(['2001:db8::1', '2001:db8::2', '2001:db8::1'] AS ARRAY<IPV6>));
+------------------------------------------------------------------------------------+
| array_distinct(CAST(['2001:db8::1', '2001:db8::2', '2001:db8::1'] AS ARRAY<IPV6>)) |
+------------------------------------------------------------------------------------+
| ["2001:db8::1", "2001:db8::2"]                                                     |
+------------------------------------------------------------------------------------+
```
空の配列は空の配列を返します：空の配列には重複排除する要素がないため、直接空の配列を返します。

```sql
+--------------------+
| array_distinct([]) |
+--------------------+
| []                 |
+--------------------+
```
NULL配列はNULLを返します：入力配列がNULLの場合、エラーをスローすることなくNULLを返します。

```sql
+----------------------+
| array_distinct(NULL) |
+----------------------+
| NULL                 |
+----------------------+
```
単一要素配列は元の配列を返します：要素が1つしかない配列には重複する要素がないため、重複除去後の結果は元の配列と同じになります。

```sql
SELECT array_distinct([42]);
+----------------------+
| array_distinct([42]) |
+----------------------+
| [42]                 |
+----------------------+
```
サポートされていない複合型:

ネストされた配列型はサポートされておらず、エラーが発生します。

```sql
SELECT array_distinct([[1,2,3], [4,5,6], [1,2,3]]);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.6)[RUNTIME_ERROR]execute failed or unsupported types for function array_distinct(Array(Nullable(Array(Nullable(TINYINT)))))
```
Mapタイプはサポートされていません。エラーがスローされます。

```sql
SELECT array_distinct([{'a':1}, {'b':2}, {'a':1}]);
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.6)[RUNTIME_ERROR]execute failed or unsupported types for function array_distinct(Array(Nullable(Map(Nullable(String), Nullable(TINYINT)))))
```
Struct型はサポートされていないため、エラーがスローされます。

```sql
SELECT array_distinct(array(named_struct('name','Alice','age',20), named_struct('name','Bob','age',30), named_struct('name','Alice','age',20)));
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.6)[RUNTIME_ERROR]execute failed or unsupported types for function array_distinct(Array(Nullable(Struct(name:Nullable(String), age:Nullable(TINYINT)))))
```
パラメータ数が正しくない場合はエラーが発生します。array_distinct関数は配列パラメータを1つのみ受け付けるため、複数のパラメータを渡すとエラーが発生します。

```sql
SELECT array_distinct([1, 2, 3], [4, 5, 6]);
ERROR 1105 (HY000): errCode = 2, detailMessage = Can not found function 'array_distinct' which has 2 arity. Candidate functions are: [array_distinct(Expression)]
```
非配列型を渡すとエラーが発生します：array_distinct関数は配列型のパラメータのみを受け入れるため、文字列などの非配列型を渡すとエラーが発生します。

```sql
SELECT array_distinct('not_an_array');
ERROR 1105 (HY000): errCode = 2, detailMessage = Can not find the compatibility function signature: array_distinct(VARCHAR(12))
```
### Keywords

ARRAY、DISTINCT、ARRAY_DISTINCT
