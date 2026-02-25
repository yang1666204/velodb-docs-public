---
{
  "title": "直交BITMAP計算",
  "description": "Dorisによって設計されたオリジナルのbitmap集約関数はより汎用的です、",
  "language": "ja"
}
---
# Orthogonal BITMAP計算

## 背景

Dorisによって設計されたオリジナルのbitmap集約関数はより汎用的ですが、1億レベルを超える大きなcardinalityのbitmapの積集合と和集合に対しては性能が劣ります。バックエンドbeのbitmap集約関数ロジックをチェックする主な理由は2つあります。第一に、bitmapのcardinalityが大きい場合、bitmapのデータサイズが1gを超えると、ネットワーク/ディスクIOの処理時間が比較的長くなります。第二に、データをスキャンした後、すべてのバックエンドbeインスタンスが積集合と和集合の操作のためにトップレベルノードに送信されるため、トップレベルの単一ノードに圧力をかけ、処理のボトルネックとなります。

解決策は、bitmapカラムの値を範囲に応じて分割し、異なる範囲の値を異なるバケットに格納することで、異なるバケットのbitmap値が直交し、データ分散がより均等になることを保証することです。クエリの場合、異なるバケット内の直交bitmapがまず集約され計算され、その後トップレベルノードが集約された計算値を直接結合して要約し、出力します。これにより計算効率が大幅に向上し、トップ単一ノード計算のボトルネック問題を解決します。

## ユーザーガイド

1. テーブルを作成し、hidカラムを追加してbitmapカラム値のID範囲をハッシュバケットカラムとして表現する
2. 使用シナリオ

### テーブル作成

テーブル構築時には集約モデルを使用する必要があります。データ型はbitmapで、集約関数はbitmap_unionです

```
CREATE TABLE `user_tag_bitmap` (
  `tag` bigint(20) NULL COMMENT "user tag",
  `hid` smallint(6) NULL COMMENT "Bucket ID",
  `user_id` bitmap BITMAP_UNION NULL COMMENT ""
) ENGINE=OLAP
AGGREGATE KEY(`tag`, `hid`)
COMMENT "OLAP"
DISTRIBUTED BY HASH(`hid`) BUCKETS 3
```
HID列がテーブルスキーマに追加され、ハッシュバケット列としてIDの範囲を示します。

注意: HID番号とバケット数は適切に設定する必要があり、データのハッシュバケット分割をできるだけ均等にするために、HID番号はバケット数の少なくとも5倍に設定する必要があります。


### データロード

``` 
LOAD LABEL user_tag_bitmap_test
(
DATA INFILE('hdfs://abc')
INTO TABLE user_tag_bitmap
COLUMNS TERMINATED BY ','
(tmp_tag, tmp_user_id)
SET (
tag = tmp_tag,
hid = ceil(tmp_user_id/5000000),
user_id = to_bitmap(tmp_user_id)
)
)
...
```
データフォーマット：

``` 
11111111,1
11111112,2
11111113,3
11111114,4
...
```
注意: 最初の列はユーザータグを表しており、中国語から数値に変換されています

データをロードする際、ユーザーのbitmap値の範囲を垂直にカットします。例えば、1-5000000の範囲のユーザーIDのhid値は同じであり、同じHID値を持つ行は同じサブバケットに割り当てられるため、各サブバケット内のbitmap値は直交になります。bitmapのUDAF実装において、バケット内のbitmap値の直交特性を利用して積集合と和集合の計算を実行でき、計算結果は集約のために最上位ノードにshuffleされます。

注意: 直交bitmap機能はパーティションテーブルでは使用できません。パーティションテーブルのパーティションは直交であるため、パーティション間のデータが直交であることを保証できないため、計算結果を推定することができません。

#### orthogonal_bitmap_intersect

bitmap積集合関数

構文:

orthogonal_bitmap_intersect(bitmap_column, column_to_filter, filter_values)

パラメータ:

最初のパラメータはbitmap列、2番目のパラメータはフィルタリング用のディメンション列、3番目のパラメータは可変長パラメータで、フィルターディメンション列の異なる値を意味します

説明:

このテーブルスキーマに基づいて、この関数はクエリプランニングにおいて2レベルの集約を持ちます。最初のレイヤーでは、beノード（updateとserialize）がまずfilter_Valuesを使用してキーをハッシュ集約し、次にすべてのキーのbitmapの積集合を計算します。結果はシリアライズされて2番目のレベルのbeノード（mergeとfinalize）に送信されます。2番目のレベルのbeノードでは、最初のレベルノードからのすべてのbitmap値が循環的に結合されます

例:

```
select BITMAP_COUNT(orthogonal_bitmap_intersect(user_id, tag, 13080800, 11110200)) from user_tag_bitmap  where tag in (13080800, 11110200);

```
#### orthogonal_bitmap_intersect_count 

ビットマップ交差カウント関数を計算するため、構文は元のIntersect_Countと同じですが、実装が異なります

構文:

orthogonal_bitmap_intersect_count(bitmap_column, column_to_filter, filter_values)

パラメータ:

最初のパラメータはビットマップ列、2番目のパラメータはフィルタリング用のディメンション列、3番目のパラメータは可変長パラメータで、フィルタディメンション列の異なる値を意味します

説明:

このテーブルスキーマに基づいて、クエリプランニング集約は2つの層に分割されます。第1層では、beノード（updateとserialize）がまずfilter_Valuesを使用してキーをハッシュ集約し、その後すべてのキーのビットマップの交差を実行し、交差結果をカウントします。カウント値はシリアライズされ、第2層のbeノード（mergeとfinalize）に送信されます。第2層のbeノードでは、第1層ノードからのすべてのカウント値の合計が循環的に計算されます

例:

```
    select orthogonal_bitmap_intersect_count(members, tag_group, 1150000, 1150001, 390006) from tag_map where  tag_group in ( 1150000, 1150001, 390006);
```
#### orthogonal_bitmap_union_count

bitmap union count関数を理解します。構文は元のbitmap_union_countと同じですが、実装が異なります。

構文:

orthogonal_bitmap_union_count(bitmap_column)

説明:

このテーブルスキーマに基づき、この関数は2つの層に分かれています。第1層では、beノード（updateとserialize）がすべてのビットマップをマージし、その後結果のビットマップをカウントします。カウント値はシリアル化されて第2層のbeノード（mergeとfinalize）に送信されます。第2層では、beノードが第1層のノードからのすべてのカウント値の合計を計算するために使用されます

例:

```
    select ORTHOGONAL_BITMAP_UNION_COUNT(members) from tag_map where  tag_group in ( 1150000, 1150001, 390006);
```
#### orthogonal_bitmap_expr_calculate

式bitmapの積集合、和集合、差集合を計算することで関数を計算します。

構文:

orthogonal_bitmap_expr_calculate(bitmap_column, filter_column, input_string)

パラメータ:

最初のパラメータはBitmap列、2番目のパラメータはフィルタリングに使用される次元列（つまり計算キー列）、3番目のパラメータは計算式文字列で、キー列に基づいてbitmap積集合・和集合・差集合式を計算することを意味します。

式でサポートされる演算子: &は積集合計算、|は和集合計算、-は差集合計算、^はXOR計算、\はエスケープ文字を表します。

説明:

クエリプランニングの集計は2つの層に分割されます。最初の層のbe集計ノード計算にはinit、update、serializeステップが含まれます。2番目の層のbe集計ノード計算にはmergeとfinalizeステップが含まれます。最初の層のbeノードでは、input_stringがinit段階で解析され、後置記法（逆ポーランド記法）に変換され、計算キー値を解析してmap<key, bitmap>構造で初期化されます。update段階では、基盤カーネルがスキャンした次元列（filter_column）がupdate関数をコールバックし、前のステップのmap構造内のbitmapを計算キー単位で集計します。serialize段階では、キー列のbitmapが後置記法に従って解析され、スタック構造の先入れ後出しの原理を使用してbitmap積集合、結合、差集合が計算されます。その後、最終bitmapがシリアライズされ、2番目の層の集計beノードに送信されます。2番目の層の集計beノードは、最初の層のノードからすべてのbitmap値の和集合を求め、最終bitmap結果を返します。

#### orthogonal_bitmap_expr_calculate_count

式bitmapの積集合、和集合、差集合を計算することでcount関数を計算します。構文とパラメータはorthogonal_bitmap_expr_calculateと同じです。

構文:

orthogonal_bitmap_expr_calculate_count(bitmap_column, filter_column, input_string)

説明:

クエリプランニングの集計は2つの層に分割されます。最初の層のbe集計ノード計算にはinit、update、serializeステップが含まれます。2番目の層のbe集計ノード計算にはmergeとfinalizeステップが含まれます。最初の層のbeノードでは、input_stringがinit段階で解析され、後置記法（逆ポーランド記法）に変換され、計算キー値を解析してmap<key, bitmap>構造で初期化されます。update段階では、基盤カーネルがスキャンした次元列（filter_column）がupdate関数をコールバックし、前のステップのmap構造内のbitmapを計算キー単位で集計します。serialize段階では、キー列のbitmapが後置記法に従って解析され、スタック構造の先入れ後出しの原理を使用してbitmap積集合、結合、差集合が計算されます。その後、最終bitmapのcount値がシリアライズされ、2番目の層の集計beノードに送信されます。2番目の層の集計beノードは、最初の層のノードからすべてのcount値を加算・合計し、最終count結果を返します。

### 適用シーン

リテンション、ファネル、ユーザーポートレートなどのbitmapの直交計算シナリオと一致します。

群衆選択:

```
select orthogonal_bitmap_intersect_count(user_id, tag, 13080800, 11110200) from user_tag_bitmap where tag in (13080800, 11110200);

Note: 13080800 and 11110200 represent user labels
```
user_id の重複排除値を計算する:

```
select orthogonal_bitmap_union_count(user_id) from user_tag_bitmap where tag in (13080800, 11110200);
```
ビットマップクロスマージ差分セットハイブリッドコンピューティング:

```
select orthogonal_bitmap_expr_calculate_count(user_id, tag, '(833736|999777)&(1308083|231207)&(1000|20000-30000)') from user_tag_bitmap where tag in (833736,999777,130808,231207,1000,20000,30000);
Note: 1000, 20000, 30000 plastic tags represent different labels of users
```
```
select orthogonal_bitmap_expr_calculate_count(user_id, tag, '(A:a/b|B:2\\-4)&(C:1-D:12)&E:23') from user_str_tag_bitmap where tag in ('A:a/b', 'B:2-4', 'C:1', 'D:12', 'E:23');
Note: 'A:a/b', 'B:2-4', etc. are string types tag, representing different labels of users, where 'B:2-4' needs to be escaped as'B:2\\-4'
```
