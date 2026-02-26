---
{
  "title": "table_options",
  "description": "MySQL互換の常に空のtable_optionsテーブル。互換性のためのみに存在し、実際のDorisテーブルオプションを反映しません。",
  "language": "ja"
}
---
# table_options

## 概要

このテーブルはMySQLの動作との互換性のためにのみ使用されます。常に空です。

## データベース


`information_schema`


## テーブル情報

| Column Name     | Type        | Description |
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
