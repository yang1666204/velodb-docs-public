---
{
  "title": "COUNT_BY_ENUM",
  "description": "列内のデータを列挙値として扱い、各列挙値の個数を数えます。",
  "language": "ja"
}
---
## 説明

列内のデータを列挙値として扱い、各列挙値の数をカウントします。各列について、列挙値の数、NULL以外の値の数、およびNULL値の数を返します。

## 構文

```sql
COUNT_BY_ENUM(<expr1>, <expr2>, ... , <exprN>)
```
## Parameters

| Parameter | Description |
| -- | -- |
| `<expr1>` | 少なくとも1つの入力が必要です。最大1024個の入力をサポートします。サポートされる型はStringです。 |

## Return Value

JSONArray形式で結果を返します。
戻り値の型はStringです。

例：

```json
[{
  "cbe": {
    "F": 100,
    "M": 99
  },
  "notnull": 199,
  "null": 1,
  "all": 200
}, {
  "cbe": {
    "20": 10,
    "30": 5,
    "35": 1
  },
  "notnull": 16,
  "null": 184,
  "all": 200
}, {
  "cbe": {
    "China": 10,
    "United States": 9,
    "England": 20,
    "Germany": 30
  },
  "notnull": 69,
  "null": 131,
  "all": 200
}]
```
Description: 戻り値はJSON配列文字列であり、内部オブジェクトの順序は入力パラメータの順序に従います。
* cbe: 列挙値に基づくnon-NULL値の統計結果
* notnull: non-NULL値の数
* null: NULL値の数
* all: NULLおよびnon-NULL値の両方を含む総数


## Example

```sql
CREATE TABLE count_by_enum_test(
                                   `id` varchar(1024) NULL,
                                   `f1` text REPLACE_IF_NOT_NULL NULL,
                                   `f2` text REPLACE_IF_NOT_NULL NULL,
                                   `f3` text REPLACE_IF_NOT_NULL NULL
)
AGGREGATE KEY(`id`)
DISTRIBUTED BY HASH(id) BUCKETS 3 
PROPERTIES ( 
    "replication_num" = "1"
);
```
```sql
INSERT into count_by_enum_test (id, f1, f2, f3) values
                                                    (1, "F", "10", "China"),
                                                    (2, "F", "20", "China"),
                                                    (3, "M", NULL, "United States"),
                                                    (4, "M", NULL, "United States"),
                                                    (5, "M", NULL, "England");
```
```sql
SELECT * from count_by_enum_test;
```
```text
+------+------+------+---------------+
| id   | f1   | f2   | f3            |
+------+------+------+---------------+
| 1    | F    | 10   | China         |
| 2    | F    | 20   | China         |
| 3    | M    | NULL | United States |
| 4    | M    | NULL | United States |
| 5    | M    | NULL | England       |
+------+------+------+---------------+
```
```sql
select count_by_enum(f1) from count_by_enum_test;
```
```text
+------------------------------------------------------+
| count_by_enum(`f1`)                                  |
+------------------------------------------------------+
| [{"cbe":{"M":3,"F":2},"notnull":5,"null":0,"all":5}] |
+------------------------------------------------------+
```
```sql
select count_by_enum(f2) from count_by_enum_test;
```
```text
+--------------------------------------------------------+
| count_by_enum(`f2`)                                    |
+--------------------------------------------------------+
| [{"cbe":{"10":1,"20":1},"notnull":2,"null":3,"all":5}] |
+--------------------------------------------------------+
```
```sql
select count_by_enum(f1,f2,f3) from count_by_enum_test;
```
```text
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| count_by_enum(`f1`, `f2`, `f3`)                                                                                                                                                          |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [{"cbe":{"M":3,"F":2},"notnull":5,"null":0,"all":5},{"cbe":{"20":1,"10":1},"notnull":2,"null":3,"all":5},{"cbe":{"England":1,"United States":2,"China":2},"notnull":5,"null":0,"all":5}] |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```
