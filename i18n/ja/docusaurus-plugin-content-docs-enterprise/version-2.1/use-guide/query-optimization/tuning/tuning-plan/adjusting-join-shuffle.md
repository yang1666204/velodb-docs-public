---
{
  "title": "Hint を使用した Join Shuffle Mode の調整",
  "description": "Dorisは、Join操作におけるデータシャッフルの種類を調整するためのヒントの使用をサポートしており、これによりクエリパフォーマンスを最適化します。",
  "language": "ja"
}
---
## 概要

Dorisは、Join操作におけるデータshuffleの種類を調整するためのhintの使用をサポートしており、これによりクエリパフォーマンスを最適化できます。このセクションでは、Dorisでhintを使用してJoin Shuffleタイプを指定する方法について詳細な手順を提供します。

:::caution Note
現在、Dorisは優れたout-of-the-box機能を備えています。これは、ほとんどのシナリオにおいて、Dorisがさまざまなシナリオでパフォーマンスを適応的に最適化し、ユーザーはパフォーマンスチューニングのためにhintを手動で制御する必要がないことを意味します。この章で紹介する内容は主に専門的なチューナー向けであり、業務担当者は簡単な理解のみで十分です。
:::

現在、Dorisは2つの独立したDistribute Hint、`[shuffle]`と`[broadcast]`をサポートしており、Joinにおける右側のTableのDistribute Typeを指定できます。Distribute Typeは、Joinにおける右側のTableの前に配置し、角括弧`[]`で囲む必要があります。また、DorisはLeading HintとDistribute Hintを組み合わせて使用することでshuffleモードを指定することができます（詳細については、[Reordering Join With Leading Hint](reordering-join-with-leading-hint.md)を参照してください）。

例は以下の通りです：

```sql
SELECT COUNT(*) FROM t2 JOIN [broadcast] t1 ON t1.c1 = t2.c2;
SELECT COUNT(*) FROM t2 JOIN [shuffle] t1 ON t1.c1 = t2.c2;
```
## Case

次に、例を通じてDistribute Hintsの使用方法を説明します。

```sql
EXPLAIN SHAPE PLAN SELECT COUNT(*) FROM t1 JOIN t2 ON t1.c1 = t2.c2;
```
元のSQLのプランは以下の通りで、t1とt2間の結合が`DistributionSpecHash`で示されるハッシュ分散方式を使用していることがわかります。

```sql
+----------------------------------------------------------------------------------+  
| Explain String (Nereids Planner)                                                 |  
+----------------------------------------------------------------------------------+  
| PhysicalResultSink                                                               |  
| --hashAgg [GLOBAL]                                                               |  
| ----PhysicalDistribute [DistributionSpecGather]                                  |  
| ------hashAgg [LOCAL]                                                            |  
| --------PhysicalProject                                                          |  
| ----------hashJoin [INNER_JOIN] hashCondition=((t1.c1 = t2.c2)) otherCondition=()|  
| ------------PhysicalProject                                                      |  
| --------------PhysicalOlapScan [t1]                                              |  
| ------------PhysicalDistribute [DistributionSpecHash]                            |  
| --------------PhysicalProject                                                    |  
| ----------------PhysicalOlapScan [t2]                                            |  
+----------------------------------------------------------------------------------+
```
[broadcast] ヒントを追加した後:

```sql
EXPLAIN SHAPE PLAN SELECT COUNT(*) FROM t1 JOIN [broadcast] t2 ON t1.c1 = t2.c2;
```
t1とt2間のjoinの分散方式が、`DistributionSpecReplicated`で示されるbroadcast方式に変更されたことが確認できます。

```sql
+----------------------------------------------------------------------------------+  
| Explain String (Nereids Planner)                                                 |  
+----------------------------------------------------------------------------------+  
| PhysicalResultSink                                                               |  
| --hashAgg [GLOBAL]                                                               |  
| ----PhysicalDistribute [DistributionSpecGather]                                  |  
| ------hashAgg [LOCAL]                                                            |  
| --------PhysicalProject                                                          |  
| ----------hashJoin [INNER_JOIN] hashCondition=((t1.c1 = t2.c2)) otherCondition=()|  
| ------------PhysicalProject                                                      |  
| --------------PhysicalOlapScan [t1]                                              |  
| ------------PhysicalDistribute [DistributionSpecReplicated]                      |  
| --------------PhysicalProject                                                    |  
| ----------------PhysicalOlapScan [t2]                                            | 
+----------------------------------------------------------------------------------+
```
## 要約

Distribute Hintsを適切に使用することで、Join操作のshuffleモードを最適化し、クエリパフォーマンスを向上させることができます。実際には、まずEXPLAINを使用してクエリ実行計画を分析し、実際の状況に基づいて適切なshuffleタイプを指定することが推奨されます。
