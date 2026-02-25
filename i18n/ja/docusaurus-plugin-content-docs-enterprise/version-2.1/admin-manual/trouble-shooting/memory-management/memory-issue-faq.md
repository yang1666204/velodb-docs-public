---
{
  "title": "メモリ問題 FAQ",
  "description": "Doris BEプロセスのメモリ分析は、主にbe/log/be.INFOログ、BEプロセスのメモリ監視（Metrics）、Doris Bvar統計を使用します。",
  "language": "ja"
}
---
Doris BEプロセスのメモリ解析では主に`be/log/be.INFO`ログ、BEプロセスのメモリモニタリング（Metrics）、Doris Bvar統計を使用します。OOM Killerがトリガーされた場合は、`dmesg -T`の実行結果を収集する必要があります。クエリやロードタスクのメモリを解析する場合は、Query Profileを収集する必要があります。この情報に基づいて一般的なメモリ問題を解析します。自分で問題を解決できない場合は、Doris開発者に助けを求める必要があります。どの方法を使用する場合でも（GitHubでのissue提出、Dorisフォーラムでのissue作成、メールまたはWeChat）、上記の情報を問題の説明に追加してください。

まず、現在観察されている現象がどのメモリ問題に該当するかを特定し、さらに調査します。通常、最初にプロセスメモリログを解析する必要があります。[Memory Log Analysis](./memory-analysis/memory-log-analysis.md)を参照してください。一般的なメモリ問題を以下に列挙します。

## 1 クエリとロードのメモリ制限エラー

クエリとロードのエラーメッセージに`MEM_LIMIT_EXCEEDED`が表示された場合、プロセスで利用可能なメモリが不足しているか、タスクが単一実行のメモリ制限を超えたため、タスクがキャンセルされたことを意味します。

```sql
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.8)[MEM_LIMIT_EXCEEDED] xxxx .
```
エラーメッセージに`Process memory not enough`が含まれている場合、プロセスの利用可能メモリが不足していることを意味します。詳細な分析については、[Query or load error process has insufficient available memory](./memory-analysis/query-cancelled-after-process-memory-exceeded.md)を参照してください。

エラーメッセージに`memory tracker limit exceeded`が表示される場合、タスクが単一実行メモリ制限を超えていることを意味します。詳細な分析については、[Query or load error exceeds single execution memory limit](./memory-analysis/query-cancelled-after-query-memory-exceeded.md)を参照してください。

## 2 Doris BE OOMクラッシュ

BEプロセスがクラッシュした後に`log/be.out`にエラーメッセージがない場合は、`dmesg -T`を実行してください。`Out of memory: Killed process {pid} (doris_be)`が表示される場合、OOM Killerがトリガーされたことを意味します。詳細な分析については、[OOM Killer Crash Analysis](./memory-analysis/oom-crash-analysis.md)を参照してください。

## 3 メモリリーク

> メモリリークの疑いがある場合、最良の解決策は最新の3桁バージョンにアップグレードすることです。Doris 2.0を使用している場合は、Doris 2.0.xの最新バージョンにアップグレードしてください。他の人が同じ現象に遭遇している可能性が高く、ほとんどのメモリリークはバージョン反復で修正されています。

以下の現象が観察された場合、メモリリークの可能性があることを意味します：

- Doris GrafanaまたはサーバーモニタリングでDoris BEプロセスのメモリが線形に増加し続けていることが判明し、クラスター上のタスクが停止した後もメモリが減少しない。

- Memory Trackerに統計の欠落がある場合は、分析のために[Memory Tracker](./memory-feature/memory-tracker.md)を参照してください。

メモリリークは通常Memory Trackerの統計欠落を伴うため、分析方法も[Memory Tracker]セクションを参照してください。

## 4 Doris BEプロセスメモリが減少しないか継続して増加する

Doris GrafanaまたはサーバーモニタリングでDoris BEプロセスのメモリが線形に増加し続けており、クラスター上のタスクが停止した後もメモリが減少しない場合、まず[Memory Tracker](./memory-feature/memory-tracker.md)の[Memory Tracker](./memory-feature/memory-tracker.md)を参照して、Memory Trackerに統計の欠落があるかどうかを分析してください。Memory Trackerに統計の欠落がある場合は、原因をさらに分析してください。

Memory Trackerに統計の欠落がなく、メモリの大部分をカウントしている場合は、[Overview](./overview.md)を参照して、Doris BEプロセスの異なる部分が過度にメモリを占有する理由とそのメモリ使用量を削減する方法を分析してください。

## 5 大きな仮想メモリ使用量

`Label=process virtual memory` Memory Trackerは、リアルタイムの仮想メモリサイズを表示します。これは`top -p {pid}`で表示されるDoris BEプロセスの仮想メモリと同じです。

```
MemTrackerLimiter Label=process virtual memory, Type=overview, Limit=-1.00 B(-1 B), Used=44.25 GB(47512956928 B), Peak=44.25 GB(47512956928 B)
```
Dorisは現在もDoris BEプロセスの仮想メモリが大きすぎるという問題を抱えています。これは通常、Jemallocが大量の仮想メモリマッピングを保持するためであり、Jemalloc Metadataが過度にメモリを占有する原因にもなります。Jemalloc Metadataメモリの分析については、[Jemalloc Memory Analysis](./memory-analysis/jemalloc-memory-analysis.md)を参照してください。

さらに、DorisのJoin OperatorとColumnにメモリ再利用機能が不足していることが知られており、これにより一部のシナリオでより多くの仮想メモリが要求され、最終的にJemalloc Retainedにキャッシュされます。現在、良い解決策はありません。Doris BEプロセスを定期的に再起動することを推奨します。

## 6 BEプロセス開始直後にプロセスメモリが非常に大きい

これは通常、BEプロセス開始時に読み込まれるメタデータメモリが大きすぎるためです。Doris BE Bvarを確認するには、[Metadata Memory Analysis](./memory-analysis/metadata-memory-analysis.md)を参照してください。

- `doris_total_tablet_num`が多すぎる場合、通常はテーブルのパーティション数とバケット数が大きすぎることが原因です。`{fe_host}:{fe_http_port}/System?path=//dbs`を確認して、多数のタブレットを持つテーブルを見つけてください。テーブルのタブレット数は、パーティション数にバケット数を掛けた値と等しくなります。パーティション数とバケット数を減らしてみてください。または、使用されない古いテーブルやパーティションを削除してください。

- `doris_total_rowset_num`が大きいが、タブレット数が少ない場合は、`SHOW-PROC`ドキュメントを参照して、rowsetが多くタブレットが少ないテーブルを見つけ、手動でcompactionをトリガーするか、自動compactionの完了を待ってください。詳細は、メタデータ管理関連のドキュメントを参照してください。数十万のrowsetがある場合、メタデータが数GBを占有することは正常です。

- `tablet_meta_schema_columns_count`が大きく、`doris_total_tablet_schema_num`より数百倍または数千倍大きい場合、クラスター内に数百または数千のカラムを持つ大きなワイドテーブルが存在することを意味します。この場合、同じ数のタブレットがより多くのメモリを占有します。

## 7 クエリに複雑な演算子がなく、単純にデータをスキャンしているだけなのに、多くのメモリを使用する

Segmentを読み取る際に開かれるColumn ReaderとIndex Readが占有するメモリである可能性があります。Doris BE Bvarの`doris_total_segment_num`、`doris_column_reader_num`、`doris_ordinal_index_memory_bytes`、`doris_zone_map_memory_bytes`、`doris_short_key_index_memory_bytes`の変化を確認するには、[Metadata Memory Analysis](./memory-analysis/metadata-memory-analysis.md)を参照してください。この現象は、大きなワイドテーブルを読み取る際にも一般的です。数十万のColumn Readerが開かれると、メモリは数十GBを占有する可能性があります。

Heap Profileでメモリ使用量が大きいコールスタック内に`Segment`と`ColumnReader`フィールドが見られる場合、Segmentを読み取る際に大量のメモリが占有されていることが基本的に確認できます。

この場合は、スキャンするデータ量を減らすようにSQLを修正するか、テーブル作成時に指定するバケットサイズを小さくして、開くセグメント数を少なくするしかありません。

## 8. Query Cancelがスタックする

> Doris 2.1.3より前によくある問題

クエリ実行中に要求されるメモリの大部分は、クエリ終了時に解放される必要があります。プロセスメモリが十分な場合、通常はクエリ終了の速度について気にする必要はありません。しかし、プロセスメモリが不十分な場合、プロセスがOOM Killerをトリガーしないよう、特定の戦略に従ってクエリがキャンセルされ、メモリが解放されることがよくあります。この時、クエリのキャンセルプロセスがスタックし、メモリが適時に解放されない場合、OOM Killerをトリガーするリスクが増加するだけでなく、プロセスメモリ不足により更に多くのクエリがキャンセルされる可能性もあります。

クエリがキャンセルされることが分かっている場合、以下はこのQueryIDに基づいて、キャンセルプロセスでスタックしているかを分析する方法です。まず、`grep {queryID} be/log/be.INFO`を実行して、`Cancel`キーワードを含む最初のログを見つけてください。対応する時点がクエリがキャンセルされた時刻です。`deregister query/load memory tracker`キーワードを含むログを見つけてください。対応する時点がクエリキャンセルが完了した時刻です。最終的にOOM Killerがトリガーされ、`deregister query/load memory tracker`キーワードを含むログが見つからない場合、OOM Killerが発生するまでクエリがキャンセルされていないことを意味します。通常、クエリキャンセルプロセスが3秒以上かかる場合、クエリはキャンセルプロセスでスタックしており、クエリ実行ログの詳細な分析が必要です。

さらに、`grep {queryID} be/log/be.INFO`を実行した後、`tasks is being canceled and has not been completed yet`キーワードを含むログが表示された場合、その後のQueryIDリストは、Memory GC実行時にこれらのクエリがキャンセル中だが完了していないことが検出されたことを意味します。この時、これらのクエリはスキップされ、他の場所でメモリの解放が継続されます。これはMemory GCの動作が期待通りかどうかを判断するのに使用できます。
