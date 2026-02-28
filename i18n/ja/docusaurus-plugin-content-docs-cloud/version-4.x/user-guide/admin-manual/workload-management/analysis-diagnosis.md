---
{
  "title": "ワークロード分析診断",
  "description": "クラスターのワークロード分析は主に2つの段階に分かれています：",
  "language": "ja"
}
---
# Workload Analysis Diagnosis

クラスターのワークロード分析は主に2つの段階に分かれています：
- 第1段階はランタイムワークロード分析で、クラスターの可用性が低下した際に、モニタリングを通じて大きなリソース消費を持つクエリを特定し、それに応じてダウングレードを行うことができます。
- 第2段階では、audit logsなどの履歴データを分析して、不合理なワークロードを特定し、最適化を行います。

## Runtime Workload Analysis
クラスターの可用性が低下した際、モニタリングによって検出された場合、以下のプロセスに従うことができます：
1. まず、モニタリングを使用して現在のクラスターのボトルネックを大まかに特定します。例えば、過度なメモリ使用量、高いCPU使用率、または高いIOなどです。すべてが高い場合は、メモリ問題の対処を優先することをお勧めします。
2. クラスターのボトルネックが特定されたら、workload_group_resource_usageTableを参照して、現在最も高いリソース使用率を持つGroupを見つけることができます。例えば、メモリボトルネックがある場合、最も高いメモリ使用量を持つ上位NのGroupsを特定できます。
3. 最も高いリソース使用率を持つGroupを特定した後、最初のステップとして、このGroupのクエリ並行性を削減することができます。この時点でクラスターリソースは既に逼迫しており、クラスターリソースの枯渇を防ぐために新しいクエリは避けるべきです。
4. 現在のGroupのクエリをダウングレードします。ボトルネックに応じて、異なるアプローチを取ることができます：
- CPUボトルネックの場合、GroupのCPUをハードリミットに設定し、cpu_hard_limitをより低い値に調整してCPUリソースを自発的に譲渡することを検討してください。
- IOボトルネックの場合、read_bytes_per_secondパラメーターを通じてGroupの最大IOを制限してください。
- メモリボトルネックの場合、Groupのメモリをハードリミットに設定し、memory_limit値を下げて一部のメモリを解放してください。これにより現在のGroup内で多数のクエリ失敗が発生する可能性があることに注意してください。
5. 上記のステップを完了した後、クラスターの可用性は通常ある程度回復します。この時点で、さらなる分析を実行して、このGroupでリソース使用量増加の主要な原因を特定することができます。それがこのGroupでの全体的なクエリ並行性の増加によるものか、特定の大きなクエリによるものかを判断します。特定の大きなクエリが原因の場合、これらのクエリを素早くkillしてクラスター機能を復旧させることができます。
6. backend_active_tasksTableをactive_queriesと組み合わせて使用し、クラスター内で異常なリソース使用量を持つSQLクエリを特定し、killステートメントを使用してこれらのクエリをkillしてリソースを解放することができます。

## Workload Analysis Through Historical Data
現在、DorisのauditログはSQL実行に関する簡潔な情報を保持しており、これを使用して過去に実行された不合理なクエリを特定し、調整を行うことができます。具体的なプロセスは以下の通りです：
1. モニタリングを確認してクラスターの履歴リソース使用量を確認し、クラスターのボトルネックがCPU、メモリ、IOのいずれかを特定します。
2. クラスターのボトルネックが特定されたら、auditログを参照して対応する期間中に異常なリソース使用量を持つSQLクエリを見つけることができます。異常なSQLを定義する方法は2つあります：
   1. ユーザーがクラスター内のSQLのリソース使用量に関して一定の期待を持っている場合、例えばほとんどの遅延が秒単位で、スキャン行数が数千万の場合、スキャン行数が数億または数十億のSQLクエリは異常と見なされ、手動介入が必要です。
   2. ユーザーがクラスター内のSQLリソース使用量に関して期待を持っていない場合、パーセンタイル関数を使用してリソース使用量を計算し、異常なリソース使用量を持つSQLクエリを特定できます。CPUボトルネックを例に取ると、まず履歴期間でのクエリCPU時間のtp50/tp75/tp99/tp999を計算し、これらの値を正常として使用します。これらを現在のクラスターの同じ期間でのクエリCPU時間のパーセンタイル関数と比較します。例えば、履歴期間のtp999が1分だったが、現在のクラスターの同じ期間のtp50が既に1分の場合、履歴データと比較してCPU時間が1分を超えるSQLクエリが多数あることを示しています。したがって、CPU時間が1分より大きいSQLクエリを異常として定義できます。同じロジックが他のメトリックにも適用されます。
3. 異常なリソース使用量を持つSQLクエリを最適化します。例えば、SQLの書き換え、Table構造の最適化、並列性の調整によりSQL クエリあたりのリソース使用量を削減します。
4. audit logsでSQLリソース使用量が正常であることが判明した場合、モニタリングと監査を使用して、その時間中に実行されたSQLクエリ数が履歴期間と比較して増加しているかどうかを確認できます。増加している場合は、対応する時間帯にアップストリームアクセストラフィックの増加があったかどうかをアップストリームビジネスと確認し、クラスターをスケールするかキューイングとレート制限を実装するかを決定します。

## Commonly Used SQL
:::tip
active_queriesTableはFEで実行されているクエリを記録し、backend_active_tasksTableはBEで実行されているクエリを記録することに注意してください。すべてのクエリが実行中にFEに登録されるわけではありません。例えば、stream loadはFEに登録されません。したがって、backend_active_tasksとactive_queries間でLEFT JOINを実行する際に一致する結果が得られないのは正常です。

クエリがSELECTクエリの場合、active_queriesとbackend_active_tasksの両方に記録されるqueryIdは同じです。クエリがstream loadの場合、active_queriesTableのqueryIdは空で、backend_active_tasksのqueryIdはstream loadのIDです。
:::

1. 現在のすべてのWorkload Groupsを表示し、メモリ/CPU/I/O使用量の降順で表示します。

```
select be_id,workload_group_id,memory_usage_bytes,cpu_usage_percent,local_scan_bytes_per_second 
   from workload_group_resource_usage
order by  memory_usage_bytes,cpu_usage_percent,local_scan_bytes_per_second desc
```
2. CPU使用率上位のSQL。

    ```
    select 
            t1.query_id as be_query_id,
            t1.query_type,
            t2.query_id,
            t2.workload_group_id,
            t2.`database`,
            t1.cpu_time,
            t2.`sql`
    from
    (select query_id, query_type,sum(task_cpu_time_ms) as cpu_time from backend_active_tasks group by query_id, query_type) 
            t1 left join active_queries t2
    on t1.query_id = t2.query_id
    order by cpu_time desc limit 10;
    ```
3. メモリ使用量上位N件のSql。

    ```
    select 
            t1.query_id as be_query_id,
            t1.query_type,
            t2.query_id,
            t2.workload_group_id,
            t1.mem_used
    from
    (select query_id, query_type, sum(current_used_memory_bytes) as mem_used from backend_active_tasks group by query_id, query_type) 
            t1 left join active_queries t2
    on t1.query_id = t2.query_id 
    order by mem_used desc limit 10;
    ```
4. バイト数/行数TopN Sqlをスキャンします。

    ```
    select 
            t1.query_id as be_query_id,
            t1.query_type,
            t2.query_id,
            t2.workload_group_id,
            t1.scan_rows,
            t1.scan_bytes
    from
    (select query_id, query_type, sum(scan_rows) as scan_rows,sum(scan_bytes) as scan_bytes from backend_active_tasks group by query_id,query_type) 
            t1 left join active_queries t2
    on t1.query_id = t2.query_id 
    order by scan_rows desc,scan_bytes desc limit 10;
    ```
5. ワークロードグループのスキャン行数/バイト数を表示します。

    ```
    select 
            t2.workload_group_id,
            sum(t1.scan_rows) as wg_scan_rows,
            sum(t1.scan_bytes) as wg_scan_bytes
    from
    (select query_id, sum(scan_rows) as scan_rows,sum(scan_bytes) as scan_bytes from backend_active_tasks group by query_id) 
            t1 left join active_queries t2
    on t1.query_id = t2.query_id 
    group by t2.workload_group_id
    order by wg_scan_rows desc,wg_scan_bytes desc
    ```
6. ワークロードグループのクエリキューの詳細を表示します。

    ```
    select 
             workload_group_id,
             query_id,
             query_status,
             now() - queue_start_time as queued_time
    from 
         active_queries
    where query_status='queued'
    order by workload_group_id
    ```
