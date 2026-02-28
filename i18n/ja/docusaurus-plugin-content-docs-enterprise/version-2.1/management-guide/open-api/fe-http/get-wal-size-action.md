---
{
  "title": "WALサイズを取得する",
  "language": "ja"
}
---
## Request

`GET fe_host:fe_http_port/api/get_wal_size?host_ports=host1:port1,host2:port2...`

## デスクリプション

ユーザーはこのHTTPインターフェースを通じて指定されたBEのWALファイルの数を取得できます。BEが指定されていない場合、デフォルトですべてのBEのWALファイルの数が返されます。

## Path parameters

なし

## Query parameters

* `host_ports`

    BEのipとhttpポート。

## Request body

なし

## Response

```
{
"msg": "OK",
"code": 0,
"data": ["192.168.10.11:9050:1", "192.168.10.11:9050:0"],
"count": 0
}
```
## Examples

1. すべてのBEのWALファイルの数を取得する。

    ```
    curl -u root: "127.0.0.1:8038/api/get_wal_size"
    
    Response:
    {
    "msg": "OK",
    "code": 0,
    "data": ["192.168.10.11:9050:1", "192.168.10.11:9050:0"],
    "count": 0
    }
    ```
返されたリザルトにおいて、BEに続く数字が対応するBEのWALファイル数になります。

2. 指定したBEのWALファイル数を取得する。

    ```
    curl -u root: "127.0.0.1:8038/api/get_wal_size?192.168.10.11:9050"
    
    Response:
    {
    "msg": "OK",
    "code": 0,
    "data": ["192.168.10.11:9050:1"],
    "count": 0
    }
    ```
返される結果において、BEの後に続く数字が対応するBEのWALファイル数になります。
