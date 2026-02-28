---
{
  "title": "分析ツール",
  "description": "前のセクションの診断ツールに関する内容は、ビジネスおよび運用担当者が特定の低速なSQLクエリを特定するのに役立ちました。",
  "language": "ja"
}
---
## 概要

[診断ツール](diagnostic-tools.md)に関する前のセクションでは、ビジネスおよび運用担当者が特定の低速SQLクエリを特定する方法について説明しました。このセクションでは、低速SQLのパフォーマンスボトルネックを分析して、SQL実行プロセスのどの部分が速度低下を引き起こしているかを判断する方法を紹介します。

SQLクエリの実行プロセスは、大まかにプラン生成とプラン実行の2つの段階に分けることができます。前者は実行プランの生成を担当し、後者は具体的なプランを実行します。どちらの部分に問題があってもパフォーマンスボトルネックを引き起こす可能性があります。例えば、不適切なプランが生成された場合、実行エンジンがどれほど優秀でも良好なパフォーマンスを達成することはできません。同様に、正しいプランがあっても、不適切な実行方法によってもパフォーマンスボトルネックを引き起こす可能性があります。さらに、実行エンジンのパフォーマンスは現在のハードウェアおよびシステムアーキテクチャと密接に関連しています。インフラストラクチャの不備や誤った設定もパフォーマンスの問題を引き起こす可能性があります。

これら3つのタイプの問題はすべて、優れた分析ツールのサポートを必要とします。これに基づいて、Dorisシステムではプランニングと実行のボトルネックをそれぞれ分析する2つのパフォーマンス分析ツールを提供しています。さらに、システムレベルでもパフォーマンスボトルネックの特定を支援する対応するパフォーマンス監視ツールを提供しています。以下のセクションでは、これら3つの側面について紹介します。

## Doris Explain

実行プランは、SQLクエリの具体的な実行方法とプロセスを記述します。例えば、2つのTableを結合するSQLクエリの場合、実行プランではTableへのアクセス方法、結合方法、結合順序などの情報が表示されます。

DorisではExplainツールを提供しており、SQLクエリの実行プランに関する詳細情報を便利に表示できます。Explainが出力するプランを分析することで、ユーザーはプランニングレベルでのボトルネックを迅速に特定し、異なる状況に基づいてプランレベルのチューニングを実行できます。

Dorisでは異なる粒度の複数のExplainツールを提供しており、Explain Verbose、Explain All Plan、Explain Memo Plan、Explain Shape Planなどがあり、これらはそれぞれ最終的な物理プラン、各段階での論理プラン、コスト最適化プロセスに基づくプラン、プラン形状を表示するために使用されます。詳細情報については、実行プランExplainセクションを参照して、様々なExplainツールの使用方法とその出力情報の解釈について学習してください。

Explainの出力を分析することで、ビジネス担当者やDBAは現在のプランでのパフォーマンスボトルネックを迅速に特定できます。例えば、実行プランを分析することで、フィルターがベースTableにプッシュダウンされておらず、データが早期にフィルタリングされずに過剰な量のデータが計算に関与してパフォーマンスの問題を引き起こしていることが発見される場合があります。別の例では、2つのTableのInner等価結合において、結合条件の片側のフィルター条件がもう片側に派生されておらず、他方のTableのデータが早期にフィルタリングされないため、これも最適でないパフォーマンスを引き起こす可能性があります。このようなパフォーマンスボトルネックは、Explainの出力を分析することで特定し解決できます。

Doris Explainの出力を使用してプランレベルのチューニングを実行するケースについては、[プランチューニング](../tuning/tuning-plan/optimizing-table-schema.md)セクションを参照してください。

## Doris Profile

上記で説明したExplainツールは、SQLクエリの実行プランの概要を示します。例えば、Tablet1とt2間の結合操作をHash Joinとして計画し、t1をbuild側、t2をprobe側として指定するなどです。SQLクエリが実際に実行される際に、各具体的な実行ステップにどれだけ時間がかかるか（例えば、buildフェーズがどれくらい続き、probeフェーズがどれくらい続くか）を理解することは、パフォーマンス分析とチューニングにとって重要です。Profileツールはこの目的のために詳細な実行情報を提供します。以下のセクションでは、まずProfileファイル構造の概要を示し、次にMerged Profile、Execution Profile、PipelineTaskでの実行時間の意味について紹介します。

### Profileファイル構造

Profileファイルにはいくつかの主要なセクションが含まれています：

1. 基本クエリ情報：ID、時間、データベースなどを含む
2. SQL文とその実行プラン
3. Frontend（FE）がPlan Time、Schedule Timeなどのタスクに費やした時間
4. Backend（BE）処理中の各オペレーターが費やした実行時間（Merged ProfileとExecution Profileを含む）

5. 実行側に関する詳細情報は主に最後の部分に含まれています。次に、Profileがパフォーマンス分析にどのような情報を提供できるかを主に紹介します。

### Merged Profile

ユーザーがパフォーマンスボトルネックをより正確に分析できるように、Dorisでは各オペレーターの集約されたprofile結果を提供しています。EXCHANGE_OPERATORを例に取ると：

```sql
EXCHANGE_OPERATOR  (id=4):
    -  BlocksProduced:  sum  0,  avg  0,  max  0,  min  0
    -  CloseTime:  avg  34.133us,  max  38.287us,  min  29.979us
    -  ExecTime:  avg  700.357us,  max  706.351us,  min  694.364us
    -  InitTime:  avg  648.104us,  max  648.604us,  min  647.605us
    -  MemoryUsage:  sum  ,  avg  ,  max  ,  min  
    -  PeakMemoryUsage:  sum  0.00  ,  avg  0.00  ,  max  0.00  ,  min  0.00  
    -  OpenTime:  avg  4.541us,  max  5.943us,  min  3.139us
    -  ProjectionTime:  avg  0ns,  max  0ns,  min  0ns
    -  RowsProduced:  sum  0,  avg  0,  max  0,  min  0
    -  WaitForDependencyTime:  avg  0ns,  max  0ns,  min  0ns
    -  WaitForData0:  avg  9.434ms,  max  9.476ms,  min  9.391ms
```
Merged Profileは各オペレータの主要メトリクスを統合し、コアメトリクスとその意味を以下に示します：

| Metric Name           | Metric Definition                                          |
| --------------------- |------------------------------------------------------------|
| BlocksProduced        | 生成されたData Blockの数                                    |
| CloseTime             | Operatorがクローズフェーズで費やした時間                      |
| ExecTime              | 全フェーズにわたるOperatorの総実行時間                       |
| InitTime              | Operatorが初期化フェーズで費やした時間                       |
| MemoryUsage           | 実行中のOperatorのメモリ使用量                              |
| OpenTime              | Operatorがオープンフェーズで費やした時間                      |
| ProjectionTime        | Operatorがプロジェクションに費やした時間                      |
| RowsProduced          | Operatorによって返された行数                                |
| WaitForDependencyTime | Operatorが実行依存関係を待つ時間                             |

Dorisでは、各オペレータはユーザーが設定した並行性レベルに基づいて並行実行されます。そのため、Merged Profileは、すべての並行実行にわたって各メトリクスのMax、Avg、Minの値を計算します。

WaitForDependencyTimeは実行依存関係が異なるため、各Operatorで変動します。例えば、EXCHANGE_OPERATORの場合、依存関係は上流オペレータからRPC経由でデータが送信されることです。したがって、この文脈でのWaitForDependencyTimeは、具体的に上流オペレータがデータを送信するのを待つ時間を指します。

### Execution Profile

Merged Profileとは異なり、Execution Profileは特定の並行実行の詳細なメトリクスを表示します。id=4のexchange operatorを例に取ると：

```sql
EXCHANGE_OPERATOR  (id=4):(ExecTime:  706.351us)
      -  BlocksProduced:  0
      -  CloseTime:  38.287us
      -  DataArrivalWaitTime:  0ns
      -  DecompressBytes:  0.00  
      -  DecompressTime:  0ns
      -  DeserializeRowBatchTimer:  0ns
      -  ExecTime:  706.351us
      -  FirstBatchArrivalWaitTime:  0ns
      -  InitTime:  647.605us
      -  LocalBytesReceived:  0.00  
      -  MemoryUsage:  
      -  PeakMemoryUsage:  0.00  
      -  OpenTime:  5.943us
      -  ProjectionTime:  0ns
      -  RemoteBytesReceived:  0.00  
      -  RowsProduced:  0
      -  SendersBlockedTotalTimer(*):  0ns
      -  WaitForDependencyTime:  0ns
      -  WaitForData0:  9.476ms
```
この例では、LocalBytesReceivedはexchange operatorに固有のメトリックであり、他のoperatorには存在しないため、Merged Profileには含まれません。

### PipelineTask実行時間

Dorisでは、PipelineTaskは複数のoperatorで構成されています。PipelineTaskの実行時間を分析する際は、以下の主要な側面に注目する必要があります：
1. ExecuteTime：PipelineTask全体の実際の実行時間で、このタスク内のすべてのoperatorのExecTimeの合計にほぼ等しくなります
2. WaitWorkerTime：タスクがworkerの実行を待つ時間です。タスクが実行可能状態にあるとき、アイドル状態のworkerがそれを実行するまで待機する必要があります。この時間は主にクラスターの負荷に依存します。
3. 実行依存関係の待機時間：タスクは各operatorのすべての依存関係が実行条件を満たした場合にのみ実行でき、タスクが実行依存関係を待つ時間は、これらの依存関係の待機時間の合計です。例えば、この例のタスクの1つを簡略化すると：

    ```sql
    PipelineTask  (index=1):(ExecTime:  4.773ms)
      -  ExecuteTime:  1.656ms
          -  CloseTime:  90.402us
          -  GetBlockTime:  11.235us
          -  OpenTime:  1.448ms
          -  PrepareTime:  1.555ms
          -  SinkTime:  14.228us
      -  WaitWorkerTime:  63.868us
        DATA_STREAM_SINK_OPERATOR  (id=8,dst_id=8):(ExecTime:  1.688ms)
          -  WaitForDependencyTime:  0ns
              -  WaitForBroadcastBuffer:  0ns
              -  WaitForRpcBufferQueue:  0ns
        AGGREGATION_OPERATOR  (id=7  ,  nereids_id=648):(ExecTime:  398.12us)
          -  WaitForDependency[AGGREGATION_OPERATOR_DEPENDENCY]Time:  10.495ms
    ```
このタスクには2つのオペレーター（DATA_STREAM_SINK_OPERATOR - AGGREGATION_OPERATOR）が含まれており、そのうちDATA_STREAM_SINK_OPERATORには2つの依存関係（WaitForBroadcastBufferとWaitForRpcBufferQueue）があり、AGGREGATION_OPERATORには1つの依存関係（AGGREGATION_OPERATOR_DEPENDENCY）があるため、現在のタスクの時間消費は以下のように分散されています：

    1. ExecuteTime: 1.656ms（PipelineTask全体の実際の実行時間で、タスク内のすべてのオペレーターのExecTimeの合計にほぼ等しい）。
    2. WaitWorkerTime: 63.868us（タスクが実行ワーカーを待機する時間。タスクが実行可能状態にあるとき、実行可能なワーカーを待機し、この期間は主にクラスターの負荷に依存する）。
    3. 実行依存関係の待機時間: 10.495ms（WaitForBroadcastBuffer + WaitForRpcBufferQueue + WaitForDependency[AGGREGATION_OPERATOR_DEPENDENCY]Time）。タスクが実行依存関係を待機する時間は、これらの依存関係の待機時間の合計です。

実行レベルのチューニングでProfileを使用する場合については、[Tuning Execution](../tuning/tuning-execution/adjustment-of-runtimefilter-wait-time.md)セクションを参照してください。

## システムレベルのパフォーマンスツール

一般的に使用されるシステムツールは、実行中のパフォーマンスボトルネックの特定に役立ちます。例えば、top、free、perf、sar、iostatなどの広く使用されているLinuxツールを利用して、SQLの実行中にシステムのCPU、メモリ、I/O、ネットワークの状況を観察し、パフォーマンスボトルネックの特定を支援できます。

## まとめ

効果的なパフォーマンス分析ツールは、パフォーマンスボトルネックを迅速に特定するために重要です。DorisはExplainとProfileを提供し、実行プランの問題分析と実行中に最も時間を消費する操作の特定に対する強力なサポートを提供しています。また、システムレベル分析ツールの熟練した使用は、パフォーマンスボトルネックの特定に大きく役立ちます。
