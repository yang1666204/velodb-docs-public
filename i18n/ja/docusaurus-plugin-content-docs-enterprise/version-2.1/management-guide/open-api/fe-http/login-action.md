---
{
  "title": "ログインアクション",
  "language": "ja"
}
---
# Login Action

## Request

`POST /rest/v1/login`

## Description

サービスへのログインに使用されます。

## Path parameters

なし

## Query parameters

なし

## Request body

なし

## Response

* ログイン成功

    ```
    {
    	"msg": "Login success!",
    	"code": 200
    }
    ```
* ログイン失敗

    ```
    {
    	"msg": "Error msg...",
    	"code": xxx,
    	"data": "Error data...",
    	"count": 0
    }
    ```
