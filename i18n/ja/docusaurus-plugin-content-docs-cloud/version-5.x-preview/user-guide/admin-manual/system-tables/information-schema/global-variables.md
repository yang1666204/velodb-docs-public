---
{
  "title": "global_variables",
  "description": "グローバル変数の表示",
  "language": "ja"
}
---
# global_variables

## 概要

グローバル変数を表示

## データベース


`information_schema`


## テーブル情報

| Column Name    | Type          | Description                               |
| -------------- | ------------- | ----------------------------------------- |
| VARIABLE_NAME  | varchar(64)   | 変数の名前                      |
| VARIABLE_VALUE | varchar(1024) | 変数の現在の値             |
| DEFAULT_VALUE  | varchar(1024) | 変数のデフォルト値             |
| CHANGED        | varchar(4)    | デフォルト値と異なる場合に示される |
