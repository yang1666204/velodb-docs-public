---
{
  "title": "STRUCT | Struct 関数",
  "description": "与えられた値に基づいて構造体を構築し、返します。この関数は1つ以上のパラメータを受け取り、すべての入力要素を含む構造体を返します。",
  "language": "ja"
}
---
# STRUCT

## 説明

指定された値に基づいて構造体を構築して返します。この関数は1つ以上のパラメータを受け取り、すべての入力要素を含む構造体を返します。

## 構文

```sql
STRUCT( <expr1> [ , <expr2> ... ] )
```
## パラメータ

- `<expr1>, <expr2>, ...`: 構造体を構築するための入力コンテンツ、1つ以上のパラメータをサポート

**サポートされる要素タイプ:**
- 数値タイプ: TINYINT, SMALLINT, INT, BIGINT, LARGEINT, FLOAT, DOUBLE, DECIMAL
- 文字列タイプ: CHAR, VARCHAR, STRING
- 日付・時刻タイプ: DATE, DATETIME, DATEV2, DATETIMEV2
- ブール型: BOOLEAN
- IPタイプ: IPV4, IPV6
- 複合タイプ: ARRAY, MAP, STRUCT

## 戻り値

戻り値の型: STRUCT<T>

戻り値の意味:
- すべての入力要素を含む構造体を返す。フィールド名はデフォルトでcol1, col2, col3, ...の形式
- すべてのフィールドはNULL値をサポート

## 使用方法

- この関数はすべての入力要素を構造体に結合する
- 最低1つのパラメータが必要
- すべてのフィールドはnullableとしてマークされる

## 例

**クエリ例:**

基本的な使用方法: nullフィールドを含む混合タイプの構造体を作成

```sql
select struct(1, 'a', "abc"),struct(null, 1, null),struct(cast('2023-03-16' as datetime));
+--------------------------------------+--------------------------------------+----------------------------------------+
| struct(1, 'a', "abc")                | struct(null, 1, null)                | struct(cast('2023-03-16' as datetime)) |
+--------------------------------------+--------------------------------------+----------------------------------------+
| {"col1":1, "col2":"a", "col3":"abc"} | {"col1":null, "col2":1, "col3":null} | {"col1":"2023-03-16 00:00:00"}         |
+--------------------------------------+--------------------------------------+----------------------------------------+
```
複合型を含むstructの作成:

```sql
select struct([1,2,3], {'name':'Alice','age':20}, named_struct('f1',1,'f2',2));
+----------------------------------------------------------------------------------+
| struct([1,2,3], {'name':'Alice','age':20}, named_struct('f1',1,'f2',2))          |
+----------------------------------------------------------------------------------+
| {"col1":[1, 2, 3], "col2":{"name":"Alice", "age":"20"}, "col3":{"f1":1, "f2":2}} |
+----------------------------------------------------------------------------------+
```
IPアドレスを含む構造体の作成:

```sql
select struct(cast('192.168.1.1' as ipv4), cast('2001:db8::1' as ipv6));
+------------------------------------------------------------------+
| struct(cast('192.168.1.1' as ipv4), cast('2001:db8::1' as ipv6)) |
+------------------------------------------------------------------+
| {"col1":"192.168.1.1", "col2":"2001:db8::1"}                     |
+------------------------------------------------------------------+
```
エラー例

サポートされていない型はエラーを報告します：
Json/Variant型を含む構造体の作成

```sql 
select struct(v) from var_with_index;
ERROR 1105 (HY000): errCode = 2, detailMessage = struct does not support jsonb/variant type

select struct(cast(1 as jsonb)) from var_with_index;
ERROR 1105 (HY000): errCode = 2, detailMessage = struct does not support jsonb/variant type
```
空のstructを作成するとエラーが報告されます。少なくとも1つのパラメータが必要で、これはhiveの動作と一致しています：

```sql
select struct();
ERROR 1105 (HY000): errCode = 2, detailMessage = struct requires at least one argument, like: struct(1)
```
