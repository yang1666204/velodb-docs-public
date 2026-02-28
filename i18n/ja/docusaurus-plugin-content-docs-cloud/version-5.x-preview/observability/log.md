---
{
  "title": "ログ",
  "description": "このドキュメントでは、コア観測可能性コンポーネントの1つであるLogsのストレージと分析の実践について紹介します。",
  "language": "ja"
}
---
この文書では、中核的なオブザーバビリティコンポーネントの1つであるLogsのストレージと分析プラクティスを紹介します。完全なオブザーバビリティソリューションの概要については、Overviewを参照してください。

## ステップ1：リソースを見積もる

クラスタを展開する前に、サーバーに必要なハードウェアリソースを見積もる必要があります。以下の手順に従ってください：

1. 以下の計算式でデータ書き込みのリソースを見積もります：

- `平均書き込みスループット = 日次データ増分 / 86400 s`

- `ピーク書き込みスループット = 平均書き込みスループット \* ピーク書き込みスループットと平均書き込みスループットの比率`

- `ピーク書き込みスループットに必要なCPUコア数 = ピーク書き込みスループット / シングルコアCPUの書き込みスループット`

1. 計算式によってデータストレージのリソースを見積もります：`ストレージ容量 = 日次データ増分 / データ圧縮率 * データコピー数 * データ保存期間`。

2. データクエリのリソースを見積もります。データクエリのリソースは、クエリ量と複雑さに依存します。最初はデータクエリ用にCPUリソースの50%を予約し、実際のテスト結果に応じて調整することをお勧めします。

3. 計算結果を以下のように統合します：

    1. ステップ1とステップ3で計算されたCPUコア数をBEサーバーのCPUコア数で割ると、BEサーバー数を取得できます。

    2. BEサーバー数とステップ2の計算結果に基づいて、各BEサーバーに必要なストレージ容量を見積もります。

    3. 各BEサーバーに必要なストレージ容量を4から12のデータディスクに割り当てると、単一データディスクに必要なストレージ容量を取得できます。

例えば、日次データ増分が100 TB、データ圧縮率が5、データコピー数が2、ホットデータの保存期間が3日、コールドデータの保存期間が30日、ピーク書き込みスループットと平均書き込みスループットの比率が200%、シングルコアCUPの書き込みスループットが10 MB/s、データクエリ用にCPUリソースの50%を予約する場合、以下のように見積もることができます：

**compute-storage-integrated mode**
- 3台のFEサーバーが必要で、それぞれ16コアCPU、64 GBメモリ、1個の100 GB SSDディスクで構成されます。
- 30台のBEサーバーが必要で、それぞれ32コアCPU、256 GBメモリ、8個の625 GB SSDディスクで構成されます。
- S3オブジェクトストレージ容量540 TB

**compute-storage-decoupled mode**
- 3台のFEサーバーが必要で、それぞれ16コアCPU、64 GBメモリ、1個の100 GB SSDディスクで構成されます。
- 15台のBEサーバーが必要で、それぞれ32コアCPU、256 GBメモリ、8個の680 GB SSDディスクで構成されます。
- S3オブジェクトストレージ容量600 TB

ストレージ・コンピュート分離モードを使用すると、書き込み操作とホットデータストレージは1つのレプリカのみを必要とし、コストを大幅に削減できます。

以下の表を参照して、上記の例における指標の値とその計算方法を学習してください。

| 指標（単位） | compute-storage-decoupled | compute-storage-integrated | 説明 |
| --- | :---- | --- | --- |
| 日次データ増分（TB） | 100 | 100 | 実際のニーズに応じて値を指定してください。 |
| データ圧縮率 | 5   | 5 | 実際のニーズに応じて値を指定してください。通常は3から10の間です。データにはインデックスデータが含まれることに注意してください。 |
| データコピー数 | 1   | 2 | 実際のニーズに応じて値を指定してください。1、2、または3にできます。デフォルト値は1です。 |
| ホットデータの保存期間（日） | 3   | 3 | 実際のニーズに応じて値を指定してください。 |
| コールドデータの保存期間（日） | 30  | 27 | 実際のニーズに応じて値を指定してください。 |
| データ保存期間 | 30  | 30 | 計算式：`ホットデータの保存期間 + コールドデータの保存期間` |
| ホットデータの推定ストレージ容量（TB） | 60 | 120 | 計算式：`日次データ増分 / データ圧縮率 * データコピー数 * ホットデータの保存期間` |
| コールドデータの推定ストレージ容量（TB） | 600 | 540 | 計算式：`日次データ増分 / データ圧縮率 * データコピー数 * コールドデータの保存期間` |
| ピーク書き込みスループットと平均書き込みスループットの比率 | 200% | 200% | 実際のニーズに応じて値を指定してください。デフォルト値は200%です。 |
| BEサーバーのCPUコア数 | 32  | 32 | 実際のニーズに応じて値を指定してください。デフォルト値は32です。 |
| 平均書き込みスループット（MB/s） | 1214 | 2427 | 計算式：`日次データ増分 / 86400 s` |
| ピーク書き込みスループット（MB/s） | 2427 | 4855 | 計算式：`平均書き込みスループット * ピーク書き込みスループットと平均書き込みスループットの比率` |
| ピーク書き込みスループットに必要なCPUコア数 | 242.7 | 485.5 | 計算式：`ピーク書き込みスループット / シングルコアCPUの書き込みスループット` |
| データクエリ用に予約するCPUリソースの割合 | 50% | 50% | 実際のニーズに応じて値を指定してください。デフォルト値は50%です。 |
| BEサーバーの推定数 | 15.2 | 30.3 | 計算式：`ピーク書き込みスループットに必要なCPUコア数 / BEサーバーのCPUコア数 /(1 - データクエリ用に予約するCPUリソースの割合)` |
| 四捨五入したBEサーバー数 | 15  | 30 | 計算式：`MAX（データコピー数、BEサーバーの推定数）` |
| 各BEサーバーの推定データストレージ容量（TB） | 5.33 | 5.33 | 計算式：`ホットデータの推定ストレージ容量 / BEサーバーの推定数 /（1 - 30%）`。ここで30%は予約ストレージ容量の割合を表します。<br /><br />I/O能力を向上させるため、各BEサーバーに4から12のデータディスクをマウントすることをお勧めします。 |

## ステップ2：クラスタを展開する

リソースを見積もった後、クラスタを展開する必要があります。物理環境と仮想環境の両方で手動展開することをお勧めします。手動展開については、Manual Deploymentを参照してください。

## ステップ3：FEとBE構成を最適化する

クラスタ展開を完了した後、ログストレージと分析のシナリオにより適合するように、フロントエンドとバックエンドの両方の構成パラメータを個別に最適化する必要があります。

**FE構成を最適化する**

FE構成フィールドは`fe/conf/fe.conf`で見つけることができます。以下の表を参照してFE構成を最適化してください。

| 最適化対象の構成フィールド                         | 説明                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `max_running_txn_num_per_db = 10000`                         | 高並行インポートトランザクションに対応するためパラメータ値を増加させます。 |
| `streaming_label_keep_max_second = 3600` `label_keep_max_second = 7200` | メモリ使用量の多い高頻度インポートトランザクションを処理するため保持時間を増加させます。 |
| `enable_round_robin_create_tablet = true`                    | Tabletsを作成する際、均等に分散するためRound Robin戦略を使用します。 |
| `tablet_rebalancer_type = partition`                         | Tabletsのバランシング時、各パーティション内で均等に分散する戦略を使用します。 |
| `autobucket_min_buckets = 10`                                | ログ量が増加した際のバケット不足を避けるため、自動バケット化の最小バケット数を1から10に増加させます。 |
| `max_backend_heartbeat_failure_tolerance_count = 10`         | ログシナリオでは、BEサーバーが高負荷になり短時間のタイムアウトが発生する可能性があるため、許容回数を1から10に増加させます。 |

詳細については、FE Configurationを参照してください。

**BE構成を最適化する**

BE構成フィールドは`be/conf/be.conf`で見つけることができます。以下の表を参照してBE構成を最適化してください。

| モジュール      | 最適化対象の構成フィールド                         | 説明                                                  |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Storage    | `storage_root_path = /path/to/dir1;/path/to/dir2;...;/path/to/dir12` | ディスクディレクトリ上のホットデータのストレージパスを設定します。 |
| -          | `enable_file_cache = true`                                   | ファイルキャッシュを有効にします。                                         |
| -          | `file_cache_path = [{"path": "/mnt/datadisk0/file_cache", "total_size":53687091200, "query_limit": "10737418240"},{"path": "/mnt/datadisk1/file_cache", "total_size":53687091200,"query_limit": "10737418240"}]` | コールドデータのキャッシュパスと関連設定を以下の具体的な構成で設定します：<br/>`path`：キャッシュパス<br/>`total_size`：キャッシュパスの総サイズ（バイト）。53687091200バイトは50 GBに相当します<br/>`query_limit`：1つのクエリでキャッシュパスから照会できるデータの最大量（バイト）。10737418240バイトは10 GBに相当します |
| Write      | `write_buffer_size = 1073741824`                             | 書き込みバッファのファイルサイズを増加させ、小ファイルとランダムI/O操作を減らして性能を向上させます。 |
| -          | `max_tablet_version_num = 20000`                             | Table作成時のtime_series compaction戦略と連携して、より多くのバージョンが一時的に未マージのまま残ることを許可します |
| コンパクション | `max_cumu_compaction_threads = 8`                            | CPUコア数 / 4に設定します。CPU リソースの1/4を書き込み、1/4をバックグラウンドcompaction、2/1をクエリとその他の操作に使用することを示します。 |
| -          | `inverted_index_compaction_enable = true`                    | compaction中のCPU消費を削減するため、転置インデックスcompactionを有効にします。 |
| -          | `enable_segcompaction = false` `enable_ordered_data_compaction = false` | ログシナリオでは不要な2つのcompaction機能を無効にします。 |
| -          | `enable_compaction_priority_scheduling = false` | 低優先度のcompactionは単一ディスクで2つのタスクに制限されるため、compactionの速度に影響を与える可能性があります。 |
| -          | `total_permits_for_compaction_score = 200000 ` | このパラメータはメモリ制御に使用され、メモリ時系列戦略の下では、パラメータ自体がメモリを制御できます。 |
| Cache      | `disable_storage_page_cache = true` `inverted_index_searcher_cache_limit = 30%` | ログデータの量が多くキャッシュ効果が限定的であるため、データキャッシュからインデックスキャッシュに切り替えます。 |
| -          | `inverted_index_cache_stale_sweep_time_sec = 3600` `index_cache_entry_stay_time_after_lookup_s = 3600` | インデックスキャッシュを最大1時間メモリに保持します。           |
| -          | `enable_inverted_index_cache_on_cooldown = true`<br />`enable_write_index_searcher_cache = false` | インデックスアップロード中のコールドデータストレージの自動キャッシュを有効にします。 |
| -          | `tablet_schema_cache_recycle_interval = 3600` `segment_cache_capacity = 20000` | その他のキャッシュによるメモリ使用量を削減します。                         |
| -          | `inverted_index_ram_dir_enable = true` | インデックスファイルへの一時的な書き込みによるIOオーバーヘッドを削減します。 |
| Thread     | `pipeline_executor_size = 24` `doris_scanner_thread_pool_thread_num = 48` | 32コアCPUのコンピューティングスレッドとI/Oスレッドをコア数に比例して設定します。 |
| -          | `scan_thread_nice_value = 5`                                 | 書き込み性能と適時性を保証するため、クエリI/Oスレッドの優先度を下げます。 |
| Other      | `string_type_length_soft_limit_bytes = 10485760`             | 文字列型データの長さ制限を10 MBに増加させます。      |
| -          | `trash_file_expire_time_sec = 300` `path_gc_check_interval_second  = 900` `path_scan_interval_second = 900` | ゴミファイルのリサイクルを高速化します。                     |

詳細については、BE Configurationを参照してください。

## ステップ4：Tableを作成する

ログデータの書き込みとクエリの両方における特徴的な特性により、性能を向上させるためにターゲット設定でTableを設定することをお勧めします。

**データパーティション分割とバケット化を設定する**

- データパーティション分割の場合：

    - [range partitioning](../table-design/data-partitioning/manual-partitioning.md#range-partitioning)（`PARTITION BY RANGE(`ts`)`）を[dynamic partitions](../table-design/data-partitioning/dynamic-partitioning.md)（`"dynamic_partition.enable" = "true"`）で有効にし、日単位で自動管理します。

    - 最新のNログエントリの高速検索のため、DATETIME型のフィールドをソートキー（`DUPLICATE KEY(ts)`）として使用します。

- データバケット化の場合：

    - バケット数をクラスタ内の総ディスク数の約3倍に設定し、各バケットが圧縮後約5GBのデータを含むようにします。

    - 単一タブレットインポートと組み合わせた際のバッチ書き込み効率を最適化するため、Random戦略（`DISTRIBUTED BY RANDOM BUCKETS 60`）を使用します。

詳細については、[Data Partitioning](../table-design/data-partitioning/auto-partitioning)を参照してください。

**圧縮パラメータを設定する**

データ圧縮効率を向上させるため、zstd圧縮アルゴリズム（"compression" = "zstd"）を使用します。

**compactionパラメータを設定する**

compactionフィールドを以下のように設定します：

- 高スループットログ書き込みにとって重要な書き込み増幅を減らすため、time_series戦略（`"compaction_policy" = "time_series"`）を使用します。

**インデックスパラメータを設定する**

インデックスフィールドを以下のように設定します：

- 頻繁にクエリされるフィールドにインデックスを作成します（`USING INVERTED`）。

- フルテキスト検索が必要なフィールドについては、parserフィールドをunicodeとして指定します。これはほとんどの要件を満たします。フレーズクエリをサポートする必要がある場合は、support_phraseフィールドをtrueに設定し、不要な場合はfalseに設定してストレージスペースを削減します。

**ストレージパラメータを設定する**

ストレージポリシーを以下のように設定します：

- ホットデータのストレージでは、クラウドストレージを使用する場合はデータコピー数を1に設定し、物理ディスクを使用する場合はデータコピー数を少なくとも2に設定します（`"replication_num" = "2"`）。

- log_s3のストレージ場所を設定し（`CREATE RESOURCE "log_s3"`）、log_policy_3dayポリシーを設定します（`CREATE STORAGE POLICY log_policy_3day`）。ここで、データは3日後に冷却され、log_s3の指定されたストレージ場所に移動されます。以下のSQLを参照してください。

```SQL
CREATE DATABASE log_db;
USE log_db;

-- unneccessary for the compute-storage-decoupled mode
CREATE RESOURCE "log_s3"
PROPERTIES
(
    "type" = "s3",
    "s3.endpoint" = "your_endpoint_url",
    "s3.region" = "your_region",
    "s3.bucket" = "your_bucket",
    "s3.root.path" = "your_path",
    "s3.access_key" = "your_ak",
    "s3.secret_key" = "your_sk"
);

-- unneccessary for the compute-storage-decoupled mode
CREATE STORAGE POLICY log_policy_3day
PROPERTIES(
    "storage_resource" = "log_s3",
    "cooldown_ttl" = "259200"
);

CREATE TABLE log_table
(
  `ts` DATETIME,
  `host` TEXT,
  `path` TEXT,
  `message` TEXT,
  INDEX idx_host (`host`) USING INVERTED,
  INDEX idx_path (`path`) USING INVERTED,
  INDEX idx_message (`message`) USING INVERTED PROPERTIES("parser" = "unicode", "support_phrase" = "true")
)
ENGINE = OLAP
DUPLICATE KEY(`ts`)
PARTITION BY RANGE(`ts`) ()
DISTRIBUTED BY RANDOM BUCKETS 60
PROPERTIES (
  "compression" = "zstd",
  "compaction_policy" = "time_series",
  "dynamic_partition.enable" = "true",
  "dynamic_partition.create_history_partition" = "true",
  "dynamic_partition.time_unit" = "DAY",
  "dynamic_partition.start" = "-30",
  "dynamic_partition.end" = "1",
  "dynamic_partition.prefix" = "p",
  "dynamic_partition.buckets" = "60",
  "dynamic_partition.replication_num" = "2", -- unneccessary for the compute-storage-decoupled mode
  "replication_num" = "2", -- unneccessary for the compute-storage-decoupled mode
  "storage_policy" = "log_policy_3day" -- unneccessary for the compute-storage-decoupled mode
);
```
## ステップ 5: ログの収集

Table作成が完了した後、ログ収集を進めることができます。

Apache Doris は、オープンで汎用性の高い Stream HTTP APIs を提供しており、これを通じて Logstash、Filebeat、Kafka などの人気のあるログコレクターと接続して、ログ収集作業を実行できます。このセクションでは、Stream HTTP APIs を使用してこれらのログコレクターを統合する方法について説明します。

**Logstash の統合**

以下の手順に従ってください:

1. Logstash Doris 出力プラグイン をダウンロードしてインストールします。次の2つの方法のいずれかを選択できます:

   - [クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/logstash-output-doris-1.2.0.gem) してインストールします。

   - ソースコードからコンパイルし、以下のコマンドを実行してインストールします:

```markdown  
./bin/logstash-plugin install logstash-output-doris-1.2.0.gem
```
2. Logstashを設定します。以下のフィールドを指定してください：

- `logstash.yml`: Logstashのバッチ処理ログサイズとタイミングを設定し、データ書き込みパフォーマンスを向上させるために使用されます。

```Plain Text  
pipeline.batch.size: 1000000  
pipeline.batch.delay: 10000
```
- `logstash_demo.conf`: 収集するログの特定の入力パスと、Apache Dorisへの出力設定を構成するために使用されます。

```  
input {  
    file {  
    path => "/path/to/your/log"  
  }  
}  

output {  
  doris {  
    http_hosts => [ "<http://fehost1:http_port>", "<http://fehost2:http_port>", "<http://fehost3:http_port">]  
    user => "your_username"  
    password => "your_password"  
    db => "your_db"  
    table => "your_table"  
    
    # doris stream load http headers  
    headers => {  
    "format" => "json"  
    "read_json_by_line" => "true"  
    "load_to_single_tablet" => "true"  
    }  
    
    # field mapping: doris fileld name => logstash field name  
    # %{} to get a logstash field, [] for nested field such as [host][name] for host.name  
    mapping => {  
    "ts" => "%{@timestamp}"  
    "host" => "%{[host][name]}"  
    "path" => "%{[log][file][path]}"  
    "message" => "%{message}"  
    }  
    log_request => true  
    log_speed_interval => 10  
  }  
}
    ```
3. 以下のコマンドに従ってLogstashを実行し、ログを収集してApache Dorisに出力します。

```shell  
./bin/logstash -f logstash_demo.conf
```
Logstash Doris 出力プラグインの詳細については、[Logstash Doris 出力プラグイン](../ecosystem/observability/logstash.md)を参照してください。

**Filebeatの統合**

以下の手順に従ってください：

1. Apache Dorisへの出力をサポートするFilebeatのバイナリファイルを取得します。[クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/filebeat-doris-2.1.1)するか、Apache Dorisのソースコードからコンパイルできます。

2. Filebeatを設定します。収集するログの具体的な入力パスとApache Dorisへの出力設定を構成するために使用されるfilebeat_demo.ymlフィールドを指定します。

```YAML  
# input
filebeat.inputs:
- type: log
enabled: true
paths:
    - /path/to/your/log
multiline:
    type: pattern
    pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}'
    negate: true
    match: after
    skip_newline: true

processors:
- script:
    lang: javascript
    source: >
        function process(event) {
            var msg = event.Get("message");
            msg = msg.replace(/\t/g, "  ");
            event.Put("message", msg);
        }
- dissect:
    # 2024-06-08 18:26:25,481 INFO (report-thread|199) [ReportHandler.cpuReport():617] begin to handle
    tokenizer: "%{day} %{time} %{log_level} (%{thread}) [%{position}] %{content}"
    target_prefix: ""
    ignore_failure: true
    overwrite_keys: true

# queue and batch
queue.mem:
events: 1000000
flush.min_events: 100000
flush.timeout: 10s

# output
output.doris:
fenodes: [ "http://fehost1:http_port", "http://fehost2:http_port", "http://fehost3:http_port" ]
user: "your_username"
password: "your_password"
database: "your_db"
table: "your_table"
# output string format
codec_format_string: '{"ts": "%{[day]} %{[time]}", "host": "%{[agent][hostname]}", "path": "%{[log][file][path]}", "message": "%{[message]}"}'
headers:
    format: "json"
    read_json_by_line: "true"
    load_to_single_tablet: "true"
```
3. 以下のコマンドに従ってFilebeatを実行し、ログを収集してApache Dorisに出力します。

    ```shell  
    chmod +x filebeat-doris-2.1.1
    ./filebeat-doris-2.1.1 -c filebeat_demo.yml
    ```
Filebeatの詳細については、[Beats Doris 出力プラグイン](../ecosystem/observability/beats.md)を参照してください。

**Kafkaの統合**

JSON形式のログをKafkaのメッセージキューに書き込み、Kafka Routine Loadを作成し、Apache DorisがKafkaからデータを能動的に取得できるようにします。

以下の例を参照できます。ここで`property.*`はLibrdkafkaクライアント関連の設定を表しており、実際のKafkaクラスターの状況に応じて調整する必要があります。

```SQL  
CREATE ROUTINE LOAD load_log_kafka ON log_db.log_table  
COLUMNS(ts, clientip, request, status, size)  
PROPERTIES (
"max_batch_interval" = "60",
"max_batch_rows" = "20000000",
"max_batch_size" = "1073741824", 
"load_to_single_tablet" = "true",
"format" = "json"
) 
FROM KAFKA (  
"kafka_broker_list" = "host:port",  
"kafka_topic" = "log__topic_",  
"property.group.id" = "your_group_id",  
"property.security.protocol"="SASL_PLAINTEXT",  
"property.sasl.mechanism"="GSSAPI",  
"property.sasl.kerberos.service.name"="kafka",  
"property.sasl.kerberos.keytab"="/path/to/xxx.keytab",  
"property.sasl.kerberos.principal"="<xxx@yyy.com>"  
);  
<br />SHOW ROUTINE LOAD;
```
Kafkaの詳細については、[Routine Load](../data-operate/import/import-way/routine-load-manual.md)を参照してください。

**カスタマイズされたプログラムを使用したログの収集**

一般的なログコレクターとの統合に加えて、Stream Load HTTP APIを使用してApache Dorisにログデータをインポートするプログラムをカスタマイズすることもできます。次のコードを参照してください：

```shell  
curl   
--location-trusted   
-u username:password   
-H "format:json"   
-H "read_json_by_line:true"   
-H "load_to_single_tablet:true"   
-H "timeout:600"   
-T logfile.json   
http://fe_host:fe_http_port/api/log_db/log_table/_stream_load
```
カスタムプログラムを使用する際は、以下の重要なポイントに注意してください：

- HTTP認証にはBasic Authを使用し、コマンド echo -n 'username:password' | base64 を使用して計算します。

- データフォーマットをJSONとして指定するために、HTTPヘッダー "format:json" を設定します。

- 1行に1つのJSONを指定するために、HTTPヘッダー "read_json_by_line:true" を設定します。

- 小さなファイルのインポートを減らすために、一度に1つのバケットにデータをインポートするよう、HTTPヘッダー "load_to_single_tablet:true" を設定します。

- クライアント側で100MBから1GBの間のサイズのバッチを書き込むことを推奨します。Apache Dorisバージョン2.1以降では、Group Commit機能を通じてクライアント側でバッチサイズを削減する必要があります。

## ステップ6：ログのクエリと分析

**ログのクエリ**

Apache Dorisは標準SQLをサポートしているため、MySQLクライアントやJDBCを通じてクラスターに接続し、ログクエリのためのSQLを実行できます。

```Plain Text  
mysql -h fe_host -P fe_mysql_port -u your_username -Dyour_db_name
```
参考用の一般的なSQLクエリコマンド5つを以下に示します：

- 最新の10件のログエントリを表示する

```SQL  
SELECT * FROM your_table_name ORDER BY ts DESC LIMIT 10;
```
- hostが8.8.8.8である最新の10件のログエントリを照会する

```SQL  
SELECT * FROM your_table_name WHERE host = '8.8.8.8' ORDER BY ts DESC LIMIT 10;
```
- リクエストフィールドにerrorまたは404を含む最新の10件のログエントリを取得します。以下のコマンドでは、MATCH_ANYはApache Dorisがフィールド内の任意のキーワードをマッチングするために使用する全文検索SQL構文です。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ANY** 'error 404'  
ORDER BY ts DESC LIMIT 10;
```
- request フィールドに image と faq が含まれる最新の10件のログエントリを取得します。以下のコマンドで、MATCH_ALL は Apache Doris で使用される全文検索 SQL 構文で、フィールド内のすべてのキーワードにマッチするために使用されます。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ALL** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
- request フィールドに image と faq を含む最新の10件のエントリを取得します。以下のコマンドでは、MATCH_PHRASE は Apache Doris で使用される全文検索SQLシンタックスで、フィールド内のすべてのキーワードをマッチさせ、一貫した順序を要求します。以下の例では、a image faq b はマッチしますが、a faq image b は image と faq の順序がシンタックスと一致しないためマッチしません。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_PHRASE** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
**ログの視覚的分析**

一部のサードパーティベンダーは、Apache Dorisをベースとした視覚的ログ分析開発プラットフォームを提供しており、これにはKibana Discoverに類似したログ検索・分析インターフェースが含まれています。これらのプラットフォームは、直感的でユーザーフレンドリーな探索的ログ分析のインタラクションを提供します。

![WebUI-a log search and analysis interface similar to Kibana](/images/WebUI-EN.jpeg)

- 全文検索およびSQLモードのサポート

- タイムボックスとヒストグラムによるクエリログ期間の選択のサポート

- 詳細なログ情報の表示、JSONまたはTableに展開可能

- ログデータのコンテキストでフィルター条件を追加・削除するインタラクティブクリック

- 異常を発見し、さらなる詳細分析のための検索結果における上位フィールド値の表示

詳細については、dev@doris.apache.orgまでお問い合わせください。
