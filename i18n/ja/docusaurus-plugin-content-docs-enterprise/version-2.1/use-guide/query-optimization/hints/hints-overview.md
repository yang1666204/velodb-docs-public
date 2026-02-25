---
{
  "title": "Hintsの概要",
  "description": "Database Hintsは、データベースクエリオプティマイザに対して特定のプランを生成する方法を指示するために使用されるクエリ最適化技術です。Hintsを提供することにより、",
  "language": "ja"
}
---
Database Hintsは、データベースクエリオプティマイザーが特定のプランを生成する方法をガイドするために使用されるクエリ最適化技術です。Hintsを提供することで、ユーザーはクエリオプティマイザーのデフォルト動作を微調整し、より良いパフォーマンスの実現や特定の要件の満足を期待できます。
:::caution Note
現在、Dorisは優れたout-of-the-box機能を有しています。ほとんどのシナリオでは、Dorisはユーザーがビジネスチューニングのためにhintsを手動で制御する必要なく、様々な状況においてパフォーマンスを適応的に最適化します。本章で紹介する内容は主に専門的なチューニング担当者向けです。ビジネスユーザーは概要を理解していただければ十分です。
:::

## Hint分類

Dorisは現在、leading hint、ordered hint、distribute hintなど、いくつかのタイプのhintsをサポートしています：

- [Leading Hint](leading-hint.md)：leading hintで提供された順序に従って結合順序を指定します。
- [Ordered Hint](leading-hint.md)：元のテキストシーケンスとして結合順序を指定するleading hintの特定のタイプです。
- [Distribute Hint](distribute-hint.md)：結合のデータ分散方法をshuffleまたはbroadcastのいずれかに指定します。

## Hintの例
大量のデータを持つテーブルを想像してください。特定のケースでは、テーブルの結合順序がクエリパフォーマンスに影響を与える可能性があることを知っているかもしれません。そのような状況では、Leading Hintによってオプティマイザーに従わせたいテーブル結合順序を指定できます。

以下のSQLクエリを例に考えてください。実行効率が理想的でない場合、ユーザーの元のシナリオに影響を与えることなく、元のSQLを変更せずに結合順序を調整してチューニング目標を達成したいかもしれません。

```sql
mysql> explain shape plan select * from t1 join t2 on t1.c1 = c2;
+-------------------------------------------+
| Explain String                            |
+-------------------------------------------+
| PhysicalResultSink                        |
| --PhysicalDistribute                      |
| ----PhysicalProject                       |
| ------hashJoin[INNER_JOIN](t1.c1 = t2.c2) |
| --------PhysicalOlapScan[t2]              |
| --------PhysicalDistribute                |
| ----------PhysicalOlapScan[t1]            |
+-------------------------------------------+
```
この場合、Leading Hintを使用してt1とt2の結合順序を任意に変更することができます。例えば：

```sql
mysql> explain shape plan select  /*+ leading(t2 t1) */ * from t1 join t2 on t1.c1 = c2;
+-----------------------------------------------------------------------------------------------------+
| Explain String(Nereids Planner)                                                                     |
+-----------------------------------------------------------------------------------------------------+
| PhysicalResultSink                                                                                  |
| --PhysicalDistribute                                                                                |
| ----PhysicalProject                                                                                 |
| ------hashJoin[INNER_JOIN] hashCondition=((t1.c1 = t2.c2)) otherCondition=() build RFs:RF0 c1->[c2] |
| --------PhysicalOlapScan[t2] apply RFs: RF0                                                         |
| --------PhysicalDistribute                                                                          |
| ----------PhysicalOlapScan[t1]                                                                      |
|                                                                                                     |
| Hint log:                                                                                           |
| Used: leading(t2 t1)                                                                                |
| UnUsed:                                                                                             |
| SyntaxError:                                                                                        |
+-----------------------------------------------------------------------------------------------------+
```
この例では、Leading Hint `/*+ leading(t2 t1) */` が使用されています。Leading Hintは、指定されたテーブル（t2）を駆動テーブルとして使用し、実行計画において（t1）よりも前に配置するようにオプティマイザーに指示します。

## Hint Log

Hint Logは主に `EXPLAIN` 実行時にヒントが有効かどうかを表示するために使用されます。通常は `EXPLAIN` 出力の下部に位置します。

Hint Logには3つのステータスがあります：

```sql
+---------------------------------+
| Hint log:                       |
| Used:                           |
| UnUsed:                         |
| SyntaxError:                    |
+---------------------------------+
```
- `Used`：ヒントが有効であることを示します。
- `UnUsed` 和 `SyntaxError`：どちらもヒントが有効でないことを示します。SyntaxErrorは、ヒントの使用に構文エラーがあるか、構文がサポートされていないことを示し、サポートされていない理由に関する追加情報が提供されます。

ユーザーはHintログを通じて有効性と無効な理由を確認でき、調整と検証を容易にします。

## 概要

Hintは実行プランを手動で管理するための強力なツールです。現在、Dorisはleading hint、ordered hint、distribute hintなどをサポートしており、ユーザーが結合順序、シャッフル方法、その他の可変設定を手動で管理できるようにし、より便利で効果的な運用機能をユーザーに提供します。
