---
{
  "title": "Load State の取得",
  "language": "ja"
}
---
# Get Load State

## Request

`GET /api/<db>/get_load_state`

## デスクリプション

指定されたラベルのロードトランザクションのステータスを返します
指定されたトランザクションのステータスのJSON形式文字列を返します：
	Label: 指定されたラベル。
	Status: このリクエストの成功可否。
	Message: エラーメッセージ
	State: 
		UNKNOWN/PREPARE/COMMITTED/VISIBLE/ABORTED
    
## Path parameters

* `<db>`

    データベースを指定

## Query parameters

* `label`

    ラベルを指定

## Request body

なし

## Response

```
{
	"msg": "success",
	"code": 0,
	"data": "VISIBLE",
	"count": 0
}
```
ラベルが存在しない場合は、以下を返す：

```
{
	"msg": "success",
	"code": 0,
	"data": "UNKNOWN",
	"count": 0
}
```
## Examples

1. 指定されたラベルのロードトランザクションのステータスを取得します。

    ```
    GET /api/example_db/get_load_state?label=my_label
    
    {
    	"msg": "success",
    	"code": 0,
    	"data": "VISIBLE",
    	"count": 0
    }
    ```
