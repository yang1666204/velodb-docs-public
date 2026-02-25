---
{
  "title": "SSDとHDDの階層ストレージ",
  "description": "Dorisは異なるディスクタイプ（SSDとHDD）間での階層化ストレージをサポートしています。",
  "language": "ja"
}
---
Dorisは異なるディスクタイプ（SSDとHDD）間の階層ストレージをサポートしており、動的パーティショニング機能と組み合わせて、ホットデータとコールドデータの特性に基づいてSSDからHDDにデータを動的に移行します。このアプローチにより、ホットデータの読み書きで高いパフォーマンスを維持しながら、ストレージコストを削減します。

## 動的パーティショニングと階層ストレージ

テーブルの動的パーティショニングパラメータを設定することで、ユーザーはどのパーティションをSSDに格納し、冷却後に自動的にHDDに移行するかを設定できます。

- **ホットパーティション**: 最近アクティブなパーティションで、高いパフォーマンスを確保するためにSSDに格納することが優先されます。
- **コールドパーティション**: アクセス頻度が低いパーティションで、ストレージコストを削減するために徐々にHDDに移行されます。

動的パーティショニングの詳細については、次を参照してください：[Data Partitioning - Dynamic Partitioning](../../table-design/data-partitioning/dynamic-partitioning)

## パラメータ説明

### `dynamic_partition.hot_partition_num`

- **機能**:
  - 最新のパーティションのうち何個がホットパーティションかを指定します。これらはSSDに格納され、残りのパーティションはHDDに格納されます。

- **注意**:
  - `"dynamic_partition.storage_medium" = "HDD"`を同時に設定する必要があります。設定しない場合、このパラメータは効果がありません。
  - ストレージパスにSSDデバイスがない場合、この設定はパーティション作成を失敗させます。

**例の説明**:

現在の日付が**2021-05-20**で、日次パーティショニングを行う場合、動的パーティショニング設定は次のようになります：

```sql
    "dynamic_partition.time_unit" = "DAY",
    "dynamic_partition.hot_partition_num" = 2
    "dynamic_partition.start" = -3
    "dynamic_partition.end" = 3
```
システムは以下のパーティションを自動的に作成し、そのストレージメディアとクーリング時間を設定します：

  ```Plain
  p20210517：["2021-05-17", "2021-05-18") storage_medium=HDD storage_cooldown_time=9999-12-31 23:59:59
  p20210518：["2021-05-18", "2021-05-19") storage_medium=HDD storage_cooldown_time=9999-12-31 23:59:59
  p20210519：["2021-05-19", "2021-05-20") storage_medium=SSD storage_cooldown_time=2021-05-21 00:00:00
  p20210520：["2021-05-20", "2021-05-21") storage_medium=SSD storage_cooldown_time=2021-05-22 00:00:00
  p20210521：["2021-05-21", "2021-05-22") storage_medium=SSD storage_cooldown_time=2021-05-23 00:00:00
  p20210522：["2021-05-22", "2021-05-23") storage_medium=SSD storage_cooldown_time=2021-05-24 00:00:00
  p20210523：["2021-05-23", "2021-05-24") storage_medium=SSD storage_cooldown_time=2021-05-25 00:00:00
  ```
### `dynamic_partition.storage_medium`

- **機能**:
  - 動的パーティションの最終的なストレージメディアを指定します。デフォルトはHDDですが、SSDを選択することもできます。

- **注意**:
  - SSDに設定した場合、`hot_partition_num`属性は効果がなくなり、すべてのパーティションはデフォルトでSSDストレージメディアとなり、クーリング時間は9999-12-31 23:59:59に設定されます。

## 例

### 1. dynamic_partitionでテーブルを作成する

```sql
    CREATE TABLE tiered_table (k DATE)
    PARTITION BY RANGE(k)()
    DISTRIBUTED BY HASH (k) BUCKETS 5
    PROPERTIES
    (
        "dynamic_partition.storage_medium" = "hdd",
        "dynamic_partition.enable" = "true",
        "dynamic_partition.time_unit" = "DAY",
        "dynamic_partition.hot_partition_num" = "2",
        "dynamic_partition.end" = "3",
        "dynamic_partition.prefix" = "p",
        "dynamic_partition.buckets" = "5",
        "dynamic_partition.create_history_partition"= "true",
        "dynamic_partition.start" = "-3"
    );
```
### 2. パーティションのストレージメディアを確認する

```sql
    SHOW PARTITIONS FROM tiered_table;
```
7つのパーティションを用意する必要があり、そのうち5つはストレージメディアとしてSSDを使用し、残りの2つはHDDを使用します。

```Plain
  p20210517：["2021-05-17", "2021-05-18") storage_medium=HDD storage_cooldown_time=9999-12-31 23:59:59
  p20210518：["2021-05-18", "2021-05-19") storage_medium=HDD storage_cooldown_time=9999-12-31 23:59:59
  p20210519：["2021-05-19", "2021-05-20") storage_medium=SSD storage_cooldown_time=2021-05-21 00:00:00
  p20210520：["2021-05-20", "2021-05-21") storage_medium=SSD storage_cooldown_time=2021-05-22 00:00:00
  p20210521：["2021-05-21", "2021-05-22") storage_medium=SSD storage_cooldown_time=2021-05-23 00:00:00
  p20210522：["2021-05-22", "2021-05-23") storage_medium=SSD storage_cooldown_time=2021-05-24 00:00:00
  p20210523：["2021-05-23", "2021-05-24") storage_medium=SSD storage_cooldown_time=2021-05-25 00:00:00
```
### 3. パーティションの手動階層化

個別のパーティションの`storage_medium`プロパティを更新することで、ストレージ階層間でパーティションを手動で移動できます。たとえば、パーティションをHDDストレージに移動するには：

```sql
MODIFY PARTITION (partition_name) SET ("storage_medium" = "HDD");
```
この操作により、パーティションのストレージポリシーが更新され、Dorisがそれに応じてデータの再配置を実行します。

### 4. ヘテロジニアスクラスタでの手動階層化

ヘテロジニアスクラスタ構成では、ホットデータ用のSSDバックエンドノードとコールドデータ用のHDDバックエンドノードを混在してデプロイすることが一般的です。このような環境でよくある問題は、これらのノードをlocation tagを使用して区別し損なうことです。

すべてのbackendがデフォルトのlocation tagを共有している場合、DorisはパーティションをHDDに階層化できない可能性があります。これは、パーティションが元々SSDノード上に配置されており、Dorisが同一backend上でHDDストレージメディアを見つけることができないために発生します。

この問題を回避するには：

1. **コールド（HDD）backendに固有のlocationでタグ付けする**
    
例えば：

```sql
ALTER SYSTEM MODIFY BACKEND "cold_node1:9050" SET ("tag.location" = "archive");
```
2. **パーティションを変更する際は、タグ付けされたバックエンドを明示的にターゲットとする**

希望するストレージメディアとレプリケーション割り当ての両方を指定してください：

```sql
MODIFY PARTITION (partition_name) SET ("storage_medium" = "HDD", "replication_allocation" = "tag.location.archive:1");
```
パーティションのレプリケーションポリシーでロケーションタグを割り当てて参照することで、Dorisは異種クラスター内のHDDベースのノードにコールドデータを正しく配置できます。
