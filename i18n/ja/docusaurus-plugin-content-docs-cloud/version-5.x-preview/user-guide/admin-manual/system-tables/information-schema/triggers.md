---
{
  "title": "triggers",
  "description": "MySQL互換の、互換性のための常に空のトリガーTable。Dorisのトリガーサポートは反映されません。",
  "language": "ja"
}
---
# triggers

## 概要

すべてのTable情報を格納します。

## データベース

`information_schema`

## Table情報

| カラム名        | タイプ        | 説明                                                         |
| --------------- | ------------- | ------------------------------------------------------------ |
| TABLE_CATALOG   | varchar(512)  | Tableが属するCatalog                                      |
| TABLE_SCHEMA    | varchar(64)   | Tableが属するDatabase                                     |
| TABLE_NAME      | varchar(64)   | Tableの名前                                               |
| TABLE_TYPE      | varchar(64)   | Tableのタイプ。SYSTEM VIEW、VIEW、BASE TABLEを含む        |
| ENGINE          | varchar(64)   | Tableのストレージエンジンタイプ                           |
| VERSION         | bigint        | 無効な値                                                     |
| ROW_FORMAT      | varchar(10)   | 無効な値                                                     |
| TABLE_ROWS      | bigint        | Table内の推定行数                                         |
| AVG_ROW_LENGTH  | bigint        | Tableの平均行サイズ                                       |
| DATA_LENGTH     | bigint        | Tableの推定サイズ                                         |
| MAX_DATA_LENGTH | bigint        | 無効な値                                                     |
| INDEX_LENGTH    | bigint        | 無効な値                                                     |
| DATA_FREE       | bigint        | 無効な値                                                     |
| AUTO_INCREMENT  | bigint        | 無効な値                                                     |
| CREATE_TIME     | datetime      | Tableが作成された時刻                                     |
| UPDATE_TIME     | datetime      | Tableデータが最後に更新された時刻                         |
| CHECK_TIME      | datetime      | 無効な値                                                     |
| TABLE_COLLATION | varchar(32)   | 固定値：utf-8                                                |
| CHECKSUM        | bigint        | 無効な値                                                     |
| CREATE_OPTIONS  | varchar(255)  | 無効な値                                                     |
| TABLE_COMMENT   | varchar(2048) | Tableに関するコメント                                     |
