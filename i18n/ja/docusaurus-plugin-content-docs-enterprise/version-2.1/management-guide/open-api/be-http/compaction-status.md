---
{
  "title": "View Compaction Statusの確認",
  "language": "ja"
}
---
# View Compaction Status

## Request

`GET /api/compaction/run_status`
`GET /api/compaction/show?tablet_id={int}`

## Description

BEノードの全体的なcompaction状況と、指定されたtabletのcompaction状況を確認するために使用されます。

## Query parameters

* `tablet_id`
    tabletのID

## Request body

なし

## Response

### ノードの全体的なcompaction状況

```
{
  "CumulativeCompaction": {
         "/home/disk1" : [10001, 10002],
         "/home/disk2" : [10003]
  },
  "BaseCompaction": {
         "/home/disk1" : [10001, 10002],
         "/home/disk2" : [10003]
  }
}
```
この構造体は、特定のデータディレクトリでcompactionタスクを実行しているタブレットのidと、compactionの種類を表します。

### タブレットのcompaction状態を指定する

```
{
    "cumulative policy type": "SIZE_BASED",
    "cumulative point": 50,
    "last cumulative failure time": "2019-12-16 18:13:43.224",
    "last base failure time": "2019-12-16 18:13:23.320",
    "last cumu success time": ,
    "last base success time": "2019-12-16 18:11:50.780",
    "rowsets": [
        "[0-48] 10 DATA OVERLAPPING 574.00 MB",
        "[49-49] 2 DATA OVERLAPPING 574.00 B",
        "[50-50] 0 DELETE NONOVERLAPPING 574.00 B",
        "[51-51] 5 DATA OVERLAPPING 574.00 B"
    ],
    "missing_rowsets": [],
    "stale version path": [
        {
            "path id": "2",
            "last create time": "2019-12-16 18:11:15.110 +0800",
            "path list": "2-> [0-24] -> [25-48]"
        }, 
        {
            "path id": "1",
            "last create time": "2019-12-16 18:13:15.110 +0800",
            "path list": "1-> [25-40] -> [40-48]"
        }
    ]
}
```
結果の説明:

* cumulative policy type: 現在のタブレットで使用されているcumulative compactionポリシーのタイプ。
* cumulative point: baseとcumulative compactionの間のバージョン境界。このポイントより前（このポイントを除く）のバージョンはbase compactionで処理される。このポイント以降（このポイントを含む）のバージョンはcumulative compactionで処理される。
* last cumulative failure time: 最後にcumulative compactionが失敗した時刻。デフォルトでは10分後に、このタブレットで再度cumulative compactionが試行される。
* last base failure time: 最後にbase compactionが失敗した時刻。デフォルトでは10分後に、このタブレットで再度base compactionが試行される。
* rowsets: このタブレットの現在のrowsetsコレクション。[0-48]はバージョン0-48のrowsetを意味する。2番目の数字はrowset内のセグメント数。DELETEは削除バージョンを示す。OVERLAPPINGとNONOVERLAPPINGは、セグメント間のデータが重複しているかどうかを示す。
* missing_rowset: 欠落しているrowsets。
* stale version path: 現在タブレット内でマージされているrowsetコレクションのマージされたバージョンパス。これは配列構造で、各要素はマージされたパスを表す。各要素には3つの属性が含まれる：path idはバージョンパスIDを示し、last create timeはそのパス上の最新のrowsetの作成時刻を示す。デフォルトでは、このパス上のすべてのrowsetsは、last create timeの30分後に削除される。

## Examples

```
curl http://192.168.10.24:8040/api/compaction/show?tablet_id=10015
```
