---
{
  "title": "Elastic Compute Node",
  "description": "Elastic computeノードは、BEノードの特殊なタイプとして、データストレージ機能を持たず、データ計算のみを担当します。そのため、",
  "language": "ja"
}
---
Elastic compute nodes は、BE ノードの特別な種類として、データストレージ機能を持たず、データの計算のみを担当します。そのため、compute nodes は stateless な BE ノードとみなすことができ、簡単に追加や削除が可能です。

lakehouse データ分析シナリオでは、elastic compute nodes を使用して Hive、Iceberg、Hudi、Paimon、JDBC などの外部データソースをクエリできます。Doris は外部データソースのデータストレージを処理しないため、elastic compute nodes を使用して外部データソースの計算能力を簡単に拡張できます。さらに、compute nodes にキャッシュディレクトリを設定して外部データソースのホットデータをキャッシュし、データ読み込みをさらに高速化することもできます。

Elastic compute nodes は **Doris のストレージ計算統合モードでの弾性リソース制御に適しています**。Doris 3.0 のストレージ計算分離アーキテクチャでは、BE ノードは stateless であるため、独立した elastic compute nodes はもはや必要ありません。

## Compute Nodes の使用方法

### BE Node Types

ストレージ計算統合モードでは、BE ノードは2つのタイプに分けられます：

* Mix

  混合ノード。これは BE ノードのデフォルトタイプです。これらのノードは計算と Doris 内部Tableデータのストレージの両方に参加します。

* Computation

  Elastic compute nodes。データストレージは処理せず、データ計算のみを行います。

### Compute Nodes の追加

BE の `be.conf` 設定ファイルに以下の設定を追加します：

`be_node_role=computation`

その後、BE ノードを起動すると、Computation タイプとして実行されます。

次に Doris に接続して以下を実行します：

`ALTER SYSTEM ADD BACKEND`

この BE ノードを追加します。追加が成功すると、`SHOW BACKENDS` の `NodeRole` 列でノードタイプが `computation` として表示されます。

### Compute Nodes の使用

FE 設定ファイル `fe.conf` で以下のパラメータを設定して compute nodes を有効にし、その動作を制御する必要があります：

| パラメータ名                             | 説明                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefer_compute_node_for_external_table` | デフォルトは `false`。`true` に設定すると、外部Tableのクエリは優先的に compute nodes に割り当てられます。`false` の場合、外部Tableのクエリは任意の BE ノードに割り当てられます。クラスタに compute nodes がない場合、このパラメータは効果がありません。                                                                                                           |
| `min_backend_num_for_external_table`     | `prefer_compute_node_for_external_table` が `true` の場合のみ有効。クラスタ内の compute nodes 数がこの値より少ない場合、外部Tableのクエリは一部の混合ノードの取得を試行して割り当て、総ノード数がこの値に達するようにします。クラスタ内の compute nodes 数がこの値より多い場合、外部Tableのクエリは compute nodes のみに割り当てられます。バージョン2.0（含む）以前では、このパラメータのデフォルト値は3でした。バージョン2.1以降では、デフォルト値は `-1` で、現在の compute nodes 数のみを使用することを意味します。 |

`min_backend_num_for_external_table` のさらなる説明：

クラスタに3つの compute nodes と5つの混合ノードがあると仮定します。

`min_backend_num_for_external_table` が3以下に設定されている場合、外部Tableクエリは3つの compute nodes のみを使用します。3より大きく、例えば6に設定されている場合、外部Tableクエリは3つの compute nodes に加えて追加の3つの混合ノードを計算に使用します。

要約すると、このパラメータは主に外部Table計算に参加できる BE ノードの最小数に使用され、compute nodes を優先的に選択します。このパラメータを増やすと、より多くの BE ノード（compute nodes に限定されない）が外部Tableクエリ処理に参加できます；このパラメータを減らすと、外部Tableクエリ処理に参加する BE ノード数を制限できます。

> 注意：
>
> 1. バージョン2.1以降、`min_backend_num_for_external_table` は `-1` に設定できます。以前のバージョンでは、このパラメータは正の数である必要があります。このパラメータは `prefer_compute_node_for_external_table = true` の場合のみ有効です。
>
> 2. `min_backend_num_for_external_table` の値が BE ノードの総数より大きい場合、最大でもすべての BE が選択されます。
>
> 3. 上記のパラメータは FE ノードを再起動することなく `ADMIN SET FRONTEND CONFIG` コマンドを使用して動的に変更できます。すべての FE ノードを設定する必要があります。または、`fe.conf` に設定を追加して FE ノードを再起動します。

## ベストプラクティス

### フェデレーテッドクエリのリソース分離と弾性スケーリング

フェデレーテッドクエリシナリオでは、ユーザーは外部Tableデータのクエリ専用の compute nodes セットをデプロイできます。これにより、外部Tableクエリ負荷（Hive での大規模分析など）を内部Tableクエリ負荷（低遅延高速データ分析など）から分離できます。

同時に、stateless BE ノードとして、compute nodes は簡単にスケールアップ・ダウンできます。例えば、k8s を使用して弾性 compute node クラスタセットをデプロイし、ビジネスピーク時にはより多くの compute nodes をデータレイク分析に利用し、オフピーク時には迅速にスケールダウンしてコストを削減できます。

## よくある問題

1. 混合ノードと compute nodes は相互に変換できますか？

  Compute nodes は混合ノードに変換できます。ただし、混合ノードは compute nodes に変換できません。

2. Compute nodes はデータストレージディレクトリの設定が必要ですか？

  はい。Compute nodes のデータストレージディレクトリはユーザーデータを保存せず、`cluster_id` などの BE ノード自体の情報ファイルや動作中の一時ファイルのみを保存します。

  Compute nodes のストレージディレクトリは少量のディスク容量（MB レベル）のみを必要とし、ユーザーデータに影響を与えることなくノードと一緒にいつでも削除できます。

3. Compute nodes と混合ノードはファイルキャッシュディレクトリを設定できますか？

  [ファイルキャッシュ](./data-cache.md) は、最近アクセスしたリモートストレージシステム（HDFS またはオブジェクトストレージ）からデータファイルをキャッシュすることで、同じデータの後続クエリを高速化します。

  Compute nodes と混合ノードの両方がファイルキャッシュディレクトリを設定できます。ファイルキャッシュディレクトリは事前に作成する必要があります。

4. Compute nodes は DECOMMISION 操作でのデコミッションが必要ですか？

  いいえ。Compute nodes は `DROP BACKEND` 操作で直接削除できます。
