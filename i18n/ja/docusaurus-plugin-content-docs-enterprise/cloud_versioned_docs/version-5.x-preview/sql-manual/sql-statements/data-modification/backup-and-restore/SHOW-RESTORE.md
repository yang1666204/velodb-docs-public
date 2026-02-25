---
{
  "title": "SHOW RESTORE",
  "description": "この文はRESTOREタスクを表示するために使用されます",
  "language": "ja"
}
---
## Description

このステートメントはRESTOREタスクを表示するために使用されます

## Syntax

```SQL
SHOW [BRIEF] RESTORE [FROM <db_name>]
```
## Parameters

**1.`<db_name>`**

復旧タスクが属するデータベースの名前。

## Return Value

- brief: RESTOREタスクの重要な情報のみを表示し、RestoreObjs、Progress、TaskErrMsg列は表示されません

| Column | Description |
| -- | -- |
| JobId | 一意のジョブID |
| Label | 復元するバックアップの名前 |
| Timestamp | 復元するバックアップの時刻バージョン |
| DbName | 属するデータベース |
| State | 現在のステージ: <ul><li>PENDING: ジョブ送信後の初期状態。</li><li>SNAPSHOTING: スナップショット実行中。</li><li>DOWNLOAD: スナップショット完了、リポジトリ内のスナップショットのダウンロード準備完了。</li><li>DOWNLOADING: スナップショットダウンロード中。</li><li>COMMIT: スナップショットダウンロード完了、有効化準備完了。</li><li>COMMITTING: 有効化中。</li><li>FINISHED: ジョブ完了時刻。</li><li>CANCELLED: ジョブ失敗。</li></ul> |
| AllowLoad | 復元時にインポートを許可するかどうか（現在サポートされていません）|
| ReplicationNum | 復元するレプリカ数を指定 |
| ReserveReplica | コピーを保持するかどうか |
| ReplicaAllocation | 動的パーティショニングを有効に保つかどうか |
| RestoreJobs | 復元するテーブルとパーティション |
| CreateTime | タスク送信時刻 |
| MetaPreparedTime | メタデータ準備完了時刻 |
| SnapshotFinishedTime | スナップショット完了時刻 |
| DownloadFinishedTime | スナップショットダウンロード完了時刻 |
| FinishedTime | ジョブ完了時刻 |
| UnfinishedTasks | SNAPSHOTING、DOWNLOADING、COMMITINGステージ中に未完了のサブタスクIDを表示 |
| Progress | タスク進捗 |
| TaskErrMsg | タスクエラーメッセージを表示 |
| Status | ジョブが失敗した場合、失敗メッセージを表示 |
| Timeout | ジョブタイムアウト（秒単位） |

## Example

1. example_db下の最新のRESTOREタスクを表示。

```sql
SHOW RESTORE FROM example_db;
```
