---
{
  "title": "JDBC Catalog",
  "description": "JDBCカタログは、標準のJDBCインターフェースを通じて、JDBCプロトコルと互換性のあるデータベースへの接続をサポートします。",
  "language": "ja"
}
---
JDBC Catalogは、標準的なJDBCインターフェースを通じて、JDBCプロトコルと互換性のあるデータベースへの接続をサポートしています。

この文書では、JDBC Catalogの一般的な設定と使用方法を紹介します。異なるJDBCソースについては、それぞれのドキュメントを参照してください。

:::info Note
DorisのJDBC Catalog機能はJavaレイヤーに依存してデータの読み取りと処理を行うため、全体的なパフォーマンスはJDKバージョンの影響を受ける可能性があります。古いバージョンのJDK（JDK 8など）の一部の内部ライブラリは効率が低く、より高いリソース消費につながる可能性があります。より高いパフォーマンスが必要な場合は、デフォルトでJDK 17でコンパイルされ、より優れた全体的なパフォーマンスを提供するDoris 3.0の使用を推奨します。
:::

## 適用シナリオ

JDBC Catalogは、データソースから少量のデータをDorisにインポートしたり、JDBCデータソースの小さなテーブルに対して結合クエリを実行したりするなど、データ統合にのみ適しています。JDBC Catalogはデータソース上のクエリを高速化したり、大量のデータに一度にアクセスしたりすることはできません。

## サポートされているデータベース

Doris JDBC Catalogは以下のデータベースへの接続をサポートしています：

| サポートされているデータソース |
| ---------------------------------- |
| [ MySQL](./jdbc-mysql-catalog.md)      |
| [ PostgreSQL](./jdbc-mysql-catalog.md) |
| [ Oracle](./jdbc-mysql-catalog.md)     |
| [ SQL Server](./jdbc-mysql-catalog.md) |
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

      | パラメータ名   | 説明                              | 例                       |
      | ---------------- | ---------------------------------------- | ----------------------------- |
      | `user`           | データソースのユーザー名                     |                               |
      | `password`       | データソースのパスワード                     |                               |
      | `jdbc_url`       | データソース接続URL               | `jdbc:mysql://host:3306`      |
      | `driver_url`     | JDBCドライバファイルへのパス。ドライバパッケージのセキュリティについては、付録を参照してください。 | 3つの方法をサポート、下記参照。 |
      | `driver_class`   | JDBCドライバのクラス名            |                               |

      `driver_url`は以下の3つの指定方法をサポートします：
    
      1. ファイル名。例：`mysql-connector-j-8.3.0.jar`。JarファイルはFEおよびBEのデプロイディレクトリ下の`jdbc_drivers/`ディレクトリに事前に配置する必要があります。システムはこのディレクトリを自動的に検索します。場所は`fe.conf`および`be.conf`の`jdbc_drivers_dir`設定で変更することも可能です。
      
      2. ローカル絶対パス。例：`file:///path/to/mysql-connector-j-8.3.0.jar`。Jarファイルは全てのFE/BEノードの指定されたパスに事前に配置する必要があります。
      
      3. HTTP URL。例：`http://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar`。システムはこのHTTPアドレスからドライバファイルをダウンロードします。認証なしのHTTPサービスのみサポートします。

  * オプションプロパティ

      | パラメータ名                | デフォルト値 | 説明                                                                                                                                   |
      | ----------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
      | `lower_case_meta_names`       | false         | 外部データソースからデータベース、テーブル、カラム名を小文字で同期するかどうか                                        |
      | `meta_names_mapping`          |               | 外部データソースに`MY_TABLE`と`my_table`など大文字小文字のみが異なる名前がある場合、Catalogをクエリする際にDorisは曖昧さによりエラーを報告します。競合を解決するために`meta_names_mapping`パラメータを設定する必要があります。 |
      | `only_specified_database`     | false         | `jdbc_url`で指定されたデータベースのみを同期するかどうか（このDatabaseはDorisのDatabaseレベルにマッピングされます）                       |
      | `connection_pool_min_size`    | 1             | 接続プールの最小接続数を定義し、プールの初期化とキープアライブが有効な場合に少なくともこの数のアクティブな接続を保証するために使用されます。 |
      | `connection_pool_max_size`    | 30            | 接続プールの最大接続数を定義します。各Catalogに対応する各FEまたはBEノードは最大でこの数の接続を保持できます。 |
      | `connection_pool_max_wait_time`| 5000         | プールで接続が利用できない場合にクライアントが接続を待機する最大待機時間をミリ秒で定義します。                         |
      | `connection_pool_max_life_time`| 1800000      | プール内の接続の最大アクティブ期間（ミリ秒）を設定します。この時間を超える接続はリサイクルされます。また、この値の半分がプールの最小退避アイドル時間として使用され、この時間に達した接続が退避対象となります。 |
      | `connection_pool_keep_alive`  | false         | BEノードでのみ有効で、最小退避アイドル時間に達したが最大ライフタイムに達していない接続をアクティブに保つかどうかを決定します。不要なリソース使用を減らすためにデフォルトで無効になっています。 |
        
* `[CommonProperties]`

  CommonPropertiesセクションは共通プロパティの設定に使用されます。**共通プロパティ**については[Catalog概要](../catalog-overview.md)セクションを参照してください。

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
### Query Optimization

#### Predicate Pushdown

JDBC Catalogがデータソースにアクセスする際、基本的にBEノードを選択し、JDBC Clientを使用して生成されたSQLクエリをソースに送信し、データを取得します。そのため、パフォーマンスは生成されたSQLがソース側でどれだけ効率的に実行されるかにのみ依存します。Dorisは述語条件をプッシュダウンし、生成されたSQLに組み込むことを試行します。生成されたSQLを確認するには`EXPLAIN SQL`文を使用できます。

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
#### Function Pushdown

述語条件について、Dorisと外部データソースでは、セマンティクスや動作が一致しない場合があります。そのため、DorisはJDBC外部テーブルクエリにおける述語プッシュダウンを以下のパラメータ変数によって制限・制御しています：

> 注意：現在、DorisはMySQL、Clickhouse、およびOracleデータソースの述語プッシュダウンのみをサポートしています。将来的にはより多くのデータソースがサポートされる予定です。

- `enable_jdbc_oracle_null_predicate_push_down`

    セッション変数。デフォルトは`false`です。つまり、述語条件に`NULL`値が含まれる場合、述語はOracleデータソースにプッシュダウンされません。これは、Oracleバージョン21より前では、Oracleが`NULL`を演算子としてサポートしていないためです。

    このパラメータは2.1.7および3.0.3以降でサポートされています。

- `enable_jdbc_cast_predicate_push_down`

    セッション変数。デフォルトは`false`です。つまり、述語条件に明示的または暗示的なCASTがある場合、述語はJDBCデータソースにプッシュダウンされません。CASTの動作は異なるデータベース間で一致しないため、正確性を保証するために、デフォルトではCASTはプッシュダウンされません。ただし、ユーザーはCASTの動作が一致するかどうかを手動で検証できます。一致する場合は、このパラメータを`true`に設定して、より多くの述語をプッシュダウンし、パフォーマンスを向上させることができます。

    このパラメータは2.1.7および3.0.3以降でサポートされています。

- 関数プッシュダウンのブラックリストとホワイトリスト

    同じシグネチャを持つ関数でも、Dorisと外部データソースでセマンティクスが一致しない場合があります。Dorisでは関数プッシュダウン用に事前定義されたブラックリストとホワイトリストがあります：

    | データソース   | ブラックリスト | ホワイトリスト | 説明     |
    | ---------- | ----- | --- | --------- |
    | MySQL      | - `DATE_TRUNC`<br>- `MONEY_FORMAT`<br>- `NEGTIVE`  |  | MySQLでは、FE設定項目`jdbc_mysql_unsupported_pushdown_functions`を使用して追加のブラックリスト項目を設定することも可能です。例：`jdbc_mysql_unsupported_pushdown_functions==func1,func2` |
    | Clickhouse | | - `FROM_UNIXTIME`<br>- `UNIX_TIMESTAMP` |       |
    | Oracle     |  | - `NVL`<br>- `IFNULL`   |          |

- 関数リライトルール

    Dorisと外部データソースには、動作は一致しているが名前が異なる関数がいくつかあります。Dorisでは、関数プッシュダウン時にこれらの関数をリライトすることをサポートしています。現在、以下のリライトルールが組み込まれています：

    | データソース   | Doris関数 | ターゲット関数 |
    | ---------- | ----- | --- |
    | MySQL | nvl | ifnull |
    | MySQL | to_date | date |
    | Clickhouse | from_unixtime | FROM_UNIXTIME |
    | Clickhouse | unix_timestamp | toUnixTimestamp |
    | Oracle | ifnull | nvl |

- カスタム関数プッシュダウンとリライトルール

    3.0.7以降のバージョンでは、Dorisはより柔軟な関数プッシュダウンとリライトルールをサポートしています。ユーザーは、Catalogプロパティで特定のCatalogに対する関数プッシュダウンとリライトルールを設定できます：

    ```sql
    create catalog jdbc properties (
    ...
    'function_rules' = '{"pushdown" : {"supported": ["to_date"], "unsupported" : ["abs"]}, "rewrite" : {"to_date" : "date2"}}'
    )
    ```
`function_rules`を通して、以下のルールを指定できます：

- `pushdown`

    関数のプッシュダウンルールを指定します。`supported`配列と`unsupported`配列は、それぞれプッシュダウン可能な関数名とプッシュダウン不可能な関数名を指定します。関数が両方の配列に存在する場合、`supported`が優先されます。

    Dorisは最初にシステムの事前定義されたブラックリストとホワイトリストを適用し、その後ユーザー指定のブラックリストとホワイトリストを適用します。

- `rewrite`

    関数のリライトルールを定義します。上記の例のように、関数名`to_date`は`date2`としてリライトされ、プッシュダウンされます。

    注意：プッシュダウンが許可された関数のみがリライトされます。

#### 行数制限

クエリに`LIMIT`キーワードが含まれている場合、Dorisはデータ転送量を削減するために`LIMIT`句をデータソースにプッシュダウンします。生成されたSQLに`LIMIT`句が含まれているかどうかを確認するには、`EXPLAIN`文を使用できます。

## 書き込み操作

DorisはJDBCプロトコルを介して対応するデータソースへのデータの書き戻しをサポートしています。

```sql
INSERT INTO mysql_table SELECT * FROM internal.doris_db.doris_tbl;
```
## Statement Passthrough

### 適用シナリオ

DorisはStatement Passthroughを通じて、JDBCデータソースで対応するDDL、DML、およびクエリステートメントを直接実行することをサポートしています。この機能は以下のシナリオで適用可能です：

* 複雑なクエリパフォーマンスの向上

  デフォルトでは、Dorisクエリオプティマイザは元のSQLを解析し、特定のルールに基づいてデータソースに送信するSQLを生成します。この生成されたSQLは通常、シンプルな単一テーブルクエリであり、集約やJOINクエリなどの演算子を含むことはできません。例えば、以下のクエリを考えてみます：

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
この場合、集約操作はDoris内で実行されます。そのため、一部のシナリオでは、ネットワーク経由でソースから大量のデータを読み取る必要があり、クエリ効率が低下する可能性があります。statement passthroughを使用すると、元のSQLを直接データソースに渡すことができ、データソース自体の計算能力を活用してSQLを実行し、クエリパフォーマンスを向上させることができます。

* 統合管理

  クエリSQL以外にも、statement passthrough機能はDDLおよびDMLステートメントも渡すことができます。これにより、ユーザーはDorisを通じてソースデータに対して直接データベースやテーブル操作を実行できます。たとえば、テーブルの作成、削除、またはテーブル構造の変更などが可能です。

### Passthrough SQL

```sql
SELECT * FROM
QUERY(
  'catalog' = 'mysql_catalog', 
  'query' = 'SELECT smallint_u, sum(int_u) FROM db.all_types WHERE smallint_u > 10 GROUP BY smallint_u;'
);
```
`QUERY`テーブル関数は2つのパラメータを受け取ります：

* `catalog`: カタログの名前。カタログの名前と一致する必要があります。
* `query`: 実行するクエリステートメント。対応するデータソースの構文を直接使用して記述します。

### Passthrough DDLとDML

```sql
CALL EXECUTE_STMT("jdbc_catalog", "insert into db1.tbl1 values(1,2), (3, 4)");

CALL EXECUTE_STMT("jdbc_catalog", "delete from db1.tbl1 where k1 = 2");

CALL EXECUTE_STMT("jdbc_catalog", "create table dbl1.tbl2 (k1 int)");
```
`EXECUTE_STMT()` 関数は2つのパラメータを取ります：

* 第1パラメータ：カタログの名前。現在、JDBC型のカタログのみサポートされています。
* 第2パラメータ：実行するSQL文。現在、DDL文とDML文のみサポートされており、対応するデータソースの構文を使用して記述する必要があります。

### 使用制限

`CALL EXECUTE_STMT()` コマンドを使用する際、Dorisはユーザーが記述したSQL文をカタログに関連付けられたJDBCデータソースに直接送信して実行します。そのため、この操作には以下の制限があります：

* SQL文は対応するデータソースの構文に従う必要があります。Dorisは構文や意味のチェックを行いません。

* SQL文で参照されるテーブル名は、`db.tbl` のような完全修飾名を使用することが推奨されます。データベースが指定されていない場合、JDBCカタログのJDBC URLにあるデータベース名が使用されます。

* SQL文は、JDBCデータソース外部のデータベースやテーブルを参照することはできず、Dorisのデータベースやテーブルも参照できません。ただし、Doris JDBCカタログと同期されていないJDBCデータソース内のテーブルは参照できます。

* DML文を実行する際、挿入、更新、削除された行数を取得することはできません。コマンドの成功または失敗のみを判断できます。

* カタログに対する `LOAD` 権限を持つユーザーのみが `CALL EXECUTE_STMT()` コマンドを実行できます。

* カタログに対する `SELECT` 権限を持つユーザーのみが `query()` テーブル関数を実行できます。

* カタログ作成時に指定されたJDBCユーザーは、対応する文を実行するために必要な権限をソース上で持っている必要があります。

* `query()` テーブル関数によって読み取られた結果のデータ型は、クエリされたカタログ型でサポートされているデータ型と一致します。

## 付録

### 大文字小文字区別設定

デフォルトでは、Dorisのデータベース名とテーブル名は大文字小文字を区別しますが、カラム名は区別しません。この動作は設定パラメータで変更できます。また、一部のJDBCデータソースでは、データベース名、テーブル名、カラム名の大文字小文字区別ルールがDorisと異なる場合があります。この相違により、JDBC Catalog経由での名前マッピング時に命名競合が発生する可能性があります。以下のセクションでは、このような問題の解決方法について説明します。

#### 表示名とクエリ名

Dorisでは、オブジェクト名（ここではテーブル名を例とします）を **表示名** と **クエリ名** に分けることができます。例えば、テーブル名の場合、**表示名** は `SHOW TABLES` の結果に表示される名前を指し、**クエリ名** は `SELECT` 文で使用できる名前を指します。

例えば、テーブルの実際の名前が `MyTable` である場合、このテーブルの **表示名** と **クエリ名** は、Frontend（FE）パラメータ `lower_case_table_names` の設定によって異なる場合があります：

| 設定 | 説明 | 実際の名前 | 表示名 | クエリ名 |
| --- | --- | --- | --- | --- |
| `lower_case_table_names=0` | デフォルト設定。元の名前が保存・表示され、クエリは大文字小文字を区別します。 | `MyTable` | `MyTable` | クエリで大文字小文字を区別し、`MyTable` を使用する必要があります |
| `lower_case_table_names=1` | 名前は小文字で保存・表示され、クエリは大文字小文字を区別しません。 | `MyTable` | `mytable` | クエリで大文字小文字を区別せず、例えば `MyTable` や `mytable` を使用できます。 |
| `lower_case_table_names=2` | 元の名前が保存・表示されますが、クエリは大文字小文字を区別しません。 | `MyTable` | `MyTable` | クエリで大文字小文字を区別せず、例えば `MyTable` や `mytable` を使用できます。 |

#### JDBC Catalog名の大文字小文字区別ルール

Doris自体は **テーブル名** の大文字小文字区別ルールの設定のみを許可します。しかし、JDBC Catalogでは **データベース名** と **カラム名** の追加処理が必要です。そのため、`lower_case_table_names` と連携するために、追加のCatalogプロパティ `lower_case_meta_names` を使用します。

| 設定 | 説明 |
| --- | --- |
| `lower_case_meta_names` | Catalog作成時に `properties` で指定し、そのCatalogにのみ適用されます。デフォルト値は `false` です。`true` に設定すると、Dorisはすべてのデータベース名、テーブル名、カラム名を小文字に変換して保存・表示します。Dorisでクエリを行う際は小文字の名前を使用する必要があります。 |
| `lower_case_table_names` | Frontend（FE）設定項目で、`fe.conf` で設定し、クラスター全体に適用されます。デフォルト値は `0` です。 |

> 注意：`lower_case_meta_names = true` の場合、`lower_case_table_names` 設定は無視され、すべてのデータベース名、テーブル名、カラム名が小文字に変換されます。

`lower_case_meta_names`（true/false）と `lower_case_table_names`（0/1/2）の組み合わせに基づいて、**保存** と **クエリ** 時のデータベース名、テーブル名、カラム名の動作を以下の表に示します（「元のまま」は外部データソースの大文字小文字を保持することを意味し、「小文字」は自動的に小文字に変換することを意味し、「任意の大文字小文字」はクエリで任意の大文字小文字を使用できることを意味します）：

| `lower_case_table_names` & `lower_case_meta_names` | データベース表示名 | テーブル表示名 | カラム表示名 | データベースクエリ名 | テーブルクエリ名 | カラムクエリ名 |
| -------------------------------------------------- | --------------------- | ------------------ | ------------------- | ------------------- | ---------------- | ----------------- |
| `0 & false`                                       | 元のまま              | 元のまま           | 元のまま            | 元のまま            | 元のまま         | 任意の大文字小文字          |
| `0 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 小文字        | 任意の大文字小文字          |
| `1 & false`                                       | 元のまま              | 小文字          | 元のまま            | 元のまま            | 任意の大文字小文字         | 任意の大文字小文字          |
| `1 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 任意の大文字小文字         | 任意の大文字小文字          |
| `2 & false`                                       | 元のまま              | 元のまま           | 元のまま            | 元のまま            | 任意の大文字小文字         | 任意の大文字小文字          |
| `2 & true`                                        | 小文字             | 小文字          | 小文字           | 小文字           | 任意の大文字小文字         | 任意の大文字小文字          |

#### 大文字小文字競合チェック

JDBC Catalogを通じて名前マッピングを実行する際、命名競合が発生する可能性があります。例えば、ソースのカラム名が大文字小文字を区別し、`ID` と `id` という2つのカラムが存在する場合です。`lower_case_meta_names = true` が設定されると、これらの2つのカラムは小文字に変換された後に競合します。Dorisは以下のルールに従って競合チェックを実行します：

* すべてのシナリオで、Dorisは **カラム名** の大文字小文字競合をチェックします（例：`id` と `ID` が同時に存在するかどうか）。

* `lower_case_meta_names = true` の場合、Dorisはデータベース名、テーブル名、カラム名の大文字小文字競合をチェックします（例：`DORIS` と `doris` が同時に存在するかどうか）。

* `lower_case_meta_names = false` かつ `lower_case_table_names` が `1` または `2` に設定されている場合、Dorisは **テーブル名** の競合をチェックします（例：`orders` と `ORDERS` が同時に存在するかどうか）。

* `lower_case_table_names = 0` の場合、データベース名とテーブル名は大文字小文字を区別し、追加の変換は必要ありません。

#### 大文字小文字競合の解決方法

競合が発生した場合、Dorisはエラーをスローし、以下のアプローチを使用して競合を解決する必要があります。

大文字小文字のみが異なるデータベース、テーブル、またはカラム（例：`DORIS` と `doris`）がDorisで適切に区別できない場合、Catalogに `meta_names_mapping` を設定して手動マッピングを指定することで競合を解決できます。

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
### Driver Packageセキュリティ

Driver packageはユーザーによってDorisクラスターにアップロードされるため、一定のセキュリティリスクをもたらします。ユーザーは以下の対策を通じてセキュリティを強化できます：

1. Dorisは`jdbc_drivers_dir`ディレクトリ内のすべてのdriver packageを安全なものとみなし、それらに対してパスチェックを実行しません。管理者は、セキュリティを確保するため、このディレクトリ内のファイルを自ら管理する必要があります。

2. driver packageがローカルパスまたはHTTPパスを使用して指定された場合、Dorisは以下のチェックを実行します：

   * 許可されるdriver packageパスはFE設定項目`jdbc_driver_secure_path`によって制御されます。この設定は複数のパスを含むことができ、セミコロンで区切られます。この設定が行われると、Dorisは`driver_url`パスプレフィックスが`jdbc_driver_secure_path`に含まれているかどうかをチェックします。含まれていない場合、作成が拒否されます。

     例：

     `jdbc_driver_secure_path = "file:///path/to/jdbc_drivers;http://path/to/jdbc_drivers"`が設定されている場合、`file:///path/to/jdbc_drivers`または`http://path/to/jdbc_drivers`で始まるdriver packageパスのみが許可されます。

   * このパラメータはデフォルトで`*`です。空または`*`に設定されている場合、すべてのJar packageパスが許可されます。

3. データディレクトリを作成する際、`checksum`パラメータを使用してdriver packageのチェックサムを指定できます。driver packageをロードした後、Dorisはチェックサムを検証し、検証が失敗した場合、作成が拒否されます。

### Connection Pool清理

Dorisでは、個々のデータソース接続の頻繁な開閉を避けるため、各FEおよびBEノードがconnection poolを維持します。プール内の各接続はデータソースとの接続を確立し、クエリを実行するために使用できます。タスクが完了した後、これらの接続は再利用のためプールに戻されます。これによりパフォーマンスが向上するだけでなく、接続確立のシステムオーバーヘッドが削減され、データソースの接続制限に達することを防ぐのに役立ちます。

Connection poolのサイズは実際のニーズに応じて調整でき、異なるワークロードにより適応できます。通常、keep-aliveメカニズムが有効な場合に少なくとも1つの接続がアクティブのままになるよう、プール内の最小接続数は1に設定する必要があります。最大接続数は、過度なリソース消費を避けるため合理的な値に設定する必要があります。

BE上で未使用のconnection poolキャッシュの蓄積を防ぐため、BE上で`jdbc_connection_pool_cache_clear_time_sec`パラメータを設定し、キャッシュクリーンアップ間隔を指定できます。デフォルト値は28,800秒（8時間）で、この時間後、BEはこの時間内に使用されなかったすべてのconnection poolキャッシュを強制的にクリアします。

### 認証情報更新

JDBC Catalogを使用して外部データソースに接続する際、データベース認証情報を慎重に更新することが重要です。

Dorisはクエリに迅速に応答するため、connection poolを通じてアクティブな接続を維持します。しかし、認証情報を変更した後、connection poolは古い認証情報を使用して新しい接続を試行し続け、失敗する可能性があります。システムは一定数のアクティブな接続を維持しようとするため、これらの誤った試行は繰り返され、一部のデータベースシステムでは、頻繁な失敗がアカウントロックアウトにつながる可能性があります。

認証情報を変更する必要がある場合は、Doris JDBC Catalog設定を同期して更新し、すべてのノードが最新の認証情報を使用するようDorisクラスターを再起動して、接続失敗と潜在的なアカウントロックアウトを防ぐことを推奨します。

可能性のあるアカウントロックアウトには以下が含まれます：

```text
MySQL: account is locked

Oracle: ORA-28000: the account is locked

SQL Server: Login is locked out
```
### Connection Pool トラブルシューティング

1. HikariPool接続タイムアウトエラー: `Connection is not available, request timed out after 5000ms`

   * 考えられる原因

     * 原因1: ネットワーク問題（例：サーバーに到達不可能）

     * 原因2: 認証問題（無効なユーザー名またはパスワードなど）

     * 原因3: 高いネットワークレイテンシーにより接続作成が5秒のタイムアウトを超過

     * 原因4: 並行クエリが多すぎてプールに設定された最大接続数を超過

   * 解決方法

     * エラー `Connection is not available, request timed out after 5000ms` のみが発生する場合は、原因3と4を確認してください：

       * 高いネットワークレイテンシーまたはリソース枯渇を確認してください。

       * プールの最大接続数を増加させてください：

           ```sql
           ALTER CATALOG catalog_name SET PROPERTIES ('connection_pool_max_size' = '100');
           ```
* 接続タイムアウトを増やす:

           ```sql
           ALTER CATALOG catalog_name SET PROPERTIES ('connection_pool_max_wait_time' = '10000');
           ```
* `Connection is not available, request timed out after 5000ms` 以外に追加のエラーメッセージがある場合は、これらの追加エラーを確認してください：

       * ネットワークの問題（例：サーバーに到達できない）が接続の失敗を引き起こす可能性があります。ネットワーク接続が安定していることを確認してください。

       * 認証の問題（例：無効なユーザー名またはパスワード）も接続の失敗を引き起こす可能性があります。設定内のデータベース認証情報を確認し、ユーザー名とパスワードが正しいことを確認してください。

       * 根本原因を特定するために、具体的なエラーメッセージに基づいてネットワーク、データベース、または認証に関連する問題を調査してください。
