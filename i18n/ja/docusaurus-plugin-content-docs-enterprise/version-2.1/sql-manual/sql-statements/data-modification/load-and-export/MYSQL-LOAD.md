---
{
  "title": "MYSQL LOAD",
  "description": "MySQL clientを使用してローカルデータファイルをDorisにインポートします。MySQL Loadは同期インポート方式です。",
  "language": "ja"
}
---
## 概要

MySQLクライアントを使用してローカルデータファイルをDorisにインポートします。MySQL Loadは同期インポート方式で、実行後すぐにインポート結果を返します。`LOAD DATA`文の返り値に基づいてインポートが成功したかどうかを判断できます。MySQL Loadは一括のインポートタスクの原子性を保証できます。つまり、すべてのインポートが成功するか、すべてが失敗するかのいずれかです。

## 構文

```sql
LOAD DATA
[ LOCAL ]
INFILE "<file_name>"
INTO TABLE "<tbl_name>"
[ PARTITION (<partition_name> [, ... ]) ]
[ COLUMNS TERMINATED BY "<column_separator>" ]
[ LINES TERMINATED BY "<line_delimiter>" ]
[ IGNORE <number> {LINES | ROWS} ]
[ (<col_name_or_user_var> [, ... ] ) ]
[ SET (col_name={<expr> | DEFAULT} [, col_name={<expr> | DEFAULT}] ...) ]
[ PROPERTIES ("<key>" = "<value>" [ , ... ]) ]
```
## Required Parameters

**1. `<file_name>`**

> ローカルファイルのパスを指定します。相対パスまたは絶対パスのいずれかを使用できます。現在、単一ファイルのみがサポートされており、複数ファイルはサポートされていません。

**2. `<tbl_name>`**

> テーブル名には、例に示すようにデータベース名を含めることができます。データベース名を省略した場合、現在のユーザーのデータベースが使用されます。

## Optional Parameters

**1. `LOCAL`**

> `LOCAL`を指定すると、クライアントからファイルを読み取ることを示します。省略した場合は、FEサーバーのローカルストレージからファイルを読み取ることを意味します。FEサーバーからファイルをインポートする機能は、デフォルトで無効になっています。この機能を有効にするには、FEノードで`mysql_load_server_secure_path`を設定してセキュアパスを指定する必要があります。

**2. `<partition_name>`**

> インポート用に複数のパーティションを指定できます。カンマで区切って指定します。

**3. `<column_separator>`**

> カラム区切り文字を指定します。

**4. `<line_delimiter>`**

> 行区切り文字を指定します。

**5. `IGNORE <number> { LINES | ROWS }`**

> ユーザーはCSVファイルのヘッダーまたは任意の行数をスキップできます。この構文は`IGNORE num ROWS`に置き換えることもできます。

**6. `<col_name_or_user_var>`**

> カラムマッピング構文です。具体的なパラメータについては、インポート時のData Transformationのカラムマッピングセクションを参照してください。

**7. `properties ("<key>"="<value>",...)`**

| Parameter | Parameter Description |
| ---------------------- | ------------------------------------------------------------ |
| max_filter_ratio | フィルタ可能なデータの最大許容比率（データ不整合などの理由による）で、デフォルトは許容なしです。 |
| timeout | インポートタイムアウト期間を秒単位で指定します。デフォルトは600秒で、有効範囲は1秒から259,200秒です。 |
| strict_mode | ユーザーはこのインポートでstrict modeを有効にするかどうかを指定できます。デフォルトは無効です。 |
| timezone | このインポートのタイムゾーンを指定します。デフォルトは東八時間帯です。このパラメータは、インポートに関わるすべてのタイムゾーン関連関数の結果に影響します。 |
| exec_mem_limit | インポートメモリ制限で、デフォルトは2GBをバイト単位で指定します。 |
| trim_double_quotes | boolean型でデフォルト値は`false`です。`true`に設定すると、インポートファイルの各フィールドの最外側のダブルクォートを除去することを意味します。 |
| enclose | 囲み文字です。CSVデータフィールドが行区切り文字またはカラム区切り文字を含む場合、誤った切り捨てを防ぐために、単一バイト文字を保護用の囲み文字として指定できます。例えば、カラム区切り文字が","、囲み文字が"'"、データが"a,'b,c'"の場合、"b,c"は1つのフィールドとして解析されます。注意：`enclose`を`""`に設定する場合、`trim_double_quotes`を`true`に設定する必要があります。 |
| escape | エスケープ文字です。CSVフィールド内の囲み文字と同じ文字をエスケープするために使用されます。例えば、データが"a,'b,'c'"、囲み文字が"'"で、"b,'c"を1つのフィールドとして解析したい場合、""などの単一バイトエスケープ文字を指定し、データを"a,'b,'c'"に変更する必要があります。 |

## Access Control Requirements

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | Notes |
| :---------------- | :------------- | :---------------------------- |
| LOAD_PRIV | Table | 指定されたデータベーステーブルのインポート権限。 |

## Usage Notes

- MySQL Load文は`LOAD DATA`構文で開始し、LABELの指定は不要です。

## Examples

1. クライアントのローカルファイル`testData`から、データベース`testDb`のテーブル`testTbl`にデータをインポートします。タイムアウトを100秒に指定します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PROPERTIES ("timeout"="100")
    ```
2. サーバーのローカルファイル`/root/testData`からデータをインポートし（FE設定`mysql_load_server_secure_path`を`/root`に設定する必要があります）、データベース`testDb`のテーブル`testTbl`に取り込みます。タイムアウトを100秒に指定します。

    ```sql
    LOAD DATA
    INFILE '/root/testData'
    INTO TABLE testDb.testTbl
    PROPERTIES ("timeout"="100")
    ```
3. クライアントのローカルファイル`testData`から、データベース`testDb`内のテーブル`testTbl`にデータをインポートし、エラー率20%を許可します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PROPERTIES ("max_filter_ratio"="0.2")
    ```
4. クライアントのローカルファイル`testData`から、データベース`testDb`内のテーブル`testTbl`にデータをインポートします。エラー率20%を許可し、ファイルの列名を指定します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    (k2, k1, v1)
    PROPERTIES ("max_filter_ratio"="0.2")
    ```
5. ローカルファイル`testData`からデータベース`testDb`内のテーブル`testTbl`のパーティション`p1`と`p2`にデータをインポートし、エラー率20%を許可します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PARTITION (p1, p2)
    PROPERTIES ("max_filter_ratio"="0.2")
    ```
6. ローカルCSVファイル`testData`から、行区切り文字`0102`と列区切り文字`0304`を使用して、データベース`testDb`のテーブル`testTbl`にデータをインポートします。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    COLUMNS TERMINATED BY '0304'
    LINES TERMINATED BY '0102'
    ```
7. ローカルファイル`testData`からデータをインポートし、データベース`testDb`内のテーブル`testTbl`のパーティション`p1`および`p2`に格納し、最初の3行をスキップします。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PARTITION (p1, p2)
    IGNORE 3 LINES
    ```
8. strict modeフィルタリングを使用してデータをインポートし、タイムゾーンを`Africa/Abidjan`に設定します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PROPERTIES ("strict_mode"="true", "timezone"="Africa/Abidjan")
    ```
9. インポートメモリを10GBに制限し、データインポートのタイムアウトを10分に設定します。

    ```sql
    LOAD DATA LOCAL
    INFILE 'testData'
    INTO TABLE testDb.testTbl
    PROPERTIES ("exec_mem_limit"="10737418240", "timeout"="600")
    ```
