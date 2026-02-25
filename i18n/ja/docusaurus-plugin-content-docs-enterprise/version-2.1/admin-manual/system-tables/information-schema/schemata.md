---
{
  "title": "schemata",
  "description": "データベースに関連する情報を表示します。",
  "language": "ja"
}
---
## 概要

データベースに関連する情報を表示します。

## Database

`information_schema`

## テーブル情報

| Column Name                | Type         | Description                                  |
| -------------------------- | ------------ | -------------------------------------------- |
| CATALOG_NAME               | varchar(512) | Catalogの名前                                |
| SCHEMA_NAME                | varchar(32)  | Databaseの名前                               |
| DEFAULT_CHARACTER_SET_NAME | varchar(32)  | MySQL互換性のためのみ、実際の機能はありません |
| DEFAULT_COLLATION_NAME     | varchar(32)  | MySQL互換性のためのみ、実際の機能はありません |
| SQL_PATH                   | varchar(512) | MySQL互換性のためのみ、実際の機能はありません |
| DEFAULT_ENCRYPTION         | varchar(3)   | MySQL互換性のためのみ、実際の機能はありません |
