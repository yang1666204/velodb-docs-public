---
{
  "title": "並列実行",
  "description": "DorisのParallel execution modelはPipeline execution modelであり、主にHyper論文に記載された実装からインスピレーションを得ています。",
  "language": "ja"
}
---
DorisのParallel実行モデルはPipeline実行モデルであり、主に[Hyper](https://db.in.tum.de/~leis/papers/morsels.pdf)論文で説明されている実装にインスパイアされています。Pipeline実行モデルは、Dorisのクエリスレッド数を制限しながらマルチコアCPUの計算能力を最大限に活用し、実行時のスレッド爆発の問題に対処します。その設計、実装、および効果の詳細については、[DSIP-027](DSIP-027: Support Pipeline Exec Engine - DORIS - Apache Software Foundation)および[DSIP-035](DSIP-035: PipelineX Execution Engine - DORIS - Apache Software Foundation)を参照してください。

Doris 3.0以降、Pipeline実行モデルは従来のVolcanoモデルを完全に置き換えました。Pipeline実行モデルに基づいて、DorisはQuery、DDL、およびDMLステートメントの並列処理をサポートしています。

## Physical Plan

Pipeline実行モデルをより良く理解するために、まず物理クエリプランにおける2つの重要な概念、PlanFragmentとPlanNodeを紹介する必要があります。次のSQLステートメントを例として使用します：

```
SELECT k1, SUM(v1) FROM A,B WHERE A.k2 = B.k2 GROUP BY k1 ORDER BY SUM(v1);
```
FEは最初にそれを以下の論理プランに変換し、各ノードはPlanNodeを表します。各ノードタイプの詳細な意味は、物理プランの紹介で見つけることができます。

![pip_exec_1](/images/pip-exec-1.png)

DorisはMPPアーキテクチャ上に構築されているため、各クエリはクエリレイテンシを削減するため、可能な限りすべてのBEを並列実行に参加させることを目的としています。そのため、論理プランは物理プランに変換される必要があります。この変換は本質的に、論理プランにDataSinkとExchangeNodeを挿入することを含みます。これらの2つのノードは、複数のBE間でのデータのシャッフリングを促進します。

変換後、各PlanFragmentはPlanNodeの一部に対応し、独立したタスクとしてBEに送信できます。各BEはPlanFragment内に含まれるPlanNodeを処理し、その後DataSinkとExchangeNodeオペレータを使用して、後続の計算のためにデータを他のBEにシャッフリングします。

![pip_exec_2](/images/pip-exec-2.png)

Dorisのプランは3つの層に分かれています：

- PLAN：実行プラン。SQL文はクエリプランナーによって実行プランに変換され、その後実行エンジンに実行のために提供されます。

- FRAGMENT：Dorisは分散実行エンジンであるため、完全な実行プランは複数の単一マシン実行フラグメントに分割されます。FRAGMENTは完全な単一マシン実行フラグメントを表します。複数のフラグメントが組み合わさって完全なPLANを形成します。

- PLAN NODE：オペレータであり、実行プランの最小単位です。FRAGMENTは複数のオペレータから構成され、各オペレータは集約や結合操作などの特定の実行ロジックを担当します。

## Pipeline実行
PlanFragmentはFEがBEに実行のために送信するタスクの最小単位です。BEは同一クエリに対して複数の異なるPlanFragmentを受信する可能性があり、各PlanFragmentは独立して処理されます。PlanFragmentを受信すると、BEはそれを複数のPipelineに分割し、その後複数のPipelineTaskを開始して並列実行を実現し、クエリ効率を向上させます。

![pip_exec_3](/images/pip-exec-3.png)

### Pipeline
PipelineはSourceOperator、SinkOperator、およびいくつかの中間オペレータから構成されます。SourceOperatorは外部ソースからのデータ読み取りを表し、これはTable（例：OlapTable）またはバッファ（例：Exchange）である可能性があります。SinkOperatorはデータ出力を表し、ネットワーク経由で他のノードにシャッフリングする（例：DataStreamSinkOperator）か、ハッシュTableに出力する（例：集約オペレータ、結合ビルドハッシュTableなど）ことができます。

![pip_exec_4](/images/pip-exec-4.png)

複数のPipelineは実際には相互依存関係にあります。JoinNodeを例に取ると、それは2つのPipelineに分割されます。Pipeline-0はExchangeからデータを読み取ってハッシュTableを構築し、Pipeline-1はTableからデータを読み取ってprobe操作を実行します。これらの2つのPipelineは依存関係によって接続されており、Pipeline-1はPipeline-0が完了した後にのみ実行できることを意味します。この依存関係はDependencyと呼ばれます。Pipeline-0が実行を完了すると、Dependencyのset_readyメソッドを呼び出してPipeline-1に実行準備が整ったことを通知します。

### PipelineTask
Pipelineは実際には論理的な概念であり、実行可能なエンティティではありません。Pipelineが定義されると、さらに複数のPipelineTaskにインスタンス化される必要があります。読み取る必要があるデータは異なるPipelineTaskに分散され、最終的に並列処理を実現します。同一Pipelineの複数のPipelineTask内のオペレータは同一ですが、それらの状態が異なります。例えば、異なるデータを読み取ったり、異なるハッシュTableを構築したりする可能性があります。これらの異なる状態はLocalStateと呼ばれます。

各PipelineTaskは最終的にスレッドプールに独立したタスクとして実行するために送信されます。Dependencyトリガーメカニズムにより、このアプローチはマルチコアCPUをより効果的に活用し、完全な並列性を実現できます。

### Operator
ほとんどの場合、Pipeline内の各オペレータはPlanNodeに対応しますが、例外のある特別なオペレータがいくつかあります：
* JoinNodeはJoinBuildOperatorとJoinProbeOperatorに分割されます。
* AggNodeはAggSinkOperatorとAggSourceOperatorに分割されます。
* SortNodeはSortSinkOperatorとSortSourceOperatorに分割されます。
基本原則は、特定の「ブレーキング」オペレータ（計算を実行する前にすべてのデータを収集する必要があるもの）について、データ取り込み部分をSinkに分割し、オペレータからデータを取得する部分をSourceと呼ぶことです。

## 並列スキャン
データのスキャンは非常に重いI/O操作であり、ローカルディスク（またはデータレイクシナリオの場合はHDFSやS3、これによりさらに長いレイテンシが導入される）から大量のデータを読み取る必要があり、大幅な時間を消費します。そのため、ScanOperatorに並列スキャン技術を導入しました。ScanOperatorは動的に複数のScannerを生成し、各Scannerは約100万から200万行のデータをスキャンします。スキャンを実行しながら、各Scannerはデータ解凍、フィルタリング、その他の計算などのタスクを処理し、その後ScanOperatorが読み取るためにDataQueueにデータを送信します。

![pip_exec_5](/images/pip-exec-5.png)

並列スキャン技術を使用することで、不適切なバケッティングやデータスキューにより特定のScanOperatorが過度に長時間かかる問題を効果的に回避でき、そうでなければクエリレイテンシ全体が遅くなってしまいます。

## Local Shuffle
Pipeline実行モデルでは、Local ShuffleはPipeline Breakerとして機能し、異なる実行タスク間でローカルにデータを再分散する技術です。HASHやRound Robinなどの方法を使用して、上流Pipelineが出力するすべてのデータを下流Pipelineのすべてのタスクに均等に分散します。これにより、実行中のデータスキューの問題を解決し、実行モデルがデータストレージやクエリプランによって制限されなくなることを保証します。Local Exchangeがどのように機能するかを説明する例を提供しましょう。

前の例のPipeline-1を使用して、Local Exchangeがどのようにデータスキューを防ぐかをさらに説明します。

![pip_exec_6](/images/pip-exec-6.png)

上図に示すように、Pipeline-1にLocal Exchangeを挿入することで、Pipeline-1をPipeline-1-0とPipeline-1-1にさらに分割します。

現在の並行性レベルが3（各Pipelineが3つのタスクを持つ）で、各タスクがストレージ層から1つのバケットを読み取ると仮定しましょう。3つのバケットの行数はそれぞれ1、1、7です。Local Exchangeの挿入前後の実行は以下のように変化します：

![pip_exec_7](/images/pip-exec-7.png)

右の図から分かるように、HashJoinとAggオペレータが処理する必要があるデータ量は（1、1、7）から（3、3、3）に変化し、それによりデータスキューを回避します。

Local Shuffleは一連のルールに基づいて計画されます。例えば、クエリがJoin、Aggregation、Window Functionsなどの時間のかかるオペレータを含む場合、Local Shuffleを使用してデータスキューを可能な限り最小化します。
