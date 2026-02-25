---
{
  "title": "手動でCompactionをトリガーする",
  "language": "ja"
}
---
# 手動でCompactionをトリガーする

## リクエスト

`POST /api/compaction/run?tablet_id={int}&compact_type={enum}`
`POST /api/compaction/run?table_id={int}&compact_type=full` なお、table_id=xxxはcompact_type=fullが指定された場合のみ有効になります。
`GET /api/compaction/run_status?tablet_id={int}`


## 説明

比較を手動でトリガーし、ステータスを表示するために使用されます。

## クエリパラメータ

* `tablet_id`
    - タブレットのID

* `table_id`
    - テーブルのID。なお、table_id=xxxはcompact_type=fullが指定された場合のみ有効になり、tablet_idとtable_idはどちらか一つのみ指定でき、同時に指定することはできません。table_idを指定すると、このテーブル配下のすべてのタブレットに対してfull_compactionが自動実行されます。

* `compact_type`
    - 値は`base`または`cumulative`または`full`です。full_compactionの使用シナリオについては、[Data Recovery](../../../admin-manual/trouble-shooting/repairing-data)を参照してください。

## リクエストボディ

なし

## レスポンス

### Compactionのトリガー

タブレットが存在しない場合、JSON形式のエラーが返されます：

```
{
    "status": "Fail",
    "msg": "Tablet not found"
}
```
タブレットが存在し、タブレットが実行されていない場合、JSON形式が返されます：

```
{
    "status": "Fail",
    "msg": "fail to execute compaction, error = -2000"
}
```
タブレットが存在し、タブレットが実行中の場合、JSON形式が返されます：

```
{
    "status": "Success",
    "msg": "compaction task is successfully triggered."
}
```
結果の説明：

* status: Trigger タスクのステータス。正常にトリガーされた場合は Success、何らかの理由（例：適切なバージョンが取得されない）の場合は Fail を返します。
* msg: 成功または失敗の具体的な情報を提供します。

### Show Status

タブレットが存在しない場合、JSON形式でエラーが返されます：

```
{
    "status": "Fail",
    "msg": "Tablet not found"
}
```
タブレットが存在し、タブレットが実行されていない場合、JSON形式が返されます：

```
{
    "status" : "Success",
    "run_status" : false,
    "msg" : "this tablet_id is not running",
    "tablet_id" : 11308,
    "schema_hash" : 700967178,
    "compact_type" : ""
}
```
タブレットが存在し、タブレットが実行中の場合、JSON形式が返されます：

```
{
    "status" : "Success",
    "run_status" : true,
    "msg" : "this tablet_id is running",
    "tablet_id" : 11308,
    "schema_hash" : 700967178,
    "compact_type" : "cumulative"
}
```
結果の説明：

* run_status: 現在の手動コンパクションタスクの実行ステータスを取得します。

### 例

```
curl -X POST "http://127.0.0.1:8040/api/compaction/run?tablet_id=10015&compact_type=cumulative"
```
