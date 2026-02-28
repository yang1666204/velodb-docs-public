---
{
  "title": "データ型",
  "description": "Apache Doris は標準的な SQL 構文をサポートし、MySQL Network Connection Protocol を使用して、MySQL 構文プロトコルと高い互換性を持ちます。そのため、",
  "language": "ja"
}
---
Apache Dorisは標準的なSQL構文をサポートし、MySQL Network Connection Protocolを使用し、MySQLの構文プロトコルと高い互換性があります。そのため、データ型のサポートに関して、Apache DorisはMySQLに関連するデータ型と可能な限り密接に整合させています。

Dorisでサポートされているデータ型のリストは以下の通りです：

## [数値データ型](../sql-manual/basic-element/sql-data-types/data-type-overview#numeric-types)  
  
| 型名                                                    | ストレージ (バイト) | 説明                                                  |  
| ---------------------------------------------------------- | --------------- | ------------------------------------------------------------ |  
| [BOOLEAN](../sql-manual/basic-element/sql-data-types/numeric/BOOLEAN)       | 1               | 2つの値のみを格納するブール型データ型：0は偽を表し、1は真を表します。 |  
| [TINYINT](../sql-manual/basic-element/sql-data-types/numeric/TINYINT)       | 1               | 整数値、符号付きの範囲は-128から127です。                 |  
| [SMALLINT](../sql-manual/basic-element/sql-data-types/numeric/SMALLINT)     | 2               | 整数値、符号付きの範囲は-32768から32767です。             |  
| [INT](../sql-manual/basic-element/sql-data-types/numeric/INT)               | 4               | 整数値、符号付きの範囲は-2147483648から2147483647です。   |  
| [BIGINT](../sql-manual/basic-element/sql-data-types/numeric/BIGINT)         | 8               | 整数値、符号付きの範囲は-9223372036854775808から9223372036854775807です。 |  
| [LARGEINT](../sql-manual/basic-element/sql-data-types/numeric/LARGEINT)     | 16              | 整数値、範囲は[-2^127 + 1から2^127 - 1]です。               |  
| [FLOAT](../sql-manual/basic-element/sql-data-types/numeric/FLOATING-POINT)           | 4               | 単精度浮動小数点数、範囲は[-3.4 * 10^38から3.4 * 10^38]です。 |  
| [DOUBLE](../sql-manual/basic-element/sql-data-types/numeric/FLOATING-POINT)         | 8               | 倍精度浮動小数点数、範囲は[-1.79 * 10^308から1.79 * 10^308]です。 |  
| [DECIMAL](../sql-manual/basic-element/sql-data-types/numeric/DECIMAL)       | 4/8/16/32          | 精度（桁数の合計）とスケール（小数点の右側の桁数）によって定義される正確な固定小数点数。形式：DECIMAL(P[,S])、ここでPは精度、Sはスケールです。Pの範囲は[1, MAX_P]で、`enable_decimal256`=falseの場合はMAX_P=38、`enable_decimal256`=trueの場合はMAX_P=76、Sの範囲は[0, P]です。<br>`enable_decimal256`のデフォルト値はfalseです。trueに設定するとより正確な結果が得られますが、パフォーマンスの低下を伴います。<br>ストレージ要件：<ul><li>0 < precision <= 9の場合は4バイト。</li><li>9 < precision <= 18の場合は8バイト。<li>18 < precision <= 38の場合は16バイト。<li>38 < precision <= 76の場合は32バイト。</ul> |

## [日付時刻データ型](../sql-manual/basic-element/sql-data-types/data-type-overview#date-types)

| 型名      | ストレージ (バイト)| 説明                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
|  [DATE](../sql-manual/basic-element/sql-data-types/date-time/DATE)             | 4              | DATEは暦年、月、日の値を保持し、サポートされる範囲は['0000-01-01', '9999-12-31']です。デフォルト出力形式：'yyyy-MM-dd'。 |
| [DATETIME](../sql-manual/basic-element/sql-data-types/date-time/DATETIME)        | 8              | DATEとTIMEの組み合わせ 形式：DATETIME ([P])。オプションパラメータPは時間精度を表し、値の範囲は[0,6]で、最大6桁の小数（マイクロ秒）をサポートします。設定されていない場合は0です。サポートされる範囲は['0000-01-01 00:00:00 [.000000]', '9999-12-31 23:59:59 [.999999]']です。デフォルト出力形式：'yyy-MM-dd HH: mm: ss. SSSSSS '。 |

## [文字列データ型](../sql-manual/basic-element/sql-data-types/data-type-overview#string-types)
| 型名      | ストレージ (バイト)| 説明                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| [CHAR](../sql-manual/basic-element/sql-data-types/string-type/CHAR)            | M               | 固定長文字列、パラメータMは文字でカラムの長さを指定します。Mの範囲は1から255です。 |
| [VARCHAR](../sql-manual/basic-element/sql-data-types/string-type/VARCHAR)         | 可変長 | 可変長文字列、パラメータMは文字で最大文字列長を指定します。Mの範囲は1から65533です。可変長文字列はUTF-8エンコーディングで格納されます。英字は1バイト、漢字は3バイトを占有します。 |
| [STRING](../sql-manual/basic-element/sql-data-types/string-type/STRING)          | 可変長 | 可変長文字列、デフォルトで1048576バイト（1MB）をサポートし、最大2147483643バイト（2GB）の精度制限があります。サイズはstring_type_length_soft_limit_bytesを通じてBEで調整できます。STRING型は値カラムでのみ使用でき、キーカラムやパーティションバケットカラムでは使用できません。 |

## [半構造化データ型](../sql-manual/basic-element/sql-data-types/data-type-overview#semi-structured-types)

| 型名      | ストレージ (バイト)| 説明                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| [ARRAY](../sql-manual/basic-element/sql-data-types/semi-structured/ARRAY)          | 可変長 | 型Tの要素で構成される配列で、キーカラムとして使用することはできません。現在、DuplicateとUniqueモデルのTableでの使用をサポートしています。 |
| [MAP](../sql-manual/basic-element/sql-data-types/semi-structured/MAP)            | 可変長 | 型KとVの要素で構成されるマップで、Keyカラムとして使用することはできません。これらのマップは現在、DuplicateとUniqueモデルを使用するTableでサポートされています。 |
| [STRUCT](../sql-manual/basic-element/sql-data-types/semi-structured/STRUCT)         | 可変長 | 複数のフィールドで構成される構造体で、複数のカラムのコレクションとしても理解できます。Keyとして使用することはできません。現在、STRUCTはDuplicateモデルのTableでのみ使用できます。構造体内のフィールドの名前と数は固定されており、常にNullableです。|
| [JSON](../sql-manual/basic-element/sql-data-types/semi-structured/JSON)           | 可変長 | バイナリJSON型で、バイナリJSON形式で格納され、JSON関数を通じて内部JSONフィールドにアクセスします。デフォルトで最大1048576バイト（1MB）をサポートし、最大2147483643バイト（2GB）まで調整できます。この制限はBE設定パラメータ'jsonb_type_length_soft_limit_bytes'を通じて変更できます。 |
| [VARIANT](../sql-manual/basic-element/sql-data-types/semi-structured/VARIANT)        | 可変長 | VARIANTデータ型は動的に適応可能で、JSONなどの半構造化データ用に特別に設計されています。任意のJSONオブジェクトを格納でき、自動的にJSONフィールドをサブカラムに分割して、ストレージ効率とクエリパフォーマンスを向上させます。長さ制限と設定方法はSTRING型と同じです。ただし、VARIANT型は値カラムでのみ使用でき、キーカラムやパーティション/バケットカラムでは使用できません。 |

## [集約データ型](../sql-manual/basic-element/sql-data-types/data-type-overview#aggregation-types)

| 型名      | ストレージ (バイト)| 説明                                                  |
| -------------- | --------------- | ------------------------------------------------------------ |
| [HLL](../sql-manual/basic-element/sql-data-types/aggregate/HLL)            | 可変長 | HLLはHyperLogLogの略で、あいまい重複除去です。大規模なデータセットを扱う際にCount Distinctよりも優れたパフォーマンスを発揮します。HLLのエラー率は通常約1%で、時には2%に達することもあります。HLLはキーカラムとして使用できず、Table作成時の集約タイプはHLL_UNIONです。ユーザーは長さやデフォルト値を指定する必要がありません。これはデータの集約レベルに基づいて内部的に制御されます。HLLカラムは、hll_union_agg、hll_raw_agg、hll_cardinality、hll_hashなどの関連関数を通じてのみクエリまたは使用できます。 |
| [BITMAP](../sql-manual/basic-element/sql-data-types/aggregate/BITMAP)         | 可変長 | BITMAP型はAggregateTable、UniqueTable、またはDuplicateTableで使用できます。- UniqueTableまたはDuplicateTableで使用する場合、BITMAPは非キーカラムとして使用する必要があります。- AggregateTableで使用する場合、BITMAPも非キーカラムとして機能し、Table作成時に集約タイプをBITMAP_UNIONに設定する必要があります。ユーザーは長さやデフォルト値を指定する必要がありません。これはデータの集約レベルに基づいて内部的に制御されます。BITMAPカラムは、bitmap_union_count、bitmap_union、bitmap_hash、bitmap_hash64などの関連関数を通じてのみクエリまたは使用できます。 |
| [QUANTILE_STATE](../sql-manual/basic-element/sql-data-types/aggregate/QUANTILE-STATE.md) | 可変長 | 近似分位値を計算するために使用される型です。読み込み時、同じキーで異なる値に対して事前集約を実行します。値の数が2048を超えない場合、すべてのデータを詳細に記録します。値の数が2048より大きい場合、TDigestアルゴリズムを使用してデータを集約（クラスタ化）し、クラスタ化後の重心点を格納します。QUANTILE_STATEはキーカラムとして使用できず、Table作成時は集約タイプQUANTILE_UNIONと組み合わせる必要があります。ユーザーは長さやデフォルト値を指定する必要がありません。これはデータの集約レベルに基づいて内部的に制御されます。QUANTILE_STATEカラムは、QUANTILE_PERCENT、QUANTILE_UNION、TO_QUANTILE_STATEなどの関連関数を通じてのみクエリまたは使用できます。 |
| [AGG_STATE](../sql-manual/basic-element/sql-data-types/aggregate/AGG-STATE)       | 可変長 | 集約関数はstate/merge/union関数の結合子でのみ使用できます。AGG_STATEはキーカラムとして使用できません。Table作成時には、集約関数のシグネチャを併せて宣言する必要があります。ユーザーは長さやデフォルト値を指定する必要がありません。実際のデータストレージサイズは関数の実装に依存します。 |

## [IP型](../sql-manual/basic-element/sql-data-types/data-type-overview#ip-types)

| 型名                                                    | ストレージ (バイト) | 説明                                                  |  
| ---------------------------------------------------------- | --------------- | ------------------------------------------------------------ |  
| [IPv4](../sql-manual/basic-element/sql-data-types/ip/IPV4)                 | 4               | `ipv4_*`ファミリの関数と併用して使用されます。 |  
| [IPv6](../sql-manual/basic-element/sql-data-types/ip/IPV6)                 | 16              | `ipv6_*`ファミリの関数と併用して使用されます。 |

`SHOW DATA TYPES;`ステートメントでDorisがサポートするすべてのデータ型を表示することもできます。
