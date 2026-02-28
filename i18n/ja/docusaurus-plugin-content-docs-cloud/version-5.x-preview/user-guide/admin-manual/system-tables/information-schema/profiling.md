---
{
  "title": "プロファイリング",
  "description": "MySQL互換性のためのinformation_schema内のプロファイリングTable。常に空であり、レガシーサポートのために使用されます。",
  "language": "ja"
}
---
# profiling

## 概要

このTableは、MySQLの動作との互換性を維持する目的でのみ存在します。常に空です。

## データベース

`information_schema`

## Table情報

| Column Name         | タイプ        | デスクリプション |
| ------------------- | ----------- | ----------- |
| QUERY_ID            | int         |             |
| SEQ                 | int         |             |
| STATE               | varchar(30) |             |
| DURATION            | double      |             |
| CPU_USER            | double      |             |
| CPU_SYSTEM          | double      |             |
| CONTEXT_VOLUNTARY   | int         |             |
| CONTEXT_INVOLUNTARY | int         |             |
| BLOCK_OPS_IN        | int         |             |
| BLOCK_OPS_OUT       | int         |             |
| MESSAGES_SENT       | int         |             |
| MESSAGES_RECEIVED   | int         |             |
| PAGE_FAULTS_MAJOR   | int         |             |
| PAGE_FAULTS_MINOR   | int         |             |
| SWAPS               | int         |             |
| SOURCE_FUNCTION     | varchar(30) |             |
| SOURCE_FILE         | varchar(20) |             |
| SOURCE_LINE         | int         |             |
