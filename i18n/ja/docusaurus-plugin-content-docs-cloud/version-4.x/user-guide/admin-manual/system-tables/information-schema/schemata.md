---
{
  "title": "schemata",
  "description": "データベースに関連する情報を表示します。",
  "language": "ja"
}
---
# schemata

## 概要

データベースに関連する情報を表示します。

## データベース


`information_schema`


## Table情報

| カラム名                   | 型           | 説明                                                  |
| -------------------------- | ------------ | ----------------------------------------------------- |
| CATALOG_NAME               | varchar(512) | Catalogの名前                                         |
| SCHEMA_NAME                | varchar(32)  | Databaseの名前                                        |
| DEFAULT_CHARACTER_SET_NAME | varchar(32)  | MySQLとの互換性のためのみ、実際の機能はありません     |
| DEFAULT_COLLATION_NAME     | varchar(32)  | MySQLとの互換性のためのみ、実際の機能はありません     |
| SQL_PATH                   | varchar(512) | MySQLとの互換性のためのみ、実際の機能はありません     |
| DEFAULT_ENCRYPTION         | varchar(3)   | MySQLとの互換性のためのみ、実際の機能はありません     |
