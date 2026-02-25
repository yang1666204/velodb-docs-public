---
{
  "title": "SHOW QUEUED ANALYZE JOBS",
  "description": "この文は、実行待ちの統計収集ジョブのキューを表示するために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、実行待ちの統計収集ジョブのキューを表示するために使用されます。

## Syntax

```SQL
SHOW QUEUED ANALYZE JOBS [ <table_name> ]
    [ WHERE PRIORITY = {"HIGH" | "MID" | "LOW" | "VERY_LOW"} ];
```
## オプションパラメータ

**1. `<table_name>`**

> テーブル名。指定した場合、そのテーブルに対応するジョブキュー情報を表示できます。指定しない場合、デフォルトですべてのテーブルのジョブキュー情報が返されます。

**2. `WHERE PRIORITY = {"HIGH" | "MID" | "LOW" | "VERY_LOW"}`**

> ジョブ優先度のフィルタ条件。指定しない場合、デフォルトですべての優先度のジョブに関する情報が表示されます。

## 戻り値

| Column | Note           |
| -- |--------------|
| catalog_name |   カタログ名         |
| db_name | データベース名           |
| tbl_name | テーブル名         |
| col_list | カラム名リスト           |
| priority | ジョブ優先度           |

## アクセス制御要件

このSQLを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege | Object | Notes                                    |
|:--------------| :------------- |:------------------------------------------------|
| SELECT_PRIV   | Table    | SHOWを実行する際、クエリ対象のテーブルに対するSELECT_PRIV権限が必要です。 |

## 例

1. テーブル名でジョブを表示します。

```sql
SHOW QUEUED ANALYZE JOBS REGION;
```
```text
+--------------+---------+----------+---------------------------------------------------+----------+
| catalog_name | db_name | tbl_name | col_list                                          | priority |
+--------------+---------+----------+---------------------------------------------------+----------+
| internal     | test    | region   | region:r_regionkey                                | HIGH     |
| internal     | test    | region   | region:r_name                                     | MID      |
| internal     | test    | region   | region:r_comment,region:r_name,region:r_regionkey | LOW      |
+--------------+---------+----------+---------------------------------------------------+----------+
```
2. ジョブを優先度別に表示する。

```sql
SHOW QUEUED ANALYZE JOBS WHERE PRIORITY="HIGH";
```
```text
+--------------+---------+----------+--------------------+----------+
| catalog_name | db_name | tbl_name | col_list           | priority |
+--------------+---------+----------+--------------------+----------+
| internal     | test    | region   | region:r_regionkey | HIGH     |
+--------------+---------+----------+--------------------+----------+
```
