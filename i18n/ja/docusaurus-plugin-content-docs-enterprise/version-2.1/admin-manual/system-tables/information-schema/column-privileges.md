---
{
  "title": "column_privileges",
  "description": "このTableはMySQLの動作との互換性のためだけに使用され、常に空です。",
  "language": "ja"
}
---
## 概要

このTableはMySQLの動作との互換性のためのみに使用され、常に空です。DorisのカラムPermission情報を真に反映するものではありません。

## Database

```
information_schema
```
## Table情報

| Column Name    | タイプ         | デスクリプション |
| -------------- | ------------ | ----------- |
| GRANTEE        | varchar(128) |             |
| TABLE_CATALOG  | varchar(512) |             |
| TABLE_SCHEMA   | varchar(64)  |             |
| TABLE_NAME     | varchar(64)  |             |
| COLUMN_NAME    | varchar(64)  |             |
| PRIVILEGE_TYPE | varchar(64)  |             |
| IS_GRANTABLE   | varchar(3)   |             |
