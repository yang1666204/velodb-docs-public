---
{
  "title": "HDFS | テーブル値関数",
  "description": "HDFS table-valued-function(tvf)は、ユーザーがS3互換オブジェクトストレージ上のファイルコンテンツを、リレーショナルテーブルにアクセスするのと同じように読み取りおよびアクセスすることを可能にします。",
  "language": "ja"
}
---
# HDFS

## 説明

HDFSのtable-valued-function(tvf)は、ユーザーがS3互換オブジェクトストレージ上のファイル内容をリレーショナルテーブルにアクセスするのと同様に読み取りおよびアクセスできるようにします。現在、`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc`ファイル形式をサポートしています。

## 構文

```sql
HDFS(
    "uri" = "<uri>",
    "fs.defaultFS" = "<fs_defaultFS>",
    "hadoop.username" = "<hadoop_username>",
    "format" = "<format>",
    [, "<optional_property_key>" = "<optional_property_value>" [, ...] ]
  );
```
## 必須パラメータ
| パラメータ              | 説明                                                                                                            |
|------------------------|------------------------------------------------------------------------------------------------------------------------|
| `uri`                  | HDFSにアクセスするためのURI。URIパスが存在しないかファイルが空の場合、HDFS TVFは空のセットを返します。 |
| `fs.defaultFS`         | HDFSのデフォルトファイルシステムURI                                                                                    |
| `hadoop.username`      | 必須。任意の文字列を指定できますが、空にすることはできません。                                                        |
| `format`               | ファイル形式。必須。現在は`csv/csv_with_names/csv_with_names_and_types/json/parquet/orc/avro`をサポートしています。           |

## オプションパラメータ

上記構文の`optional_property_key`では、必要に応じて以下のリストから対応するパラメータを選択でき、`optional_property_value`はそのパラメータの値です。

| パラメータ                                   | 説明                                                                                                                                  | 備考                                                                             |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `hadoop.security.authentication`            | HDFSセキュリティ認証タイプ                                                                                                            |                                                                                     |
| `hadoop.username`                           | 代替HDFSユーザー名                                                                                                                    |                                                                                     |
| `hadoop.kerberos.principal`                 | Kerberosプリンシパル                                                                                                                           |                                                                                     |
| `hadoop.kerberos.keytab`                    | Kerberos keytab                                                                                                                                 |                                                                                     |
| `dfs.client.read.shortcircuit`              | short-circuit readを有効にする                                                                                                                    |                                                                                     |
| `dfs.domain.socket.path`                   | ドメインソケットパス                                                                                                                           |                                                                                     |
| `dfs.nameservices`                          | HAモード用のnameservice                                                                                                                  |                                                                                     |
| `dfs.ha.namenodes.your-nameservices`        | HAモードでのnamenodeの設定                                                                                                        |                                                                                     |
| `dfs.namenode.rpc-address.your-nameservices.your-namenode` | namenodeのRPCアドレスを指定                                                                                                     |                                                                                     |
| `dfs.client.failover.proxy.provider.your-nameservices` | フェイルオーバー用のプロキシプロバイダーを指定                                                                                                      |                                                                                     |
| `column_separator`                          | 列区切り文字。デフォルトは`\t`                                                                                                            |                                                                                     |
| `line_delimiter`                            | 行区切り文字。デフォルトは`\n`                                                                                                              |                                                                                     |
| `compress_type`                             | サポートされるタイプ：`UNKNOWN/PLAIN/GZ/LZO/BZ2/LZ4FRAME/DEFLATE/SNAPPYBLOCK`。デフォルトは`UNKNOWN`で、URIサフィックスに基づいてタイプが自動的に推測されます。 |                                                                                     |
| `read_json_by_line`                         | JSON形式のインポート用。デフォルトは`true`                                                                                                   | 参照：JSON Load |
| `strip_outer_array`                         | JSON形式のインポート用。デフォルトは`false`                                                                                                  | 参照：JSON Load |
| `json_root`                                 | JSON形式のインポート用。デフォルトは空                                                                                                   | 参照：JSON Load |
| `json_paths`                                | JSON形式のインポート用。デフォルトは空                                                                                                   | 参照：JSON Load |
| `num_as_string`                             | JSON形式のインポート用。デフォルトは`false`                                                                                                 | 参照：JSON Load |
| `fuzzy_parse`                               | JSON形式のインポート用。デフォルトは`false`                                                                                                 | 参照：JSON Load |
| `trim_double_quotes`                        | CSV形式のインポート用。boolean型。デフォルトは`false`。`true`の場合、各フィールドの最外側の二重引用符を削除します。                  |                                                                                     |
| `skip_lines`                                | CSV形式のインポート用。integer型。デフォルトは0。CSVファイルの最初の数行をスキップします。`csv_with_names`または`csv_with_names_and_types`が設定されている場合、このパラメータは無視されます。 |                                                                                     |
| `path_partition_keys`                       | ファイルパスに含まれるパーティション列名を指定します。例：`/path/to/city=beijing/date="2023-07-09"`の場合、`path_partition_keys="city,date"`と入力すると、パスから対応する列名と値を自動的に読み取ってインポートします。 |                                                                                     |
| `resource`                                  | リソース名を指定します。HDFS TVFは既存のHDFSリソースを使用して直接HDFSにアクセスできます。HDFSリソースの作成については[CREATE-RESOURCE](../../sql-statements/cluster-management/compute-management/CREATE-RESOURCE)を参照してください。 | バージョン2.1.4以上でサポート。                                            |

## アクセス制御要件

| 権限     | オブジェクト | 備考 |
|:--------------|:-------|:------|
| USAGE_PRIV    | table  |       |
| SELECT_PRIV   | table  |       |


## 例

- hdfsストレージ上のcsv形式ファイルの読み取りとアクセス。

  ```sql
  select * from hdfs(
                "uri" = "hdfs://127.0.0.1:842/user/doris/csv_format_test/student.csv",
                "fs.defaultFS" = "hdfs://127.0.0.1:8424",
                "hadoop.username" = "doris",
                "format" = "csv");
  ```
  ```text
    +------+---------+------+
    | c1   | c2      | c3   |
    +------+---------+------+
    | 1    | alice   | 18   |
    | 2    | bob     | 20   |
    | 3    | jack    | 24   |
    | 4    | jackson | 19   |
    | 5    | liming  | 18   |
    +------+---------+------+
  ```
- HA モードでhdfs storage上のcsvフォーマットファイルを読み取りおよびアクセスする。

  ```sql
  select * from hdfs(
              "uri" = "hdfs://127.0.0.1:842/user/doris/csv_format_test/student.csv",
              "fs.defaultFS" = "hdfs://127.0.0.1:8424",
              "hadoop.username" = "doris",
              "format" = "csv",
              "dfs.nameservices" = "my_hdfs",
              "dfs.ha.namenodes.my_hdfs" = "nn1,nn2",
              "dfs.namenode.rpc-address.my_hdfs.nn1" = "nanmenode01:8020",
              "dfs.namenode.rpc-address.my_hdfs.nn2" = "nanmenode02:8020",
              "dfs.client.failover.proxy.provider.my_hdfs" = "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider");
  ```
  ```text
    +------+---------+------+
    | c1   | c2      | c3   |
    +------+---------+------+
    | 1    | alice   | 18   |
    | 2    | bob     | 20   |
    | 3    | jack    | 24   |
    | 4    | jackson | 19   |
    | 5    | liming  | 18   |
    +------+---------+------+
  ```
- `desc function` と組み合わせて使用できます：

  ```sql
  desc function hdfs(
              "uri" = "hdfs://127.0.0.1:8424/user/doris/csv_format_test/student_with_names.csv",
              "fs.defaultFS" = "hdfs://127.0.0.1:8424",
              "hadoop.username" = "doris",
              "format" = "csv_with_names");
  ```
