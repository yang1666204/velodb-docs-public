---
{
  "title": "概要",
  "language": "ja"
}
---
ワークロード管理はDorisの非常に重要な機能であり、システム全体の管理において重要な役割を果たします。適切なワークロード管理戦略により、リソース使用率を最適化し、システムの安定性を向上させ、応答時間を短縮することができます。以下の機能があります：

- リソース分離：複数のグループに分割し、各グループにリソース（CPU、Memory、IO）制限を設定することで、複数のユーザー間や同じユーザーの異なるタスク（読み書き操作など）間で干渉が発生しないことを保証します。

- 同時実行制御とキューイング：クラスタ全体で同時に実行できるタスク数を制限できます。閾値を超えた場合、タスクはキューに入れられます。

- サーキットブレーカー：クエリ計画段階または実行段階において、読み取り予定のパーティション数の推定値、スキャンするデータ量、割り当てられたメモリサイズ、実行時間などの条件に基づいて、タスクを自動的にキャンセルできます。これにより、不適切なタスクがシステムリソースを過度に占有することを防ぎます。


## リソース分離方法

Dorisは以下の3つの方法でリソースを分割できます：

- Resource Group：複数のBEプロセスをグループに分け、各BEにtagを設定します。

- Workload Group：BE内のリソース（CPU、Memory、IO）をCgroupを通じて複数のリソースグループに分割し、より細かい粒度のリソース分離を可能にします。


以下の表は、異なるリソース分割方法の特徴と有利なシナリオを記録しています：

| Resource Isolation Method	      | Isolation Granularity	| Soft/Hard Limit |  Cross Resource Group Query |
| ---------- | ----------- |-----|-----|
| Resource Group | BE node level, with complete resource isolation, can isolate BE failures      |   Hard limit  |Not support. And it is necessary to ensure that at least one copy of data is stored within the resource group.    |
| Workload Group | Isolation within BE process; cannot isolate BE failures                                                          | Both hard and soft limit    | Support    |

## Soft LimitとHard Limit


- Hard Limit：Hard limitとは、テナントが超えることができないリソース使用量の絶対的な上限を指します。Hard limitに達すると、超過分のリソース要求は拒否されます。Hard limitは一般的に、クラスタ内のリソース枯渇や異なるビジネス間のリソース競合を防ぎ、クラスタの安定性とパフォーマンスを保証するために使用されます。

- Soft Limit：Soft limitは超過可能なリソース制限であり、通常はリソース使用量の推奨上限を表します。システムが忙しくないとき、テナントがSoft limitを超えるリソースを要求した場合、他のグループからリソースを借りることができます。システムが忙しくリソース競合が発生している場合、テナントがSoft limitを超えるリソースを要求しても、追加のリソースを取得することはできません。

Resource Group / Compute Groupの方法でリソースを分割する場合、Hard limitモードのみがサポートされます。Workload Groupの方法でリソースを分割する場合、Workload GroupのSoft limitとHard limitの両方がサポートされます。Workload GroupのSoft limitは通常、一時的なクエリピークやデータ書き込みの短期的な増加など、突発的なリソース制御に使用されます。
