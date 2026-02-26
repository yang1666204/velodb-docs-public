---
{
  "title": "ワークロードグループ",
  "description": "Workload Groupは、ワークロードを分離するためのインプロセスメカニズムです。",
  "language": "ja"
}
---
# Workload Group


Workload Groupは、ワークロードを分離するためのプロセス内メカニズムです。
BEプロセス内でリソース（CPU、IO、メモリ）を細かく分割または制限することで、リソース分離を実現します。
その原理を以下の図で示します：

![workload_group](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/workload-group-arch.png)

現在サポートされている分離機能には以下が含まれます：

* CPUリソースの管理、cpu hard limitとcpu soft limitの両方をサポート
* メモリリソースの管理、memory hard limitとmemory soft limitの両方をサポート
* IOリソースの管理、ローカルファイルとリモートファイルの読み取りによって生成されるIOを含む

:::tip
Workload Groupはプロセス内リソース分離機能を提供しますが、これはプロセス間リソース分離手法（Resource GroupやCompute Groupなど）とは以下の点で異なります：

1. プロセス内リソース分離では完全な分離を実現できません。例えば、高負荷クエリと低負荷クエリが同一プロセス内で実行される場合、Workload Groupを使用して高負荷グループのCPU使用量を制限し、全体のCPU使用量を合理的な範囲内に保ったとしても、低負荷グループのレイテンシは依然として影響を受ける可能性があります。ただし、CPU制御を全く行わない場合と比較すれば、より良いパフォーマンスを発揮します。この制限は、共通キャッシュや共有RPCスレッドプールなど、プロセス内の特定の共有コンポーネントを完全に分離することが困難であることに起因します。
2. リソース分離戦略の選択は、分離とコストのトレードオフによって決まります。ある程度のレイテンシを許容でき、低コストを優先する場合は、Workload Group分離アプローチが適している可能性があります。一方、完全な分離が必要で、より高いコストが許容できる場合は、プロセス間リソース分離アプローチ（つまり、分離されたワークロードを別のプロセスに配置する）を検討すべきです。例えば、Resource GroupやCompute Groupを使用して高優先度ワークロードを独立したBEノードに割り当てることで、より徹底的な分離を実現できます。
   :::



## Workload Groupの設定

### CGroup環境のセットアップ
Workload GroupはCPU、メモリ、IOの管理をサポートします。CPU管理はCGroupコンポーネントに依存します。
Workload GroupをCPUリソース管理に使用するには、まずCGroup環境を設定する必要があります。

以下はCGroup環境を設定する手順です：

1. まず、BEが配置されているノードにCGroupがインストールされているかを確認します。
出力にcgroupが含まれている場合、現在の環境にCGroup V1がインストールされていることを示します。
cgroup2が含まれている場合は、CGroup V2がインストールされていることを示します。次のステップでどちらのバージョンがアクティブかを判断できます。

```shell
cat /proc/filesystems | grep cgroup
nodev   cgroup
nodev   cgroup2
nodev   cgroupfs
```
2. アクティブなCGroupバージョンは、パス名に基づいて確認できます。

```shell
If this path exists, it indicates that CGroup V1 is currently active.
/sys/fs/cgroup/cpu/


If this path exists, it indicates that CGroup V2 is currently active.
/sys/fs/cgroup/cgroup.controllers
```
3. CGrroupパス下にdorisという名前のディレクトリを作成します。ディレクトリ名はユーザーがカスタマイズできます。

```shell
If using CGroup V1, create the directory under the cpu directory.
mkdir /sys/fs/cgroup/cpu/doris


If using CGroup V2, create the directory directly under the cgroup directory.
mkdir /sys/fs/cgroup/doris
```
4. Doris BEプロセスがこのディレクトリに対して読み取り、書き込み、実行権限を持っていることを確認してください。

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
5. 現在の環境でCGroup v2を使用している場合、以下の手順が必要です。CGroup v1の場合、この手順はスキップできます。
* ルートディレクトリのcgroup.procsファイルの権限を変更します。これは、CGroup v2がより厳格な権限制御を持っており、CGoupディレクトリ間でプロセスを移動するためにルートディレクトリのcgroup.procsファイルへの書き込み権限が必要であるためです。

```shell
chmod a+w /sys/fs/cgroup/cgroup.procs
```
* CGroup v2では、cgroup.controllersファイルが現在のディレクトリで利用可能なコントローラーを一覧表示し、cgroup.subtree_controlファイルがサブディレクトリで利用可能なコントローラーを一覧表示します。
  そのため、dorisディレクトリでcpuコントローラーが有効になっているかを確認する必要があります。dorisディレクトリのcgroup.controllersファイルにcpuが含まれていない場合、cpuコントローラーが有効になっていないことを意味します。dorisディレクトリで以下のコマンドを実行することで有効にできます。
  このコマンドは、親ディレクトリのcgroup.subtree_controlファイルを変更してdorisディレクトリがcpuコントローラーを使用できるようにすることで機能します。

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
1. 現在のWorkload Group機能は単一マシンでの複数BE インスタンスのデプロイをサポートしていないため、マシンあたり1つのBEのみをデプロイすることを推奨します。
2. マシンを再起動すると、CGroupパス下のすべての設定がクリアされます。
CGroup設定を永続化するには、systemdを使用して操作をカスタムシステムサービスとして設定し、
マシンを再起動するたびに作成と認可の操作が自動的に実行されるようにすることができます。
3. コンテナ内でCGroupを使用する場合、コンテナはホストマシンを操作する権限を持つ必要があります。
   :::

#### コンテナでWorkload Groupを使用する際の考慮事項
WorkloadのCPU管理はCGroupをベースにしています。コンテナ内でWorkload Groupを使用したい場合、
コンテナ内のBEプロセスがホストマシン上のCGroupファイルの読み書き権限を持てるよう、コンテナを特権モードで起動する必要があります。

BEがコンテナ内で実行される場合、Workload GroupのCPUリソース使用量は、コンテナの利用可能なリソースに基づいて分割されます。
例えば、ホストマシンが64コアを持ち、コンテナに8コアが割り当てられ、
Workload GroupがCPUハード制限50%で設定されている場合、Workload Groupで実際に利用可能なCPUコア数は4コア（8コア * 50%）になります。

Workload Groupのメモリ及びIO管理機能はDoris内部で実装されており、外部コンポーネントに依存しないため、
コンテナと物理マシン間でデプロイメントに違いはありません。

K8S上でDorisを使用したい場合は、基盤となる権限の問題を隠蔽できるDoris Operatorを使用してデプロイすることを推奨します。

### Workload Groupの作成

```
mysql [information_schema]>create workload group if not exists g1
    -> properties (
    ->     "cpu_share"="1024"
    -> );
Query OK, 0 rows affected (0.03 sec)

```
[CREATE-WORKLOAD-GROUP](../../../../sql-manual/sql-statements/cluster-management/compute-management/CREATE-WORKLOAD-GROUP) を参照してください。

この時点で設定されるCPU制限はソフト制限です。Dorisは自動的にnormalという名前のグループを作成しますが、これは削除できません。

### Workload Groupのプロパティ


| Property                     | Data type | Default value | Value range              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------------------|-----------|---------------|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cpu_share                    | Integer   | -1            | [1, 10000]               | オプション、CPUソフト制限モードで有効。値の有効範囲は使用されるCGroupのバージョンに依存し、詳細は後述します。cpu_shareはWorkload Groupが取得できるCPU時間の重みを表します。値が大きいほど、より多くのCPU時間を取得できます。たとえば、ユーザーがcpu_share値がそれぞれ10、30、40のg-a、g-b、g-cという3つのWorkload Groupを作成し、ある時点でg-aとg-bがタスクを実行している一方、g-cにはタスクがない場合、g-aはCPUリソースの25%（10 / (10 + 30)）を受け取り、g-bは75%のCPUリソースを受け取ります。システム内で1つのWorkload Groupのみが実行されている場合、cpu_shareの値に関係なく、すべてのCPUリソースを取得できます。                                                                                                                                                                                                 |
| memory_limit                 | Float     | -1            | (0%, 100%]               | オプション。メモリハード制限を有効にすると、現在のWorkload Groupで利用可能な最大メモリ使用率を表します。デフォルト値は、メモリ制限が適用されないことを意味します。すべてのWorkload Groupのmemory_limitの累積値は100%を超えることはできず、通常はenable_memory_overcommit属性と組み合わせて使用されます。たとえば、マシンに64GBのメモリがあり、Workload Groupのmemory_limitが50%に設定されている場合、そのグループで利用可能な実際の物理メモリは64GB * 90% * 50% = 28.8GBになります。ここで90%はBEプロセスの利用可能メモリ設定のデフォルト値です。                                                                                                                                                                                                                                                                                                             |
| enable_memory_overcommit     | Boolean   | true          | true, false              | オプション。現在のWorkload Groupのメモリ制限がハード制限かソフト制限かを制御するために使用され、デフォルトはtrueに設定されています。falseに設定した場合、Workload Groupはハードメモリ制限を持ち、システムがメモリ使用量が制限を超えていることを検出すると、グループ内でメモリ使用量が最も高いタスクを即座にキャンセルして、超過メモリを解放します。trueに設定した場合、Workload Groupはソフトメモリ制限を持ちます。空きメモリがある場合、Workload Groupはmemory_limitを超えてもシステムメモリを継続して使用できます。システムの総メモリが圧迫状態になると、システムはグループ内でメモリ使用量が最も高いタスクをキャンセルし、超過メモリの一部を解放してシステムメモリの圧迫を緩和します。すべてのWorkload Groupのmemory_limitの合計を100%未満に保ち、BEプロセスの他のコンポーネント用にメモリを予約することをお勧めします。 |
| cpu_hard_limit               | Integer   | -1            | [1%, 100%]               | オプション。CPUハード制限モードで有効で、Workload Groupが使用できる最大CPU使用率を表します。マシンのCPUリソースが完全に利用されているかどうかに関係なく、Workload GroupのCPU使用量はcpu_hard_limitを超えることはできません。すべてのWorkload Groupのcpu_hard_limitの累積値は100%を超えることはできません。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| max_concurrency              | Integer   | 2147483647    | [0, 2147483647]          | オプション。最大クエリ同時実行数を指定します。デフォルト値は整数の最大値で、同時実行数制限がないことを意味します。実行中のクエリ数が最大同時実行数に達すると、新しいクエリはキューに入ります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| max_queue_size               | Integer   | 0             | [0, 2147483647]          | オプション。クエリ待機キューの長さを指定します。キューが満杯の場合、新しいクエリは拒否されます。デフォルト値は0で、キューイングしないことを意味します。キューが満杯の場合、新しいクエリは直接失敗します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| queue_timeout                | Integer   | 0             | [0, 2147483647]          | オプション。待機キュー内でのクエリの最大待機時間をミリ秒で指定します。キュー内でのクエリの待機時間がこの値を超えると、クライアントに直接例外がスローされます。デフォルト値は0で、キューイングしないことを意味し、クエリはキューに入ると即座に失敗します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| scan_thread_num              | Integer   | -1            | [1, 2147483647]          | オプション。現在のWorkload Groupでスキャンに使用されるスレッド数を指定します。このプロパティが-1に設定されている場合、非アクティブであることを意味し、BE上の実際のスキャンスレッド数はBEのdoris_scanner_thread_pool_thread_num設定がデフォルトとなります。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| max_remote_scan_thread_num   | Integer   | -1            | [1, 2147483647]          | オプション。外部データソースを読み取るためのスキャンスレッドプール内の最大スレッド数を指定します。このプロパティが-1に設定されている場合、実際のスレッド数はBEによって決定され、通常はCPUコア数に基づきます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| min_remote_scan_thread_num   | Integer   | -1            | [1, 2147483647]          | オプション。外部データソースを読み取るためのスキャンスレッドプール内の最小スレッド数を指定します。このプロパティが-1に設定されている場合、実際のスレッド数はBEによって決定され、通常はCPUコア数に基づきます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| tag                          | String    | empty         | -                        | この機能は廃止されており、本番環境での使用は推奨されません。Workload Groupのタグを指定します。同じタグを持つWorkload Groupのリソース値の累積は100%を超えることはできません。複数の値を指定する場合は、カンマで区切ってください。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| read_bytes_per_second        | Integer   | -1            | [1, 9223372036854775807] | オプション。Dorisの内部テーブルを読み取る際の最大I/Oスループットを指定します。デフォルト値は-1で、I/O帯域幅制限が適用されないことを意味します。この値は個々のディスクに紐づくのではなく、ディレクトリに紐づくことに注意が必要です。たとえば、Dorisが内部テーブルデータを格納するために2つのディレクトリで設定されている場合、各ディレクトリの最大読み取りI/Oはこの値を超えません。両方のディレクトリが同じディスクに配置されている場合、最大スループットは2倍（つまり、2 × read_bytes_per_second）になります。spill disk用のファイルディレクトリもこの制限の対象となります。                                                                                                                                                                                                                                                                     |
| remote_read_bytes_per_second | Integer   | -1            | [1, 9223372036854775807] | オプション。Dorisの外部テーブルを読み取る際の最大I/Oスループットを指定します。デフォルト値は-1で、I/O帯域幅制限が適用されないことを意味します。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

:::tip

1. 現在、CPUハード制限とCPUソフト制限の同時使用はサポートされていません。
任意の時点で、クラスターはソフト制限またはハード制限のいずれかのみを持つことができます。これらの切り替え方法については後述します。

2. すべてのプロパティはオプションですが、Workload Groupを作成する際は少なくとも1つのプロパティを指定する必要があります。

3. CPUソフト制限のデフォルト値は、CGroup v1とCGroup v2で異なることに注意が必要です。CGroup v1のデフォルトCPUソフト制限は1024で、有効範囲は2から262144です。一方、CGroup v2のデフォルトは100で、有効範囲は1から10000です。
   範囲外の値をソフト制限に設定すると、BEでCPUソフト制限の変更が失敗する可能性があります。CGroup v2のデフォルト値である100をCGroup v1環境で適用すると、このWorkload Groupがマシン上で最低優先度になる可能性があります。
   :::

## ユーザーにWorkload Groupを設定する
ユーザーを特定のWorkload Groupにバインドする前に、ユーザーがWorkload Groupに対して必要な権限を持っていることを確認する必要があります。
ユーザーを使用してinformation_schema.workload_groupsシステムテーブルをクエリでき、結果には現在のユーザーがアクセス権限を持つWorkload Groupが表示されます。
次のクエリ結果は、現在のユーザーがg1およびnormalのWorkload Groupにアクセス権限を持っていることを示しています：

```sql
SELECT name FROM information_schema.workload_groups;
+--------+
| name   |
+--------+
| normal |
| g1     |
+--------+
```
g1 Workload Groupが表示されない場合は、ADMINアカウントを使用してGRANT文を実行し、ユーザーを認可することができます。例えば：

```
GRANT USAGE_PRIV ON WORKLOAD GROUP 'g1' TO 'user_1'@'%';
```
この文は、user_1に g1 という名前のWorkload Groupを使用する権限を付与することを意味します。
詳細については[grant](../../../../sql-manual/sql-statements/account-management/GRANT-TO)を参照してください。

**Workload Groupをユーザーにバインドする2つの方法**
1. ユーザープロパティを設定することで、ユーザーをデフォルトのWorkload Groupにバインドできます。デフォルトはnormalです。ここでの値は空にできないことに注意することが重要です。そうでなければ、文が失敗します。

```
set property 'default_workload_group' = 'g1';
```
この文を実行した後、現在のユーザーのクエリはデフォルトで'g1' Workload Groupを使用するようになります。

2. セッション変数を通じてWorkload Groupを指定する場合、デフォルトは空です：

```
set workload_group = 'g1';
```
両方の方法を使用してユーザーのWorkload Groupを指定した場合、セッション変数がユーザープロパティよりも優先されます。

## Show Workload Group
1. SHOW文を使用してWorkload Groupを表示できます：

```
show workload groups;
```
詳細については、[SHOW-WORKLOAD-GROUPS](../../../../sql-manual/sql-statements/cluster-management/compute-management/SHOW-WORKLOAD-GROUPS)を参照してください。

2. システムテーブルを通じてWorkload Groupを表示できます：

```
mysql [information_schema]>select * from information_schema.workload_groups where name='g1';
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
| ID    | NAME | CPU_SHARE | MEMORY_LIMIT | ENABLE_MEMORY_OVERCOMMIT | MAX_CONCURRENCY | MAX_QUEUE_SIZE | QUEUE_TIMEOUT | CPU_HARD_LIMIT | SCAN_THREAD_NUM | MAX_REMOTE_SCAN_THREAD_NUM | MIN_REMOTE_SCAN_THREAD_NUM | MEMORY_LOW_WATERMARK | MEMORY_HIGH_WATERMARK | TAG  | READ_BYTES_PER_SECOND | REMOTE_READ_BYTES_PER_SECOND |
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
| 14009 | g1   |      1024 | -1           | true                     |      2147483647 |              0 |             0 | -1             |              -1 |                         -1 |                         -1 | 50%                  | 80%                   |      |                    -1 |                           -1 |
+-------+------+-----------+--------------+--------------------------+-----------------+----------------+---------------+----------------+-----------------+----------------------------+----------------------------+----------------------+-----------------------+------+-----------------------+------------------------------+
1 row in set (0.05 sec)
```
## Alter Workload Group

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
詳細については、[ALTER-WORKLOAD-GROUP](../../../../sql-manual/sql-statements/cluster-management/compute-management/ALTER-WORKLOAD-GROUP)を参照してください。

## Workload Groupの削除

```
mysql [information_schema]>drop workload group g1;
Query OK, 0 rows affected (0.01 sec)
```
詳細は[DROP-WORKLOAD-GROUP](../../../../sql-manual/sql-statements/cluster-management/compute-management/DROP-WORKLOAD-GROUP)を参照してください。

## CPUソフト制限とハード制限モード間の切り替えについての説明
現在、DorisはCPUソフト制限とハード制限の同時実行をサポートしていません。任意の時点で、Dorisクラスタはソフト制限モードまたはハード制限モードのいずれかでのみ動作できます。
ユーザーはこれら2つのモード間で切り替えることができ、切り替え方法は以下の通りです：

1 現在のクラスタ設定がデフォルトのCPUソフト制限に設定されており、CPUハード制限に変更したい場合は、Workload Groupのcpu_hard_limitパラメータを有効な値に変更する必要があります。

```
alter workload group test_group properties ( 'cpu_hard_limit'='20%' );
```
クラスター内のすべてのWorkload Groupを変更する必要があり、すべてのWorkload Groupのcpu_hard_limitの累積値は100%を超えることはできません。

CPUハードリミットは自動的に有効な値を持つことができないため、プロパティを変更せずに単純にスイッチを有効にするだけでは、CPUハードリミットが効果を発揮しません。

2 すべてのFEノードでCPUハードリミットを有効にする

```
1 Modify the configuration in the fe.conf file on the disk.
experimental_enable_cpu_hard_limit = true


2 Modify the configuration in memory.
ADMIN SET FRONTEND CONFIG ("enable_cpu_hard_limit" = "true");
```
ユーザーがCPU hard limitからCPU soft limitに切り替えたい場合、すべてのFEノードでenable_cpu_hard_limitの値をfalseに設定する必要があります。
CPU soft limitプロパティのcpu_shareは、（以前に指定されていなかった場合）有効な値である1024がデフォルトに設定されます。ユーザーはグループの優先度に基づいてcpu_shareの値を調整できます。

## Testing
### Memory hard limit
Adhoc型のクエリは通常、予測不可能なSQL入力と不確実なメモリ使用量を持ち、少数のクエリが大量のメモリを消費するリスクをもたらします。
これらのタイプのワークロードは別のグループに割り当てることができ、Workload Groupのmemory hard limit機能を使用することで、突発的な大きなクエリがすべてのメモリを消費することを防ぎ、他のクエリが利用可能なメモリを使い果たしたり、OOM（Out of Memory）エラーが発生したりすることを防ぎます。
このWorkload Groupのメモリ使用量が設定されたhard limitを超えると、システムはメモリを解放するためにクエリを終了し、プロセスのメモリ不足を防ぎます。

**テスト環境**

1 FE、1 BE、BEは96コアと375GBのメモリで構成されています。

テストデータセットはclickbenchで、テスト方法はJMeterを使用してクエリQ29を3つの並行実行で実行します。

**Workload Groupのmemory hard limitを有効にしないテスト**

1. プロセスのメモリ使用量を確認します。psコマンド出力の4番目の列は、プロセスの物理メモリ使用量をキロバイト（KB）単位で表しています。現在のテスト負荷下で、プロセスが約7.7GBのメモリを使用していることが示されています。

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
ここでは、1つのWorkload Groupのみが実行されている場合でも、プロセスのメモリ使用量は通常、Workload Groupのメモリ使用量よりもはるかに大きいことがわかります。これは、Workload Groupがクエリとロードで使用されるメモリのみを追跡するためです。メタデータや各種キャッシュなど、プロセス内の他のコンポーネントで使用されるメモリは、Workload Groupのメモリ使用量の一部としてカウントされず、Workload Groupによって管理されることもありません。

**Workload Groupのメモリハード制限を有効にしたテスト**
1. SQLコマンドを実行してメモリ構成を変更します。

    ```sql
    alter workload group g2 properties('memory_limit'='0.5%');
    alter workload group g2 properties('enable_memory_overcommit'='false');
    ```
2. 同じテストを実行し、システムテーブルでメモリ使用量を確認します。メモリ使用量は約1.5Gです。

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
3. psコマンドを使用してプロセスのメモリ使用量を確認します。メモリ使用量は約3.8Gです。

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
エラーメッセージから、Workload Groupが1.7Gのメモリを使用したが、Workload Groupの制限は1.69Gであることが確認できます。計算は以下の通りです：1.69G = 物理マシンメモリ（375G）* mem_limit（be.confの値、デフォルトは0.9）* 0.5%（Workload Groupの設定）。
これは、Workload Groupで設定されたメモリのパーセンテージが、BEプロセスで利用可能なメモリに基づいて計算されることを意味します。

**推奨事項**

上記のテストで実証されたように、メモリハード制限はWorkload Groupのメモリ使用量を制御できますが、メモリを解放するためにクエリを終了させることで制御します。このアプローチはユーザーエクスペリエンスの悪化につながる可能性があり、極端な場合にはすべてのクエリが失敗する原因となる可能性があります。

したがって、本番環境では、メモリハード制限をクエリキューイング機能と併用することを推奨します。これにより、クエリの成功率を維持しながら、制御されたメモリ使用を確保できます。

### CPUハード制限
Dorisのワークロードは一般的に3つのタイプに分類できます：
1. コアレポートクエリ：これらは通常、会社の経営陣がレポートを表示するために使用されます。負荷はそれほど高くない場合がありますが、可用性の要件は厳格です。これらのクエリは、より高い優先度のソフト制限を持つグループに割り当てることができ、リソースが不足した際により多くのCPUリソースを確実に受け取れるようにします。
2. Adhocクエリは通常、探索的かつ分析的な性質を持ち、ランダムなSQLと予測不可能なリソース消費を特徴とします。その優先度は通常低いです。したがって、CPUハード制限を使用してこれらのクエリを管理し、より低い値を設定してクラスタの可用性を低下させる可能性のある過度なCPUリソース使用を防ぐことができます。
3. ETLクエリは通常、固定のSQLと安定したリソース消費を持ちますが、上流データの増加によりリソース使用にスパイクが発生することがあります。したがって、CPUハード制限を設定してこれらのクエリを管理できます。

異なるワークロードは様々なCPU消費を持ち、ユーザーは異なるレイテンシ要件を持っています。BE CPUが完全に利用されると、可用性が低下し、応答時間が増加します。例えば、Adhoc分析クエリがクラスタ全体のCPUを完全に利用すると、コアレポートクエリがより高いレイテンシを経験し、SLAに影響を与えます。したがって、異なるワークロードを分離し、クラスタの可用性とSLAを確保するためのCPU分離メカニズムが必要です。

Workload GroupはCPUソフト制限とハード制限の両方をサポートします。現在、本番環境ではハード制限を設定したWorkload Groupを設定することを推奨しています。これは、CPUソフト制限は通常、CPUが完全に利用されている場合にのみ優先度効果を示すためです。しかし、CPUが完全に使用されると、Dorisの内部コンポーネント（RPCコンポーネントなど）とオペレーティングシステムの利用可能CPUが減少し、クラスタ全体の可用性が大幅に低下します。したがって、本番環境では、CPUリソースの枯渇を避けることが不可欠であり、同じロジックがメモリなどの他のリソースにも適用されます。

**テスト環境**

1 FE、1 BE、96コアマシン。
データセットはclickbenchで、テストSQLはq29です。

**テスト**
1. JMeterを使用して3つの並行クエリを開始し、BEプロセスのCPU使用率を比較的高い使用率まで押し上げます。テストマシンは96コアを持ち、topコマンドを使用すると、BEプロセスのCPU使用率が7600%であることが確認でき、これはプロセスが現在76コアを使用していることを意味します。

   ![use workload group cpu](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-cpu-1.png)

2. 現在使用中のWorkload GroupのCPUハード制限を10%に変更します。

    ```sql
    alter workload group g2 properties('cpu_hard_limit'='10%');
    ```
3. CPU ハードリミットモードに切り替えます。

    ```sql
    ADMIN SET FRONTEND CONFIG ("enable_cpu_hard_limit" = "true");
    ```
4. クエリの負荷テストを再実行すると、現在のプロセスは9から10コアしか使用できず、これは総コア数の約10%であることがわかります。

   ![use workload group cpu](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-cpu-2.png)

このテストはクエリワークロードを使用して実行するのが最適であることに注意することが重要です。これらはその効果をより反映する可能性が高いためです。負荷をテストする場合、Compactionがトリガーされ、実際に観測される値がWorkload Groupで設定された値よりも高くなる可能性があります。現在、CompactionワークロードはWorkload Groupの管理下にありません。

5. Linuxシステムコマンドの使用に加えて、Dorisのシステムテーブルを通じてグループの現在のCPU使用率を観察することも可能で、CPU使用率は約10%です。

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

1. 設定時は、すべてのグループの合計CPU割り当てを正確に100%に設定しないことが推奨されます。これは主に低レイテンシシナリオの可用性を確保するためで、他のコンポーネント用にリソースを予約する必要があるためです。ただし、レイテンシにそれほど敏感でなく、最大限のリソース使用率を目的とするシナリオでは、すべてのグループの合計CPU割り当てを100%に設定することも検討できます。
2. 現在、FEからBEへのWorkload Groupメタデータの同期間隔は30秒です。そのため、Workload Groupの設定変更が有効になるまで最大30秒かかる場合があります。


### ローカルIOの制限
OLAPシステムでは、ETL操作や大規模なAdhocクエリの実行中に大量のデータを読み取る必要があります。データ分析プロセスを高速化するため、Dorisは複数のディスクファイルにわたってマルチスレッド並列スキャンを使用しますが、これにより大量のディスクIOが生成され、他のクエリ（レポート分析など）に影響を与える可能性があります。
Workload Groupsを使用することで、Dorisはオフラインの ETLデータ処理とオンラインのレポートクエリを個別にグループ化し、オフラインデータ処理のIO帯域幅を制限できます。これにより、オフラインデータ処理がオンラインレポート分析に与える影響を軽減できます。

**テスト環境**

1 FE、1 BE、96コアマシン。データセット：clickbench。テストクエリ：q29。

**IOハード制限を有効にしないテスト**
1. Cacheをクリアする。

    ```sql
    // clear OS cache
    sync; echo 3 > /proc/sys/vm/drop_caches

    // disable BE page cache
    disable_storage_page_cache = true
    ```
2. clickbenchテーブルに対してフルテーブルスキャンを実行し、単一の並行クエリを実行します。

    ```sql
    set dry_run_query = true;
    select * from hits.hits;
    ```
3. Dorisのシステムテーブルを通じて、現在のGroupの最大スループットが1秒あたり3GBであることを確認します。

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
4. pidstatコマンドを使用してプロセスIOを確認します。最初の列はプロセスID、2番目の列は読み取りIOスループット（kb/s単位）です。IOが制限されていない場合、最大スループットは毎秒2GBであることが確認できます。

   ![use workload group io](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-io-1.png)


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
3. Dorisシステムテーブルを使用して、Workload Groupの最大IOスループットが毎秒98Mであることを確認します。

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
4. pid ツールを使用して、プロセスの最大 IO スループットが 1 秒あたり 131M であることを確認します。

   ![use workload group io](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-io-2.png)

**注意**
1. システムテーブルの LOCAL_SCAN_BYTES_PER_SECOND フィールドは、プロセスレベルでの現在の Workload Group の統計の集計値を表します。例えば、12 個のファイルパスが設定されている場合、LOCAL_SCAN_BYTES_PER_SECOND はこれら 12 個のファイルパスの最大 IO 値になります。各ファイルパスの IO スループットを個別に表示したい場合は、Grafana で詳細な値を確認できます。

2. オペレーティングシステムと Doris の Page Cache の存在により、Linux の IO 監視スクリプトで観測される IO は、通常システムテーブルで見られる IO よりも小さくなります。


### リモート IO の制限
BrokerLoad と S3Load は、大規模データロードでよく使用される方法です。ユーザーはまずデータを HDFS や S3 にアップロードし、その後 BrokerLoad と S3Load を使用して並列でデータをロードできます。ロードプロセスを高速化するため、Doris はマルチスレッドを使用して HDFS/S3 からデータを取得しますが、これにより HDFS/S3 に大きな負荷が発生し、HDFS/S3 上で実行されている他のジョブが不安定になる可能性があります。

他のワークロードへの影響を軽減するため、Workload Group のリモート IO 制限機能を使用して、HDFS/S3 からのロードプロセス中に使用される帯域幅を制限できます。これにより、他のビジネス運用への影響を軽減できます。


**テスト環境**

1 つの FE と 1 つの BE が同じマシンにデプロイされ、16 コアと 64GB のメモリが設定されています。テストデータは clickbench データセットで、テスト前にデータセットを S3 にアップロードする必要があります。アップロード時間を考慮して、1000 万行のデータのみをアップロードし、その後 TVF 関数を使用して S3 からデータをクエリします。

アップロードが成功した後、コマンドを使用してスキーマ情報を表示できます。

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
2. システムテーブルを使用して現在のリモートIO スループットを確認します。このクエリのリモートIO スループットが1秒あたり837 MBであることが示されています。ここでの実際のIO スループットは環境に大きく依存することに注意してください。BEをホストしているマシンから外部ストレージへの帯域幅が制限されている場合、実際のスループットはより低くなる可能性があります。

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
3. sar コマンド（sar -n DEV 1 3600）を使用してマシンのネットワーク帯域幅を監視します。マシンレベルでの最大ネットワーク帯域幅が1秒あたり1033 MBであることが示されます。
   出力の最初の列は、マシン上の特定のネットワークインターフェースが1秒あたりに受信するバイト数をKB/秒で表します。

   ![use workload group rio](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-rio-1.png)

**リモート読み取りIOの制限をテストする**
1. Workload Group設定を変更して、リモート読み取りIOスループットを1秒あたり100Mに制限します。

    ```sql
    alter workload group normal properties('remote_read_bytes_per_second'='104857600');
    ```
2. 単一の同時フルテーブルスキャンクエリを開始します。

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
3. システムテーブルを使用して、現在のリモートリードIO throughputを確認してください。この時点で、IO throughputは約100M程度で、いくらかの変動があります。これらの変動は現在のアルゴリズム設計の影響を受けており、通常は短時間でピークに達し、長期間持続することはないため、正常と考えられます。

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
4. sar コマンド（sar -n DEV 1 3600）を使用して現在のネットワークカードの受信トラフィックを監視します。最初の列は1秒あたりの受信データ量を表します。観測された最大値は現在207M/秒で、読み取りIO制限が効果的であることを示しています。ただし、sarコマンドはマシンレベルのトラフィックを反映するため、観測値はDorisが報告する値よりもわずかに高くなります。

   ![use workload group rio](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/use-wg-rio-2.png)

## よくある質問
1. CPU ハード制限の設定が効果を発揮しないのはなぜですか？
* これは通常、以下の理由によって引き起こされます：
    * 環境初期化が失敗しました。Doris CGroupパス配下の2つの設定ファイルを確認する必要があります。
      ここでは、CGroup V1バージョンを例にします。ユーザーがDoris CGroupパスを```/sys/fs/cgroup/cpu/doris/```として指定している場合、
      まず```/sys/fs/cgroup/cpu/doris/query/1/tasks```の内容にWorkload Groupに対応するスレッドIDが含まれているかを確認する必要があります。
      パス中の「1」はWorkload Group IDを表し、```top -H -b -n 1 -p pid```コマンドを実行してWorkload GroupのスレッドIDを取得できます。
      確認後、Workload GroupのスレッドIDがtasksファイルに書き込まれていることを確認してください。
      次に、```/sys/fs/cgroup/cpu/doris/query/1/cpu.cfs_quota_us```の値が-1かどうかを確認します。-1の場合、CPUハード制限設定が効果を発揮していないことを意味します。
    * Doris BEプロセスのCPU使用率がWorkload Groupに設定されたCPUハード制限よりも高くなっています。
      これは予想される動作で、Workload Groupで管理されるCPUは主にクエリスレッドとLoad用のmemtable flushスレッド向けだからです。
      しかし、BEプロセスには通常、Compactionなど他のCPUを消費するコンポーネントもあります。
      そのため、プロセスのCPU使用率は一般的にWorkload Groupに設定された制限より高くなります。
      クエリ負荷のみにストレスをかけるテスト用Workload Groupを作成し、
      システムテーブル```information_schema.workload_group_resource_usage```を通じてWorkload GroupのCPU使用率を確認できます。
      このテーブルはWorkload GroupのCPU使用率のみを記録し、既にサポートされています。
    * 一部のユーザーが```cpu_resource_limit```を設定しています。まず、```show property for jack like 'cpu_resource_limit'```を実行して、
      ユーザーjackのプロパティでこのパラメータが設定されているかを確認してください。
      次に、```show variables like 'cpu_resource_limit'```を実行して、セッション変数でこのパラメータが設定されているかを確認します。
      このパラメータのデフォルト値は-1で、設定されていないことを示します。
      このパラメータを設定後、クエリはWorkload Groupで管理されない独立したスレッドプールで処理されます。このパラメータを直接変更すると本番環境の安定性に影響を与える可能性があります。
      このパラメータで設定されたクエリ負荷をWorkload Groupで管理するよう段階的に移行することを推奨します。
      このパラメータの現在の代替手段は、セッション変数```num_scanner_threads```です。主なプロセスは以下の通りです：
      まず、```cpu_resource_limit```を設定したユーザーを複数のバッチに分けます。最初のバッチのユーザーを移行する際、
      これらのユーザーのセッション変数```num_scanner_threads```を1に変更します。次に、これらのユーザーにWorkload Groupを割り当てます。その後、
      ```cpu_resource_limit```を-1に変更し、一定期間クラスターの安定性を観察します。クラスターが安定している場合、次のバッチのユーザーの移行を続けます。

2. デフォルトのWorkload Group数が15に制限されているのはなぜですか？
* Workload Groupは主に単一マシン上でのリソース分割に使用されます。
  1つのマシン上で過度にWorkload Groupを作成すると、各Workload Groupは非常に少ない割合のリソースしか受け取れません。
  ユーザーが実際にこれほど多くのWorkload Groupを作成する必要がある場合、
  クラスターを複数のBEグループに分割し、各BEグループに異なるWorkload Groupを作成することを検討できます。
  FE設定```workload_group_max_num```を変更することで、この制限を一時的に回避することもできます。

3. 多くのWorkload Groupを設定した後、「Resource temporarily unavailable」エラーが発生するのはなぜですか？
* 各Workload Groupは独立したスレッドプールに対応します。
  過度にWorkload Groupを作成すると、BEプロセスが多くのスレッドを開始しようとし、
  オペレーティングシステムがプロセスに許可する最大スレッド数を超える可能性があります。
  この問題を解決するには、BEプロセスがより多くのスレッドを作成できるようにシステム環境設定を変更します。
