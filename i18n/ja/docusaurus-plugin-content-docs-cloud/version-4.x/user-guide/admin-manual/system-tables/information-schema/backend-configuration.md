---
{
  "title": "backend_configuration",
  "description": "Backendsで設定を表示します。",
  "language": "ja"
}
---
# backend_configuration

## 概要

Backendsの設定を表示します。

## データベース


`information_schema`


## Table情報

| Column Name  | タイプ         | デスクリプション           |
| ------------ | ------------ | --------------------- |
| BE_ID        | bigint       | BackendのID |
| CONFIG_NAME  | varchar(256) | 設定名       |
| CONFIG_TYPE  | varchar(256) | 設定データ型  |
| CONFIG_VALUE | bigint       | 設定値      |
| IS_MUTABLE   | bool         | 設定が可変かどうか |
