---
{
  "title": "ORC | File Formats",
  "description": "この文書では、DorisにおけるORCファイル形式の読み書きサポートについて紹介します。以下の機能に適用されます：",
  "language": "ja"
}
---
# ORC

このドキュメントでは、DorisにおけるORCファイル形式の読み取りおよび書き込みサポートについて説明します。以下の機能に適用されます：

* Catalogでのデータの読み取りと書き込み
* Table Valued Functionsを使用したデータの読み取り
* Broker Loadでのデータの読み取り
* Export時のデータの書き込み
* Outfileでのデータの書き込み

## サポートされている圧縮形式

* uncompressed
* snappy
* lz4
* zstd
* lzo
* zlib

## パラメータ

### セッション変数

* `enable_orc_lazy_mat` (2.1+, 3.0+)

    ORC Readerが遅延マテリアライゼーションを有効にするかどうかを制御します。デフォルトはtrueです。

* `hive_orc_use_column_names` (2.1.6+, 3.0.3+)

    HiveテーブルからORCデータ型を読み取る際、Dorisはデフォルトで、Hiveテーブルのカラムと同じ名前を持つORCファイル内のカラムからデータを読み取ります。この変数を`false`に設定すると、Dorisはカラム名に関係なく、Hiveテーブルのカラム順序に基づいてORCファイルからデータを読み取ります。これはHiveの`orc.force.positional.evolution`変数と類似しています。このパラメータはトップレベルのカラム名にのみ適用され、Struct内のカラムに対しては無効です。

* `orc_tiny_stripe_threshold_bytes` (2.1.8+, 3.0.3+)

    ORCファイルにおいて、Stripeのバイトサイズが`orc_tiny_stripe_threshold`未満の場合、Tiny Stripeとみなされます。連続する複数のTiny Stripeに対しては読み取り最適化が実行され、つまり複数のTiny Stripeが一度に読み取られ、IO操作の回数が削減されます。この最適化を使用したくない場合は、この値を0に設定できます。デフォルトは8Mです。

* `orc_once_max_read_bytes` (2.1.8+, 3.0.3+)

    Tiny Stripe読み取り最適化を使用する際、複数のTiny Stripeが単一のIO操作にマージされます。このパラメータは各IOリクエストの最大バイト数を制御します。この値を`orc_tiny_stripe_threshold`より小さく設定すべきではありません。デフォルトは8Mです。

* `orc_max_merge_distance_bytes` (2.1.8+, 3.0.3+)

    Tiny Stripe読み取り最適化を使用する際、読み取り対象の2つのTiny Stripeが連続していない可能性があるため、2つのTiny Stripe間の距離がこのパラメータを超える場合、それらは単一のIO操作にマージされません。デフォルトは1Mです。

* `orc_tiny_stripe_amplification_factor` (3.1.0+)

    Tiny Stripe最適化において、ORCファイルに多くのカラムがあるがクエリで使用されるのは少数の場合、Tiny Stripe最適化により深刻な読み取り増幅が発生する可能性があります。実際に読み取られるバイト数のStripe全体に対する割合がこのパラメータを超える場合、Tiny Stripe読み取り最適化が使用されます。デフォルト値は0.4で、最小値は0です。

* `check_orc_init_sargs_success` (3.1.0+)

    ORC述語プッシュダウンが成功したかどうかをチェックし、デバッグに使用されます。デフォルトはfalseです。

### BE設定

* `orc_natural_read_size_mb` (2.1+, 3.0+)

    ORC Readerが一度に読み取る最大バイト数。デフォルトは8 MBです。
