---
{
  "title": "スタブキャッシュの確認",
  "language": "ja"
}
---
# CHECK Stub Cache

## Request

`GET /api/check_rpc_channel/{host_to_check}/{remot_brpc_port}/{payload_size}`

## Description

接続キャッシュが利用可能かどうかをチェックします

## Path parameters

* `host_to_check`

    チェック対象のホスト

* `remot_brpc_port`

    リモートbrpcポート

* `payload_size`

    負荷サイズ、単位: B、値の範囲 1~1024000。

## Request body

なし

## Response

    ```
    {
        "msg":"success",
        "code":0,
        "data": "open brpc connection to {host_to_check}:{remot_brpc_port} success.",
        "count":0
    }
    ```
## 例

    ```
    curl http://127.0.0.1:8040/api/check_rpc_channel/127.0.0.1/8060/1024000
    ```
