---
{
  "title": "collations",
  "description": "文字セットのすべての照合順序メソッドを表示します。このTableはMySQLの動作との互換性のためにのみ使用され、実用的な意味はありません。",
  "language": "ja"
}
---
## 概要

文字セットのすべての照合順序方式を表示します。このTableはMySQLの動作との互換性のためにのみ使用され、実用的な意味はありません。Dorisで実際に使用される文字照合順序方式を真に反映するものではありません。

## データベース

`information_schema`

## Table情報

| Column Name        | タイプ         | デスクリプション                                    |
| ------------------ | ------------ | ---------------------------------------------- |
| COLLATION_NAME     | varchar(512) | 文字セット照合順序方式の名前                   |
| CHARACTER_SET_NAME | varchar(64)  | 関連付けられた文字セットの名前                 |
| ID                 | bigint       | 照合順序方式のID                               |
| IS_DEFAULT         | varchar(64)  | 現在のデフォルト照合順序方式かどうかを示す     |
| IS_COMPILED        | varchar(64)  | サービスにコンパイルされているかどうかを示す   |
| SORTLEN            | bigint       | この照合順序アルゴリズムが使用するメモリに関連 |
