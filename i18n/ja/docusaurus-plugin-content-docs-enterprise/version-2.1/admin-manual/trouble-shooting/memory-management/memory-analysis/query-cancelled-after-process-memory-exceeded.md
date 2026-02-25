---
{
  "title": "クエリエラー Process Memory Not Enough",
  "description": "クエリのエラーメッセージにMEMLIMITEXCEEDEDが表示され、Process memory not enoughが含まれている場合、",
  "language": "ja"
}
---
`MEM_LIMIT_EXCEEDED` がクエリのエラーメッセージに表示され、`Process memory not enough` が含まれている場合、利用可能メモリ不足によりプロセスがキャンセルされたことを意味します。

まず、エラーメッセージを解析してCancelの理由、Canceled時のクエリ自体が使用しているメモリサイズ、プロセスのメモリ状況を確認します。通常、クエリのCancelには3つの理由があります：

1. CanceledされたQuery自体のメモリが大きすぎる。

2. CanceledされたQuery自体のメモリは小さく、より大きなメモリを持つ他のクエリが存在する。

3. グローバルで共有されているCahce、メタデータなどのメモリが大きすぎる、またはクエリやロードタスク以外の他のタスクのメモリが大きすぎる

## エラーメッセージ解析

プロセスの利用可能メモリが不足する場合は2つの状況があります。1つは現在のプロセスのメモリが設定されたメモリ制限を超えている場合、もう1つはシステムの残り利用可能メモリがwatermarkを下回っている場合です。クエリなどのタスクをキャンセルするパスは3つあります：

- エラーメッセージに `cancel top memory used` が含まれている場合、メモリFull GCでタスクがキャンセルされたことを意味します。

- エラーメッセージに `cancel top memory overcommit` が含まれている場合、メモリMinor GCでタスクがキャンセルされたことを意味します。

- エラーメッセージに `Allocator sys memory check failed` が含まれている場合、`Doris Allocator` からのメモリ申請に失敗してタスクがキャンセルされたことを意味します。

以下のエラーメッセージを解析した後：

- クエリやload自体が使用しているメモリがプロセスメモリの大きな割合を占めている場合、[Query own memory is too large] を参照してクエリやloadのメモリ使用量を解析し、パラメータの調整やSQLの最適化により実行に必要なメモリを削減してください。

- タスク自体が使用しているメモリが非常に少ない場合、[Process memory other than query and load is too large] を参照してプロセス内の他の箇所のメモリ使用量を削減し、クエリや他のタスク実行のためのメモリを確保してください。

メモリ制限、watermark計算方法、メモリGCの詳細については、[Memory Control Strategy](./../memory-feature/memory-control-strategy.md) を参照してください

### 1 メモリFull GCでのキャンセル

BEプロセスメモリがプロセスメモリ上限（MemLimit）を超えるか、システムの残り利用可能メモリがメモリ低watermark（LowWaterMark）を下回った場合、Full GCがトリガーされます。この時、最大メモリを持つタスクが最初にキャンセルされます。

```sql
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.8)[MEM_LIMIT_EXCEEDED]Process memory not enough, cancel top memory used query: <Query#Id=e862471398b14e71-9361a1ab8153cb29> consumption 866.97 MB, backend 10.16.10.8, process memory used 3.12 GB exceed limit 3.01 GB or sys available memory 191.25 GB less than low water mark 3.20 GB. Execute again after enough memory, details see be.INFO.
```
エラーメッセージ分析：

1. `(10.16.10.8)`: クエリ実行中にメモリ不足が発生したBEノード。

2. `query: <Query#Id=e862471398b14e71-9361a1ab8153cb29> consumption 866.97 MB`: 現在キャンセルされたqueryID、クエリ自体は866.97 MBのメモリを使用している。

3. `process memory used 3.12 GB exceed limit 3.01 GB or sys available memory 191.25 GB less than low water mark 3.20 GB` プロセスメモリが制限を超えた理由は、BEプロセスが使用している物理メモリ3.12 GBがMemLimitの3.01 GBを超えているためです。現在のオペレーティングシステムには、BEが使用可能なメモリが191.25 GB残っており、これはLowWaterMarkの3.20 GBよりも依然として高い値です。

### 2 メモリのMinor GCでキャンセル

Doris BEプロセスメモリがプロセスメモリソフトリミット（SoftMemLimit）を超えるか、システムの残り利用可能メモリがメモリ警告水位（WarningWaterMark）を下回る場合、Minor GCがトリガーされます。この時、メモリ制限比率が最も大きいクエリが最初にキャンセルされます。

```sql
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.8)[MEM_LIMIT_EXCEEDED]Process memory not enough, cancel top memory overcommit query: <Query#Id=e862471398b14e71-9361a1ab8153cb29> consumption 866.97 MB, backend 10.16.10.8, process memory used 2.12 GB exceed soft limit 2.71 GB or sys available memory 3.25 GB less than warning water mark 6.40 GB. Execute again after enough memory, details see be.INFO.
```
エラーメッセージ分析: `process memory used 3.12 GB exceed soft limit 6.02 GB or sys available memory 3.25 GB less than warning water mark 6.40 GB` プロセスメモリが制限を超える理由は、現在のオペレーティングシステムでBEが利用可能な残りメモリが3.25 GBであり、WarningWaterMarkの6.40 GBを下回っており、BEプロセスが使用する物理メモリが2.12 GBでSoftMemLimitの2.71 GBを超えていないためです。

### 3 Allocatorからのメモリ割り当てに失敗

Doris BEの大容量メモリリクエストは`Doris Allocator`を通じて割り当てられ、割り当て中にメモリサイズがチェックされます。プロセスに十分な利用可能メモリがない場合、例外がスローされ、現在のクエリのキャンセルが試行されます。

```sql
ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.8)[MEM_LIMIT_EXCEEDED]PreCatch error code:11, [E11] Allocator sys memory check failed: Cannot alloc:4294967296, consuming tracker:<Query#Id=457efb1fdae74d3 b-b4fffdcfd4baaf32>, peak used 405956032, current used 386704704, exec node:<>, process memory used 2.23 GB exceed limit 3.01 GB or sys available memory 181.67 GB less than low water mark 3.20 GB.
```
Error message解析:

1. `consuming tracker:<Query#Id=457efb1fdae74d3b-b4fffdcfd4baaf32>, peak used 405956032, current used 386704704, exec node:VAGGREGATION_NODE (id=7)>`：現在キャンセルされているqueryID、このクエリは現在386704704 Bytesのメモリを使用しており、クエリメモリのピークは405956032 Bytes、実行されているオペレータは`VAGGREGATION_NODE (id=7)>`です。

2. `Cannot alloc:4294967296`：現在の4 GBメモリ申請が失敗しました。現在のプロセスメモリ2.23 GBに4 GBを加えるとMemLimitの3.01 GBを超えるためです。

## CanceledされたQueryのメモリ使用量が大きすぎる場合

[Query Memory Analysis](./query-memory-analysis.md)または[Load Memory Analysis](./load-memory-analysis.md)を参照してクエリとロードのメモリ使用量を分析し、パラメータの調整やSQLの最適化により実行に必要なメモリを削減するようにしてください。

タスクがAllocatorからのメモリ申請に失敗してCanceledされた場合、`Cannot alloc`または`try alloc`では現在Queryが申請しているメモリが大きすぎることを示していることに注意が必要です。この時、ここでのメモリ申請が合理的かどうかに注意を払う必要があります。`be/log/be.INFO`で`Allocator sys memory check failed`を検索してメモリ申請のスタックを見つけてください。

## CanceledされたQuery自体のメモリは小さく、他により大きなメモリを使用するクエリがある場合

通常、より大きなメモリを使用するクエリがCancel段階で停止し、メモリを適時に解放できないことが原因です。Full GCはまずメモリ使用量順にクエリをキャンセルし、次にメモリ使用量順にロードをキャンセルします。メモリFull GCでクエリがキャンセルされたが、BEプロセス内に現在キャンセルされたクエリよりも多くのメモリを使用する他のクエリがある場合、これらのより大きなメモリ使用量を持つクエリがキャンセル処理中に停止していないかに注意を払う必要があります。

まず`grep {queryID} be/log/be.INFO`を実行してクエリがキャンセルされた時刻を見つけ、次にコンテキスト内で`Memory Tracker Summary`を検索してプロセスメモリ統計ログを見つけます。`Memory Tracker Summary`でより多くのメモリを使用するクエリがある場合、`grep {queryID with larger memory} be/log/be.INFO`を実行して`Cancel`キーワードのログがあるかを確認します。対応する時点がクエリがキャンセルされた時刻です。そのクエリもキャンセルされており、より大きなメモリを持つクエリがキャンセルされた時点が現在のクエリがキャンセルされた時点と異なる場合は、[Memory Issue FAQ](../../../trouble-shooting/memory-management/memory-issue-faq)の[Query Cancel process stuck]を参照して、より大きなメモリを持つクエリがキャッシュ処理で停止していないかを分析してください。`Memory Tracker Summary`の分析については、[Memory Log Analysis](./memory-log-analysis.md)を参照してください。

## queryとloadタスク以外のプロセスメモリが大きすぎる場合

メモリ位置を特定し、メモリ使用量を減らしてqueryとload実行のためにより多くのメモリを確保することを検討してください。

利用可能メモリ不足によりタスクがキャンセルされた時刻は、`be/log/be.INFO`のプロセスメモリ統計ログで確認できます。`grep queryID be/log/be.INFO`を実行してクエリがキャンセルされた時刻を見つけ、次にコンテキスト内で`Memory Tracker Summary`を検索してプロセスメモリ統計ログを見つけます。その後、[Memory Log Analysis](./memory-log-analysis.md)の[Process Memory Statistics Log Analysis]セクションを参照してさらなる分析を行ってください。分析前に、[Memory Tracker](./../memory-feature/memory-tracker.md)の[Memory Tracker Statistics Missing]セクションを参照してMemory Trackerに統計の欠落があるかを分析してください。

Memory Trackerに統計の欠落がある場合は、[Memory Tracker Statistics Missing]セクションを参照してさらなる分析を行ってください。そうでなければ、Memory Trackerはメモリの大部分をカウントしており、統計の欠落はありません。[Overview](./../overview.md)を参照してDoris BEプロセスの異なる部分がメモリを過度に占有する理由とそのメモリ使用量を削減する方法を分析してください。
