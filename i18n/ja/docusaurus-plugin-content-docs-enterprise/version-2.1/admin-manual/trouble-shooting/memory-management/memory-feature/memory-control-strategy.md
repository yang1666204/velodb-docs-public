---
{
  "title": "メモリ制御戦略",
  "description": "Doris Allocatorは、システム内の大容量ブロックメモリアプリケーションの統一エントリポイントです。",
  "language": "ja"
}
---
Doris Allocatorは、システムにおける大きなブロックメモリアプリケーションの統一エントリポイントです。適切なタイミングでメモリ割り当てを制限するプロセスに介入し、効率的で制御可能なメモリアプリケーションを保証します。

Doris MemoryArbitratorは、Doris BEプロセスのメモリ使用量をリアルタイムで監視し、定期的にメモリステータスを更新してメモリ関連の統計のスナップショットを収集するメモリアービトレーターです。

Doris MemoryReclamationは、利用可能なメモリが不足した際にメモリGCをトリガーしてメモリの一部を回収し、クラスター上でのほとんどのタスク実行の安定性を保証するメモリ回収器です。

## Doris Allocator

![Memory Management 概要](/images/memory-management-overview.png)

Allocatorはシステムからメモリを要求し、MemTrackerを使用してアプリケーションプロセス中のメモリアプリケーションとリリースのサイズを追跡します。オペレーターをバッチで実行するために必要な大きなメモリは、異なるデータ構造によって管理されます。

クエリ実行プロセス中、大きなメモリブロックの割り当ては主にArena、HashTable、PODArrayのデータ構造によって管理されます。AllocatorはArena、PODArray、HashTableの統一メモリインターフェースとして機能し、統一されたメモリ管理とローカルメモリ再利用を実現します。

![Memory Allocator](/images/memory-allocator.png)

Allocatorは汎用メモリアロケーターを使用してメモリを要求します。JemallocとTCMallocの選択において、DorisではこれまでTCMallocのCentralFreeListのSpin Lockが高並行性テストでクエリ全体の40%を占めていました。aggressive memory decommitをオフにすることで効果的にパフォーマンスを改善できますが、多くのメモリを浪費します。このため、TCMallocキャッシュを定期的にリサイクルするために別個のスレッドを使用する必要があります。Jemallocは高並行性環境でTCMallocを上回り、成熟して安定しています。Doris 1.2.2でJemallocに切り替えました。チューニング後、ほとんどのシナリオでTCMallocと同等のパフォーマンスを示し、使用メモリは少なくなります。高並行性シナリオのパフォーマンスも大幅に改善されました。

### Arena

Arenaは、メモリブロックのリストを維持し、allocリクエストに応答するためにメモリブロックからメモリを割り当てるメモリプールで、システムからのメモリ要求回数を削減してパフォーマンスを向上させます。メモリブロックはChunkと呼ばれ、メモリプールのライフサイクル全体を通して存在し、通常はクエリライフサイクルと同じである破棄時に統一的にリリースされます。また、メモリアラインメントをサポートし、Shuffleプロセス中のシリアライズ/デシリアライズされたデータ、HashTable内のシリアライズされたKeyなどの保存に主に使用されます。

Chunkは初期状態で4096バイトで、内部的に割り当てられたメモリ位置を記録するカーソルを使用します。現在のChunkの残りサイズが現在のメモリ要求を満たせない場合、新しいChunkが要求されリストに追加されます。システムからのメモリ要求回数を削減するため、現在のChunkが128M未満の場合、新しく要求される各Chunkのサイズは2倍になります。現在のChunkが128Mを超える場合、現在のメモリ要求を満たすことを前提として、新しく要求されるChunkのサイズは最大128Mまで割り当てられ、メモリの浪費を避けます。デフォルトでは、以前のChunkは以降のallocに参加しません。

### HashTable

DorisのHashTableは主にHash Join、集約、集合演算、ウィンドウ関数で使用されます。主に使用されるPartitionedHashTableは最大16個のサブHashTableを含み、2つのHashTableの並列マージをサポートし、各サブHash Joinは独立して拡張され、総メモリ使用量の削減が期待され、拡張中の遅延も償却されます。

HashTableが8M未満の場合、4倍で拡張されます。HashTableが8Mを超える場合、2倍で拡張されます。HashTableが2G未満の場合、拡張ファクターは50%、つまりHashTableが50%まで埋まったときに拡張がトリガーされます。HashTableが2Gを超えた後、拡張ファクターは75%に調整されます。メモリの浪費を避けるため、通常HashTableは構築前にデータ量に応じて事前拡張されます。さらに、Dorisは異なるシナリオに対して異なるHashTableを設計し、集約シナリオでの並行性パフォーマンス最適化にPHmapを使用するなどしています。

### PODArray

PODArrayはPOD型の動的配列です。要素を初期化しない点でstd::vectorと異なり、一部のstd::vectorインターフェースをサポートし、メモリアラインメントと2の倍数での拡張をサポートします。PODArrayが破棄される際、各要素のデストラクタを呼び出さず、メモリブロック全体を直接リリースします。主にStringなどの列のデータ保存に使用されます。さらに、関数計算と式フィルタリングでも広く使用されています。

### メモリ再利用

Dorisは実行レイヤーで多くのメモリ再利用を行い、可視的なメモリホットスポットは基本的にブロックされています。例えば、データブロックBlockの再利用はQueryの実行を貫いています。例えば、ShuffleのSender側は常に1つのBlockを保持してデータを受信し、RPC伝送で1つのBlockが交互に使用されます。ストレージレイヤーは述語列を再利用して読み込み、フィルター、上位レイヤーBlockへのコピー、Tablet読み込み時のClearを行います。Aggregate KeyTableをloadする際、キャッシュされたデータのMemTableが一定のサイズに達すると事前集約後に縮小し、書き込みを継続するなどです。

さらに、DorisはデータScan開始前にScannerとスレッド数に基づいてFree Blockのバッチを事前割り当てします。Scannerがスケジュールされるたびに、そこからBlockを取得してストレージレイヤーに渡してデータを読み込みます。読み込み完了後、Blockはプロデューサーキューに配置され、上位レイヤーオペレーターによる消費と後続の計算に使用されます。上位レイヤーオペレーターがデータをコピーした後、Blockを次のScannerスケジューリングのためにFree Blockに戻すことで、メモリ再利用を実現します。データScan完了後、Free Blockは以前に事前割り当てされたスレッドで統一的にリリースされ、メモリアプリケーションとリリースが同じスレッドにないことによる追加オーバーヘッドを避けます。Free Block数はデータScanの並行性をある程度制御もします。

## Memory GC

Doris BEは定期的にシステムからプロセスの物理メモリと現在のシステム利用可能メモリを取得し、すべてのquery、load、compactionタスクのMemTrackerのスナップショットを収集します。BEプロセスメモリが制限を超過するか、システムの利用可能メモリが不足した場合、Dorisはキャッシュをリリースし、一部のクエリやloadを終了してメモリを解放します。このプロセスは別個のGCスレッドによって定期的に実行されます。

![Memory GC](/images/memory-gc.png)

Minor GCは、Doris BEプロセスメモリがSoftMemLimit（デフォルトでシステム総メモリの81%）を超過するか、システムの残り利用可能メモリがWarning水準（通常3.2GB以下）を下回るとトリガーされます。この時、Allocatorがメモリを割り当てる際にクエリが一時停止され、強制キャッシュ内のデータがloadされ、一部のData Page Cacheと期限切れのSegment Cacheがリリースされます。リリースされたメモリがプロセスメモリの10%未満の場合、クエリメモリ過剰発行が有効であれば、プロセスメモリの10%がリリースされるかキャンセル可能なクエリがなくなるまで、メモリ過剰発行比率の大きいクエリがキャンセルされ、その後システムメモリステータス取得間隔とGC間隔が短縮されます。他のクエリは残りメモリが見つかった後に実行を継続します。

BEプロセスメモリがMemLimit（デフォルトでシステム総メモリの90%）を超過するか、システムの残り利用可能メモリがLow水準（通常1.6GB以下）を下回ると、Full GCがトリガーされます。上記の操作に加えて、キャッシュデータが強制的にフラッシュされる際にloadも一時停止され、すべてのData Page Cacheとほとんどの他のキャッシュがリリースされます。リリースされたメモリが20%未満の場合、すべてのクエリとloadのMemTrackerリストで一定の戦略に従って検索を開始し、メモリ使用量の大きいクエリ、メモリ過剰発行比率の大きいload、メモリ使用量の大きいloadを順次キャンセルして、プロセスメモリの20%がリリースされるまで行います。その後、システムメモリステータス取得間隔とGC間隔が増加され、他のクエリとloadは実行を継続します。GC時間は通常数百usから数十msの間です。

## メモリ制限と水準計算方法

- プロセスメモリ制限 MemLimit = `be.conf/mem_limit * PhysicalMemory`、デフォルトはシステム総メモリの90%、詳細については参照してください。

- プロセスメモリソフト制限 SoftMemLimit = `be.conf/mem_limit * PhysicalMemory * be.conf/soft_mem_limit_frac`、デフォルトはシステム総メモリの81%。

- システム残り利用可能メモリ低水準 LowWaterMark = `be.conf/max_sys_mem_available_low_water_mark_bytes`、デフォルトは-1、その場合 LowWaterMark = `min(PhysicalMemory - MemLimit, PhysicalMemory * 0.05)`、64Gメモリのマシンでは、LowWaterMarkの値は3.2GB弱（実際の`PhysicalMemory`の値は64G未満であることが多いため）。

- システム残り利用可能メモリ警告水準 WarningWaterMark = `2 * LowWaterMark`、64Gメモリのマシンでは、`WarningWaterMark`のデフォルトは6.4GB弱。

## システム残り利用可能メモリの計算

エラーメッセージ内の利用可能メモリが低水準未満の場合も、プロセスメモリ超過として扱われます。システム内の利用可能メモリの値は`/proc/meminfo`の`MemAvailable`から取得されます。`MemAvailable`が不足すると、メモリ要求の継続によりstd::bad_allocが返されるかBEプロセスOOMを引き起こす可能性があります。プロセスメモリ統計の更新とBEメモリGCには一定の遅延があるため、OOMを可能な限り回避するために小さなメモリバッファが低水準として予約されます。

ここで、`MemAvailable`は、swapをできるだけトリガーせずにユーザープロセスに提供できるメモリの総量で、オペレーティングシステムが現在のフリーメモリ、buffer、cache、メモリ断片化などの要因に基づいて算出します。簡単な計算式は：`MemAvailable = MemFree - LowWaterMark + (PageCache - min(PageCache / 2, LowWaterMark))`で、cmd `free`で見られる`available`値と同じです。詳細については参照してください：

[why-is-memavailable-a-lot-less-than-memfreebufferscached](https://serverfault.com/questions/940196/why-is-memavailable-a-lot-less-than-memfreebufferscached)

[Linux MemAvailable](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=34e431b0ae398fc54ea69ff85ec700722c9da773)

デフォルトの低水準は3.2G（2.1.5以前は1.6G）で、`MemTotal`、`vm/min_free_kbytes`、`confg::mem_limit`、`config::max_sys_mem_available_low_water_mark_bytes`に基づいて計算され、メモリの浪費を避けます。ここで、`MemTotal`はシステム総メモリで、値も`/proc/meminfo`から取得されます。`vm/min_free_kbytes`は、オペレーティングシステムがメモリGCプロセス用に予約したバッファで、値は通常0.4%から5%の間です。一部のクラウドサーバーでは、`vm/min_free_kbytes`が5%の場合があり、システム利用可能メモリが実際の値より少なく見える原因となります。`config::max_sys_mem_available_low_water_mark_bytes`を増加させると64G以上のメモリを持つマシンでFull GC用により多くのメモリバッファが予約され、減少させると可能な限りメモリを活用できます。
