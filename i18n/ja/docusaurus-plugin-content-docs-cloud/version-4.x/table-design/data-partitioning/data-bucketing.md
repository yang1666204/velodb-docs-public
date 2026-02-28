---
{
  "title": "データバケッティング",
  "description": "パーティションは、ビジネスロジックに基づいてさらに異なるデータバケットに分割することができます。各バケットは物理的なデータタブレットとして保存されます。",
  "language": "ja"
}
---
パーティションはビジネスロジックに基づいて、さらに異なるデータバケットに分割することができます。各バケットは物理的なデータタブレットとして保存されます。適切なバケット戦略により、クエリ時にスキャンするデータ量を効果的に削減し、クエリパフォーマンスを向上させ、クエリの同時実行数を増加させることができます。

## Bucket方式

DorisはHash BucketingとRandom Bucketingの2つのbucket方式をサポートしています。

### Hash Bucketing

Tableを作成する際やパーティションを追加する際、ユーザーはバケットカラムとして1つまたは複数のカラムを選択し、バケット数を指定する必要があります。同一パーティション内では、システムはバケットキーとバケット数に基づいてハッシュ計算を実行します。同じハッシュ値を持つデータは同じバケットに割り当てられます。例えば、下図では、パーティションp250102がregionカラムに基づいて3つのバケットに分割され、同じハッシュ値を持つ行が同じバケットに配置されます。

![hash-bucket](/images/table-desigin/hash-bucket.png)

以下のシナリオでHash Bucketingの使用を推奨します：

* ビジネスで特定のフィールドに基づく絞り込みを頻繁に行う必要がある場合、このフィールドをバケットキーとしてHash Bucketingに使用することで、クエリ効率を向上させることができます。

* Table内のデータ分布が比較的均一である場合、Hash Bucketingも適切な選択です。

以下の例では、Hash Bucketingを使用してTableを作成する方法を示します。詳細な構文については、CREATE TABLE文を参照してください。

```sql
CREATE TABLE demo.hash_bucket_tbl(
    oid         BIGINT,
    dt          DATE,
    region      VARCHAR(10),
    amount      INT
)
DUPLICATE KEY(oid)
PARTITION BY RANGE(dt) (
    PARTITION p250101 VALUES LESS THAN("2025-01-01"),
    PARTITION p250102 VALUES LESS THAN("2025-01-02")
)
DISTRIBUTED BY HASH(region) BUCKETS 8;
```
この例では、`DISTRIBUTED BY HASH(region)`でHash Bucketingの作成を指定し、`region`列をバケットキーとして選択しています。一方、`BUCKETS 8`で8個のバケットの作成を指定しています。


### Random Bucketing

各パーティション内で、Random Bucketingは特定のフィールドのハッシュ値に依存せずに、データを様々なバケットにランダムに分散します。Random Bucketingは均等なデータ分散を保証し、不適切なバケットキー選択によるデータスキューを回避します。

データインポート中、単一のインポートジョブの各バッチはタブレットにランダムに書き込まれ、均等なデータ分散を保証します。例えば、1つの操作で、8バッチのデータがパーティション`p250102`配下の3つのバケットにランダムに割り当てられます。

![random-bucket](/images/table-desigin/random-bucket.png)

Random Bucketingを使用する場合、シングルタブレットインポートモード（`load_to_single_tablet`を`true`に設定）を有効にできます。大規模データインポート時、1バッチのデータは1つのデータタブレットにのみ書き込まれ、データインポートの並行性とスループットの向上、データインポートとCompactionによる書き込み増幅の削減に役立ち、クラスターの安定性を保証します。

以下のシナリオでRandom Bucketingの使用を推奨します：

* 任意の次元分析のシナリオで、ビジネスが特定の列に基づくフィルタリングや結合クエリを頻繁に行わない場合、Random Bucketingを選択できます。

* 頻繁にクエリされる列や列の組み合わせのデータ分散が極端に不均等な場合、Random Bucketingを使用することでデータスキューを回避できます。

* Random Bucketingはバケットキーに基づくプルーニングができず、ヒットしたパーティション内のすべてのデータをスキャンするため、ポイントクエリシナリオには推奨されません。

* DUPLICATETableのみがRandom partitioningを使用できます。UNIQUETableとAGGREGATETableはRandom Bucketingを使用できません。

以下の例は、Random Bucketingを使用したTableの作成方法を示しています。詳細な構文については、CREATE TABLE文を参照してください：

```sql
CREATE TABLE demo.random_bucket_tbl(
    oid         BIGINT,
    dt          DATE,
    region      VARCHAR(10),
    amount      INT
)
DUPLICATE KEY(oid)
PARTITION BY RANGE(dt) (
    PARTITION p250101 VALUES LESS THAN("2025-01-01"),
    PARTITION p250102 VALUES LESS THAN("2025-01-02")
)
DISTRIBUTED BY RANDOM BUCKETS 8;
```
この例では、`DISTRIBUTED BY RANDOM`文がRandom Bucketingの使用を指定しています。Random Bucketingの作成ではbucket keyの選択は不要で、`BUCKETS 8`文が8つのbucketの作成を指定しています。

## バケット Keyの選択

:::tip Note

Hash BucketingのみがBucket Keyの選択を必要とし、Random BucketingはBucket Keyの選択を必要としません。

:::

バケット keyは1つまたは複数のカラムにできます。DUPLICATETableの場合、任意のKeyカラムまたはValueカラムをbucket keyとして使用できます。AGGREGATEまたはUNIQUETableの場合、段階的な集約を確保するため、bucketカラムはKeyカラムである必要があります。

一般的に、以下のルールに基づいてbucket keyを選択できます：

* **クエリフィルタ条件の使用：** Hash Bucketingにクエリフィルタ条件を使用することで、データプルーニングを支援し、データスキャン量を削減します。

* **高カーディナリティカラムの使用：** Hash Bucketingに高カーディナリティ（多数の一意の値）カラムを選択することで、各bucket間でデータを均等に分散させることができます。

* **高並行性ポイントクエリシナリオ：** bucketingには単一カラムまたは少ないカラムを選択することを推奨します。ポイントクエリは1つのbucketのスキャンのみをトリガーする可能性があり、異なるクエリが異なるbucketのスキャンをトリガーする確率が高いため、クエリ間のIO影響を削減します。

* **高スループットクエリシナリオ：** データをより均等に分散させるため、bucketingには複数のカラムを選択することを推奨します。クエリ条件がすべてのbucket keyの等価条件を含めない場合、クエリスループットが向上し、単一クエリのレイテンシが削減されます。

## Bucket数の選択

Dorisでは、bucketは物理ファイル（tablet）として格納されます。Table内のtablet数は`partition_num`（パーティション数）に`bucket_num`（bucket数）を掛けた値と等しくなります。Partition数が指定されると、変更することはできません。

bucket数を決定する際は、事前にマシン拡張を考慮する必要があります。バージョン2.0以降、Dorisはマシンリソースとクラスタ情報に基づいて、パーティション内のbucket数を自動的に設定することをサポートしています。

### Bucket数の手動設定

`DISTRIBUTED`文を使用してbucket数を指定できます：

```sql
-- Set hash bucket num to 8
DISTRIBUTED BY HASH(region) BUCKETS 8

-- Set random bucket num to 8
DISTRIBUTED BY RANDOM BUCKETS 8
```
buckets数を決定する際、通常2つの原則に従います：数量と容量です。この2つが競合する場合は、容量原則が優先されます：

* **容量原則：** tabletのサイズは1-10GBの範囲内にすることを推奨します。tabletが小さすぎると、集約効果が低下し、メタデータ管理の負荷が増加する可能性があります。tabletが大きすぎると、レプリカの移行と補完に適さず、Schema Change操作の再試行コストが増加します。

* **数量原則：** 拡張を考慮しない場合、Tableのtablet数は、クラスタ全体のディスク数よりわずかに多くすることを推奨します。

例えば、BEマシンが10台で、各BEにディスクが1つある場合を想定すると、データのbucketingについて以下の推奨事項に従うことができます：

| Tableサイズ | 推奨buckets数 |
| ---------- | -------------------------------------- |
| 500MB      | 4-8 buckets                            |
| 5GB        | 6-16 buckets                           |
| 50GB       | 32 buckets                             |
| 500GB      | パーティション推奨、パーティションあたり50GB、パーティションあたり16-32 buckets |
| 5TB        | パーティション推奨、パーティションあたり50GB、パーティションあたり16-32 buckets |

:::tip Note

Tableのデータ量は`SHOW DATA`コマンドを使用して確認できます。結果は、レプリカ数とTableのデータ量で除算する必要があります。

:::

### 自動bucket数設定

自動bucket数計算機能は、一定期間のパーティションサイズに基づいて将来のパーティションサイズを自動的に予測し、それに応じてbuckets数を決定します。

```sql
-- Set hash bucket auto
DISTRIBUTED BY HASH(region) BUCKETS AUTO
properties("estimate_partition_size" = "20G")

-- Set random bucket auto
DISTRIBUTED BY RANDOM BUCKETS AUTO
properties("estimate_partition_size" = "20G")
```
bucketを作成する際、`estimate_partition_size`属性を通じて推定パーティションサイズを調整できます。このパラメータはオプションであり、指定されない場合、Dorisはデフォルトで10GBに設定されます。このパラメータは、システムが過去のパーティションデータに基づいて算出する将来のパーティションサイズとは関係がないことに注意してください。

## データBucketのメンテナンス

:::tip Note

現在、Dorisは新しく追加されたパーティションでのbucket数の変更のみをサポートしており、以下の操作はサポートしていません：

1. bucketingタイプの変更
2. bucket keyの変更
3. 既存bucketのbucket数の変更

:::

Tableを作成する際、各パーティションのbucket数は`DISTRIBUTED`文を通じて統一的に指定されます。データの増加や減少に対応するため、パーティションを動的に追加する際に新しいパーティションのbucket数を指定できます。以下の例では、`ALTER TABLE`コマンドを使用して新しく追加されたパーティションのbucket数を変更する方法を示します：

```sql
-- Modify hash bucket table
ALTER TABLE demo.hash_bucket_tbl 
ADD PARTITION p250103 VALUES LESS THAN("2025-01-03")
DISTRIBUTED BY HASH(region) BUCKETS 16;

-- Modify random bucket table
ALTER TABLE demo.random_bucket_tbl 
ADD PARTITION p250103 VALUES LESS THAN("2025-01-03")
DISTRIBUTED BY RANDOM BUCKETS 16;

-- Modify dynamic partition table
ALTER TABLE demo.dynamic_partition_tbl
SET ("dynamic_partition.buckets"="16");
```
バケット数を変更した後、SHOW PARTITION コマンドを使用して更新されたバケット数を確認できます。
