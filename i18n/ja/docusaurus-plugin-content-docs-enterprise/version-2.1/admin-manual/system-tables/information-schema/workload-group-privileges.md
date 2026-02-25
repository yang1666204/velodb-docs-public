---
{
  "title": "workload_group_privileges",
  "description": "Workload Groups の権限情報を格納します。",
  "language": "ja"
}
---
## 概要

Workload Groupsの権限情報を格納します。

## データベース


`information_schema`


## テーブル情報

| Column Name         | Type         | Description                              |
| ------------------- | ------------ | ---------------------------------------- |
| GRANTEE             | varchar(64)  | 権限を付与されたユーザー                 |
| WORKLOAD_GROUP_NAME | varchar(256) | Workload Groupの名前                     |
| PRIVILEGE_TYPE      | varchar(64)  | 権限の種類                               |
| IS_GRANTABLE        | varchar(3)   | 他のユーザーに付与可能かどうか           |
