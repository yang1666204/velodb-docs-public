---
{
  "title": "Help Action",
  "language": "ja"
}
---
# Help Action

## Request

`GET /rest/v1/help`

## Description

ファジークエリを通じてヘルプを取得するために使用されます。

## Path parameters

なし

## Query parameters

* `query`

    マッチする対象のキーワード（arrayやselectなど）。

## Request body

なし

## Response

```
{
    "msg":"success",
    "code":0,
    "data":{"fuzzy":"No Fuzzy Matching Topic","matching":"No Matching Category"},
    "count":0
}
```
