---
{
  "title": "FluentBit",
  "description": "Fluent Bitは高速なログプロセッサおよびフォワーダーであり、ストレージシステムにデータを書き込むためのカスタム出力プラグインをサポートします。",
  "language": "ja"
}
---
[Fluent Bit](https://fluentbit.io/)は、ストレージシステムにデータを書き込むためのカスタム出力プラグインをサポートする高速ログプロセッサおよびフォワーダーです。Fluent Bit Doris出力プラグインは、Dorisに出力するためのプラグインです。

Fluent Bit Doris出力プラグインは、Doris Stream Load HTTPインターフェースを呼び出すことで、リアルタイムでDorisにデータを書き込み、マルチスレッド並行処理、失敗時の再試行、カスタムStream Loadフォーマットおよびパラメータ、出力書き込み速度などの機能を提供します。

Fluent Bit Doris出力プラグインを使用するには、主に3つのステップがあります：
1. Doris出力プラグインを含むFluent Bitバイナリプログラムをダウンロードまたはコンパイルする。
2. Fluent Bitの出力アドレスおよびその他のパラメータを設定する。
3. Fluent Bitを開始してリアルタイムでDorisにデータを書き込む。

## インストール (alpha)

### ダウンロード

https://apache-doris-releases.oss-accelerate.aliyuncs.com/integrations/fluent-bit-doris-3.1.9

### ソースコードからコンパイル

https://github.com/joker-star-l/fluent-bitのdevブランチをクローンし、build/ディレクトリで以下のコマンドを実行してください

```
cmake -DFLB_RELEASE=ON ..
make
```
ビルド出力は build/bin/fluent-bit です。

## Configuration

Fluent Bit Doris output plugin の設定は以下の通りです：

Configuration | Description
--- | ---
`host` | Stream Load HTTP host
`port` | Stream Load HTTP port
`user` | Doris ユーザー名。このユーザーは対応する Doris データベースとテーブルに対するインポート権限が必要です
`password` | Doris ユーザーのパスワード
`database` | 書き込み先の Doris データベース名
`table` | 書き込み先の Doris テーブル名
`label_prefix` | Doris Stream Load Label プレフィックス。最終的に生成される Label は *{label_prefix}\_{timestamp}\_{uuid}* で、デフォルト値は fluentbit です。false に設定すると、Label は追加されません
 `time_key` | データに追加するタイムスタンプカラムの名前。デフォルト値は date です。false に設定すると、このカラムは追加されません
`header` |  Doris Stream Load headers パラメータ。複数設定可能です
`log_request` | トラブルシューティングのために Doris Stream Load リクエストとレスポンスメタデータをログに出力するかどうか。デフォルトは true です
`log_progress_interval` | ログに速度を出力する時間間隔。単位は秒で、デフォルトは 10 です。0 に設定するとこのタイプのログを無効にできます
`retry_limit` | Doris Stream Load リクエスト失敗時のリトライ回数。デフォルト値は 1 です。false に設定するとリトライ回数を制限しません
`workers` | Doris Stream Load を実行するワーカー数。デフォルト値は 2 です

## Usage Example

### TEXT Log Collection Example

この例では、Doris FE ログを例として TEXT ログ収集を実演します。

**1. Data**

FE ログファイルは通常、Doris インストールディレクトリ配下の fe/log/fe.log ファイルに配置されます。これらは典型的な Java プログラムログで、タイムスタンプ、ログレベル、スレッド名、コードの場所、ログ内容などのフィールドを含みます。通常のログだけでなく、スタックトレースを含む例外ログも含まれており、これらは複数行にわたります。ログ収集と保存では、メインログとスタックトレースを単一のログエントリに結合する必要があります。

```
2024-07-08 21:18:01,432 INFO (Statistics Job Appender|61) [StatisticsJobAppender.runAfterCatalogReady():70] Stats table not available, skip
2024-07-08 21:18:53,710 WARN (STATS_FETCH-0|208) [StmtExecutor.executeInternalQuery():3332] Failed to run internal SQL: OriginStatement{originStmt='SELECT * FROM __internal_schema.column_statistics WHERE part_id is NULL  ORDER BY update_time DESC LIMIT 500000', idx=0}
org.apache.doris.common.UserException: errCode = 2, detailMessage = tablet 10031 has no queryable replicas. err: replica 10032's backend 10008 does not exist or not alive
        at org.apache.doris.planner.OlapScanNode.addScanRangeLocations(OlapScanNode.java:931) ~[doris-fe.jar:1.2-SNAPSHOT]
        at org.apache.doris.planner.OlapScanNode.computeTabletInfo(OlapScanNode.java:1197) ~[doris-fe.jar:1.2-SNAPSHOT]
```
**2. Table Creation**

テーブル構造には、ログの作成時間、収集時間、ホスト名、ログファイルパス、ログタイプ、ログレベル、スレッド名、コードの場所、ログ内容などのフィールドが含まれます。

```
CREATE TABLE `doris_log` (
  `log_time` datetime NULL COMMENT 'log content time',
  `collect_time` datetime NULL COMMENT 'log agent collect time',
  `host` text NULL COMMENT 'hostname or ip',
  `path` text NULL COMMENT 'log file path',
  `type` text NULL COMMENT 'log type',
  `level` text NULL COMMENT 'log level',
  `thread` text NULL COMMENT 'log thread',
  `position` text NULL COMMENT 'log code position',
  `message` text NULL COMMENT 'log message',
  INDEX idx_host (`host`) USING INVERTED COMMENT '',
  INDEX idx_path (`path`) USING INVERTED COMMENT '',
  INDEX idx_type (`type`) USING INVERTED COMMENT '',
  INDEX idx_level (`level`) USING INVERTED COMMENT '',
  INDEX idx_thread (`thread`) USING INVERTED COMMENT '',
  INDEX idx_position (`position`) USING INVERTED COMMENT '',
  INDEX idx_message (`message`) USING INVERTED PROPERTIES("parser" = "unicode", "support_phrase" = "true") COMMENT ''
) ENGINE=OLAP
DUPLICATE KEY(`log_time`)
COMMENT 'OLAP'
PARTITION BY RANGE(`log_time`) ()
DISTRIBUTED BY RANDOM BUCKETS 10
PROPERTIES (
"replication_num" = "1",
"dynamic_partition.enable" = "true",
"dynamic_partition.time_unit" = "DAY",
"dynamic_partition.start" = "-7",
"dynamic_partition.end" = "1",
"dynamic_partition.prefix" = "p",
"dynamic_partition.buckets" = "10",
"dynamic_partition.create_history_partition" = "true",
"compaction_policy" = "time_series"
);
```
**3. Configuration**

Fluent Bitログ収集の設定ファイルは以下の通りです。doris_log.confはETLコンポーネントの各部分を定義するために使用され、parsers.confは異なるログパーサーを定義するために使用されます。

doris_log.conf:

```
# config for Fluent Bit service
[SERVICE]
    log_level info
    # parsers file
    parsers_file parsers.conf

# use input tail
[INPUT]
    name tail
    path /path/to/your/log
    # add log file name to the record, key is 'path'
    path_key path
    # set multiline parser
    multiline.parser multiline_java 

# parse log
[FILTER]
    match *
    name parser
    key_name log
    parser fe_log
    reserve_data true

# add host info
[FILTER]
    name sysinfo
    match *
    # add hostname to the record, key is 'host'
    hostname_key host

# output to doris
[OUTPUT]
    name doris
    match *
    host fehost
    port feport
    user your_username
    password your_password
    database your_db
    table your_table
    # add 'collect_time' to the record
    time_key collect_time
    # 'collect_time' is timestamp, change it to datatime
    header columns collect_time=from_unixtime(collect_time)
    log_request true
    log_progress_interval 10
```
parsers.conf:

```
[MULTILINE_PARSER]
    name          multiline_java
    type          regex
    flush_timeout 1000
    # Regex rules for multiline parsing
    # ---------------------------------
    #
    # configuration hints:
    #
    #  - first state always has the name: start_state
    #  - every field in the rule must be inside double quotes
    #
    # rules   |   state name   | regex pattern | next state name
    # --------|----------------|---------------|-----------------
    rule         "start_state"   "/(^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})(.*)/"  "cont"
    rule         "cont"          "/(^(?![0-9]{4}-[0-9]{2}-[0-9]{2}))(.*)/"     "cont"


[PARSER]
    name        fe_log
    format      regex
    # parse and add 'log_time', 'level', 'thread', 'position', 'message' to the record
    regex       ^(?<log_time>[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3}) (?<level>[^ ]+) \((?<thread>[^\)]+)\) \[(?<position>[^\]]+)\] (?<message>(\n|.)*)\n$
```
**4. Fluent Bit の実行**

```
fluent-bit -c doris_log.conf

# log stream load response

[2024/10/31 18:39:55] [ info] [output:doris:doris.1] 127.0.0.1:8040, HTTP status=200
{
    "TxnId": 32155,
    "Label": "fluentbit_1730371195_91cca1aa-c15f-45d2-b503-fe7d2e839c2a",
    "Comment": "",
    "TwoPhaseCommit": "false",
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 1,
    "NumberLoadedRows": 1,
    "NumberFilteredRows": 0,
    "NumberUnselectedRows": 0,
    "LoadBytes": 836,
    "LoadTimeMs": 298,
    "BeginTxnTimeMs": 0,
    "StreamLoadPutTimeMs": 3,
    "ReadDataTimeMs": 0,
    "WriteDataTimeMs": 268,
    "CommitAndPublishTimeMs": 25
}

# log speed info

[2024/10/31 18:40:13] [ info] [output:doris:doris.1] total 0 MB 2 ROWS, total speed 0 MB/s 0 R/s, last 10 seconds speed 0 MB/s 0 R/s
```
### JSON Log Collection Example

この例では、GitHub events archiveのデータを使用したJSONログ収集について説明します。

**1. Data**

GitHub events archiveには、GitHubユーザーアクションのアーカイブデータがJSON形式で格納されています。データは[こちら](https://data.gharchive.org/)からダウンロードできます。例えば、2024年1月1日午後3時のデータなどです。

```shell
wget https://data.gharchive.org/2024-01-01-15.json.gz
```
以下はデータのサンプルです。通常、各データは1行に記述されますが、表示しやすくするため、ここでは整形されています。

```
{
  "id": "37066529221",
  "type": "PushEvent",
  "actor": {
    "id": 46139131,
    "login": "Bard89",
    "display_login": "Bard89",
    "gravatar_id": "",
    "url": "https://api.github.com/users/Bard89",
    "avatar_url": "https://avatars.githubusercontent.com/u/46139131?"
  },
  "repo": {
    "id": 780125623,
    "name": "Bard89/talk-to-me",
    "url": "https://api.github.com/repos/Bard89/talk-to-me"
  },
  "payload": {
    "repository_id": 780125623,
    "push_id": 17799451992,
    "size": 1,
    "distinct_size": 1,
    "ref": "refs/heads/add_mvcs",
    "head": "f03baa2de66f88f5f1754ce3fa30972667f87e81",
    "before": "85e6544ede4ae3f132fe2f5f1ce0ce35a3169d21"
  },
  "public": true,
  "created_at": "2024-04-01T23:00:00Z"
}
```
**2. テーブル作成**

```
CREATE DATABASE log_db;
USE log_db;


CREATE TABLE github_events
(
  `created_at` DATETIME,
  `id` BIGINT,
  `type` TEXT,
  `public` BOOLEAN,
  `actor` VARIANT,
  `repo` VARIANT,
  `payload` TEXT,
  INDEX `idx_id` (`id`) USING INVERTED,
  INDEX `idx_type` (`type`) USING INVERTED,
  INDEX `idx_actor` (`actor`) USING INVERTED,
  INDEX `idx_host` (`repo`) USING INVERTED,
  INDEX `idx_payload` (`payload`) USING INVERTED PROPERTIES("parser" = "unicode", "support_phrase" = "true")
)
ENGINE = OLAP
DUPLICATE KEY(`created_at`)
PARTITION BY RANGE(`created_at`) ()
DISTRIBUTED BY RANDOM BUCKETS 10
PROPERTIES (
"replication_num" = "1",
"compaction_policy" = "time_series",
"enable_single_replica_compaction" = "true",
"dynamic_partition.enable" = "true",
"dynamic_partition.create_history_partition" = "true",
"dynamic_partition.time_unit" = "DAY",
"dynamic_partition.start" = "-30",
"dynamic_partition.end" = "1",
"dynamic_partition.prefix" = "p",
"dynamic_partition.buckets" = "10",
"dynamic_partition.replication_num" = "1"
);
```
**3. Configuration**

以前のTEXTログ収集とは対照的に、この設定では追加の処理変換が不要なためFILTERを使用しません。

github_events.conf:

```
[SERVICE]
    log_level info
    parsers_file github_parsers.conf

[INPUT]
    name tail
    parser github
    path /path/to/your/log

[OUTPUT]
    name doris
    match *
    host fehost
    port feport
    user your_username
    password your_password
    database your_db
    table your_table
    time_key false
    log_request true
    log_progress_interval 10
```
github_parsers.conf:

```
[PARSER]
    name github
    format json
```
**4. Fluent Bitの実行**

```
fluent-bit -c github_events.conf
```
