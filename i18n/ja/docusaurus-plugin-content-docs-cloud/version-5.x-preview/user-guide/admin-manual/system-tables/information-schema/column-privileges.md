---
{
  "title": "column_privileges",
  "description": "MySQL互換の常に空のカラム権限テーブル。互換性のために使用され、Dorisカラム権限を反映しません。",
  "language": "ja"
}
---
# column_privileges

## Overview

このテーブルはMySQLの動作との互換性のためのみに使用され、常に空です。Dorisの列権限情報を真に反映するものではありません。

## Database

```
information_schema
```
## テーブル情報

| Column Name    | Type         | Description |
| -------------- | ------------ | ----------- |
| GRANTEE        | varchar(128) |             |
| TABLE_CATALOG  | varchar(512) |             |
| TABLE_SCHEMA   | varchar(64)  |             |
| TABLE_NAME     | varchar(64)  |             |
| COLUMN_NAME    | varchar(64)  |             |
| PRIVILEGE_TYPE | varchar(64)  |             |
| IS_GRANTABLE   | varchar(3)   |             |
