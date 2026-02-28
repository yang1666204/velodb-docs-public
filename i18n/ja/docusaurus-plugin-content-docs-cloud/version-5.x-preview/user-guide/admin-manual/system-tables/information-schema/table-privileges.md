---
{
  "title": "table_privileges",
  "description": "Tableの認可情報を表示します。",
  "language": "ja"
}
---
# table_privileges

## 概要

Tableの認可情報を表示します。

## Database

`information_schema`

## Table情報

| Column Name    | タイプ         | デスクリプション                                    |
| -------------- | ------------ | ---------------------------------------------- |
| GRANTEE        | varchar(81)  | 認可されたユーザー                             |
| TABLE_CATALOG  | varchar(512) | Catalogの名前                                  |
| TABLE_SCHEMA   | varchar(64)  | Databaseの名前                                 |
| TABLE_NAME     | varchar(64)  | Tableの名前                                    |
| PRIVILEGE_TYPE | varchar(64)  | 権限のタイプ                                   |
| IS_GRANTABLE   | varchar(3)   | 権限を他者に付与できるかどうか                 |
