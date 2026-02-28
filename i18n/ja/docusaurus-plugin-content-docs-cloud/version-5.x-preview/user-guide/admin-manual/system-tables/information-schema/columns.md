---
{
  "title": "columns",
  "description": "全ての列情報を表示します。",
  "language": "ja"
}
---
# columns

## 概要

すべてのカラム情報を表示します。

## データベース

`information_schema`

## Table情報

| Column Name              | タイプ          | デスクリプション                                                  |
| ------------------------ | ------------- | ------------------------------------------------------------ |
| TABLE_CATALOG            | varchar(512)  | カタログ名                                                   |
| TABLE_SCHEMA             | varchar(64)   | データベース名                                               |
| TABLE_NAME               | varchar(64)   | Table名                                                   |
| COLUMN_NAME              | varchar(64)   | カラム名                                                     |
| ORDINAL_POSITION         | bigint        | Table内でのカラムの位置                                   |
| COLUMN_DEFAULT           | varchar(1024) | カラムのデフォルト値                                         |
| IS_NULLABLE              | varchar(3)    | NULLが許可されているかどうか                                 |
| DATA_TYPE                | varchar(64)   | データ型                                                     |
| CHARACTER_MAXIMUM_LENGTH | bigint        | 文字型で許可される最大文字数                                 |
| CHARACTER_OCTET_LENGTH   | bigint        | 文字型で許可される最大バイト数                               |
| NUMERIC_PRECISION        | bigint        | 数値型の精度                                                 |
| NUMERIC_SCALE            | bigint        | 数値型のスケール                                             |
| DATETIME_PRECISION       | bigint        | 日時型の精度                                                 |
| CHARACTER_SET_NAME       | varchar(32)   | 文字型の文字セット名、常にNULL                               |
| COLLATION_NAME           | varchar(32)   | 文字型の照合順序アルゴリズム名、常にNULL                     |
| COLUMN_TYPE              | varchar(32)   | カラム型                                                     |
| COLUMN_KEY               | varchar(3)    | 'UNI'の場合、そのカラムがUnique Keyカラムであることを示す    |
| EXTRA                    | varchar(27)   | 自動増分カラム、生成カラムなどを含む、カラムに関する追加情報 |
| PRIVILEGES               | varchar(80)   | 常に空                                                       |
| COLUMN_COMMENT           | varchar(255)  | カラムのコメント情報                                         |
| COLUMN_SIZE              | bigint        | カラムの幅                                                   |
| DECIMAL_DIGITS           | bigint        | 数値型の小数点以下の桁数                                     |
| GENERATION_EXPRESSION    | varchar(64)   | 常にNULL                                                     |
| SRS_ID                   | bigint        | 常にNULL                                                     |
