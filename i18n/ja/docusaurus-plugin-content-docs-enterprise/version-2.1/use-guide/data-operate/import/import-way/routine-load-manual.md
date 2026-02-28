---
{
  "title": "ルーチンロード",
  "description": "DorisはRoutine Load方式を通じてKafka Topicからデータを継続的に取得できます。Routine Loadジョブを投入した後、",
  "language": "ja"
}
---
DorisはRoutine Load方式を通じてKafka Topicからデータを継続的に消費できます。Routine Loadジョブを送信後、Dorisはロードジョブを継続的に実行し、リアルタイムロードタスクを生成してKafkaクラスター内の指定されたTopicからメッセージを常時消費します。

Routine Loadはストリーミングロードジョブで、Exactly-Onceセマンティクスをサポートし、データの損失や重複がないことを保証します。

## 使用シナリオ

### サポートされるデータソース

Routine LoadはKafkaクラスターからのデータ消費をサポートします。

### サポートされるデータファイル形式

Routine LoadはCSVおよびJSON形式のデータ消費をサポートします。

CSV形式をロードする際は、null値と空文字列を明確に区別する必要があります：

- Null値は`\n`で表現する必要があります。例えば、`a,\n,b`は中間の列がnull値であることを示します。

- 空文字列はデータフィールドを空のままにすることで表現できます。例えば、`a,,b`は中間の列が空文字列であることを示します。

### 使用上の制限

Routine Loadを使用してKafkaからデータを消費する場合、以下の制限があります：

- サポートされるメッセージ形式はCSVおよびJSONテキスト形式です。CSVの各メッセージは別々の行にあり、行は改行文字で終わらないようにしてください。

- デフォルトでは、Kafkaバージョン0.10.0.0以上をサポートします。0.10.0.0未満のKafkaバージョン（0.9.0、0.8.2、0.8.1、0.8.0など）を使用する必要がある場合は、`kafka_broker_version_fallback`の値を互換性のある古いバージョンに設定してBE設定を変更するか、Routine Load作成時に`property.broker.version.fallback`の値を直接設定する必要があります。ただし、古いバージョンの使用は、時間に基づくKafkaパーティションのオフセット設定などのRoutine Loadの新機能の一部が利用できない可能性があります。

## 基本原理

Routine LoadはKafka Topicsからデータを継続的に消費し、Dorisに書き込みます。

DorisでRoutine Loadジョブが作成されると、複数のインポートタスクで構成される常駐インポートジョブが生成されます：

- Load Job：Routine Load Jobはデータソースからデータを継続的に消費する常駐インポートジョブです。

- Load Task：インポートジョブは実際の消費のために複数のインポートタスクに分割され、各タスクは独立したトランザクションです。

Routine Loadの具体的なインポートプロセスを以下の図に示します：

![Routine Load](/images/routine-load.png)

1. ClientはFEにRoutine Loadジョブ作成リクエストを送信し、FEはRoutine Load Managerを通じて常駐インポートジョブ（Routine Load Job）を生成します。

2. FEはJob Schedulerを通じてRoutine Load Jobを複数のRoutine Load Taskに分割し、Task Schedulerによってスケジュールされ、BEノードに配布されます。

3. BE上でRoutine Load Taskが完了すると、FEにトランザクションを送信し、Jobのメタデータを更新します。

4. Routine Load Taskが送信された後、新しいTaskの生成またはタイムアウトしたTaskの再試行を続行します。

5. 新しく生成されたRoutine Load TasksはTask Schedulerによって継続的なサイクルでスケジュールされ続けます。

### Auto Resume

ジョブの高可用性を確保するため、自動再開メカニズムが導入されています。予期しない一時停止が発生した場合、Routine Load Schedulerスレッドはジョブの自動再開を試行します。予期しないKafka障害やシステムが機能しない他のシナリオでは、自動再開メカニズムによりKafkaが復旧すると、手動介入なしにroutine loadジョブが正常に継続実行されることが保証されます。

自動再開が発生しない状況：

- ユーザーが手動でPAUSE ROUTINE LOADコマンドを実行した場合。

- データ品質に問題がある場合。

- データベースTableが削除されるなど、再開が不可能な状況。

これらの3つの状況を除き、他の一時停止したジョブは自動的に再開を試行します。

### FAQ

自動再開はクラスターの再起動またはアップグレード中に問題が発生する可能性があります。バージョン2.1.7以前では、クラスターの再起動またはアップグレードによりタスクが一時停止した後、自動的に再開されない可能性が高くありました。バージョン2.1.7以降、そのようなイベント後にタスクが自動的に再開されない可能性は減少しています。

## クイックスタート

### ジョブの作成

Dorisでは、`CREATE ROUTINE LOAD`コマンドを使用して永続的なRoutine Loadタスクを作成できます。詳細な構文については、CREATE ROUTINE LOADを参照してください。Routine LoadはCSVおよびJSON形式のデータ消費をサポートします。

**CSVデータのロード**

1. データサンプルのロード

    Kafkaには以下のサンプルデータがあります：

    ```SQL
    kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-routine-load-csv --from-beginning
    1,Emily,25
    2,Benjamin,35
    3,Olivia,28
    4,Alexander,60
    5,Ava,17
    6,William,69
    7,Sophia,32
    8,James,64
    9,Emma,37
    10,Liam,64
    ```
2. Tableの作成

    Dorisでは、以下の構文を使用してロード用のTableを作成します：

    ```sql
    CREATE TABLE testdb.test_routineload_tbl(
        user_id            BIGINT       NOT NULL COMMENT "User ID",
        name               VARCHAR(20)           COMMENT "User Name",
        age                INT                   COMMENT "User Age"
    )
    DUPLICATE KEY(user_id)
    DISTRIBUTED BY HASH(user_id) BUCKETS 10;
    ```
3. Routine Loadジョブの作成

    Dorisでは、`CREATE ROUTINE LOAD`コマンドを使用してロードジョブを作成します：

    ```sql
    CREATE ROUTINE LOAD testdb.example_routine_load_csv ON test_routineload_tbl
    COLUMNS TERMINATED BY ",",
    COLUMNS(user_id, name, age)
    FROM KAFKA(
        "kafka_broker_list" = "192.168.88.62:9092",
        "kafka_topic" = "test-routine-load-csv",
        "property.kafka_default_offsets" = "OFFSET_BEGINNING"
    );
    ```
**JSON** **データの読み込み**

1. サンプルデータの読み込み

    Kafkaには、以下のサンプルデータがあります：

    ```sql
    kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-routine-load-json --from-beginning
    ```
2. Tableの作成

    Dorisにおいて、以下の構文を使用してロード用のTableを作成します：

    ```sql
    CREATE TABLE testdb.test_routineload_tbl(
        user_id            BIGINT       NOT NULL COMMENT "User ID",
        name               VARCHAR(20)           COMMENT "User Name",
        age                INT                   COMMENT "User Age"
    )
    DUPLICATE KEY(user_id)
    DISTRIBUTED BY HASH(user_id) BUCKETS 10;
    ```
3. Routine Loadジョブの作成

    Dorisでは、`CREATE ROUTINE LOAD`コマンドを使用してジョブを作成します：

    ```sql
    CREATE ROUTINE LOAD testdb.example_routine_load_json ON test_routineload_tbl
    COLUMNS(user_id, name, age)
    PROPERTIES(
        "format"="json",
        "jsonpaths"="[\"$.user_id\",\"$.name\",\"$.age\"]"
    )
    FROM KAFKA(
        "kafka_broker_list" = "192.168.88.62:9092"
    );
    ```
:::info Note
JSON ファイルのルートノードで JSON オブジェクトを読み込む必要がある場合、jsonpaths は `$` として指定する必要があります。例：`PROPERTIES("jsonpaths"="$.")`
:::

### ステータスの確認

Doris では、以下の方法を使用して Routine Load ジョブとタスクのステータスを確認できます：

- Load Jobs：ロードタスクに関する情報を表示するために使用されます。対象Table、サブタスク数、ロード遅延ステータス、ロード設定、およびロード結果などが含まれます。

- Load Tasks：個々のロードタスクのステータスを表示するために使用されます。タスク ID、トランザクションステータス、タスクステータス、実行開始時間、および BE（Backend）ノードの割り当てなどが含まれます。

**01 実行中のジョブの確認**

`SHOW ROUTINE LOAD` コマンドを使用してジョブのステータスを確認できます。`SHOW ROUTINE LOAD` コマンドは、対象Table、ロード遅延ステータス、ロード設定、およびエラーメッセージを含む現在のジョブに関する情報を提供します。

例えば、`testdb.example_routine_load_csv` ジョブのステータスを確認するには、以下のコマンドを実行します：

```sql
mysql> SHOW ROUTINE LOAD FOR testdb.example_routine_load\G
*************************** 1. row ***************************
                  Id: 12025
                Name: example_routine_load
          CreateTime: 2024-01-15 08:12:42
           PauseTime: NULL
             EndTime: NULL
              DbName: default_cluster:testdb
           TableName: test_routineload_tbl
        IsMultiTable: false
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"max_batch_rows":"200000","timezone":"America/New_York","send_batch_parallelism":"1","load_to_single_tablet":"false","column_separator":"','","line_delimiter":"\n","current_concurrent_number":"1","delete":"*","partial_columns":"false","merge_type":"APPEND","exec_mem_limit":"2147483648","strict_mode":"false","jsonpaths":"","max_batch_interval":"10","max_batch_size":"104857600","fuzzy_parse":"false","partitions":"*","columnToColumnExpr":"user_id,name,age","whereExpr":"*","desired_concurrent_number":"5","precedingFilter":"*","format":"csv","max_error_number":"0","max_filter_ratio":"1.0","json_root":"","strip_outer_array":"false","num_as_string":"false"}
DataSourceProperties: {"topic":"test-topic","currentKafkaPartitions":"0","brokerList":"192.168.88.62:9092"}
    CustomProperties: {"kafka_default_offsets":"OFFSET_BEGINNING","group.id":"example_routine_load_73daf600-884e-46c0-a02b-4e49fdf3b4dc"}
           Statistic: {"receivedBytes":28,"runningTxns":[],"errorRows":0,"committedTaskNum":3,"loadedRows":3,"loadRowsRate":0,"abortedTaskNum":0,"errorRowsAfterResumed":0,"totalRows":3,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":30069}
            Progress: {"0":"2"}
                 Lag: {"0":0}
ReasonOfStateChanged:
        ErrorLogUrls:
            OtherMsg:
                User: root
             Comment:
1 row in set (0.00 sec)
```
**02 実行中タスクの確認**

`SHOW ROUTINE LOAD TASK`コマンドを使用して、ロードタスクのステータスを確認できます。`SHOW ROUTINE LOAD TASK`コマンドは、特定のロードジョブ配下の個々のタスクに関する情報を提供します。これには、タスクID、トランザクションステータス、タスクステータス、実行開始時刻、およびBE IDが含まれます。

例えば、`example_routine_load_csv`ジョブのタスクステータスを確認するには、以下のコマンドを実行できます：

```sql
mysql> SHOW ROUTINE LOAD TASK WHERE jobname = 'example_routine_load_csv';
+-----------------------------------+-------+-----------+-------+---------------------+---------------------+---------+-------+----------------------+
| TaskId                            | TxnId | TxnStatus | JobId | CreateTime          | ExecuteStartTime    | Timeout | BeId  | DataSourceProperties |
+-----------------------------------+-------+-----------+-------+---------------------+---------------------+---------+-------+----------------------+
| 8cf47e6a68ed4da3-8f45b431db50e466 | 195   | PREPARE   | 12177 | 2024-01-15 12:20:41 | 2024-01-15 12:21:01 | 20      | 10429 | {"4":1231,"9":2603}  |
| f2d4525c54074aa2-b6478cf8daaeb393 | 196   | PREPARE   | 12177 | 2024-01-15 12:20:41 | 2024-01-15 12:21:01 | 20      | 12109 | {"1":1225,"6":1216}  |
| cb870f1553864250-975279875a25fab6 | -1    | NULL      | 12177 | 2024-01-15 12:20:52 | NULL                | 20      | -1    | {"2":7234,"7":4865}  |
| 68771fd8a1824637-90a9dac2a7a0075e | -1    | NULL      | 12177 | 2024-01-15 12:20:52 | NULL                | 20      | -1    | {"3":1769,"8":2982}  |
| 77112dfea5e54b0a-a10eab3d5b19e565 | 197   | PREPARE   | 12177 | 2024-01-15 12:21:02 | 2024-01-15 12:21:02 | 20      | 12098 | {"0":3000,"5":2622}  |
+-----------------------------------+-------+-----------+-------+---------------------+---------------------+---------+-------+----------------------+
```
### ジョブの一時停止

PAUSE ROUTINE LOADコマンドを使用してロードジョブを一時停止できます。ジョブが一時停止されると、PAUSEDステートに入りますが、ロードジョブは終了されず、RESUME ROUTINE LOADコマンドを使用して再開できます。

`testdb.example_routine_load_csv`ロードジョブを一時停止するには、次のコマンドを使用できます：

```sql
PAUSE ROUTINE LOAD FOR testdb.example_routine_load_csv;
```
### ジョブの再開

RESUME ROUTINE LOADコマンドを使用して、一時停止されたロードジョブを再開することができます。

`testdb.example_routine_load_csv`ジョブを再開するには、以下のコマンドを使用できます：

```sql
RESUME ROUTINE LOAD FOR testdb.example_routine_load_csv;
```
### ジョブの変更

作成されたローディングジョブは、ALTER ROUTINE LOADコマンドを使用して変更できます。ジョブを変更する前に、`PAUSE ROUTINE LOAD`コマンドを使用してジョブを一時停止する必要があり、変更を行った後、`RESUME ROUTINE LOAD`コマンドを使用してジョブを再開できます。

ジョブの`desired_concurrent_number`パラメータを変更し、Kafkaトピック情報を更新するには、次のコマンドを使用できます：

```sql
ALTER ROUTINE LOAD FOR testdb.example_routine_load_csv
PROPERTIES(
    "desired_concurrent_number" = "3"
)
FROM KAFKA(
    "kafka_broker_list" = "192.168.88.60:9092",
    "kafka_topic" = "test-topic"
);
```
### ジョブのキャンセル

STOP ROUTINE LOADコマンドを使用してRoutine Loadジョブを停止および削除できます。削除されると、ロードジョブは復旧できず、`SHOW ROUTINE LOAD`コマンドを使用して表示することもできません。

`testdb.example_routine_load_csv`ロードジョブを停止および削除するには、次のコマンドを使用できます：

```sql
STOP ROUTINE LOAD FOR testdb.example_routine_load_csv;
```
## リファレンスマニュアル

### Load Commands

Routine Load永続的ロードジョブを作成するための構文は以下の通りです：

```sql
CREATE ROUTINE LOAD [<db_name>.]<job_name> [ON <tbl_name>]
[merge_type]
[load_properties]
[job_properties]
FROM KAFKA [data_source_properties]
[COMMENT "<comment>"]
```
loading jobを作成するためのモジュールについて以下に説明します：

| Module                 | デスクリプション                                                  |
| ---------------------- | ------------------------------------------------------------ |
| db_name                | loading taskを作成するデータベース名を指定します。 |
| job_name               | 作成するloading jobの名前を指定します。job名は同一データベース内で一意である必要があります。 |
| tbl_name               | ロードするTable名を指定します。このパラメータは任意です。指定しない場合、動的Tableモードが使用され、KafkaデータにTable名情報が含まれている必要があります。 |
| merge_type             | データマージタイプを指定します。デフォルト値はAPPENDです。可能なmerge_typeオプションは：<ul><li>APPEND: 追記ロードモード</li><li>MERGE: マージロードモード</li><li>DELETE: 削除レコードとしてデータをロード</li></ul> |
| load_properties        | 以下を含むロードプロパティを記述します：<ul><li>column_spearator句</li><li>columns_mapping句</li><li>preceding_filter句</li><li>where_predicates句</li><li>partitions句</li><li>delete_on句</li><li>order_by句</li></ul> |
| job_properties         | Routine Loadの一般的なロードパラメータを指定します。      |
| data_source_properties | Kafkaデータソースのプロパティを記述します。               |
| comment                | loading jobの追加コメントを記述します。       |

### ロードパラメータ説明

**01 FE設定パラメータ**

| パラメータ名                          | デフォルト値 | Dynamic 構成 | FE Master Exclusive 構成 | デスクリプション                                                                                     |
|-----------------------------------------|---------------|-----------------------|----------------------------------|-------------------------------------------------------------------------------------------------|
| max_routine_load_task_concurrent_num   | 256           | Yes                   | Yes                              | Routine Loadジョブの同時実行サブタスク最大数を制限します。デフォルト値を維持することを推奨します。値を高く設定しすぎると、過度の同時実行タスクによりクラスタリソースを消費する可能性があります。 |
| max_routine_load_task_num_per_be       | 1024          | Yes                   | Yes                              | BE毎に許可されるRoutine Loadタスクの最大同時実行数。`max_routine_load_task_num_per_be`は`routine_load_thread_pool_size`より小さくする必要があります。 |
| max_routine_load_job_num                | 100           | Yes                   | Yes                              | NEED_SCHEDULED、RUNNING、PAUSEを含むRoutine Loadジョブの最大数を制限します。 |
| max_tolerable_backend_down_num          | 0             | Yes                   | Yes                              | いずれかのBEがダウンした場合、Routine Loadは自動復旧できません。特定の条件下で、DorisはPAUSEDタスクをRUNNING状態に再スケジュールできます。値0は、全BEノードが稼働中の場合のみ再スケジュールを許可することを意味します。 |
| period_of_auto_resume_min               | 5 (minutes)   | Yes                   | Yes                              | Routine Loadを自動再開する期間。 |

**02 BE設定パラメータ**

| パラメータ名                     | デフォルト値 | Dynamic 構成 | デスクリプション                                                                                                           |
|------------------------------------|---------------|-----------------------|-----------------------------------------------------------------------------------------------------------------------|
| max_consumer_num_per_group         | 3             | Yes                   | サブタスクがデータを消費するために生成できるconsumerの最大数。Kafkaデータソースの場合、1つのconsumerが1つ以上のKafkaパーティションを消費する可能性があります。タスクが6つのKafkaパーティションを消費する必要がある場合、3つのconsumerが生成され、それぞれが2つのパーティションを消費します。パーティションが2つしかない場合、2つのconsumerのみが生成され、それぞれが1つのパーティションを消費します。 |

### ロード設定パラメータ

Routine Loadジョブを作成する際、`CREATE ROUTINE LOAD`コマンドを使用して、異なるモジュールのロード設定パラメータを指定できます。

**tbl_name句**

ロードするTable名を指定します。このパラメータは任意です。

指定しない場合、動的Tableモードが使用され、Kafka内のデータにTable名情報が含まれている必要があります。現在、KafkaのValueフィールドからのTable名抽出のみがサポートされています。フォーマットは以下のようになり、JSONを例とします：`table_name|{"col1": "val1", "col2": "val2"}`。ここで`tbl_name`はTable名で、`|`はTable名とTableデータの区切り文字として使用されます。同じフォーマットがCSVデータにも適用され、例：`table_name|val1,val2,val3`。ここでの`table_name`はDoris内のTable名と一致する必要があり、そうでなければロードが失敗します。なお、動的Tableは後述のcolumn_mapping設定をサポートしません。

**merge_type句**

merge_typeモジュールはデータマージのタイプを指定します。merge_typeには3つのオプションがあります：

- APPEND：追記ロードモード。

- MERGE：マージロードモード。Unique Keyモデルにのみ適用されます。Delete Flagカラムをマークするために[DELETE ON]モジュールと組み合わせて使用する必要があります。

- DELETE：ロードされた全データが削除対象のデータです。

**load_properties句**

load_propertiesモジュールは以下の構文を使用してロードされるデータのプロパティを記述します：

```sql
[COLUMNS TERMINATED BY <column_separator>,]
[COLUMNS (<column1_name>[, <column2_name>, <column_mapping>, ...]),]
[WHERE <where_expr>,]
[PARTITION(<partition1_name>, [<partition2_name>, <partition3_name>, ...]),]
[DELETE ON <delete_expr>,]
[ORDER BY <order_by_column1>[, <order_by_column2>, <order_by_column3>, ...]]
```
各モジュールの具体的なパラメータは以下の通りです：

| サブモジュール        | パラメータ           | 説明                                                         |
| --------------------- | -------------------- | ------------------------------------------------------------ |
| COLUMNS TERMINATED BY | `<column_separator>` | 列区切り文字を指定します。デフォルトは `\t` です。例えば、区切り文字としてカンマを指定するには、`COLUMNS TERMINATED BY ","` を使用します。空の値を処理する際は、以下の点に注意してください：<ul><li>Null値は `\n` として表現する必要があります。例えば、`a,\n,b` は中央の列のnull値を表します。</li><li>空文字列（`''`）は空の値として扱われます。例えば、`a,,b` は中央の列の空文字列を表します。</li></ul>|
| COLUMNS               | `<column_name>`      | 対応する列名を指定します。例えば、ロード列を `(k1, k2, k3)` として指定するには、`COLUMNS(k1, k2, k3)` を使用します。COLUMNS句は以下の場合に省略できます：<ul><li>CSVの列がTableの列と一対一で一致する場合</li><li>JSONのキー列がTableの列と同じ名前を持つ場合</li></ul> |
|                       | `<column_mapping>`   | ロードプロセス中に、列マッピングを使用して列をフィルタリングおよび変換できます。例えば、ターゲット列がデータソース内の列に基づいて派生計算を実行する必要がある場合（例：ターゲット列k4がk3列に基づいてk3 + 1として計算される場合）、`COLUMNS(k1, k2, k3, k4 = k3 + 1)` を使用できます。詳細については、[Data Conversion](../../../data-operate/import/load-data-convert)ドキュメントを参照してください。 |
| WHERE                 | `<where_expr>`       | ロードするデータソースをフィルタリングする条件を指定します。例えば、age > 30のデータのみをロードするには、`WHERE age > 30` を使用します。 |
| PARTITION             | `<partition_name>`   | ターゲットTableのどのパーティションにロードするかを指定します。指定されていない場合、対応するパーティションに自動的にロードされます。例えば、ターゲットTableのパーティションp1とp2をロードするには、`PARTITION(p1, p2)` を使用します。 |
| DELETE ON             | `<delete_expr>`      | MERGEロードモードにおいて、delete_exprを使用してどの列を削除する必要があるかをマークします。例えば、MERGEプロセス中にage > 30の列を削除するには、`DELETE ON age > 30` を使用します。 |
| ORDER BY              | `<order_by_column>`  | Unique Keyモデルでのみ有効です。ロードされるデータ内のSequence Columnを指定して、データの順序を保証します。例えば、Unique KeyTableにロードしてcreate_timeをSequence Columnとして指定する場合、`ORDER BY create_time` を使用します。Unique KeyモデルのSequence Columnsの詳細については、[Data アップデート/Sequence Columns](../../../data-operate/update/update-of-unique-model)を参照してください。 |

**job_properties句**

job_properties句は、Routine Loadジョブを作成する際にそのプロパティを指定するために使用されます。構文は以下の通りです：

```sql
PROPERTIES ("<key1>" = "<value1>"[, "<key2>" = "<value2>" ...])
```
job_properties句の利用可能なパラメータは次のとおりです：

| パラメータ                   | 説明                                                  |
| --------------------------- | ------------------------------------------------------------ |
| desired_concurrent_number   | <ul><li>デフォルト値: 256</li><li>説明: 単一のロードサブタスク（ロードタスク）の希望する並行性を指定します。Routine Loadジョブのロードサブタスクの期待数を変更します。ロードプロセス中の実際の並行性は希望する並行性と等しくない場合があります。実際の並行性は、クラスタ内のノード数、クラスタの負荷、データソースの特性などの要因に基づいて決定されます。実際のロードサブタスク数は次の式で計算できます：</li><li>`min(topic_partition_num, desired_concurrent_number, max_routine_load_task_concurrent_num)`</li> <li>ここで：</li><li>topic_partition_num: KafkaトピックのパーティションNET
desired_concurrent_number: 設定されるパラメータ値</li><li>max_routine_load_task_concurrent_num: FEでRoutine Loadの最大タスク並列性を設定するパラメータ</li></ul> |
| max_batch_interval          | 各サブタスクの最大実行時間（秒単位）。0より大きくなければならず、デフォルト値は60秒です。max_batch_interval/max_batch_rows/max_batch_sizeが一緒になってサブタスクの実行閾値を形成します。これらのパラメータのいずれかが閾値に達すると、ロードサブタスクが終了し、新しいサブタスクが生成されます。 |
| max_batch_rows              | 各サブタスクが読み取る最大行数。200,000以上でなければなりません。デフォルト値は20,000,000です。max_batch_interval/max_batch_rows/max_batch_sizeが一緒になってサブタスクの実行閾値を形成します。これらのパラメータのいずれかが閾値に達すると、ロードサブタスクが終了し、新しいサブタスクが生成されます。 |
| max_batch_size              | 各サブタスクが読み取る最大バイト数。単位はバイトで、範囲は100MBから10GBです。デフォルト値は1Gです。max_batch_interval/max_batch_rows/max_batch_sizeが一緒になってサブタスクの実行閾値を形成します。これらのパラメータのいずれかが閾値に達すると、ロードサブタスクが終了し、新しいサブタスクが生成されます。 |
| max_error_number            | サンプリングウィンドウ内で許可されるエラー行の最大数。0以上でなければなりません。デフォルト値は0で、エラー行が許可されないことを意味します。サンプリングウィンドウは`max_batch_rows * 10`です。サンプリングウィンドウ内のエラー行数が`max_error_number`を超える場合、通常のジョブは一時停止され、SHOW ROUTINE LOADコマンドと`ErrorLogUrls`を使用してデータ品質の問題を確認するための手動介入が必要になります。WHERE条件によってフィルタされた行はエラー行としてカウントされません。 |
| strict_mode                 | 厳密モードを有効にするかどうか。デフォルト値は無効です。厳密モードは、ロードプロセス中の型変換に厳密なフィルタリングを適用します。有効にすると、型変換後にNULLになるnull以外の元データがフィルタされます。厳密モードでのフィルタリングルールは次のとおりです：<ul><li>派生列（関数によって生成される）は厳密モードの影響を受けません。</li><li>列の型を変換する必要がある場合、不正なデータ型のデータはすべてフィルタされます。データ型エラーによりフィルタされた列は、SHOW ROUTINE LOADの`ErrorLogUrls`で確認できます。</li><li>範囲制限がある列の場合、元データが正常に変換できるが宣言された範囲外にある場合、厳密モードはそれに影響しません。例えば、型がdecimal(1,0)で元データが10の場合、変換は可能ですが列に宣言された範囲内ではありません。厳密モードはこの種類のデータに影響しません。詳細については、厳密モードを参照してください。</li></ul> |
| timezone                    | ロードジョブで使用されるタイムゾーンを指定します。デフォルトはセッションのtimezoneパラメータを使用します。このパラメータは、ロードに関わるすべてのタイムゾーン関連関数の結果に影響します。 |
| format                      | ロードのデータ形式を指定します。デフォルトはCSVで、JSON形式がサポートされています。 |
| jsonpaths                   | データ形式がJSONの場合、jsonpathsを使用してネストした構造からデータを抽出するJSONパスを指定できます。これは文字列のJSON配列で、各文字列はJSONパスを表します。 |
| json_root                 | JSON形式のデータをインポートする際、json_rootを通してJSONデータのルートノードを指定できます。Dorisはルートノードから要素を抽出して解析します。デフォルトは空です。例えば、次のようにJSONルートノードを指定します：`"json_root" = "$.RECORDS"` |
| strip_outer_array         | JSON形式のデータをインポートする際、strip_outer_arrayがtrueの場合、JSONデータが配列として表現され、データ内の各要素が1行として扱われることを示します。デフォルト値はfalseです。通常、KafkaのJSONデータは最外層に角括弧`[]`を持つ配列として表現される場合があります。この場合、`"strip_outer_array" = "true"`を指定して配列モードでTopicデータを消費できます。例えば、次のデータは2行に解析されます：`[{"user_id":1,"name":"Emily","age":25},{"user_id":2,"name":"Benjamin","age":35}]` |
| send_batch_parallelism    | バッチデータ送信の並列性を設定するために使用されます。並列性の値がBE構成の`max_send_batch_parallelism_per_job`を超える場合、調整BEは`max_send_batch_parallelism_per_job`の値を使用します。 |
| load_to_single_tablet     | タスクごとに対応するパーティションの1つのタブレットのみにデータをインポートすることをサポートします。デフォルト値はfalseです。このパラメータは、ランダムバケッティングを持つOLAPTableにデータをインポートする場合にのみ設定できます。 |
| partial_columns           | 部分列更新機能を有効にするかどうかを指定します。デフォルト値はfalseです。このパラメータは、TableモデルがUniqueでMerge on Writeを使用している場合にのみ設定できます。マルチTableストリーミングではこのパラメータをサポートしていません。詳細については、[部分列更新](../../../data-operate/update/update-of-unique-model)を参照してください。 |
| max_filter_ratio          | サンプリングウィンドウ内で許可される最大フィルタ比率。0と1の間（両端含む）でなければなりません。デフォルト値は1.0で、すべてのエラー行が許容されることを示します。サンプリングウィンドウは`max_batch_rows * 10`です。サンプリングウィンドウ内のエラー行と全行の比率が`max_filter_ratio`を超える場合、routineジョブは一時停止され、データ品質の問題を確認するための手動介入が必要になります。WHERE条件によってフィルタされた行はエラー行としてカウントされません。 |
| enclose                   | 囲み文字を指定します。CSVデータフィールドに行または列の区切り文字が含まれている場合、単一バイト文字を囲み文字として指定して保護し、偶発的な切り捨てを防ぐことができます。例えば、列区切り文字が","で囲み文字が"'"の場合、データ"a,'b,c'"では"b,c"が1つのフィールドとして解析されます。 |
| escape                    | エスケープ文字を指定します。囲み文字と同じフィールド内の文字をエスケープするために使用されます。例えば、データが"a,'b,'c'"で、囲み文字が"'"で、"b,'c"を1つのフィールドとして解析したい場合、"\"などの単一バイトエスケープ文字を指定し、データを"a,'b,\'c'"に変更する必要があります。 |

これらのパラメータは、特定の要件に応じてRoutine Loadジョブの動作をカスタマイズするために使用できます。

**04 data_source_properties句**

Routine Loadジョブを作成する際、data_source_properties句を指定してKafkaデータソースのプロパティを指定できます。構文は次のとおりです：

```sql
FROM KAFKA ("<key1>" = "<value1>"[, "<key2>" = "<value2>" ...])
```
data_source_properties句の利用可能なオプションは以下の通りです:

| パラメータ         | 説明                                                  |
| ----------------- | ------------------------------------------------------------ |
| kafka_broker_list | Kafkaブローカーの接続情報を指定します。フォーマットは`<kafka_broker_ip>:<kafka_port>`です。複数のブローカーはカンマで区切ります。例えば、デフォルトポート9092でBroker Listを指定するには、以下のコマンドを使用できます: `"kafka_broker_list" = "<broker1_ip>:9092,<broker2_ip>:9092"` |
| kafka_topic       | 購読するKafkaトピックを指定します。ロードジョブは1つのKafkaトピックのみ消費できます。 |
| kafka_partitions  | 購読するKafkaパーティションを指定します。指定されない場合、デフォルトですべてのパーティションが消費されます。 |
| kafka_offsets     | Kafkaパーティションの消費開始オフセットを指定します。タイムスタンプが指定された場合、そのタイムスタンプ以上の最も近いオフセットから消費を開始します。オフセットは0以上の特定のオフセット、または以下のフォーマットを使用できます:<ul><li>OFFSET_BEGINNING: データが存在する位置から消費を開始します。</li><li>OFFSET_END: 末尾から消費を開始します。</li><li>タイムスタンプフォーマット、例: "2021-05-22 11:00:00"</li><li>指定されない場合、トピック下のすべてのパーティションで`OFFSET_END`から消費を開始します。</li><li>複数の消費開始オフセットをカンマで区切って指定できます。例: `"kafka_offsets" = "101,0,OFFSET_BEGINNING,OFFSET_END"`または`"kafka_offsets" = "2021-05-22 11:00:00,2021-05-22 11:00:00"`</li><li>タイムスタンプフォーマットとOFFSETフォーマットは混在できないことに注意してください。</li></ul> |
| property          | カスタムKafkaパラメータを指定します。これはKafka shellの"--property"パラメータと同等です。パラメータの値がファイルの場合、値の前にキーワード"FILE:"を追加する必要があります。ファイルの作成については、CREATE FILEコマンドドキュメントを参照してください。サポートされているカスタムパラメータの詳細については、librdkafkaの公式[CONFIGURATION](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)ドキュメントのクライアント側設定オプションを参照してください。例: `"property.client.id" = "12345"`, `"property.group.id" = "group_id_0"`, `"property.ssl.ca.location" = "FILE:ca.pem"` |

`data_source_properties`でKafka propertyパラメータを設定することで、セキュリティアクセスオプションを設定できます。現在、Dorisはplaintext（デフォルト）、SSL、PLAIN、Kerberosなど、様々なKafkaセキュリティプロトコルをサポートしています。

### ロードステータス

`SHOW ROUTINE LOAD`コマンドを使用してロードジョブのステータスを確認できます。コマンドの構文は以下の通りです:

```sql
SHOW [ALL] ROUTINE LOAD [FOR jobName];
```
例えば、`SHOW ROUTINE LOAD`を実行すると、以下のような結果セットが返されます：

```sql
mysql> SHOW ROUTINE LOAD FOR testdb.example_routine_load\G
*************************** 1. row ***************************
                  Id: 12025
                Name: example_routine_load
          CreateTime: 2024-01-15 08:12:42
           PauseTime: NULL
             EndTime: NULL
              DbName: default_cluster:testdb
           TableName: test_routineload_tbl
        IsMultiTable: false
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"max_batch_rows":"200000","timezone":"America/New_York","send_batch_parallelism":"1","load_to_single_tablet":"false","column_separator":"','","line_delimiter":"\n","current_concurrent_number":"1","delete":"*","partial_columns":"false","merge_type":"APPEND","exec_mem_limit":"2147483648","strict_mode":"false","jsonpaths":"","max_batch_interval":"10","max_batch_size":"104857600","fuzzy_parse":"false","partitions":"*","columnToColumnExpr":"user_id,name,age","whereExpr":"*","desired_concurrent_number":"5","precedingFilter":"*","format":"csv","max_error_number":"0","max_filter_ratio":"1.0","json_root":"","strip_outer_array":"false","num_as_string":"false"}
DataSourceProperties: {"topic":"test-topic","currentKafkaPartitions":"0","brokerList":"192.168.88.62:9092"}
    CustomProperties: {"kafka_default_offsets":"OFFSET_BEGINNING","group.id":"example_routine_load_73daf600-884e-46c0-a02b-4e49fdf3b4dc"}
           Statistic: {"receivedBytes":28,"runningTxns":[],"errorRows":0,"committedTaskNum":3,"loadedRows":3,"loadRowsRate":0,"abortedTaskNum":0,"errorRowsAfterResumed":0,"totalRows":3,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":30069}
            Progress: {"0":"2"}
                 Lag: {"0":0}
ReasonOfStateChanged:
        ErrorLogUrls:
            OtherMsg:
                User: root
             Comment:
1 row in set (0.00 sec)
```
結果セット内のカラムは以下の情報を提供します：

| Column Name          | デスクリプション                                                  |
| -------------------- | ------------------------------------------------------------ |
| Id                   | Dorisによって自動生成される、ロードジョブのID。    |
| Name                 | ロードジョブの名前。                                    |
| CreateTime           | ジョブが作成された時刻。                           |
| PauseTime            | ジョブが最後に一時停止された時刻。                       |
| EndTime              | ジョブが終了した時刻。                                 |
| DbName               | 関連するデータベースの名前。                         |
| TableName            | 関連するTableの名前。マルチTableシナリオの場合、「multi-table」として表示されます。 |
| IsMultiTbl           | マルチTableロードかどうかを示します。                  |
| State                | ジョブの実行状態。5つの値を持つことができます：<ul><li> NEED_SCHEDULE：ジョブはスケジュール待ちです。CREATE ROUTINE LOADまたはRESUME ROUTINE LOADコマンドの後、ジョブはNEED_SCHEDULE状態になります。</li><li>RUNNING：ジョブは現在実行中です。</li><li>PAUSED：ジョブは一時停止されており、RESUME ROUTINE LOADコマンドを使用して再開できます。</li><li>STOPPED：ジョブは完了しており、再開できません。</li><li>CANCELLED：ジョブはキャンセルされました。</li></ul> |
| DataSourceType       | データソースのタイプ。この例では、KAFKAです。    |
| CurrentTaskNum       | サブタスクの現在の数。                              |
| JobProperties        | ジョブ設定の詳細。                            |
| DataSourceProperties | データソース設定の詳細。                 |
| CustomProperties     | カスタム設定プロパティ。                             |
| Statistic            | ジョブの実行ステータスの統計。                      |
| Progress             | ジョブの進捗。Kafkaデータソースの場合、各パーティションで消費されたオフセットを表示します。例：`{"0":"2"}`は、パーティション0が2つのオフセットを消費したことを示します。 |
| Lag                  | ジョブのラグ。Kafkaデータソースの場合、各パーティションの消費ラグを表示します。例：`{"0":10}`は、パーティション0の消費ラグが10であることを示します。 |
| ReasonOfStateChanged | ジョブの状態変更の理由。                     |
| ErrorLogUrls         | フィルタされた低品質データを表示するURL。            |
| OtherMsg             | その他のエラーメッセージ。                                        |

## ロード例

### 最大エラー許容値の設定

1. サンプルデータをロード：

    ```sql
    1,Benjamin,18
    2,Emily,20
    3,Alexander,dirty_data
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test01 (
        id       INT             NOT NULL   COMMENT "User ID",
        name     VARCHAR(30)     NOT NULL   COMMENT "Name",
        age      INT                        COMMENT "Age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Load コマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job01 ON routine_test01
            COLUMNS TERMINATED BY ","
            PROPERTIES
            (
                "max_filter_ratio"="0.5",
                "max_error_number" = "100",
                "strict_mode" = "true"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad01",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test01;
    +------+------------+------+
    | id   | name       | age  |
    +------+------------+------+
    |    1 | Benjamin   |   18 |
    |    2 | Emily      |   20 |
    +------+------------+------+
    2 rows in set (0.01 sec)
    ```
### 指定されたOffsetからのデータ消費

1. サンプルデータを読み込む：

    ```sql
    1,Benjamin,18
    2,Emily,20
    3,Alexander,22
    4,Sophia,24
    5,William,26
    6,Charlotte,28
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test02 (
        id       INT             NOT NULL   COMMENT "User ID",
        name     VARCHAR(30)     NOT NULL   COMMENT "Name",
        age      INT                        COMMENT "Age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. ロードコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job02 ON routine_test02
            COLUMNS TERMINATED BY ","
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad02",
                "kafka_partitions" = "0",
                "kafka_offsets" = "3"
            );
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test02;
    +------+--------------+------+
    | id   | name         | age  |
    +------+--------------+------+
    |    4 | Sophia       |   24 |
    |    5 | William      |   26 |
    |    6 | Charlotte    |   28 |
    +------+--------------+------+
    3 rows in set (0.01 sec)
    ```
### Consumer Groupの group.id と client.id の指定

1. サンプルデータをロードします:

    ```sql
    1,Benjamin,18
    2,Emily,20
    3,Alexander,22
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test03 (
        id       INT             NOT NULL   COMMENT "User ID",
        name     VARCHAR(30)     NOT NULL   COMMENT "Name",
        age      INT                        COMMENT "Age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Load コマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job03 ON routine_test03
            COLUMNS TERMINATED BY ","
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad01",
                "property.group.id" = "kafka_job03",
                "property.client.id" = "kafka_client_03",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test03;
    +------+------------+------+
    | id   | name       | age  |
    +------+------------+------+
    |    1 | Benjamin   |   18 |
    |    2 | Emily      |   20 |
    |    3 | Alexander  |   22 |
    +------+------------+------+
    3 rows in set (0.01 sec)
    ```
### 負荷フィルタリング条件の設定

1. サンプルデータを読み込む：

    ```sql
    1,Benjamin,18
    2,Emily,20
    3,Alexander,22
    4,Sophia,24
    5,William,26
    6,Charlotte,28
    ```
2. Tableを作成する：

    ```sql
    CREATE TABLE demo.routine_test04 (
        id       INT             NOT NULL   COMMENT "User ID",
        name     VARCHAR(30)     NOT NULL   COMMENT "Name",
        age      INT                        COMMENT "Age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job04 ON routine_test04
            COLUMNS TERMINATED BY ",",
            WHERE id >= 3
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad04",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test04;
    +------+--------------+------+
    | id   | name         | age  |
    +------+--------------+------+
    |    4 | Sophia       |   24 |
    |    5 | William      |   26 |
    |    6 | Charlotte    |   28 |
    +------+--------------+------+
    3 rows in set (0.01 sec)
    ```
### 指定されたパーティションデータの読み込み

1. サンプルデータを読み込む：

    ```sql
    1,Benjamin,18,2024-02-04 10:00:00
    2,Emily,20,2024-02-05 11:00:00
    3,Alexander,22,2024-02-06 12:00:00
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test05 (
        id      INT            NOT NULL  COMMENT "ID",
        name    VARCHAR(30)    NOT NULL  COMMENT "Name",
        age     INT                      COMMENT "Age",
        date    DATETIME                 COMMENT "Date"
    )
    DUPLICATE KEY(`id`)
    PARTITION BY RANGE(`id`)
    (PARTITION partition_a VALUES [("0"), ("1")),
    PARTITION partition_b VALUES [("1"), ("2")),
    PARTITION partition_c VALUES [("2"), ("3")))
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Load コマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job05 ON routine_test05
            COLUMNS TERMINATED BY ",",
            PARTITION(partition_b)
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad05",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test05;
    +------+----------+------+---------------------+
    | id   | name     | age  | date                |
    +------+----------+------+---------------------+
    |    1 | Benjamin |   18 | 2024-02-04 10:00:00 |
    +------+----------+------+---------------------+
    1 rows in set (0.01 sec)
    ```
### loadの時刻設定

1. サンプルデータをloadする：

    ```sql
    1,Benjamin,18,2024-02-04 10:00:00
    2,Emily,20,2024-02-05 11:00:00
    3,Alexander,22,2024-02-06 12:00:00
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test06 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
        date    DATETIME                 COMMENT "date"
    )
    DUPLICATE KEY(id)
    DISTRIBUTED BY HASH(id) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job06 ON routine_test06
            COLUMNS TERMINATED BY ","
            PROPERTIES
            (
                "timezone" = "Asia/Shanghai"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad06",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. Load結果:

    ```sql
    mysql> select * from routine_test06;
    +------+-------------+------+---------------------+
    | id   | name        | age  | date                |
    +------+-------------+------+---------------------+
    |    1 | Benjamin    |   18 | 2024-02-04 10:00:00 |
    |    2 | Emily       |   20 | 2024-02-05 11:00:00 |
    |    3 | Alexander   |   22 | 2024-02-06 12:00:00 |
    +------+-------------+------+---------------------+
    3 rows in set (0.00 sec)
    ```
### Setting merge_type

**delete操作のmerge_typeを指定する**

1. サンプルデータを読み込む:

    ```sql
    3,Alexander,22
    5,William,26
    ```
Table data before load:

    ```sql
    mysql> SELECT * FROM routine_test07;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    3 | Alexander      |   22 |
    |    4 | Sophia         |   24 |
    |    5 | William        |   26 |
    |    6 | Charlotte      |   28 |
    +------+----------------+------+
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test07 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age"
    )
    UNIQUE KEY(id)
    DISTRIBUTED BY HASH(id) BUCKETS 1;
    ```
3. ロードコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job07 ON routine_test07
            WITH DELETE
            COLUMNS TERMINATED BY ","
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad07",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> SELECT * FROM routine_test07;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    4 | Sophia         |   24 |
    |    6 | Charlotte      |   28 |
    +------+----------------+------+
    ```
**merge操作のmerge_typeを指定する**

1. サンプルデータを読み込む：

    ```sql
    1,xiaoxiaoli,28
    2,xiaoxiaowang,30
    3,xiaoxiaoliu,32
    4,dadali,34
    5,dadawang,36
    6,dadaliu,38
    ```
ロード前のTableデータ:

    ```sql
    mysql> SELECT * FROM routine_test08;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    3 | Alexander      |   22 |
    |    4 | Sophia         |   24 |
    |    5 | William        |   26 |
    |    6 | Charlotte      |   28 |
    +------+----------------+------+
    6 rows in set (0.01 sec)
    ```
2. Tableの作成:

    ```sql
    CREATE TABLE demo.routine_test08 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age"
    )
    UNIQUE KEY(id)
    DISTRIBUTED BY HASH(id) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job08 ON routine_test08
            WITH MERGE
            COLUMNS TERMINATED BY ",",
            DELETE ON id = 2
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad08",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );   
    ```
4. ロード結果:

    ```sql
    mysql> SELECT * FROM routine_test08;
    +------+-------------+------+
    | id   | name        | age  |
    +------+-------------+------+
    |    1 | xiaoxiaoli  |   28 |
    |    3 | xiaoxiaoliu |   32 |
    |    4 | dadali      |   34 |
    |    5 | dadawang    |   36 |
    |    6 | dadaliu     |   38 |
    +------+-------------+------+
    5 rows in set (0.00 sec)
    ```
**マージするシーケンスカラムの指定**

1. サンプルデータを読み込む：

    ```sql
    1,xiaoxiaoli,28
    2,xiaoxiaowang,30
    3,xiaoxiaoliu,32
    4,dadali,34
    5,dadawang,36
    6,dadaliu,38
    ```
Tableへの読み込み前のデータ：

    ```sql
    mysql> SELECT * FROM routine_test09;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    3 | Alexander      |   22 |
    |    4 | Sophia         |   24 |
    |    5 | William        |   26 |
    |    6 | Charlotte      |   28 |
    +------+----------------+------+
    6 rows in set (0.01 sec)
    ```
2. Tableを作成する

    ```sql
    CREATE TABLE demo.routine_test08 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
    )
    UNIQUE KEY(id)
    DISTRIBUTED BY HASH(id) BUCKETS 1
    PROPERTIES (
        "function_column.sequence_col" = "age"
    );
    ```
3. Load Command

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job09 ON routine_test09
            WITH MERGE 
            COLUMNS TERMINATED BY ",",
            COLUMNS(id, name, age),
            DELETE ON id = 2,
            ORDER BY age
            PROPERTIES
            (
                "desired_concurrent_number"="1",
                "strict_mode" = "false"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad09",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );   
    ```
4. 読み込み結果:

    ```sql
    mysql> SELECT * FROM routine_test09;
    +------+-------------+------+
    | id   | name        | age  |
    +------+-------------+------+
    |    1 | xiaoxiaoli  |   28 |
    |    3 | xiaoxiaoliu |   32 |
    |    4 | dadali      |   34 |
    |    5 | dadawang    |   36 |
    |    6 | dadaliu     |   38 |
    +------+-------------+------+
    5 rows in set (0.00 sec)
    ```
### カラムマッピングと派生カラム計算を使用した読み込み

1. サンプルデータを読み込む：

    ```sql
    1,Benjamin,18
    2,Emily,20
    3,Alexander,22
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test10 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
        num     INT                      COMMENT "number"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Load コマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job10 ON routine_test10
            COLUMNS TERMINATED BY ",",
            COLUMNS(id, name, age, num=age*10)
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad10",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> SELECT * FROM routine_test10;
    +------+----------------+------+------+
    | id   | name           | age  | num  |
    +------+----------------+------+------+
    |    1 | Benjamin       |   18 |  180 |
    |    2 | Emily          |   20 |  200 |
    |    3 | Alexander      |   22 |  220 |
    +------+----------------+------+------+
    3 rows in set (0.01 sec)
    ```
### 囲まれたデータでの読み込み

1. サンプルデータを読み込む：

    ```sql
    1,"Benjamin",18
    2,"Emily",20
    3,"Alexander",22
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test11 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
        num     INT                      COMMENT "number"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job11 ON routine_test11
            COLUMNS TERMINATED BY ","
            PROPERTIES
            (
                "desired_concurrent_number"="1",
                "enclose" = "\""
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad12",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );
    ```
4. 読み込み結果:

    ```sql
    mysql> SELECT * FROM routine_test11;
    +------+----------------+------+------+
    | id   | name           | age  | num  |
    +------+----------------+------+------+
    |    1 | Benjamin       |   18 |  180 |
    |    2 | Emily          |   20 |  200 |
    |    3 | Alexander      |   22 |  220 |
    +------+----------------+------+------+
    3 rows in set (0.02 sec)
    ```
### JSON Format Load

**シンプルモードでJSON形式データを読み込む**

1. サンプルデータを読み込む：

    ```sql
    { "id" : 1, "name" : "Benjamin", "age":18 }
    { "id" : 2, "name" : "Emily", "age":20 }
    { "id" : 3, "name" : "Alexander", "age":22 }
    ```
2. Tableの作成:

    ```sql
    CREATE TABLE demo.routine_test12 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job12 ON routine_test12
            PROPERTIES
            (
                "format" = "json"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad12",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test12;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    3 | Alexander      |   22 |
    +------+----------------+------+
    3 rows in set (0.02 sec)
    ```
**match モードで複雑な JSON 形式データを読み込む**

1. サンプルデータを読み込む

    ```sql
    { "name" : "Benjamin", "id" : 1, "num":180 , "age":18 }
    { "name" : "Emily", "id" : 2, "num":200 , "age":20 }
    { "name" : "Alexander", "id" : 3, "num":220 , "age":22 }
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test13 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
        num     INT                      COMMENT "num"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job13 ON routine_test13
            COLUMNS(name, id, num, age)
            PROPERTIES
            (
                "format" = "json",
                "jsonpaths" = "[\"$.name\",\"$.id\",\"$.num\",\"$.age\"]"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad13",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test13;
    +------+----------------+------+------+
    | id   | name           | age  | num  |
    +------+----------------+------+------+
    |    1 | Benjamin       |   18 |  180 |
    |    2 | Emily          |   20 |  200 |
    |    3 | Alexander      |   22 |  220 |
    +------+----------------+------+------+
    3 rows in set (0.01 sec)
    ```
**指定されたJSONルートノードでデータを読み込む**

1. サンプルデータを読み込む

    ```sql
    {"id": 1231, "source" :{ "id" : 1, "name" : "Benjamin", "age":18 }}
    {"id": 1232, "source" :{ "id" : 2, "name" : "Emily", "age":20 }}
    {"id": 1233, "source" :{ "id" : 3, "name" : "Alexander", "age":22 }}
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test14 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job14 ON routine_test14
            PROPERTIES
            (
                "format" = "json",
                "json_root" = "$.source"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad14",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 結果の読み込み

    ```sql
    mysql> select * from routine_test14;
    +------+----------------+------+
    | id   | name           | age  |
    +------+----------------+------+
    |    1 | Benjamin       |   18 |
    |    2 | Emily          |   20 |
    |    3 | Alexander      |   22 |
    +------+----------------+------+
    3 rows in set (0.01 sec)
    ```
**列マッピングと派生列計算を使用したデータの読み込み**

1. サンプルデータを読み込む：

    ```sql
    { "id" : 1, "name" : "Benjamin", "age":18 }
    { "id" : 2, "name" : "Emily", "age":20 }
    { "id" : 3, "name" : "Alexander", "age":22 }
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test15 (
        id      INT            NOT NULL  COMMENT "id",
        name    VARCHAR(30)    NOT NULL  COMMENT "name",
        age     INT                      COMMENT "age",
        num     INT                      COMMENT "num"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job15 ON routine_test15
            COLUMNS(id, name, age, num=age*10)
            PROPERTIES
            (
                "format" = "json",
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad15",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test15;
    +------+----------------+------+------+
    | id   | name           | age  | num  |
    +------+----------------+------+------+
    |    1 | Benjamin       |   18 |  180 |
    |    2 | Emily          |   20 |  200 |
    |    3 | Alexander      |   22 |  220 |
    +------+----------------+------+------+
    3 rows in set (0.01 sec)
    ```
### 複雑なデータ型の読み込み

**配列データ型の読み込み**

1. サンプルデータを読み込む：

    ```sql
    { "id" : 1, "name" : "Benjamin", "age":18, "array":[1,2,3,4,5]}
    { "id" : 2, "name" : "Emily", "age":20, "array":[6,7,8,9,10]}
    { "id" : 3, "name" : "Alexander", "age":22, "array":[11,12,13,14,15]}
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test16
    (
        id      INT             NOT NULL  COMMENT "id",
        name    VARCHAR(30)     NOT NULL  COMMENT "name",
        age     INT                       COMMENT "age",
        array   ARRAY<int(11)>  NULL      COMMENT "test array column"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job16 ON routine_test16
            PROPERTIES
            (
                "format" = "json"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad16",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test16;
    +------+----------------+------+----------------------+
    | id   | name           | age  | array                |
    +------+----------------+------+----------------------+
    |    1 | Benjamin       |   18 | [1, 2, 3, 4, 5]      |
    |    2 | Emily          |   20 | [6, 7, 8, 9, 10]     |
    |    3 | Alexander      |   22 | [11, 12, 13, 14, 15] |
    +------+----------------+------+----------------------+
    3 rows in set (0.00 sec)
    ```
**マップデータタイプの読み込み**

1. サンプルデータを読み込む：

    ```sql
    { "id" : 1, "name" : "Benjamin", "age":18, "map":{"a": 100, "b": 200}}
    { "id" : 2, "name" : "Emily", "age":20, "map":{"c": 300, "d": 400}}
    { "id" : 3, "name" : "Alexander", "age":22, "map":{"e": 500, "f": 600}}
    ```
2. Tableを作成する:

    ```sql
    CREATE TABLE demo.routine_test17 (
        id      INT                 NOT NULL  COMMENT "id",
        name    VARCHAR(30)         NOT NULL  COMMENT "name",
        age     INT                           COMMENT "age",
        map     Map<STRING, INT>    NULL      COMMENT "test column"
    )
    DUPLICATE KEY(`id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job17 ON routine_test17
        PROPERTIES
            (
                "format" = "json"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad17",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test17;
    +------+----------------+------+--------------------+
    | id   | name           | age  | map                |
    +------+----------------+------+--------------------+
    |    1 | Benjamin       |   18 | {"a":100, "b":200} |
    |    2 | Emily          |   20 | {"c":300, "d":400} |
    |    3 | Alexander      |   22 | {"e":500, "f":600} |
    +------+----------------+------+--------------------+
    3 rows in set (0.01 sec)
    ```
**Loading Bitmap Data タイプ**

1. サンプルデータの読み込み

    ```sql
    { "id" : 1, "name" : "Benjamin", "age":18, "bitmap_id":243}
    { "id" : 2, "name" : "Emily", "age":20, "bitmap_id":28574}
    { "id" : 3, "name" : "Alexander", "age":22, "bitmap_id":8573}
    ```
2. Tableを作成:

    ```sql
    CREATE TABLE demo.routine_test18 (
        id        INT            NOT NULL      COMMENT "id",
        name      VARCHAR(30)    NOT NULL      COMMENT "name",
        age       INT                          COMMENT "age",
        bitmap_id INT                          COMMENT "test",
        device_id BITMAP         BITMAP_UNION  COMMENT "test column"
    )
    AGGREGATE KEY (`id`,`name`,`age`,`bitmap_id`)
    DISTRIBUTED BY HASH(`id`) BUCKETS 1;
    ```
3. Load コマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job18 ON routine_test18
            COLUMNS(id, name, age, bitmap_id, device_id=to_bitmap(bitmap_id))
            PROPERTIES
            (
                "format" = "json"
            )
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad18",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );
    ```
4. 読み込み結果:

    ```sql
    mysql> select id, BITMAP_UNION_COUNT(pv) over(order by id) uv from(
        ->    select id, BITMAP_UNION(device_id) as pv
        ->    from routine_test18 
        -> group by id 
        -> ) final;
    +------+------+
    | id   | uv   |
    +------+------+
    |    1 |    1 |
    |    2 |    2 |
    |    3 |    3 |
    +------+------+
    3 rows in set (0.00 sec)
    ```
**HLLデータ型の読み込み**

1. サンプルデータの読み込み：

    ```sql
    2022-05-05,10001,Test01,Beijing,windows
    2022-05-05,10002,Test01,Beijing,linux
    2022-05-05,10003,Test01,Beijing,macos
    2022-05-05,10004,Test01,Hebei,windows
    2022-05-06,10001,Test01,Shanghai,windows
    2022-05-06,10002,Test01,Shanghai,linux
    2022-05-06,10003,Test01,Jiangsu,macos
    2022-05-06,10004,Test01,Shaanxi,windows
    ```
2. Tableを作成:

    ```sql
    create table demo.routine_test19 (
        dt        DATE,
        id        INT,
        name      VARCHAR(10),
        province  VARCHAR(10),
        os        VARCHAR(10),
        pv        hll hll_union
    )
    Aggregate KEY (dt,id,name,province,os)
    distributed by hash(id) buckets 10;
    ```
3. Loadコマンド:

    ```sql
    CREATE ROUTINE LOAD demo.kafka_job19 ON routine_test19
            COLUMNS TERMINATED BY ",",
            COLUMNS(dt, id, name, province, os, pv=hll_hash(id))
            FROM KAFKA
            (
                "kafka_broker_list" = "10.16.10.6:9092",
                "kafka_topic" = "routineLoad19",
                "property.kafka_default_offsets" = "OFFSET_BEGINNING"
            );  
    ```
4. 読み込み結果:

    ```sql
    mysql> select * from routine_test19;
    +------------+-------+----------+----------+---------+------+
    | dt         | id    | name     | province | os      | pv   |
    +------------+-------+----------+----------+---------+------+
    | 2022-05-05 | 10001 | Test01   | Beijing     | windows | NULL |
    | 2022-05-06 | 10001 | Test01   | Shanghai    | windows | NULL |
    | 2022-05-05 | 10002 | Test01   | Beijing     | linux   | NULL |
    | 2022-05-06 | 10002 | Test01   | Shanghai    | linux   | NULL |
    | 2022-05-05 | 10004 | Test01   | Hebei      | windows | NULL |
    | 2022-05-06 | 10004 | Test01   | Shaanxi      | windows | NULL |
    | 2022-05-05 | 10003 | Test01   | Beijing     | macos   | NULL |
    | 2022-05-06 | 10003 | Test01   | Jiangsu     | macos   | NULL |
    +------------+-------+----------+----------+---------+------+
    8 rows in set (0.01 sec)

    mysql> SELECT HLL_UNION_AGG(pv) FROM routine_test19;
    +-------------------+
    | hll_union_agg(pv) |
    +-------------------+
    |                 4 |
    +-------------------+
    1 row in set (0.01 sec)
    ```
### Kafka Security 認証

**SSL認証を使用したKafkaデータの読み込み**

読み込みコマンドの例：

```SQL
CREATE ROUTINE LOAD demo.kafka_job20 ON routine_test20
        PROPERTIES
        (
            "format" = "json"
        )
        FROM KAFKA
        (
            "kafka_broker_list" = "192.168.100.129:9092",
            "kafka_topic" = "routineLoad21",
            "property.security.protocol" = "ssl",
            "property.ssl.ca.location" = "FILE:ca.pem",
            "property.ssl.certificate.location" = "FILE:client.pem",
            "property.ssl.key.location" = "FILE:client.key",
            "property.ssl.key.password" = "ssl_passwd"
        );  
```
パラメータの説明：

| パラメータ                          | 説明                                                  |
|------------------------------------|--------------------------------------------------------------|
| property.security.protocol         | 使用するセキュリティプロトコル。この例ではSSL       |
| property.ssl.ca.location           | CA（認証局）証明書の場所   |
| property.ssl.certificate.location  | クライアントの公開鍵の場所（Kafkaサーバーでクライアント認証が有効な場合に必要） |
| property.ssl.key.location          | クライアントの秘密鍵の場所（Kafkaサーバーでクライアント認証が有効な場合に必要） |
| property.ssl.key.password          | クライアントの秘密鍵のパスワード（Kafkaサーバーでクライアント認証が有効な場合に必要） |

**Kerberos認証を使用したKafkaデータの読み込み**

読み込みコマンドの例：

```SQL
CREATE ROUTINE LOAD demo.kafka_job21 ON routine_test21
        PROPERTIES
        (
            "format" = "json"
        )
        FROM KAFKA
        (
            "kafka_broker_list" = "192.168.100.129:9092",
            "kafka_topic" = "routineLoad21",
            "property.security.protocol" = "SASL_PLAINTEXT",
            "property.sasl.kerberos.service.name" = "kafka",
            "property.sasl.kerberos.keytab"="/opt/third/kafka/kerberos/kafka_client.keytab",
            "property.sasl.kerberos.principal" = "clients/stream.dt.local@EXAMPLE.COM"
        );  
```
パラメータの説明:

| Parameter                           | デスクリプション                                               |
|-------------------------------------|-----------------------------------------------------------|
| property.security.protocol          | 使用されるセキュリティプロトコル、この例ではSASL_PLAINTEXTです |
| property.sasl.kerberos.service.name | ブローカーサービス名を指定します、デフォルトはKafkaです       |
| property.sasl.kerberos.keytab       | keytabファイルの場所                           |
| property.sasl.kerberos.principal    | Kerberosプリンシパルを指定します                          |

**PLAIN認証を使用したKafkaクラスターの読み込み**

1. ロードコマンドの例:

```SQL
CREATE ROUTINE LOAD demo.kafka_job22 ON routine_test22
        PROPERTIES
        (
            "format" = "json"
        )
        FROM KAFKA
        (
            "kafka_broker_list" = "192.168.100.129:9092",
            "kafka_topic" = "routineLoad22",
            "property.security.protocol"="SASL_PLAINTEXT",
            "property.sasl.mechanism"="PLAIN",
            "property.sasl.username"="admin",
            "property.sasl.password"="admin"
        );  
```
パラメータの説明:

| Parameter                          | デスクリプション                                               |
|------------------------------------|-----------------------------------------------------------|
| property.security.protocol         | 使用するセキュリティプロトコル、この例ではSASL_PLAINTEXTです |
| property.sasl.mechanism           | SASL認証メカニズムをPLAINとして指定します      |
| property.sasl.username            | SASLのユーザー名                                    |
| property.sasl.password            | SASLのパスワード                                    |

### 単一タスクによる複数Tableへのロード

"example_db"用にKafkaルーチン動的Tableロードタスク"test1"を作成します。列区切り文字、group.id、およびclient.idを指定します。すべてのパーティションを自動で消費し、利用可能なデータ位置（OFFSET_BEGINNING）から購読を開始します。

Kafkaから"example_db"の"tbl1"と"tbl2"Tableにデータをロードする必要があると仮定し、"test1"という名前のRoutine Loadタスクを作成します。このタスクは、Kafkaのトピック`my_topic`から"tbl1"と"tbl2"の両方に同時にデータをロードします。この方法により、単一のroutine loadタスクを使用してKafkaから2つのTableにデータをロードできます。

```sql
CREATE ROUTINE LOAD example_db.test1
FROM KAFKA
(
    "kafka_broker_list" = "broker1:9092,broker2:9092,broker3:9092",
    "kafka_topic" = "my_topic",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```
現在、KafkaのValueフィールドからTable名を抽出することのみがサポートされています。フォーマットは以下のようにする必要があり、JSONを例として使用します：`table_name|{"col1": "val1", "col2": "val2"}`。ここで`tbl_name`はTable名で、`|`はTable名とTableデータ間のセパレーターとして使用されます。同じフォーマットがCSVデータにも適用されます。例えば`table_name|val1,val2,val3`のようになります。ここでの`table_name`はDoris内のTable名と一致している必要があり、そうでなければロードは失敗します。動的Tableは後述するcolumn_mapping設定をサポートしないことに注意してください。

### Strict Mode Load

"example_db"と"example_tbl"に対して"test1"という名前のKafka routine loadタスクを作成します。ロードタスクはstrict modeに設定されます。

```sql
CREATE ROUTINE LOAD example_db.test1 ON example_tbl
COLUMNS(k1, k2, k3, v1, v2, v3 = k1 * 100),
PRECEDING FILTER k1 = 1,
WHERE k1 < 100 and k2 like "%doris%"
PROPERTIES
(
    "strict_mode" = "true"
)
FROM KAFKA
(
    "kafka_broker_list" = "broker1:9092,broker2:9092,broker3:9092",
    "kafka_topic" = "my_topic"
);
```
## SASL Kafka サービスに接続する

ここでは StreamNative メッセージサービスへのアクセスを例として説明します：

```
CREATE ROUTINE LOAD example_db.test1 ON example_tbl
COLUMNS(user_id, name, age)
FROM KAFKA (
"kafka_broker_list" = "pc-xxxx.aws-mec1-test-xwiqv.aws.snio.cloud:9093",
"kafka_topic" = "my_topic",
"property.security.protocol" = "SASL_SSL",
"property.sasl.mechanism" = "PLAIN",
"property.sasl.username" = "user",
"property.sasl.password" = "token:eyJhbxxx",
"property.group.id" = "my_group_id_1",
"property.client.id" = "my_client_id_1",
"property.enable.ssl.certificate.verification" = "false"
);
```
信頼できるCA証明書のパスがBE側で設定されていない場合、サーバー証明書が信頼できるかどうかを検証しないように`"property.enable.ssl.certificate.verification" = "false"`を設定する必要があることに注意してください。

そうでなければ、信頼できるCA証明書のパスを設定する必要があります：`"property.ssl.ca.location" = "/path/to/ca-cert.pem"`。

## More Details

Routine LoadのSQLマニュアルを参照してください。また、クライアントのコマンドラインで`HELP ROUTINE LOAD`を入力することで、より詳しいヘルプを表示することもできます。
