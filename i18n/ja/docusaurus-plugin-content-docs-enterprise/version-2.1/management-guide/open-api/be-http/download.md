---
{
  "title": "Load Errorに関するダウンロードログ",
  "language": "ja"
}
---
# Load Error に関するログのダウンロード

## リクエスト

`GET /api/_load_error_log?token={string}&file={string}`

## 説明

load error に関するログファイルをダウンロードします

## クエリパラメータ

* `file`
    ログのパス

* `token`
    token         

## リクエストボディ

なし

## レスポンス

    ログのファイル

## 例

    ```
    curl "http://127.0.0.1:8040/api/_load_error_log?file=a&token=1"
    ```
