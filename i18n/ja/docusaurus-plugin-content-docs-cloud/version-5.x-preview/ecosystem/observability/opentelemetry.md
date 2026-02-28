---
{
  "title": "OpenTelemetry",
  "language": "ja"
}
---
# Doris OpenTelemetry 統合

## 概要

OpenTelemetryは、OTelとも呼ばれ、トレース、メトリクス、ログなどのテレメトリデータの計測、生成、収集、およびエクスポートを行うための、ベンダーニュートラルなオープンソースのオブザーバビリティフレームワークです。OpenTelemetryは観測可能性のための標準とプロトコルセットを定義し、観測可能性コミュニティやベンダーに広く採用され、観測可能性分野におけるデファクトスタンダードとなりつつあります。

OpenTelemetryの主要な目標は、使用するプログラミング言語、インフラストラクチャ、ランタイム環境に関係なく、アプリケーションやシステムの計測を容易にすることです。テレメトリデータのバックエンド（ストレージ）とフロントエンド（可視化）は意図的に他のツールに委ねられています。DorisはOpenTelemetryと統合されたストレージバックエンドとして、高性能、低コスト、統一された観測可能性データのストレージと分析機能を提供します。全体的なアーキテクチャは以下の通りです：

<img src="/images/observability/otel-demo-doris.png" alt="Doris OpenTelemetry 統合" />

## インストール

[OpenTelemetry公式リリースページ](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)からOpenTelemetry Collector Contribインストールパッケージをダウンロードします。例：
https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.132.2/otelcol-contrib_0.132.2_linux_amd64.tar.gz

パッケージを展開して`otelcol-contrib`実行可能ファイルを取得します。

## パラメータ設定

OpenTelemetry Collector Doris Exporterのコア設定は以下の通りです：

| 設定項目               | 説明                                                                        |
|------------------------|-----------------------------------------------------------------------------|
| `endpoint`             | `host:port`形式のDoris FE HTTPアドレス、例：`"127.0.0.1:8030"`              |
| `mysql_endpoint`       | `host:port`形式のDoris FE MySQLアドレス、例：`"127.0.0.1:9030"`             |
| `username`             | 対応するデータベースTableへの書き込み権限を持つDorisユーザー名            |
| `password`             | Dorisユーザーのパスワード                                                   |
| `database`             | 対象のDorisデータベース名                                                   |
| `table.logs`           | ログデータ用のDorisTable名（デフォルト：`otel_logs`）                     |
| `table.traces`         | トレースデータ用のDorisTable名（デフォルト：`otel_traces`）               |
| `table.metrics`        | メトリクスデータ用のDorisTable名（デフォルト：`otel_metrics`）            |
| `create_schema`        | DorisデータベースTableを自動作成するかどうか（デフォルト：`true`）         |
| `history_days`         | 自動作成Tableでの履歴データ保持日数（デフォルト：`0`、永続保持を意味する） |
| `create_history_days`  | 自動作成Tableの初期パーティション日数（デフォルト：`0`、パーティションを作成しない） |
| `label_prefix`         | Doris Stream Loadラベルプレフィックス。最終ラベルは`{label_prefix}_{db}_{table}_{yyyymmdd_hhmmss}_{uuid}`（デフォルト：`open_telemetry`） |
| `headers`              | YAML map形式のDoris Stream Load用ヘッダー                                  |
| `log_progress_interval`| スループットをログ出力する間隔（秒）（デフォルト：`10`、無効にするには`0`を設定） |

その他の設定については以下を参照してください：
https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/dorisexporter

## 使用例

## 使用例

### TEXTログ収集例

この例では、Doris FEログを使用したTEXTログ収集を示します。

**1. データ**

FEログファイルは通常、Dorisインストールディレクトリの`fe/log/fe.log`ファイルに配置されます。これらは標準的なJavaプログラムログで、タイムスタンプ、ログレベル、スレッド名、コード位置、ログ内容などのフィールドが含まれます。通常のログに加えて、スタックトレースを含む例外ログもあります。スタックトレースは複数行にわたるため、ログ収集およびストレージプロセスでは、メインログとスタックトレースを単一のログエントリに結合する必要があります。

ログの例：

```
2024-07-08 21:18:01,432 INFO (Statistics Job Appender|61) [StatisticsJobAppender.runAfterCatalogReady():70] Stats table not available, skip  
2024-07-08 21:18:53,710 WARN (STATS_FETCH-0|208) [StmtExecutor.executeInternalQuery():3332] Failed to run internal SQL: OriginStatement{originStmt='SELECT * FROM __internal_schema.column_statistics WHERE part_id is NULL  ORDER BY update_time DESC LIMIT 500000', idx=0}  
org.apache.doris.common.UserException: errCode = 2, detailMessage = tablet 10031 has no queryable replicas. err: replica 10032's backend 10008 does not exist or not alive  
        at org.apache.doris.planner.OlapScanNode.addScanRangeLocations(OlapScanNode.java:931) ~[doris-fe.jar:1.2-SNAPSHOT]  
        at org.apache.doris.planner.OlapScanNode.computeTabletInfo(OlapScanNode.java:1197) ~[doris-fe.jar:1.2-SNAPSHOT]  
```
**2. OpenTelemetry 構成**

ログ収集設定ファイル（例：`opentelemetry_java_log.yml`）は、ETLプロセスに対応する3つの主要部分で構成されています：
1. **Receivers** – 生データを読み取ります。
2. **Processors** – データを変換します。
3. **Exporters** – データを出力します。

設定例（`opentelemetry_java_log.yml`）：

```yaml
# 1. Receivers – Read raw data  
# The `filelog` receiver reads log files from the local filesystem.  
# The `multiline` configuration merges stack traces with the main log by matching timestamps.  
receivers:  
  filelog:  
    include:  
      - /path/to/fe.log  
    start_at: beginning  
    multiline:  
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}'  # Match timestamp as new log start  
    operators:  
      # Parse logs  
      - type: regex_parser  
        regex: '^(?P<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) (?P<severity>INFO|WARN|ERROR) (?P<message>.*)'  
        timestamp:  
          parse_from: attributes.time  
          layout: '%Y-%m-%d %H:%M:%S,%f'  
        severity:  
          parse_from: attributes.severity  
          trace: TRACE  
          debug: DEBUG  
          info: INFO  
          warn: WARN  
          error: ERROR  
          fatal: FATAL  

# 2. Processors – Transform data  
# The `batch` processor groups logs before sending.  
processors:  
  batch:  
    send_batch_size: 100000  # Number of logs per batch (recommended batch size: 100MB–1GB)  
    timeout: 10s  

# 3. Exporters – Output data  
# The `doris` exporter sends data to Doris using the Stream Load HTTP interface (JSON format by default).  
exporters:  
  doris:  
    endpoint: http://localhost:8030  # FE HTTP address  
    mysql_endpoint: localhost:9030   # FE MySQL address  
    database: doris_db_name  
    username: doris_username  
    password: doris_password  
    table:  
      logs: otel_logs  
    create_schema: true  # Automatically create schema (if false, tables must be created manually)  
    history_days: 10  
    create_history_days: 10  
    timezone: Asia/Shanghai  
    timeout: 60s  # HTTP Stream Load client timeout  
    log_response: true  
    sending_queue:  
      enabled: true  
      num_consumers: 20  
      queue_size: 1000  
    retry_on_failure:  
      enabled: true  
      initial_interval: 5s  
      max_interval: 30s  
    headers:  
      load_to_single_tablet: "true"  

service:  
  pipelines:  
    logs:  
      receivers: [filelog]  
      processors: [batch]  
      exporters: [doris]  
```
**3. OpenTelemetryの実行**

```bash
./otelcol-contrib --config config/opentelemetry_java_log.yml  

# When `log_response` is true, logs will display Stream Load request/response details:  
2025-08-18T00:33:22.543+0800	info	dorisexporter@v0.132.0/exporter_logs.go:181	log response:  
{  
    "TxnId": 52,  
    "Label": "open_telemetry_otel_otel_logs_20250818003321_498bb8ec-040c-4982-9eb4-452b15129782",  
    "Comment": "",  
    "TwoPhaseCommit": "false",  
    "Status": "Success",  
    "Message": "OK",  
    "NumberTotalRows": 50355,  
    "NumberLoadedRows": 50355,  
    "NumberFilteredRows": 0,  
    "NumberUnselectedRows": 0,  
    "LoadBytes": 31130235,  
    "LoadTimeMs": 680,  
    "BeginTxnTimeMs": 0,  
    "StreamLoadPutTimeMs": 3,  
    "ReadDataTimeMs": 106,  
    "WriteDataTimeMs": 653,  
    "ReceiveDataTimeMs": 11,  
    "CommitAndPublishTimeMs": 23  
}  

# Progress logs (every 10s) show throughput:  
2025-08-18T00:05:00.017+0800	info	dorisexporter@v0.132.0/progress_reporter.go:63	[LOG] total 11 MB 18978 ROWS, total speed 0 MB/s 632 R/s, last 10 seconds speed 1 MB/s 1897 R/s  
```
### JSON ログ Collection Example

この例では、GitHub Events Archiveデータを使用したJSONログ収集について説明します。

**1. Data**

GitHub Events Archiveには、JSON形式でアーカイブされたユーザーアクティビティイベントが含まれており、[https://www.gharchive.org/](https://www.gharchive.org/)からダウンロードできます。例えば、2024年1月1日15:00のデータをダウンロードするには：

```bash
wget https://data.gharchive.org/2024-01-01-15.json.gz
```
以下はサンプルエントリです（可読性のためにフォーマット済み。実際のデータは1行につき1つのJSONオブジェクトです）：

```json
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
**2. OpenTelemetry 構成**

TEXT ログ設定との主な違いは、`filelog` レシーバーの `json_parser` オペレーターで、これは各行を JSON として解析します。抽出されたフィールドは後続の処理で使用されます。

設定例（`opentelemetry_json_log.yml`）：

```yaml
receivers:
  filelog:
    include:
      - /path/to/2024-01-01-15.json
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.created_at
          layout: '%Y-%m-%dT%H:%M:%SZ'

processors:
  batch:
    send_batch_size: 100000  # Logs per batch (recommended: 100MB–1GB total size)
    timeout: 10s

exporters:
  doris:
    endpoint: http://localhost:8030  # FE HTTP address
    mysql_endpoint: localhost:9030   # FE MySQL address
    database: doris_db_name
    username: doris_username
    password: doris_password
    table:
      logs: otel_logs
    create_schema: true  # Auto-create schema (if false, manually create tables)
    history_days: 10
    create_history_days: 10
    timezone: Asia/Shanghai
    timeout: 60s  # HTTP Stream Load client timeout
    log_response: true
    sending_queue:
      enabled: true
      num_consumers: 20
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
    headers:
      load_to_single_tablet: "true"

service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [doris]
```
**3. OpenTelemetryの実行**

```bash
./otelcol-contrib --config config/opentelemetry_json_log.yml
```
### トレース Collection Example  

**1. OpenTelemetry 構成**  

以下のように設定ファイル`otel_trace.yml`を作成します：

```yaml
receivers:
  otlp:  # OTLP protocol to receive data from OpenTelemetry Java エージェント
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    send_batch_size: 100000  # Number of traces per batch (recommended batch size: 100MB–1GB)
    timeout: 10s

exporters:
  doris:
    endpoint: http://localhost:8030  # FE HTTP address
    database: doris_db_name
    username: doris_username
    password: doris_password
    table:
      traces: doris_table_name
    create_schema: true  # Auto-create schema (if false, tables must be created manually)
    mysql_endpoint: localhost:9030  # FE MySQL address
    history_days: 10
    create_history_days: 10
    timezone: Asia/Shanghai
    timeout: 60s  # HTTP Stream Load client timeout
    log_response: true
    sending_queue:
      enabled: true
      num_consumers: 20
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
    headers:
      load_to_single_tablet: "true"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [doris]
```
**2. OpenTelemetryの実行**

```bash
./otelcol-contrib --config otel_trace.yaml
```
**3. OpenTelemetry SDKとのアプリケーション統合**

ここでは、"/"エンドポイントに対して"Hello World!"を返すSpring Bootのサンプルアプリケーション（公式[demo](https://docs.spring.io/spring-boot/tutorial/first-application/index.html)から）を使用した統合方法を説明します。

1. [OpenTelemetry Java エージェント](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases)をダウンロードします。
   - 利点：既存のアプリケーションでのコード変更が不要です。
   - その他の言語/統合方法については、OpenTelemetryドキュメントを参照してください：
     - [Language APIs & SDKs](https://opentelemetry.io/docs/languages/)
     - [Zero-code Instrumentation](https://opentelemetry.io/docs/zero-code/)

2. アプリケーションを開始する前に、以下の環境変数を設定します（コードの修正は不要です）：

```bash
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS} -javaagent:/your/path/to/opentelemetry-javaagent.jar"  # Path to OpenTelemetry Java エージェント
export OTEL_JAVAAGENT_LOGGING="none"  # Disable OTEL logs to avoid interference with application logs
export OTEL_SERVICE_NAME="myproject"
export OTEL_TRACES_EXPORTER="otlp"  # Use OTLP protocol to send trace data
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"  # OpenTelemetry Collector address

java -jar myproject-0.0.1-SNAPSHOT.jar
```
