---
{
  "title": "SHOW COLUMNS",
  "description": "この文は、テーブルのカラム情報を指定するために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、テーブルのカラム情報を指定するために使用されます。

## Syntax

```sql
SHOW [ FULL ] COLUMNS FROM <tbl>;
```
## 必須パラメータ
**1. `<tbl>`**

カラム情報を表示するテーブル名を指定する必要があります。

## オプションパラメータ
**1. `FULL`**

`FULL`キーワードが指定された場合、カラムの集約タイプ、権限、コメントなどを含む、カラムの詳細情報が返されます。

## 戻り値
| Column     | DataType | Note                    |
|------------|----------|-------------------------|
| Field      | varchar  | Column Name             |
| Type       | varchar  | Column Data Type        |
| Collation  | varchar  | Column Collation        |
| Null       | varchar  | Whether NULL is Allowed |
| Key        | varchar  | Table's  Primary Key    |
| Default    | varchar  | Default Value           |
| Extra      | varchar  | Extra Info              |
| Privileges | varchar  | Column Privileges       |
| Comment    | varchar  | Column Comment          |

## アクセス制御要件
表示するテーブルに対する`SHOW`権限が必要です。

## 例

1. 指定したテーブルの詳細なカラム情報を表示する

```sql
SHOW FULL COLUMNS FROM t_agg;
```
```text
+-------+-----------------+-----------+------+------+---------+---------+------------+---------+
| Field | Type            | Collation | Null | Key  | Default | Extra   | Privileges | Comment |
+-------+-----------------+-----------+------+------+---------+---------+------------+---------+
| k1    | tinyint         |           | YES  | YES  | NULL    |         |            |         |
| k2    | decimalv3(10,2) |           | YES  | YES  | 10.5    |         |            |         |
| v1    | char(10)        |           | YES  | NO   | NULL    | REPLACE |            |         |
| v2    | int             |           | YES  | NO   | NULL    | SUM     |            |         |
+-------+-----------------+-----------+------+------+---------+---------+------------+---------+
```
2. 指定されたテーブルの通常のカラム情報を表示する

```sql
SHOW COLUMNS FROM t_agg;
```
```text
+-------+-----------------+------+------+---------+---------+
| Field | Type            | Null | Key  | Default | Extra   |
+-------+-----------------+------+------+---------+---------+
| k1    | tinyint         | YES  | YES  | NULL    |         |
| k2    | decimalv3(10,2) | YES  | YES  | 10.5    |         |
| v1    | char(10)        | YES  | NO   | NULL    | REPLACE |
| v2    | int             | YES  | NO   | NULL    | SUM     |
+-------+-----------------+------+------+---------+---------+
```
