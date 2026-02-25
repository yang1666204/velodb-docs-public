---
{
  "title": "statistics | Information Schema",
  "description": "information_schemaの統計テーブルは、システム互換性のために、MySQL互換のメタデータを提供しますが、常に空です。",
  "language": "ja"
}
---
# statistics

## 概要

このテーブルはMySQLの動作との互換性のためだけに存在します。常に空です。

## データベース

`information_schema`

## テーブル情報

| Column Name   | Type          | Description |
| ------------- | ------------- | ----------- |
| TABLE_CATALOG | varchar(512)  |             |
| TABLE_SCHEMA  | varchar(64)   |             |
| TABLE_NAME    | varchar(64)   |             |
| NON_UNIQUE    | bigint        |             |
| INDEX_SCHEMA  | varchar(64)   |             |
| INDEX_NAME    | varchar(64)   |             |
| SEQ_IN_INDEX  | bigint        |             |
| COLUMN_NAME   | varchar(64)   |             |
| COLLATION     | varchar(1)    |             |
| CARDINALITY   | bigint        |             |
| SUB_PART      | bigint        |             |
| PACKED        | varchar(10)   |             |
| NULLABLE      | varchar(3)    |             |
| INDEX_TYPE    | varchar(16)   |             |
| COMMENT       | varchar(16)   |             |
| INDEX_COMMENT | varchar(1024) |             |
