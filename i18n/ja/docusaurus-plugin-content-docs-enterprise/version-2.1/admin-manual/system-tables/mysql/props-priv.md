---
{
  "title": "procs_priv",
  "description": "この表はMySQL の動作との互換性のためのみに存在します。常に空です。",
  "language": "ja"
}
---
## 概要

このテーブルはMySQLの動作との互換性のためにのみ存在します。常に空の状態です。

## データベース

`mysql`

## テーブル情報

| Column Name  | Type     | Description |
| ------------ | -------- | ----------- |
| host         | char(60) |             |
| db           | char(64) |             |
| user         | char(32) |             |
| routine_name | char(64) |             |
| routine_type | char(9)  |             |
| grantor      | char(93) |             |
| proc_priv    | char(16) |             |
| timestamp    | char(1)  |             |
