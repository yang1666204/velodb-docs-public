---
{
  "title": "Query Schema Action",
  "language": "ja"
}
---
# Query Schema Action


## Request

```
POST /api/query_schema/<ns_name>/<db_name>
```
## デスクリプション

Query Schema Actionは、指定されたSQLに関連するTableのTable作成文を返すことができます。ローカルでいくつかのクエリシナリオをテストするために使用できます。

このAPIはバージョン1.2でリリースされました。

## Path parameters

* `<db_name>`

    データベース名を指定します。このデータベースは現在のセッションのデフォルトデータベースとして扱われ、SQL内のTable名がデータベース名を修飾しない場合に使用されます。

## Query parameters

なし

## Request body

```
text/plain

sql
```
* "sql" フィールドは SQL 文字列です。

## 戻り値

    ```
    CREATE TABLE `tbl1` (
      `k1` int(11) NULL,
      `k2` int(11) NULL
    ) ENGINE=OLAP
    DUPLICATE KEY(`k1`, `k2`)
    COMMENT 'OLAP'
    DISTRIBUTED BY HASH(`k1`) BUCKETS 3
    PROPERTIES (
    "replication_allocation" = "tag.location.default: 1",
    "in_memory" = "false",
    "storage_format" = "V2",
    "disable_auto_compaction" = "false"
    );
    
    CREATE TABLE `tbl2` (
      `k1` int(11) NULL,
      `k2` int(11) NULL
    ) ENGINE=OLAP
    DUPLICATE KEY(`k1`, `k2`)
    COMMENT 'OLAP'
    DISTRIBUTED BY HASH(`k1`) BUCKETS 3
    PROPERTIES (
    "replication_allocation" = "tag.location.default: 1",
    "in_memory" = "false",
    "storage_format" = "V2",
    "disable_auto_compaction" = "false"
    );
    ```
## Example

1. ローカルファイル 1.sql に SQL を記述する

    ```
    select tbl1.k2 from tbl1 join tbl2 on tbl1.k1 = tbl2.k1;
    ```
2. curlを使用してTable作成文を取得します。

    ```
    curl -X POST -H 'Content-Type: text/plain'  -uroot: http://127.0.0.1:8030/api/query_schema/internal/db1 -d@1.sql
    ```
