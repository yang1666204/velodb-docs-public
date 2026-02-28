---
{
  "title": "ビットマップインデックス",
  "description": "Bitmap Indexは、ビットマップで表現されるインデックスで、列内の各キー値に対してビットマップが作成されます。他のインデックスと比較して、",
  "language": "ja"
}
---
Bitmap Indexは、列の各キー値に対してビットマップを作成する、ビットマップで表現されるインデックスです。他のインデックスと比較して、非常に少ないストレージ容量を占有し、作成と使用が非常に高速です。しかし、変更操作に対するロック粒度が大きいという欠点があり、頻繁な更新には不向きです。

![bitmap index](/images/bitmap-index-example.png)

## 適用可能なシナリオ

- 値の重複度が高い列で、100から100,000の間が推奨されます（職業、都市など）。重複度が高すぎる場合、他の種類のインデックスと比較して大きなメリットはありません。重複度が低すぎる場合、空間効率とパフォーマンスが大幅に低下します。
- `count`、`or`、`and`論理演算など、ビット演算のみを必要とする特定の種類のクエリ。例：複数の条件を組み合わせたクエリ、`select count(*) from table where city = 'Nanjing' and job = 'Doctor' and phonetype = 'iphone' and gender = 'Male'.` 各クエリ条件列にbitmap indexが確立されている場合、データベースは効率的なビット演算を実行し、必要なデータを正確に特定し、ディスクIOを削減できます。フィルタリングされた結果セットが小さいほど、bitmap indexの優位性はより明確になります。
- アドホッククエリ、多次元分析、その他の分析シナリオに適しています。Tableに100列があり、ユーザーがそのうち20列をクエリ条件として使用する場合（これらの20列から任意に複数列を使用）、これらの列に20個のbitmap indexを作成することで、すべてのクエリでインデックスを活用できます。

### 適用不可能なシナリオ

- 値の重複度が低い列（身分証明書、電話番号など）。
- 重複度が過度に高い列（性別など）。bitmap indexを確立することは可能ですが、単独でクエリ条件として使用することは推奨されません。他の条件と組み合わせてフィルタリングすることが推奨されます。
- 頻繁に更新される必要がある列。

### bitmap indexの作成

table_nameという名前のTableのsiteid列にindex_nameという名前のbitmap indexを作成する場合：

```
CREATE INDEX [IF NOT EXISTS] index_name ON table1 (siteid) USING BITMAP;
```
## bitmap indexの表示

指定されたtable_name配下のインデックスを表示する：

```
SHOW INDEX FROM table_name;
```
### インデックスの削除

指定されたtable_name配下のindex_nameという名前のインデックスを削除する場合：

```
DROP INDEX [IF EXISTS] index_name ON table_name;
```
### 注意事項：

- Bitmapインデックスは単一カラムにのみ作成されます。
- BitmapインデックスはDuplicateおよびUniqデータモデルのすべてのカラム、およびAggregateモデルのキーカラムに適用できます。
- Bitmapインデックスでサポートされるデータ型は以下の通りです：
  - `TINYINT`
  - `SMALLINT`
  - `INT`
  - `BIGINT`
  - `CHAR`
  - `VARCHAR`
  - `DATE`
  - `DATETIME`
  - `LARGEINT`
  - `DECIMAL`
  - `BOOL`
