---
{
  "title": "ワークロードグループ",
  "language": "ja"
}
---
Workload Groupは、ワークロードを分離するためのプロセス内メカニズムです。
BEプロセス内でリソース（CPU、IO、Memory）を細かく分割または制限することにより、リソース分離を実現します。
その原理を以下の図に示します：

![workload_group](/images/workload-group-arch.png)

現在サポートされている分離機能には以下が含まれます：

* CPUリソースの管理、cpu hard limitとcpu soft limitの両方をサポート
* メモリリソースの管理、memory hard limitとmemory soft limitの両方をサポート
* IOリソースの管理、ローカルおよびリモートファイルの読み取りによって生成されるIOを含む

:::tip
Workload Groupはプロセス内リソース分離機能を提供しており、これはプロセス間リソース分離手法（Resource GroupやCompute Groupなど）と以下の点で異なります：

1. プロセス内リソース分離では完全な分離を実現することはできません。例えば、高負荷クエリと低負荷クエリが同じプロセス内で実行される場合、Workload Groupを使用して高負荷グループのCPU使用量を制限し、全体的なCPU使用量を合理的な範囲内に保ったとしても、低負荷グループのレイテンシは依然として影響を受ける可能性があります。ただし、CPU制御が全くない場合と比較すると、より良いパフォーマンスを発揮します。この制限は、共通キャッシュや共有RPCスレッドプールなど、プロセス内の特定の共有コンポーネントを完全に分離することが困難であることに起因します。
2. リソース分離戦略の選択は、分離とコストのトレードオフに依存します。ある程度のレイテンシを許容できる一方で低コストを優先する場合は、Workload Groupの分離アプローチが適している可能性があります。一方、完全な分離が必要で、より高いコストを許容できる場合は、プロセス間リソース分離アプローチ（すなわち、分離されたワークロードを別々のプロセスに配置する）を検討すべきです。例えば、Resource GroupやCompute Groupを使用して高優先度のワークロードを独立したBEノードに割り当てることで、より徹底的な分離を実現できます。
:::

## バージョンノート

- Workload Group機能はDoris 2.0から利用可能です。Doris 2.0では、Workload Group機能はCGroupに依存しませんが、Doris 2.1以降ではCGroupが必要です。

- Doris 1.2から2.0へのアップグレード：クラスタ全体がアップグレードされた後にのみWorkload Group機能を有効にすることをお勧めします。一部のfollower FEノードのみがアップグレードされた場合、アップグレードされていないFEノードにWorkload Groupメタデータが存在しないため、アップグレードされたfollower FEノードでのクエリが失敗する可能性があります。

- Doris 2.0から2.1へのアップグレード：Doris 2.1のWorkload Group機能はCGroupに依存するため、Doris 2.1にアップグレードする前にCGroup環境を設定する必要があります。

## Workload Groupの設定

### CGroup環境のセットアップ
Workload GroupはCPU、メモリ、IOの管理をサポートします。CPU管理はCGroupコンポーネントに依存します。
CPUリソース管理にWorkload Groupを使用するには、まずCGroup環境を設定する必要があります。

CGroup環境を設定する手順は以下の通りです：

1. まず、BEが配置されているノードにCGroupがインストールされているかどうかを確認します。
出力にcgroupが含まれている場合は、現在の環境にCGroup V1がインストールされていることを示します。
cgroup2が含まれている場合は、CGroup V2がインストールされていることを示します。次のステップでどのバージョンがアクティブかを判断できます。

```shell
cat /proc/filesystems | grep cgroup
nodev	cgroup
nodev	cgroup2
nodev	cgroupfs
```
2. アクティブなCGroupバージョンは、パス名に基づいて確認できます。

```shell
If this path exists, it indicates that CGroup V1 is currently active.
/sys/fs/cgroup/cpu/


If this path exists, it indicates that CGroup V2 is currently active.
/sys/fs/cgroup/cgroup.controllers
```
3. CGrpathの下にdorisという名前のディレクトリを作成します。ディレクトリ名はユーザーによってカスタマイズできます。

```shell
If using CGroup V1, create the directory under the cpu directory.
mkdir /sys/fs/cgroup/cpu/doris


If using CGroup V2, create the directory directly under the cgroup directory.
mkdir /sys/fs/cgroup/doris
```
4. Doris BEプロセスがこのディレクトリに対して読み取り、書き込み、実行の権限を持っていることを確認してください。

```shell
// If using CGroup V1, the command is as follows:
// 1. Modify the directory's permissions to be readable, writable, and executable.
chmod 770 /sys/fs/cgroup/cpu/doris
// 2. Change the ownership of this directory to the doris account.
chown -R doris:doris /sys/fs/cgroup/cpu/doris


// If using CGroup V2, the command is as follows:
// 1.Modify the directory's permissions to be readable, writable, and executable.
chmod 770 /sys/fs/cgroup/doris
// 2. Change the ownership of this directory to the doris account.
chown -R doris:doris /sys/fs/cgroup/doris
```
5. 現在の環境がCGroup v2を使用している場合は、以下の手順が必要です。CGroup v1の場合は、この手順をスキップできます。
* ルートディレクトリのcgroup.procsファイルの権限を変更します。これは、CGroup v2がより厳格な権限制御を持っており、CGroupディレクトリ間でプロセスを移動するためにルートディレクトリのcgroup.procsファイルへの書き込み権限が必要なためです。

```shell
chmod a+w /sys/fs/cgroup/cgroup.procs
```
* CGroup v2では、cgroup.controllersファイルが現在のディレクトリで利用可能なコントローラーを一覧表示し、cgroup.subtree_controlファイルがサブディレクトリで利用可能なコントローラーを一覧表示します。
  そのため、dorisディレクトリでcpuコントローラーが有効になっているかどうかを確認する必要があります。dorisディレクトリのcgroup.controllersファイルにcpuが含まれていない場合、cpuコントローラーが有効になっていないことを意味します。dorisディレクトリで以下のコマンドを実行することで有効にできます。
  このコマンドは、親ディレクトリのcgroup.subtree_controlファイルを変更して、dorisディレクトリがcpuコントローラーを使用できるようにすることで機能します。

```
// After running this command, you should be able to see the cpu.max file in the doris directory, 
// and the output of cgroup.controllers should include cpu.
// If the command fails, it means that the parent directory of doris also does not have the cpu controller enabled, 
// and you will need to enable the cpu controller for the parent directory.
echo +cpu > ../cgroup.subtree_control
```
6. cgroupのパスを指定するためにBE設定を変更します。

```shell
If using CGroup V1, the configuration path is as follows:
doris_cgroup_cpu_path = /sys/fs/cgroup/cpu/doris

If using CGroup V2, the configuration path is as follows:
doris_cgroup_cpu_path = /sys/fs/cgroup/doris
```
7. BEを再起動し、ログ（be.INFO）で「add thread xxx to group」という文言が表示されれば、設定が成功したことを示します。

:::tip
1. 現在のWorkload Group機能は単一マシン上での複数のBEインスタンスのデプロイをサポートしていないため、1台のマシンにつき1つのBEのみをデプロイすることを推奨します。
2. マシンが再起動されると、CGoupパス下のすべての設定がクリアされます。
CGroup設定を永続化するには、systemdを使用してカスタムシステムサービスとして操作を設定し、
マシンが再起動するたびに作成と認証操作が自動的に実行されるようにできます。
3. コンテナ内でCGroupを使用する場合、コンテナはホストマシンを操作する権限を持つ必要があります。
   :::

#### コンテナでのWorkload Group使用時の考慮事項
WorkloadのCPU管理はCGroupに基づいています。コンテナ内でWorkload Groupを使用したい場合、
コンテナ内のBEプロセスがホストマシンのCGroupファイルを読み書きする権限を持つよう、コンテナを特権モードで起動する必要があります。

BEがコンテナ内で実行される場合、Workload GroupのCPUリソース使用量はコンテナの利用可能リソースに基づいて分割されます。
例えば、ホストマシンが64コアでコンテナに8コアが割り当てられ、
Workload GroupがCPUハード制限50%で設定されている場合、Workload Groupで実際に利用可能なCPUコア数は4コア（8コア * 50%）になります。

Workload Groupのメモリとioの管理機能はDoris内部で実装されており、外部コンポーネントに依存しないため、
コンテナと物理マシン間でのデプロイに違いはありません。

K8S上でDorisを使用したい場合は、基盤の権限問題を隠蔽できるDoris Operatorを使用してデプロイすることを推奨します。

### Workload Groupの作成

```
mysql [information_schema]>create workload group if not exists g1
    -> properties (
    ->     "cpu_share"="1024"
    -> );
Query OK, 0 rows affected (0.03 sec)

```
[CREATE-WORKLOAD-GROUP](../../sql-manual/sql-statements/cluster-management/compute-management/CREATE-WORKLOAD-GROUP) を参照してください。

この時点で設定されるCPU制限はソフト制限です。バージョン2.1以降、Dorisは自動的にnormalという名前のグループを作成し、これは削除できません。

### Workload Groupプロパティ


| プロパティ                      | データ型    | デフォルト値      | 値の範囲                   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|------------------------------|-----------|---------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cpu_share                    | Integer   | -1            | [1, 10000]               | 任意、CPUソフト制限モード下で有効。値の有効範囲は使用されているCGroupのバージョンに依存し、詳細は後述します。cpu_shareはWorkload Groupが取得できるCPU時間の重みを表します。値が大きいほど、より多くのCPU時間を取得できます。例えば、ユーザーが3つのWorkload Group g-a、g-b、g-cを作成し、cpu_share値がそれぞれ10、30、40である場合、ある時点でg-aとg-bがタスクを実行し、g-cにタスクがない場合、g-aはCPUリソースの25%（10 / (10 + 30)）を受け取り、g-bは75%のCPUリソースを受け取ります。システムで1つのWorkload Groupのみが実行されている場合、cpu_shareの値に関係なく、すべてのCPUリソースを取得できます。                                                                                                                                                                                                  |
| memory_limit                 | Float     | -1            | (0%, 100%]               | 任意。メモリハード制限を有効にすると、現在のWorkload Groupが利用可能な最大メモリ使用率を表します。デフォルト値はメモリ制限が適用されないことを意味します。すべてのWorkload Groupのmemory_limitの累積値は100%を超えることはできず、通常はenable_memory_overcommit属性と組み合わせて使用されます。例えば、マシンに64GBのメモリがあり、Workload Groupのmemory_limitが50%に設定されている場合、そのグループで利用可能な実際の物理メモリは64GB * 90% * 50% = 28.8GBとなります。ここで90%はBEプロセスの利用可能メモリ設定のデフォルト値です。                                                                                                                                                                                                                                                                                                              |
| enable_memory_overcommit     | Boolean   | true          | true, false              | 任意。現在のWorkload Groupのメモリ制限がハード制限かソフト制限かを制御するために使用され、デフォルトはtrueに設定されています。falseに設定すると、Workload Groupはハードメモリ制限を持ち、システムがメモリ使用量が制限を超えていることを検出すると、グループ内で最も多くのメモリを使用しているタスクを即座にキャンセルして、過剰なメモリを解放します。trueに設定すると、Workload Groupはソフトメモリ制限を持ちます。空きメモリが利用可能であれば、Workload Groupはmemory_limitを超えてもシステムメモリを使い続けることができます。システムの総メモリが圧迫されている場合、システムはグループ内で最も多くのメモリを使用しているタスクをキャンセルし、過剰なメモリの一部を解放してシステムメモリの圧力を軽減します。すべてのWorkload Groupの総memory_limitは、BEプロセスの他のコンポーネント用にメモリを予約するため、100%未満に保つことが推奨されます。 |
| cpu_hard_limit               | Integer   | -1            | [1%, 100%]               | 任意。CPUハード制限モード下で有効で、Workload Groupが使用できる最大CPU使用率を表します。マシンのCPUリソースが完全に利用されているかどうかに関係なく、Workload GroupのCPU使用量はcpu_hard_limitを超えることはできません。すべてのWorkload Groupのcpu_hard_limitの累積値は100%を超えることはできません。この属性はバージョン2.1で導入され、バージョン2.0ではサポートされていません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| max_concurrency              | Integer   | 2147483647    | [0, 2147483647]          | 任意。最大クエリ同時実行数を指定します。デフォルト値は整数の最大値で、同時実行制限がないことを意味します。実行中のクエリ数が最大同時実行数に達すると、新しいクエリはキューに入ります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| max_queue_size               | Integer   | 0             | [0, 2147483647]          | 任意。クエリ待機キューの長さを指定します。キューが満杯になると、新しいクエリは拒否されます。デフォルト値は0で、キューイングなしを意味します。キューが満杯の場合、新しいクエリは直接失敗します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| queue_timeout                | Integer   | 0             | [0, 2147483647]          | 任意。待機キュー内でのクエリの最大待機時間をミリ秒で指定します。クエリのキュー内での待機時間がこの値を超えると、例外が直接クライアントに送出されます。デフォルト値は0で、キューイングなしを意味し、クエリはキューに入ると即座に失敗します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| scan_thread_num              | Integer   | -1            | [1, 2147483647]          | 任意。現在のWorkload Groupでスキャンに使用されるスレッド数を指定します。このプロパティが-1に設定されている場合、アクティブでないことを意味し、BE上の実際のスキャンスレッド数は、BE内のdoris_scanner_thread_pool_thread_num設定にデフォルト設定されます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| max_remote_scan_thread_num   | Integer   | -1            | [1, 2147483647]          | 任意。外部データソース読み込み用のスキャンスレッドプール内の最大スレッド数を指定します。このプロパティが-1に設定されている場合、実際のスレッド数はBEによって決定され、通常はCPUコア数に基づきます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| min_remote_scan_thread_num   | Integer   | -1            | [1, 2147483647]          | 任意。外部データソース読み込み用のスキャンスレッドプール内の最小スレッド数を指定します。このプロパティが-1に設定されている場合、実際のスレッド数はBEによって決定され、通常はCPUコア数に基づきます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| tag                          | String    | empty         | -                        | この機能は廃止されており、本番環境での使用は推奨されません。Workload Groupのタグを指定します。同じタグを持つWorkload Groupのリソース値の累計は100%を超えることはできません。複数の値を指定するには、カンマで区切ります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| read_bytes_per_second        | Integer   | -1            | [1, 9223372036854775807] | 任意。Doris内部テーブル読み込み時の最大I/Oスループットを指定します。デフォルト値は-1で、I/O帯域幅制限が適用されないことを意味します。この値は個別のディスクではなく、ディレクトリに関連付けられていることに注意することが重要です。例えば、Dorisが内部テーブルデータを格納するために2つのディレクトリで設定されている場合、各ディレクトリの最大読み込みI/Oはこの値を超えません。両方のディレクトリが同じディスクに配置されている場合、最大スループットは2倍になります（つまり、2倍のread_bytes_per_second）。スピルディスクのファイルディレクトリもこの制限の対象となります。                                                                                                                                                                                                                                                      |
| remote_read_bytes_per_second | Integer   | -1            | [1, 9223372036854775807] | 任意。Doris外部テーブル読み込み時の最大I/Oスループットを指定します。デフォルト値は-1で、I/O帯域幅制限が適用されないことを意味します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

:::tip

1. 現在、CPUハード制限とCPUソフト制限の同時使用はサポートされていません。
どの時点でも、クラスターはソフト制限またはハード制限のいずれかのみを持つことができます。切り替え方法については後述します。

2. すべてのプロパティは任意ですが、Workload Groupを作成する際には少なくとも1つのプロパティを指定する必要があります。

3. CPUソフト制限のデフォルト値は、CGroup v1とCGroup v2で異なることに注意することが重要です。CGroup v1のデフォルトCPUソフト制限は1024で、有効範囲は2から262144、CGroup v2のデフォルトは100で、有効範囲は1から10000です。
   ソフト制限に範囲外の値を設定すると、BEでのCPUソフト制限の変更が失敗する可能性があります。CGroup v2のデフォルト値100がCGroup v1環境で適用された場合、このWorkload Groupがマシン上で最低優先度を持つ結果となる可能性があります。
   :::

## ユーザーにWorkload Groupを設定する
ユーザーを特定のWorkload Groupにバインドする前に、ユーザーがWorkload Groupに対して必要な権限を持っていることを確認する必要があります。
ユーザーを使用してinformation_schema.workload_groupsシステムテーブルを照会でき、結果には現在のユーザーがアクセス権限を持つWorkload Groupが表示されます。
以下のクエリ結果は、現在のユーザーがg1およびnormalのWorkload Groupにアクセスできることを示しています：

```sql
SELECT name FROM information_schema.workload_groups;
+--------+
| name   |
+--------+
| normal |
| g1     |
+--------+
```
g1 Workload Groupが表示されない場合は、ADMINアカウントを使用してGRANT文を実行し、ユーザーを認可することができます。例：

```
GRANT USAGE_PRIV ON WORKLOAD GROUP 'g1' TO 'user_1'@'%';
```
この文は、user_1 に g1 という名前の Workload Group を使用する権限を付与することを意味します。
詳細については [grant](../../sql-manual/sql-statements/account-management/GRANT-TO) を参照してください。

**Workload Group をユーザーにバインドする2つの方法**
1. ユーザープロパティを設定することで、ユーザーをデフォルトの Workload Group にバインドできます。デフォルトは normal です。ここでの値は空にできないことに注意することが重要です。そうでなければ、文は失敗します。

```
set property 'default_workload_group' = 'g1';
```
この文を実行した後、現在のユーザーのクエリはデフォルトで 'g1' Workload Group を使用するようになります。


2. セッション変数を通じて Workload Group を指定する場合、デフォルトは空です：

```
set workload_group = 'g1';
```
両方の方法を使用してユーザーのWorkload Groupを指定する場合、セッション変数がユーザープロパティよりも優先されます。

## Show Workload Group
1. SHOW文を使用してWorkload Groupを表示できます：

```
show workload groups;
```
詳細については [SHOW-WORKLOAD-GROUPS](../../sql-manual/sql-statements/cluster-management/compute-management/SHOW-WORKLOAD-GROUPS) を参照してください。

2. システムテーブルを通じて Workload Group を確認できます：

```
mysql [information_schema]>select * from information_schema.workload_groups where name='g1';
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
| ID    | NAME | CPU_SHARE | MEMORY_LIMIT | ENABLE_MEMORY_OVERCOMMIT | MAX_CONCURRENCY | MAX_QUEUE_SIZE | QUEUE_TIMEOUT | CPU_HARD_LIMIT | SCAN_THREAD_NUM | MAX_REMOTE_SCAN_THREAD_NUM | MIN_REMOTE_SCAN_THREAD_NUM | MEMORY_LOW_WATERMARK | MEMORY_HIGH_WATERMARK | TAG  | READ_BYTES_PER_SECOND | REMOTE_READ_BYTES_PER_SECOND |
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
| 14009 | g1   |      1024 | -1           | true                     |      2147483647 |              0 |             0 | -1             |              -1 |                         -1 |                         -1 | 50%                  | 80%                   |      |                    -1 |                           -1 |
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
1 row in set (0.05 sec)
```
## Workloadグループの変更

```
mysql [information_schema]>alter workload group g1 properties('cpu_share'='2048');
Query OK, 0 rows affected (0.00 sec

mysql [information_schema]>select cpu_share from information_schema.workload_groups where name='g1';
+-----------+
| cpu_share |
+-----------+
|      2048 |
+-----------+
1 row in set (0.02 sec)

```
詳細については、[ALTER-WORKLOAD-GROUP](../../sql-manual/sql-statements/cluster-management/compute-management/ALTER-WORKLOAD-GROUP)を参照してください。

## Workload Groupの削除

```
mysql [information_schema]>drop workload group g1;
Query OK, 0 rows affected (0.01 sec)
```
詳細は[DROP-WORKLOAD-GROUP](../../sql-manual/sql-statements/cluster-management/compute-management/DROP-WORKLOAD-GROUP)を参照してください。

## CPUソフト制限とハード制限モード間の切り替えについての説明
現在、DorisはCPUソフト制限とハード制限の同時実行をサポートしていません。任意の時点において、DorisクラスターはCPUソフト制限モードまたはCPUハード制限モードのいずれか一方でのみ動作できます。
ユーザーはこれら2つのモード間で切り替えることができ、切り替え方法は以下の通りです：

1 現在のクラスター設定がデフォルトのCPUソフト制限に設定されており、CPUハード制限に変更したい場合は、Workload Groupのcpu_hard_limitパラメータを有効な値に変更する必要があります。

```
alter workload group test_group properties ( 'cpu_hard_limit'='20%' );
```
クラスター内のすべてのWorkload Groupを変更する必要があり、すべてのWorkload Groupのcpu_hard_limitの累積値は100%を超えることはできません。

CPUハード制限は自動的に有効な値を持つことができないため、プロパティを変更せずに単純にスイッチを有効にするだけでは、CPUハード制限が有効になりません。

2 すべてのFEノードでCPUハード制限を有効にする

```
1 Modify the configuration in the fe.conf file on the disk.
experimental_enable_cpu_hard_limit = true


2 Modify the configuration in memory.
ADMIN SET FRONTEND CONFIG ("enable_cpu_hard_limit" = "true");
```
ユーザーがCPU hard limitからCPU soft limitに戻したい場合は、すべてのFEノードでenable_cpu_hard_limitの値をfalseに設定する必要があります。
CPU soft limitプロパティであるcpu_shareは、（以前に指定されていなかった場合）有効な値である1024がデフォルトになります。ユーザーは、グループの優先度に基づいてcpu_shareの値を調整できます。

## テスト
### Memory hard limit
Adhoc型のクエリは通常、予測不可能なSQL入力と不確実なメモリ使用量を持ち、少数のクエリが大量のメモリを消費するリスクをもたらします。
この種類のワークロードは別のグループに割り当てることができ、Workload Groupのmemory hard limit機能を使用することで、突然の大きなクエリがすべてのメモリを消費することを防ぎ、他のクエリが利用可能なメモリを使い果たしたり、OOM（Out of Memory）エラーが発生したりすることを防ぐのに役立ちます。
このWorkload Groupのメモリ使用量が設定されたhard limitを超えた場合、システムはメモリを解放するためにクエリを強制終了し、プロセスのメモリ不足を防ぎます。

**テスト環境**

1 FE、1 BE、BEは96コアと375GBのメモリで構成。

テストデータセットはclickbenchで、テスト方法はJMeterを使用してクエリQ29を3つの並行実行で実行します。

**Workload Groupのmemory hard limitを有効にしないテスト**

1. プロセスのメモリ使用量を確認します。psコマンド出力の4列目は、プロセスの物理メモリ使用量をキロバイト（KB）単位で表しています。現在のテスト負荷下で、プロセスが約7.7GBのメモリを使用していることが示されています。

    ```sql
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         2.0 7896792
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         2.0 7929692
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         2.0 8101232
    ```
2. Dorisシステムテーブルを使用してWorkload Groupの現在のメモリ使用量を確認します。Workload Groupのメモリ使用量は約5.8GBです。

    ```sql
    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +-------------------+
    | wg_mem_used_mb    |
    +-------------------+
    | 5797.524360656738 |
    +-------------------+
    1 row in set (0.01 sec)

    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +-------------------+
    | wg_mem_used_mb    |
    +-------------------+
    | 5840.246627807617 |
    +-------------------+
    1 row in set (0.02 sec)

    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +-------------------+
    | wg_mem_used_mb    |
    +-------------------+
    | 5878.394917488098 |
    +-------------------+
    1 row in set (0.02 sec)
    ```
ここでは、単一のWorkload Groupのみが実行されている場合でも、プロセスメモリ使用量は通常、Workload Groupのメモリ使用量よりもはるかに大きいことがわかります。これは、Workload Groupがクエリとロードによって使用されるメモリのみを追跡するためです。メタデータや各種キャッシュなど、プロセス内の他のコンポーネントによって使用されるメモリは、Workload Groupのメモリ使用量の一部としてカウントされず、Workload Groupによって管理されることもありません。

**Workload Groupのメモリハード制限を有効にしたテスト**
1. SQLコマンドを実行してメモリ設定を変更します。

    ```sql
    alter workload group g2 properties('memory_limit'='0.5%');
    alter workload group g2 properties('enable_memory_overcommit'='false');
    ```
2. 同じテストを実行し、system tableでメモリ使用量を確認します。メモリ使用量は約1.5Gです。

    ```sql
    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +--------------------+
    | wg_mem_used_mb     |
    +--------------------+
    | 1575.3877239227295 |
    +--------------------+
    1 row in set (0.02 sec)

    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +------------------+
    | wg_mem_used_mb   |
    +------------------+
    | 1668.77405834198 |
    +------------------+
    1 row in set (0.01 sec)

    mysql [information_schema]>select MEMORY_USAGE_BYTES / 1024/ 1024 as wg_mem_used_mb from workload_group_resource_usage where workload_group_id=11201;
    +--------------------+
    | wg_mem_used_mb     |
    +--------------------+
    | 499.96760272979736 |
    +--------------------+
    1 row in set (0.01 sec)
    ```
3. psコマンドを使用してプロセスのメモリ使用量を確認する。メモリ使用量は約3.8Gである。

    ```sql
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         1.0 4071364
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         1.0 4059012
    [ ~]$ ps -eo pid,comm,%mem,rss | grep 1407481
    1407481 doris_be         1.0 4057068
    ```
4. 同時に、クライアントはメモリ不足によって引き起こされる大量のクエリ失敗を観測することになります。

    ```sql
    1724074250162,14126,1c_sql,HY000 1105,"java.sql.SQLException: errCode = 2, detailMessage = (127.0.0.1)[MEM_LIMIT_EXCEEDED]GC wg for hard limit, wg id:11201, name:g2, used:1.71 GB, limit:1.69 GB, backend:10.16.10.8. cancel top memory used tracker <Query#Id=4a0689936c444ac8-a0d01a50b944f6e7> consumption 1.71 GB. details:process memory used 3.01 GB exceed soft limit 304.41 GB or sys available memory 101.16 GB less than warning water mark 12.80 GB., Execute again after enough memory, details see be.INFO.",并发 1-3,text,false,,444,0,3,3,null,0,0,0
    ```
エラーメッセージから、Workload Groupが1.7Gのメモリを使用したが、Workload Groupの制限は1.69Gであることが確認できます。計算は以下の通りです：1.69G = 物理マシンのメモリ（375G） * mem_limit（be.confの値、デフォルトは0.9） * 0.5%（Workload Groupの設定）。
これは、Workload Groupで設定されたメモリ割合が、BEプロセスで利用可能なメモリに基づいて計算されることを意味します。

**推奨事項**

上記のテストで示されたように、メモリハード制限はWorkload Groupのメモリ使用量を制御できますが、メモリを解放するためにクエリを終了することで制御を行います。このアプローチはユーザーエクスペリエンスの低下につながり、極端な場合にはすべてのクエリが失敗する可能性があります。

そのため、本番環境では、メモリハード制限をクエリキューイング機能と組み合わせて使用することを推奨します。これにより、クエリの成功率を維持しながら制御されたメモリ使用量を確保できます。

### CPUハード制限
Dorisのワークロードは一般的に3つのタイプに分類できます：
1. Core Report Queries：これらは通常、会社の幹部がレポートを閲覧するために使用されます。負荷はそれほど高くない場合がありますが、可用性要件は厳格です。これらのクエリは、より高い優先度のソフト制限を持つグループに割り当てることができ、リソースが不十分な場合により多くのCPUリソースを確実に受け取れます。
2. Adhocクエリは通常、探索的で分析的な性質を持ち、ランダムなSQLと予測不可能なリソース消費があります。その優先度は通常低いです。そのため、CPUハード制限を使用してこれらのクエリを管理し、過度なCPUリソース使用を防ぎ、クラスターの可用性低下を回避するために低い値を設定できます。
3. ETLクエリは通常、固定されたSQLと安定したリソース消費を持ちますが、上流データの増加によりリソース使用量にスパイクが発生することがあります。そのため、CPUハード制限を設定してこれらのクエリを管理できます。

異なるワークロードは様々なCPU消費量を持ち、ユーザーは異なるレイテンシ要件を持ちます。BE CPUが完全に利用されると、可用性が低下し、応答時間が増加します。例えば、Adhoc分析クエリがクラスター全体のCPUを完全に利用する可能性があり、コアレポートクエリがより高いレイテンシを経験し、SLAに影響を与えます。そのため、異なるワークロードを分離し、クラスターの可用性とSLAを確保するために、CPU分離メカニズムが必要です。

Workload GroupはCPUソフト制限とハード制限の両方をサポートします。現在、本番環境ではハード制限を設定したWorkload Groupを構成することを推奨します。これは、CPUソフト制限が通常、CPUが完全に利用された場合にのみ優先度効果を示すためです。しかし、CPUが完全に使用されると、内部Dorisコンポーネント（RPCコンポーネントなど）とオペレーティングシステムの利用可能なCPUが削減され、クラスター全体の可用性が大幅に低下します。そのため、本番環境では、CPUリソースの枯渇を避けることが重要であり、同じ論理がメモリなどの他のリソースにも適用されます。

**テスト環境**

1 FE、1 BE、96コアマシン。
データセットはclickbenchで、テストSQLはq29です。

**テスト**
1. JMeterを使用して3つの並行クエリを開始し、BEプロセスのCPU使用率を比較的高い使用率まで押し上げます。テストマシンは96コアを持ち、topコマンドを使用すると、BEプロセスのCPU使用率が7600%であることがわかります。これは、プロセスが現在76コアを使用していることを意味します。

   ![use workload group cpu](/images/workload-management/use-wg-cpu-1.png)

2. 現在使用されているWorkload GroupのCPUハード制限を10%に変更します。

    ```sql
    alter workload group g2 properties('cpu_hard_limit'='10%');
    ```
3. CPU ハード制限モードに切り替えます。

    ```sql
    ADMIN SET FRONTEND CONFIG ("enable_cpu_hard_limit" = "true");
    ```
4. クエリの負荷テストを再実行すると、現在のプロセスが9〜10コアしか使用できないことがわかります。これは全コアの約10%です。

   ![use workload group cpu](/images/workload-management/use-wg-cpu-2.png)

このテストはクエリワークロードを使用して実施することが重要であることに注意してください。クエリワークロードの方が効果をより反映しやすいためです。負荷テストを行うとCompactionがトリガーされる可能性があり、実際に観測される値がWorkload Groupで設定された値よりも高くなる場合があります。現在、CompactionワークロードはWorkload Groupで管理されていません。

5. Linuxシステムコマンドの使用に加えて、Dorisのシステムテーブルからもグループの現在のCPU使用率を観察することができます。CPU使用率は約10%です。

    ```sql
    mysql [information_schema]>select CPU_USAGE_PERCENT from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +-------------------+
    | CPU_USAGE_PERCENT |
    +-------------------+
    |              9.57 |
    +-------------------+
    1 row in set (0.02 sec)
    ```
**note**

1. 設定時は、すべてのグループの合計CPU割り当てを正確に100%に設定しないことをお勧めします。これは主に低レイテンシシナリオの可用性を確保するためで、他のコンポーネント用にいくつかのリソースを予約しておく必要があるからです。ただし、レイテンシにあまり敏感でなく、最大限のリソース使用率を目指すシナリオについては、すべてのグループの合計CPU割り当てを100%に設定することを検討できます。
2. 現在、FEからBEへのWorkload Groupメタデータの同期間隔は30秒です。そのため、Workload Groupの設定変更が有効になるまでに最大30秒かかる場合があります。

### ローカルIOの制限
OLAPシステムでは、ETL操作や大規模なAdhocクエリの実行時に、大量のデータを読み込む必要があります。データ分析プロセスを高速化するため、Dorisは複数のディスクファイルにわたってマルチスレッド並列スキャンを使用しますが、これにより大量のディスクIOが発生し、他のクエリ（レポート分析など）に影響を与える可能性があります。
Workload Groupを使用することで、DorisはオフラインETLデータ処理とオンラインレポートクエリを別々にグループ化し、オフラインデータ処理のIO帯域幅を制限できます。これにより、オフラインデータ処理がオンラインレポート分析に与える影響を軽減できます。

**テスト環境**

1 FE、1 BE、96コアマシン。データセット：clickbench。テストクエリ：q29。

**IOハード制限を有効にしないテスト**
1. キャッシュをクリア。

    ```sql
    // clear OS cache
    sync; echo 3 > /proc/sys/vm/drop_caches

    // disable BE page cache
    disable_storage_page_cache = true
    ```
2. clickbenchテーブルに対してフルテーブルスキャンを実行し、単一の同時クエリを実行します。

    ```sql
    set dry_run_query = true;
    select * from hits.hits;
    ```
3. Dorisのシステムテーブルを通じて、現在のGroupの最大スループットが毎秒3GBであることを確認します。

    ```sql
    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 1146.6208400726318 |
    +--------------------+
    1 row in set (0.03 sec)

    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 3496.2762966156006 |
    +--------------------+
    1 row in set (0.04 sec)

    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 2192.7690029144287 |
    +--------------------+
    1 row in set (0.02 sec)
    ```
4. pidstatコマンドを使用してプロセスIOを確認します。最初の列はプロセスID、2番目の列は読み取りIOスループット（kb/s単位）です。IOが制限されていない場合、最大スループットは毎秒2GBであることがわかります。

   ![use workload group io](/images/workload-management/use-wg-io-1.png)


**IOハード制限を有効にした後のテスト**
1. キャッシュをクリアします。

    ```sql
    // Clear OS cache.
    sync; echo 3 > /proc/sys/vm/drop_caches

    // disable BE page cache
    disable_storage_page_cache = true
    ```
2. Workload Group設定を変更して、最大スループットを毎秒100Mに制限します。

    ```sql
    alter workload group g2 properties('read_bytes_per_second'='104857600');
    ```
3. Dorisシステムテーブルを使用して、Workload Groupの最大IOスループットが1秒あたり98Mであることを確認します。

    ```sql
    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 97.94296646118164  |
    +--------------------+
    1 row in set (0.03 sec)

    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 98.37584781646729  |
    +--------------------+
    1 row in set (0.04 sec)

    mysql [information_schema]>select LOCAL_SCAN_BYTES_PER_SECOND / 1024 / 1024 as mb_per_sec from workload_group_resource_usage where WORKLOAD_GROUP_ID=11201;
    +--------------------+
    | mb_per_sec         |
    +--------------------+
    | 98.06641292572021  |
    +--------------------+
    1 row in set (0.02 sec)
    ```
4. pidツールを使用して、プロセスの最大IOスループットが毎秒131Mであることを確認します。

   ![use workload group io](/images/workload-management/use-wg-io-2.png)

**注意**
1. システムテーブルのLOCAL_SCAN_BYTES_PER_SECONDフィールドは、現在のWorkload Groupの統計情報をプロセスレベルで集約した値を表します。例えば、12個のファイルパスが設定されている場合、LOCAL_SCAN_BYTES_PER_SECONDはこれら12個のファイルパスの最大IO値になります。各ファイルパスのIOスループットを個別に確認したい場合は、Grafanaで詳細な値を確認できます。

2. オペレーティングシステムとDorisのPage Cacheが存在するため、LinuxのIO監視スクリプトで観測されるIOは、通常システムテーブルで見られるIOより小さくなります。


### リモートIOの制限
BrokerLoadとS3Loadは大規模データロードでよく使用される方法です。ユーザーは最初にデータをHDFSまたはS3にアップロードし、その後BrokerLoadとS3Loadを使用してデータを並列でロードできます。ロードプロセスを高速化するため、DorisはマルチスレッドでHDFS/S3からデータを取得しますが、これによりHDFS/S3に大きな負荷がかかり、HDFS/S3上で実行されている他のジョブが不安定になる可能性があります。

他のワークロードへの影響を軽減するため、Workload Groupのリモート IO制限機能を使用して、HDFS/S3からのロードプロセス中に使用される帯域幅を制限できます。これにより、他のビジネス業務への影響を軽減できます。


**テスト環境**

1台のFEと1台のBEが同一マシンにデプロイされ、16コア、64GBメモリで構成されています。テストデータはclickbenchデータセットで、テスト前にデータセットをS3にアップロードする必要があります。アップロード時間を考慮して、1000万行のデータのみアップロードし、その後TVF機能を使用してS3からデータをクエリします。

アップロードが成功した後、コマンドを使用してスキーマ情報を確認できます。

    ```sql
    DESC FUNCTION s3 (
        "URI" = "https://bucketname/1kw.tsv",
        "s3.access_key"= "ak",
        "s3.secret_key" = "sk",
        "format" = "csv",
        "use_path_style"="true"
    );
    ```
**リモート読み取りIOを制限しないテスト**
1. clickbenchテーブルでフルテーブルスキャンを実行するシングルスレッドテストを開始する。

    ```sql
    // Set the operation to only scan the data without returning results.
    set dry_run_query = true;

    SELECT * FROM s3(
        "URI" = "https://bucketname/1kw.tsv",
        "s3.access_key"= "ak",
        "s3.secret_key" = "sk",
        "format" = "csv",
        "use_path_style"="true"
    );
    ```
2. システムテーブルを使用して現在のリモートIOスループットを確認してください。このクエリのリモートIOスループットが1秒あたり837MBであることが表示されます。ここでの実際のIOスループットは環境に大きく依存することに注意してください。BEをホストするマシンが外部ストレージへの帯域幅が制限されている場合、実際のスループットはより低くなる可能性があります。

    ```sql
    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |     837 |
    +---------+
    1 row in set (0.104 sec)

    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |     867 |
    +---------+
    1 row in set (0.070 sec)

    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |     867 |
    +---------+
    1 row in set (0.186 sec)
    ```
3. sarコマンド（sar -n DEV 1 3600）を使用してマシンのネットワーク帯域幅を監視します。これにより、マシンレベルでの最大ネットワーク帯域幅が1秒あたり1033 MBであることが示されます。
   出力の最初の列は、マシン上の特定のネットワークインターフェースが1秒あたりに受信したバイト数をKB/秒で表しています。

   ![use workload group rio](/images/workload-management/use-wg-rio-1.png)

**リモートリードIOの制限をテストする**
1. Workload Groupの設定を変更して、リモートリードIOのスループットを1秒あたり100Mに制限します。

    ```sql
    alter workload group normal properties('remote_read_bytes_per_second'='104857600');
    ```
2. 単一の並行フルテーブルスキャンクエリを開始する。

    ```sql
    set dry_run_query = true;

    SELECT * FROM s3(
        "URI" = "https://bucketname/1kw.tsv",
        "s3.access_key"= "ak",
        "s3.secret_key" = "sk",
        "format" = "csv",
        "use_path_style"="true"
    );
    ```
3. system テーブルを使用して、現在のリモート読み取り IO スループットを確認してください。この時点で、IO スループットは約 100M で、多少の変動があります。これらの変動は現在のアルゴリズム設計の影響を受けており、通常は短時間でピークに達し、長期間持続することはないため、正常と考えられます。

    ```sql
    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |      56 |
    +---------+
    1 row in set (0.010 sec)

    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |     131 |
    +---------+
    1 row in set (0.009 sec)

    MySQL [(none)]> select cast(REMOTE_SCAN_BYTES_PER_SECOND/1024/1024 as int) as read_mb from information_schema.workload_group_resource_usage;
    +---------+
    | read_mb |
    +---------+
    |     111 |
    +---------+
    1 row in set (0.009 sec)
    ```
4. sarコマンド（sar -n DEV 1 3600）を使用して、現在のネットワークカードの受信トラフィックを監視します。最初の列は1秒あたりの受信データ量を表します。観測された最大値は現在207M/秒であり、読み取りIO制限が有効であることを示しています。ただし、sarコマンドはマシンレベルのトラフィックを反映するため、観測された値はDorisが報告する値よりもわずかに高くなります。

   ![use workload group rio](/images/workload-management/use-wg-rio-2.png)

## よくある質問
1. CPUハード制限の設定が有効にならないのはなぜですか？
* これは通常、以下の理由によって引き起こされます：
    * 環境の初期化に失敗しました。Doris CGrroupパス下の2つの設定ファイルを確認する必要があります。
      ここでは、CGroup V1バージョンを例に説明します。ユーザーがDoris CGrroupパスを```/sys/fs/cgroup/cpu/doris/```として指定している場合、
      まず```/sys/fs/cgroup/cpu/doris/query/1/tasks```の内容にWorkload Groupに対応するスレッドIDが含まれているかを確認する必要があります。
      パス内の「1」はWorkload Group IDを表しており、```top -H -b -n 1 -p pid```コマンドを実行してWorkload GroupのスレッドIDを見つけることで取得できます。
      確認後、Workload GroupのスレッドIDがtasksファイルに書き込まれていることを確認してください。
      次に、```/sys/fs/cgroup/cpu/doris/query/1/cpu.cfs_quota_us```の値が-1かどうかを確認します。-1の場合、CPUハード制限設定が有効になっていないことを意味します。
    * Doris BEプロセスのCPU使用率が、Workload Groupに設定されたCPUハード制限よりも高くなっています。
      これは予想される動作です。なぜなら、Workload Groupによって管理されるCPUは主にクエリスレッドとLoadのmemtable flushスレッド用だからです。
      しかし、BEプロセスには通常、Compactionなど、CPUを消費する他のコンポーネントもあります。
      そのため、プロセスのCPU使用率は一般的にWorkload Groupに設定された制限よりも高くなります。
      クエリ負荷のみにストレスをかけるテスト用Workload Groupを作成し、システムテーブル```information_schema.workload_group_resource_usage```を通じて
      Workload GroupのCPU使用率を確認することができます。
      このテーブルはWorkload GroupのCPU使用率のみを記録し、バージョン2.1.6以降でサポートされています。
    * 一部のユーザーが```cpu_resource_limit```を設定しています。まず、```show property for jack like 'cpu_resource_limit'```を実行して
      ユーザーjackのプロパティでこのパラメータが設定されているかを確認してください。
      次に、```show variables like 'cpu_resource_limit'```を実行してセッション変数でこのパラメータが設定されているかを確認します。
      このパラメータのデフォルト値は-1で、設定されていないことを示します。
      このパラメータを設定すると、クエリはWorkload Groupによって管理されない独立したスレッドプールによって処理されます。このパラメータを直接変更すると、本番環境の安定性に影響を与える可能性があります。
      このパラメータで設定されたクエリ負荷をWorkload Groupによる管理に段階的に移行することを推奨します。
      このパラメータの現在の代替手段はセッション変数```num_scanner_threads```です。主なプロセスは以下の通りです：
      まず、```cpu_resource_limit```を設定したユーザーを複数のバッチに分割します。最初のバッチのユーザーを移行する際は、
      これらのユーザーのセッション変数```num_scanner_threads```を1に変更します。次に、これらのユーザーにWorkload Groupを割り当てます。その後、
      ```cpu_resource_limit```を-1に変更し、一定期間クラスターの安定性を観察します。クラスターが安定している場合、次のバッチのユーザーの移行を続行します。

2. デフォルトのWorkload Group数が15に制限されているのはなぜですか？
* Workload Groupは主に単一マシン上でのリソース分割に使用されます。
  1台のマシンで多数のWorkload Groupを作成すると、各Workload Groupが受け取るリソースは非常に小さな部分のみになります。
  ユーザーが実際にこれほど多くのWorkload Groupの作成を必要とする場合は、
  クラスターを複数のBEグループに分割し、各BEグループに対して異なるWorkload Groupを作成することを検討してください。
  FE設定```workload_group_max_num```を変更することで、この制限を一時的に回避することもできます。

3. 多くのWorkload Groupを設定した後に「Resource temporarily unavailable」エラーが発生するのはなぜですか？
* 各Workload Groupは独立したスレッドプールに対応します。
  多数のWorkload Groupを作成すると、BEプロセスが過度に多くのスレッドを開始しようとし、
  オペレーティングシステムがプロセスに許可する最大スレッド数を超える可能性があります。
  この問題を解決するには、BEプロセスがより多くのスレッドを作成できるようにシステム環境設定を変更してください。
