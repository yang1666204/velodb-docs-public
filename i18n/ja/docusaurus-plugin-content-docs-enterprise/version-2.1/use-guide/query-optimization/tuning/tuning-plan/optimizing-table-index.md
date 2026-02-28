---
{
  "title": "Tableインデックス設計の最適化",
  "description": "Dorisは現在、2つのタイプのインデックスをサポートしています：",
  "language": "ja"
}
---
## 概要

Dorisは現在、2種類のインデックスをサポートしています：

1. Built-in Indexes：これにはprefix indexes、ZoneMap indexesなどが含まれます。
2. Secondary Indexes：これにはinverted indexes、Bloom filter indexes、N-Gram Bloom filter indexes、Bitmap indexesなどが含まれます。

ビジネス最適化のプロセスにおいて、ビジネス特性を十分に分析し、インデックスを効果的に活用することで、クエリと分析の効果を大幅に向上させ、パフォーマンスチューニングの目的を達成することができます。

各種インデックスの詳細な説明については、[Table Index](../../../table-design/index/index-overview.md)セクションを参照してください。この章では、実際のケースの観点から、いくつかの典型的なシナリオにおけるインデックス使用技術を実証し、ビジネスチューニングの参考として最適化の提案をまとめます。

## Case 1：Key Columnsの順序の最適化によるPrefix Indexesを活用したクエリの高速化

[optimizing table schema design](optimizing-table-schema.md)では、適切なフィールドをkeyフィールドとして選択し、Dorisのkey column sorting機能を利用してクエリを高速化する方法を紹介しました。このケースでは、このシナリオをさらに詳しく説明します。

Dorisの内蔵prefix index機能により、Table作成時にTableのKeyの最初の36バイトがprefix indexとして自動的に取得されます。クエリ条件がprefix indexのprefixと一致する場合、クエリを大幅に高速化できます。以下はTable定義の例です：

```sql
CREATE TABLE `t1` (
  `c1` VARCHAR(10) NULL,
  `c2` VARCHAR(10) NULL
) ENGINE=OLAP
DUPLICATE KEY(`c1`)
DISTRIBUTED BY HASH(`c2`) BUCKETS 10
PROPERTIES (
"replication_allocation" = "tag.location.default: 1"
);
```
対応するビジネスSQLパターンは以下の通りです：

```sql
select * from t1 where t1.c2 = '1';
select * from t1 where t1.c2 in ('1', '2', '3');
```
上記のスキーマ定義では、`c1`が`c2`より前に配置されています。しかし、クエリはフィルタリングに`c2`フィールドを使用しています。この場合、プレフィックスインデックスの高速化機能を活用できません。最適化するために、`c1`と`c2`の定義順序を調整し、`c2`カラムを最初のフィールド位置に配置してプレフィックスインデックスの高速化機能を活用できます。

調整されたスキーマは以下の通りです：

```sql
CREATE TABLE `t1` (
  `c2` VARCHAR(10) NULL,
  `c1` VARCHAR(10) NULL
) ENGINE=OLAP
DUPLICATE KEY(`c2`)
DISTRIBUTED BY HASH(`c1`) BUCKETS 10
PROPERTIES (
"replication_allocation" = "tag.location.default: 1"
);
```
:::tip

スキーマのカラム順序を定義する際は、ビジネスクエリフィルタリングにおける高頻度かつ高優先度のカラムを参照し、Dorisのprefix index加速機能を最大限に活用してください。

:::

## ケース2：Inverted Indexを使用したクエリ加速

Dorisは、テキストタイプの等値、範囲、全文検索などのビジネスシナリオを加速するセカンダリインデックスとしてinverted indexをサポートしています。inverted indexの作成と管理は独立しており、元のTableスキーマに影響を与えることなく、またTableデータを再インポートする必要もなく、便利なビジネスパフォーマンス最適化を可能にします。

典型的な使用シナリオ、構文、ケースについては、[Table Index - Inverted Index](../../../table-design/index/inverted-index)セクションで詳細に紹介されているため、本章では説明を繰り返しません。

:::tip

テキストタイプの全文検索や、string、numeric、datetime型フィールドの等値または範囲クエリには、inverted indexを利用してクエリを加速できます。特に、元のTable構造とキー定義の最適化が困難な場合や、Tableデータの再インポートコストが高い場合など、特定の状況において、inverted indexはビジネス実行パフォーマンスを最適化する柔軟な加速ソリューションを提供します。

:::

## まとめ

スキーマチューニングにおいて、Tableレベルのスキーマ最適化に加えて、インデックス最適化も重要な位置を占めています。Dorisは、prefix indexなどの組み込みインデックスや、inverted indexなどのセカンダリインデックスを含む複数のインデックスタイプを提供し、パフォーマンス加速に強力なサポートを提供します。これらのインデックスを合理的に活用することで、複数のシナリオにおけるビジネスクエリと分析の速度を大幅に向上させることができ、マルチシナリオのビジネスクエリと分析にとって大きな意義があります。
