---
{
  "title": "table_properties",
  "description": "Table（内部Tableおよび外部Tableを含む）の属性情報を表示するために使用されます。",
  "language": "ja"
}
---
## 概要

Table（内部Tableおよび外部Tableを含む）の属性情報を表示するために使用されます。

## Database

`information_schema`

## Table Information

| Column Name    | タイプ        | デスクリプション                             |
| -------------- | ----------- | --------------------------------------- |
| TABLE_CATALOG  | varchar(64) | Tableが属するCatalog                    |
| TABLE_SCHEMA   | varchar(64) | Tableが属するDatabase                  |
| TABLE_NAME     | varchar(64) | Tableの名前                            |
| PROPERTY_NAME  | string      | プロパティの名前                          |
| PROPERTY_VALUE | string      | プロパティの値                            |
