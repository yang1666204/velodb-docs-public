---
{
  "title": "メトリクス",
  "language": "ja"
}
---
# Metrics

## Request

`GET /metrics?type={enum}&with_tablet={bool}`

## 説明

prometheusに提供されます

## クエリパラメータ

* `type`
    出力スタイル、オプション、デフォルト値は`all`で、以下の値を指定できます：
    - `core`: コアアイテムのみ
    - `json`: Json形式

* `with_tablet`
    tablet関連のアイテムを出力するかどうか、オプション、デフォルト値は`false`です。

## リクエストボディ

なし

## レスポンス

    ```
    doris_be__max_network_receive_bytes_rate LONG 60757
    doris_be__max_network_send_bytes_rate LONG 16232
    doris_be_process_thread_num LONG 1120
    doris_be_process_fd_num_used LONG 336
    ，，，

    ```
## 例

    ```
        curl "http://127.0.0.1:8040/metrics?type=json&with_tablet=true"
    ```
