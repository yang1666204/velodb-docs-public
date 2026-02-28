---
{
  "title": "接続アクション",
  "language": "ja"
}
---
# Connection Action

## Request

`GET /api/connection`

## デスクリプション

接続IDが与えられると、この接続で現在実行されているクエリIDまたは最後に完了した実行を返します。

接続IDは、MySQLコマンド`show processlist;`のidカラムで確認できます。
    
## Path parameters

无

## Query parameters

* `connection_id`

    指定する接続ID

## Request body

None

## Response

```
{
	"msg": "OK",
	"code": 0,
	"data": {
		"query_id": "b52513ce3f0841ca-9cb4a96a268f2dba"
	},
	"count": 0
}
```
## Examples

1. 指定されたconnection idのquery idを取得する

    ```
    GET /api/connection?connection_id=101
    
    Response:
    {
    	"msg": "OK",
    	"code": 0,
    	"data": {
    		"query_id": "b52513ce3f0841ca-9cb4a96a268f2dba"
    	},
    	"count": 0
    }
    ```
