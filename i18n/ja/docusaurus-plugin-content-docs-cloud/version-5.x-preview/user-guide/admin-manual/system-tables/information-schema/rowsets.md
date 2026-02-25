---
{
  "title": "rowsets",
  "description": "Rowsetの基本情報を返します。",
  "language": "ja"
}
---
# rowsets

## 概要

Rowsetに関する基本情報を返します。

## データベース


`information_schema`


## テーブル情報

| カラム名                | 型           | 説明                                                          |
| ---------------------- | ----------- | ------------------------------------------------------------ |
| BACKEND_ID             | bigint      | BackendのID。Backendの一意識別子です。                        |
| ROWSET_ID              | varchar(64) | RowsetのID。Rowsetの一意識別子です。                          |
| TABLET_ID              | bigint      | TabletのID。Tabletの一意識別子です。                          |
| ROWSET_NUM_ROWS        | bigint      | Rowsetに含まれるデータ行数。                                   |
| TXN_ID                 | bigint      | Rowsetに書き込みを行ったトランザクションID。                    |
| NUM_SEGMENTS           | bigint      | Rowsetに含まれるSegment数。                                   |
| START_VERSION          | bigint      | Rowsetの開始バージョン番号。                                   |
| END_VERSION            | bigint      | Rowsetの終了バージョン番号。                                   |
| INDEX_DISK_SIZE        | bigint      | Rowset内のインデックスの格納領域。                             |
| DATA_DISK_SIZE         | bigint      | Rowset内のデータの格納領域。                                   |
| CREATION_TIME          | datetime    | Rowsetの作成時刻。                                            |
| NEWEST_WRITE_TIMESTAMP | datetime    | Rowsetの最新の書き込み時刻。                                   |
| SCHEMA_VERSION         | int         | Rowsetデータに対応するテーブルのSchemaバージョン番号。           |
