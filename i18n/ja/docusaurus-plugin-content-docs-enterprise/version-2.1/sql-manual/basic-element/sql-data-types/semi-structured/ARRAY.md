---
{
  "title": "ARRAY | 半構造化",
  "description": "ARRAY",
  "language": "ja"
}
---
# ARRAY

## ARRAY

ARRAY

### description

`ARRAY<T>`

T型アイテムの配列で、キー列として使用することはできません。現在、ARRAYはDuplicate ModelTableでのみ使用できます。

バージョン2.0以降、UniqueモデルTableの非キー列での使用をサポートします。

T型は以下のいずれでも構いません：

```
BOOLEAN, TINYINT, SMALLINT, INT, BIGINT, LARGEINT, FLOAT, DOUBLE, DECIMAL, DATE,
DATEV2, DATETIME, DATETIMEV2, CHAR, VARCHAR, STRING
```
### example

Table作成の例：

```
mysql> CREATE TABLE `array_test` (
  `id` int(11) NULL COMMENT "",
  `c_array` ARRAY<int(11)> NULL COMMENT ""
) ENGINE=OLAP
DUPLICATE KEY(`id`)
COMMENT "OLAP"
DISTRIBUTED BY HASH(`id`) BUCKETS 1
PROPERTIES (
"replication_allocation" = "tag.location.default: 1",
"in_memory" = "false",
"storage_format" = "V2"
);
```
データ挿入の例:

```
mysql> INSERT INTO `array_test` VALUES (1, [1,2,3,4,5]);
mysql> INSERT INTO `array_test` VALUES (2, [6,7,8]), (3, []), (4, null);
```
データ選択の例：

```
mysql> SELECT * FROM `array_test`;
+------+-----------------+
| id   | c_array         |
+------+-----------------+
|    1 | [1, 2, 3, 4, 5] |
|    2 | [6, 7, 8]       |
|    3 | []              |
|    4 | NULL            |
+------+-----------------+
```
### keywords

    ARRAY
