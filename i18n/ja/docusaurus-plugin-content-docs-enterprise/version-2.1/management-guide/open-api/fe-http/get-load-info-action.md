---
{
  "title": "Load情報取得アクション",
  "language": "ja"
}
---
# Get Load Info Action

## Request

`GET /api/<db>/_load_info`

## デスクリプション

指定されたラベルのロードジョブの情報を取得するために使用されます。
    
## Path parameters

* `<db>`

    データベースを指定

## Query parameters

* `label`

    ロードラベルを指定

## Request body

なし

## Response

```
{
	"msg": "success",
	"code": 0,
	"data": {
		"dbName": "default_cluster:db1",
		"tblNames": ["tbl1"],
		"label": "my_label",
		"clusterName": "default_cluster",
		"state": "FINISHED",
		"failMsg": "",
		"trackingUrl": ""
	},
	"count": 0
}
```
## Examples

1. 指定されたラベルのload jobの情報を取得する

    ```
    GET /api/example_db/_load_info?label=my_label
    
    Response
    {
    	"msg": "success",
    	"code": 0,
    	"data": {
    		"dbName": "default_cluster:db1",
    		"tblNames": ["tbl1"],
    		"label": "my_label",
    		"clusterName": "default_cluster",
    		"state": "FINISHED",
    		"failMsg": "",
    		"trackingUrl": ""
    	},
    	"count": 0
    }
    ```
