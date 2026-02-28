---
{
  "title": "ノード アクション",
  "language": "ja"
}
---
## Request

`GET /rest/v2/manager/node/frontends`

`GET /rest/v2/manager/node/backends`

`GET /rest/v2/manager/node/brokers`

`GET /rest/v2/manager/node/configuration_name`

`GET /rest/v2/manager/node/node_list`

`POST /rest/v2/manager/node/configuration_info`

`POST /rest/v2/manager/node/set_config/fe`

`POST /rest/v2/manager/node/set_config/be`

`POST /rest/v2/manager/node/{action}/be`

`POST /rest/v2/manager/node/{action}/fe`

## fe、be、brokerノードの情報を取得

`GET /rest/v2/manager/node/frontends`

`GET /rest/v2/manager/node/backends`

`GET /rest/v2/manager/node/brokers`

### 説明

クラスターのfe、be、brokerノード情報を取得するために使用されます。

### Response

```
frontends:
{
    "msg": "success",
    "code": 0,
    "data": {
        "column_names": [
            "Name",
            "IP",
            "HostName",
            "EditLogPort",
            "HttpPort",
            "QueryPort",
            "RpcPort",
            "ArrowFlightSqlPort",
            "Role",
            "IsMaster",
            "ClusterId",
            "Join",
            "Alive",
            "ReplayedJournalId",
            "LastHeartbeat",
            "IsHelper",
            "ErrMsg",
            "Version"
        ],
        "rows": [
            [
                ...
            ]
        ]
    },
    "count": 0
}
```
```
backends:
{
    "msg": "success",
    "code": 0,
    "data": {
        "column_names": [
            "BackendId",
            "Cluster",
            "IP",
            "HostName",
            "HeartbeatPort",
            "BePort",
            "HttpPort",
            "BrpcPort",
            "LastStartTime",
            "LastHeartbeat",
            "Alive",
            "SystemDecommissioned",
            "ClusterDecommissioned",
            "TabletNum",
            "DataUsedCapacity",
            "AvailCapacity",
            "TotalCapacity",
            "UsedPct",
            "MaxDiskUsedPct",
            "ErrMsg",
            "Version",
            "Status"
        ],
        "rows": [
            [
                ...
            ]
        ]
    },
    "count": 0
}
```
```
brokers:
{
    "msg": "success",
    "code": 0,
    "data": {
        "column_names": [
            "Name",
            "IP",
            "HostName",
            "Port",
            "Alive",
            "LastStartTime",
            "LastUpdateTime",
            "ErrMsg"
        ],
        "rows": [
            [
                ...
            ]
        ]
    },
    "count": 0
}
```
## ノード設定情報の取得

`GET /rest/v2/manager/node/configuration_name`

`GET /rest/v2/manager/node/node_list`

`POST /rest/v2/manager/node/configuration_info`

### 説明

configuration_name ノード設定項目の名前を取得するために使用されます。  
node_list ノードのリストを取得します。  
configuration_info ノード設定の詳細を取得するために使用されます。

### クエリパラメータ
`GET /rest/v2/manager/node/configuration_name`   
なし

`GET /rest/v2/manager/node/node_list`  
なし

`POST /rest/v2/manager/node/configuration_info`

* type 
  値はfeまたはbeで、feの設定情報またはbeの設定情報を取得することを指定します。

### リクエストボディ

`GET /rest/v2/manager/node/configuration_name`   
なし

`GET /rest/v2/manager/node/node_list`  
なし

`POST /rest/v2/manager/node/configuration_info`

```
{
	"conf_name": [
		""
	],
	"node": [
		""
	]
}

If no body is included, the parameters in the body use the default values.  
conf_name specifies which configuration items to return, the default is all configuration items.
node is used to specify which node's configuration information is returned, the default is all fe nodes or be nodes configuration information.
```
### Response
`GET /rest/v2/manager/node/configuration_name`

```json 
{
    "msg": "success",
    "code": 0,
    "data": {
        "backend":[
            ""
        ],
        "frontend":[
            ""
        ]
    },
    "count": 0
}
```
`GET /rest/v2/manager/node/node_list`

```json 
{
    "msg": "success",
    "code": 0,
    "data": {
        "backend": [
            ""
        ],
        "frontend": [
            ""
        ]
    },
    "count": 0
}
```
`POST /rest/v2/manager/node/configuration_info?type=fe`

```json
{  
    "msg": "success",  
    "code": 0,  
    "data": {  
        "column_names": [  
            "構成 Item",  
            "Node",  
            "Node Type",  
            "構成 Value Type",  
            "MasterOnly",  
            "構成 Value",  
            "Modifiable"  
        ],  
        "rows": [  
            [  
                ""  
            ]  
        ]  
    },  
    "count": 0  
}
```
`POST /rest/v2/manager/node/configuration_info?type=be`

```
{
    "msg": "success",
    "code": 0,
    "data": {
        "column_names": [
            "構成 Item",
            "Node",
            "Node Type",
            "構成 Value Type",
            "構成 Value",
            "Modifiable"
        ],
        "rows": [
            [
                ""
            ]
        ]
    },
    "count": 0
}
```
### 例

1. fe agent_task_resend_wait_time_ms 設定情報を取得する：

    POST /rest/v2/manager/node/configuration_info?type=fe  
    body:

    ```json
    {
        "conf_name":[
            "agent_task_resend_wait_time_ms"
        ]
    }
    ```

    ```json
    {  
    "msg": "success",  
    "code": 0,  
    "data": {  
        "column_names": [  
            "構成 Item",  
            "Node",  
            "Node Type",  
            "構成 Value Type",  
            "MasterOnly",  
            "構成 Value",  
            "Modifiable"  
        ],  
        "rows": [  
            [  
                "agent_task_resend_wait_time_ms",  
                "127.0.0.1:8030",  
                "FE",  
                "long",  
                "true",  
                "50000",  
                "true"  
            ]  
        ]  
    },  
    "count": 0  
    }
    ```
## 設定値の変更

`POST /rest/v2/manager/node/set_config/fe`

`POST /rest/v2/manager/node/set_config/be`

### 説明

feまたはbeノードの設定値を変更するために使用されます

### リクエストボディ

```json
{
	"config_name":{
		"node":[
			""
		],
		"value":"",
		"persist":
	}
}

config_name is the corresponding configuration item.  
node is a keyword indicating the list of nodes to be modified;  
value is the value of the configuration.  
persist is true for permanent modification and false for temporary modification. persist means permanent modification, false means temporary modification. permanent modification takes effect after reboot, temporary modification fails after reboot.
```
### Response
`GET /rest/v2/manager/node/configuration_name`

``` json
{
	"msg": "",
	"code": 0,
	"data": {
		"failed":[
			{
				"config_name":"name",
				"value"="",
				"node":"",
				"err_info":""
			}
		]
	},
	"count": 0
}

failed Indicates a configuration message that failed to be modified.
```
### 例

1. fe 127.0.0.1:8030 ノードの agent_task_resend_wait_time_ms と alter_table_timeout_second 設定値を変更する：

    POST /rest/v2/manager/node/set_config/fe
    body:

    ```json
    {
        "agent_task_resend_wait_time_ms":{
            "node":[
		    	"127.0.0.1:8030"
		    ],
		    "value":"10000",
		    "persist":"true"
        },
        "alter_table_timeout_second":{
            "node":[
		    	"127.0.0.1:8030"
		    ],
		    "value":"true",
		    "persist":"true"
        }
    }
    ```

    ```
    {
        "msg": "success",
        "code": 0,
        "data": {
            "failed": [
                {
                    "config_name": "alter_table_timeout_second",
                    "node": "10.81.85.89:8837",
                    "err_info": "Unsupported configuration value type.",
                    "value": "true"
                }
            ]
        },
        "count": 0
    }

    gent_task_resend_wait_time_ms configuration value modified successfully, alter_table_timeout_second modification failed.
    ```
## Operate be node

`POST /rest/v2/manager/node/{action}/be`

### デスクリプション

be nodeの追加/削除/オフライン化に使用されます

action：ADD/DROP/DECOMMISSION

### Request body

```json
{
    "hostPorts": ["127.0.0.1:9050"],
    "properties": {
        "tag.location": "test"
    }
}

hostPorts A set of be node addresses to be operated, ip:heartbeat_port
properties The configuration passed in when adding a node is only used to configure the tag. If not, the default tag is used
```
### Response
```json
{
    "msg": "Error",
    "code": 1,
    "data": "errCode = 2, detailMessage = Same backend already exists[127.0.0.1:9050]",
    "count": 0
}

msg Success/Error
code 0/1
data ""/Error message
```
### Examples

1. add be node

   post /rest/v2/manager/node/ADD/be
   Request body

    ```json
    {
        "hostPorts": ["127.0.0.1:9050"]
    }
    ```
レスポンス

    ```json
    {
        "msg": "success",
        "code": 0,
        "data": null,
        "count": 0
    }
    ```
2. drop be node

   post /rest/v2/manager/node/DROP/be
   リクエストボディ

    ```json
    {
        "hostPorts": ["127.0.0.1:9050"]
    }
    ```
レスポンス

    ```json
    {
        "msg": "success",
        "code": 0,
        "data": null,
        "count": 0
    }
    ```
3. offline be node

   post /rest/v2/manager/node/DECOMMISSION/be
   リクエストボディ

    ```json
    {
        "hostPorts": ["127.0.0.1:9050"]
    }
    ```
レスポンス

    ```json
    {
        "msg": "success",
        "code": 0,
        "data": null,
        "count": 0
    }
    ```
## fe nodeの操作

`POST /rest/v2/manager/node/{action}/fe`

### 説明

fe nodeの追加/削除に使用されます

action：ADD/DROP

### リクエストボディ

```json
{
    "role": "FOLLOWER",
    "hostPort": "127.0.0.1:9030"
}

role FOLLOWER/OBSERVER
hostPort The address of the fe node to be operated, ip:edit_log_port
```
### Response

```json
{
    "msg": "Error",
    "code": 1,
    "data": "errCode = 2, detailMessage = frontend already exists name: 127.0.0.1:9030_1670495889415, role: FOLLOWER, 127.0.0.1:9030",
    "count": 0
}

msg Success/Error
code 0/1
data ""/Error message
```
### 例

1. FOLLOWERノードの追加

   post /rest/v2/manager/node/ADD/fe
   リクエストボディ

    ```json
    {
        "role": "FOLLOWER",
        "hostPort": "127.0.0.1:9030"
    }
    ```
レスポンス

    ```json
    {
        "msg": "success",
        "code": 0,
        "data": null,
        "count": 0
    }
    ```
2. FOLLOWER ノードを削除

   post /rest/v2/manager/node/DROP/fe
   リクエストボディ

    ```json
    {
        "role": "FOLLOWER",
        "hostPort": "127.0.0.1:9030"
    }
    ```
レスポンス

    ```json
    {
        "msg": "success",
        "code": 0,
        "data": null,
        "count": 0
    }
    ```
