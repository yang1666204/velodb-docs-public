---
{
  "title": "Meta Info Action",
  "language": "ja"
}
---
# Meta Info Action

## Request

`GET /api/meta/namespaces/<ns>/databases`
`GET /api/meta/namespaces/<ns>/databases/<db>/tables`
`GET /api/meta/namespaces/<ns>/databases/<db>/tables/<tbl>/schema`

## デスクリプション

クラスターに関するメタデータ情報を取得するために使用されます。データベース一覧、Table一覧、Tableスキーマが含まれます。

## Path parameters

* `ns`

    クラスター名を指定します。

* `db`

    データベース名を指定します。

* `tbl`

    Table名を指定します。

## Query parameters

なし

## Request body

なし

## Response

```
{
    "msg":"success",
    "code":0,
    "data":["database list" / "table list" / "table schema"],
    "count":0
}
```
