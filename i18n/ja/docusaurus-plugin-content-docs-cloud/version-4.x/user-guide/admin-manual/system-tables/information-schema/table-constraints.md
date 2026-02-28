---
{
  "title": "table_constraints",
  "description": "このTableはMySQL の動作との互換性を維持することのみを目的としています。常に空の状態です。",
  "language": "ja"
}
---
# table_constraints

## 概要

このTableはMySQLの動作との互換性を維持することのみを目的としています。常に空です。

## データベース


`information_schema`


## Table情報

| Column Name        | タイプ         | デスクリプション |
| ------------------ | ------------ | ----------- |
| CONSTRAINT_CATALOG | varchar(512) |             |
| CONSTRAINT_SCHEMA  | varchar(64)  |             |
| CONSTRAINT_NAME    | varchar(64)  |             |
| TABLE_SCHEMA       | varchar(64)  |             |
| TABLE_NAME         | varchar(64)  |             |
| CONSTRAINT_TYPE    | varchar(64)  |             |
