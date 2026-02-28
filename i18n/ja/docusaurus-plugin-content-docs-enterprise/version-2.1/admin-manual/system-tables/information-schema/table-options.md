---
{
  "title": "table_options",
  "description": "このTableはMySQLの動作との互換性のためにのみ使用されます。常に空です。",
  "language": "ja"
}
---
## 概要

このTableはMySQLの動作との互換性のためだけに使用されます。常に空です。

## データベース


`information_schema`


## Table情報

| Column Name     | タイプ        | デスクリプション |
| --------------- | ----------- | ----------- |
| TABLE_CATALOG   | varchar(64) |             |
| TABLE_SCHEMA    | varchar(64) |             |
| TABLE_NAME      | varchar(64) |             |
| TABLE_MODEL     | text        |             |
| TABLE_MODEL_KEY | text        |             |
| DISTRIBUTE_KEY  | text        |             |
| DISTRIBUTE_TYPE | text        |             |
| BUCKETS_NUM     | int         |             |
| PARTITION_NUM   | int         |             |
