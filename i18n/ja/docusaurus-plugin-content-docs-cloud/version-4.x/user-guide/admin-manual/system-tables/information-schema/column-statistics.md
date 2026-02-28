---
{
  "title": "column_statistics | Information Schema",
  "description": "MySQL互換の常に空の列統計Table。互換性のためのみに存在し、Dorisの統計を反映しません。",
  "language": "ja"
}
---
# column_statistics

## 概要

このTableはMySQLの動作との互換性のためにのみ使用され、常に空です。Doris内のデータの統計情報を真に反映するものではありません。Dorisによって収集された統計情報を表示するには、Statisticsセクションを参照してください。

## Database

`information_schema`

## Table情報

| Column Name | タイプ        | デスクリプション |
| ----------- | ----------- | ----------- |
| SCHEMA_NAME | varchar(64) |             |
| TABLE_NAME  | varchar(64) |             |
| COLUMN_NAME | varchar(64) |             |
| HISTOGRAM   | json        |             |
