---
{
  "title": "チェックサム",
  "language": "ja"
}
---
# Checksum

## Request

`GET /api/checksum?tablet_id={int}&version={int}&schema_hash={int}`

## デスクリプション

Checksum

## Query parameters

* `tablet_id`
    チェックするタブレットのID

* `version`
    検証するタブレットのバージョン

* `schema_hash`
    スキーマハッシュ

## Request body

なし

## Response

    ```
    1843743562
    ```
## 例

    ```
    curl "http://127.0.0.1:8040/api/checksum?tablet_id=1&version=1&schema_hash=-1"
    
    ```
