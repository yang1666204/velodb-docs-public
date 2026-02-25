---
{
  "title": "コンパクション",
  "description": "Dorisは、LSM-Treeに類似した構造を通じてデータを書き込みます。",
  "language": "ja"
}
---
# Compaction

DorisはLSM-Treeに類似した構造でデータを書き込み、バックグラウンドでcompactionによって小さなファイルを大きな順序付きファイルに継続的にマージします。Compactionは削除や更新などの操作を処理します。

compaction戦略を適切に調整することで、ロードとクエリの効率を大幅に改善できます。Dorisはチューニング用に以下のcompaction戦略を提供しています：


## Vertical compaction

Vertical compactionはDoris 1.2.2で実装された新しいcompactionアルゴリズムで、大規模で幅の広いテーブルシナリオにおけるcompactionの実行効率とリソースオーバーヘッドを最適化するために使用されます。compactionのメモリオーバーヘッドを効果的に削減し、compactionの実行速度を向上させることができます。テスト結果により、vertical compactionによるメモリ消費量は元のcompactionアルゴリズムの1/10のみで、compaction速度は15%向上することが示されています。

Vertical compactionでは、行ごとのマージがカラムグループごとのマージに変更されます。各マージの粒度がカラムグループに変更され、単一compactionに関与するデータ量が削減され、compaction中のメモリ使用量が減少します。

BE設定：
- `enable_vertical_compaction = true` でvertical compactionを有効にします
- `vertical_compaction_num_columns_per_group = 5` 各カラムグループに含まれるカラム数。テストにより、デフォルトで5カラムのグループの効率とメモリ使用量がより良好です
- `vertical_compaction_max_segment_size` はvertical compaction後のディスクファイルサイズの設定に使用され、デフォルト値は268435456（バイト）です


## Segment compaction

Segment compactionは主に大規模データロードを扱います。Segment compactionはロードプロセス中に動作し、ジョブ内のセグメントをcompactします。これは通常のcompactionやvertical compactionとは異なります。このメカニズムは生成されるセグメント数を効果的に削減し、-238（OLAP_ERR_TOO_MANY_SEGMENTS）エラーを回避できます。

Segment compactionは以下の機能を提供します：
- ロードによって生成されるセグメント数の削減
- compactingプロセスはロードプロセスと並行して実行され、ロード時間を増加させません
- ロード中にメモリ消費と計算リソースは増加しますが、長いロードプロセス全体に均等に分散されるため、増加は比較的少ないです
- segment compaction後のデータは、後続のクエリや通常のcompactionにおいてリソースとパフォーマンスの利点があります

BE設定：
- `enable_segcompaction=true` で有効にします
- `segcompaction_batch_size` はマージの間隔を設定するために使用されます。デフォルト値10は、10個のセグメントファイルごとにsegment compactionがトリガーされることを意味します。10-30の間に設定することを推奨します。値が大きいほど、segment compactionのメモリ使用量が増加します

Segment compactionが推奨される状況：

- 大量のデータのロードがOLAP_ERR_TOO_MANY_SEGMENTS（エラーコード-238）エラーで失敗する場合。この場合、segment compactionを有効にしてロードプロセス中のセグメント数を削減することを推奨します。
- ロードプロセス中に多数の小さなファイルが生成される場合：ロードデータ量は適切であるものの、低いカーディナリティやメモリ制約によってmemtableが早期にフラッシュされることで大量の小さなセグメントファイルが生成され、ロードジョブが失敗する可能性もあります。この場合、この機能を有効にすることを推奨します。
- ロード直後にクエリを実行する場合。ロードが完了したばかりで標準のcompactionが完了していない場合、大量のセグメントファイルが後続のクエリ効率に影響します。ロード直後にクエリが必要な場合、この機能を有効にすることを推奨します。
- ロード後の通常のcompactionの負荷が高い場合：segment compactionは通常のcompactionの負荷の一部をロードプロセスに均等に配分します。この場合、この機能を有効にすることを推奨します。

Segment compactionが推奨されない状況：
- ロード操作自体がメモリリソースを使い切っている場合、さらなるメモリ負荷の増加を避け、ロードジョブの失敗を防ぐため、segment compactionの使用は推奨されません。

実装とテスト結果の詳細については、この[link](https://github.com/apache/doris/pull/12866)を参照してください。

## Single replica compaction

デフォルトでは、複数レプリカのcompactionは独立して実行され、各レプリカがCPUとIOリソースを消費します。Single replica compactionが有効な場合、1つのレプリカのみがcompactionを実行します。その後、他のレプリカはこのレプリカからcompactされたファイルをプルするため、CPUリソースは1回のみ消費され、N - 1回のCPU使用量を節約します（Nはレプリカ数）。

Single replica compactionはテーブルのPROPERTIESで`enable_single_replica_compaction`パラメータによって指定され、デフォルトではfalse（無効）です。有効にするには、パラメータをtrueに設定します。

このパラメータはテーブル作成時に指定するか、後で以下を使用して変更できます：

```sql
ALTER TABLE table_name SET("enable_single_replica_compaction" = "true");
```
## Compaction strategy

compaction strategyは、小さなファイルがいつ、どのファイルがより大きなファイルにマージされるかを決定します。Dorisは現在、テーブルプロパティの`compaction_policy`パラメータで指定される2つのcompaction strategyを提供しています。

### Size-based compaction strategy

size-based compaction strategyはデフォルトのstrategyであり、ほとんどのシナリオに適しています。

```
"compaction_policy" = "size_based"
```
### Time series compaction strategy

time series compaction strategyは、ログや時系列データなどのシナリオに最適化されています。時系列データの時間的局所性を活用し、隣接する時間に書き込まれた小さなファイルをより大きなファイルにマージします。各ファイルはcompactionに一度だけ参加するため、繰り返しcompactionによる書き込み増幅を削減します。

```
"compaction_policy" = "time_series"
```
時系列圧縮戦略は、以下の条件のいずれかが満たされた場合にトリガーされます：
- 未マージファイルのサイズが `time_series_compaction_goal_size_mbytes`（デフォルト1 GB）を超えた場合。
- 未マージファイルの数が `time_series_compaction_file_count_threshold`（デフォルト2000）を超えた場合。
- 最後の圧縮からの経過時間が `time_series_compaction_time_threshold_seconds`（デフォルト1時間）を超えた場合。

これらのパラメータはテーブルのPROPERTIESで設定され、テーブル作成時に指定するか、後で以下を使用して変更できます：

```
ALTER TABLE table_name SET("name" = "value");
```
## Compaction同時実行制御

Compactionはバックグラウンドで実行され、CPUとIOリソースを消費します。リソース消費量は、同時実行compactionスレッド数を調整することで制御できます。

同時実行compactionスレッド数は、BEコンフィグレーションファイルで設定され、以下のパラメータが含まれます：
- `max_base_compaction_threads`: base compactionスレッド数、デフォルトは4です。
- `max_cumu_compaction_threads`: cumulative compactionスレッド数、デフォルトは-1で、これはディスクあたり1スレッドを意味します。
- `max_single_replica_compaction_threads`: single replica compaction時にデータファイルを取得するためのスレッド数、デフォルトは10です。
