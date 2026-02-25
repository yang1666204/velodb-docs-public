---
{
  "title": "View Tablet Distribution を表示",
  "language": "ja"
}
---
# View Tablet Distribution

## Request

`GET /api/tablets_distribution?group_by={enum}&partition_id={int}`

## Description

BEノード上の異なるディスク間で各パーティション下のタブレットの分散状況を取得します

## Query parameters

* `group_by`
    `partition`のみサポート

* `partition_id`
    指定されたパーティションのID、オプションでデフォルトは全パーティション。

## Request body

なし

## Response

    ```
    {
        msg: "OK",
        code: 0,
        data: {
            host: "***",
            tablets_distribution: [
                {
                    partition_id:***,
                    disks:[
                        {
                            disk_path:"***",
                            tablets_num:***,
                            tablets:[
                                {
                                    tablet_id:***,
                                    schema_hash:***,
                                    tablet_size:***
                                },

                                ...

                            ]
                        },

                        ...

                    ]
                }
            ]
        },
        count: ***
    }
    ```
## 例

    ```
    curl "http://127.0.0.1:8040/api/tablets_distribution?group_by=partition&partition_id=123"

    ```
