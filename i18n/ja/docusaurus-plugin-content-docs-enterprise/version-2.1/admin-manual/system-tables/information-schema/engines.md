---
{
  "title": "engines",
  "description": "このTableはMySQLの動作との互換性のためにのみ使用されます。常に空の状態です。",
  "language": "ja"
}
---
## 概要

このTableはMySQLの動作との互換性のためだけに使用されます。常に空です。

## データベース


`information_schema`


## Table情報

| Column Name  | タイプ        | デスクリプション |
| ------------ | ----------- | ----------- |
| ENGINE       | varchar(64) |             |
| SUPPORT      | varchar(8)  |             |
| COMMENT      | varchar(80) |             |
| TRANSACTIONS | varchar(3)  |             |
| XA           | varchar(3)  |             |
| SAVEPOINTS   | varchar(3)  |             |
