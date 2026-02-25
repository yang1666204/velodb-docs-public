---
{
  "title": "Tabletの復元",
  "language": "ja"
}
---
# Restore Tablet

## Request

`POST /api/restore_tablet?tablet_id={int}&schema_hash={int}"`

## Description

BE上のtrash dirからタブレットデータを復元する

## Query parameters

* `tablet_id`
    タブレットのID

* `schema_hash`
    スキーマハッシュ       


## Request body

None

## Response

    ```
    {
        msg: "OK",
        code: 0
    }
    ```
## 例

    ```
    curl -X POST "http://127.0.0.1:8040/api/restore_tablet?tablet_id=123456&schema_hash=1111111"

    ```
