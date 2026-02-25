---
{
  "title": "Small Fileの取得Action",
  "language": "ja"
}
---
# Get Small File

## Request

`GET /api/get_small_file`

## Description

ファイルIDを通じて、スモールファイルマネージャー内のファイルをダウンロードします。

## Path parameters

なし

## Query parameters

* `token`

    クラスターのトークンです。ファイル `doris-meta/image/VERSION` で確認できます。

* `file_id`
    
    ファイルマネージャーで表示されるファイルIDです。ファイルIDは `SHOW FILE` コマンドで確認できます。

## Request body

なし

## Response

```
< HTTP/1.1 200
< Vary: Origin
< Vary: Access-Control-Request-Method
< Vary: Access-Control-Request-Headers
< Content-Disposition: attachment;fileName=ca.pem
< Content-Type: application/json;charset=UTF-8
< Transfer-Encoding: chunked

... File Content ...
```
エラーが発生した場合、以下を返します：

```
{
	"msg": "File not found or is not content",
	"code": 1,
	"data": null,
	"count": 0
}
```
## Examples

1. 指定されたidでファイルをダウンロードする

    ```
    GET /api/get_small_file?token=98e8c0a6-3a41-48b8-a72b-0432e42a7fe5&file_id=11002
    
    Response:
    
    < HTTP/1.1 200
    < Vary: Origin
    < Vary: Access-Control-Request-Method
    < Vary: Access-Control-Request-Headers
    < Content-Disposition: attachment;fileName=ca.pem
    < Content-Type: application/json;charset=UTF-8
    < Transfer-Encoding: chunked
    
    ... File Content ...
    ```
