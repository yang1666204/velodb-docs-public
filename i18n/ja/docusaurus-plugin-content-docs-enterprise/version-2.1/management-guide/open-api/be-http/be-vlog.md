---
{
  "title": "BE VLOGを修正",
  "language": "ja"
}
---
## Request

`POST /api/glog/adjust?module=<module_name>&level=<level_number>`

## デスクリプション

この機能はBE側のVLOGログを動的に調整するために使用されます。

## Query parameters

* `module_name`
    VLOGを設定するモジュール、サフィックスを除いたBEのファイル名に対応

* `level_number`
    VLOGレベル、1から10まで。オフにする場合は-1

## Request body

なし

## Response

    ```json
    {
        msg: "adjust vlog of xxx from -1 to 10 succeed",
        code: 0
    }
    ```
## 例

    ```bash
    curl -X POST "http://127.0.0.1:8040/api/glog/adjust?module=vrow_distribution&level=-1"
    ```
