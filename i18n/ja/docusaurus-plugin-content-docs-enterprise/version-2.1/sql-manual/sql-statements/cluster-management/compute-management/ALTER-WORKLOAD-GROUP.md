---
{
  "title": "ALTER WORKLOAD GROUP",
  "description": "この文は、ワークロードグループを変更するために使用されます。",
  "language": "ja"
}
---
## デスクリプション

このステートメントはワークロードグループを変更するために使用されます。

## Syntax

```sql
ALTER WORKLOAD GROUP  "<rg_name>"
PROPERTIES (
  `<property>`
  [ , ... ]
);
```
## パラメータ

1.`<property>`

`<property>` 格式为 `<key>` = `<value>`，`<key>`的具体可选值如下：

| Parameter | デスクリプション | Required |
| -- | -- | -- |
| `<cpu_share>` | workload groupが取得できるCPU時間を設定するために使用され、CPUリソースのソフト分離を実現できます。cpu_shareは実行中のworkload groupが利用可能なCPUリソースの重みを示す相対値です。例えば、ユーザーがcpu_shareをそれぞれ10、30、40として3つのworkload group rg-a、rg-b、rg-cを作成し、ある時点でrg-aとrg-bがタスクを実行中でrg-cにタスクがない場合、rg-aは (10 / (10 + 30)) = 25% のCPUリソースを取得でき、workload group rg-bは75%のCPUリソースを取得できます。システムで実行中のworkload groupが1つだけの場合、cpu_shareの値に関係なく、すべてのCPUリソースを取得します。 | Y |
| `<memory_limit>` | workload groupが使用できるBEメモリの割合を設定します。workload groupメモリ制限の絶対値は：`physical_memory * mem_limit * memory_limit` となります。ここでmem_limitはBE設定項目です。システム内のすべてのworkload groupのmemory_limitの合計は100%を超えてはいけません。workload groupは、ほとんどの場合、グループ内のタスクに対してmemory_limitを使用することが保証されます。workload groupのメモリ使用量がこの制限を超えた場合、より大きなメモリ使用量を持つグループ内のタスクが、超過メモリを解放するためにキャンセルされる場合があります。enable_memory_overcommitを参照してください。 | Y |
| `<enable_memory_overcommit>` | workload groupのソフトメモリ分離を有効にします。デフォルトはfalseです。falseに設定した場合、workload groupはハードメモリ分離され、workload groupのメモリ使用量が制限を超えた直後に、最大メモリ使用量のタスクが即座にキャンセルされ、超過メモリが解放されます。trueに設定した場合、workload groupはソフト分離され、システムに空きメモリリソースがあれば、workload groupはmemory_limit制限を超えた後もシステムメモリを継続使用でき、システム全体のメモリが逼迫した際に、最大メモリ占有量を持つグループ内の複数のタスクをキャンセルし、超過メモリの一部を解放してシステムメモリ圧迫を緩和します。workload groupでこの設定を有効にする場合、すべてのworkload groupのmemory_limitの合計を100%未満にし、残りの部分をworkload groupメモリオーバーコミット用に使用することが推奨されます。 | Y |


## Examples

1. g1という名前のworkload groupを変更：

    ```sql
    alter workload group g1
    properties (
        "cpu_share"="30",
        "memory_limit"="30%"
    );
    ```
