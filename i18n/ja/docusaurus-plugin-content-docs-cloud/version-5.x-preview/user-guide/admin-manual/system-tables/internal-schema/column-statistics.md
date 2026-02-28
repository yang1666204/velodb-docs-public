---
{
  "title": "column_statistics | 内部スキーマ",
  "description": "カラム統計",
  "language": "ja"
}
---
# column_statistics

## 概要

カラム統計情報

## データベース

`__internal_schema`

## Table情報

| カラム名           | タイプ         | 説明                                             |
| ------------------ | -------------- | ------------------------------------------------ |
| id                 | varchar(4096)  | 一意のID                                         |
| catalog_id         | varchar(64)    | CatalogのID                                      |
| db_id              | varchar(64)    | DatabaseのID                                     |
| tbl_id             | varchar(64)    | TableのID                                        |
| idx_id             | varchar(64)    | IndexのID                                        |
| col_id             | varchar(64)    | カラムのID、現在はカラム名を格納                 |
| part_id            | varchar(64)    | PartitionのID、常に空                            |
| count              | bigint         | 行数                                             |
| ndv                | bigint         | 個別値の数                                       |
| null_count         | bigint         | NULLの数                                         |
| min                | varchar(65533) | 最小値                                           |
| max                | varchar(65533) | 最大値                                           |
| data_size_in_bytes | bigint         | データサイズ（バイト単位）                       |
| update_time        | datetime       | 現在の統計情報の更新時刻                         |
