---
{
  "title": "データのバケッティング",
  "description": "パーティションは、ビジネスロジックに基づいてさらに異なるデータバケットに分割できます。各バケットは物理的なデータタブレットとして格納されます。",
  "language": "ja"
}
---
パーティションは、ビジネスロジックに基づいてさらに異なるデータバケットに分割することができます。各バケットは物理的なデータtabletとして格納されます。適切なバケット戦略により、クエリ時にスキャンされるデータ量を効果的に削減し、クエリパフォーマンスの向上とクエリ並行性の増加を実現できます。

## バケット Methods

DorisはHash BucketingとRandom Bucketingの2つのバケット方式をサポートしています。

### Hash Bucketing

Tableの作成時またはパーティションの追加時に、ユーザーは1つ以上のカラムをバケットカラムとして選択し、バケット数を指定する必要があります。同一パーティション内で、システムはバケットキーとバケット数に基づいてハッシュ計算を実行します。同じハッシュ値を持つデータは同じバケットに割り当てられます。例えば、下図では、パーティションp250102がregionカラムに基づいて3つのバケットに分割され、同じハッシュ値を持つ行が同じバケットに配置されています。

![hash-bucket](/images/table-desigin/hash-bucket.png)

以下のシナリオでHash Bucketingの使用を推奨します:

* ビジネスで特定のフィールドに基づくフィルタリングが頻繁に必要な場合、このフィールドをバケットキーとしてHash Bucketingに使用することで、クエリ効率を向上させることができます。

* Table内のデータ分布が比較的均一な場合、Hash Bucketingも適切な選択肢です。

以下の例は、Hash BucketingでTableを作成する方法を示しています。詳細な構文については、CREATE TABLE文を参照してください。

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
この例では、`DISTRIBUTED BY HASH(region)`がHash Bucketingの作成を指定し、`region`列をバケットキーとして選択しています。一方、`BUCKETS 8`は8個のバケットの作成を指定しています。

### Random Bucketing

各パーティション内で、Random Bucketingは特定のフィールドのハッシュ値に依存せず、データをさまざまなバケットにランダムに分散します。Random Bucketingは均一なデータ分散を保証し、不適切なバケットキー選択によって引き起こされるデータスキューを回避します。

データインポート中、単一のインポートジョブの各バッチはランダムにタブレットに書き込まれ、均一なデータ分散を保証します。例えば、1つの操作で、8つのデータバッチがパーティション`p250102`の下の3つのバケットにランダムに割り当てられます。

![random-bucket](/images/table-desigin/random-bucket.png)

Random Bucketingを使用する際、単一タブレットインポートモード（`load_to_single_tablet`を`true`に設定）を有効にできます。大規模なデータインポート中、1つのデータバッチは1つのデータタブレットにのみ書き込まれ、データインポートの並行性とスループットの向上に役立ち、データインポートとCompactionによって引き起こされる書き込み増幅を削減し、クラスタの安定性を保証します。

以下のシナリオでRandom Bucketingの使用を推奨します：

* 任意の次元分析のシナリオでは、ビジネスが特定の列に基づいて頻繁にフィルタリングまたは結合クエリを行わない場合、Random Bucketingを選択できます。

* 頻繁にクエリされる列または列の組み合わせのデータ分散が極端に不均一な場合、Random Bucketingを使用することでデータスキューを回避できます。

* Random Bucketingはバケットキーに基づいたプルーニングができず、ヒットしたパーティション内のすべてのデータをスキャンするため、ポイントクエリシナリオには推奨されません。

* DUPLICATETableのみがRandom partitioningを使用できます。UNIQUETableとAGGREGATETableはRandom Bucketingを使用できません。

以下の例では、Random Bucketingを使用してTableを作成する方法を示しています。詳細な構文については、CREATE TABLE文を参照してください：

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
この例では、文 `DISTRIBUTED BY RANDOM` がRandom Bucketingの使用を指定しています。Random Bucketingを作成する場合、バケットキーを選択する必要がなく、文 `BUCKETS 8` が8個のバケットの作成を指定しています。

## バケットキーの選択

:::tip Note

Hash Bucketingのみがバケットキーの選択を必要とします。Random Bucketingはバケットキーの選択を必要としません。

:::

バケットキーは1つまたは複数の列にできます。DUPLICATETableの場合、任意のKey列またはValue列をバケットキーとして使用できます。AGGREGATEまたはUNIQUETableの場合、段階的な集約を確実にするため、バケット列はKey列である必要があります。

一般的に、以下のルールに基づいてバケットキーを選択できます：

* **クエリフィルタ条件の使用：** Hash Bucketingにクエリフィルタ条件を使用することで、データの刈り込みを行い、データスキャン量を削減します；

* **高カーディナリティ列の使用：** Hash Bucketingに高カーディナリティ（多くの一意の値）列を選択することで、各バケット間でデータを均等に分散するのに役立ちます；

* **高並行ポイントクエリシナリオ：** バケッティングには単一列またはより少ない列を選択することを推奨します。ポイントクエリは1つのバケットのスキャンのみをトリガーする可能性があり、異なるクエリが異なるバケットのスキャンをトリガーする確率が高いため、クエリ間のIOの影響を削減します。

* **高スループットクエリシナリオ：** データをより均等に分散させるため、バケッティングに複数の列を選択することを推奨します。クエリ条件がすべてのバケットキーの等価条件を含めることができない場合、クエリスループットが向上し、単一クエリの遅延が削減されます。

## バケット数の選択

Dorisでは、バケットは物理ファイル（tablet）として保存されます。Table内のタブレット数は、`partition_num`（パーティション数）に`bucket_num`（バケット数）を乗じた値と等しくなります。パーティション数が指定されると、それを変更することはできません。

バケット数を決定する際は、マシンの拡張を事前に考慮する必要があります。バージョン2.0以降、Dorisはマシンリソースとクラスタ情報に基づいて、パーティション内のバケット数を自動的に設定することをサポートしています。

### バケット数の手動設定

`DISTRIBUTED`文を使用してバケット数を指定できます：

```sql
-- Set hash bucket num to 8
DISTRIBUTED BY HASH(region) BUCKETS 8

-- Set random bucket num to 8
DISTRIBUTED BY RANDOM BUCKETS 8
```
bucketの数を決定する際、通常は量と サイズの2つの原則に従います。この2つに矛盾がある場合は、サイズの原則が優先されます：

* **サイズの原則：** tabletのサイズは1-10GBの範囲内に収めることが推奨されます。tabletが小さすぎると集約効果が悪くなり、メタデータ管理の負荷が増加する可能性があります；tabletが大きすぎるとレプリカの移行と補完に不利であり、Schema Change操作の再試行コストが増加します。

* **量の原則：** 拡張を考慮しない場合、Tableのtablet数はクラスター全体のディスク数よりもわずかに多くすることが推奨されます。

例えば、BEマシンが10台でBEあたり1つのディスクがあると仮定した場合、データのbucketingについて以下の推奨事項に従うことができます：

| Tableサイズ | 推奨bucket数          |
| ---------- | -------------------------------------- |
| 500MB      | 4-8 buckets                            |
| 5GB        | 6-16 buckets                           |
| 50GB       | 32 buckets                             |
| 500GB      | Partitionを推奨、パーティションあたり50GB、パーティションあたり16-32 buckets |
| 5TB        | Partitionを推奨、パーティションあたり50GB、パーティションあたり16-32 buckets |

:::tip Note

Tableのデータ量は`SHOW DATA`コマンドを使用して確認できます。結果はレプリカ数とTableのデータ量で割る必要があります。

:::

### 自動bucket数設定

自動bucket数計算機能は、一定期間のパーティションサイズに基づいて将来のパーティションサイズを自動的に予測し、それに応じてbucket数を決定します。

```sql
-- Set hash bucket auto
DISTRIBUTED BY HASH(region) BUCKETS AUTO
properties("estimate_partition_size" = "20G")

-- Set random bucket auto
DISTRIBUTED BY HASH(region) BUCKETS AUTO
properties("estimate_partition_size" = "20G")
```
バケットを作成する際、`estimate_partition_size`属性を通じて推定パーティションサイズを調整できます。このパラメータはオプションであり、提供されない場合、Dorisはデフォルトで10GBに設定します。このパラメータは、システムが過去のパーティションデータに基づいて計算する将来のパーティションサイズとは関係ないことに注意してください。

## データバケットの管理

:::tip 注記

現在、Dorisは新しく追加されたパーティションのバケット数の変更のみをサポートしており、以下の操作はサポートしていません：

1. バケットタイプの変更
2. バケットキーの変更
3. 既存のバケットのバケット数の変更

:::

Tableを作成する際、各パーティションのバケット数は`DISTRIBUTED`文を通じて統一的に指定されます。データの増加や減少に対応するため、パーティションを動的に追加する際に新しいパーティションのバケット数を指定できます。以下の例は、`ALTER TABLE`コマンドを使用して新しく追加されたパーティションのバケット数を変更する方法を示します：

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
