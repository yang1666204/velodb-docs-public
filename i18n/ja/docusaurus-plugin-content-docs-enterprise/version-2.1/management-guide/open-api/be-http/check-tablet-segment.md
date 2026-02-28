---
{
  "title": "全てのタブレットセグメント損失を確認",
  "language": "ja"
}
---
# Check All Tablet Segment Lost

## Request

`GET /api/check_tablet_segment_lost?repair={bool}`

## デスクリプション

BEノード上でセグメントが失われる原因となる例外が発生する場合があります。しかし、メタデータはタブレットが正常であることを示しています。この異常なレプリカはFEによって検出されず、自動的に修復することができません。クエリが実行されると、`failed to initialize storage reader`という例外情報がスローされます。このインターフェースの機能は、現在のBEノード上でセグメントが失われたすべてのタブレットをチェックすることです。

## Query parameters

* `repair`
    - `true`: セグメントが失われたタブレットはSHUTDOWNステータスに設定され、不良レプリカとして扱われます。これによりFEで検出され修復が可能になります。
    - `false`: セグメントが欠損しているすべてのタブレットが返され、何も実行されません。

## Request body

None

## Response

    戻り値は、現在のBEノード上でセグメントが失われたすべてのタブレットです：

    ```
    {
        status: "Success",
        msg: "Succeed to check all tablet segment",
        num: 3,
        bad_tablets: [
            11190,
            11210,
            11216
        ],
        set_bad: true,
        host: "172.3.0.101"
    }
    ```
## 例

    ```
    curl http://127.0.0.1:8040/api/check_tablet_segment_lost?repair=false
    ```
