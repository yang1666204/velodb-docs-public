---
{
  "title": "カラム統計 | Information Schema",
  "description": "このTableはMySQLの動作との互換性のためにのみ使用され、常に空です。",
  "language": "ja"
}
---
# Column Statistics

## 概要

このTableはMySQLの動作との互換性のためにのみ使用され、常に空です。Doris内のデータの統計情報を真に反映するものではありません。Dorisによって収集された統計情報を表示するには、Statistics セクションを参照してください。

## Database

`information_schema`

## Table Information

| Column Name | タイプ        | デスクリプション |
| ----------- | ----------- | ----------- |
| SCHEMA_NAME | varchar(64) |             |
| TABLE_NAME  | varchar(64) |             |
| COLUMN_NAME | varchar(64) |             |
| HISTOGRAM   | json        |             |
