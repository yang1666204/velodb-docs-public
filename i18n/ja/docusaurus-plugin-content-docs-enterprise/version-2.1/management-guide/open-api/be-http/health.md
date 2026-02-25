---
{
  "title": "Check Alive",
  "language": "ja"
}
---
# Check Alive

## Request

`GET /api/health`

## Description

監視サービスがBEが生きているかどうかを確認するために提供されています。生きている場合、Beが応答します。

## Query parameters

なし

## Request body

なし

## Response

    ```
    {"status": "OK","msg": ""}
    ```
## 例

    ```
    curl http://127.0.0.1:8040/api/health
    ```
