---
{
  "title": "Text/CSV/JSON",
  "description": "この文書では、Dorisにおけるテキストファイル形式の読み取りと書き込みのサポートについて紹介します。",
  "language": "ja"
}
---
このドキュメントでは、Dorisにおけるテキストファイルフォーマットの読み書きサポートについて紹介します。

## Text/CSV

* カタログ

  `org.apache.hadoop.mapred.TextInputFormat`フォーマットのHiveTableの読み取りをサポートしています。

  以下のSerDeをサポートしています：

  - `org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe`
  - `org.apache.hadoop.hive.serde2.OpenCSVSerde` (2.1.7以降)
  - `org.apache.hadoop.hive.serde2.MultiDelimitSerDe` (3.1.0以降)  

* Table Valued ファンクション

* Import

  インポート機能はText/CSVフォーマットをサポートしています。詳細はインポートドキュメントを参照してください。

* Export

  エクスポート機能はText/CSVフォーマットをサポートしています。詳細はエクスポートドキュメントを参照してください。

### サポートされている圧縮フォーマット

* uncompressed
* gzip
* deflate
* bzip2
* zstd
* lz4
* snappy
* lzo

## JSON

### カタログ

- `org.apache.hadoop.hive.serde2.JsonSerDe` (3.0.4以降)

- `org.apache.hive.hcatalog.data.JsonSerDe` (3.0.4以降)

  1. プリミティブ型と複合型の両方をサポートしています。
  2. `timestamp.formats` SERDEPROPERTIESはサポートしていません。

- [`org.openx.data.jsonserde.JsonSerDe`](https://github.com/rcongiu/Hive-JSON-Serde)のHiveTable (3.0.6以降)

  1. プリミティブ型と複合型の両方をサポートしています。
  2. SERDEPROPERTIES：[`ignore.malformed.json`](https://github.com/rcongiu/Hive-JSON-Serde?tab=readme-ov-file#importing-malformed-data)のみサポートされており、このJsonSerDeと同じ動作をします。他のSERDEPROPERTIESは効果がありません。
  3. [`Using Arrays`](https://github.com/rcongiu/Hive-JSON-Serde?tab=readme-ov-file#using-arrays)はサポートしていません（Text/CSVフォーマットと同様で、すべての列データが単一の配列に配置されます）。
  4. [`Promoting a Scalar to an Array`](https://github.com/rcongiu/Hive-JSON-Serde?tab=readme-ov-file#promoting-a-scalar-to-an-array)はサポートしていません（スカラーを単一要素配列に昇格）。
  5. デフォルトでは、DorisはTableスキーマを正しく認識できます。ただし、特定のパラメータのサポート不足により、自動スキーマ認識が失敗する場合があります。この場合、`read_hive_json_in_one_column = true`を設定してJSON行全体を最初の列に配置し、元のデータが完全に読み取られることを保証できます。その後、ユーザーが手動で処理できます。この機能では、最初の列のデータ型が`String`である必要があります。

### Import

インポート機能はJSONフォーマットをサポートしています。詳細はインポートドキュメントを参照してください。

## 文字セット

現在、DorisはUTF-8文字セットエンコーディングのみをサポートしています。ただし、Hive TextフォーマットTableのデータなど、一部のデータには非UTF-8エンコーディングでエンコードされたコンテンツが含まれている場合があり、これにより読み取りが失敗し、以下のエラーが発生します：

```text
Only support csv data in utf8 codec
```
この場合、セッション変数を以下のように設定できます：

```text
SET enable_text_validate_utf8 = false
```
これによりUTF-8エンコーディングチェックが無視され、このコンテンツを読み取ることができるようになります。このパラメータはチェックをスキップするためにのみ使用され、UTF-8以外でエンコードされたコンテンツは依然として文字化けして表示されることに注意してください。

このパラメータはバージョン3.0.4以降でサポートされています。
