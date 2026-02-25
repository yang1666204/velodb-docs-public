---
{
  "title": "PostgreSQL JDBC Catalog",
  "description": "Doris JDBC CatalogはJDBCインターフェースを通じてPostgreSQLデータベースへの接続をサポートしています。",
  "language": "ja"
}
---
Doris JDBC Catalogは、標準のJDBCインターフェースを介してPostgreSQLデータベースへの接続をサポートしています。このドキュメントでは、PostgreSQLデータベース接続の設定方法について説明します。

JDBC Catalogの概要については、次を参照してください：[JDBC Catalog Overview](./jdbc-catalog-overview.md)

## 使用上の注意

PostgreSQLデータベースに接続するには、以下が必要です

* PostgreSQL 11.x以上

* PostgreSQLデータベース用のJDBCドライバー。最新版または指定されたバージョンを[Maven Repository](https://mvnrepository.com/artifact/org.postgresql/postgresql)からダウンロードできます。PostgreSQL JDBC Driverのバージョン42.5.x以上の使用を推奨します。

* DorisのFEおよびBE各ノードとPostgreSQLサーバー間のネットワーク接続。デフォルトポートは5432です。

## PostgreSQLへの接続

```sql
CREATE CATALOG postgresql_catalog PROPERTIES (
    'type' = 'jdbc',
    'user' = 'username',
    'password' = 'pwd',
    'jdbc_url' = 'jdbc:postgresql://host:5432/postgres',
    'driver_url' = 'postgresql-42.5.6.jar',
    'driver_class' = 'org.postgresql.Driver'
);
```
`jdbc_url`は、PostgreSQL JDBCドライバに渡される接続情報とパラメータを定義します。サポートされているURLパラメータは[PostgreSQL JDBC Driver Documentation](https://jdbc.postgresql.org/documentation/use/#connecting-to-the-database)で確認できます。

### Connection Security

データソースにグローバルに信頼された証明書がインストールされたTLSを設定している場合、jdbc_urlプロパティで設定されるJDBC接続文字列にパラメータを追加することで、クラスタとデータソース間でTLSを有効にできます。

例えば、PostgreSQL JDBCドライバのバージョン42では、jdbc_url設定プロパティにssl=trueパラメータを追加することでTLSを有効にします：

```sql
"jdbc_url"="jdbc:postgresql://example.net:5432/database?ssl=true"
```
TLS設定オプションの詳細については、[PostgreSQL JDBC Driver Documentation](https://jdbc.postgresql.org/documentation/use/#connecting-to-the-database)を参照してください。

## 階層マッピング

PostgreSQLをマッピングする場合、DorisのDatabaseはPostgreSQLの指定されたデータベース下のSchemaに対応します（`postgres`下の`jdbc_url`パラメータの例のように）。DorisのDatabase下のTableは、PostgreSQLのそのSchema下のTablesに対応します。マッピング関係は以下の通りです：

| Doris    | PostgreSQL |
| -------- | ---------- |
| Catalog  | Database   |
| Database | Schema     |
| Table    | Table      |

## カラム型マッピング

| PostgreSQL Type                         | Doris Type             |                                                                 |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| boolean                                 | boolean                |                                                                 |
| smallint/int2                           | smallint               |                                                                 |
| integer/int4                            | int                    |                                                                 |
| bigint/int8                             | bigint                 |                                                                 |
| decimal/numeric                         | decimal(P, S) / string | 精度のないNumericはstring型にマッピングされ、数値計算にはdecimal型への変換が必要で、書き戻しはサポートされません。    |
| real/float4                             | float                  |                                                                 |
| double                                  | double                 |                                                                 |
| smallserial                             | smallint               |                                                                 |
| serial                                  | int                    |                                                                 |
| bigserial                               | bigint                 |                                                                 |
| char(N)                                 | char(N)                |                                                                 |
| varchar/text                            | string                 |                                                                 |
| timestamp(S)/timestampz(S)              | datetime(S)            |                                                                 |
| date                                    | date                   |                                                                 |
| json/jsonb                              | string                 | より良い読み取りと計算パフォーマンスのバランスのため、DorisはJSON型をSTRING型にマッピングします。                   |
| time                                    | string                 | Dorisはtime型をサポートしていないため、time型はstringにマッピングされます。                          |
| interval                                | string                 |                                                                 |
| point/line/lseg/box/path/polygon/circle | string                 |                                                                 |
| cidr/inet/macaddr                       | string                 |                                                                 |
| uuid                                    | string                 |                                                                 |
| bit                                     | boolean / string       | Dorisはbit型をサポートしていないため、bit型はbit(1)の場合はbooleanに、そうでなければstringにマッピングされます。 |
| bytea             | varbinary     |Catalogの`enable.mapping.varbinary`プロパティによって制御されます（4.0.2以降サポート）。デフォルトは`false`で、`string`にマッピングされます；`true`の場合、`varbinary`型にマッピングされます。|
| array                                   | array                  | array型のマッピング方法については、以下の説明を参照してください。 |
| other                                   | UNSUPPORTED            |                                                                 |

- Array型

    PostgreSQLでは、array型は以下のように定義できます：

    ```
    col1 text[]
    col2 in4[][]
    ```
ただし、配列の次元はPostgreSQLのメタデータから直接取得することはできません。例えば、`text[]`は1次元配列または2次元配列の可能性があります。配列の次元は、データが書き込まれた後にのみ決定できます。

    Dorisでは配列の次元を明示的に宣言する必要があります。そのため、PostgreSQLの対応する配列カラムにデータが含まれている場合のみDorisは正しくマッピングできます。そうでなければ、配列カラムは`UNSUPPORTED`としてマッピングされます。

## 付録

### タイムゾーンの問題

Dorisはタイムゾーン付きのtimestamp型をサポートしていないため、PostgreSQLからtimestampz型を読み取る際、Dorisはそれをdatetime型にマッピングし、読み取り時にローカルタイムゾーンの時刻に変換します。

そして、JDBC型Catalogからデータを読み取る際、BEのJava部分はJVMタイムゾーンを使用するためです。JVMタイムゾーンはデフォルトでBEデプロイメントマシンのタイムゾーンに設定されており、これがJDBCでデータを読み取る際のタイムゾーン変換に影響します。

タイムゾーンの整合性を確保するため、`be.conf`の`JAVA_OPTS`でJVMタイムゾーンをDorisセッションの`time_zone`と一致するように設定することを推奨します。
