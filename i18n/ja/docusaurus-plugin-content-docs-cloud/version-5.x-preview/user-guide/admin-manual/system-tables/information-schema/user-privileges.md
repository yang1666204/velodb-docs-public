---
{
  "title": "user_privileges",
  "description": "ユーザー認可情報を表示します。",
  "language": "ja"
}
---
# user_privileges

## 概要

ユーザー認可情報を表示します。

## データベース


`information_schema`


## テーブル情報

| Column Name    | Type         | Description                                    |
| -------------- | ------------ | ---------------------------------------------- |
| GRANTEE        | varchar(81)  | 権限を付与されたユーザー          |
| TABLE_CATALOG  | varchar(512) | 常に 'def'                                   |
| PRIVILEGE_TYPE | varchar(64)  | 権限のタイプ                              |
| IS_GRANTABLE   | varchar(3)   | 権限を他のユーザーに付与できるかどうか |
