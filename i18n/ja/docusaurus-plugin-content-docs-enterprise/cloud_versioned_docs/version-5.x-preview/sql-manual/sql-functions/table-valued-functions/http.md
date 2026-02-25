---
{
  "title": "HTTP",
  "description": "HTTPテーブル値関数（tvf）を使用すると、ユーザーはHTTPパス上のファイル内容を、リレーショナルテーブル形式のデータにアクセスするかのように読み取りおよびアクセスできます。",
  "language": "ja"
}
---
HTTP table-valued-function (tvf) は、ユーザーがHTTPパス上のファイルコンテンツをリレーショナルテーブル形式のデータにアクセスするかのように読み込みおよびアクセスすることを可能にします。現在、`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`ファイル形式をサポートしています。

:::note
4.0.2からサポート
:::

## Syntax

```sql
HTTP(
    "uri" = "<uri>",
    "format" = "<format>"
    [, "<optional_property_key>" = "<optional_property_value>" [, ...] ]
  )
```
### 必須パラメータ

| Parameter         | Description                  |
|-------------------|------------------------------|
| uri               | アクセス用のHTTPアドレス。`http`、`https`、`hf`プロトコルをサポート。|
| format            | ファイル形式。`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`をサポート |

`hf://`（Hugging Face）については、[Analyzing Hugging Face Data](../../../lakehouse/huggingface.md)を参照してください。

### オプションパラメータ

| Parameter     | Description   | Notes    |
|-------|-----------|------------------------|
|  `http.header.xxx`  | 任意のHTTP Headerを指定するために使用され、HTTP Clientに直接渡される。例：`"http.header.Authorization" = "Bearer hf_MWYzOJJoZEymb..."`の場合、最終的なHeaderは`Authorization: Bearer hf_MWYzOJJoZEymb...`となる |
| `http.enable.range.request` | HTTPサービスへのアクセスにrange requestを使用するかどうか。デフォルトは`true`。|
| `http.max.request.size.bytes` | non-range requestモードを使用する際の最大アクセスサイズ制限。デフォルトは100MB |

`http.enable.range.request`が`true`の場合、システムは最初にrange requestを使用してHTTPサービスへのアクセスを試行します。HTTPサービスがrange requestをサポートしていない場合、自動的にnon-range requestモードにフォールバックします。また、最大アクセスデータサイズは`http.max.request.size.bytes`によって制限されます。

## Examples

- GitHubからCSVデータを読み取り

  ```sql
  SELECT COUNT(*) FROM
  HTTP(
      "uri" = "https://raw.githubusercontent.com/apache/doris/refs/heads/master/regression-test/data/load_p0/http_stream/all_types.csv",
      "format" = "csv",
      "column_separator" = ","
  );
  ```
GitHub からのParquetデータへのアクセス

  ```sql
  SELECT arr_map, id FROM
  HTTP(
      "uri" = "https://raw.githubusercontent.com/apache/doris/refs/heads/master/regression-test/data/external_table_p0/tvf/t.parquet",
      "format" = "parquet"
  );
  ```
- GitHubからJSONデータにアクセスし、`desc function`で使用する

  ```sql
  DESC FUNCTION
  HTTP(
      "uri" = "https://raw.githubusercontent.com/apache/doris/refs/heads/master/regression-test/data/load_p0/stream_load/basic_data.json",
      "format" = "json",
      "strip_outer_array" = "true"
  );
  ```
