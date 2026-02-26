---
{
  "title": "metadata_name_ids",
  "description": "オブジェクトのView ID情報を表示する",
  "language": "ja"
}
---
# metadata_name_ids

## 概要

オブジェクトのID情報を表示

## データベース

`information_schema`

## テーブル情報

| Column Name   | Type         | Description          |
| ------------- | ------------ | -------------------- |
| CATALOG_ID    | bigint       | CatalogのID          |
| CATALOG_NAME  | varchar(512) | Catalogの名前        |
| DATABASE_ID   | bigint       | DatabaseのID         |
| DATABASE_NAME | varchar(64)  | Databaseの名前       |
| TABLE_ID      | bigint       | TableのID            |
| TABLE_NAME    | varchar(64)  | Tableの名前          |
