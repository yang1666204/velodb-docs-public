---
{
  "title": "操作マニュアル",
  "language": "ja"
}
---
## 使用要件

### ネットワーク要件

- Syncerは上流と下流の両方のFEおよびBEと通信できる必要があります。
- 下流のBEは、Doris BEプロセスで使用されるIPに直接アクセスできる必要があります（`show frontends/backends`で確認可能）。

### 権限要件

Syncerが同期を実行する際、ユーザーは上流と下流の両方のアカウントを提供する必要があり、これらのアカウントは以下の権限を持っている必要があります：

- Select_priv: データベースとTableの読み取り専用権限。
- Load_priv: データベースとTableの書き込み権限（Load、Insert、Deleteなどを含む）。
- Alter_priv: データベースとTableの変更権限（データベース/Tableの名前変更、カラムの追加/削除/変更、パーティションの追加/削除などを含む）。
- Create_priv: データベース、Table、ビューの作成権限。
- Drop_priv: データベース、Table、ビューの削除権限。
- Admin権限（後で削除を検討中）、enable binlog設定の確認に使用。

### バージョン要件

- Syncerバージョン >= 下流Dorisバージョン >= 上流Dorisバージョン。したがって、まずSyncerをアップグレードし、次に下流のDoris、最後に上流のDorisをアップグレードしてください。
- Doris 2.0の最小バージョンは2.0.15、Doris 2.1の最小バージョンは2.1.6です。
- Syncerバージョン2.1.8および3.0.4以降、SyncerはDoris 2.0をサポートしなくなりました。

### 設定およびプロパティ要件

**プロパティ要件**
- `light_schema_change`: Syncerでは上流と下流の両方のTableに`light_schema_table`プロパティを設定する必要があります。設定しない場合、データ同期エラーが発生する可能性があります。注意：最新バージョンのDorisでは、Table作成時にデフォルトで`light_schema_change`プロパティが設定されます。Dorisバージョン1.1以前を使用している場合、またはそこからアップグレードした場合は、Syncer同期を有効にする前に既存のOLAPTableに`light_schema_change`プロパティを設定する必要があります。

**設定要件**
- `restore_reset_index_id`: 同期対象のTableに転置インデックスがある場合、ターゲットクラスタで`false`に設定する必要があります。
- `ignore_backup_tmp_partitions`: 上流で一時パーティションが作成される場合、Dorisはバックアップを禁止し、Syncer同期が中断されます。FEで`ignore_backup_tmp_partitions=true`を設定することで、この問題を回避できます。

## データベース内のすべてのTableでbinlogを有効にする

```shell
bash bin/enable_db_binlog.sh -h host -p port -u user -P password -d db
```
## Syncer開始

環境変数 ${SYNCER_HOME} が Syncer の作業ディレクトリに設定されていることを前提として、`bin/start_syncer.sh` を使用して Syncer を開始できます。

| **オプション** | **説明** | **コマンド例** | **デフォルト値** |
|------------|-----------------|---------------------|--------------------|
| `--daemon` | Syncer をバックグラウンドで実行 | `bin/start_syncer.sh --daemon` | `false` |
| `--db_type` | Syncer はメタデータを保存するために2種類のデータベースを使用できます：`sqlite3`（ローカルストレージ）と `mysql`（ローカルまたはリモートストレージ）。`mysql` を使用してメタデータを保存する場合、Syncer は `CREATE IF NOT EXISTS` を使用して `ccr` という名前のデータベースを作成し、メタデータTableがそこに保存されます。 | `bin/start_syncer.sh --db_type mysql` | `sqlite3` |
| `--db_dir` | **`sqlite3` 使用時のみ有効**；SQLite3 生成データベースファイルのファイル名とパスを指定します。 | `bin/start_syncer.sh --db_dir /path/to/ccr.db` | `SYNCER_HOME/db/ccr.db` |
| `--db_host`<br>`--db_port`<br>`--db_user`<br>`--db_password` | **`mysql` 使用時のみ有効**；MySQL のホスト、ポート、ユーザー、パスワードを設定するために使用されます。 | `bin/start_syncer.sh --db_host 127.0.0.1 --db_port 3306 --db_user root --db_password "qwe123456"` | `db_host` と `db_port` はサンプル値がデフォルト；`db_user` と `db_password` は空がデフォルト。 |
| `--log_dir` | ログ出力パスを指定 | `bin/start_syncer.sh --log_dir /path/to/ccr_syncer.log` | `SYNCER_HOME/log/ccr_syncer.log` |
| `--log_level` | ログ出力レベルを指定；ログ形式は次の通りです：`time level msg hooks`。バックグラウンド実行時のデフォルト値は `info`；フォアグラウンド実行時のデフォルト値は `トレース` で、`tee` を使用してログが `log_dir` に保存されます。 | `bin/start_syncer.sh --log_level info` | `info`（バックグラウンド）<br>`トレース`（フォアグラウンド） |
| `--host`<br>`--port` | Syncer の `host` と `port` を指定します。`host` はクラスター内の Syncer インスタンスを区別するために使用され、Syncer の名前として理解できます；クラスター内の Syncer の命名形式は `host:port` です。 | `bin/start_syncer.sh --host 127.0.0.1 --port 9190` | `host` のデフォルトは `127.0.0.1`<br>`port` のデフォルトは `9190` |
| `--pid_dir` | PID ファイルを保存するパスを指定します。PID ファイルは `stop_syncer.sh` スクリプトが Syncer を停止するための認証情報で、対応する Syncer のプロセス番号を保存します。クラスター管理を容易にするため、パスをカスタマイズできます。 | `bin/start_syncer.sh --pid_dir /path/to/pids` | `SYNCER_HOME/bin` |

## Syncer停止

`bin/stop_syncer.sh` を使用して3つの方法で Syncer を停止できます：

| **方法/オプション** | **説明** | **コマンド例** | **デフォルト値** |
|-------------------|-----------------|---------------------|--------------------|
| **方法1** 単一Syncerの停止 | 停止する Syncer の `host` と `port` を指定；開始時に使用した `host` と一致する必要があります。 | `bash bin/stop_syncer.sh --host 127.0.0.1 --port 9190` | なし |
| **方法2** Syncerの一括停止 | 停止する PID ファイル名を指定、スペースで区切り `"` で囲みます。 | `bash bin/stop_syncer.sh --files "127.0.0.1_9190.pid 127.0.0.1_9191.pid"` | なし |
| **方法3** 全Syncerの停止 | デフォルトでは、`pid_dir` パス内の PID ファイルに対応するすべての Syncer を停止します。 | `bash bin/stop_syncer.sh --pid_dir /path/to/pids` | なし |

方法3のオプション：

| **オプション** | **説明** | **コマンド例** | **デフォルト値** |
|------------|-----------------|---------------------|--------------------|
| `--pid_dir` | PID ファイルが配置されているディレクトリを指定；3つすべての停止方法はこのオプションに依存して実行されます。 | `bash bin/stop_syncer.sh --pid_dir /path/to/pids` | `SYNCER_HOME/bin` |
| `--host`<br>`--port` | `pid_dir` パス内の `host:port` に対応する Syncer を停止します。`host` のみが指定された場合、**方法3** に退化；`host` と `port` の両方が空でない場合、**方法1** として有効になります。 | `bash bin/stop_syncer.sh --host 127.0.0.1 --port 9190` | `host`：127.0.0.1<br>`port`：空 |
| `--files` | `pid_dir` パス内の指定された PID ファイル名に対応する Syncer を停止、スペースで区切り `"` で囲みます。 | `bash bin/stop_syncer.sh --files "127.0.0.1_9190.pid 127.0.0.1_9191.pid"` | なし |

## Syncer操作リスト

**リクエストの一般テンプレート**

```shell
curl -X POST -H "Content-Type: application/json" -d {json_body} http://ccr_syncer_host:ccr_syncer_port/operator
```
json_body: 操作に必要な情報をJSON形式で送信します。

operator: Syncerの異なる操作に対応します。

したがって、インターフェースの戻り値はすべてJSONです。成功した場合、`success`フィールドはtrueになり、エラーがある場合はfalseになり、エラーメッセージは`ErrMsgs`フィールドに含まれます。

```JSON
{"success":true}

or

{"success":false,"error_msg":"job ccr_test not exist"}
```
### Job作成

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "ccr_test",
    "src": {
    "host": "localhost",
    "port": "9030",
    "thrift_port": "9020",
    "user": "root",
    "password": "",
    "database": "demo",
    "table": "example_tbl"
    },
    "dest": {
    "host": "localhost",
    "port": "9030",
    "thrift_port": "9020",
    "user": "root",
    "password": "",
    "database": "ccrt",
    "table": "copy"
    }
}' http://127.0.0.1:9190/create_ccr
```
- name: CCR同期ジョブの名前。一意である必要があります。

- host, port: クラスターマスターのホストとMySQL（jdbc）のポートに対応します。

- thrift_port: FEのrpc_portに対応します。

- user, password: Syncerがトランザクションを開始し、データを取得する際などに使用するIDです。

- database, table:

  - データベースレベルの同期の場合、dbNameを入力し、tableNameは空のままにします。

  - Tableレベルの同期の場合、dbNameとtableNameの両方を入力します。

### 同期進捗の確認

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/get_lag
```
job_nameはcreate_ccr実行時に作成される名前です。

### ジョブの一時停止

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/pause
```
### ジョブの再開

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/resume
```
### Delete Job

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/delete
```
### バージョンの取得

```shell
curl http://ccr_syncer_host:ccr_syncer_port/version

# > return
{"version": "2.0.1"}
```
### ジョブステータスの表示

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/job_status

{
"success": true,
"status": {
    "name": "ccr_db_table_alias",
    "state": "running",
    "progress_state": "TableIncrementalSync"
}
}
```
### End Synchronization

```shell
curl -X POST -H "Content-Type: application/json" -d '{
    "name": "job_name"
}' http://ccr_syncer_host:ccr_syncer_port/desync
```
### ジョブリストの取得

```shell
curl http://ccr_syncer_host:ccr_syncer_port/list_jobs

{"success":true,"jobs":["ccr_db_table_alias"]}
```
## Syncer高可用性

Syncer高可用性はMySQLに依存します。MySQLがバックエンドストレージとして使用される場合、Syncerは他のSyncerを発見することができます。1つがクラッシュした場合、他のSyncerがそのジョブを引き継ぎます。

## アップグレード

### 1. Syncerのアップグレード
以下の環境変数が設定されていることを前提とします：
- ${SYNCER_HOME}: Syncerの作業ディレクトリ。
- ${SYNCER_PACKAGE_DIR}: 新しいSyncerが含まれるディレクトリ。

以下の手順に従って、すべてのSyncerをアップグレードします。

1.1. 開始コマンドを保存

以下のコマンドの出力をファイルに保存します。

```
ps -elf | grep ccr_syncer
```
1.2. 現在のSyncerを停止する

```shell
sh bin/stop_syncer.sh --pid_dir ${SYNCER_HOME}/bin
```
1.3. 既存のMetaServiceバイナリをバックアップする

```shell
mv ${SYNCER_HOME}/bin bin_backup_$(date +%Y%m%d_%H%M%S)
```
1.4. 新しいpackageをデプロイする

```shell
cp ${SYNCER_PACKAGE_DIR}/bin ${SYNCER_HOME}/bin
```
1.5. 新しいSyncerを開始する

1.1で保存したコマンドを使用して新しいSyncerを開始します。

### 2. ダウンストリームDorisのアップグレード（必要に応じて）

Upgrade Dorisガイドの手順に従ってアップストリームシステムをアップグレードします。

### 3. アップストリームDorisのアップグレード（必要に応じて）

Upgrade Dorisガイドの手順に従ってアップストリームシステムをアップグレードします。

## 使用上の注意事項

:::caution

`is_being_synced`属性は通常の状況下でオン・オフを切り替える際にSyncerによって完全に制御される必要があります。ユーザーはこの属性を自分で変更すべきではありません。

:::

### 重要な注意事項

- CCR同期中、backup/restoreジョブとbinlogはすべてFEメモリ内にあるため、FE（ソースクラスターとターゲットクラスターの両方）の各CCRジョブに対して少なくとも4GB以上のヒープメモリを割り当てることを推奨します。また、関連のないジョブのメモリ消費を削減するために以下の設定を変更してください：
    - FE設定`max_backup_restore_job_num_per_db`を変更：
        各DBのbackup/restoreジョブ数をメモリ内に記録します。デフォルト値は10ですが、2に設定すれば十分です。
    - ソースクラスターのdb/tableプロパティを変更してbinlog保持制限を設定：
        - `binlog.max_bytes`：binlogが占有する最大メモリ；少なくとも4GBの保持を推奨（デフォルトは無制限）。
        - `binlog.ttl_seconds`：binlog保持時間；バージョン2.0.5以前はデフォルトが無制限でしたが、それ以降のデフォルト値は1日（86400）です。
        例えば、binlog ttl secondsを1時間保持に変更する場合：`ALTER TABLE table SET ("binlog.ttl_seconds"="3600")`。
- CCRの正確性はターゲットクラスターのトランザクション状態にも依存するため、同期中にトランザクションが早く回収されないようにする必要があります。以下の設定を増加させる必要があります：
    - `label_num_threshold`：TXN Labelsの数を制御するために使用。
    - `stream_load_default_timeout_second`：TXNタイムアウト時間を制御するために使用。
    - `label_keep_max_second`：TXN終了後の保持時間を制御するために使用。
    - `streaming_label_keep_max_second`：上記と同様。
- データベース同期でソースクラスターが大量のtabletを持つ場合、結果として生成されるCCRジョブが非常に大きくなる可能性があり、いくつかのFE設定の変更が必要です：
    - `max_backup_tablets_per_job`：
        単一のbackupジョブに関与するtabletの上限；tablet数に基づいて調整する必要があります（デフォルト値は300,000；tabletが多すぎるとFE OOMのリスクがあるため、tabletの数を減らすことを優先してください）。
    - `thrift_max_message_size`：
        FE thriftサーバーが許可する最大単一RPCパケットサイズ；デフォルトは100MBです。tablet数が多すぎてsnapshot infoサイズが100MBを超える場合、この制限を調整する必要があり、最大2GBまで設定可能です。
        - snapshot infoサイズはccr syncerログで確認でき、キーワードは：`snapshot response meta size: %d, job info size: %d`；snapshot infoサイズは約meta size + job info sizeです。
    - `fe_thrift_max_pkg_bytes`：
        上記と同様、バージョン2.0で調整が必要な追加パラメータで、デフォルト値は20MBです。
    - `restore_download_job_num_per_be`：
        各BEに送信されるdownloadジョブの上限；デフォルトは3ですが、restoreジョブには小さすぎるため0に調整する必要があります（つまり、この制限を無効にします）；この設定はバージョン2.1.8および3.0.4以降では不要です。
    - `backup_upload_job_num_per_be`：
        各BEに送信されるuploadジョブの上限；デフォルトは3ですが、backupジョブには小さすぎるため0に調整する必要があります（つまり、この制限を無効にします）；この設定はバージョン2.1.8および3.0.4以降では不要です。
    - 上記のFE設定に加えて、CCRジョブのdb typeがMySQLの場合、いくつかのMySQL設定も調整する必要があります：
        - MySQLサーバーは単一のselect/insertで返される/挿入されるデータパケットのサイズを制限します。この制限を緩和するために以下の設定を増加させてください。例えば、上限を1GBに調整：

        ```
        [mysqld]
        max_allowed_packet = 1024MB
        ```
- MySQL clientにもこの制限があります。ccr syncerバージョン2.1.6/2.0.15以前では、上限は128MBです。それ以降のバージョンでは、パラメータ`--mysql_max_allowed_packet`（バイト単位）でこれを調整でき、デフォルト値は1024MBです。
        > 注意：バージョン2.1.8および3.0.4以降では、ccr syncerはもはやスナップショット情報をデータベースに保存しないため、デフォルトのデータパケットサイズで十分です。
- 同様に、BE側でも複数の設定を変更する必要があります：
    - `thrift_max_message_size`：BE thriftサーバーが許可する単一RPCパケットの最大サイズ。デフォルトは100MBです。タブレット数が多すぎてagent jobのサイズが100MBを超える場合、この制限を調整する必要があり、最大2GBまで設定できます。
    - `be_thrift_max_pkg_bytes`：上記と同じで、バージョン2.0でのみ調整が必要です。デフォルト値は20MBです。
- 上記の設定を変更しても、タブレット数が増え続けると、結果として生成されるスナップショットサイズが2GBを超える可能性があります。これはDoris FE edit logとRPCメッセージサイズの閾値であり、同期が失敗する原因となります。バージョン2.1.8と3.0.4以降では、Dorisはスナップショットを圧縮することで、バックアップとリカバリでサポートされるタブレット数をさらに増やすことができます。これは以下のパラメータで有効化できます：
    - `restore_job_compressed_serialization`：restoreジョブの圧縮を有効化（メタデータ互換性に影響、デフォルトはオフ）。
    - `backup_job_compressed_serialization`：backupジョブの圧縮を有効化（メタデータ互換性に影響、デフォルトはオフ）。
    - `enable_restore_snapshot_rpc_compression`：スナップショット情報の圧縮を有効化、主にRPCに影響（デフォルトはオン）。
    > 注意：backup/restoreジョブが圧縮されているかどうかを識別するには追加のコードが必要であり、バージョン2.1.8と3.0.4以前のコードには関連コードが含まれていないため、一度backup/restoreジョブが生成されると、それより前のDorisバージョンに戻すことはできません。2つの例外があります：すでにキャンセルまたは完了したbackup/restoreジョブは圧縮されないため、復元前にbackup/restoreジョブの完了を待つか、積極的にジョブをキャンセルすることで安全なロールバックを保証できます。
- CCRは内部的にdb/table名を一部の内部ジョブのラベルとして使用するため、CCRジョブで制限を超えるラベルが発生した場合、FEパラメータ`label_regex_length`を調整してこの制限を緩和できます（デフォルト値は128）。
- backupは現在cooldownタブレットを持つTableのバックアップをサポートしていないため、これに遭遇すると同期が終了します。そのため、CCRジョブを作成する前に、`storage_policy`プロパティが設定されたTableがないかチェックする必要があります。
### パフォーマンス関連パラメータ
- ユーザーのデータ量が非常に大きい場合、バックアップとリカバリの完了に必要な時間が1日（デフォルト値）を超える可能性があるため、以下のパラメータを必要に応じて調整する必要があります：
    - `backup_job_default_timeout_ms`：backup/restoreジョブのタイムアウト時間。ソースクラスタとターゲットクラスタの両方のFEでこれを設定する必要があります。
    - 上流でbinlog保持時間を変更：`ALTER DATABASE $db SET PROPERTIES ("binlog.ttl_seconds" = "xxxx")`。
- 下流BEのダウンロード速度が遅い場合：
    - `max_download_speed_kbps`：単一の下流BEにおける単一ダウンロードスレッドのダウンロード速度制限、デフォルトは50MB/sです。
    - `download_worker_count`：下流でダウンロードジョブを実行するスレッド数。顧客のマシンタイプに基づいて調整し、通常の読み書き操作に影響を与えない範囲で最大化する必要があります。このパラメータを調整する場合、`max_download_speed_kbps`を調整する必要はありません。
        - 例えば、顧客のマシンのネットワークカードが最大1GBの帯域幅を提供し、許可される最大ダウンロードスレッドが200MBの帯域幅を使用する場合、`max_download_speed_kbps`を変更せずに、`download_worker_count`を4に設定する必要があります。
- 下流BEからのbinlogのダウンロード速度を制限：
    BE側設定パラメータ：

    ```shell
    download_binlog_rate_limit_kbs=1024 # Limit the speed of a single BE node pulling Binlog (including Local Snapshot) from the source cluster to 1 MB/s.
    ```
詳細なパラメータと説明：
    1. `download_binlog_rate_limit_kbs`パラメータはソースクラスターのBEノードに設定され、このパラメータを設定することでデータプル速度を効果的に制限できます。
    2. `download_binlog_rate_limit_kbs`パラメータは主に単一のBEノードの速度を設定するために使用されます。クラスター全体の速度を計算するには、パラメータ値にクラスター内のノード数を掛ける必要があります。
