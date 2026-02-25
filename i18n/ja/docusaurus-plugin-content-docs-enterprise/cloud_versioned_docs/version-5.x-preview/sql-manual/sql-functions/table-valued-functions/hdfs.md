---
{
  "title": "LOCAL | Table Valued Functions",
  "description": "Local table-valued-function(tvf)は、ユーザーがbeノード上のローカルファイルの内容を、リレーショナルテーブルにアクセスするのと同様に読み取りおよびアクセスすることを可能にします。",
  "language": "ja"
}
---
# LOCAL

## Description

ローカルテーブル値関数（tvf）は、ユーザーがbeノード上のローカルファイルの内容を読み取りアクセスできるようにします。リレーショナルテーブルにアクセスするのと同様です。現在、`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`ファイル形式をサポートしています。

## syntax

```sql
LOCAL(
  "file_path" = "<file_path>", 
  "backend_id" = "<backend_id>",
  "format" = "<format>"
  [, "<optional_property_key>" = "<optional_property_value>" [, ...] ]
  );
```
## Required Parameters
| Parameter         | Description                                                                                                                                                                                          | Remarks                                           |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| `file_path`       | 読み込み対象ファイルのパス。`user_files_secure_path` ディレクトリを基準とした相対パスで指定します。`user_files_secure_path` パラメータはBE設定項目です。<br />パスに `..` を含めることはできず、`logs/*.log` のようなパターンマッチングにはglob構文を使用できます。 |                                                   |
| `backend_id`      | ファイルが配置されているBEノードのID。`show backends` コマンドで取得できます。                                                                                  | バージョン2.1.1より前では、Dorisは指定されたBEノードでそのノード上のローカルデータファイルを読み込むことのみサポートしています。 |
| `format`          | ファイル形式（必須）。サポートされる形式は `csv/csv_with_names/csv_with_names_and_types/json/parquet/orc` です。                                                                             |                                                   |

## Optional Parameters
| Parameter              | Description                                                                                                                                                                       | Remarks                                                                |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| `shared_storage`        | デフォルトは false。true の場合、指定されたファイルは共有ストレージ（例：NAS）上に配置されています。共有ストレージはPOSIXファイルインターフェースをサポートし、すべてのBEノードにマウントされている必要があります。<br />`shared_storage` が true の場合、`backend_id` は省略可能です。DorisはすべてのBEノードを利用してデータにアクセスする場合があります。`backend_id` が設定されている場合、指定されたBEノードでのみデータにアクセスします。 | バージョン2.1.2以降でサポート                                      |
| `column_separator`      | カラム区切り文字、省略可能、デフォルトは `\t` です。                                                                                                                                 |                                                                       |
| `line_delimiter`        | 行区切り文字、省略可能、デフォルトは `\n` です。                                                                                                                                   |                                                                       |
| `compress_type`         | 圧縮タイプ、省略可能。サポートされるタイプは `UNKNOWN/PLAIN/GZ/LZO/BZ2/LZ4FRAME/DEFLATE/SNAPPYBLOCK` です。デフォルトは `UNKNOWN` で、`uri` の拡張子から自動的にタイプが推測されます。 |                                                                       |
| `read_json_by_line`     | JSON形式インポート用、省略可能、デフォルトは `true` です。                                                                                                                            | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `strip_outer_array`     | JSON形式インポート用、省略可能、デフォルトは `false` です。                                                                                                                           | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `json_root`             | JSON形式インポート用、省略可能、デフォルトは空です。                                                                                                                               | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `json_paths`            | JSON形式インポート用、省略可能、デフォルトは空です。                                                                                                                               | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `num_as_string`         | JSON形式インポート用、省略可能、デフォルトは `false` です。                                                                                                                            | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `fuzzy_parse`           | JSON形式インポート用、省略可能、デフォルトは `false` です。                                                                                                                            | 参照: [Json Load](../../../data-operate/import/file-format/json) |
| `trim_double_quotes`    | CSV形式インポート用、省略可能、デフォルトは `false` です。true の場合、CSVファイル内の各フィールドの最外側の二重引用符を除去します。                                          | CSV形式用                                                           |
| `skip_lines`            | CSV形式インポート用、省略可能、デフォルトは `0` で、CSVファイルの最初の数行をスキップします。形式が `csv_with_names` または `csv_with_names_and_types` の場合、このパラメータは無視されます。 | CSV形式用                                                           |
| `path_partition_keys`   | 省略可能、ファイルパスに含まれるパーティションカラム名を指定します。例：`/path/to/city=beijing/date="2023-07-09"` の場合、`path_partition_keys="city,date"` と記入します。これにより、パスから対応するカラム名と値が自動的に読み取られ、インポートに使用されます。 |                                                                       |
| `enable_mapping_varbinary` | デフォルトは false。PARQUET/ORC読み込み時、BYTE_ARRAY型をSTRINGにマッピングします。有効にすると、VARBINARY型にマッピングします。 | 4.0.3以降でサポート |

## Access Control Requirements
| Privilege  | Object | Notes |
| :--------- |:-------|:------|
| ADMIN_PRIV | global |       |


## Usage Notes

- local tvfのより詳細な使用方法については、[S3](./s3.md) tvfを参照してください。両者の唯一の違いは、ストレージシステムへのアクセス方法です。

- local tvfを通じてNAS上のデータにアクセス

  NAS共有ストレージは、複数のノードに同時にマウントすることができます。各ノードは、ローカルファイルと同様に共有ストレージ内のファイルにアクセスできます。したがって、NASはローカルファイルシステムとして考えることができ、local tvfを通じてアクセスします。

  `"shared_storage" = "true"` を設定すると、Dorisは指定されたファイルが任意のBEノードからアクセス可能であると判断します。ワイルドカードを使用してファイルセットが指定された場合、Dorisはファイルアクセス要求を複数のBEノードに分散し、複数のノードを使用して分散ファイルスキャンを実行し、クエリパフォーマンスを向上させます。


## Examples

指定されたBE上のログファイルを解析：

```sql
select * from local(
        "file_path" = "log/be.out",
        "backend_id" = "10006",
        "format" = "csv")
       where c1 like "%start_time%" limit 10;
```
```text
+--------------------------------------------------------+
| c1                                                     |
+--------------------------------------------------------+
| start time: 2023 年 08 月 07 日 星期一 23:20:32 CST       |
| start time: 2023 年 08 月 07 日 星期一 23:32:10 CST       |
| start time: 2023 年 08 月 08 日 星期二 00:20:50 CST       |
| start time: 2023 年 08 月 08 日 星期二 00:29:15 CST       |
+--------------------------------------------------------+
```
パス `${DORIS_HOME}/student.csv` にあるcsv形式のファイルを読み取りアクセスします：

```sql
select * from local(
      "file_path" = "student.csv", 
      "backend_id" = "10003", 
      "format" = "csv");
```
```text
+------+---------+--------+
| c1   | c2      | c3     |
+------+---------+--------+
| 1    | alice   | 18     |
| 2    | bob     | 20     |
| 3    | jack    | 24     |
| 4    | jackson | 19     |
| 5    | liming  | d18    |
+------+---------+--------+
```--+---------+--------+
```

Query files on NAS:
```sql
select * from local(
        "file_path" = "/mnt/doris/prefix_*.txt",
        "format" = "csv",
        "column_separator" =",",
        "shared_storage" = "true");

```
```text
+------+------+------+
| c1   | c2   | c3   |
+------+------+------+
| 1    | 2    | 3    |
| 1    | 2    | 3    |
| 1    | 2    | 3    |
| 1    | 2    | 3    |
| 1    | 2    | 3    |
+------+------+------+

```

Can be used with `desc function` :
```sql
desc function local(
      "file_path" = "student.csv", 
      "backend_id" = "10003", 
      "format" = "csv");

```
```text
+-------+------+------+-------+---------+-------+
| Field | Type | Null | Key   | Default | Extra |
+-------+------+------+-------+---------+-------+
| c1    | TEXT | Yes  | false | NULL    | NONE  |
| c2    | TEXT | Yes  | false | NULL    | NONE  |
| c3    | TEXT | Yes  | false | NULL    | NONE  |
+-------+------+------+-------+---------+-------+

```
