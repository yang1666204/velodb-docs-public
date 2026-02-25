---
{
  "title": "Storage Type Action を確認する",
  "language": "ja"
}
---
# Check Storage Type Action

## Request

`GET /api/_check_storagetype`

## Description

指定されたデータベース配下のテーブルのストレージ形式が行ストレージ形式かどうかをチェックするために使用されます。（行形式は非推奨です）

## Path parameters

なし

## Query parameters

* `db`

    データベースを指定します

## Request body

なし

## Response

```
{
	"msg": "success",
	"code": 0,
	"data": {
		"tbl2": {},
		"tbl1": {}
	},
	"count": 0
}
```
テーブル名の後にコンテンツがある場合、ストレージ形式が行ストレージであるベーステーブルまたはロールアップテーブルが表示されます。

## Examples

1. 指定されたデータベースの以下のテーブルのストレージ形式が行形式かどうかを確認する

    ```
    GET /api/_check_storagetype
    
    Response:
    {
    	"msg": "success",
    	"code": 0,
    	"data": {
    		"tbl2": {},
    		"tbl1": {}
    	},
    	"count": 0
    }
    ```
