---
{
  "title": "backend_active_tasks",
  "description": "Backend上で現在実行中のQueryまたはLoadタスクのリソース使用状況を表示します。",
  "language": "ja"
}
---
## 概要

Backend上で現在実行されているQueryまたはLoadタスクのリソース使用量を表示します。

## Database

`information_schema`

## テーブル情報

| Column Name               | Type         | Description                                      |
| ------------------------- | ------------ | ------------------------------------------------ |
| BE_ID                     | bigint       | タスクを実行しているBackendのID                  |
| FE_HOST                   | varchar(256) | タスクを発行したFrontendのアドレス               |
| QUERY_ID                  | varchar(256) | クエリのID                                       |
| TASK_TIME_MS              | bigint       | タスクの実行時間                                 |
| TASK_CPU_TIME_MS          | bigint       | タスクが使用したCPU時間                          |
| SCAN_ROWS                 | bigint       | スキャンされた行数                               |
| SCAN_BYTES                | bigint       | スキャンされたバイト数                           |
| BE_PEAK_MEMORY_BYTES      | bigint       | ピークメモリ使用量                               |
| CURRENT_USED_MEMORY_BYTES | bigint       | 現在のメモリ使用量                               |
| SHUFFLE_SEND_BYTES        | bigint       | シャッフルして送信されたバイト数                 |
| SHUFFLE_SEND_ROWS         | bigint       | シャッフルして送信された行数                     |
| QUERY_TYPE                | varchar(256) | クエリのタイプ                                   |
