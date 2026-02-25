---
{
  "title": "Migration Tablet",
  "language": "ja"
}
---
# Migration Tablet

## Request

`GET /api/tablet_migration?goal={enum}&tablet_id={int}&schema_hash={int}&disk={string}`

## Description

タブレットを指定されたディスクに移行します。

## Query parameters

* `goal`
    - `run`：移行タスクを実行
    - `status`：移行タスクのステータスを表示

* `tablet_id`
    タブレットのID

* `schema_hash`
    スキーマハッシュ

* `disk`
    指定されたディスク

## Request body

なし

## Response

### Submit Task

```
    {
        status: "Success",
        msg: "migration task is successfully submitted."
    }
```
または

```
    {
        status: "Fail",
        msg: "Migration task submission failed"
    }
```
### ステータス表示

```
    {
        status: "Success",
        msg: "migration task is running",
        dest_disk: "xxxxxx"
    }
```
または

```
    {
        status: "Success",
        msg: "migration task has finished successfully",
        dest_disk: "xxxxxx"
    }
```
または

```
    {
        status: "Success",
        msg: "migration task failed.",
        dest_disk: "xxxxxx"
    }
```
## 例

    ```
    curl "http://127.0.0.1:8040/api/tablet_migration?goal=run&tablet_id=123&schema_hash=333&disk=/disk1"

    ```
