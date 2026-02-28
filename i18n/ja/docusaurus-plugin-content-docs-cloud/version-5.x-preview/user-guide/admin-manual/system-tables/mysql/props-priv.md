---
{
  "title": "procs_priv",
  "description": "この表は、MySQLの動作との互換性を保つためのものです。常に空です。",
  "language": "ja"
}
---
# procs_priv

## 概要

このTableはMySQLの動作との互換性のためだけに存在します。常に空です。

## データベース

`mysql`

## Table情報

| Column Name  | タイプ     | デスクリプション |
| ------------ | -------- | ----------- |
| host         | char(60) |             |
| db           | char(64) |             |
| user         | char(32) |             |
| routine_name | char(64) |             |
| routine_type | char(9)  |             |
| grantor      | char(93) |             |
| proc_priv    | char(16) |             |
| timestamp    | char(1)  |             |
