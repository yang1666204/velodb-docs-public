---
{
  "title": "rowsets",
  "description": "Rowsetに関する基本情報を返します。",
  "language": "ja"
}
---
## 概要

Rowsetに関する基本情報を返します。

## データベース


`information_schema`


## Table情報

| Column Name            | タイプ        | デスクリプション                                                  |
| ---------------------- | ----------- | ------------------------------------------------------------ |
| BACKEND_ID             | bigint      | BackendのIDで、Backendの一意識別子です。 |
| ROWSET_ID              | varchar(64) | RowsetのIDで、Rowsetの一意識別子です。 |
| TABLET_ID              | bigint      | TabletのIDで、Tabletの一意識別子です。 |
| ROWSET_NUM_ROWS        | bigint      | Rowsetに含まれるデータ行数です。             |
| TXN_ID                 | bigint      | Rowsetに書き込みを行ったトランザクションIDです。                 |
| NUM_SEGMENTS           | bigint      | Rowsetに含まれるSegment数です。              |
| START_VERSION          | bigint      | Rowsetの開始バージョン番号です。                   |
| END_VERSION            | bigint      | Rowsetの終了バージョン番号です。                     |
| INDEX_DISK_SIZE        | bigint      | Rowset内のインデックスのストレージ容量です。             |
| DATA_DISK_SIZE         | bigint      | Rowset内のデータのストレージ容量です。                |
| CREATION_TIME          | datetime    | Rowsetの作成時刻です。                             |
| NEWEST_WRITE_TIMESTAMP | datetime    | Rowsetの最新の書き込み時刻です。                    |
| SCHEMA_VERSION         | int         | Rowsetデータに対応するTableのSchemaバージョン番号です。 |
