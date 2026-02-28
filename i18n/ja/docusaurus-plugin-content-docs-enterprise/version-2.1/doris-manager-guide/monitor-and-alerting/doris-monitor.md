---
{
  "title": "Doris Cluster監視",
  "description": "Managerは、Prometheus、Grafana、およびAlertManagerを統合し、Manager内で直接クラスターモニタリングの表示と管理を可能にします。",
  "language": "ja"
}
---
# Doris Cluster Monitoring

Manager は Prometheus、Grafana、AlertManager を統合しており、Manager 内で直接クラスターモニタリングを表示・管理できます。

## クラスターモニタリングの表示

Manager は、クラスターのリアルタイム運用状況を把握するための豊富な事前定義済みモニタリングメトリクスを提供しています。

![monitor](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor/monitor.png)

モニタリングメトリクスの説明は以下の通りです：

| カテゴリー | メトリクス名 | メトリクス説明 |
| :---------------- | :-------------------------- | :--------------------------------------------------- |
| Cluster 概要 | FE Node | クラスター内の FE ノードの総数 |
| | FE Not Alive | クラスター内のオフライン FE ノード数 |
| | Used Capacity | クラスター内の BE の使用領域 |
| | BE Node | クラスター内の BE ノードの総数 |
| | BE Not Alive | クラスター内のオフライン BE ノード数 |
| | Total Capacity | クラスター内の BE の総利用可能ストレージ容量 |
| | FE JVM Heap Use Rate | クラスター内の FE の JVM ヒープ使用率 |
| | BE コンパクション Score | 各 BE のコンパクションスコア |
| | Load Rows Rate | 単位時間内のデータインポート状況 |
| | QPS | 異なる FE の QPS 状況 |
| | 99th Latency | 異なる FE の 99パーセンタイルクエリレイテンシ |
| Host Monitor | CPU Used Rate | ノードの CPU 使用率 |
| | Mem Usage | ノードのメモリ使用サイズ |
| | Mem Used Rate | ノードのメモリ使用率 |
| | I/O Util | 単位時間内のディスク I/O 使用率 |
| | Disk Used Rate | ディスク容量使用率のパーセンテージ |
| | Disk Write Throughput | ディスク書き込みスループット |
| | Disk Read Throughput | ディスク読み取りスループット |
| | Network Outbound Traffic | ゲートウェイのアウトバウンドトラフィック |
| | Network Inbound Traffic | ゲートウェイのインバウンドトラフィック |
| Query Statistic | RPS | 単位時間内の異なる FE のリクエスト/秒 |
| | QPS | 異なる FE の QPS |
| | 99th Latency | 99パーセンタイルクエリレイテンシ |
| | Query Percentile | クエリレイテンシ（異なるパーセンタイル） |
| | Query Error \[1m] | 1分以内のクエリ失敗率 |
| | Connections | 各 FE の接続数 |
| Jobs | Broker Load Job | Broker ロードタスクのステータス分布 |
| | Insert Load Job | Insert タスクのステータス分布 |
| | Routine Load Job | Routine ロードタスクのステータス分布 |
| | Spark Load Job | Spark ロードタスクのステータス分布 |
| | Broker Load Tendency | Broker ロードタスクのステータス傾向 |
| | Insert Load Tendency | Insert タスクのステータス傾向 |
| | Routine Load Tendency | Routine ロードタスクのステータス傾向 |
| | Spark Load Tendency | Spark ロードタスクのステータス傾向 |
| | SC Job | 実行中のスキーマ変更タスク数 |
| | Report Queue Size | マスターノードの Report Queue Size |
| | Rollup Job | 実行中のロールアップタスク数 |
| Transactions | Txn Begin/Success on FE | FE で開始されたトランザクション総数と成功したトランザクション数 |
| | Txn Failed/Reject on FE | 単位時間内の BE トランザクションの失敗率と拒否率 |
| | Publish Task on BE | BE での publish タスクの総数 |
| | Txn Status on FE | 異なる状態のトランザクション数 |
| | Txn Load Bytes/Rows rate | 単位時間内にインポートされたデータの行数とサイズ |
| FE | Max Replayed Journal ID | FE の Journal ID |
| | Edit ログ Size | FE のエディットログサイズ |
| | Image Write | FE でのイメージ書き込み数 |
| | Image Push | FE でのイメージプッシュ数 |
| | Image Counter | FE でのイメージ書き込み数とプッシュ数 |
| | Image Clean | FE イメージクリーンアップの成功・失敗ステータス |
| | Edit log Clean | FE エディットログクリーンアップの成功・失敗ステータス |
| | BDBJE Write | BDBJE の 99パーセンタイル書き込みレイテンシ |
| | BDBJE Read | 単位時間内の BDBJE の読み取り |
| | JVM Heap | FE の JVM ヒープ使用量 |
| | Scheduling Tablets | データバランシングまたは復旧中にスケジュールされるタブレット数 |
| | JVM Old GC | Old GC |
| | JVM Young GC | Young GC |
| | JVM Old | JVM old サイズ |
| | JVM Young | JVM young サイズ |
| | FE Collect コンパクション Score | FE によって収集された各 BE のコンパクションスコア |
| | JVM Non Heap | FE の JVM 非ヒープ使用量 |
| | JVM Threads | JVM スレッド数 |
| BE | Disk Usage | BE のディスク容量使用率 |
| | BE FD Count | BE での FD 使用量 |
| | BE Thread Num | BE でのスレッド分布 |
| | Tablet Meta Read | 単位時間内の BE のメタデータ読み取り状況 |
| | Tablet Meta Write | 単位時間内の BE のメタデータ書き込み状況 |
| | Tablet Distribution | BE でのタブレット分布 |
| | BE コンパクション Base | 単位時間内に BE が実行したベースコンパクションタスクの実行率 |
| | BE コンパクション Cumulate | 単位時間内に BE が実行した累積コンパクションタスクの実行率 |
| | BE Push Bytes | 単位時間内の BE での push_request_write データのサイズ |
| | BE Push Rows | 単位時間内の BE での push_request_write の行数 |
| | BE Scan Bytes | 単位時間内に BE がスキャンしたデータのサイズ |
| | BE Scan Rows | 単位時間内に BE がスキャンした行数 |
| BE Tasks | Finish Task Report | 各 BE で完了したタスクの総数 |
| | Push Task | 各 BE で正常に実行されたプッシュタスク数 |
| | Push Task Cost Time | 各 BE でプッシュタスク実行にかかった時間 |
| | Delete | BE で実行された削除タスクの総数 |
| | Base コンパクション | BE で実行された base_compaction タスクの総数 |
| | Cumulative コンパクション | BE で実行された cumulative_compaction タスクの総数 |
| | Clone | BE で実行されたクローンタスクの総数 |
| | Create Rollup | BE で実行された create_rollup タスクの総数 |
| | Schema Change | BE で実行された schema_change タスクの総数 |
| | Create Tablet | BE で実行された create_tablet タスクの総数 |

## 新しいモニタリングダッシュボードの作成

Manager には2つのモニタリングダッシュボードがあります：

* **Doris Dashboard 概要**：基本的な Doris とホストモニタリング項目を提供する事前定義済み Doris モニタリングダッシュボード。変更不可。

* **Default Custom Doris Dashboard 概要**：変更可能なユーザー定義モニタリングダッシュボード。

新しいダッシュボードを作成する場合、**Default Custom Doris Dashboard 概要** パネルを変更してカスタムダッシュボードを追加できます。

1. **「Default Custom Doris Dashboard 概要」ダッシュボードを選択**

    モニタリングページの左上で、「Default Custom Doris Dashboard 概要」パネルを選択します：

    ![dashboard](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor/dashboard.png)

2. **新しいダッシュボードを複製**

    新しいパネルを複製します。任意のモジュールにドラッグアンドドロップできます：

    ![duplicate-panel](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor/duplicate-panel.png)

3. **複製したパネルを編集**

    パネルを編集します。ルールについては [edit panel](https://grafana.com/docs/grafana/latest/panels-visualizations/panel-editor-overview/) を参照してください。

    ![edit-panel](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor/edit-panel.png)

## クラスターモニタリングの管理

### クラスターモニタリングの有効/無効化

ユーザー設定で「Service 構成」を選択して、モニタリングとアラートサービスを有効または無効にします。

![enable-monitor](/images/enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor/enable-monitor.png)

### モニタリング認証の有効/無効化

Manager v24.0.3 以降、モニタリングコンポーネントの認証はデフォルトで有効になっています。Prometheus、AlertManager、Grafana のアカウントとパスワードを個別に設定できます。`webserver/conf/manager.conf` ファイルで以下の設定を変更できます：

| 設定項目 | タイプ | 説明 |
| :------------------ | :------ | :------------------------------------------------------------------------------------------------------ |
| MONITOR\_AUTH\_ENABLE | BOOLEAN | モニタリング認証を有効または無効にします。デフォルトは TRUE です。 |
| GRAFANA\_USER | STRING | Grafana ユーザー名。現在は 'admin' ユーザーのみサポートしています。 |
| GRAFANA\_PASS | STRING | Grafana パスワード。個別に設定されていない場合、ランダムパスワードが設定されます。 |
| PROMETHEUS\_USER | STRING | Prometheus ユーザー名。デフォルトは 'admin' ユーザーです。 |
| PROMETHEUS\_PASS | STRING | Prometheus パスワード。個別に設定されていない場合、ランダムパスワードが設定されます。 |
| ALERTMANAGER\_USER | STRING | AlertManager ユーザー名。デフォルトは 'admin' です。 |
| ALERTMANAGER\_PASS | STRING | AlertManager パスワード。個別に設定されていない場合、ランダムパスワードが設定されます。 |
