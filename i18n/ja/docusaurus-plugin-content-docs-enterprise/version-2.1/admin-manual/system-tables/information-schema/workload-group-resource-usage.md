---
{
  "title": "workload_group_resource_usage",
  "description": "Workload Group リソースの使用量情報を保存します。",
  "language": "ja"
}
---
## 概要

Workload Groupリソースの使用情報を格納します。

## データベース


`information_schema`


## テーブル情報

| Column Name                  | Type   | Description                               |
| ---------------------------- | ------ | ----------------------------------------- |
| BE_ID                        | bigint | BackendのID                     |
| WORKLOAD_GROUP_ID            | bigint | Workload GroupのID              |
| MEMORY_USAGE_BYTES           | bigint | メモリ使用量（バイト）                     |
| CPU_USAGE_PERCENT            | double | CPU使用率                      |
| LOCAL_SCAN_BYTES_PER_SECOND  | bigint | ローカルスキャンデータレート（バイト/秒）  |
| REMOTE_SCAN_BYTES_PER_SECOND | bigint | リモートスキャンデータレート（バイト/秒） |
