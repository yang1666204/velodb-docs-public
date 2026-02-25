---
{
  "title": "Backend Action",
  "language": "ja"
}
---
# Backends Action

## リクエスト

```
GET /api/backends
```
## Description

Backends ActionはBackendsのリストを返します。BackendのIP、PORT、その他の情報を含みます。

## Path parameters

なし

## Query parameters

* `is_alive`

    オプションパラメータ。生存しているBEノードを返すかどうかを指定します。デフォルトはfalseで、すべてのBEノードが返されることを意味します。

## Request body

なし

## Response

```
{
    "msg": "success",
    "code": 0,
    "data": {
        "backends": [
            {
                "ip": "192.1.1.1",
                "http_port": 8040,
                "is_alive": true
            }
        ]
    },
    "count": 0
}
```
