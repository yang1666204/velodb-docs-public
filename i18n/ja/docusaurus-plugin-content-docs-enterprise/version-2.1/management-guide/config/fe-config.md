---
{
  "title": "FE設定",
  "language": "ja"
}
---
<!-- Please sort the configuration alphabetically -->

# FE 構成

このドキュメントでは、主にFEの関連する設定項目について説明します。

FE設定ファイル`fe.conf`は通常、FEデプロイメントパスの`conf/`ディレクトリに保存されます。バージョン0.14では、もう一つの設定ファイル`fe_custom.conf`が導入されます。この設定ファイルは、ユーザーが運用中に動的に設定し、永続化した設定項目を記録するために使用されます。

FEプロセスが開始された後、まず`fe.conf`の設定項目を読み込み、次に`fe_custom.conf`の設定項目を読み込みます。`fe_custom.conf`の設定項目は`fe.conf`内の同じ設定項目を上書きします。

`fe_custom.conf`ファイルの場所は、`custom_config_dir`設定項目を通じて`fe.conf`で設定できます。

## 設定項目の表示

FEの設定項目を表示する方法は2つあります：

1. FE webページ

    ブラウザでFE webページ`http://fe_host:fe_http_port/variable`を開きます。`Configure Info`で現在有効なFE設定項目を確認できます。

2. コマンドによる表示

    FEが開始された後、以下のコマンドでMySQL clientでFEの設定項目を表示できます。具体的な言語の法則については[SHOW-CONFIG](../../sql-manual/sql-statements/cluster-management/instance-management/SHOW-FRONTEND-CONFIG)を参照してください：

    `SHOW FRONTEND CONFIG;`

    結果の列の意味は以下の通りです：

    * Key: 設定項目の名前。
    * Value: 現在の設定項目の値。
    * タイプ: 設定項目の値のタイプ（integerやstringなど）。
    * IsMutable: 動的設定が可能かどうか。trueの場合、設定項目は実行時に動的設定可能です。falseの場合、設定項目は`fe.conf`でのみ設定可能で、FE再起動後に有効になります。
    * MasterOnly: Master FEノード固有の設定項目かどうか。trueの場合、設定項目はMaster FEノードでのみ意味があり、他のタイプのFEノードでは無意味です。falseの場合、設定項目はすべてのタイプのFEノードで意味があります。
    * Comment: 設定項目の説明。

## 設定項目の設定

FE設定項目を設定する方法は2つあります：

1. 静的設定

    `conf/fe.conf`ファイルで設定項目を追加・設定します。`fe.conf`内の設定項目はFEプロセス開始時に読み込まれます。`fe.conf`にない設定項目はデフォルト値を使用します。

2. MySQL protocolによる動的設定

    FE開始後、以下のコマンドで設定項目を動的に設定できます。このコマンドには管理者権限が必要です。

    `ADMIN SET FRONTEND CONFIG (" fe_config_name "=" fe_config_value ");`

    すべての設定項目が動的設定をサポートするわけではありません。`SHOW FRONTEND CONFIG;`コマンド結果の`IsMutable`列で動的設定がサポートされているかを確認できます。

    `MasterOnly`の設定項目が変更された場合、コマンドは直接Master FEに転送され、Master FE内の対応する設定項目のみが変更されます。

    **この方法で変更された設定項目は、FEプロセス再起動後に無効になります。**

    このコマンドの詳細なヘルプは、`HELP ADMIN SET CONFIG;`コマンドで表示できます。

3. HTTP protocolによる動的設定

    詳細については、[Set Config Action](../open-api/fe-http/set-config-action)を参照してください

    この方法では、変更された設定項目を永続化することも可能です。設定項目は`fe_custom.conf`ファイルに永続化され、FE再起動後も有効です。

## 例

1. `async_pending_load_task_pool_size`の変更

    `SHOW FRONTEND CONFIG;`を通じて、この設定項目は動的設定できない（`IsMutable`がfalse）ことが分かります。`fe.conf`に以下を追加する必要があります：

    `async_pending_load_task_pool_size = 20`

    その後、FEプロセスを再起動して設定を有効にします。

2. `dynamic_partition_enable`の変更

    `SHOW FRONTEND CONFIG;`を通じて、設定項目が動的設定可能（`IsMutable`がtrue）であることが分かります。また、Master FE固有の設定です。まず任意のFEに接続し、以下のコマンドを実行して設定を変更できます：

    ```
    ADMIN SET FRONTEND CONFIG ("dynamic_partition_enable" = "true"); `
    ```
その後、以下のコマンドで変更された値を確認できます：

    ```
    set forward_to_master = true;
    SHOW FRONTEND CONFIG;
    ```
上記の方法で変更した後、Master FEが再起動されたり、Master選出が実行された場合、設定は無効になります。設定項目を直接`fe.conf`に追加してFEを再起動することで、設定項目を永続化できます。

3. `max_distribution_pruner_recursion_depth`の変更

    `SHOW FRONTEND CONFIG;`により、この設定項目が動的に設定可能であることを確認できます（`IsMutable`がtrue）。これはMaster FE固有の設定ではありません。

    同様に、動的設定変更コマンドにより設定を変更できます。この設定はMaster FE固有ではないため、ユーザーは異なるFEに個別に接続して動的に設定を変更する必要があり、すべてのFEが変更された設定値を使用するようにします。

## 設定

### メタデータとクラスタ

#### `meta_dir`

デフォルト：DORIS_HOME_DIR + "/doris-meta"

タイプ：string 説明：Dorisメタデータがここに保存されます。このディレクトリのストレージは以下の条件を満たすことを強く推奨します：

* 高い書き込みパフォーマンス（SSD）
* 安全性（RAID）

#### `catalog_try_lock_timeout_ms`

デフォルト：5000（ms）

IsMutable：true

カタログロックのtryLockタイムアウト設定。通常は変更する必要がありませんが、何かをテストする必要がある場合は除きます。

#### `enable_bdbje_debug_mode`

デフォルト：false

trueに設定すると、FEはBDBJEデバッグモードで起動されます

#### `max_bdbje_clock_delta_ms`

デフォルト：5000（5s）

非マスターFEからマスターFEホストへの最大許容クロックスキューを設定します。この値は、非マスターFEがBDBJEを介してマスターFEへの接続を確立するたびにチェックされます。クロックスキューがこの値より大きい場合、接続は破棄されます。

#### `metadata_failure_recovery`

デフォルト：false

trueの場合、FEはbdbjeレプリケーショングループをリセット（つまり、すべての選出可能ノード情報を削除）し、Masterとして起動することを想定します。すべての選出可能ノードが起動できない場合、メタデータを別のノードにコピーし、この設定をtrueにしてFEの再起動を試行できます。

#### `txn_rollback_limit`

デフォルト：100

グループへの再参加を試行する際にbdbjeがロールバックできる最大txn数

#### `grpc_threadmgr_threads_nums`

デフォルト：4096

grpc_threadmgrでgrpcイベントを処理するスレッド数。

#### `bdbje_replica_ack_timeout_second`

デフォルト：10（s）

bdbjeへの書き込み時のレプリカackタイムアウト。比較的大きなログを書き込む際、ack時間がタイムアウトし、ログ書き込み失敗を引き起こす可能性があります。この場合、この値を適切に増加させることができます。

#### `bdbje_lock_timeout_second`

デフォルト：5

bdbje操作のロックタイムアウト。FE WARNログに多くのLockTimeoutExceptionがある場合、この値を増加させてみてください

#### `bdbje_heartbeat_timeout_second`

デフォルト：30

マスターとフォロワー間のbdbjeハートビートタイムアウト。デフォルトは30秒で、bdbjeのデフォルト値と同じです。ネットワークが一時的な問題を経験している場合、または予期しない長いJava GCが問題を起こしている場合、この値を増加させて誤ったタイムアウトの発生率を下げることができます

#### `replica_ack_policy`

デフォルト：SIMPLE_MAJORITY

オプション：ALL、NONE、SIMPLE_MAJORITY

bdbjeのレプリカackポリシー。詳細情報は以下を参照：<http://docs.oracle.com/cd/E17277_02/html/java/com/sleepycat/je/Durability.ReplicaAckPolicy.html>

#### `replica_sync_policy`

デフォルト：SYNC

選項：SYNC、NO_SYNC、WRITE_NO_SYNC

フォロワーFEのbdbje同期ポリシー。

#### `master_sync_policy`

デフォルト：SYNC

選項：SYNC、NO_SYNC、WRITE_NO_SYNC

マスターFEのbdbje同期ポリシー。フォロワーFEを1つだけデプロイする場合、これを'SYNC'に設定してください。3つ以上のフォロワーFEをデプロイする場合、これと以下の'replica_sync_policy'をWRITE_NO_SYNCに設定できます。詳細情報は以下を参照：<http://docs.oracle.com/cd/E17277_02/html/java/com/sleepycat/je/Durability.SyncPolicy.html>

#### `bdbje_reserved_disk_bytes`

レプリケートされたJE Environmentで保持する予約領域のバイト数の希望上限。

デフォルト：1073741824

動的設定可能かどうか：false

Master FEノード固有の設定項目かどうか：false

#### `ignore_meta_check`

デフォルト：false

IsMutable：true

trueの場合、非マスターFEはマスターFEと自身の間のメタデータ遅延ギャップを無視します。メタデータ遅延ギャップが*meta_delay_toleration_second*を超えてもです。非マスターFEは引き続き読み取りサービスを提供します。
これは、何らかの理由でマスターFEを比較的長時間停止させようとするが、それでも非マスターFEに読み取りサービスを提供してもらいたい場合に役立ちます。

#### `meta_delay_toleration_second`

デフォルト：300（5分）

メタデータ遅延ギャップが*meta_delay_toleration_second*を超えると、非マスターFEはサービス提供を停止します

#### `edit_log_port`

デフォルト：9010

bdbjeポート

#### `edit_log_type`

デフォルト：BDB

編集ログタイプ。
BDB：ログをbdbjeに書き込み
LOCAL：廃止予定..

#### `edit_log_roll_num`

デフォルト：50000

IsMutable：true

MasterOnly：true

マスターFEは*edit_log_roll_num*メタジャーナルごとにイメージを保存します。

#### `force_do_metadata_checkpoint`

デフォルト：false

IsMutable：true

MasterOnly：true

trueに設定すると、チェックポイントスレッドはjvmメモリ使用率に関係なくチェックポイントを作成します

#### `metadata_checkpoint_memory_threshold`

デフォルト：60（60%）

IsMutable：true

MasterOnly：true

jvmメモリ使用率（ヒープまたは古いメモリプール）がこの閾値を超えると、OOMを避けるためにチェックポイントスレッドは動作しません。

#### `max_same_name_catalog_trash_num`

カタログリサイクルビン内の同じ名前のメタ情報の最大数を設定するために使用されます。最大値を超えると、最も早く削除されたメタトラッシュは完全に削除され、復旧できません。0は同じ名前のオブジェクトを保持しないことを意味します。< 0は制限なしを意味します。

注意：同じ名前のメタデータの判定は特定の範囲に制限されます。例えば、同じ名前のデータベースの判定は同じクラスタに制限され、同じ名前のTableの判定は同じデータベース（同じデータベースID）に制限され、同じ名前のパーティションの判定は同じデータベース（同じデータベースID）と同じTable（同じTableID）に制限されます。

デフォルト：3

動的設定可能かどうか：true

Master FEノード固有の設定項目かどうか：true

#### `cluster_id`

デフォルト：-1

同じクラスタIDを持つノード（FEまたはBE）は同じPaloクラスタに属すると見なされます。クラスタIDは通常、マスターFEが最初に起動する際に生成されるランダムな整数です。独自に指定することも可能です。

#### `heartbeat_mgr_blocking_queue_size`

デフォルト：1024

MasterOnly：true

heartbeat_mgrでハートビートタスクを格納するブロッキングキューサイズ。

#### `heartbeat_mgr_threads_num`

デフォルト：8

MasterOnly：true

heartbeat_mgrでハートビートイベントを処理するスレッド数。

#### `disable_cluster_feature`

デフォルト：true

IsMutable：true

マルチクラスタ機能はバージョン0.12で廃止予定です。この設定をtrueにすると、クラスタ機能に関連するすべての操作が無効になります：

1. create/drop cluster
2. add free backend/add backend to cluster/decommission cluster balance
3. change the backends num of cluster
4. link/migration db

#### `enable_fqdn_mode`

この設定は主にk8sクラスタ環境で使用されます。enable_fqdn_modeがtrueの場合、beが配置されているpodの名前は再構築後も変わりませんが、ipは変更される可能性があります。

デフォルト：false

動的設定可能かどうか：false

Master FEノード固有の設定項目かどうか：true

#### `enable_token_check`

デフォルト：true

前方互換性のため、後で削除予定。イメージファイルダウンロード時のトークンチェック。

#### `enable_multi_tags`

デフォルト：false

動的設定可能かどうか：false

Master FEノード固有の設定項目かどうか：true

単一BEのマルチタグ機能を有効にするかどうか

#### `initial_root_password`

rootユーザーの初期2段階SHA-1暗号化パスワードを設定します。デフォルトは''で、rootパスワードなしを意味します。rootユーザーに対するその後の`set password`操作は初期rootパスワードを上書きします。

例：平文パスワード`root@123`を設定したい場合。Doris SQL `select password('root@123')`を実行して暗号化パスワード`*A00C34073A26B40AB4307650BFB9309D6BFA6999`を生成できます。

デフォルト：空文字列

動的設定可能かどうか：false

Master FEノード固有の設定項目かどうか：true

### サービス

#### `query_port`

デフォルト：9030

FE MySQLサーバーポート

#### `arrow_flight_sql_port`

デフォルト：-1

Arrow Flight SQLサーバーポート

#### `frontend_address`

ステータス：廃止予定、使用推奨せず。このパラメータは後で削除される可能性があります

タイプ：string

説明：*InetAddress.getByName*を使用してIPアドレスを取得する代わりに、FEのIPアドレスを明示的に設定します。通常は*InetAddress.getByName*で期待される結果が得られない場合に使用します。IPアドレスのみサポート、ホスト名は不可。

デフォルト値：0.0.0.0

#### `priority_networks`

デフォルト：none

多くのIPを持つサーバーの選択戦略を宣言します。このリストに一致するIPは最大で1つである必要があります。これはセミコロン区切り形式のリストで、CIDR記法（例：10.10.10.0/24）で記述します。このルールに一致するIPがない場合、ランダムに1つを選択します。

#### `http_port`

デフォルト：8030

HTTPバインドポート。現在、すべてのFE httpポートは同じである必要があります。

#### `https_port`

デフォルト：8050

HTTPSバインドポート。現在、すべてのFE httpsポートは同じである必要があります。

#### `enable_https`

デフォルト：false

Https有効化フラグ。値がfalseの場合、httpがサポートされます。それ以外の場合、httpとhttpsの両方がサポートされ、httpリクエストは自動的にhttpsにリダイレクトされます。
enable_httpsがtrueの場合、fe.confでssl証明書情報を設定する必要があります。

#### `enable_ssl`

デフォルト：true

trueに設定すると、dorisはmysqlとSSLプロトコルに基づく暗号化チャネルを確立します。

#### `qe_max_connection`

デフォルト：1024

FEあたりの最大接続数。

#### `check_java_version`

デフォルト：true

Dorisはコンパイル済みJavaバージョンと実行時Javaバージョンが互換性があるかどうかをチェックし、互換性がない場合、Javaバージョン不一致例外メッセージをスローして起動を終了します

#### `rpc_port`

デフォルト：9020

FE Thriftサーバーポート

#### `thrift_server_type`

この設定はFEのThrift Serviceが使用するサービスモデルを表し、Stringタイプで大文字小文字を区別しません。

このパラメータが'SIMPLE'の場合、'TSimpleServer'モデルが使用されます。これは一般的に本番環境には適さず、テスト用途に限定されます。

パラメータが'THREADED'の場合、'TThreadedSelectorServer'モデルが使用されます。これは非ブロッキングI/Oモデル、つまりマスター・スレーブReactorモデルで、大量の同時接続リクエストにタイムリーに応答でき、ほとんどのシナリオで良好なパフォーマンスを発揮します。

このパラメータが`THREAD_POOL`の場合、`TThreadPoolServer`モデルが使用されます。このモデルはブロッキングI/Oモデルで、スレッドプールを使用してユーザー接続を処理し、同時接続数はスレッドプール数に制限されます。同時リクエスト数を事前に予測でき、十分なスレッドリソースコストを許容できる場合、このモデルはより良いパフォーマンスを発揮します。このサービスモデルがデフォルトで使用されます

#### `thrift_server_max_worker_threads`

デフォルト：4096

thriftサーバーの最大ワーカースレッド数

#### `thrift_backlog_num`

デフォルト：1024

thriftサーバーのbacklog_num。このbacklog_numを増加させる場合、linux /proc/sys/net/core/somaxconn設定よりも大きな値であることを確認してください

#### `thrift_client_timeout_ms`

デフォルト：0

thriftサーバーの接続タイムアウトとソケットタイムアウト設定。

thrift_client_timeout_msの値は読み取りタイムアウトを防ぐため0に設定されています。

#### `thrift_max_message_size`

:::tip Tips
この設定はApache Doris 1.2.4バージョンからサポートされています
:::

デフォルト：100MB

thriftサーバーの（受信）メッセージの最大サイズ（バイト単位）。クライアントが送信するメッセージのサイズがこの制限を超えると、Thriftサーバーはリクエストを拒否して接続を閉じます。結果として、クライアントは「connection has been closed by peer.」エラーに遭遇します。この場合、このパラメータを増加させてみてください。

#### `use_compact_thrift_rpc`

デフォルト：true

クエリプラン構造を送信するために圧縮形式を使用するかどうか。オンにすると、クエリプラン構造のサイズを約50%削減でき、「send fragment timeout」エラーを回避できます。
ただし、一部の高同時実行小クエリシナリオでは、同時実行性が約10%低下する可能性があります。

#### `grpc_max_message_size_bytes`

デフォルト：1G

GRPCクライアントチャネルの初期フローウィンドウサイズを設定するために使用され、最大メッセージサイズにも使用されます。結果セットが大きい場合、この値を増加させる必要があるかもしれません。

#### `max_mysql_service_task_threads_num`

デフォルト：4096

タスクイベントを担当するスレッド数。

#### `mysql_service_io_threads_num`

デフォルト：4

FEがNIOモデルに基づいてMySQLサーバーを起動する際の、IOイベントを担当するスレッド数。

#### `mysql_nio_backlog_num`

デフォルト：1024

mysql nioサーバーのbacklog_num。このbacklog_numを増加させる場合、同時にlinux /proc/sys/net/core/somaxconnファイルの値も増加させる必要があります

#### `broker_timeout_ms`

デフォルト：10000（10s）

デフォルトbroker RPCタイムアウト

#### `backend_rpc_timeout_ms`

FeがBEにrpcリクエストを送信するタイムアウト（ミリ秒）

デフォルト：60000

動的設定可能かどうか：false

Master FEノード固有の設定項目かどうか：true

#### `drop_backend_after_decommission`

デフォルト：false

IsMutable：true

MasterOnly：true

1. この設定は、BEの廃止成功後にシステムがBEを削除するかどうかを制御するために使用されます。trueの場合、BEが正常にオフラインになった後、BEノードは削除されます。falseの場合、BEが正常にオフラインになった後、BEはDECOMMISSION状態のままですが、削除されません。

   この設定は特定のシナリオで役割を果たすことができます。Dorisクラスタの初期状態がBEノードあたり1つのディスクであると仮定します。しばらく実行した後、システムは垂直拡張されました。つまり、各BEノードに2つの新しいディスクが追加されました。DorisはBE内のディスク間のデータバランシングを現在サポートしていないため、初期ディスクのデータ量は常に新しく追加されたディスクのデータ量よりもはるかに多い可能性があります。この時、以下の操作により手動でディスク間バランシングを実行できます：

   1. この設定項目をfalseに設定します。
   2. 特定のBEノードでdecommission操作を実行します。この操作により、BE上のすべてのデータが他のノードに移行されます。
   3. decommission操作が完了した後、BEは削除されません。この時、BEのdecommissionステータスをキャンセルします。その後、データは他のBEノードからこのノードにバランスし始めます。この時、データはBEのすべてのディスクに均等に分散されます。
   4. すべてのBEノードに対して順次ステップ2と3を実行し、最終的にすべてのノードのディスクバランシングの目的を達成します

#### `max_backend_down_time_second`

デフォルト：3600（1時間）

IsMutable：true

MasterOnly：true

backendが*max_backend_down_time_second*の間ダウンしていると、BACKEND_DOWNイベントがトリガーされます。

#### `disable_backend_black_list`

BEブラックリスト機能を無効にするために使用されます。この機能を無効にすると、BEへのクエリリクエストが失敗してもBEはブラックリストに追加されません。
このパラメータは回帰テスト環境に適しており、偶発的なバグによって大量の回帰テストが失敗することを減らします。

デフォルト：false

動的設定可能かどうか：true

Master FEノード固有の設定項目かどうか：false

#### `max_backend_heartbeat_failure_tolerance_count`

BEノードハートビート失敗の最大許容回数。連続したハートビート失敗回数がこの値を超えると、BE状態はdeadに設定されます。
このパラメータは回帰テスト環境に適しており、偶発的なハートビート失敗によって大量の回帰テストが失敗することを減らします。

デフォルト：1

動的設定可能かどうか：true

Master FEノード固有の設定項目かどうか：true

### `abort_txn_after_lost_heartbeat_time_second`

ハートビート喪失後のトランザクション中止時間。デフォルト値は300で、beのトランザクションがハートビート喪失300秒後に中止されることを意味します。

デフォルト：300（s）

動的設定可能かどうか：true

Master FEノード固有の設定項目かどうか：true

#### `enable_access_file_without_broker`

デフォルト：false

IsMutable：true

MasterOnly：true

この設定は、broker経由でbosや他のクラウドストレージにアクセスする際にbrokerをスキップしようとするために使用されます

#### `agent_task_resend_wait_time_ms`

デフォルト：5000

IsMutable：true

MasterOnly：true

この設定は、agent_taskのcreate_timeが設定されている場合にエージェントタスクを再送するかどうかを決定します。current_time - create_time > agent_task_resend_wait_time_msの場合のみ、ReportHandlerがエージェントタスクを再送できます。

この設定は現在主に`PUBLISH_VERSION`エージェントタスクの重複送信問題を解決するために使用されます。この設定の現在のデフォルト値は5000で、これは実験値です。

エージェントタスクをAgentTaskQueueに提出してからbeに提出するまでには一定の時間遅延があるため、この設定の値を増加させることでエージェントタスクの重複送信問題を効果的に解決できます。

しかし同時に、失敗したまたは実行に失敗したエージェントタスクの再実行が長期間延長されることになります

#### `max_agent_task_threads_num`

デフォルト：4096

MasterOnly：true

エージェントタスクスレッドプールでエージェントタスクを処理するスレッドの最大数。

#### `remote_fragment_exec_timeout_ms`

デフォルト：30000（ms）

IsMutable：true

非同期リモートフラグメント実行のタイムアウト。通常の場合、非同期リモートフラグメントは短時間で実行されます。システムが高負荷状態にある場合、このタイムアウトをより長く設定してみてください。

#### `auth_token`

デフォルト：空

内部認証に使用されるクラスタトークン。

#### `enable_http_server_v2`

デフォルト：公式0.14.0バージョンリリース後はデフォルトtrue、それ以前はデフォルトfalse

HTTP サーバー V2はSpringBootで実装されています。フロントエンドとバックエンドを分離したアーキテクチャを使用します。HTTPv2が有効な場合のみ、ユーザーは新しいフロントエンドUIインターフェイスを使用できます。

#### `http_api_extra_base_path`

一部のデプロイメント環境では、ユーザーはHTTP APIの統一プレフィックスとして追加のベースパスを指定する必要があります。このパラメータはユーザーが追加のプレフィックスを指定するために使用されます。
設定後、ユーザーは`GET /api/basepath`インターフェイスを通じてパラメータ値を取得できます。そして新しいUIもまずこのベースパスを取得してURLを組み立てようとします。`enable_http_server_v2`がtrueの場合のみ有効です。

デフォルトは空、つまり未設定

#### `jetty_server_acceptors`

デフォルト：2

#### `jetty_server_selectors`

デフォルト：4

#### `jetty_server_workers`

デフォルト：0

上記3つのパラメータにより、Jettyのスレッドアーキテクチャモデルは非常にシンプルで、acceptors、selectors、workersの3つのスレッドプールに分かれています。Acceptorsは新しい接続の受け入れを担当し、その後selectorsに渡してHTTPメッセージプロトコルのアンパッキングを処理し、最後にworkersがリクエストを処理します。最初の2つのスレッドプールは非ブロッキングモデルを採用し、1つのスレッドで多くのソケットの読み書きを処理できるため、スレッドプール数は少なくて済みます。

ほとんどのプロジェクトでは、1-2個のacceptorsスレッドのみが必要で、2-4個のselectorsスレッドで十分です。Workersは閉塞的なビジネスロジックで、多くのデータベース操作があることが多く、大量のスレッドが必要です。具体的な数はアプリケーションのQPSとIOイベントの割合に依存します。QPSが高いほどより多くのスレッドが必要で、IOの割合が高いほど待機するスレッドが多く、総スレッド数がより多く必要です。

Workerスレッドプールはデフォルトでは設定されておらず、必要に応じて設定してください

#### `jetty_server_max_http_post_size`

デフォルト：`100 * 1024 * 1024`（100MB）

putまたはpostメソッドでアップロードされるファイルの最大バイト数です。デフォルト値：100MB

#### `jetty_server_max_http_header_size`

デフォルト：1048576（1M）

httpヘッダーサイズ設定パラメータ。デフォルト値は1Mです。

#### `http_sql_submitter_max_worker_threads`

デフォルト：2

http sqlサブミッターの最大ワーカースレッド数

#### `http_load_submitter_max_worker_threads`

デフォルト：2

httpアップロードサブミッターの最大ワーカースレッド数

### クエリエンジン

#### `default_max_query_instances`

ユーザープロパティmax_query_instancesが0以下の場合のデフォルト値。この設定はユーザーのインスタンス最大数を制限するために使用されます

```text
current running txns on db xxx is xx, larger than limit xx
```
このエラーが発生した場合、クラスター内で現在実行されているロードジョブが設定値を超えていることを意味します。この時点では、ビジネス側で待機してロードジョブを再試行することを推奨します。

Connectorを使用する場合、このパラメータの値は適切に調整でき、数千であっても問題ありません

#### `using_old_load_usage_pattern`

Default：false

IsMutable：true

MasterOnly：true

trueに設定すると、処理エラーが発生したinsert stmtでも、ユーザーにlabelが返されます。ユーザーはこのlabelを使用してロードジョブのステータスを確認できます。デフォルト値はfalseで、これはinsert操作でエラーが発生した場合、load labelなしでユーザークライアントに直接例外がスローされることを意味します。

#### `disable_load_job`

Default：false

IsMutable：true

MasterOnly：true

これがtrueに設定されている場合

* すべてのpendingロードジョブは、begin txn apiの呼び出し時に失敗します
* すべてのprepareロードジョブは、commit txn apiの呼び出し時に失敗します
* すべてのcommittedロードジョブは公開待ちになります

#### `commit_timeout_second`

Default：30

IsMutable：true

MasterOnly：true

1つのトランザクションでコミットされる前に挿入されたすべてのデータの最大待機時間
これは「commit」コマンドのタイムアウト秒数です

#### `max_unfinished_load_job`

Default：1000

IsMutable：true

MasterOnly：true

PENDING、ETL、LOADING、QUORUM_FINISHEDを含むロードジョブの最大数。この数を超えると、ロードジョブの提出は許可されません

#### `db_used_data_quota_update_interval_secs`

Default：300 (s)

IsMutable：true

MasterOnly：true

1つのmasterデーモンスレッドが、`db_used_data_quota_update_interval_secs`ごとにdbトランザクションマネージャーのデータベース使用データクォータを更新します

データロードパフォーマンスの向上のため、データロード前にデータベースが使用するデータ量がクォータを超えているかどうかのチェックでは、データベースがすでに使用しているデータ量をリアルタイムで計算せず、デーモンスレッドの定期的に更新された値を取得します。

この設定は、データベース使用データ量の値を更新する時間間隔を設定するために使用されます

#### `disable_show_stream_load`

Default：false

IsMutable：true

MasterOnly：true

show stream loadを無効にし、メモリ内のstream loadレコードをクリアするかどうか。

#### `max_stream_load_record_size`

Default：5000

IsMutable：true

MasterOnly：true

メモリに保存できる最新のstream loadレコードのデフォルト最大数。

#### `fetch_stream_load_record_interval_second`

Default：120

IsMutable：true

MasterOnly：true

stream loadレコードの取得間隔。

#### `max_bytes_per_broker_scanner`

Default：`500 * 1024 * 1024 * 1024L`  （500G）

IsMutable：true

MasterOnly：true

1つのbrokerロードジョブでbroker scannerが処理できる最大バイト数。通常、各Backendsには1つのbroker scannerがあります。

#### `default_load_parallelism`

Default: 8

IsMutable：true

MasterOnly：true

単一ノード上のbroker load実行プランのデフォルト並列度。
ユーザーがbroker load提出時に並列度を設定する場合、このパラメータは無視されます。
このパラメータは、`max broker concurrency`、`min bytes per broker scanner`などの複数の設定と合わせて、インポートタスクの並行性を決定します。

#### `max_broker_concurrency`

Default：10

IsMutable：true

MasterOnly：true

broker scannerの最大同時実行数。

#### `min_bytes_per_broker_scanner`

Default：67108864L (64M)

IsMutable：true

MasterOnly：true

単一のbroker scannerが読み取る最小バイト数。

#### `period_of_auto_resume_min`

Default：5 （s）

IsMutable：true

MasterOnly：true

Routine loadの自動復旧サイクル

#### `max_tolerable_backend_down_num`

Default：0

IsMutable：true

MasterOnly：true

1つのBEがダウンしている限り、Routine Loadは自動的に復旧できません

#### `max_routine_load_task_num_per_be`

Default：1024

IsMutable：true

MasterOnly：true

BE当たりの最大同時routine loadタスク数。これはBEに送信されるroutine loadタスク数を制限するためのもので、BEの設定である'max_routine_load_thread_pool_size'（デフォルト1024）より少なくする必要があります。これはBE上のroutine loadタスクスレッドプールサイズです。メジャーバージョン2.1では、バージョン2.1.4以降でデフォルト値は1024です。バージョン2.1.4より前では、デフォルト値は5でした。

#### `max_routine_load_task_concurrent_num`

Default：256

IsMutable：true

MasterOnly：true

単一のroutine loadジョブの最大同時routine loadタスク数。メジャーバージョン2.1では、バージョン2.1.4以降でデフォルト値は256です。バージョン2.1.4より前では、デフォルト値は5でした。

#### `max_routine_load_job_num`

Default：100

NEED_SCHEDULED、RUNNING、PAUSEを含む最大routine loadジョブ数

#### `desired_max_waiting_jobs`

Default：100

IsMutable：true

MasterOnly：true

routine loadおよびバージョン2 loadの待機ジョブのデフォルト数。これは希望する数です。マスターの切り替えなど、一部の状況では、現在の数がdesired_max_waiting_jobsを超える可能性があります。

#### `disable_hadoop_load`

Default：false

IsMutable：true

MasterOnly：true

hadoopクラスターを使用したロードは将来廃止予定です。この種のロードを無効にするにはtrueに設定してください。

#### `enable_spark_load`

Default：false

IsMutable：true

MasterOnly：true

spark loadを一時的に有効にするかどうか、デフォルトでは有効になっていません

**注意：** このパラメータはバージョン1.2で削除され、spark_loadはデフォルトで有効になっています

#### `spark_load_checker_interval_second`

Default：60

Spark loadスケジューラーの実行間隔、デフォルト60秒

#### `async_loading_load_task_pool_size`

Default：10

IsMutable：false

MasterOnly：true

loading_loadタスクエグゼキュータープールサイズ。このプールサイズは、実行中のloading_loadタスクの最大数を制限します。

現在、broker loadのloading_loadタスクのみを制限します

#### `async_pending_load_task_pool_size`

Default：10

IsMutable：false

MasterOnly：true

pending_loadタスクエグゼキュータープールサイズ。このプールサイズは、実行中のpending_loadタスクの最大数を制限します。

現在、broker loadおよびspark loadのpending_loadタスクのみを制限します。

'max_running_txn_num_per_db'より少なくする必要があります

#### `async_load_task_pool_size`

Default：10

IsMutable：false

MasterOnly：true

この設定は古いバージョンとの互換性のためのもので、この設定はasync_loading_load_task_pool_sizeに置き換えられており、将来削除される予定です。

#### `enable_single_replica_load`

Default：false

IsMutable：true

MasterOnly：true

stream loadおよびbroker loadで単一レプリカ書き込みを有効にするかどうか。

#### `min_load_timeout_second`

Default：1 （1s）

IsMutable：true

MasterOnly：true

すべてのタイプのロードに適用される最小stream loadタイムアウト

#### `max_stream_load_timeout_second`

Default: 259200 (3 day)

IsMutable：true

MasterOnly：true

この設定は、stream loadのタイムアウト設定を制限するために特別に使用されます。ユーザーの大きなタイムアウト設定により、失敗したstream loadトランザクションが短時間内にキャンセルできないことを防ぐためです

#### `max_load_timeout_second`

Default: 259200 (3 day)

IsMutable：true

MasterOnly：true

stream loadを除くすべてのタイプのロードに適用される最大ロードタイムアウト

#### `stream_load_default_timeout_second`

Default: 86400 * 3 (3 day)

IsMutable：true

MasterOnly：true

デフォルトのstream loadおよびstreaming mini loadタイムアウト

#### `stream_load_default_precommit_timeout_second`

Default：3600（s）

IsMutable：true

MasterOnly：true

デフォルトのstream loadプリコミットタイムアウト

#### `stream_load_default_memtable_on_sink_node`

Default：false

IsMutable：true

MasterOnly：true

stream loadのデフォルトでsink nodeのmemtableを有効にします。
HTTPヘッダー`memtable_on_sink_node`が設定されていない場合。

#### `insert_load_default_timeout_second`

Default: 3600 (1 hour)

IsMutable：true

MasterOnly：true

デフォルトのinsert loadタイムアウト

#### `mini_load_default_timeout_second`

Default: 3600 (1 hour)

IsMutable：true

MasterOnly：true

デフォルトの非streaming mini loadタイムアウト

#### `broker_load_default_timeout_second`

Default: 14400 (4 hour)

IsMutable：true

MasterOnly：true

デフォルトのbroker loadタイムアウト

#### `spark_load_default_timeout_second`

Default: 86400  (1 day)

IsMutable：true

MasterOnly：true

デフォルトのspark loadタイムアウト

#### `hadoop_load_default_timeout_second`

Default: 86400 * 3   (3 day)

IsMutable：true

MasterOnly：true

デフォルトのhadoop loadタイムアウト

#### `load_running_job_num_limit`

Default：0

IsMutable：true

MasterOnly：true

ロードタスク数の制限、デフォルトは0で制限なし

#### `load_input_size_limit_gb`

Default：0

IsMutable：true

MasterOnly：true

Loadジョブが入力するデータのサイズ、デフォルトは0で無制限

#### `load_etl_thread_num_normal_priority`

Default：10

NORMAL優先度etl loadジョブの並行数。何をしているか分からない場合は変更しないでください。

#### `load_etl_thread_num_high_priority`

Default：3

HIGH優先度etl loadジョブの並行数。何をしているか分からない場合は変更しないでください

#### `load_pending_thread_num_normal_priority`

Default：10

NORMAL優先度pendingロードジョブの並行数。何をしているか分からない場合は変更しないでください。

#### `load_pending_thread_num_high_priority`

Default：3

HIGH優先度pendingロードジョブの並行数。ロードジョブの優先度はHIGHまたはNORMALとして定義されます。すべてのmini batchロードジョブはHIGH優先度で、その他のタイプのロードジョブはNORMAL優先度です。優先度は、遅いロードジョブが長時間スレッドを占有することを避けるために設定されています。これは内部最適化スケジューリングポリシーです。現在、ジョブの優先度を手動で指定することはできません。何をしているか分からない場合は変更しないでください。

#### `load_checker_interval_second`

Default：5 （s）

ロードスケジューラーの実行間隔。ロードジョブはPENDINGからLOADING、FINISHEDへと状態を遷移します。ロードスケジューラーはロードジョブをPENDINGからLOADINGに遷移させ、txnコールバックがロードジョブをLOADINGからFINISHEDに遷移させます。したがって、並行数が上限に達していない場合、ロードジョブは最大で1間隔で完了します。

#### `label_keep_max_second`

Default：`3 * 24 * 3600`  (3 day)

IsMutable：true

MasterOnly：true

完了またはキャンセルされたロードジョブのlabelは`label_keep_max_second`後に削除されます、

1. 削除されたlabelは再利用可能です。
2. 短時間に設定するとFEメモリ使用量が削減されます。（すべてのロードジョブの情報は削除されるまでメモリに保持されるため）

高い並行書き込みの場合、大量のジョブのバックログがありfrontendサービスの呼び出しが失敗した場合は、ログを確認してください。メタデータ書き込みのロックに時間がかかりすぎる場合は、この値を12時間または6時間未満に調整できます

#### `streaming_label_keep_max_second`

Default: 43200 (12 hour)

IsMutable：true

MasterOnly：true

INSERT、STREAMING LOAD、ROUTINE_LOAD_TASKなどの高頻度ロード作業の場合。期限切れになると、完了したジョブまたはタスクを削除します。

#### `label_clean_interval_second`

Default: 1 * 3600  (1 hour)

ロードlabelクリーナーは*label_clean_interval_second*ごとに実行され、期限切れのジョブをクリーンアップします。

#### `label_regex_length`

デフォルト値: 128 (characters)

ロードlabelの最大文字長、デフォルトは128文字です。

#### `transaction_clean_interval_second`

Default：30

トランザクションが可視またはアボートされた場合、transaction_clean_interval_second秒後にトランザクションがクリーンアップされます。この間隔はできるだけ短くし、各クリーンサイクルをできるだけ早く行う必要があります

#### `sync_commit_interval_second`

トランザクションコミットの最大時間間隔。この時間後にまだチャネルに未提出のデータがある場合、コンシューマーはチャネルにトランザクションの提出を通知します。

Default: 10 (seconds)

動的設定可能かどうか: true

Master FEノード固有の設定項目かどうか: true

#### `sync_checker_interval_second`

データ同期ジョブの実行ステータスチェック。

Default: 10 (s)

#### `max_sync_task_threads_num`

データ同期ジョブスレッドプール内のスレッドの最大数。

默认值：10

#### `min_sync_commit_size`

トランザクションをコミットするために満たす必要があるイベントの最小数。Feが受信したイベント数がこれより少ない場合、時間が`sync_commit_interval_second`を超えるまで次のバッチのデータを待ち続けます。デフォルト値は10000イベントです。この設定を変更する場合は、この値がcanal側の`canal.instance.memory.buffer.size`設定（デフォルト16384）より小さいことを確認してください。そうでないと、Feはackするまでにストアよりもキューの長さが長い多くのイベントを取得しようとして、ストアキューがタイムアウトするまでブロックされる原因となります。

Default: 10000

動的設定可能かどうか: true

Master FEノード固有の設定項目かどうか: true

#### `min_bytes_sync_commit`

トランザクションをコミットするために必要な最小データサイズ。Feが受信したデータサイズがこれより小さい場合、時間が`sync_commit_interval_second`を超えるまで次のバッチのデータを待ち続けます。デフォルト値は15MBです。この設定を変更する場合は、この値がcanal側の`canal.instance.memory.buffer.size`と`canal.instance.memory.buffer.memunit`の積（デフォルト16MB）より小さいことを確認してください。そうでないと、ackするまでにFeはストア容量より大きいデータを取得しようとして、ストアキューがタイムアウトするまでブロックされる原因となります。

Default: `15*1024*1024` (15M)

動的設定可能かどうか: true

Master FEノード固有の設定項目かどうか: true

#### `max_bytes_sync_commit`

データ同期ジョブスレッドプール内のスレッドの最大数。FE全体で1つのスレッドプールのみがあり、FE内のすべてのデータ同期タスクでBEにデータを送信するために使用されます。スレッドプールの実装は`SyncTaskPool`クラスにあります。

Default: 10

動的設定可能かどうか: false

Master FEノード固有の設定項目かどうか: false

#### `enable_outfile_to_local`

Default：false

outfile機能がローカルディスクに結果をエクスポートすることを許可するかどうか。

#### `export_tablet_num_per_task`

Default：5

IsMutable：true

MasterOnly：true

エクスポートクエリプランごとのタブレット数

#### `export_task_default_timeout_second`

Default: 2 * 3600   (2 hour)

IsMutable：true

MasterOnly：true

エクスポートジョブのデフォルトタイムアウト。

#### `export_running_job_num_limit`

Default：5

IsMutable：true

MasterOnly：true

実行中のエクスポートジョブの並行数制限。デフォルトは5です。0は無制限です

#### `export_checker_interval_second`

Default：5

エクスポートチェッカーの実行間隔。

### ログ

#### `log_roll_size_mb`

Default：1024  （1G）

1つのsysログとauditログの最大サイズ

#### `sys_log_dir`

Default: DorisFE.DORIS_HOME_DIR + "/log"

これはFEログディレクトリを指定します。FEは2つのログファイルを生成します:

fe.log:      FEプロセスのすべてのログ。
fe.warn.log  FEプロセスのすべてのWARNINGおよびERRORログ。

#### `sys_log_level`

Default：INFO

ログレベル: INFO、WARN、ERROR、FATAL

#### `sys_log_roll_num`

Default：10

sys_log_roll_interval内で保持される最大FEログファイル数。デフォルトは10で、1日に最大10個のログファイルが存在することを意味します

#### `sys_log_verbose_modules`

Default：{}

詳細モジュール。VERBOSEレベルはlog4jのDEBUGレベルで実装されています。

例：
   sys_log_verbose_modules = org.apache.doris.catalog
   これは、パッケージorg.apache.doris.catalogとそのすべてのサブパッケージ内のファイルのデバッグログのみを出力します。

#### `sys_log_roll_interval`

Default：DAY

sys_log_roll_interval:

* DAY:  ログサフィックスは  yyyyMMdd
* HOUR: ログサフィックスは  yyyyMMddHH

#### `sys_log_delete_age`

Default：7d

デフォルトは7日で、ログの最終変更時刻が7日前の場合、削除されます。

サポート形式:

* 7d      7日
* 10h     10時間
* 60m     60分
* 120s    120秒

#### `sys_log_roll_mode`

Default：SIZE-MB-1024

ログ分割のサイズ、1Gごとにログファイルを分割

#### `sys_log_enable_compress`

Default: false

trueの場合、fe.logとfe.warn.logをgzipで圧縮します

#### `audit_log_dir`

Default：DORIS_HOME_DIR + "/log"

audit_log_dir：
これはFE auditログディレクトリを指定します。
auditログfe.audit.logには、ユーザー、ホスト、コスト、ステータスなどの関連情報を持つすべてのリクエストが含まれます

#### `audit_log_roll_num`

Default：90

audit_log_roll_interval内で保持される最大FE auditログファイル数。

#### `audit_log_modules`

Default：{"slow_query", "query", "load", "stream_load"}

slow queryには*qe_slow_log_ms*を超えるすべてのクエリが含まれます

#### `qe_slow_log_ms`

Default: 5000 (5 seconds)

クエリの応答時間がこの閾値を超える場合、slow_queryとしてauditログに記録されます。

#### `audit_log_roll_interval`

Default：DAY

DAY:  ログサフィックスは : yyyyMMdd
HOUR: ログサフィックスは : yyyyMMddHH

#### `audit_log_delete_age`

Default：30d

デフォルトは30日で、ログの最終変更時刻が30日前の場合、削除されます。

サポート形式:
* 7d      7日
* 10h     10時間
* 60m     60分
* 120s    120秒

#### `audit_log_enable_compress`

Default: false

trueの場合、fe.audit.logをgzipで圧縮します

#### `nereids_trace_log_dir`

Default: DorisFE.DORIS_HOME_DIR + "/log/nereids_trace"

nereids traceログのディレクトリを指定するために使用されます

### Storage

#### `min_replication_num_per_tablet`

Default: 1

タブレットごとの最小レプリケーション数を設定するために使用されます。

#### `max_replication_num_per_tablet`

Default: 32767

タブレットごとの最大レプリケーション数を設定するために使用されます。

#### `default_db_data_quota_bytes`

Default：8192PB

IsMutable：true

MasterOnly：true

デフォルトのデータベースデータクォータサイズを設定するために使用されます。単一データベースのクォータサイズを設定するには、次を使用できます：

```
Set the database data quota, the unit is:B/K/KB/M/MB/G/GB/T/TB/P/PB
ALTER DATABASE db_name SET DATA QUOTA quota;
View configuration
show data （Detail：HELP SHOW DATA）
```
#### `default_db_replica_quota_size`

Default: 1073741824

IsMutable：true

MasterOnly：true

デフォルトのデータベースレプリカクォータを設定するために使用されます。単一のデータベースのクォータサイズを設定するには、以下を使用できます：

```
Set the database replica quota
ALTER DATABASE db_name SET REPLICA QUOTA quota;
View configuration
show data （Detail：HELP SHOW DATA）
```
#### `recover_with_empty_tablet`

デフォルト：false

IsMutable：true

MasterOnly：true

コードバグや人的操作ミスなど、非常に特殊な状況において、一部のタブレットのすべてのレプリカが失われることがあります。この場合、データは実質的に失われています。しかし、一部のシナリオでは、データ損失があってもクエリがエラーを報告しないことをビジネスが希望し、ユーザー層の認識を減らしたい場合があります。この時点で、空白のTabletを使用して不足しているレプリカを埋め、クエリが正常に実行できるようにすることができます。

trueに設定すると、Dorisはすべてのレプリカが破損または欠落しているタブレットを空白のレプリカで自動的に埋めます

#### `min_clone_task_timeout_sec` And `max_clone_task_timeout_sec`

デフォルト：最小3分、最大2時間

IsMutable：true

MasterOnly：true

`mix_clone_task_timeout_sec`と協力してクローンタスクの最大および最小タイムアウトを制御できます。通常の状況では、クローンタスクのタイムアウトはデータ量と最小転送速度（5MB/s）によって推定されます。一部の特殊なケースでは、これら2つの設定を使用してクローンタスクタイムアウトの上限と下限を設定し、クローンタスクが正常に完了できるようにすることができます。

#### `disable_storage_medium_check`

デフォルト：false

IsMutable：true

MasterOnly：true

disable_storage_medium_checkがtrueの場合、ReportHandlerはタブレットのストレージメディアをチェックせず、ストレージクールダウン機能を無効にします。デフォルト値はfalseです。タブレットのストレージメディアが何であるかを気にしない場合は、値をtrueに設定できます。

#### `decommission_tablet_check_threshold`

デフォルト：5000

IsMutable：true

MasterOnly：true

この設定は、Master FEが廃止されたBE上のタブレットのステータスをチェックする必要があるかどうかを制御するために使用されます。廃止されたBE上のタブレットのサイズがこの閾値より低い場合、FEは定期的なチェックを開始し、廃止されたBE上のすべてのタブレットがリサイクルされている場合、FEはこのBEを即座にドロップします。

パフォーマンスを考慮して、この設定に非常に高い値を設定しないでください。

#### `partition_rebalance_max_moves_num_per_selection`

デフォルト：10

IsMutable：true

MasterOnly：true

PartitionRebalancerを使用する場合のみ有効、

#### `partition_rebalance_move_expire_after_access`

デフォルト：600   (s)

IsMutable：true

MasterOnly：true

PartitionRebalancerを使用する場合のみ有効。これが変更されると、キャッシュされた移動がクリアされます

#### `tablet_rebalancer_type`

デフォルト：BeLoad

MasterOnly：true

Rebalancerタイプ（大文字小文字を無視）：BeLoad、パーティション。タイプの解析が失敗した場合、デフォルトとしてBeLoadを使用

#### `max_balancing_tablets`

デフォルト：100

IsMutable：true

MasterOnly：true

TabletSchedulerでバランシング中のタブレット数がmax_balancing_tabletsを超える場合、それ以上のバランスチェックは行いません

#### `max_scheduling_tablets`

デフォルト：2000

IsMutable：true

MasterOnly：true

TabletSchedulerでスケジュールされたタブレット数がmax_scheduling_tabletsを超える場合、チェックをスキップします。

#### `disable_balance`

デフォルト：false

IsMutable：true

MasterOnly：true

trueに設定すると、TabletSchedulerはバランスを実行しません。

#### `disable_disk_balance`

デフォルト：true

IsMutable：true

MasterOnly：true

trueに設定すると、TabletSchedulerはディスクバランスを実行しません。

#### `balance_load_score_threshold`

デフォルト：0.1 (10%)

IsMutable：true

MasterOnly：true

クラスターバランススコアの閾値、バックエンドの負荷スコアが平均スコアより10%低い場合、このバックエンドはLOW負荷としてマークされ、負荷スコアが平均スコアより10%高い場合、HIGH負荷がマークされます

#### `capacity_used_percent_high_water`

デフォルト：0.75  (75%)

IsMutable：true

MasterOnly：true

ディスク容量使用率のハイウォーター。これはバックエンドの負荷スコア計算に使用されます

#### `clone_distribution_balance_threshold`

デフォルト：0.2

IsMutable：true

MasterOnly：true

Backendsにおけるレプリカ数のバランス閾値。

#### `clone_capacity_balance_threshold`

デフォルト：0.2

IsMutable：true

MasterOnly：true

* BEにおけるデータサイズのバランス閾値。

   バランスアルゴリズムは：

     1. クラスター全体の平均使用容量（AUC）を計算します。（総データサイズ / 総バックエンド数）

     2. ハイウォーターレベルは（AUC * (1 + clone_capacity_balance_threshold)）

     3. ローウォーターレベルは（AUC * (1 - clone_capacity_balance_threshold)）

     4. Cloneチェッカーは、ハイウォーターレベルのBEからローウォーターレベルのBEにレプリカを移動しようとします。

#### `disable_colocate_balance`

デフォルト：false

IsMutable：true

MasterOnly：true

この設定をtrueに設定すると、自動的なcolocateTableの再配置とバランスを無効にできます。'disable_colocate_balance'がtrueに設定されている場合、ColocateTableBalancerはcolocateTableの再配置とバランスを行いません。

**注意**：

1. 通常の状況では、バランスを完全にオフにする必要はありません。
2. 一度バランスがオフになると、不安定なcolocateTableが復旧されない可能性があるため
3. 最終的にクエリ時にcolocate planが使用できなくなります。

#### `balance_slot_num_per_path`

デフォルト：1

IsMutable：true

MasterOnly：true

バランス中のパスあたりのデフォルトスロット数。

#### `disable_tablet_scheduler`

デフォルト：false

IsMutable：true

MasterOnly：true

trueに設定すると、タブレットスケジューラーが動作しなくなり、すべてのタブレット修復/バランスタスクが動作しなくなります。

#### `enable_force_drop_redundant_replica`

デフォルト：false

動的設定：true

Master FEのみ：true

trueに設定すると、システムはタブレットスケジューリングロジックで冗長レプリカを即座にドロップします。これにより、対応するレプリカに書き込み中の一部のロードジョブが失敗する可能性がありますが、タブレットのバランスと修復速度が向上します。
クラスターにバランスまたは修復を待機している多数のレプリカがある場合、部分的なロード成功率を犠牲にしてレプリカのバランスと修復を高速化するために、この設定を試すことができます。

#### `colocate_group_relocate_delay_second`

デフォルト：1800

動的設定：true

Master FEのみ：true

コロケーショングループの再配置は、クラスター内で多数のタブレットの移動を伴う可能性があります。したがって、コロケーショングループの再配置をできるだけ避けるために、より保守的な戦略を使用すべきです。
再配置は通常、BEノードがオフラインになるかダウンした後に発生します。このパラメータは、BEノードの利用不可判定を遅延させるために使用されます。デフォルトは30分で、つまりBEノードが30分以内に回復した場合、コロケーショングループの再配置はトリガーされません。

#### `allow_replica_on_same_host`

デフォルト：false

動的設定：false

Master FEのみ：false

同じタブレットの複数のレプリカを同じホスト上に配置することを許可するかどうか。このパラメータは主にローカルテスト用で、特定のマルチレプリカ状況をテストするために複数のBEを構築することを容易にします。非テスト環境では使用しないでください。

#### `repair_slow_replica`

デフォルト：false

IsMutable：true

MasterOnly：true

trueに設定すると、コンパクションが遅いレプリカが自動的に検出され、他のマシンに移行されます。検出条件は、最速レプリカのバージョン数が`min_version_count_indicate_replica_compaction_too_slow`の値を超え、最速レプリカとのバージョン数差の比率が`valid_version_count_delta_ratio_between_replicas`の値を超えることです

#### `min_version_count_indicate_replica_compaction_too_slow`

デフォルト：200

動的設定：true

Master FEのみ：false

レプリカコンパクションが遅すぎるかどうかを判断するために使用されるバージョン数閾値

#### `skip_compaction_slower_replica`

デフォルト：true

動的設定：true

Master FEのみ：false

trueに設定すると、クエリ可能レプリカを選択する際にコンパクションが遅いレプリカがスキップされます

#### `valid_version_count_delta_ratio_between_replicas`

デフォルト：0.5

動的設定：true

Master FEのみ：true

最遅レプリカと最速レプリカのバージョン数差の有効比率閾値。`repair_slow_replica`がtrueに設定されている場合、最遅レプリカを修復するかどうかを決定するために使用されます

#### `min_bytes_indicate_replica_too_large`

デフォルト：`2 * 1024 * 1024 * 1024` (2G)

動的設定：true

Master FEのみ：true

レプリカが大きすぎるかどうかを判断するために使用されるデータサイズ閾値

#### `schedule_slot_num_per_hdd_path`

デフォルト：4

hddのタブレットスケジューラーにおけるパスあたりのデフォルトスロット数、この設定を削除し、クローンタスク統計によって動的に調整する

#### `schedule_slot_num_per_ssd_path`

デフォルト：8

ssdのタブレットスケジューラーにおけるパスあたりのデフォルトスロット数、この設定を削除し、クローンタスク統計によって動的に調整する

#### `tablet_repair_delay_factor_second`

デフォルト：60 （s）

IsMutable：true

MasterOnly：true

タブレット修復を決定する前の遅延時間の係数。

* 優先度がVERY_HIGHの場合、即座に修復します。
* HIGH：tablet_repair_delay_factor_second * 1遅延;
* NORMAL：tablet_repair_delay_factor_second * 2遅延;
* LOW：tablet_repair_delay_factor_second * 3遅延;

#### `tablet_stat_update_interval_second`

デフォルト：300（5min）

タブレット統計の更新間隔、
すべてのフロントエンドが各間隔ですべてのバックエンドからタブレット統計を取得します

#### `storage_flood_stage_usage_percent`

デフォルト：95 （95%）

IsMutable：true

MasterOnly：true

##### `storage_flood_stage_left_capacity_bytes`

デフォルト：`1 * 1024 * 1024 * 1024` (1GB)

IsMutable：true

MasterOnly：true

ディスク容量が'storage_flood_stage_usage_percent'と'storage_flood_stage_left_capacity_bytes'に達した場合、以下の操作が拒否されます：

1. loadジョブ
2. restoreジョブ

#### `storage_high_watermark_usage_percent`

デフォルト：85  (85%)

IsMutable：true

MasterOnly：true

#### `storage_min_left_capacity_bytes`

デフォルト： `2 * 1024 * 1024 * 1024`  (2GB)

IsMutable：true

MasterOnly：true

'storage_high_watermark_usage_percent'はBackendストレージパスの最大容量使用率を制限します。'storage_min_left_capacity_bytes'はBackendストレージパスの最小残り容量を制限します。両方の制限に達した場合、このストレージパスはタブレットバランスの宛先として選択できません。しかし、タブレット回復では、データの整合性をできるだけ保つためにこれらの制限を超える場合があります。

#### `catalog_trash_expire_second`

デフォルト：86400L (1 day)

IsMutable：true

MasterOnly：true

データベース（Table/パーティション）をドロップした後、RECOVER文を使用して回復できます。これは最大データ保持時間を指定します。時間経過後、データは永続的に削除されます。

#### `storage_cooldown_second`

:::tip Tips
この機能はApache Doris 2.0バージョン以降非推奨です
:::

デフォルト：`30 * 24 * 3600L`  （30 day）

Table（またはパーティション）作成時に、そのストレージメディア（HDDまたはSSD）を指定できます。SSDに設定した場合、これはタブレットがSSDに留まるデフォルト期間を指定します。その後、タブレットは自動的にHDDに移動されます。CREATE TABLE文でストレージクールダウン時間を設定できます。

#### `default_storage_medium`

デフォルト：HDD

Table（またはパーティション）作成時に、そのストレージメディア（HDDまたはSSD）を指定できます。設定されていない場合、これは作成時のデフォルトメディアを指定します。

#### `enable_storage_policy`

* Storage Policy機能を有効にするかどうか。この設定により、ユーザーはホットデータとコールドデータを分離できます。
デフォルト：false

動的設定可能：true

Master FEノード固有の設定項目：true

#### `check_consistency_default_timeout_second`

デフォルト：600 (10 minutes)

IsMutable：true

MasterOnly：true

単一の一貫性チェックタスクのデフォルトタイムアウト。タブレットサイズに適合するよう十分長く設定してください

#### `consistency_check_start_time`

デフォルト：23

IsMutable：true

MasterOnly：true

一貫性チェック開始時刻

一貫性チェッカーは*consistency_check_start_time*から*consistency_check_end_time*まで実行されます。

2つの時刻が同じ場合、一貫性チェックはトリガーされません。

#### `consistency_check_end_time`

デフォルト：23

IsMutable：true

MasterOnly：true

一貫性チェック終了時刻

一貫性チェッカーは*consistency_check_start_time*から*consistency_check_end_time*まで実行されます。

2つの時刻が同じ場合、一貫性チェックはトリガーされません。

#### `replica_delay_recovery_second`

デフォルト：0

IsMutable：true

MasterOnly：true

レプリカが失敗してからFEがクローンを使用してそれを回復しようとするまでの最小遅延秒数。

#### `tablet_create_timeout_second`

デフォルト：1（s）

IsMutable：true

MasterOnly：true

単一レプリカ作成の最大待機時間。

例：
   #mのタブレットと各タブレットに#nのレプリカを持つTableを作成する場合、
   create tableリクエストはタイムアウトまでに最大(m *n* tablet_create_timeout_second)実行されます。

#### `tablet_delete_timeout_second`

デフォルト：2

IsMutable：true

MasterOnly：true

*tablet_create_timeout_second*と同じ意味ですが、タブレットを削除する際に使用されます。

#### `delete_job_max_timeout_second`

デフォルト：300(s)

Mutable：true

Master only：true

deleteジョブの最大タイムアウト（秒単位）。

#### `alter_table_timeout_second`

デフォルト：86400 * 30 (1 month)

IsMutable：true

MasterOnly：true

ALTER TABLEリクエストの最大タイムアウト。Tableデータサイズに適合するよう十分長く設定してください。

#### `max_replica_count_when_schema_change`

OlapTableがスキーマ変更を行う際に許可される最大レプリカ数。レプリカが多すぎるとFE OOMが発生します。

デフォルト：100000

動的設定可能：true

Master FEノード固有の設定項目かどうか：true

#### `history_job_keep_max_second`

デフォルト：`7 * 24 * 3600` （7 day）

IsMutable：true

MasterOnly：true

スキーマ変更ジョブやrollupジョブなどの特定種類のジョブの最大保持時間。

#### `max_create_table_timeout_second`

デフォルト：60 （s）

IsMutable：true

MasterOnly：true

create table（index）の待機時間が長くなりすぎないよう、最大タイムアウトを設定します。

### External Table

#### `file_scan_node_split_num`

デフォルト：128

IsMutable：true

MasterOnly：false

マルチカタログ並行ファイルスキャンスレッド

#### `file_scan_node_split_size`

デフォルト：`256 * 1024 * 1024`

IsMutable：true

MasterOnly：false

マルチカタログ並行ファイルスキャンサイズ

#### `enable_odbc_mysql_broker_table`

デフォルト：false

IsMutable：true

MasterOnly：false

バージョン2.1以降、ODBC、JDBC、broker外部Tableの作成はサポートしていません。odbcとmysql外部Tableについては、代わりにJDBCTableまたはJDBCカタログを使用してください。brokerTableについては、代わりにTable値関数を使用してください。

#### `max_hive_partition_cache_num`

hiveパーティション用キャッシュの最大数。

デフォルト：100000

動的設定可能：false

Master FEノード固有の設定項目：false

#### `hive_metastore_client_timeout_second`

hive metastoreのデフォルト接続タイムアウト。

デフォルト：10

動的設定可能：true

Master FEノード固有の設定項目：true

#### `max_external_cache_loader_thread_pool_size`

外部メタキャッシュロード用の最大スレッドプールサイズ。

デフォルト：10

動的設定可能：false

Master FEノード固有の設定項目：false

#### `max_external_file_cache_num`

外部Table用に使用するファイルキャッシュの最大数。

デフォルト：100000

動的設定可能：false

Master FEノード固有の設定項目：false

#### `max_external_schema_cache_num`

外部Table用に使用するスキーマキャッシュの最大数。

デフォルト：10000

動的設定可能：false

Master FEノード固有の設定項目：false

#### `external_cache_expire_time_minutes_after_access`

最後のアクセス後にキャッシュ内のデータが期限切れになる時間を設定します。単位は分です。
External Schema CacheとHive パーティション Cacheに適用されます。

デフォルト：1440

動的設定可能：false

Master FEノード固有の設定項目：false

#### `es_state_sync_interval_second`

デフォルト：10

feはes_state_sync_interval_secsごとにes apiを呼び出してesインデックスシャード情報を取得します

### External Resources

#### `dpp_hadoop_client_path`

デフォルト：/lib/hadoop-client/hadoop/bin/hadoop

#### `dpp_bytes_per_reduce`

デフォルト：`100 * 1024 * 1024L` (100M)

#### `dpp_default_cluster`

デフォルト：palo-dpp

#### `dpp_default_config_str`

デフォルト：{
               hadoop_configs : 'mapred.job.priority=NORMAL;mapred.job.map.capacity=50;mapred.job.reduce.capacity=50;mapred.hce.replace.streaming=false;abaci.long.stored.job=true;dce.shuffle.enable=false;dfs.client.authserver.force_stop=true;dfs.client.auth.method=0'
         }

#### `dpp_config_str`

デフォルト：{
               palo-dpp : {
                     hadoop_palo_path : '/dir',
                     hadoop_configs : 'fs.default.name=hdfs://host:port;mapred.job.tracker=host:port;hadoop.job.ugi=user,password'
                  }
      }

#### `yarn_config_dir`

デフォルト：DorisFE.DORIS_HOME_DIR + "/lib/yarn-config"

デフォルトのyarn設定ファイルディレクトリ。yarnコマンドを実行する前に毎回、このパス下に設定ファイルが存在することを確認し、存在しない場合は作成する必要があります。

#### `yarn_client_path`

デフォルト：DORIS_HOME_DIR + "/lib/yarn-client/hadoop/bin/yarn"

デフォルトのyarnクライアントパス

#### `spark_launcher_log_dir`

デフォルト： sys_log_dir + "/spark_launcher_log"

指定されたspark launcherログディレクトリ

#### `spark_resource_path`

デフォルト：none

デフォルトのspark依存関係パス

#### `spark_home_default_dir`

デフォルト：DORIS_HOME_DIR + "/lib/spark2x"

デフォルトのsparkホームディレクトリ

#### `spark_dpp_version`

デフォルト：1.0.0

デフォルトのspark dppバージョン

### Else

#### `tmp_dir`

デフォルト：DorisFE.DORIS_HOME_DIR + "/temp_dir"

temp dirは、バックアップと復元プロセスなど、一部のプロセスの中間結果を保存するために使用されます。このディレクトリ内のファイルは、これらのプロセスが終了した後にクリーンアップされます。

#### `custom_config_dir`

デフォルト：DorisFE.DORIS_HOME_DIR + "/conf"

カスタム設定ファイルディレクトリ

`fe_custom.conf`ファイルの場所を設定します。デフォルトは`conf/`ディレクトリ内です。

一部のデプロイメント環境では、システムアップグレードによって`conf/`ディレクトリが上書きされる場合があります。これにより、ユーザーが変更した設定項目が上書きされることになります。この時、`fe_custom.conf`を別の指定されたディレクトリに保存して、設定ファイルの上書きを防ぐことができます。

#### `plugin_dir`

デフォルト：DORIS_HOME + "/plugins

プラグインインストールディレクトリ

#### `plugin_enable`

デフォルト：true

IsMutable：true

MasterOnly：true

プラグインが有効かどうか、デフォルトで有効

#### `small_file_dir`

デフォルト：DORIS_HOME_DIR/small_files

小さなファイルを保存

#### `max_small_file_size_bytes`

デフォルト：1M

IsMutable：true

MasterOnly：true

SmallFileMgrに保存される単一ファイルの最大サイズ

#### `max_small_file_number`

デフォルト：100

IsMutable：true

MasterOnly：true

SmallFileMgrに保存されるファイルの最大数

#### `enable_metric_calculator`

デフォルト：true

trueに設定すると、メトリックコレクターが定期的にメトリックを収集するためのデーモンタイマーとして実行されます

#### `report_queue_size`

デフォルト： 100

IsMutable：true

MasterOnly：true

この閾値は、FEで蓄積されるレポートタスクが多すぎることを避けるためのもので、OOM例外を引き起こす可能性があります。100のBackendと数千万のレプリカを持つ大規模なDorisクラスターなど、一部では、メタデータの変更（パーティションドロップなど）後にタブレットレポートが数秒かかる場合があります。そして、1つのBackendは1分ごとにタブレット情報をレポートするため、無制限にレポートを受信することは受け入れられません。将来的にタブレットレポートの処理速度を最適化する予定ですが、現在はキューサイズが制限を超えた場合はレポートを破棄します。
   いくつかのオンライン時間コスト：
      1. disk report：0-1 ms
      2. sk report：0-1 ms
      3. tablet report
      4. 10000 replicas：200ms

#### `backup_job_default_timeout_ms`

デフォルト：86400 * 1000  (1 day)

IsMutable：true

MasterOnly：true

バックアップジョブのデフォルトタイムアウト

#### `backup_upload_task_num_per_be`

デフォルト：3

IsMutable：true

MasterOnly：true

バックアッププロセス中に各beに割り当てられるアップロードタスクの最大数、デフォルト値は3です。

#### `restore_download_task_num_per_be`

デフォルト：3

IsMutable：true

MasterOnly：true

復元プロセス中に各beに割り当てられるダウンロードタスクの最大数、デフォルト値は3です。

#### `max_backup_restore_job_num_per_db`

デフォルト：10

この設定は主に各データベースに記録されるバックアップ/復元タスクの数を制御するために使用されます。

#### `max_backup_tablets_per_job`

デフォルト：300000

IsMutable：true

MasterOnly：true

バックアップジョブごとに関与するタブレットの最大数を制御し、メタデータの保存が多すぎることによるFE OOMを避けます。

:::tips TIPS
この設定はApache Doris 2.1.6バージョン以降でサポートされています
:::

#### `enable_quantile_

```
Set the database transaction quota
ALTER DATABASE db_name SET TRANSACTION QUOTA quota;
View configuration
show data （Detail：HELP SHOW DATA）
```
#### `prefer_compute_node_for_external_table`

Default：false

IsMutable：true

MasterOnly：false

trueに設定すると、external tableへのクエリはcompute nodeへ優先的に割り当てられます。compute nodeの最大数は`min_backend_num_for_external_table`によって制御されます。
falseに設定すると、external tableへのクエリは任意のノードに割り当てられます。

#### `min_backend_num_for_external_table`

Default：3

IsMutable：true

MasterOnly：false

`prefer_compute_node_for_external_table`がtrueの場合のみ有効です。compute nodeの数がこの値より少ない場合、external tableへのクエリは一部のmix nodeの取得を試み、総ノード数がこの値に達するよう割り当てます。
compute nodeの数がこの値より大きい場合、external tableへのクエリはcompute nodeのみに割り当てられます。

#### `infodb_support_ext_catalog`

:::tip Tips
この設定はApache Doris 1.2.4バージョン以降でサポートされています
:::

Default: false

IsMutable: true

MasterOnly: false

falseの場合、information_schemaデータベース内のTableからselectを実行する際、
結果には外部カタログ内のTableの情報は含まれません。
これは外部カタログに到達できない場合のクエリ時間を避けるためです。

#### `enable_query_hit_stats`

Default: false

IsMutable: true

MasterOnly: false

クエリヒット統計を有効にするかどうかを制御します。デフォルトはfalseです。

#### `div_precision_increment`

Default: 4

この変数は、`/`演算子で実行される除算演算の結果のスケールを増やす桁数を示します。

#### `enable_convert_light_weight_schema_change`

Default：true

一時的な設定オプション。有効にすると、すべてのolapTableをlight schema changeに自動的に変更するバックグラウンドスレッドが開始されます。変更結果は`show convert_light_schema_change [from db]`コマンドで確認でき、すべてのnon-light schema changeTableの変換結果が表示されます。

#### `disable_local_deploy_manager_drop_node`

Default：true

LocalDeployManagerがノードを削除することを禁止し、cluster.infoファイルのエラーによってノードが削除されることを防ぎます。

#### `mysqldb_replace_name`

Default: mysql

MySQLエコシステムとの互換性を確保するため、Dorisにはmysqlという名前の組み込みデータベースが含まれています。このデータベースがユーザー独自のデータベースと競合する場合は、このフィールドを変更してDoris組み込みMySQLデータベースの名前を別の名前に置き換えてください。

#### `max_auto_partition_num`

Default value: 2000

自動パーティションTableにおいて、ユーザーが誤って大量のパーティションを作成することを防ぐため、OLAPTableごとに許可されるパーティション数は`max_auto_partition_num`です。デフォルトは2000です。
