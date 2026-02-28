---
{
  "title": "JDBC カタログ",
  "description": "JDBC Catalogは、標準のJDBCインターフェースを通じてJDBCプロトコルと互換性のあるデータベースへの接続をサポートします。",
  "language": "ja"
}
---
JDBC Catalogは、標準のJDBCインターフェースを通じてJDBCプロトコルと互換性のあるデータベースへの接続をサポートしています。

本文書では、JDBC Catalogの一般的な設定と使用方法について紹介します。異なるJDBCソースについては、それぞれのドキュメントを参照してください。

:::info Note
DorisのJDBC Catalog機能は、データの読み取りと処理にJavaレイヤーに依存しており、その全体的なパフォーマンスはJDKバージョンの影響を受ける可能性があります。古いバージョンのJDK（JDK 8など）の一部の内部ライブラリは効率が低く、より高いリソース消費につながる場合があります。より高いパフォーマンスが必要な場合は、デフォルトでJDK 17でコンパイルされ、より良い全体的なパフォーマンスを提供するDoris 3.0の使用を推奨します。
:::

## 適用シナリオ

JDBC Catalogは、データソースから少量のデータをDorisにインポートしたり、JDBCデータソース内の小さなTableに対して結合クエリを実行したりするなど、データ統合にのみ適しています。JDBC Catalogは、データソース上でのクエリを高速化したり、大量のデータに一度にアクセスしたりすることはできません。

## サポートされているデータベース

Doris JDBC Catalogは、以下のデータベースへの接続をサポートしています：

| サポートされているデータソース |
| ---------------------------------- |
| [ MySQL](./jdbc-mysql-catalog.md)      |
| [ PostgreSQL](./jdbc-mysql-catalog.md) |
| [ Oracle](./jdbc-mysql-catalog.md)     |
| [ SQL サーバー](./jdbc-mysql-catalog.md) |
| [ IBM DB2](./jdbc-mysql-catalog.md)    |
| [ ClickHouse](./jdbc-clickhouse-catalog.md) |
| [ SAP HANA](./jdbc-saphana-catalog.md)   |
| [ Oceanbase](./jdbc-oceanbase-catalog.md) |

[Developer Guide](https://doris.apache.org/community/how-to-contribute/jdbc-catalog-developer-guide)を参照して、新しい、サポートされていないJDBCデータソースのサポートを開発できます。

## Catalogの設定

### 構文

```sql
CREATE CATALOG [IF NOT EXISTS] catalog_name PROPERTIES (
    'type' =='jdbc', -- required
    {JdbcProperties},
    {CommonProperties}
);
```
* `{JdbcProperties}`

  * 必須プロパティ

      | パラメータ名     | 説明                              | 例                       |
      | ---------------- | ---------------------------------------- | ----------------------------- |
      | `user`           | データソースのユーザー名                     |                               |
      | `password`       | データソースのパスワード                     |                               |
      | `jdbc_url`       | データソース接続URL               | `jdbc:mysql://host:3306`      |
      | `driver_url`     | JDBCドライバーファイルのパス。ドライバーパッケージのセキュリティについては、付録を参照してください。 | 3つの方法をサポート、以下を参照。 |
      | `driver_class`   | JDBCドライバーのクラス名            |                               |

      `driver_url`は以下の3つの指定方法をサポートします：
    
      1. ファイル名。例：`mysql-connector-j-8.3.0.jar`。JarファイルはFEおよびBEデプロイメントディレクトリ下の`jdbc_drivers/`ディレクトリに事前に配置する必要があります。システムは自動的にこのディレクトリを検索します。この場所は`fe.conf`および`be.conf`の`jdbc_drivers_dir`設定で変更することも可能です。
      
      2. ローカル絶対パス。例：`file:///path/to/mysql-connector-j-8.3.0.jar`。Jarファイルはすべての FE/BEノード上の指定パスに事前に配置する必要があります。
      
      3. HTTP URL。例：`http://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar`。システムはこのHTTPアドレスからドライバーファイルをダウンロードします。認証なしのHTTPサービスのみサポートします。

  * オプションプロパティ

      | パラメータ名                | デフォルト値 | 説明                                                                                                                                   |
      | ----------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
      | `lower_case_meta_names`       | false         | 外部データソースのデータベース、Table、カラム名を小文字で同期するかどうか                                        |
      | `meta_names_mapping`          |               | 外部データソースに`MY_TABLE`と`my_table`のように大文字小文字のみが異なる名前がある場合、DorisはCatalogを照会する際に曖昧さによりエラーを報告します。競合を解決するには`meta_names_mapping`パラメータを設定する必要があります。 |
      | `only_specified_database`     | false         | `jdbc_url`で指定されたデータベースのみを同期するかどうか（このDatabaseはDorisのDatabaseレベルにマッピングされます）                       |
      | `connection_pool_min_size`    | 1             | 接続プール内の最小接続数を定義し、プールの初期化とキープアライブが有効な場合に少なくともこの数のアクティブ接続を保証するために使用されます。 |
      | `connection_pool_max_size`    | 30            | 接続プール内の最大接続数を定義します。各Catalogに対応する各FEまたはBEノードは最大でこの数の接続を保持できます。 |
      | `connection_pool_max_wait_time`| 5000         | プール内に利用可能な接続がない場合にクライアントが接続を待機する最大待機時間をミリ秒で定義します。                         |
      | `connection_pool_max_life_time`| 1800000      | プール内の接続の最大アクティブ期間（ミリ秒）を設定します。この時間を超過した接続はリサイクルされます。また、この値の半分がプールの最小退避アイドル時間として使用され、この時間に達した接続は退避の対象となります。 |
      | `connection_pool_keep_alive`  | false         | BEノードでのみ有効で、最小退避アイドル時間に達したが最大ライフタイムには達していない接続をアクティブに保つかどうかを決定します。不要なリソース使用を削減するため、デフォルトで無効になっています。 |
        
* `[CommonProperties]`

  CommonPropertiesセクションは共通プロパティを設定するために使用されます。**共通プロパティ**については[Catalog概要](../catalog-overview.md)セクションを参照してください。

## クエリ操作

### 基本クエリ

```sql
-- 1. switch to catalog, use database and query
SWITCH mysql_ctl;
USE mysql_db;
SELECT * FROM mysql_tbl LIMIT 10;

-- 2. use mysql database directly
USE mysql_ctl.mysql_db;
SELECT * FROM mysql_tbl LIMIT 10;

-- 3. use full qualified name to query
SELECT * FROM mysql_ctl.mysql_db.mysql_tbl LIMIT 10;
```
### Query 最適化

#### Predicate Pushdown

JDBC Catalogがデータソースにアクセスする際、本質的にはBEノードを選択し、JDBC Clientを使用して生成されたSQLクエリをソースに送信し、データを取得します。したがって、パフォーマンスは生成されたSQLがソース側でどれだけ効率的に実行されるかにのみ依存します。Dorisは述語条件をプッシュダウンし、生成されたSQLに組み込むことを試行します。生成されたSQLを確認するには、`EXPLAIN SQL`文を使用できます。

```sql
EXPLAIN SELECT smallint_u, sum(int_u)
FROM all_types WHERE smallint_u > 10 GROUP BY smallint_u;

...
|   0:VJdbcScanNode(206)                                                                             |
|      TABLE: `doris_test`.`all_types`                                                               |
|      QUERY: SELECT `smallint_u`, `int_u` FROM `doris_test`.`all_types` WHERE ((`smallint_u` > 10)) |
|      PREDICATES: (smallint_u[#1] > 10)                                                             |
|      final projections: smallint_u[#1], int_u[#3]                                                  |
|      final project output tuple id: 1   
...                                                           |
```
#### ファンクション Pushdown

述語条件について、Dorisおよび外部データソースにおけるセマンティクスまたは動作が一致しない場合があります。そのため、DorisはJDBC外部Tableクエリにおける述語プッシュダウンを以下のパラメータ変数によって制限および制御しています：

> 注意：現在、DorisはMySQL、Clickhouse、およびOracleデータソースに対してのみ述語プッシュダウンをサポートしています。将来的にはより多くのデータソースがサポートされる予定です。

- `enable_jdbc_oracle_null_predicate_push_down`

    セッション変数。デフォルトは`false`です。つまり、述語条件に`NULL`値が含まれる場合、述語はOracleデータソースにプッシュダウンされません。これは、Oracleバージョン21より前では、Oracleが`NULL`を演算子としてサポートしていないためです。

    このパラメータは2.1.7および3.0.3以降でサポートされています。

- `enable_jdbc_cast_predicate_push_down`

    セッション変数。デフォルトは`false`です。つまり、述語条件に明示的または暗黙的なCASTがある場合、述語はJDBCデータソースにプッシュダウンされません。CASTの動作は異なるデータベース間で一致しないため、正確性を保証するために、デフォルトではCASTはプッシュダウンされません。ただし、ユーザーはCASTの動作が一致するかどうかを手動で検証することができます。一致する場合、このパラメータを`true`に設定して、より多くの述語をプッシュダウンし、パフォーマンスを向上させることができます。

    このパラメータは2.1.7および3.0.3以降でサポートされています。

- 関数プッシュダウンのブラックリストとホワイトリスト

    同じシグネチャを持つ関数でも、Dorisと外部データソースでセマンティクスが一致しない場合があります。Dorisは関数プッシュダウン用に事前定義されたブラックリストとホワイトリストを持っています：

    | Data Source   | Blacklist | Whitelist | デスクリプション     |
    | ---------- | ----- | --- | --------- |
    | MySQL      | - `DATE_TRUNC`<br>- `MONEY_FORMAT`<br>- `NEGTIVE`  |  | MySQLでは、FE設定項目`jdbc_mysql_unsupported_pushdown_functions`を通じて追加のブラックリスト項目を設定することもできます。例：`jdbc_mysql_unsupported_pushdown_functions==func1,func2` |
    | Clickhouse | | - `FROM_UNIXTIME`<br>- `UNIX_TIMESTAMP` |       |
    | Oracle     |  | - `NVL`<br>- `IFNULL`   |          |

- 関数書き換えルール

    Dorisと外部データソースには、動作は一致しているが名前が異なる関数があります。Dorisは関数プッシュダウン時にこれらの関数を書き換えることをサポートしています。現在、以下の書き換えルールが組み込まれています：

    | Data Source   | Doris ファンクション | Target ファンクション |
    | ---------- | ----- | --- |
    | MySQL | nvl | ifnull |
    | MySQL | to_date | date |
    | Clickhouse | from_unixtime | FROM_UNIXTIME |
    | Clickhouse | unix_timestamp | toUnixTimestamp |
    | Oracle | ifnull | nvl |

- カスタム関数プッシュダウンおよび書き換えルール

    3.0.7以降のバージョンでは、Dorisはより柔軟な関数プッシュダウンおよび書き換えルールをサポートしています。ユーザーはCatalogプロパティで特定のCatalogに対する関数プッシュダウンおよび書き換えルールを設定できます：

    ```sql
    create catalog jdbc properties (
    ...
    'function_rules' = '{"pushdown" : {"supported": ["to_date"], "unsupported" : ["abs"]}, "rewrite" : {"to_date" : "date2"}}'
    )
    ```
`function_rules`を通じて、以下のルールを指定できます：

    - `pushdown`

        関数プッシュダウンルールを指定します。`supported`と`unsupported`配列は、それぞれプッシュダウンできる関数名とできない関数名を指定します。関数が両方の配列に存在する場合、`supported`が優先されます。

        Dorisは最初にシステムの事前定義されたブラックリストとホワイトリストを適用し、その後ユーザー指定のブラックリストとホワイトリストを適用します。

    - `rewrite`

        関数リライトルールを定義します。上記の例のように、関数名`to_date`は`date2`として書き換えられてプッシュダウンされます。

        注意：プッシュダウンが許可された関数のみがリライトされます。

#### 行数制限

クエリに`LIMIT`キーワードが含まれる場合、Dorisはデータ転送量を削減するために`LIMIT`句をデータソースにプッシュダウンします。`EXPLAIN`文を使用して、生成されたSQLに`LIMIT`句が含まれているかを確認できます。

## 書き込み操作

DorisはJDBCプロトコル経由で対応するデータソースにデータを書き戻すことをサポートしています。

```sql
INSERT INTO mysql_table SELECT * FROM internal.doris_db.doris_tbl;
```
## Statement Passthrough

### 適用シナリオ

Dorisは、statement passthroughを通じてJDBCデータソース内で対応するDDL、DML、およびクエリステートメントを直接実行することをサポートしています。この機能は以下のシナリオで適用できます：

* 複雑なクエリのパフォーマンス向上

  デフォルトでは、Dorisクエリオプティマイザは元のSQLを解析し、特定のルールに基づいてデータソースに送信するSQLを生成します。この生成されたSQLは通常、シンプルな単一Tableクエリであり、集約やjoinクエリなどの演算子を含めることができません。例えば、以下のクエリを考えてみてください：

  ```sql
  SELECT smallint_u, sum(int_u)
  FROM all_types WHERE smallint_u > 10 GROUP BY smallint_u;
  ```
最終的に生成されるSQLは以下のようになります：

  ```sql
  SELECT smallint_u, int_u 
  FROM all_types
  WHERE smallint_u > 10;
  ```
この場合、集約操作はDoris内で実行されます。そのため、一部のシナリオでは、ネットワーク経由でソースから大量のデータを読み取る必要があり、クエリ効率が低下する可能性があります。statement passthroughを使用することで、元のSQLを直接データソースに渡すことができ、データソース自体の計算能力を活用してSQLを実行し、クエリパフォーマンスを向上させることができます。

* 統合管理

  クエリSQL に加えて、statement passthrough機能はDDLおよびDMLステートメントも渡すことができます。これにより、ユーザーはDorisを通じてソースデータに対して直接データベースやTable操作を実行することができ、Tableの作成、削除、またはTable構造の変更などが可能になります。

### Passthrough SQL

```sql
SELECT * FROM
QUERY(
  'catalog' = 'mysql_catalog', 
  'query' = 'SELECT smallint_u, sum(int_u) FROM db.all_types WHERE smallint_u > 10 GROUP BY smallint_u;'
);
```
`QUERY`Table関数は2つのパラメータを受け取ります：

* `catalog`：カタログの名前。カタログの名前と一致する必要があります。
* `query`：実行するクエリ文。対応するデータソースの構文を直接使用して記述します。

### Passthrough DDLおよびDML

```sql
CALL EXECUTE_STMT("jdbc_catalog", "insert into db1.tbl1 values(1,2), (3, 4)");

CALL EXECUTE_STMT("jdbc_catalog", "delete from db1.tbl1 where k1 = 2");

CALL EXECUTE_STMT("jdbc_catalog", "create table dbl1.tbl2 (k1 int)");
```
`EXECUTE_STMT()`関数は2つのパラメータを取ります：

* 第1パラメータ：カタログの名前。現在、JDBC型のカタログのみがサポートされています。
* 第2パラメータ：実行するSQL文。現在、DDLおよびDML文のみがサポートされており、対応するデータソースの構文を使用して記述する必要があります。

### 使用制限

`CALL EXECUTE_STMT()`コマンドを使用する際、Dorisはユーザーが記述したSQL文を、カタログに関連付けられたJDBCデータソースに直接送信して実行します。その結果、この操作には以下の制限があります：

* SQL文は対応するデータソースの構文に従う必要があります。Dorisは構文や意味のチェックを行いません。

* SQL文で参照されるTable名は、`db.tbl`のような完全修飾名を使用することが推奨されます。データベースが指定されていない場合、JDBCカタログのJDBC URLのデータベース名が使用されます。

* SQL文はJDBCデータソース外部のデータベースやTableを参照することはできず、DorisのデータベースやTableも参照できません。ただし、Doris JDBCカタログと同期されていないJDBCデータソース内のTableは参照できます。

* DML文を実行する際、挿入、更新、または削除された行数を取得することはできません。コマンドの成功または失敗のみを判断できます。

* カタログに対する`LOAD`権限を持つユーザーのみが`CALL EXECUTE_STMT()`コマンドを実行できます。

* カタログに対する`SELECT`権限を持つユーザーのみが`query()`Table関数を実行できます。

* カタログ作成時に指定されたJDBCユーザーは、対応する文を実行するためにソース上で必要な権限を持つ必要があります。

* `query()`Table関数によって読み取られた結果のデータ型は、クエリされたカタログタイプがサポートするデータ型と一致します。

## 付録

### 大文字小文字の区別の設定

デフォルトでは、Dorisのデータベース名とTable名は大文字小文字を区別し、カラム名は区別しません。この動作は設定パラメータを通じて変更できます。さらに、一部のJDBCデータソースでのデータベース、Table、およびカラム名の大文字小文字区別ルールはDorisのものと異なる場合があります。この違いは、JDBC Catalogを介した名前マッピング中に名前の競合を引き起こす可能性があります。以下のセクションでは、このような問題を解決する方法について説明します。

#### 表示名とクエリ名

Dorisでは、オブジェクト名（ここではTable名を例に使用します）は**表示名**と**クエリ名**に分けることができます。例えば、Table名の場合、**表示名**は`SHOW TABLES`の結果に表示される名前を指し、**クエリ名**は`SELECT`文で使用できる名前を指します。

例えば、Tableの実際の名前が`MyTable`の場合、このTableの**表示名**と**クエリ名**はFrontend（FE）パラメータ`lower_case_table_names`の設定に応じて異なる場合があります：

| 設定 | 説明 | 実際の名前 | 表示名 | クエリ名 |
| --- | --- | --- | --- | --- |
| `lower_case_table_names=0` | デフォルト設定。元の名前が保存・表示され、クエリは大文字小文字を区別します。 | `MyTable` | `MyTable` | クエリで大文字小文字を区別し、`MyTable`を使用する必要があります |
| `lower_case_table_names=1` | 名前は小文字で保存・表示され、クエリは大文字小文字を区別しません。 | `MyTable` | `mytable` | クエリで大文字小文字を区別せず、例えば`MyTable`や`mytable`が使用できます。 |
| `lower_case_table_names=2` | 元の名前が保存・表示されますが、クエリは大文字小文字を区別しません。 | `MyTable` | `MyTable` | クエリで大文字小文字を区別せず、例えば`MyTable`や`mytable`が使用できます。 |

#### JDBC Catalog名の大文字小文字区別ルール

Doris自体は**Table名**の大文字小文字区別ルールの設定のみを許可します。ただし、JDBC Catalogでは**データベース名**と**カラム名**の追加処理が必要です。そのため、`lower_case_table_names`と連携して動作する追加のCatalogプロパティ`lower_case_meta_names`を使用します。

| 設定 | 説明 |
| --- | --- |
| `lower_case_meta_names` | Catalog作成時に`properties`を通じて指定され、そのCatalogのみに適用されます。デフォルト値は`false`です。`true`に設定すると、Dorisはすべてのデータベース、Table、およびカラム名を小文字に変換して保存・表示します。Dorisでのクエリでは小文字名を使用する必要があります。 |
| `lower_case_table_names` | Frontend（FE）の設定項目で、`fe.conf`で設定され、クラスタ全体に適用されます。デフォルト値は`0`です。 |

> 注意：`lower_case_meta_names = true`の場合、`lower_case_table_names`設定は無視され、すべてのデータベース、Table、およびカラム名が小文字に変換されます。

`lower_case_meta_names`（true/false）と`lower_case_table_names`（0/1/2）の組み合わせに基づいて、**保存**と**クエリ**中のデータベース、Table、およびカラム名の動作を以下の表に示します（「元のまま」は外部データソースからの大文字小文字を保持することを意味し、「小文字」は自動的に小文字に変換することを意味し、「任意の大文字小文字」はクエリで任意の大文字小文字を使用できることを意味します）：

| `lower_case_table_names` & `lower_case_meta_names` | データベース表示名 | Table表示名 | カラム表示名 | データベースクエリ名 | Tableクエリ名 | カラムクエリ名 |
| -------------------------------------------------- | --------------------- | ------------------ | ------------------- | ------------------- | ---------------- | ----------------- |
| `0 & false`                                       | 元のまま              | 元のまま           | 元のまま            | 元のまま            | 元のまま         | 任意の大文字小文字          |
| `0 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 小文字        | 任意の大文字小文字          |
| `1 & false`                                       | 元のまま              | 小文字          | 元のまま            | 元のまま            | 任意の大文字小文字         | 任意の大文字小文字          |
| `1 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 任意の大文字小文字         | 任意の大文字小文字          |
| `2 & false`                                       | 元のまま              | 元のまま           | 元のまま            | 元のまま            | 任意の大文字小文字         | 任意の大文字小文字          |
| `2 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 任意の大文字小文字         | 任意の大文字小文字          |

#### 大文字小文字競合チェック

JDBC Catalogを通じて名前マッピングを行う際、名前の競合が発生する可能性があります。例えば、ソースのカラム名が大文字小文字を区別し、`ID`と`id`の2つのカラムが存在する場合です。`lower_case_meta_names = true`が設定されていると、これらの2つのカラムは小文字に変換された後に競合します。Dorisは以下のルールに従って競合チェックを実行します：

* 任意のシナリオで、Dorisは**カラム名**の大文字小文字競合をチェックします（例：`id`と`ID`が同時に存在するかどうか）。

* `lower_case_meta_names = true`の場合、Dorisはデータベース名、Table名、およびカラム名の大文字小文字競合をチェックします（例：`DORIS`と`doris`が同時に存在するかどうか）。

* `lower_case_meta_names = false`かつ`lower_case_table_names`が`1`または`2`に設定されている場合、Dorisは**Table名**の競合をチェックします（例：`orders`と`ORDERS`が同時に存在するかどうか）。

* `lower_case_table_names = 0`の場合、データベースとTable名は大文字小文字を区別し、追加の変換は必要ありません。

#### 大文字小文字競合の解決方法

競合が発生した場合、Dorisはエラーを投げ、以下のアプローチを使用して競合を解決する必要があります。

大文字小文字の違いのみを持つデータベース、Table、またはカラム（例：`DORIS`と`doris`）がDorisによる適切な区別を不可能にする場合、Catalogに`meta_names_mapping`を設定して手動マッピングを指定することで競合を解決できます。

**例**

```json
{
  "databases": [
    {
      "remoteDatabase": "DORIS",
      "mapping": "doris_1"
    },
    {
      "remoteDatabase": "doris",
      "mapping": "doris_2"
    }
  ],
  "tables": [
    {
      "remoteDatabase": "DORIS",
      "remoteTable": "DORIS",
      "mapping": "doris_1"
    },
    {
      "remoteDatabase": "DORIS",
      "remoteTable": "doris",
      "mapping": "doris_2"
    }
  ],
  "columns": [
    {
      "remoteDatabase": "DORIS",
      "remoteTable": "DORIS",
      "remoteColumn": "DORIS",
      "mapping": "doris_1"
    },
    {
      "remoteDatabase": "DORIS",
      "remoteTable": "DORIS",
      "remoteColumn": "doris",
      "mapping": "doris_2"
    }
  ]
}
```
### ドライバーパッケージセキュリティ

Driver packageはユーザーによってDorisクラスタにアップロードされるため、一定のセキュリティリスクが存在します。ユーザーは以下の対策によってセキュリティを向上させることができます：

1. Dorisは`jdbc_drivers_dir`ディレクトリ内のすべてのdriver packageを安全なものと見なし、パスチェックを実行しません。管理者はこのディレクトリ内のファイルを自分で管理し、セキュリティを確保する必要があります。

2. driver packageがローカルパスまたはHTTPパスを使用して指定される場合、Dorisは以下のチェックを実行します：

   * 許可されるdriver packageパスは、FE設定項目`jdbc_driver_secure_path`によって制御されます。この設定には複数のパスを含めることができ、セミコロンで区切られます。この設定が設定されている場合、Dorisは`driver_url`パスプレフィックスが`jdbc_driver_secure_path`に含まれているかどうかをチェックします。含まれていない場合、作成は拒否されます。

     例：

     `jdbc_driver_secure_path = "file:///path/to/jdbc_drivers;http://path/to/jdbc_drivers"`が設定されている場合、`file:///path/to/jdbc_drivers`または`http://path/to/jdbc_drivers`で始まるdriver packageパスのみが許可されます。

   * このパラメータのデフォルトは`*`です。空または`*`に設定されている場合、すべてのJarパッケージパスが許可されます。

3. データディレクトリを作成する際、`checksum`パラメータを使用してdriver packageのchecksumを指定できます。driver packageをロードした後、Dorisはchecksumを検証し、検証が失敗した場合、作成は拒否されます。

### Connection Pool クリーンアップ

Dorisでは、各FEおよびBEノードは、個別のデータソース接続の頻繁な開閉を避けるためにconnection poolを維持します。プール内の各接続は、データソースとの接続を確立し、クエリを実行するために使用できます。タスク完了後、これらの接続は再利用のためにプールに戻され、パフォーマンスを向上させるだけでなく、接続確立のシステムオーバーヘッドを削減し、データソースの接続制限に達することを防ぐのに役立ちます。

connection poolのサイズは、異なるワークロードにより適応するために、実際のニーズに応じて調整できます。通常、keep-aliveメカニズムが有効な場合に少なくとも1つの接続がアクティブな状態を保つため、プール内の最小接続数は1に設定する必要があります。最大接続数は、過度なリソース消費を避けるために適切な値に設定する必要があります。

BE上の未使用のconnection poolキャッシュの蓄積を防ぐため、BEで`jdbc_connection_pool_cache_clear_time_sec`パラメータを設定して、キャッシュクリーンアップ間隔を指定できます。デフォルト値は28,800秒（8時間）で、この時間後にBEはこの時間内に使用されなかったすべてのconnection poolキャッシュを強制的にクリアします。

### Credential アップデート

JDBC Catalogを使用して外部データソースに接続する際、データベースのcredentialを慎重に更新することが重要です。

Dorisはクエリに迅速に応答するため、connection poolを通じてアクティブな接続を維持します。しかし、credentialを変更した後、connection poolは古いcredentialを使用して新しい接続を試行し続け、失敗する可能性があります。システムは一定数のアクティブな接続を維持しようとするため、これらの誤った試行は繰り返され、一部のデータベースシステムでは、頻繁な失敗がアカウントロックアウトにつながる可能性があります。

credentialを変更する必要がある場合は、DorisのJDBC Catalog設定を同期して更新し、Dorisクラスタを再起動してすべてのノードが最新のcredentialを使用するようにし、接続失敗や潜在的なアカウントロックアウトを防ぐことが推奨されます。

発生する可能性のあるアカウントロックアウトには以下が含まれます：

```text
MySQL: account is locked

Oracle: ORA-28000: the account is locked

SQL サーバー: Login is locked out
```
### Connection Pool トラブルシューティング

1. HikariPool Connection Timeout Error: `Connection is not available, request timed out after 5000ms`

   * 考えられる原因

     * 原因 1: ネットワークの問題（例：サーバーに到達できない）

     * 原因 2: 認証の問題（無効なユーザー名やパスワードなど）

     * 原因 3: ネットワーク遅延が大きく、接続作成が5秒のタイムアウトを超過している

     * 原因 4: 同時クエリ数が多すぎて、プールで設定された最大接続数を超えている

   * 解決方法

     * エラー `Connection is not available, request timed out after 5000ms` のみが発生する場合は、原因3と4を確認してください：

       * ネットワーク遅延の増大やリソースの枯渇がないか確認する。

       * プールの最大接続数を増やす：

           ```sql
           ALTER CATALOG catalog_name SET PROPERTIES ('connection_pool_max_size' = '100');
           ```
* 接続タイムアウトを増加させる：

           ```sql
           ALTER CATALOG catalog_name SET PROPERTIES ('connection_pool_max_wait_time' = '10000');
           ```
* `Connection is not available, request timed out after 5000ms`以外に追加のエラーメッセージがある場合は、以下の追加エラーを確認してください：

       * ネットワークの問題（例：サーバーに到達できない）により接続が失敗する場合があります。ネットワーク接続が安定していることを確認してください。

       * 認証の問題（例：無効なユーザー名またはパスワード）によっても接続が失敗する場合があります。設定内のデータベース認証情報を確認し、ユーザー名とパスワードが正しいことを確認してください。

       * 根本原因を特定するために、特定のエラーメッセージに基づいてネットワーク、データベース、または認証に関連する問題を調査してください。
