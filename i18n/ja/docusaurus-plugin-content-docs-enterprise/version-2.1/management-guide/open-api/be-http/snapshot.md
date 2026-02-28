---
{
  "title": "スナップショットを作成する",
  "language": "ja"
}
---
# Make Snapshot

## Request

`GET /api/snapshot?tablet_id={int}&schema_hash={int}"`

## デスクリプション

tabletのsnapshotを作成します

## Query parameters

* `tablet_id`
    tabletのID

* `schema_hash`
    Schemaハッシュ         


## Request body

なし

## Response

    ```
    /path/to/snapshot
    ```
## 例

    ```
    curl "http://127.0.0.1:8040/api/snapshot?tablet_id=123456&schema_hash=1111111"

    ```
