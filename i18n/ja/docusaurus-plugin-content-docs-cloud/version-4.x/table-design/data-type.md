---
{
  "title": "データ型",
  "description": "Apache Dorisは標準SQLシンタックスをサポートし、MySQL Network Connection Protocolを使用して、MySQLシンタックスプロトコルと高い互換性を持ちます。そのため、",
  "language": "ja"
}
---
Apache Doris は標準的な SQL 構文をサポートし、MySQL Network Connection Protocol を使用して、MySQL 構文プロトコルと高い互換性を持ちます。そのため、データ型サポートの観点では、Apache Doris は可能な限り MySQL 関連のデータ型と密接に連携します。

Doris がサポートするデータ型の一覧は以下の通りです：

## 数値データ型

| タイプ Name                                                    | Storage (bytes) | デスクリプション                                                  |  
| ---------------------------------------------------------- | --------------- | ------------------------------------------------------------ |  
| BOOLEAN       | 1               | 2つの値のみを保存するブール型データ型：0は偽を表し、1は真を表します。 |  
| TINYINT       | 1               | 整数値、符号付きの範囲は -128 から 127 です。                 |  
| SMALLINT     | 2               | 整数値、符号付きの範囲は -32768 から 32767 です。             |  
| INT               | 4               | 整数値、符号付きの範囲は -2147483648 から 2147483647 です。   |  
| BIGINT         | 8               | 整数値、符号付きの範囲は -9223372036854775808 から 9223372036854775807 です。 |  
| LARGEINT     | 16              | 整数値、範囲は [-2^127 + 1 から 2^127 - 1] です。               |  
| FLOAT           | 4               | 単精度浮動小数点数、範囲は [-3.4 * 10^38 から 3.4 * 10^38] です。 |  
| DOUBLE         | 8               | 倍精度浮動小数点数、範囲は [-1.79 * 10^308 から 1.79 * 10^308] です。 |  
| DECIMAL       | 4/8/16/32          | precision（全桁数）と scale（小数点以下の桁数）によって定義される正確な固定小数点数です。形式：DECIMAL(P[,S])、ここで P は precision、S は scale です。P の範囲は [1, MAX_P] で、`enable_decimal256`=false の場合 MAX_P=38、`enable_decimal256`=true の場合 MAX_P=76、S の範囲は [0, P] です。<br>`enable_decimal256` のデフォルト値は false です。これを true に設定すると、より正確な結果が得られますが、パフォーマンスの低下を招きます。<br>ストレージ要件：<ul><li>0 < precision <= 9 の場合 4 バイト。</li><li>9 < precision <= 18 の場合 8 バイト。</li><li>18 < precision <= 38 の場合 16 バイト。</li><li>38 < precision <= 76 の場合 32 バイト。</li></ul> |

## 日時データ型

| タイプ name      | Storeage (bytes)| デスクリプション                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
|  DATE             | 4              | DATE は暦年、月、日の値を保持し、サポートされる範囲は ['0000-01-01', '9999-12-31'] です。デフォルトの印刷形式：'yyyy-MM-dd'。 |
| DATETIME        | 8              | DATE と TIME の組み合わせ　形式：DATETIME ([P])。オプションパラメータ P は時間精度を表し、値の範囲は [0,6] で、最大 6 桁の小数点以下（マイクロ秒）をサポートします。設定されていない場合は 0 です。サポートされる範囲は ['0000-01-01 00:00:00 [.000000]', '9999-12-31 23:59:59 [.999999]'] です。デフォルトの印刷形式：'yyy-MM-dd HH: mm: ss. SSSSSS '。 |

## 文字列データ型
| タイプ name      | Storeage (bytes)| デスクリプション                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| CHAR            | M               | 固定長文字列、パラメータ M は列の長さを文字数で指定します。M の範囲は 1 から 255 です。 |
| VARCHAR         | Variable Length | 可変長文字列、パラメータ M は最大文字列長を文字数で指定します。M の範囲は 1 から 65533 です。可変長文字列は UTF-8 エンコーディングで保存されます。英字は 1 バイト、中国語文字は 3 バイトを占有します。 |
| STRING          | Variable Length | 可変長文字列、デフォルトで 1048576 バイト（1 MB）をサポートし、最大精度 2147483643 バイト（2 GB）の制限があります。サイズは BE を通じて調整される string_type_length_soft_limit_bytes で設定できます。String 型は value column でのみ使用でき、key column や partition bucket column では使用できません。 |

## 半構造化データ型

| タイプ name      | Storeage (bytes)| デスクリプション                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| ARRAY          | Variable Length | 型 T の要素で構成される配列で、key column として使用できません。現在、Duplicate と Unique モデルのTableでの使用がサポートされています。 |
| MAP            | Variable Length | 型 K と V の要素で構成するマップ、Key column として使用できません。これらのマップは現在、Duplicate と Unique モデルを使用するTableでサポートされています。 |
| STRUCT         | Variable Length | 複数の Field で構成された構造体で、複数の列の集合として理解することもできます。Key として使用することはできません。現在、STRUCT は Duplicate モデルのTableでのみ使用できます。Struct 内の Field の名前と数は固定されており、常に Nullable です。|
| JSON           | Variable Length | バイナリ JSON 型、バイナリ JSON 形式で保存され、JSON 関数を通じて内部 JSON フィールドにアクセスします。デフォルトで最大 1048576 バイト（1MB）をサポートし、最大 2147483643 バイト（2GB）まで調整できます。この制限は BE 設定パラメータ 'jsonb_type_length_soft_limit_bytes' を通じて変更できます。 |
| VARIANT        | Variable Length | VARIANT データ型は動的に適応可能で、JSON のような半構造化データ用に特別に設計されています。任意の JSON オブジェクトを保存でき、JSON フィールドを自動的にサブカラムに分割してストレージ効率とクエリパフォーマンスを向上させます。長さ制限と設定方法は STRING 型と同じです。ただし、VARIANT 型は value column でのみ使用でき、key column や partition / bucket column では使用できません。 |

## 集約データ型

| タイプ name      | Storeage (bytes)| デスクリプション                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| HLL            | Variable Length | HLL は HyperLogLog の略で、あいまい重複排除です。大規模なデータセットを扱う際に Count Distinct よりも優れた性能を発揮します。HLL のエラー率は通常約 1％で、時には 2％に達することもあります。HLL は key column として使用できず、Table作成時の集約タイプは HLL_UNION です。ユーザーは、データの集約レベルに基づいて内部的に制御されるため、長さやデフォルト値を指定する必要はありません。HLL 列は、hll_union_agg、hll_raw_agg、hll_cardinality、hll_hash などの付随関数を通じてのみクエリまたは使用できます。 |
| BITMAP         | Variable Length | BITMAP 型は Aggregate Table、Unique Table、または Duplicate Tableで使用できます。- Unique Tableまたは Duplicate Tableで使用する場合、BITMAP は non-key column として使用する必要があります。- Aggregate Tableで使用する場合、BITMAP も non-key column として機能する必要があり、Table作成時に集約タイプを BITMAP_UNION に設定する必要があります。ユーザーは、データの集約レベルに基づいて内部的に制御されるため、長さやデフォルト値を指定する必要はありません。BITMAP 列は、bitmap_union_count、bitmap_union、bitmap_hash、bitmap_hash64 などの付随関数を通じてのみクエリまたは使用できます。 |
| QUANTILE_STATE | Variable Length | 近似分位値を計算するために使用される型です。読み込み時に、異なる値を持つ同じキーに対して事前集約を実行します。値の数が 2048 を超えない場合、すべてのデータを詳細に記録します。値の数が 2048 を超える場合、TDigest アルゴリズムを使用してデータを集約（クラスタリング）し、クラスタリング後の重心点を保存します。QUANTILE_STATE は key column として使用できず、Table作成時に集約タイプ QUANTILE_UNION と組み合わせる必要があります。ユーザーは、データの集約レベルに基づいて内部的に制御されるため、長さやデフォルト値を指定する必要はありません。QUANTILE_STATE 列は、QUANTILE_PERCENT、QUANTILE_UNION、TO_QUANTILE_STATE などの付随関数を通じてのみクエリまたは使用できます。 |
| AGG_STATE       | Variable Length | 集約関数は state/merge/union 関数コンビネータでのみ使用できます。AGG_STATE は key column として使用できません。Table作成時に、集約関数のシグネチャを併せて宣言する必要があります。ユーザーは長さやデフォルト値を指定する必要はありません。実際のデータストレージサイズは関数の実装に依存します。 |

## IP 型

| タイプ Name                                                    | Storage (bytes) | デスクリプション                                                  |  
| ---------------------------------------------------------- | --------------- | ------------------------------------------------------------ |  
| IPv4                 | 4               | `ipv4_*` ファミリーの関数と組み合わせて使用されます。 |  
| IPv6                 | 16              | `ipv6_*` ファミリーの関数と組み合わせて使用されます。 |

`SHOW DATA TYPES;` ステートメントで、Doris がサポートするすべてのデータ型を表示することもできます。
