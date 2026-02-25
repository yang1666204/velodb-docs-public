---
{
  "title": "Memory Tracker",
  "description": "Doris BEはMemory Trackerを使用してプロセスのメモリ使用量を記録します。これには、query、load、compactionなどのタスクのライフサイクルで使用されるメモリが含まれます。",
  "language": "ja"
}
---
Doris BEは、Memory Trackerを使用してプロセスのメモリ使用量を記録します。これには、クエリ、ロード、コンパクション、スキーマ変更などのタスクのライフサイクルで使用されるメモリ、およびさまざまなキャッシュが含まれます。Webページのリアルタイム表示をサポートし、メモリ関連のエラーが報告されたときにBEログに出力することで、メモリ分析とメモリ問題のトラブルシューティングに使用されます。

Memory Trackerの表示方法、異なるMemory Trackerで表される過度なメモリ使用量の理由、およびそれらのメモリ使用量を削減するための分析方法については、Doris BEメモリ構造と併せて[概要](./../overview.md)で紹介されています。本記事では、Memory Trackerの原理、構造、およびいくつかの一般的な問題のみを紹介します。

## メモリトラッキングの原理

Memory Trackerは、Doris Allocatorに依存してメモリの各アプリケーションとリリースを追跡します。Doris Allocatorの紹介については、[メモリ制御戦略](./memory-control-strategy.md)を参照してください。

プロセスメモリ: Doris BEは定期的にシステムからDoris BEプロセスメモリを取得し、Cgroupと互換性があります。

タスクメモリ: 各クエリ、ロード、コンパクションなどのタスクは、初期化時に独自のMemory Trackerを作成し、実行中にMemory TrackerをTLS（Thread Local Storage）に配置します。Dorisの主要なメモリデータ構造はAllocatorから継承されます。AllocatorはTLSのMemory Trackerでメモリの各アプリケーションとリリースを記録します。

オペレーターメモリ: タスクの異なる実行オペレーターも独自のMemory Trakkerを作成します（Join/Agg/Sinkなど）。これらは手動メモリトラッキングをサポートするか、TLSに配置して実行ロジック制御およびQuery Profileでの異なるオペレーターのメモリ使用量分析のために`Doris Allocator`によって記録されます。

グローバルメモリ: グローバルメモリは主にキャッシュとメタデータを含み、異なるタスク間で共有されます。各キャッシュには独自のMemory Trackerがあり、`Doris Allocator`によって追跡されるか、手動で追跡されます。メタデータメモリは現在完全にカウントされておらず、より多くの分析はMetricsとBvarによってカウントされるさまざまなメタデータカウンターに依存します。

この中で、Doris BEプロセスメモリはオペレーティングシステムから取得され、完全に正確であると考えられます。実装の制限により、他のMemory Trackerによって追跡されるメモリは通常、実際のメモリのサブセットのみであり、その結果、すべてのMemory Trackerの合計がほとんどの場合Doris BEプロセスの物理メモリより少なくなります。一定の欠落がありますが、Memory Trackerによって記録されるメモリはほとんどの場合より信頼性が高く、自信を持ってメモリ分析に使用できます。また、Memory Trackerは実際には仮想メモリを追跡し、通常より関心のある物理メモリではないため、それらの間には一定のエラーがあります。

## Memory Tracker構造

使用法に基づいて、Memory Trackerは2つのカテゴリに分けられます。第1カテゴリのMemory Tracker Limiterは、各クエリ、ロード、コンパクション、その他のタスクおよびグローバルキャッシュ、TabletMetaで一意であり、メモリ使用量の観察と制御に使用されます。第2カテゴリのMemory Trackerは主にクエリ実行中のメモリホットスポットの追跡に使用されます（Join/Aggregation/Sort/ウィンドウ関数のHashTable、シリアル化された中間データなど）。これによりクエリ内の異なるオペレーターのメモリ使用量を分析し、ロードデータフラッシングのメモリ制御に使用されます。

両者間の親子関係はスナップショット印刷にのみ使用され、ラベル名と関連付けられ、ソフトリンクに相当します。同時消費のために親子関係に依存せず、ライフサイクルが相互に影響しないため、理解と使用のコストを削減します。すべてのメモリトラッカーはマップのセットに保存され、すべてのMemory Trackerタイプのスナップショット印刷、クエリ/ロード/コンパクションなどのタスクのスナップショット印刷、現在最もメモリを使用するクエリ/ロードのグループの取得、現在最も過度にメモリを使用するクエリ/ロードのグループの取得などのメソッドを提供します。

![Memory Tracker Implement](/images/memory-tracker-implement.png)

## Memory Tracker統計の欠落

Memory Tracker統計の欠落現象は、Doris 2.1前後のバージョンで異なります。

### Memory Tracker統計の欠落現象

1. Doris 2.1以降では、Memory Tracker統計の欠落現象が2つあります。

- `Label=process resident memory` Memory Trackerと`Label=sum of all trackers` Memory Trackerの差が大きすぎる。

- Orphan Memory Trackerの値が大きすぎる。

2. Doris 2.1より前では、Orphan Memory Trackerの値が大きすぎることは、Memory Tracker統計が欠落していることを意味します。

### Memory Tracker統計の欠落分析

> Doris 2.1.5より前のバージョンでは、Memory Tracker統計が欠落しているかBEプロセスメモリが減少しない場合は、[キャッシュメモリ分析](./../memory-analysis/doris-cache-memory-analysis.md)を参照してSegmentCacheメモリ使用量を分析し、テストを継続する前にSegment Cacheを閉じることを試してください。

> Doris 2.1.5より前のバージョンでは、Segment Cache Memory Tackerは不正確です。これは、Primary Key Indexを含む一部のIndexメモリ統計が不正確であるため、Segment Cacheメモリが効果的に制限されず、特に数百または数千列の大きなワイドテーブルで過度にメモリを占有することが多いためです。[メタデータメモリ分析](./../memory-analysis/metadata-memory-analysis.md)を参照してください。Doris BE Metricsの`doris_be_cache_usage{name="SegmentCache"}`が大きくないが、Doris BE Bvarの`doris_column_reader_num`が大きい場合は、Segment Cacheのメモリ使用量を疑う必要があります。Heap Profileでメモリ使用量の大きいコールスタックに`Segment`と`ColumnReader`フィールドが表示される場合、Segment Cacheが大量のメモリを占有していることがほぼ確認できます。

上記の現象が観察された場合、クラスターを簡単に再起動でき、現象を再現できる場合は、[Heap Profileメモリ分析](./../memory-analysis/heap-profile-memory-analysis.md)を参照してJemalloc Heap Profileを使用してプロセスメモリを分析してください。

そうでなければ、まず[メタデータメモリ分析](./../memory-analysis/metadata-memory-analysis.md)を参照してDoris BEのメタデータメモリを分析できます。

### Memory Tracker統計欠落の理由

以下では、Memory Tracker統計欠落の理由を紹介します。これはMemory Trackerの実装に関わり、通常は注意を払う必要はありません。

#### Doris 2.1以降

1. `Label=process resident memory` Memory Trackerと`Label=sum of all trackers` Memory Trackerの差が大きすぎる。

`Label=sum of all trackers` Memory Trackerの値が`Label=process resident memory` Memory Trackerの70%以上を占める場合、通常Memory TrackerがDoris BEプロセスのメモリの大部分をカウントしていることを意味し、通常はMemory Trackerを分析するだけでメモリの場所を特定できます。

`Label=sum of all trackers` Memory Trackerの値が`Label=process resident memory` Memory Trackerの70%未満を占める場合、Memory Tracker統計が欠落していることを意味し、Memory Trackerが正確にメモリの場所を特定できない可能性があります。

`Label=process resident memory` Memory Trackerと`Label=sum of all trackers` Memory Trackerの差は、`Doris Allocator`によって割り当てられていないメモリです。Dorisの主要なメモリデータ構造は`Doris Allocator`から継承されていますが、メタデータメモリ、RPCメモリなど、`Doris Allocator`によって割り当てられていないメモリの一部がまだあり、これもメモリリークの可能性があります。この場合、大きなメモリ値を持つMemory Trackerの分析に加えて、通常はメタデータメモリが合理的かどうかやメモリリークがあるかどうかに注意を払う必要があります。

2. Orphan Memory Trackerの値が大きすぎる

```
MemTrackerLimiter Label=Orphan, Type=global, Limit=-1.00 B(-1 B), Used=0(0 B), Peak=0(0 B)
```
Orphan Memory TrackerはデフォルトのMemory Trackerです。正の値または負の値は、Doris Allocatorによって割り当てられたメモリが正確に追跡されていないことを意味します。値が大きいほど、Memory Trackerの全体的な統計結果の信頼性は低くなります。その統計値は2つのソースから取得されます：

- スレッドの開始時にMemory TrackerがTLSにバインドされていない場合、Doris AllocatorはデフォルトでメモリをOrphan Memory Trackerに記録します。これは、このメモリ部分が不明であることを意味します。Doris Allocatorのメモリ記録の原理については、上記の[Memory Tracking Principle]を参照してください。

- QueryやLoadなどのタスクのMemory Trackerの値が破棄時に0と等しくない場合、通常、このメモリ部分が解放されていないことを意味します。残存メモリはOrphan Memory Trackerに記録され、これは残存メモリがOrphan Memory Trackerによって継続的に追跡されることに相当します。これにより、Orphan Memory Trackerと他のMemory Trackersの合計が、Doris Allocatorによって割り当てられたすべてのメモリと等しくなることが保証されます。

理想的には、Orphan Memory Trackerの値は0に近いことが期待されます。そのため、すべてのスレッドが開始時にOrphan以外のMemory Tracker（QueryやLoad Memory Trackerなど）をアタッチすることを期待します。そして、すべてのQueryまたはLoad Memory Trackersが破棄時に0と等しくなることで、QueryやLoadの実行中に使用されたメモリが破棄時に解放されたことを意味します。

Orphan Memory Trackerが0と等しくなく、大きな値を持つ場合、大量の不明なメモリが解放されていない、またはクエリやロードの実行後に大量のメモリが解放されていないことを意味します。

#### Doris 2.1以前

Doris 2.1以前は、すべての不明なメモリが`Label=Orphan`のMemory Trackerでカウントされていたため、Orphan Memory Trackerの大きな値はMemory Tracker統計の欠落を意味していました。
