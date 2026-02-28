---
{
  "title": "Data Lake Query最適化",
  "description": "この文書では、主にlakeデータ（Hive、Iceberg、Paimonなど）をクエリするための最適化手法と戦略について説明します。",
  "language": "ja"
}
---
この文書では、主にレイクデータ（Hive、Iceberg、Paimon等）のクエリ最適化手法と戦略について説明します。

## パーティション Pruning

クエリでパーティション列の条件を指定することで、不要なパーティションを除外し、読み取りが必要なデータ量を削減できます。

`EXPLAIN <SQL>`を使用して`XXX_SCAN_NODE`の`partition`セクションを確認することで、partition pruningが効果的に機能しているか、このクエリでスキャンが必要なパーティション数を確認できます。

例：

```
0:VPAIMON_SCAN_NODE(88)
    table: paimon_ctl.db.table
    predicates: (user_id[#4] = 431304818)
    inputSplitNum=15775, totalFileSize=951754154566, scanRanges=15775
    partition=203/0
```
## Local Data Cache

Data Cacheは、リモートストレージシステム（HDFSまたはオブジェクトストレージ）から最近アクセスされたデータファイルをローカルディスクにキャッシュすることで、同じデータにアクセスする後続のクエリを高速化します。

キャッシュ機能はデフォルトで無効になっています。設定および有効化については、[Data Cache](../data-cache.md)ドキュメントを参照してください。

バージョン4.0.2以降、cache warmup機能がサポートされており、これによりdata cacheをさらに積極的に活用してクエリパフォーマンスを向上させることができます。

## HDFS Read 最適化

[HDFS Documentation](../storages/hdfs.md)の**HDFS IO 最適化**セクションを参照してください。

## Merge IO 最適化

HDFSやオブジェクトストレージなどのリモートストレージシステムに対して、DorisはMerge IO技術を通じてIOアクセスを最適化します。Merge IO技術は本質的に、隣接する複数の小さなIOリクエストを1つの大きなIOリクエストにマージするもので、IOPSを削減し、IOスループットを向上させることができます。

例えば、元のリクエストがファイル`file1`の[0, 10]と[20, 50]の部分を読み取る必要がある場合：

```
Request Range: [0, 10], [20, 50]
```
Merge IOを通じて、一つのリクエストにマージされます：

```
Request Range: [0, 50]
```
この例では、2つのIOリクエストが1つにマージされますが、追加データ（10-20の間のデータ）も読み取ります。そのため、Merge IOはIO操作の回数を削減しますが、潜在的なリード増幅の問題を引き起こす可能性があります。

Query Profileを通じて具体的なMerge IO情報を確認できます：

```
- MergedSmallIO:
    - MergedBytes: 3.00 GB
    - MergedIO: 424
    - RequestBytes: 2.50 GB
    - RequestIO: 65.555K (65555)
```
ここで`RequestBytes`と`RequestIO`は元のリクエストにおけるデータ量とリクエスト数を示します。`MergedBytes`と`MergedIO`はマージ後のデータ量とリクエスト数を示します。

`MergedBytes`が`RequestBytes`よりもかなり大きいことが判明した場合、深刻な読み取り増幅が発生していることを示します。以下のパラメータを通じて調整することができます：

- `merge_io_read_slice_size_bytes`

    セッション変数で、バージョン3.1.3以降でサポートされています。デフォルトは8MBです。深刻な読み取り増幅が見つかった場合、このパラメータを64KBなどに減らして、変更後のIOリクエストとクエリレイテンシが改善されるかどうかを観察することができます。
