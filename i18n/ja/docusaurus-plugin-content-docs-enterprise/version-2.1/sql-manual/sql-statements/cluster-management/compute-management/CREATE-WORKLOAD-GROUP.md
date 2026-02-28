---
{
  "title": "CREATE WORKLOAD GROUP",
  "description": "この文は workload group を作成するために使用されます。Workload group は単一の be 上で cpu リソースと memory リソースの分離を可能にします。",
  "language": "ja"
}
---
## 説明

このステートメントはワークロードグループの作成に使用されます。ワークロードグループは、単一のbe上でcpuリソースとメモリリソースの分離を可能にします。

## 構文

```sql
CREATE WORKLOAD GROUP [IF NOT EXISTS] "rg_name"
PROPERTIES (
    `<property>`
    [ , ... ]
);
```
## パラメータ

1.`<property>`

`<property>`の形式は`<key>` = `<value>`で、`<key>`の利用可能な具体的な値は以下の通りです：

| Parameter | デスクリプション | Required |
| -- | -- | -- |
| `<cpu_share>` | workload groupが取得できるcpu時間を設定するために使用され、cpuリソースのソフト分離を実現できます。cpu_shareは実行中のworkload groupが利用可能なcpuリソースの重みを示す相対値です。例えば、ユーザーがcpu_shareをそれぞれ10、30、40に設定した3つのworkload group rg-a、rg-b、rg-cを作成し、ある時点でrg-aとrg-bがタスクを実行している一方、rg-cにはタスクがない場合、rg-aは(10 / (10 + 30)) = 25%のcpuリソースを取得でき、workload group rg-bは75%のcpuリソースを取得できます。システムに実行中のworkload groupが1つしかない場合は、cpu_shareの値に関係なく、すべてのcpuリソースを取得します。 | Y |
| `<memory_limit>` | workload groupが使用できるbeメモリの割合を設定します。workload groupメモリ制限の絶対値は：`physical_memory * mem_limit * memory_limit`です。ここでmem_limitはbe設定項目です。システム内のすべてのworkload groupのmemory_limitの合計は100%を超えてはいけません。workload groupは、ほとんどの場合、グループ内のタスクに対してmemory_limitの使用が保証されます。workload groupのメモリ使用量がこの制限を超えた場合、メモリ使用量の多いグループ内のタスクがキャンセルされ、超過メモリが解放される可能性があります。enable_memory_overcommitを参照してください。 | Y |
| `<enable_memory_overcommit>` | workload groupのソフトメモリ分離を有効にします。デフォルトはfalseです。falseに設定した場合、workload groupはハードメモリ分離され、workload groupのメモリ使用量が制限を超えた直後に、最大メモリ使用量のタスクが即座にキャンセルされ、超過メモリが解放されます。trueに設定した場合、workload groupはソフト分離され、システムに空きメモリリソースがあれば、workload groupはmemory_limit制限を超えた後でもシステムメモリを継続して使用でき、システム全体のメモリが逼迫した際には、グループ内でメモリ占有量が最大のタスクをいくつかキャンセルし、超過メモリの一部を解放してシステムメモリ圧迫を緩和します。workload groupでこの設定を有効にする場合、すべてのworkload groupのmemory_limitの合計を100%未満にし、残りの部分をworkload groupメモリオーバーコミット用に使用することを推奨します。 | Y |


## Examples

1. g1という名前のworkload groupを作成：

   ```sql
    create workload group if not exists g1
    properties (
        "cpu_share"="10",
        "memory_limit"="30%",
        "enable_memory_overcommit"="true"
    );
   ```
