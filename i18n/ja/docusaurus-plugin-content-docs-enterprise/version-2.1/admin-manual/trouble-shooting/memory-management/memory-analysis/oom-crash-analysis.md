---
{
  "title": "OOM Killer クラッシュ解析",
  "description": "BEプロセスがクラッシュした後にlog/be.outにエラーメッセージがない場合は、dmesg -Tを実行してください。以下のログが表示された場合、",
  "language": "ja"
}
---
BEプロセスがクラッシュした後に`log/be.out`にエラーメッセージがない場合は、`dmesg -T`を実行してください。以下のログが表示された場合、OOM Killerがトリガーされたことを意味します。`20240718 15:03:59`の時点で、pid 360303のdoris_beプロセスの物理メモリ（anon-rss）が約60 GBであることが確認できます。

```
[Thu Jul 18 15:03:59 2024] Out of memory: Killed process 360303 (doris_be) total-vm:213416916kB, anon-rss:62273128kB, file-rss:0kB, shmem-rss:0kB, UID:0 pgtables:337048kB oom_score_adj:0
```
理想的には、Dorisはオペレーティングシステムの残り利用可能メモリを定期的に検出し、後続のメモリ要求をブロックし、メモリGCをトリガーするなどの一連のアクションを実行して、メモリが不足した際のOOM Killerのトリガーを回避します。しかし、メモリステータスの更新とメモリGCには一定の遅延があり、すべての大きなメモリ要求を完全に捕捉することは困難です。クラスターの負荷が高すぎる場合、依然としてOOM Killerがトリガーされる一定の確率があり、BEプロセスのクラッシュを引き起こします。さらに、プロセスのメモリステータスが異常な場合、メモリGCはメモリを解放できず、プロセスの実際の利用可能メモリの減少を引き起こし、クラスターのメモリ負荷を増大させます。

OOM Killerがトリガーされた場合、まずログに基づいてOOM Killerがトリガーされる前のBEプロセスのメモリステータスとタスク実行を分析し、その後対象を絞ったパラメーター調整を行ってクラスターを安定性に復旧させます。

## OOM Killerがトリガーされる前のメモリログを見つける

OOM Killerがトリガーされた場合、プロセスの利用可能メモリが不足していることを意味します。[Memory ログ Analysis](./memory-log-analysis.md)を参照して、`be/log/be.INFO`でOOM Killerがトリガーされた時点で下から上に最後に印刷された`Memory Tracker 要約`キーワードを見つけ、BEプロセスの主要なメモリ位置を分析します。

> `less be/log/be.INFO`でファイルを開いた後、まずOOM Killerがトリガーされた時刻に対応するログにジャンプします。上記の`dmesg -T`の結果を例に取ると、`/20240718 15:03:59`を入力してEnterを押し、対応する時刻を検索します。見つからない場合は、OOM Killerがトリガーされた時刻に多少のずれがある可能性があります。`/20240718 15:03:`を検索できます。ログが対応する時刻にジャンプした後、`/Memory Tracker 要約`を入力してEnterを押してキーワードを検索します。デフォルトでは、ログ内で下方向に検索します。見つからないか時刻が一致しない場合は、`shift + n`を押して上方向に検索し、最後に印刷された`Memory Tracker 要約`と同時に印刷された`Process Memory 要約`メモリログを見つける必要があります。

## 過度なクラスターメモリ負荷がOOM Killerをトリガー

以下の現象が満たされる場合、クラスターメモリ負荷が高すぎることが原因で、特定の瞬間にプロセスメモリステータスが適時に更新されず、メモリGCが適時にメモリを解放できず、BEプロセスメモリの効果的な制御に失敗したと考えられます。

> Doris 2.1以前では、Memory GCが完璧ではなく、メモリが常に逼迫している状況では、OOM Killerをトリガーしやすい状況がありました。

- `Memory Tracker 要約`の分析により、クエリやその他のタスク、各種キャッシュ、メタデータなどのメモリ使用量が妥当であることが判明。

- 対応する時間帯のBEプロセスメモリモニタリングで、メモリ使用率が長時間高レベルで維持され、メモリリークの兆候がない

- `be/log/be.INFO`でOOM Killer時点の前のメモリログを特定し、下から上に`GC`キーワードを検索し、BEプロセスが頻繁にメモリGCを実行していることを確認。

この時、BE 構成 Itemsを参照して`be/conf/be.conf`の`mem_limit`を削減し、`max_sys_mem_available_low_water_mark_bytes`を増加させます。メモリ制限、ウォーターマーク計算方法、メモリGCの詳細については、[Memory Control Strategy](./../memory-feature/memory-control-strategy.md)を参照してください。

さらに、`memory_gc_sleep_time_ms`、`soft_mem_limit_frac`、`memory_maintenance_sleep_time_ms`、`process_minor_gc_size`、`process_full_gc_size`、`enable_query_memory_overcommit`、`thread_wait_gc_max_milliseconds`などを含む、メモリステータス更新とGCを制御する他のパラメーターを調整できます。

## 一部の異常な問題がOOM Killerをトリガー

クラスターメモリ負荷が高すぎる場合、この時メモリステータスが異常になる可能性があり、メモリGCが適時にメモリを解放できない場合があります。以下は、OOM Killerをトリガーする一般的な異常な問題です。

### Memory Tracker統計の欠落

ログ`Memory Tracker 要約`の`Label=process resident memory` Memory Trackerと`Label=sum of all trackers` Memory Trackerの差が大きい場合、またはOrphan Memory Trackerの値が大きすぎる場合、Memory Trackerに統計の欠落があることを意味します。[Memory Tracker](./../memory-feature/memory-tracker.md)の[Memory Tracker Statistics Missing]セクションを参照してさらに分析してください。

### Query Cancelの停止

`be/log/be.INFO`ログでOOM Killerの時点を特定し、コンテキストで`Memory Tracker 要約`を検索してプロセスメモリ統計ログを見つけます。`Memory Tracker 要約`で大量のメモリを使用しているクエリがある場合、`grep {queryID} be/log/be.INFO`を実行して`Cancel`キーワードを含むログがあるかを確認します。対応する時点がクエリがキャンセルされた時刻です。クエリがキャンセルされており、クエリがキャンセルされた時点とOOM Killerがトリガーされた時点が長時間離れている場合、[Memory Problem FAQ](../../../trouble-shooting/memory-management/memory-issue-faq)の[Query Cancel process stuck]の分析を参照してください。`Memory Tracker 要約`の分析については、[Memory ログ Analysis](./memory-log-analysis.md)を参照してください。

### Jemalloc Metadataの大きなメモリ使用量

Memory GCは現在Jemalloc Metadataを解放できません。[Memory Tracker](./../memory-feature/memory-tracker.md)の`Label=tc/jemalloc_metadata` Memory Trackerの分析を参照してメモリ使用量を削減してください。

### Jemalloc Cacheの大きなメモリ使用量

> Doris 2.0で一般的

Doris 2.0の`be.conf`の`JEMALLOC_CONF`の`lg_tcache_max`のデフォルト値は20で、一部のシナリオでJemalloc Cacheが大きくなりすぎて自動的に解放されない原因となります。[Jemalloc Memory Analysis](./jemalloc-memory-analysis.md)を参照してJemalloc Cacheのメモリ使用量を削減してください。
