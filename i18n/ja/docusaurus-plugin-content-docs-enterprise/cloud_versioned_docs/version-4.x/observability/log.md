---
{
  "title": "ログ",
  "description": "この文書では、コア可観測性コンポーネントの一つであるLogsのストレージおよび分析プラクティスについて説明します。",
  "language": "ja"
}
---
# Log Storage and Analysis

この文書では、コアオブザーバビリティコンポーネントの1つであるログのストレージおよび分析プラクティスを紹介します。完全なオブザーバビリティソリューションの概要については、[Overview](overview)を参照してください。

## Step 1: リソースの見積もり

クラスターをデプロイする前に、サーバーに必要なハードウェアリソースを見積もる必要があります。以下の手順に従ってください：

1. 以下の計算式により、データ書き込みのリソースを見積もります：

- `平均書き込みスループット = 日次データ増分 / 86400 s`

- `ピーク書き込みスループット = 平均書き込みスループット \* ピーク書き込みスループットと平均書き込みスループットの比率`

- `ピーク書き込みスループット用のCPUコア数 = ピーク書き込みスループット / シングルコアCPUの書き込みスループット`

1. 以下の計算式により、データストレージのリソースを見積もります：`ストレージ容量 = 日次データ増分 / データ圧縮率 * データコピー数 * データ保存期間`。

2. データクエリのリソースを見積もります。データクエリのリソースは、クエリ量と複雑さに依存します。最初はデータクエリ用にCPUリソースの50%を予約し、実際のテスト結果に応じて調整することを推奨します。

3. 計算結果を以下のように統合します：

    1. Step 1とStep 3で計算されたCPUコア数をBEサーバーのCPUコア数で割ると、BEサーバー数が得られます。

    2. BEサーバー数とStep 2の計算結果に基づいて、各BEサーバーに必要なストレージ容量を見積もります。

    3. 各BEサーバーに必要なストレージ容量を4～12のデータディスクに配分すると、単一データディスクに必要なストレージ容量が得られます。

例えば、日次データ増分が100TB、データ圧縮率が5、データコピー数が2、ホットデータの保存期間が3日、コールドデータの保存期間が30日、ピーク書き込みスループットと平均書き込みスループットの比率が200%、シングルコアCUPの書き込みスループットが10 MB/s、データクエリ用にCPUリソースの50%を予約する場合、以下のように見積もることができます：

**compute-storage-integrated mode**
- 3台のFEサーバーが必要で、それぞれ16コアCPU、64 GBメモリ、1台の100 GB SSDディスクを構成。
- 30台のBEサーバーが必要で、それぞれ32コアCPU、256 GBメモリ、8台の625 GB SSDディスクを構成。
- S3オブジェクトストレージ容量 540 TB

**compute-storage-decoupled mode**
- 3台のFEサーバーが必要で、それぞれ16コアCPU、64 GBメモリ、1台の100 GB SSDディスクを構成。
- 15台のBEサーバーが必要で、それぞれ32コアCPU、256 GBメモリ、8台の680 GB SSDディスクを構成。
- S3オブジェクトストレージ容量 600 TB

ストレージ・コンピュート分離モードを使用すると、書き込み操作とホットデータストレージに必要なレプリカは1つだけとなり、コストを大幅に削減できます。

上記の例における指標の値とその計算方法については、以下の表を参照してください。

| 指標（単位） | compute-storage-decoupled | compute-storage-integrated | 説明 |
| --- | :---- | --- | --- |
| 日次データ増分（TB） | 100 | 100 | 実際のニーズに応じて値を指定してください。 |
| データ圧縮率 | 5   | 5 | 実際のニーズに応じて値を指定してください。通常3～10の間です。データにはインデックスデータが含まれることに注意してください。 |
| データコピー数 | 1   | 2 | 実際のニーズに応じて値を指定してください。1、2、または3を設定できます。デフォルト値は1です。 |
| ホットデータの保存期間（日） | 3   | 3 | 実際のニーズに応じて値を指定してください。 |
| コールドデータの保存期間（日） | 30  | 27 | 実際のニーズに応じて値を指定してください。 |
| データ保存期間 | 30  | 30 | 計算式：`ホットデータの保存期間 + コールドデータの保存期間` |
| ホットデータの推定ストレージ容量（TB） | 60 | 120 | 計算式：`日次データ増分 / データ圧縮率 * データコピー数 * ホットデータの保存期間` |
| コールドデータの推定ストレージ容量（TB） | 600 | 540 | 計算式：`日次データ増分 / データ圧縮率 * データコピー数 * コールドデータの保存期間` |
| ピーク書き込みスループットと平均書き込みスループットの比率 | 200% | 200% | 実際のニーズに応じて値を指定してください。デフォルト値は200%です。 |
| BEサーバーのCPUコア数 | 32  | 32 | 実際のニーズに応じて値を指定してください。デフォルト値は32です。 |
| 平均書き込みスループット（MB/s） | 1214 | 2427 | 計算式：`日次データ増分 / 86400 s` |
| ピーク書き込みスループット（MB/s） | 2427 | 4855 | 計算式：`平均書き込みスループット * ピーク書き込みスループットと平均書き込みスループットの比率` |
| ピーク書き込みスループット用のCPUコア数 | 242.7 | 485.5 | 計算式：`ピーク書き込みスループット / シングルコアCPUの書き込みスループット` |
| データクエリ用に予約するCPUリソースの割合 | 50% | 50% | 実際のニーズに応じて値を指定してください。デフォルト値は50%です。 |
| BEサーバーの推定数 | 15.2 | 30.3 | 計算式：`ピーク書き込みスループット用のCPUコア数 / BEサーバーのCPUコア数 /(1 - データクエリ用に予約するCPUリソースの割合)` |
| 四捨五入後のBEサーバー数 | 15  | 30 | 計算式：`MAX (データコピー数, BEサーバーの推定数)` |
| 各BEサーバーの推定データストレージ容量（TB） | 5.33 | 5.33 | 計算式：`ホットデータの推定ストレージ容量 / BEサーバーの推定数 /(1 - 30%)`、ここで30%は予約ストレージ容量の割合を表します。<br /><br />I/O機能を強化するため、各BEサーバーに4～12台のデータディスクをマウントすることを推奨します。 |

## Step 2: クラスターのデプロイ

リソースを見積もった後、クラスターをデプロイする必要があります。物理環境と仮想環境の両方で手動デプロイすることを推奨します。手動デプロイについては、[Manual Deployment](https://doris.apache.org/docs/3.0/install/deploy-manually/integrated-storage-compute-deploy-manually)を参照してください。

## Step 3: FEとBE設定の最適化

クラスターのデプロイが完了した後、ログストレージと分析のシナリオにより適合するよう、フロントエンドとバックエンドの構成パラメーターをそれぞれ最適化する必要があります。

**FE設定の最適化**

FE設定フィールドは`fe/conf/fe.conf`で確認できます。FE設定を最適化するには、以下の表を参照してください。

| 最適化する設定フィールド                         | 説明                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `max_running_txn_num_per_db = 10000`                         | 高並行インポートトランザクションに対応するためパラメータ値を増加します。 |
| `streaming_label_keep_max_second = 3600` `label_keep_max_second = 7200` | 高メモリ使用量を伴う高頻度インポートトランザクションを処理するため保持時間を増加します。 |
| `enable_round_robin_create_tablet = true`                    | Tabletを作成する際、Round Robin戦略を使用して均等に分散します。 |
| `tablet_rebalancer_type = partition`                         | Tabletをバランシングする際、各パーティション内で均等に分散する戦略を使用します。 |
| `autobucket_min_buckets = 10`                                | ログ量増加時のバケット不足を避けるため、自動バケット化の最小バケット数を1から10に増加します。 |
| `max_backend_heartbeat_failure_tolerance_count = 10`         | ログシナリオでは、BEサーバーが高負荷によって短時間のタイムアウトを起こす可能性があるため、許容回数を1から10に増加します。 |

詳細については、[FE Configuration](https://doris.apache.org/docs/3.0/admin-manual/config/fe-config)を参照してください。

**BE設定の最適化**

BE設定フィールドは`be/conf/be.conf`で確認できます。BE設定を最適化するには、以下の表を参照してください。

| モジュール      | 最適化する設定フィールド                         | 説明                                                  |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Storage    | `storage_root_path = /path/to/dir1;/path/to/dir2;...;/path/to/dir12` | ディスクディレクトリ上のホットデータのストレージパスを設定します。 |
| -          | `enable_file_cache = true`                                   | ファイルキャッシュを有効にします。                                         |
| -          | `file_cache_path = [{"path": "/mnt/datadisk0/file_cache", "total_size":53687091200, "query_limit": "10737418240"},{"path": "/mnt/datadisk1/file_cache", "total_size":53687091200,"query_limit": "10737418240"}]` | コールドデータのキャッシュパスと関連設定を以下の具体的な構成で設定します：<br/>`path`: キャッシュパス<br/>`total_size`: キャッシュパスの総サイズ（バイト）、53687091200バイトは50 GBに相当<br/>`query_limit`: 1回のクエリでキャッシュパスから照会できるデータの最大量（バイト）、10737418240バイトは10 GBに相当 |
| Write      | `write_buffer_size = 1073741824`                             | 書き込みバッファのファイルサイズを増加して小さなファイルとランダムI/O操作を削減し、パフォーマンスを向上させます。 |
| -          | `max_tablet_version_num = 20000`                             | テーブル作成のtime_series compaction戦略と連携して、より多くのバージョンを一時的に未マージのまま残すことを許可します |
| Compaction | `max_cumu_compaction_threads = 8`                            | CPUコア数 / 4に設定し、CPUリソースの1/4を書き込み用、1/4をバックグラウンドcompaction用、2/1をクエリとその他の操作用に使用することを示します。 |
| -          | `inverted_index_compaction_enable = true`                    | 転置インデックスcompactionを有効にしてcompaction中のCPU消費を削減します。 |
| -          | `enable_segcompaction = false` `enable_ordered_data_compaction = false` | ログシナリオには不要な2つのcompaction機能を無効にします。 |
| -          | `enable_compaction_priority_scheduling = false` | 低優先度compactionは単一ディスクで2タスクに制限されるため、compactionの速度に影響する可能性があります。 |
| -          | `total_permits_for_compaction_score = 200000 ` | このパラメータはメモリ制御に使用され、メモリtime series戦略下では、パラメータ自体がメモリを制御できます。 |
| Cache      | `disable_storage_page_cache = true` `inverted_index_searcher_cache_limit = 30%` | ログデータの量が大きくキャッシュ効果が限定的なため、データキャッシュからインデックスキャッシュに切り替えます。 |
| -          | `inverted_index_cache_stale_sweep_time_sec = 3600` `index_cache_entry_stay_time_after_lookup_s = 3600` | インデックスキャッシュを最大1時間メモリに維持します。           |
| -          | `enable_inverted_index_cache_on_cooldown = true`<br />`enable_write_index_searcher_cache = false` | インデックスアップロード中のコールドデータストレージの自動キャッシュを有効にします。 |
| -          | `tablet_schema_cache_recycle_interval = 3600` `segment_cache_capacity = 20000` | 他のキャッシュによるメモリ使用量を削減します。                         |
| -          | `inverted_index_ram_dir_enable = true` | インデックスファイルの一時的な書き込みによるIOオーバーヘッドを削減します。 |
| Thread     | `pipeline_executor_size = 24` `doris_scanner_thread_pool_thread_num = 48` | 32コアCPU用の演算スレッドとI/Oスレッドをコア数に比例して設定します。 |
| -          | `scan_thread_nice_value = 5`                                 | 書き込みパフォーマンスと適時性を確保するため、クエリI/Oスレッドの優先度を下げます。 |
| Other      | `string_type_length_soft_limit_bytes = 10485760`             | 文字列型データの長さ制限を10 MBに増加します。      |
| -          | `trash_file_expire_time_sec = 300` `path_gc_check_interval_second  = 900` `path_scan_interval_second = 900` | ゴミファイルのリサイクルを加速します。                     |

詳細については、[BE Configuration](https://doris.apache.org/docs/3.0/admin-manual/config/be-config)を参照してください。

## Step 4: テーブルの作成

ログデータの書き込みとクエリの両方の特徴が異なるため、パフォーマンスを向上させるために対象を絞った設定でテーブルを構成することを推奨します。

**データパーティショニングとバケット化の設定**

- データパーティショニングについて：

    - [レンジパーティショニング](https://doris.apache.org/docs/3.0/table-design/data-partitioning/manual-partitioning#range-partitioning)（`PARTITION BY RANGE(`ts`)`）を[動的パーティション](https://doris.apache.org/docs/3.0/table-design/data-partitioning/dynamic-partitioning)（`"dynamic_partition.enable" = "true"`）と組み合わせて有効にし、日単位で自動管理します。

    - 最新のNログエントリの取得を高速化するため、DATETIME型のフィールドをソートキー（`DUPLICATE KEY(ts)`）として使用します。

- データバケット化について：

    - バケット数をクラスター内の総ディスク数の約3倍に設定し、各バケットが圧縮後約5GBのデータを含むようにします。

    - 単一tabletインポートと組み合わせたバッチ書き込み効率を最適化するため、Random戦略（`DISTRIBUTED BY RANDOM BUCKETS 60`）を使用します。

詳細については、[Data Partitioning](https://doris.apache.org/docs/3.0/table-design/data-partitioning/auto-partitioning)を参照してください。

**圧縮パラメーターの設定**

データ圧縮効率を向上させるため、zstd圧縮アルゴリズム（"compression" = "zstd"）を使用します。

**compactionパラメーターの設定**

compactionフィールドを以下のように設定します：

- 高スループットのログ書き込みにとって重要な書き込み増幅を削減するため、time_series戦略（`"compaction_policy" = "time_series"`）を使用します。

**インデックスパラメーターの設定**

インデックスフィールドを以下のように設定します：

- 頻繁にクエリされるフィールドのインデックスを作成します（`USING INVERTED`）。

- 全文検索が必要なフィールドについては、パーサーフィールドをunicodeとして指定することで、ほとんどの要件を満たします。フレーズクエリをサポートする必要がある場合は、support_phraseフィールドをtrueに設定し、必要ない場合はfalseに設定してストレージ容量を削減します。

**ストレージパラメーターの設定**

ストレージポリシーを以下のように設定します：

- ホットデータのストレージについて、クラウドストレージを使用する場合はデータコピー数を1に設定し、物理ディスクを使用する場合はデータコピー数を少なくとも2に設定します（`"replication_num" = "2"`）。

- log_s3のストレージ場所を設定し（`CREATE RESOURCE "log_s3"`）、log_policy_3dayポリシーを設定します（`CREATE STORAGE POLICY log_policy_3day`）。データは3日後にlog_s3の指定されたストレージ場所に冷却・移動されます。以下のSQLを参照してください。

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

以下の手順に従ってください：

1. Logstash Doris Output プラグインをダウンロードしてインストールします。以下の2つの方法のいずれかを選択できます：

   - [クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/logstash-output-doris-1.2.0.gem) してインストールします。

   - ソースコードからコンパイルし、以下のコマンドを実行してインストールします：

```markdown  
./bin/logstash-plugin install logstash-output-doris-1.2.0.gem
```
2. Logstashを設定します。以下のフィールドを指定してください：

- `logstash.yml`: Logstashのバッチ処理ログサイズとタイミングを設定し、データ書き込みパフォーマンスを向上させるために使用されます。

```Plain Text  
pipeline.batch.size: 1000000  
pipeline.batch.delay: 10000
```
- `logstash_demo.conf`: 収集するログの特定の入力パスと Apache Doris への出力設定を構成するために使用されます。

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
Logstash Doris Output pluginの詳細については、[Logstash Doris Output Plugin](../../ecosystem/observability/logstash)を参照してください。

**Filebeatの統合**

以下の手順に従ってください：

1. Apache Dorisへの出力をサポートするFilebeatバイナリファイルを入手します。[クリックしてダウンロード](https://apache-doris-releases.oss-accelerate.aliyuncs.com/extension/filebeat-doris-2.1.1)するか、Apache Dorisのソースコードからコンパイルできます。

2. Filebeatを設定します。収集するログの具体的な入力パスとApache Dorisへの出力設定を構成するために使用するfilebeat_demo.ymlフィールドを指定します。

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
Filebeatの詳細については、[Beats Doris Output Plugin](../../ecosystem/observability/beats)を参照してください。

**Kafkaの統合**

JSON形式のログをKafkaのメッセージキューに書き込み、Kafka Routine Loadを作成して、Apache DorisがKafkaからデータを能動的にプルできるようにします。

以下の例を参照してください。ここで`property.*`はLibrdkafkaクライアント関連の設定を表し、実際のKafkaクラスターの状況に応じて調整する必要があります。

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
Kafkaに関する詳細については、[Routine Load](https://doris.apache.org/docs/3.0/data-operate/import/import-way/routine-load-manual)を参照してください。

**カスタムプログラムを使用したログの収集**

一般的なログコレクターとの統合に加えて、Stream Load HTTP APIを使用してログデータをApache Dorisにインポートするプログラムをカスタマイズすることもできます。以下のコードを参照してください：

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

- HTTP認証にはBasic Authを使用し、コマンド echo -n 'username:password' | base64 を使って計算します。

- データ形式をJSONとして指定するため、HTTPヘッダー "format:json" を設定します。

- 1行につき1つのJSONを指定するため、HTTPヘッダー "read_json_by_line:true" を設定します。

- 小さなファイルのインポートを減らすため、一度に1つのバケットにデータをインポートするよう、HTTPヘッダー "load_to_single_tablet:true" を設定します。

- クライアント側で100MBから1GBの間のサイズのバッチを書き込むことを推奨します。Apache Dorisバージョン2.1以降では、Group Commit機能を通じてクライアント側でバッチサイズを削減する必要があります。

## ステップ6：ログのクエリと分析

**ログのクエリ**

Apache Dorisは標準SQLをサポートしているため、MySQLクライアントまたはJDBCを通じてクラスターに接続し、ログクエリのためのSQLを実行できます。

```Plain Text  
mysql -h fe_host -P fe_mysql_port -u your_username -Dyour_db_name
```
参考用の一般的なSQLクエリコマンド5つを以下に示します：

- 最新の10件のログエントリを表示する

```SQL  
SELECT * FROM your_table_name ORDER BY ts DESC LIMIT 10;
```
- ホストが8.8.8.8である最新の10件のログエントリを照会する

```SQL  
SELECT * FROM your_table_name WHERE host = '8.8.8.8' ORDER BY ts DESC LIMIT 10;
```
- リクエストフィールドにerrorまたは404を含む最新の10件のログエントリを取得します。以下のコマンドでは、MATCH_ANYはApache Dorisがフィールド内の任意のキーワードをマッチングするために使用する全文検索SQL構文です。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ANY** 'error 404'  
ORDER BY ts DESC LIMIT 10;
```
- requestフィールドにimageとfaqを含む最新の10件のログエントリを取得します。以下のコマンドでは、MATCH_ALLはApache Dorisで使用される全文検索SQL構文であり、フィールド内のすべてのキーワードにマッチするために使用されます。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_ALL** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
- requestフィールドでimageとfaqを含む最新の10件のエントリを取得します。以下のコマンドにおいて、MATCH_PHRASEはApache Dorisで使用される全文検索SQL構文で、フィールド内の全てのキーワードをマッチングし、一貫した順序を要求します。以下の例では、a image faq bはマッチしますが、a faq image bはimageとfaqの順序が構文とマッチしないためマッチしません。

```SQL  
SELECT * FROM your_table_name WHERE message **MATCH_PHRASE** 'image faq'  
ORDER BY ts DESC LIMIT 10;
```
**ログを視覚的に分析する**

一部のサードパーティベンダーは、Apache Dorisをベースとした視覚的なログ分析開発プラットフォームを提供しており、これにはKibana Discoverに似たログ検索・分析インターフェースが含まれています。これらのプラットフォームは、直感的でユーザーフレンドリーな探索的ログ分析インタラクションを提供します。

![WebUI-a log search and analysis interface similar to Kibana](/images/cloud/getting-started/use-cases/observability/WebUI-EN.jpeg)

- 全文検索とSQLモードのサポート

- タイムボックスとヒストグラムを使用したクエリログ期間の選択サポート

- 詳細なログ情報の表示、JSONまたはテーブルに展開可能

- ログデータコンテキスト内でフィルタ条件を追加・削除するインタラクティブクリック

- 異常を発見し、さらなる分析のためのドリルダウンを行うための、検索結果における上位フィールド値の表示

詳細については、dev@doris.apache.orgまでお問い合わせください。
