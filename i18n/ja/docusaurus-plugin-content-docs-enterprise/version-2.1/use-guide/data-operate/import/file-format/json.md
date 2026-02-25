---
{
  "title": "JSON | ファイル形式",
  "description": "このドキュメントでは、JSON形式のデータファイルをDorisに読み込む方法について説明します。",
  "language": "ja"
}
---
この文書では、JSON形式のデータファイルをDorisに読み込む方法について説明します。Dorisは標準的なJSON形式のデータの読み込みをサポートし、パラメータ設定を通じて様々なJSONデータ構造を柔軟に処理でき、JSONデータからのフィールド抽出およびネストした構造の処理をサポートします。

## 読み込み方法

以下の読み込み方法がJSON形式のデータをサポートします：

- [Stream Load](../import-way/stream-load-manual.md)
- [Broker Load](../import-way/broker-load-manual.md)
- [Routine Load](../import-way/routine-load-manual.md)
- [INSERT INTO FROM S3 TVF](../../../lakehouse/file-analysis.md)
- INSERT INTO FROM HDFS TVF

## サポートされているJSON形式

Dorisは以下の3つのJSON形式をサポートします：

### 配列として表現される複数行

複数行のデータをバッチで読み込むのに適しており、要件は以下の通りです：
- ルートノードは配列である必要があります
- 配列内の各要素は1行のデータを表すオブジェクトです
- `strip_outer_array=true`を設定する必要があります

データ例：

```json
[
    {"id": 123, "city": "beijing"},
    {"id": 456, "city": "shanghai"}
]

// Supports nested structures
[
    {"id": 123, "city": {"name": "beijing", "region": "haidian"}},
    {"id": 456, "city": {"name": "beijing", "region": "chaoyang"}}
]
```
### 単一行をオブジェクトとして表現

単一行データの読み込みに適しており、要件は以下の通りです：
- ルートノードはオブジェクトである必要があります
- オブジェクト全体が1行のデータを表します

データ例：

```json
{"id": 123, "city": "beijing"}

// Supports nested structures
{"id": 123, "city": {"name": "beijing", "region": "haidian"}}
```
:::tip Note
通常はRoutine Load方式で使用されます。Kafkaの単一メッセージなどです。
:::

### 区切り文字で分離された複数オブジェクト行

複数行のデータをバッチロードするのに適しており、要件は以下の通りです：
- 各行が完全なJSONオブジェクトである
- `read_json_by_line=true`を設定する必要がある
- 行区切り文字は`line_delimiter`パラメータを使用して指定でき、デフォルトは`\n`

データ例：

```json
{"id": 123, "city": "beijing"}
{"id": 456, "city": "shanghai"}
```
## パラメータ設定

### パラメータサポート

以下の表は、各ロード方法でサポートされるJSON形式パラメータを示しています：

| パラメータ | デフォルト値 | Stream Load | Broker Load | Routine Load | TVF |
|-----------|--------------|-------------|--------------|--------------|-----|
| json paths | None | jsonpaths | properties.jsonpaths | properties.jsonpaths | jsonpaths |
| json root | None | json_root | properties.json_root | properties.json_root | json_root |
| strip outer array | false | strip_outer_array | properties.strip_outer_array | properties.strip_outer_array | strip_outer_array |
| read json by line | false | read_json_by_line | Always true | Not supported | read_json_by_line, default true |
| fuzzy parse | false | fuzzy_parse | properties.fuzzy_parse | Not supported | fuzzy_parse |
| num as string | false | num_as_string | properties.num_as_string | properties.num_as_string | num_as_string |
| compression format | plain | Not Supported | PROPERTIES.compress_type | Not supported | compress_type |

:::tip Note
1. Stream Load: パラメータはHTTP Headerを通じて直接指定します。例：`-H "jsonpaths: $.data"`
2. Broker Load: パラメータは`PROPERTIES`を通じて指定します。例：`PROPERTIES("jsonpaths"="$.data")`
3. Routine Load: パラメータは`PROPERTIES`を通じて指定します。例：`PROPERTIES("jsonpaths"="$.data")`
4. TVF: パラメータはTVF文で指定します。例：`S3("jsonpaths"="$.data")`
5. JSONファイルのルートノードのJSONオブジェクトをロードする必要がある場合は、jsonpathsを$.として指定する必要があります。例：PROPERTIES("jsonpaths"="$.")
:::

### パラメータ説明

#### JSON Path
- 目的: JSONデータからフィールドを抽出する方法を指定します
- 型: 文字列配列
- デフォルト値: None、デフォルトでは列名とのマッチングになります
- 使用例:

  ```json
  -- Basic usage
  ["$.id", "$.city"]
  
  -- Nested structures
  ["$.id", "$.info.city", "$.data[0].name"]
  ```
#### JSON Root
- 目的: JSONデータの解析開始点を指定します
- 型: String
- デフォルト値: なし、ルートノードからの解析がデフォルトです
- 使用例:

  ```json
  -- Original data
  {
    "data": {
      "id": 123,
      "city": "beijing"
    }
  }
  
  -- Set json_root
  json_root = $.data
  ```
#### Strip Outer Array
- 目的: 最外層の配列構造を削除するかどうかを指定します
- 型: Boolean
- デフォルト値: false
- 使用例:

  ```json
  -- Original data
  [
    {"id": 1, "city": "beijing"},
    {"id": 2, "city": "shanghai"}
  ]
  
  -- Set strip_outer_array=true
  ```
#### Read JSON By Line
- 目的: JSON データを行ごとに読み込むかどうかを指定します
- 型: Boolean
- デフォルト値: false
- 使用例:

  ```json
  -- Original data (one complete JSON object per line)
  {"id": 1, "city": "beijing"}
  {"id": 2, "city": "shanghai"}
  
  -- Set read_json_by_line=true
  ```
#### Fuzzy Parse
- 目的: JSONデータの読み込み効率を向上させる
- 型: Boolean
- デフォルト値: false
- 制限事項:
  - Array内の各行のフィールド順序は同一である必要がある
  - 通常strip_outer_arrayと併用される
- パフォーマンス: 読み込み効率を3-5倍向上させることが可能

#### Num As String
- 目的: JSON数値型を文字列として解析するかどうかを指定する
- 型: Boolean
- デフォルト値: false
- 使用ケース:
  - 数値範囲外の数値を処理する場合
  - 数値の精度損失を回避する場合
- 使用例:

  ```json
  -- Original data
  {
    "id": "12345678901234567890",
    "price": "99999999.999999"
  }
  -- Set num_as_string=true, price field will be parsed as string
  ```
### JSON PathとColumnsの関係

データロード時、JSON PathとColumnsは異なる役割を担います：

**JSON Path**: データ抽出ルールを定義
   - 指定されたパスに従ってJSONデータからフィールドを抽出します
   - 抽出されたフィールドはJSON Pathで定義された順序に従って並び替えられます

**Columns**: データマッピングルールを定義
   - 抽出されたフィールドを対象テーブルの列にマッピングします
   - 列の並び替えと変換を実行できます

これら2つのパラメータは順次処理されます：まず、JSON Pathがソースデータからフィールドを抽出して順序付きデータセットを形成し、次にColumnsがこれらのデータをテーブル列にマッピングします。Columnsが指定されない場合、抽出されたフィールドはテーブル列の順序に従って直接マッピングされます。

#### 使用例

##### JSON Pathのみを使用

テーブル構造とデータ：

```sql
-- Table structure
CREATE TABLE example_table (
    k2 int,
    k1 int
);

-- JSON data
{"k1": 1, "k2": 2}
```
Load コマンド:

```shell
curl -v ... -H "format: json" \
    -H "jsonpaths: [\"$.k2\", \"$.k1\"]" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/db_name/table_name/_stream_load
```
読み込み結果:

```text
+------+------+
| k1   | k2   |
+------+------+
|    2 |    1 | 
+------+------+
```
##### JSON Path + Columns の使用

同じテーブル構造とデータを使用し、columnsパラメータを追加する場合：

Loadコマンド：

```shell
curl -v ... -H "format: json" \
    -H "jsonpaths: [\"$.k2\", \"$.k1\"]" \
    -H "columns: k2, k1" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/db_name/table_name/_stream_load
```
読み込み結果：

```text
+------+------+
| k1   | k2   |
+------+------+
|    1 |    2 | 
+------+------+
```
##### Field Reuse

テーブル構造とデータ：

```sql
-- Table structure
CREATE TABLE example_table (
    k2 int,
    k1 int,
    k1_copy int
);

-- JSON data
{"k1": 1, "k2": 2}
```
Load コマンド:

```shell
curl -v ... -H "format: json" \
    -H "jsonpaths: [\"$.k2\", \"$.k1\", \"$.k1\"]" \
    -H "columns: k2, k1, k1_copy" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/db_name/table_name/_stream_load
```
読み込み結果:

```text
+------+------+---------+
| k2   | k1   | k1_copy |
+------+------+---------+
|    2 |    1 |       1 |
+------+------+---------+
```
##### ネストされたフィールドマッピング

テーブル構造とデータ:

```sql
-- Table structure
CREATE TABLE example_table (
    k2 int,
    k1 int,
    k1_nested1 int,
    k1_nested2 int
);

-- JSON data
{
    "k1": 1,
    "k2": 2,
    "k3": {
        "k1": 31,
        "k1_nested": {
            "k1": 32
        }
    }
}
```
Load コマンド:

```shell
curl -v ... -H "format: json" \
    -H "jsonpaths: [\"$.k2\", \"$.k1\", \"$.k3.k1\", \"$.k3.k1_nested.k1\"]" \
    -H "columns: k2, k1, k1_nested1, k1_nested2" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/db_name/table_name/_stream_load
```
読み込み結果:

```text
+------+------+------------+------------+
| k2   | k1   | k1_nested1 | k1_nested2 |
+------+------+------------+------------+
|    2 |    1 |         31 |         32 |
+------+------+------------+------------+
```
## 使用例

このセクションでは、異なる読み込み方法におけるJSON形式の使用方法を説明します。

### Stream Load

```bash
# Using JSON Path
curl --location-trusted -u <user>:<passwd> \
    -H "format: json" \
    -H "jsonpaths: [\"$.id\", \"$.city\"]" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/example_db/example_table/_stream_load

# Specifying JSON root
curl --location-trusted -u <user>:<passwd> \
    -H "format: json" \
    -H "json_root: $.events" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/example_db/example_table/_stream_load

# Reading JSON by line
curl --location-trusted -u <user>:<passwd> \
    -H "format: json" \
    -H "read_json_by_line: true" \
    -T example.json \
    http://<fe_host>:<fe_http_port>/api/example_db/example_table/_stream_load
```
### Broker Load

```sql
-- Using JSON Path
LOAD LABEL example_db.example_label
(
    DATA INFILE("s3://bucket/path/example.json")
    INTO TABLE example_table
    FORMAT AS "json"
    PROPERTIES
    (
        "jsonpaths" = "[\"$.id\", \"$.city\"]"
    )
)
WITH S3 
(
    ...
);

-- Specifying JSON root
LOAD LABEL example_db.example_label
(
    DATA INFILE("s3://bucket/path/example.json")
    INTO TABLE example_table
    FORMAT AS "json"
    PROPERTIES
    (
        "json_root" = "$.events"
    )
)
WITH S3 
(
    ...
);
```
### Routine Load

```sql
-- Using JSON Path
CREATE ROUTINE LOAD example_db.example_job ON example_table
PROPERTIES
(
    "format" = "json",
    "jsonpaths" = "[\"$.id\", \"$.city\"]"
)
FROM KAFKA
(
    ...
);
```
### TVF Load

```sql
-- Using JSON Path
INSERT INTO example_table
SELECT *
FROM S3
(
    "path" = "s3://bucket/example.json",
    "format" = "json",
    "jsonpaths" = "[\"$.id\", \"$.city\"]",
    ...
);

-- Specifying JSON root
INSERT INTO example_table
SELECT *
FROM S3
(
    "path" = "s3://bucket/example.json",
    "format" = "json",
    "json_root" = "$.events",
    ...
);
