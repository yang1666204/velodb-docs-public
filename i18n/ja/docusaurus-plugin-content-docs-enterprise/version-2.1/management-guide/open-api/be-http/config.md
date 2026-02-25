---
{
  "title": "BEの設定",
  "language": "ja"
}
---
# Config of BE

## Request

`GET /api/show_config`
`POST /api/update_config?{key}={val}`

## Description

BEの設定を照会および更新します

## Query parameters

* `persist`
    永続化するかどうか。デフォルト値は`false`でオプションです。

* `key`
    設定項目名

* `val`
    設定項目値

## Request body

なし

## Response

### Query

```
[["agent_task_trace_threshold_sec","int32_t","2","true"], ...]
```
### Update

```
[
    {
        "config_name": "agent_task_trace_threshold_sec",
        "status": "OK",
        "msg": ""
    }
]
```
```
[
    {
        "config_name": "agent_task_trace_threshold_sec",
        "status": "OK",
        "msg": ""
    },
    {
        "config_name": "enable_segcompaction",
        "status": "BAD",
        "msg": "set enable_segcompaction=false failed, reason: [NOT_IMPLEMENTED_ERROR]'enable_segcompaction' is not support to modify."
    },
    {
        "config_name": "enable_time_lut",
        "status": "BAD",
        "msg": "set enable_time_lut=false failed, reason: [NOT_IMPLEMENTED_ERROR]'enable_time_lut' is not support to modify."
    }
]
```
## 例

```
curl "http://127.0.0.1:8040/api/show_config"
```
```
curl -X POST "http://127.0.0.1:8040/api/update_config?agent_task_trace_threshold_sec=2&persist=true"

```
```
curl -X POST "http://127.0.0.1:8040/api/update_config?agent_task_trace_threshold_sec=2&enable_merge_on_write_correctness_check=true&persist=true"
```
