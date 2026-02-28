---
{
  "title": "行数アクション",
  "language": "ja"
}
---
# Row Count Action

## Request

`GET /api/rowcount`

## デスクリプション

指定されたTableの行数統計を手動で更新するために使用されます。行数の統計を更新する際、Tableとrollupに対応する行数もJSON形式で返されます。

## Path parameters

なし

## Query parameters

* `db`

    データベースを指定

* `table`

    Tableを指定

## Request body

なし

## Response

```
{
	"msg": "success",
	"code": 0,
	"data": {
		"tbl1": 10000
	},
	"count": 0
}
```
## 例

1. 指定されたTableの行数を更新して取得する

    ```
    GET /api/rowcount?db=example_db&table=tbl1
    
    Response:
    {
    	"msg": "success",
    	"code": 0,
    	"data": {
    		"tbl1": 10000
    	},
    	"count": 0
    }
    ```
