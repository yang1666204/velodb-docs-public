---
{
  "title": "Table行数アクション",
  "language": "ja"
}
---
# Table Row Count Action

## Request

`GET /api/<db>/<table>/_count`

## デスクリプション

指定されたTableの行数に関する統計情報を取得するために使用されます。このインターフェースは現在Spark-Doris-Connectorで使用されています。SparkはDorisTableの統計情報を取得します。

## Path parameters

* `<db>`

    データベースを指定

* `<table>`

    Tableを指定

## Query parameters

なし

## Request body

なし

## Response

```
{
	"msg": "success",
	"code": 0,
	"data": {
		"size": 1,
		"status": 200
	},
	"count": 0
}
```
`data.size`フィールドは、指定されたTable内の行数を示します。

## Examples

1. 指定されたTable内の行数を取得します。

    ```
    GET /api/db1/tbl1/_count
    
    Response:
    {
    	"msg": "success",
    	"code": 0,
    	"data": {
    		"size": 1,
    		"status": 200
    	},
    	"count": 0
    }
    ```
