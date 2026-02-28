---
{
  "title": "global_variables",
  "description": "グローバル変数を表示",
  "language": "ja"
}
---
## 概要

グローバル変数を表示

## データベース


`information_schema`


## Table情報

| Column Name    | タイプ          | デスクリプション                               |
| -------------- | ------------- | ----------------------------------------- |
| VARIABLE_NAME  | varchar(64)   | 変数名                      |
| VARIABLE_VALUE | varchar(1024) | 変数の現在値             |
| DEFAULT_VALUE  | varchar(1024) | 変数のデフォルト値             |
| CHANGED        | varchar(4)    | デフォルト値と異なる場合を示す |
