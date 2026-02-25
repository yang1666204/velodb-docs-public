---
{
  "title": "LOCAL",
  "description": "Local table-valued-function(tvf)は、ユーザーがbeノード上のローカルファイルの内容を、リレーショナルテーブルにアクセスするのと同じように読み取りアクセスすることを可能にします。",
  "language": "ja"
}
---
## 説明

ローカルtable-valued-function(tvf)は、ユーザーがbeノード上のローカルファイルコンテンツをリレーショナルテーブルにアクセスするのと同じように読み取りおよびアクセスできるようにします。現在、`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`ファイル形式をサポートしています。

## syntax

```sql
LOCAL(
  "file_path" = "<file_path>", 
  "backend_id" = "<backend_id>",
  "format" = "<format>"
  [, "<optional_property_key>" = "<optional_property_value>" [, ...] ]
  );
```
## 必須パラメータ
| パラメータ         | 説明                                                                                                                                                                                          | 備考                                           |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| `file_path`       | 読み取るファイルのパス。`user_files_secure_path` ディレクトリからの相対パス。`user_files_secure_path` パラメータはBE設定項目。<br /> パスに `..` を含めることはできず、`logs/*.log` のようなパターンマッチングにはglob構文を使用できます。 |                                                   |
| `backend_id`      | ファイルが配置されているBEノードのID。`show backends` コマンドで取得できます。                                                                                                  | バージョン2.1.1以前では、DorisはBEノードを指定してそのノード上のローカルデータファイルを読み取ることのみをサポートしています。 |
| `format`          | ファイル形式。必須。サポートされている形式は `csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`。                                                                             |                                                   |

## オプションパラメータ
| パラメータ              | 説明                                                                                                                                                                       | 備考                                                                |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| `shared_storage`        | デフォルトはfalse。trueの場合、指定されたファイルは共有ストレージ（例：NAS）に配置されます。共有ストレージはPOSIXファイルインターフェースをサポートし、すべてのBEノードにマウントされている必要があります。<br /> `shared_storage` がtrueの場合、`backend_id` は省略可能です。DorisはすべてのBEノードを利用してデータにアクセスする場合があります。`backend_id` が設定されている場合、指定されたBEノードでのみデータにアクセスします。 | バージョン2.1.2以降でサポート                                      |
| `column_separator`      | カラム区切り文字。オプション。デフォルトは `\t`。                                                                                                                                 |                                                                       |
| `line_delimiter`        | 行区切り文字。オプション。デフォルトは `\n`。                                                                                                                                   |                                                                       |
| `compress_type`         | 圧縮タイプ。オプション。サポートされているタイプは `UNKNOWN/PLAIN/GZ/LZO/BZ2/LZ4FRAME/DEFLATE/SNAPPYBLOCK`。デフォルトは `UNKNOWN` で、`uri` のサフィックスからタイプが自動推論されます。 |                                                                       |
| `read_json_by_line`     | JSON形式インポート用。オプション。デフォルトは `true`。                                                                                                                            | 参照：Json Load |
| `strip_outer_array`     | JSON形式インポート用。オプション。デフォルトは `false`。                                                                                                                           | 参照：Json Load |
| `json_root`             | JSON形式インポート用。オプション。デフォルトは空。                                                                                                                               | 参照：Json Load |
| `json_paths`            | JSON形式インポート用。オプション。デフォルトは空。                                                                                                                               | 参照：Json Load |
| `num_as_string`         | JSON形式インポート用。オプション。デフォルトは `false`。                                                                                                                            | 参照：Json Load |
| `fuzzy_parse`           | JSON形式インポート用。オプション。デフォルトは `false`。                                                                                                                            | 参照：Json Load |
| `trim_double_quotes`    | CSV形式インポート用。オプション。デフォルトは `false`。trueの場合、CSVファイル内の各フィールドの最も外側のダブルクォートを削除します。                                          | CSV形式用                                                           |
| `skip_lines`            | CSV形式インポート用。オプション。デフォルトは `0`。CSVファイルの最初の数行をスキップします。形式が `csv_with_names` または `csv_with_names_and_types` の場合、このパラメータは無視されます。 | CSV形式用                                                           |
| `path_partition_keys`   | オプション。ファイルパスに含まれるパーティションカラム名を指定します。例：`/path/to/city=beijing/date="2023-07-09"` の場合、`path_partition_keys="city,date"` と入力します。これにより、対応するカラム名と値がパスから自動的に読み取られてインポートに使用されます。 |                                                                       |


## アクセス制御要件
| 権限  | オブジェクト | 注記 |
| :--------- |:-------|:------|
| ADMIN_PRIV | global |       |


## 使用上の注意

- local tvfのより詳細な使用方法については、[S3](./s3.md) tvfを参照してください。両者の唯一の違いはストレージシステムへのアクセス方法です。

- local tvfを通じたNASのデータアクセス

  NAS共有ストレージは複数のノードに同時にマウントできます。各ノードはローカルファイルと同様に共有ストレージ内のファイルにアクセスできます。そのため、NASはローカルファイルシステムとして考えることができ、local tvfを通じてアクセスします。

  `"shared_storage" = "true"` を設定した場合、Dorisは指定されたファイルが任意のBEノードからアクセス可能であると認識します。ワイルドカードを使用してファイルセットが指定された場合、Dorisはファイルアクセス要求を複数のBEノードに分散し、複数のノードを使用して分散ファイルスキャンを実行し、クエリパフォーマンスを向上させます。


## 例

指定されたBE上のログファイルを分析：

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
パス `${DORIS_HOME}/student.csv` にあるcsv形式のファイルを読み取りおよびアクセスします：

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
