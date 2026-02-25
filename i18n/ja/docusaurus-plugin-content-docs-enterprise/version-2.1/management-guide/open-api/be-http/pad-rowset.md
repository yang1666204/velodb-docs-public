---
{
  "title": "Pad Rowset",
  "language": "ja"
}
---
# Pad Rowset

## Request

`POST /api/pad_rowset?tablet_id={int}&start_version={int}&end_version={int}`

## Description

エラーレプリカの代替として空のrowsetを1つパッドします。

## Query parameters

* `tablet_id`
    タブレットのID

* `start_version`
    開始バージョン

* `end_version`
    終了バージョン


## Request body

なし

## Response

    ```
    {
        msg: "OK",
        code: 0
    }
    ```
## 例

    ```
    curl -X POST "http://127.0.0.1:8040/api/pad_rowset?tablet_id=123456&start_version=1111111&end_version=1111112"

    ```
