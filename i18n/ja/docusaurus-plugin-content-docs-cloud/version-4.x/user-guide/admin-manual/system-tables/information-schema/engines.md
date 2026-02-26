---
{
  "title": "engines",
  "description": "このテーブルはMySQLの動作との互換性のためにのみ使用されます。常に空です。",
  "language": "ja"
}
---
# engines

## 概要

このテーブルはMySQLの動作との互換性のためだけに使用されます。常に空です。

## データベース

`information_schema`

## テーブル情報

| Column Name  | Type        | Description |
| ------------ | ----------- | ----------- |
| ENGINE       | varchar(64) |             |
| SUPPORT      | varchar(8)  |             |
| COMMENT      | varchar(80) |             |
| TRANSACTIONS | varchar(3)  |             |
| XA           | varchar(3)  |             |
| SAVEPOINTS   | varchar(3)  |             |
