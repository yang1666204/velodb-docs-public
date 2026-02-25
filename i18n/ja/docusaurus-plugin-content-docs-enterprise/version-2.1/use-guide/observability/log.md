---
{
  "title": "ログ",
  "description": "この文書では、コア観測性コンポーネントの一つであるLogsのストレージと分析の実践について紹介します。",
  "language": "ja"
}
---
この文書では、中核的な可観測性コンポーネントの一つであるLogsのストレージと分析プラクティスを紹介します。完全な可観測性ソリューションの概要については、Overviewを参照してください。

## ステップ1: リソースの見積もり

クラスターをデプロイする前に、サーバーに必要なハードウェアリソースを見積もる必要があります。以下の手順に従ってください：

1. 以下の計算式でデータ書き込み用のリソースを見積もります：

- `Average write throughput = Daily data increment / 86400 s`

- `Peak write throughput = Average write throughput \* Ratio of the peak write throughput to the average write throughput`

- `Number of CPU cores for the peak write throughput = Peak write throughput / Write throughput of a single-core CPU`

1. データストレージ用のリソースを計算式で見積もります：`Storage space = Daily data increment / Data compression ratio * Number of data copies * Data storage duration`。

2. データクエリ用のリソースを見積もります。データクエリ用のリソースは、クエリ量と複雑さに依存します。最初はCPUリソースの50%をデータクエリ用に確保し、実際のテスト結果に応じて調整することを推奨します。

3. 計算結果を以下のように統合します：

    1. ステップ1とステップ3で計算したCPUコア数をBEサーバーのCPUコア数で割ると、BEサーバー数が求められます。

    2. BEサーバー数とステップ2の計算結果に基づいて、各BEサーバーに必要なストレージ容量を見積もります。

    3. 各BEサーバーに必要なストレージ容量を4～12のデータディスクに割り当てると、単一データディスクに必要なストレージ容量が求められます。

例えば、日次データ増分が100 TB、データ圧縮率が5、データコピー数が2、ホットデータの保存期間が3日、コールドデータの保存期間が30日、ピーク書き込みスループットと平均書き込みスループットの比率が200%、シングルコアCPUの書き込みスループットが10 MB/s、データクエリ用にCPUリソースの50%を確保する場合、以下のように見積もることができます：

**compute-storage-integrated mode**
- 3台のFEサーバーが必要。それぞれ16コアCPU、64 GBメモリ、1 100 GB SSDディスク1台で構成。
- 30台のBEサーバーが必要。それぞれ32コアCPU、256 GBメモリ、625 GB SSDディスク8台で構成。
- S3オブジェクトストレージ容量540 TB

**compute-storage-decoupled mode**
- 3台のFEサーバーが必要。それぞれ16コアCPU、64 GBメモリ、1 100 GB SSDディスク1台で構成。
- 15台のBEサーバーが必要。それぞれ32コアCPU、256 GBメモリ、680 GB SSDディスク8台で構成。
- S3オブジェクトストレージ容量600 TB

ストレージ・コンピュート分離モードを使用すると、書き込み操作とホットデータストレージには1つのレプリカのみが必要となり、コストを大幅に削減できます。

上記の例における指標の値とその計算方法については、以下の表を参照してください。

| 指標（単位） | compute-storage-decoupled | compute-storage-integrated | 説明 |
| --- | :---- | --- | --- |
| Daily data increment (TB) | 100 | 100 | 実際のニーズに応じて値を指定してください。 |
| Data compression ratio | 5   | 5 | 実際のニーズに応じて値を指定してください。通常は3～10の間です。データにはインデックスデータが含まれることに注意してください。 |
| Number of data copies | 1   | 2 | 実際のニーズに応じて値を指定してください。1、2、または3を指定できます。デフォルト値は1です。 |
| Storage duration of hot data (day) | 3   | 3 | 実際のニーズに応じて値を指定してください。 |
| Storage duration of cold data (day) | 30  | 27 | 実際のニーズに応じて値を指定してください。 |
| Data storage duration | 30  | 30 | 計算式：`Storage duration of hot data + Storage duration of cold data` |
| Estimated storage space for hot data (TB) | 60 | 120 | 計算式：`Daily data increment / Data compression ratios * Number of data copies * Storage duration of hot data` |
| Estimated storage space for cold data (TB) | 600 | 540 | 計算式：`Daily data increment / Data compression ratios * Number of data copies * Storage duration of cold data` |
| Ratio of the peak write throughput to the average write throughput | 200% | 200% | 実際のニーズに応じて値を指定してください。デフォルト値は200%です。 |
| Number of CPU cores of a BE server | 32  | 32 | 実際のニーズに応じて値を指定してください。デフォルト値は32です。 |
| Average write throughput (MB/s) | 1214 | 2427 | 計算式：`Daily data increment / 86400 s` |
| Peak write throughput (MB/s) | 2427 | 4855 | 計算式：`Average write throughput * Ratio of the peak write throughput to the average write throughput` |
| Number of CPU cores for the peak write throughput | 242.7 | 485.5 | 計算式：`Peak write throughput / Write throughput of a single-core CPU` |
| Percent of CPU resources reserved for data querying | 50% | 50% | 実際のニーズに応じて値を指定してください。デフォルト値は50%です。 |
| Estimated number of BE servers | 15.2 | 30.3 | 計算式：`Number of CPU cores for the peak write throughput / Number of CPU cores of a BE server /(1 - Percent of CPU resources reserved for data querying)` |
| Rounded number of BE servers | 15  | 30 | 計算式：`MAX (Number of data copies, Estimated number of BE servers)` |
| Estimated data storage space for each BE server (TB) | 5.33 | 5.33 | 計算式：`Estimated storage space for hot data / Estimated number of BE servers /(1 - 30%)`（30%は予約ストレージ容量の割合を表します）。<br /><br />I/O能力を向上させるため、各BEサーバーに4～12のデータディスクをマウントすることを推奨します。 |

## ステップ2: クラスターのデプロイ

リソースの見積もり後、クラスターをデプロイする必要があります。物理環境と仮想環境の両方で手動デプロイを推奨します。手動デプロイについては、Manual Deploymentを参照してください。

## ステップ3: FEとBE設定の最適化

クラスターデプロイの完了後、ログストレージと分析のシナリオにより適合するよう、フロントエンドとバックエンドの設定パラメータをそれぞれ最適化する必要があります。

**FE設定の最適化**

FE設定フィールドは`fe/conf/fe.conf`にあります。FE設定を最適化するには以下の表を参照してください。

| 最適化対象の設定フィールド                         | 説明                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `max_running_txn_num_per_db = 10000`                         | 高並行性インポートトランザクションに適応するためパラメータ値を増加。 |
| `streaming_label_keep_max_second = 3600` `label_keep_max_second = 7200` | 高メモリ使用量を伴う高頻度インポートトランザクションを処理するため保持時間を増加。 |
| `enable_round_robin_create_tablet = true`                    | Tablet作成時にRound Robinストラテジーを使用して均等に分散。 |
| `tablet_rebalancer_type = partition`                         | Tabletバランシング時に各パーティション内で均等に分散するストラテジーを使用。 |
| `autobucket_min_buckets = 10`                                | 自動バケッティングのバケット最小数を1から10に増加し、ログ量増加時のバケット不足を回避。 |
| `max_backend_heartbeat_failure_tolerance_count = 10`         | ログシナリオではBEサーバーが高負荷を経験し短期的なタイムアウトが発生する可能性があるため、許容回数を1から10に増加。 |

詳細については、FE Configurationを参照してください。

**BE設定の最適化**

BE設定フィールドは`be/conf/be.conf`にあります。BE設定を最適化するには以下の表を参照してください。

| モジュール      | 最適化対象の設定フィールド                         | 説明                                                  |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Storage    | `storage_root_path = /path/to/dir1;/path/to/dir2;...;/path/to/dir12` | ディスクディレクトリ上のホットデータのストレージパスを設定。 |
| -          | `enable_file_cache = true`                                   | ファイルキャッシュを有効化。                                         |
| -          | `file_cache_path = [{"path": "/mnt/datadisk0/file_cache", "total_size":53687091200, "query_limit": "10737418240"},{"path": "/mnt/datadisk1/file_cache", "total_size":53687091200,"query_limit": "10737418240"}]` | コールドデータのキャッシュパスと関連設定を以下の具体的な設定で構成：<br/>`path`: キャッシュパス<br/>`total_size`: キャッシュパスの総サイズ（バイト単位）。53687091200バイトは50 GBに相当<br/>`query_limit`: 1つのクエリでキャッシュパスから照会できるデータの最大量（バイト単位）。10737418240バイトは10 GBに相当 |
| Write      | `write_buffer_size = 1073741824`                             | 書き込みバッファのファイルサイズを増加し、小さなファイルとランダムI/O操作を削減してパフォーマンスを向上。 |
| -          | `max_tablet_version_num = 20000`                             | テーブル作成用のtime_series compactionストラテジーと連携し、より多くのバージョンが一時的に未マージのまま残ることを許可 |
| Compaction | `max_cumu_compaction_threads = 8`                            | CPUコア数 / 4に設定。CPUリソースの1/4を書き込み用、1/4をバックグラウンドcompaction用、2/4をクエリやその他の操作用に使用することを示す。 |
| -          | `inverted_index_compaction_enable = true`                    | 転置インデックスcompactionを有効化し、compaction時のCPU消費を削減。 |
| -          | `enable_segcompaction = false` `enable_ordered_data_compaction = false` | ログシナリオに不要な2つのcompaction機能を無効化。 |
| -          | `enable_compaction_priority_scheduling = false` | 低優先度compactionは単一ディスクで2つのタスクに制限され、compactionの速度に影響する可能性があります。 |
| -          | `total_permits_for_compaction_score = 200000 ` | このパラメータはメモリ制御用です。メモリtime seriesストラテジー下では、パラメータ自体でメモリを制御できます。 |
| Cache      | `disable_storage_page_cache = true` `inverted_index_searcher_cache_limit = 30%` | ログデータの大容量と限定的なキャッシュ効果により、データキャッシュからインデックスキャッシュに切り替え。 |
| -          | `inverted_index_cache_stale_sweep_time_sec = 3600` `index_cache_entry_stay_time_after_lookup_s = 3600` | インデックスキャッシュを最大1時間メモリに保持。           |
| -          | `enable_inverted_index_cache_on_cooldown = true`<br />`enable_write_index_searcher_cache = false` | インデックスアップロード中のコールドデータストレージの自動キャッシュを有効化。 |
| -          | `tablet_schema_cache_recycle_interval = 3600` `segment_cache_capacity = 20000` | 他のキャッシュによるメモリ使用量を削減。                         |
| -          | `inverted_index_ram_dir_enable = true` | インデックスファイルへの一時的な書き込みによるIOオーバーヘッドを削減。 |
| Thread     | `pipeline_executor_size = 24` `doris_scanner_thread_pool_thread_num = 48` | 32コアCPU用のコンピューティングスレッドとI/Oスレッドをコア数に比例して設定。 |
| -          | `scan_thread_nice_value = 5`                                 | 書き込みパフォーマンスと適時性を確保するためクエリI/Oスレッドの優先度を下げる。 |
| Other      | `string_type_length_soft_limit_bytes = 10485760`             | 文字列型データの長さ制限を10 MBに増加。      |
| -          | `trash_file_expire_time_sec = 300` `path_gc_check_interval_second  = 900` `path_scan_interval_second = 900` | ゴミファイルのリサイクルを加速。                     |

詳細については、BE Configurationを参照してください。

## ステップ4: テーブルの作成

ログデータの書き込みとクエリの両方の特徴的な性質により、パフォーマンスを向上させるため、対象を絞った設定でテーブルを構成することを推奨します。

**データパーティショニングとバケッティングの設定**

- データパーティショニングについて：

    - 日次で自動管理される[動的パーティション](../table-design/data-partitioning/dynamic-partitioning.md)（`"dynamic_partition.enable" = "true"`）を使用してレンジパーティショニング（`PARTITION BY RANGE(`ts`)`）を有効化。

    - 最新のNログエントリの高速検索のため、DATETIME型のフィールドをソートキー（`DUPLICATE KEY(ts)`）として使用。

- データバケッティングについて：

    - バケット数をクラスター内の総ディスク数の約3倍に設定し、圧縮後の各バケットが約5GBのデータを含むよう構成。

    - 単一tabletインポートと組み合わせてバッチ書き込み効率を最適化するため、Randomストラテジー（`DISTRIBUTED BY RANDOM BUCKETS 60`）を使用。

詳細については、[Data Partitioning](../table-design/data-partitioning/auto-partitioning)を参照してください。

**圧縮パラメータの設定**

データ圧縮効率を向上させるためzstd圧縮アルゴリズム（"compression" = "zstd"）を使用。

**compactionパラメータの設定**

compactionフィールドを以下のように設定：

- 高スループットログ書き込みに重要な書き込み増幅を削減するため、time_seriesストラテジー（`"compaction_policy" = "time_series"`）を使用。

**インデックスパラメータの設定**

インデックスフィールドを以下のように設定：

- 頻繁にクエリされるフィールドにインデックスを作成（`USING INVERTED`）。

- 全文検索が必要なフィールドについては、パーサーフィールドをunicodeに指定（ほとんどの要件を満たします）。フレーズクエリをサポートする必要がある場合は、support_phraseフィールドをtrueに設定；不要な場合は、ストレージ容量を削減するためfalseに設定。

**ストレージパラメータの設定**

ストレージポリシーを以下のように設定：

- ホットデータのストレージについて、クラウドストレージを使用する場合はデータコピー数を1に設定；物理ディスクを使用する場合はデータコピー数を少なくとも2に設定（`"replication_num" = "2"`）。

- log_s3のストレージ場所を設定（`CREATE RESOURCE "log_s3"`）し、log_policy_3dayポリシーを設定（`CREATE STORAGE POLICY log_policy_3day`）。データは3日後に冷却され、log_s3の指定されたストレージ場所に移動されます。以下のSQLを参照してください。

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

テーブル作成が完了した後、ログ収集を進めることができます。

Apache Doris はオープンで汎用性の高い Stream HTTP APIs を提供しており、これを通じて Logstash、Filebeat、Kafka などの人気のあるログコレクターと接続してログ収集作業を実行できます。このセクションでは、Stream HTTP APIs を使用してこれらのログコレクターを統合する方法について説明します。

**Logstash の統合**

以下のステップに従ってください：

1. Logstash Doris Output plugin をダウンロードしてインストールします。以下の2つの方法のうちいずれかを選択できます：

   - [クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/logstash-output-doris-1.2.0.gem)してインストールする。

   - ソースコードからコンパイルして、以下のコマンドを実行してインストールする：

```markdown  
./bin/logstash-plugin install logstash-output-doris-1.2.0.gem
```
2. Logstashを設定します。以下のフィールドを指定してください：

- `logstash.yml`：データ書き込みパフォーマンスを向上させるため、Logstashバッチ処理ログサイズとタイミングを設定するために使用されます。

```Plain Text  
pipeline.batch.size: 1000000  
pipeline.batch.delay: 10000
```
- `logstash_demo.conf`: 収集するログの特定の入力パスとApache Dorisへの出力設定を構成するために使用されます。

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
Logstash Doris Output pluginの詳細については、Logstash Doris Output Pluginを参照してください。

**Filebeatの統合**

以下の手順に従ってください：

1. Apache Dorisへの出力をサポートするFilebeatバイナリファイルを取得します。[クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/filebeat-doris-2.1.1)するか、Apache Dorisのソースコードからコンパイルできます。

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
Beatに関する詳細情報については、Beats Doris Output Pluginを参照してください。

**Kafkaの統合**

JSON形式のログをKafkaのメッセージキューに書き込み、Kafka Routine Loadを作成して、Apache DorisがKafkaからデータを能動的に取得できるようにします。

以下の例を参照できます。ここで`property.*`はLibrdkafkaクライアント関連の設定を表しており、実際のKafkaクラスタの状況に応じて調整する必要があります。

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
Kafkaの詳細情報については、[Routine Load](../data-operate/import/import-way/routine-load-manual.md)を参照してください。

**カスタマイズされたプログラムを使用したログの収集**

一般的なログコレクターとの統合に加えて、Stream Load HTTP APIを使用してApache Dorisにログデータをインポートするプログラムをカスタマイズすることもできます。以下のコードを参照してください：

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
カスタムプログラムを使用する際は、以下の重要な点に注意してください：

- HTTP認証にはBasic Authを使用し、コマンド echo -n 'username:password' | base64 を使って計算してください。

- HTTPヘッダー "format:json" を設定して、データ形式をJSONとして指定してください。

- HTTPヘッダー "read_json_by_line:true" を設定して、1行に1つのJSONを指定してください。

- HTTPヘッダー "load_to_single_tablet:true" を設定して、小さなファイルのインポートを削減するため、一度に1つのバケットにデータをインポートしてください。

- クライアント側では、サイズが100MBから1GBの間のバッチを書き込むことを推奨します。Apache Dorisバージョン2.1以降では、Group Commit機能を通じてクライアント側でバッチサイズを削減する必要があります。

## ステップ6：ログのクエリと分析

**ログのクエリ**

Apache Dorisは標準SQLをサポートしているため、MySQLクライアントまたはJDBCを通じてクラスターに接続し、ログクエリ用のSQLを実行できます。

```Plain Text  
mysql -h fe_host -P fe_mysql_port -u your_username -Dyour_db_name
```
参考用の一般的なSQLクエリコマンド5つを以下に示します：

- 最新の10件のログエントリを表示する

```SQL  
SELECT * FROM your_table_name ORDER BY ts DESC LIMIT 10;
```
- host が 8.8.8.8 である最新の10件のログエントリを照会する

```SQL  
SELECT * FROM your_table_name WHERE host = '8.8.8.8' ORDER BY ts DESC LIMIT 10;
```
- request フィールドに error または 404 を含む最新の 10 件のログエントリを取得します。以下のコマンドでは、MATCH_ANY は Apache Doris がフィールド内の任意のキーワードをマッチングするために使用する全文検索 SQL 構文です。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ANY** 'error 404'  
ORDER BY ts DESC LIMIT 10;
```
- request フィールドに image と faq を含む最新の10件のログエントリを取得します。以下のコマンドでは、MATCH_ALL は Apache Doris で使用される全文検索 SQL 構文で、フィールド内のすべてのキーワードにマッチするために使用されます。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ALL** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
- リクエストフィールドでimageとfaqを含む最新の10件のエントリを取得します。以下のコマンドでは、MATCH_PHRASEはApache Dorisが使用するフルテキスト検索SQL構文で、フィールド内のすべてのキーワードをマッチングし、一貫した順序を要求します。下記の例では、a image faq bはマッチしますが、a faq image bはimageとfaqの順序が構文とマッチしないためマッチしません。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_PHRASE** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
**ログの視覚的分析**

一部のサードパーティベンダーは、Apache Dorisをベースとした視覚的ログ分析開発プラットフォームを提供しており、これにはKibana Discoverに類似したログ検索・分析インターフェースが含まれています。これらのプラットフォームは、直感的でユーザーフレンドリーな探索的ログ分析インタラクションを提供します。

![WebUI-a log search and analysis interface similar to Kibana](/images/WebUI-EN.jpeg)

- 全文検索とSQLモードのサポート

- タイムボックスとヒストグラムによるクエリログの時間枠選択のサポート

- 詳細なログ情報の表示、JSONまたはテーブル形式への展開可能

- ログデータコンテキストでフィルター条件を追加・削除するインタラクティブクリック

- 検索結果での上位フィールド値の表示により、異常を発見し、さらなる詳細分析を実行

詳細についてはdev@doris.apache.orgまでお問い合わせください。
