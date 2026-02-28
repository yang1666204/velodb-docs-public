---
{
  "title": "Arrow Flight SQL プロトコルによる接続",
  "description": "Doris 2.1以降、Arrow Flight SQLプロトコルに基づく高速データリンクが実装されています。",
  "language": "ja"
}
---
Doris 2.1以降、Arrow Flight SQLプロトコルに基づく高速データリンクが実装されており、SQLクエリによって複数の言語でDorisから大量のデータを迅速に取得できるようになりました。Arrow Flight SQLは汎用的なJDBCドライバーも提供しており、Arrow Flight SQLプロトコルに準拠する他のデータベースとのシームレスな連携をサポートしています。一部のシナリオでは、MySQL ClientやJDBC/ODBCドライバーを使用したデータ転送ソリューションと比較して、パフォーマンスが最大100倍向上する場合があります。

## 実装原理

Dorisでは、クエリ結果は列形式でBlockとして構成されます。2.1以前のバージョンでは、MySQL ClientやJDBC/ODBCドライバーを介してターゲットクライアントにデータを転送できましたが、これには行ベースのBytesを列形式にデシリアライズする処理が必要でした。Arrow Flight SQLに基づく高速データ転送リンクを構築することで、ターゲットクライアントもArrow列形式をサポートしている場合、転送プロセス全体でシリアライゼーションとデシリアライゼーション操作を回避し、それらに伴う時間とパフォーマンスのオーバーヘッドを完全に排除します。

![Arrow_Flight_SQL](/images/db-connect/arrow-flight-sql/Arrow-Flight-SQL.png)

Apache Arrowをインストールするには、公式ドキュメント[Apache Arrow](https://arrow.apache.org/install/)で詳細なインストール手順を確認できます。DorisがArrow Flightプロトコルを実装する方法の詳細については、[Doris support Arrow Flight SQL protocol](https://github.com/apache/doris/issues/25514)を参照してください。

## Python使用方法

PythonのADBC Driverを使用してDorisに接続し、極めて高速なデータ読み取りを実現します。以下の手順では、Python（バージョン >= 3.9）ADBC Driverを使用して、DDL、DML、Session変数の設定、Show文など、一連の一般的なデータベース構文操作を実行します。

### ライブラリのインストール

ライブラリはPyPIで公開されており、以下の方法で簡単にインストールできます：

```
pip install adbc_driver_manager
pip install adbc_driver_flightsql
```
インストールされたライブラリを使用するために、コード内で以下のモジュール/ライブラリをインポートしてください：

```Python
import adbc_driver_manager
import adbc_driver_flightsql.dbapi as flight_sql

>>> print(adbc_driver_manager.__version__)
1.1.0
>>> print(adbc_driver_flightsql.__version__)
1.1.0
```
### Dorisに接続

Doris Arrow Flight SQLサービスと対話するクライアントを作成します。Doris FEのHost、Arrow Flight Port、ログインユーザー名とパスワードを提供し、以下の設定を実行する必要があります。
Doris FEとBEの設定パラメータを変更します：

- fe/conf/fe.conf内のarrow_flight_sql_portを8070など利用可能なポートに変更します。
- be/conf/be.conf内のarrow_flight_sql_portを8050など利用可能なポートに変更します。

`注意: fe.confとbe.confで設定するarrow_flight_sql_portのポート番号は異なります`

設定を変更してクラスタを再起動した後、fe/log/fe.logファイルで`Arrow Flight SQL service is started`を検索するとFEのArrow Flight Serverが正常に起動したことを示し、be/log/be.INFOファイルで`Arrow Flight Service bind to host`を検索するとBEのArrow Flight Serverが正常に起動したことを示します。

DorisインスタンスのFEとBEのArrow Flight SQLサービスがそれぞれポート8070と8050で実行され、Dorisのユーザー名/パスワードが"user"/"pass"であると仮定すると、接続プロセスは以下のとおりです：

```Python
conn = flight_sql.connect(uri="grpc://{FE_HOST}:{fe.conf:arrow_flight_sql_port}", db_kwargs={
            adbc_driver_manager.DatabaseOptions.USERNAME.value: "user",
            adbc_driver_manager.DatabaseOptions.PASSWORD.value: "pass",
        })
cursor = conn.cursor()
```
接続が完了した後、返されたCursorを使用してSQLを通じてDorisと対話し、Tableの作成、メタデータの取得、データのインポート、クエリなどの操作を実行できます。

### Tableの作成とメタデータの取得

cursor.execute()関数にQueryを渡して、Table作成とメタデータ取得操作を実行します：

```Python
cursor.execute("DROP DATABASE IF EXISTS arrow_flight_sql FORCE;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("create database arrow_flight_sql;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("show databases;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("use arrow_flight_sql;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("""CREATE TABLE arrow_flight_sql_test
    (
         k0 INT,
         k1 DOUBLE,
         K2 varchar(32) NULL DEFAULT "" COMMENT "",
         k3 DECIMAL(27,9) DEFAULT "0",
         k4 BIGINT NULL DEFAULT '10',
         k5 DATE,
    )
    DISTRIBUTED BY HASH(k5) BUCKETS 5
    PROPERTIES("replication_num" = "1");""")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("show create table arrow_flight_sql_test;")
print(cursor.fetchallarrow().to_pandas())
```
StatusResultが0を返す場合、Queryが正常に実行されたことを意味します（この設計の理由はJDBCとの互換性を保つためです）。

```
  StatusResult
0            0

  StatusResult
0            0

                   Database
0         __internal_schema
1          arrow_flight_sql
..                      ...
507             udf_auth_db

[508 rows x 1 columns]

  StatusResult
0            0

  StatusResult
0            0
                   Table                                       Create Table
0  arrow_flight_sql_test  CREATE TABLE `arrow_flight_sql_test` (\n  `k0`...
```
### データのインポート

作成したTableに少量のテストデータをインポートするために、INSERT INTO を実行します：

```Python
cursor.execute("""INSERT INTO arrow_flight_sql_test VALUES
        ('0', 0.1, "ID", 0.0001, 9999999999, '2023-10-21'),
        ('1', 0.20, "ID_1", 1.00000001, 0, '2023-10-21'),
        ('2', 3.4, "ID_1", 3.1, 123456, '2023-10-22'),
        ('3', 4, "ID", 4, 4, '2023-10-22'),
        ('4', 122345.54321, "ID", 122345.54321, 5, '2023-10-22');""")
print(cursor.fetchallarrow().to_pandas())
```
以下により、インポートが成功したことが確認できます：

```
  StatusResult
0            0
```
Dorisに大量のデータをインポートする必要がある場合は、pydorisを使用してStream Loadを実行できます。

### クエリの実行

次に、上記でインポートしたTableをクエリします。これには集約、ソート、Set Session Variableなどの操作が含まれます。

```Python
cursor.execute("select * from arrow_flight_sql_test order by k0;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("set exec_mem_limit=2000;")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("show variables like \"%exec_mem_limit%\";")
print(cursor.fetchallarrow().to_pandas())

cursor.execute("select k5, sum(k1), count(1), avg(k3) from arrow_flight_sql_test group by k5;")
print(cursor.fetch_df())
```
結果は以下の通りです：

```
   k0            k1    K2                k3          k4          k5
0   0       0.10000    ID       0.000100000  9999999999  2023-10-21
1   1       0.20000  ID_1       1.000000010           0  2023-10-21
2   2       3.40000  ID_1       3.100000000      123456  2023-10-22
3   3       4.00000    ID       4.000000000           4  2023-10-22
4   4  122345.54321    ID  122345.543210000           5  2023-10-22

[5 rows x 6 columns]

  StatusResult
0            0

    Variable_name Value Default_Value Changed
0  exec_mem_limit  2000    2147483648       1

           k5  Nullable(Float64)_1  Int64_2 Nullable(Decimal(38, 9))_3
0  2023-10-22         122352.94321        3            40784.214403333
1  2023-10-21              0.30000        2                0.500050005

[2 rows x 5 columns]
```
**注意:** クエリ結果を取得するには、`cursor.fetchallarrow()`を使用してarrow形式を返すか、`cursor.fetch_df()`を使用してpandas dataframeを直接返す必要があります。これによりデータが列形式で保持されます。`cursor.fetchall()`は使用しないでください。使用すると列形式のデータが行形式に変換され、基本的にmysql-clientを使用するのと同じになります。実際、クライアント側での追加の列から行への変換操作により、mysql-clientよりも遅くなる可能性があります。

### 完全なコード

```Python
# Doris Arrow Flight SQL Test

# step 1, library is released on PyPI and can be easily installed.
# pip install adbc_driver_manager
# pip install adbc_driver_flightsql
import adbc_driver_manager
import adbc_driver_flightsql.dbapi as flight_sql

# step 2, create a client that interacts with the Doris Arrow Flight SQL service.
# Modify arrow_flight_sql_port in fe/conf/fe.conf to an available port, such as 8070.
# Modify arrow_flight_sql_port in be/conf/be.conf to an available port, such as 8050.
conn = flight_sql.connect(uri="grpc://{FE_HOST}:{fe.conf:arrow_flight_sql_port}", db_kwargs={
            adbc_driver_manager.DatabaseOptions.USERNAME.value: "root",
            adbc_driver_manager.DatabaseOptions.PASSWORD.value: "",
        })
cursor = conn.cursor()

# interacting with Doris via SQL using Cursor
def execute(sql):
    print("\n### execute query: ###\n " + sql)
    cursor.execute(sql)
    print("### result: ###")
    print(cursor.fetchallarrow().to_pandas())

# step3, execute DDL statements, create database/table, show stmt.
execute("DROP DATABASE IF EXISTS arrow_flight_sql FORCE;")
execute("show databases;")
execute("create database arrow_flight_sql;")
execute("show databases;")
execute("use arrow_flight_sql;")
execute("""CREATE TABLE arrow_flight_sql_test
    (
         k0 INT,
         k1 DOUBLE,
         K2 varchar(32) NULL DEFAULT "" COMMENT "",
         k3 DECIMAL(27,9) DEFAULT "0",
         k4 BIGINT NULL DEFAULT '10',
         k5 DATE,
    )
    DISTRIBUTED BY HASH(k5) BUCKETS 5
    PROPERTIES("replication_num" = "1");""")
execute("show create table arrow_flight_sql_test;")


# step4, insert into
execute("""INSERT INTO arrow_flight_sql_test VALUES
        ('0', 0.1, "ID", 0.0001, 9999999999, '2023-10-21'),
        ('1', 0.20, "ID_1", 1.00000001, 0, '2023-10-21'),
        ('2', 3.4, "ID_1", 3.1, 123456, '2023-10-22'),
        ('3', 4, "ID", 4, 4, '2023-10-22'),
        ('4', 122345.54321, "ID", 122345.54321, 5, '2023-10-22');""")


# step5, execute queries, aggregation, sort, set session variable
execute("select * from arrow_flight_sql_test order by k0;")
execute("set exec_mem_limit=2000;")
execute("show variables like \"%exec_mem_limit%\";")
execute("select k5, sum(k1), count(1), avg(k3) from arrow_flight_sql_test group by k5;")

# step6, close cursor 
cursor.close()
```
## Jdbc Connector with Arrow Flight SQL

Arrow Flight SQLプロトコルのオープンソースJDBCドライバーは、標準JDBC APIと互換性があり、ほとんどのBIツールがJDBCを通じてDorisにアクセスするために使用でき、Apache Arrowデータの高速転送をサポートします。使用方法は、MySQLプロトコルのJDBCドライバーを通じてDorisに接続する場合と同様です。リンクURL内のjdbc:mysqlプロトコルをjdbc:arrow-flight-sqlプロトコルに置き換えるだけです。クエリ結果は引き続きJDBC ResultSetデータ構造で返されます。

POM dependency:

```Java
<properties>
    <arrow.version>17.0.0</arrow.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.apache.arrow</groupId>
        <artifactId>flight-sql-jdbc-core</artifactId>
        <version>${arrow.version}</version>
    </dependency>
</dependencies>
```
**注意:** Java 9以降を使用する場合、Javaコマンドに`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加してJDK内部構造を公開する必要があります。そうしないと、`module java.base does not "opens java.nio" to unnamed module`や`module java.base does not "opens java.nio" to org.apache.arrow.memory.core`、`java.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`などのエラーが発生する可能性があります。

```shell
# Directly on the command line
$ java --add-opens=java.base/java.nio=ALL-UNNAMED -jar ...
# Indirectly via environment variables
$ env _JAVA_OPTIONS="--add-opens=java.base/java.nio=ALL-UNNAMED" java -jar ...
```
IntelliJ IDEAでデバッグする場合、`Run/Debug Configurations`の`Build and run`に`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加する必要があります。以下の画像を参照してください：

![arrow-flight-sql-IntelliJ](/images/db-connect/arrow-flight-sql/arrow-flight-sql-IntelliJ.png)

接続コードの例は以下の通りです：

```Java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

Class.forName("org.apache.arrow.driver.jdbc.ArrowFlightJdbcDriver");
String DB_URL = "jdbc:arrow-flight-sql://{FE_HOST}:{fe.conf:arrow_flight_sql_port}?useServerPrepStmts=false"
        + "&cachePrepStmts=true&useSSL=false&useEncryption=false";
String USER = "root";
String PASS = "";

Connection conn = DriverManager.getConnection(DB_URL, USER, PASS);
Statement stmt = conn.createStatement();
ResultSet resultSet = stmt.executeQuery("select * from information_schema.tables;");
while (resultSet.next()) {
    System.out.println(resultSet.toString());
}

resultSet.close();
stmt.close();
conn.close();
```
## Java使用方法

JDBCの使用に加えて、Pythonと同様に、JAVAでもDriverを作成してDorisを読み取り、Arrow形式でデータを返すことができます。以下は、AdbcDriverとJdbcDriverを使用してDoris Arrow Flight Serverに接続する方法です。

POM依存関係：

```Java
<properties>
    <adbc.version>0.15.0</adbc.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.arrow.adbc</groupId>
        <artifactId>adbc-driver-jdbc</artifactId>
        <version>${adbc.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.arrow.adbc</groupId>
        <artifactId>adbc-core</artifactId>
        <version>${adbc.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.arrow.adbc</groupId>
        <artifactId>adbc-driver-manager</artifactId>
        <version>${adbc.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.arrow.adbc</groupId>
        <artifactId>adbc-sql</artifactId>
        <version>${adbc.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.arrow.adbc</groupId>
        <artifactId>adbc-driver-flight-sql</artifactId>
        <version>${adbc.version}</version>
    </dependency>
</dependencies>
```
### ADBC Driver

接続コードの例は以下の通りです：

```Java
// 1. new driver
final BufferAllocator allocator = new RootAllocator();
FlightSqlDriver driver = new FlightSqlDriver(allocator);
Map<String, Object> parameters = new HashMap<>();
AdbcDriver.PARAM_URI.set(parameters, Location.forGrpcInsecure("{FE_HOST}", {fe.conf:arrow_flight_sql_port}).getUri().toString());
AdbcDriver.PARAM_USERNAME.set(parameters, "root");
AdbcDriver.PARAM_PASSWORD.set(parameters, "");
AdbcDatabase adbcDatabase = driver.open(parameters);

// 2. new connection
AdbcConnection connection = adbcDatabase.connect();
AdbcStatement stmt = connection.createStatement();

// 3. execute query
stmt.setSqlQuery("select * from information_schema.tables;");
QueryResult queryResult = stmt.executeQuery();
ArrowReader reader = queryResult.getReader();

// 4. load result
List<String> result = new ArrayList<>();
while (reader.loadNextBatch()) {
    VectorSchemaRoot root = reader.getVectorSchemaRoot();
    String tsvString = root.contentToTSVString();
    result.add(tsvString);
}
System.out.printf("batchs %d\n", result.size());

// 5. close
reader.close();
queryResult.close();
stmt.close();
connection.close();
```
### JDBC Driver

Java 9以降を使用する場合、java コマンドに --add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED を追加することで、一部のJDK内部要素を公開する必要があります：

```shell
# Directly on the command line
$ java --add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED -jar ...
# Indirectly via environment variables
$ env _JAVA_OPTIONS="--add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED" java -jar ...
```
そうでない場合、`module java.base does not "opens java.nio" to unnamed module`や`module java.base does not "opens java.nio" to org.apache.arrow.memory.core`、`ava.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`などのエラーが表示される場合があります。

IntelliJ IDEAでデバッグする場合は、`Run/Debug Configurations`の`Build and run`に`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加する必要があります。下の画像を参照してください：

![IntelliJ IDEA](https://github.com/user-attachments/assets/7439ee6d-9013-40bf-89af-0365925d3fdb)

接続コードの例は以下の通りです：

```Java
final Map<String, Object> parameters = new HashMap<>();
AdbcDriver.PARAM_URI.set(
        parameters,"jdbc:arrow-flight-sql://{FE_HOST}:{fe.conf:arrow_flight_sql_port}?useServerPrepStmts=false&cachePrepStmts=true&useSSL=false&useEncryption=false");
AdbcDriver.PARAM_USERNAME.set(parameters, "root");
AdbcDriver.PARAM_PASSWORD.set(parameters, "");
try (
        BufferAllocator allocator = new RootAllocator();
        AdbcDatabase db = new JdbcDriver(allocator).open(parameters);
        AdbcConnection connection = db.connect();
        AdbcStatement stmt = connection.createStatement()
) {
    stmt.setSqlQuery("select * from information_schema.tables;");
    AdbcStatement.QueryResult queryResult = stmt.executeQuery();
    ArrowReader reader = queryResult.getReader();
    List<String> result = new ArrayList<>();
    while (reader.loadNextBatch()) {
        VectorSchemaRoot root = reader.getVectorSchemaRoot();
        String tsvString = root.contentToTSVString();
        result.add(tsvString);
    }
    long etime = System.currentTimeMillis();
    System.out.printf("batchs %d\n", result.size());

    reader.close();
    queryResult.close();
    stmt.close();
}  catch (Exception e) {
    e.printStackTrace();
}
```
### Jdbc と Java 接続方法の選択

[JDBC/Java Arrow Flight SQL サンプル](https://github.com/apache/doris/blob/master/samples/arrow-flight-sql/java/README.md) は、Arrow FLight SQL を使用した JDBC/Java デモです。これを使用して Arrow Flight サーバー にクエリを送信するための様々な接続方法をテストし、Arrow FLight SQL の使用方法を理解し、パフォーマンスをテストできます。期待される実行結果については、[Add Arrow Flight Sql demo for Java](https://github.com/apache/doris/pull/45306) を参照してください。

従来の `jdbc:mysql` 接続方法と比較した、Jdbc と Java の Arrow Flight SQL 接続方法のパフォーマンステストは、[GitHub Issue](https://github.com/apache/doris/issues/25514) のセクション 6.2 で確認できます。以下は、テスト結論に基づく使用方法の提案です。

1. 上記の3つの Java Arrow Flight SQL 接続方法について、後続のデータ分析が行ベースのデータ形式に基づく場合は、jdbc:arrow-flight-sql を使用してください。これは JDBC ResultSet 形式でデータを返します。後続のデータ分析が Arrow 形式やその他の列ベースのデータ形式に基づく場合は、Flight AdbcDriver または Flight JdbcDriver を使用して Arrow 形式で直接データを返すことで、行列変換を回避し、Arrow の特性を利用してデータ解析を高速化できます。

2. JDBC ResultSet または Arrow 形式でのデータ解析において、費やされる時間はデータ読み取りに費やされる時間よりも長くなります。Arrow Flight SQL のパフォーマンスが期待通りでなく、`jdbc:mysql://` と比較して改善が限定的な場合は、データ解析に時間がかかりすぎているかどうかを分析することをお勧めします。

3. すべての接続方法において、JDK 17 は JDK 1.8 よりもデータを高速に読み取ります。

4. 大量のデータを読み取る場合、Arrow Flight SQL は `jdbc:mysql://` よりも少ないメモリを使用するため、メモリ不足に悩まされている場合は、Arrow Flight SQL を試すこともできます。

5. 上記の3つの接続方法に加えて、ネイティブの FlightClient を使用して Arrow Flight サーバー に接続することもできます。これにより、複数のエンドポイントをより柔軟に並列で読み取ることができます。Flight AdbcDriver も FlightClient をベースに作成されたリンクであり、FlightClient を直接使用するよりも簡単です。

## 他のビッグデータコンポーネントとの連携

### Spark & Flink

Arrow Flight は現在、Spark と Flink をサポートする公式計画がありません（[GitHub Issue](https://github.com/apache/arrow-adbc/issues/1490)）。バージョン 24.0.0 以降、Doris 独自の [Spark Connector](https://github.com/apache/doris-spark-connector) と [Flink Connector](https://github.com/apache/doris-flink-connector) は Arrow Flight SQL を介して Doris にアクセスすることをサポートしており、これにより読み取りパフォーマンスが数倍改善されることが期待されます。

コミュニティは以前、オープンソースの [Spark-Flight-Connector](https://github.com/qwshen/spark-flight-connector) を参照し、Spark で FlightClient を使用して Doris に接続してテストしました。Arrow と Doris Block 間のデータ形式変換がより高速であることが分かり、CSV 形式と Doris Block 間の変換速度の10倍であり、Map や Array などの複雑な型に対してより良いサポートを提供します。これは、Arrow データ形式が高い圧縮率を持ち、転送時のネットワークオーバーヘッドが低いためです。しかし、Doris Arrow Flight はまだマルチノード並列読み取りを実装しておらず、クエリ結果を BE ノードに集約して返します。データのシンプルなバッチエクスポートの場合、Tablet レベルの並列読み取りをサポートする Doris Spark Connector ほど高速ではない可能性があります。Spark で Arrow Flight SQL を使用して Doris に接続したい場合は、オープンソース化された [Spark-Flight-Connector](https://github.com/qwshen/spark-flight-connector) と [Dremio-Flight-Connector](https://github.com/dremio-hub/dremio-flight-connector) を参考にして独自に実装できます。

### BI ツールのサポート

Doris v2.1.8 以降、DBeaver などの BI ツールが `arrow-flight-sql` プロトコルを使用して Doris に接続することがサポートされています。DBeaver が `arrow-flight-sql` Driver を使用して Doris に接続する方法については、以下を参照してください：[how-to-use-jdbc-driver-with-dbeaver-client](https://www.dremio.com/blog/jdbc-driver-for-arrow-flight-sql/#h-how-to-use-jdbc-driver-with-dbeaver-client)、[client-applications/clients/dbeaver/](https://docs.dremio.com/current/sonar/client-applications/clients/dbeaver/?_gl=1*1epgwh0*_gcl_au*MjUyNjE1ODM0LjE3MzQwMDExNDg)。

## 拡張アプリケーション

### 複数の BE が並列で結果を返す

Doris は、デフォルトですべての BE ノード上のクエリ結果を1つの BE ノードに集約します。Mysql/JDBC クエリでは、FE はこの集約されたデータノードからクエリ結果を要求します。Arrow Flight SQL クエリでは、FE はこのノードの IP/Port を Endpoint にラップして ADBC クライアント に返します。ADBC クライアント はこの Endpoint に対応する BE ノードに要求してデータを取得します。

クエリが単純な Select で Doris からデータを取得するもので、Join、Sort、Window ファンクション などのデータ Shuffle 動作を持つオペレーターがない場合、クエリは Tablet 粒度に応じて分割できます。現在、Doris Spark/Flink Connector はこの方法を使用して並列データ読み取りを実装しており、これは2つのステップに分かれています：
1. `explain sql` を実行し、FE が返すクエリプランの ScanOperator には Scan のすべての Tablet ID Lists が含まれます。
2. 上記の Tablet ID List に基づいて元の SQL を複数の SQL に分割します。各 SQL は Tablet の一部のみを読み取ります。使用法は `SELECT * FROM t1 TABLET(10001,10002) limit 1000;` に似ています。分割後の複数の SQL は並列で実行できます。[Support select table sample](https://github.com/apache/doris/pull/10170) を参照してください。

クエリの最外層が集約の場合、SQL は `select k1, sum(k2) from xxx group by k1` に似ています。Doris v3.0.4 以降、`set enable_parallel_result_sink=true;` を実行して、クエリの各 BE ノードが独立してクエリ結果を返すことを許可します。FE が返す Endpoint リストを受信した後、ADBC クライアント は複数の BE ノードから並列で結果を取得します。ただし、集約結果が非常に小さい場合、複数の BE を返すことで RPC の負荷が増加することに注意してください。具体的な実装については、[support parallel result sink](https://github.com/apache/doris/pull/36053) を参照してください。理論的には、最外層のクエリがソートされている場合を除いて、他のクエリは各 BE ノードが並列で結果を返すことをサポートできますが、現在この利便性の必要性はなく、さらなる実装は行われていません。

### 複数の BE がクラスター外部からアクセス可能な同じ IP を共有

Doris クラスターがあり、その FE ノードはクラスター外部からアクセス可能で、すべての BE ノードはクラスター内部からのみアクセス可能な場合があります。これは Mysql クライアント と JDBC を使用して Doris に接続してクエリを実行する場合は問題ありませんが、クエリ結果は Doris FE ノードによって返されます。しかし、Arrow Flight SQL を使用して Doris に接続する場合は機能しません。なぜなら、ADBC クライアント は Doris BE ノードに接続してクエリ結果を取得する必要がありますが、Doris BE ノードはクラスター外部からのアクセスが許可されていないからです。

本番環境では、Doris BE ノードをクラスター外部に公開することは不便な場合がよくあります。しかし、すべての Doris BE ノードにリバースプロキシ（Nginx など）を追加できます。クラスター外部のクライアントが Nginx に接続すると、Doris BE ノードにランダムにルーティングされます。デフォルトでは、Arrow Flight SQL クエリ結果は Doris BE ノード上にランダムに保存されます。Nginx によってランダムにルーティングされた Doris BE ノードと異なる場合、Doris BE ノード内でのデータ転送が必要です。

Doris v2.1.8 以降、すべての Doris BE ノードの `be.conf` で `public_host` と `arrow_flight_sql_proxy_port` を、複数の Doris BE ノードによって共有され、クラスター外部からアクセス可能な IP とポートに設定できます。クエリ結果は正しく転送され、ADBC クライアント に返されます。

```conf
public_host={nginx ip}
arrow_flight_sql_proxy_port={nginx port}
```
## FAQ

1. Q: エラー `connection error: desc = "transport: Error while dialing: dial tcp <ip:arrow_flight_port>: i/o timeout"`。

A: エラーメッセージの `<ip:arrow_flight_port>` がDoris FEノードのIPとarrow-flight-portの場合、

まず、Doris FEノードのarrow-flight-serverが正常に起動しているかを確認してください。fe/log/fe.logファイルで `Arrow Flight SQL service is started` を検索し、これが見つかればFEのArrow Flight Serverが正常に起動していることを示します。

Doris FEノードのarrow-flight-serverが正常に起動している場合、Clientが配置されているマシンがエラーメッセージの `<ip:arrow_flight_port>` のIPに `ping` できるかを確認してください。`ping` できない場合は、Doris FEノードに外部からアクセス可能なIPを開放し、クラスターを再デプロイする必要があります。

A: エラーメッセージの `<ip:arrow_flight_port>` がDoris BEノードのIPとarrow-flight-portの場合。

まず、Doris BEノードのarrow-flight-serverが正常に起動しているかを確認してください。be/log/be.INFOファイルで `Arrow Flight Service bind to host` を検索し、これが見つかればBEのArrow Flight Serverが正常に起動していることを示します。

Doris BEノードのarrow-flight-serverが正常に起動している場合、クライアントマシンがエラーメッセージで報告された `<ip:arrow_flight_port>` のIPに `ping` できるかを確認してください。`ping` できない場合で、Doris BEノードが外部からアクセスできないイントラネットにあることが分かっている場合は、以下の2つの方法を使用します：

- 各Doris BEノードに外部からアクセス可能なIPを開放することを検討してください。Doris v2.1.8以降では、このDoris BEノードの `be.conf` でこのIPに `public_host` を設定できます。同様に、すべてのDoris BEノードの `public_host` をクライアントがアクセスできる対応するBEノードのIPに設定してください。

- 上記のセクション [クラスターが外部からアクセス可能な同じIPを複数のBEが共有する場合] を参照して、すべてのDoris BEノードにリバースプロキシの層を追加してください。

Doris BEが完全にイントラネットにあるかどうか明確でない場合は、クライアントマシンとDoris BEノードが配置されているマシンの他のIPとの接続性を確認してください。Doris BEノードが配置されているマシンで `ifconfig` を実行し、現在のマシンのすべてのIPを取得してください。そのうちの1つのIPは `<ip:arrow_flight_port>` のIPと同じで、`show backends` で表示されるDoris BEノードのIPと同じはずです。`ifconfig` で返される他のIPを順番に `ping` してください。Doris BEノードにClientがアクセスできるIPがある場合は、上記を参照してこのIPを `public_host` として設定してください。Doris BEノードのすべてのIPがClientからアクセスできない場合、そのDoris BEノードは完全にイントラネット内にあります。

2. Q: JDBCやJAVAを使用してArrow Flight SQLに接続する際に、エラーメッセージが表示される：`module java.base does not "opens java.nio" to unnamed module` または `module java.base does not "opens java.nio" to org.apache.arrow.memory.core` または `java.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`

A: まず、fe/conf/fe.confの `JAVA_OPTS_FOR_JDK_17` に `--add-opens=java.base/java.nio=ALL-UNNAMED` が含まれているかを確認してください。含まれていない場合は追加してください。次に、上記の [Arrow Flight SQLを使用したJDBCコネクタ] の注意事項を参照し、Javaコマンドで `--add-opens=java.base/java.nio=ALL-UNNAMED` を追加してください。IntelliJ IDEAでデバッグする場合は、`Run/Debug Configurations` の `Build and run` に `--add-opens=java.base/java.nio=ALL-UNNAMED` を追加する必要があります。

3. Q: ARM環境でエラーが報告される `get flight info statement failed, arrow flight schema timeout, TimeoutException: Waited 5000 milliseconds for io.grpc.stub.クライアント`。

A: Linuxカーネルバージョンが <= 4.19.90の場合、4.19.279以上にアップグレードするか、より低いバージョンのLinuxカーネル環境でDoris BEを再コンパイルする必要があります。具体的なコンパイル方法については、ドキュメント <docs/dev/install/source-install/compilation-arm> を参照してください。

原因：これは古いバージョンのLinuxカーネルとArrowの間に互換性の問題があるためです。`cpp: arrow::RecordBatch::MakeEmpty()` がArrow Record Batchを構築する際にスタックし、Doris BEのArrow Flight ServerがDoris FEのArrow Flight ServerのRPCリクエストに5000ms以内に応答できなくなり、FEがクライアントにrpc timeout failedを返すことになります。SparkとFlinkがDorisを読み取る際も、クエリ結果をArrow Record Batchに変換して返すため、同様の問題が存在します。

kylinv10 SP2とSP3のLinuxカーネルバージョンは最大でも4.19.90-24.4.v2101.ky10.aarch64です。カーネルバージョンをそれ以上アップグレードできません。Doris BEをkylinv10で再コンパイルするしかありません。新しいバージョンのldb_toolchainでDoris BEをコンパイルしても問題が残る場合は、より低いバージョンのldb_toolchain v0.17でコンパイルしてみてください。ARM環境が外部ネットワークに接続できない場合、Huawei CloudがARM + kylinv10を提供し、Alibaba Cloudがx86 + kylinv10を提供しています。

4. Q: Prepared statementがパラメータを渡してエラーを報告する。

A: 現在、`jdbc:arrow-flight-sql` とJava ADBC/JDBCDriverはprepared statementのパラメータ渡しをサポートしていません。例えば、`select * from xxx where id=?` は `parameter ordinal 1 out of range` エラーを報告します。これはArrow Flight SQLのバグです（[GitHub Issue](https://github.com/apache/arrow/issues/40118)）。

5. Q: 一部のシナリオでパフォーマンスを向上させるため、`jdbc:arrow-flight-sql` が毎回読み取るバッチサイズを変更する方法。

A: `org.apache.arrow.adbc.driver.jdbc.JdbcArrowReader` ファイルの `makeJdbcConfig` メソッドで `setTargetBatchSize` を変更し、デフォルトは1024です。変更後のファイルを同じパス名でローカルディレクトリに保存し、元のファイルを上書きして有効にします。

6. Q: ADBC v0.10、JDBCおよびJava ADBC/JDBCDriverは並列読み取りをサポートしていません。

A: `stmt.executePartitioned()` メソッドが実装されていません。ネイティブのFlightClientを使用して複数のエンドポイントの並列読み取りを実装するしかありません。方法は `sqlClient=new FlightSqlClient, execute=sqlClient.execute(sql), endpoints=execute.getEndpoints(), for(FlightEndpoint endpoint: endpoints)` です。さらに、ADBC V0.10のデフォルトのAdbcStatementは実際にはJdbcStatementです。executeQuery後、行形式のJDBC ResultSetがArrow列形式に変換されます。Java ADBCがADBC 1.0.0で完全に機能することが期待されています [GitHub Issue](https://github.com/apache/arrow-adbc/issues/1490)。

7. Q: URLでデータベース名を指定する。

A: Arrow v15.0の時点で、Arrow JDBC ConnectorはURLでのデータベース名指定をサポートしていません。例えば、`jdbc:arrow-flight-sql://{FE_HOST}:{fe.conf:arrow_flight_sql_port}/test?useServerPrepStmts=false` で `test` データベースへの接続を指定することは無効で、手動でSQL `use database` を実行するしかありません。Arrow v18.0はURLでのデータベース名指定をサポートしていますが、実際のテストではまだバグがあります。

8. Q: Python ADBC が `Warning: Cannot disable autocommit; conn will not be DB-API 2.0 compliant` を出力する。

A: Pythonを使用する際はこのWarningを無視してください。これはPython ADBC ClientのためのPresent状。

9. Q: Pythonでエラー `grpc: received message larger than max (20748753 vs. 16777216)` が報告される。

A: [Python: grpc: received message larger than max (20748753 vs. 16777216) #2078](https://github.com/apache/arrow-adbc/issues/2078) を参照し、Database Optionに `adbc_driver_flightsql.DatabaseOptions.WITH_MAX_MSG_SIZE.value` を追加してください。

10. Q: エラー `invalid bearer token` が報告される。

A: `SET PROPERTY FOR 'root' 'max_user_connections' = '10000';` を実行して現在のユーザーの現在の最大接続数を10000に変更し、`fe.conf` にqe_max_connection=30000とarrow_flight_token_cache_size=8000を追加してFEを再起動してください。

ADBC ClientとArrow Flight Server間の接続は本質的に長時間接続であり、Auth Token、Connection、SessionがServerでキャッシュされる必要があります。接続が作成された後、単一クエリの終了時に即座に切断されません。Clientがclose()リクエストを送信してクリーンアップする必要がありますが、実際にはClientがしばしばcloseリクエストを送信しないため、Auth Token、Connection、SessionがArrow Flight Serverで長時間保存されます。デフォルトでは3日後にタイムアウトして切断されるか、接続数が `arrow_flight_token_cache_size` の制限を超えた後にLRUに従って除去されます。

Doris v2.1.8の時点で、Arrow Flight接続とMysql/JDBC接続は同じ接続制限を使用します。これには、すべてのFEユーザーの総接続数 `qe_max_connection` と `UserProperty` の単一ユーザーの接続数 `max_user_connections` が含まれます。しかし、デフォルトの `qe_max_connection` と `max_user_connections` はそれぞれ1024と100です。Arrow Flight SQLはしばしばJDBCシナリオを置き換えるために使用されますが、JDBC接続はクエリ終了後に即座に解放されます。そのため、Arrow Flight SQLを使用する場合、Dorisのデフォルト接続制限は小さすぎて、接続数が `arrow_flight_token_cache_size` の制限を超え、まだ使用中の接続が除去されることがよくあります。

11. Q: JDBCやJAVAを使用してArrow Flight SQLに接続してDatatime型を読み取ると、フォーマットされた時間ではなくタイムスタンプが返される。

A: JDBCやJAVAを使用してArrow Flight SQLに接続してDatatime型を読み取る場合、自分でタイムスタンプを変換する必要があります。[Add java parsing datetime type in arrow flight sql sample #48578](https://github.com/apache/doris/pull/48578) を参照してください。Python Arrow Flight SQLを使用してDatatime型を読み取ると `2025-03-03 17:23:28Z` の結果が返されますが、JDBCやJAVAでは `1740993808` が返されます。

12. Q: JDBCやJava JDBC ClientでArrow Flight SQLに接続してArray入れ子型を読み取るとエラー `構成 does not provide a mapping for array column 2` が返される。

A: [`sample/arrow-flight-sql`](https://github.com/apache/doris/blob/master/samples/arrow-flight-sql/java/src/main/java/doris/arrowflight/demo/FlightAdbcDriver.java) を参照してJAVA ADBC Clientを使用してください。

Python ADBC Client、JAVA ADBC Client、Java JDBC DriverManagerはすべてArray入れ子型の読み取りが問題ありません。JDBCやJava JDBC ClientでArrow Flight SQLに接続する場合のみ問題があります。実際、Arrow Flight JDBCの互換性は保証されていません。これはArrowによって正式に開発されたものではなく、サードパーティのデータベース会社Dremioによるものです。以前にも他の互換性問題が発見されているため、まずJAVA ADBC Clientの使用を推奨します。

## 2.1 リリースノート

> Doris Arrow Flightはバージョンv2.1.4以前では完璧ではないため、使用前にアップグレードすることを推奨します。

### v2.1.9

1. DorisデータのArrowへのシリアライゼーション問題を修正。
[Fix UT DataTypeSerDeArrowTest of Array/Map/Struct/Bitmap/HLL/Decimal256 types](https://github.com/apache/doris/pull/48944)
- `Decimal256` 型の読み取り失敗；
- `DatetimeV2` 型読み取りの微細なエラー；
- `DateV2` 型読み取りの不正な結果；
- `IPV4/IPV6` 型読み取り時に結果がNULLの場合のエラー；

2. Doris Arrow Flight SQLクエリが失敗して空の結果を返し、実際のエラー情報を返さない問題を修正。
[Fix query result is empty and not return query error message](https://github.com/apache/doris/pull/45023)

### v2.1.8

1. DBeaverなどのBIツールが `arrow-flight-sql` プロトコルを使用してDorisに接続し、メタデータツリーの正確な表示をサポート。
[Support arrow-flight-sql protocol getStreamCatalogs, getStreamSchemas, getStreamTables #46217](https://github.com/apache/doris/pull/46217)。

2. 複数のBEがクラスター外部からアクセス可能な同じIPを共有している場合、クエリ結果を正しく転送してADBC Clientに返すことができる。
[Arrow flight server supports data forwarding when BE uses public vip](https://github.com/apache/doris/pull/43281)

3. 複数エンドポイントの並列読み取りをサポート。
[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286)

4. クエリエラー `FE not found arrow flight schema` を修正。
[Fix FE not found arrow flight schema](https://github.com/apache/doris/pull/43960)

5. NULLを許可する列を読み取る際のエラー `BooleanBuilder::AppendValues` を修正。
[Fix Doris NULL column conversion to arrow batch](https://github.com/apache/doris/pull/43929)

6. `show processlist` で重複するConnection IDが表示される問題を修正。
[Fix arrow-flight-sql ConnectContext to use a unified ID #46284](https://github.com/apache/doris/pull/46284)

7. `Datetime` と `DatetimeV2` 型を読み取る際にタイムゾーンが失われ、実際のデータより8時間少ないdatetimeになる問題を修正。
[Fix time zone issues and accuracy issues #38215](https://github.com/apache/doris/pull/38215)

### v2.1.7

1. 頻繁なログ出力 `Connection wait_timeout` を修正。
[Fix kill timeout FlightSqlConnection and FlightSqlConnectProcessor close](https://github.com/apache/doris/pull/41770)

2. Arrow Flight Bearer TokenのCache期限切れによる除去を修正。
[Fix Arrow Flight bearer token cache evict after expired](https://github.com/apache/doris/pull/41754)

### v2.1.6

1. クエリエラー `0.0.0.0:xxx, connection refused` を修正。
[Fix return result from FE Arrow Flight server error 0.0.0.0:xxx, connection refused](https://github.com/apache/doris/pull/40002)

2. クエリエラー `Reach limit of connections` を修正。
[Fix exceed user property max connection cause Reach limit of connections #39127](https://github.com/apache/doris/pull/39127)

以前のバージョンでは、`SET PROPERTY FOR 'root' 'max_user_connections' = '1024';` を実行して現在のユーザーの現在の最大接続数を1024に変更することで、一時的に回避できます。

以前のバージョンはArrow Flight接続数を `qe_max_connection/2` 未満に制限するだけで、`qe_max_connection` はすべてのfeユーザーの総接続数でデフォルトは1024ですが、単一ユーザーのArrow Flight接続数を `UserProperty` の `max_user_connections` 未満に制限せず、デフォルトは100です。そのため、Arrow Flight接続数が現在のユーザーの接続数上限を超えると、エラー `Reach limit of connections` が報告されるため、現在のユーザーの `max_user_connections` を増やす必要があります。

問題の詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D18b1/2-1-4-ban-ben-python-shi-yong-arrow-flight-sql-lian-jie-bu-hui-duan-kai-lian-jie-shu-zhan-man-da-dao-100/E1ic1?commentId=10070000000005324)

3. Conf `arrow_flight_result_sink_buffer_size_rows` を追加して、単回で返されるクエリ結果のArrowBatchサイズの変更をサポート、デフォルトは4096 * 8。
[Add config arrow_flight_result_sink_buffer_size_rows](https://github.com/apache/doris/pull/38221)

### v2.1.5

1. Arrow Flight SQLクエリ結果が空になる問題を修正。
[Fix arrow flight result sink #36827](https://github.com/apache/doris/pull/36827)

Doris v2.1.4では大量のデータを読み取る際にエラーが報告される可能性があります。詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D1Ia1/arrow-flight-sql-shi-yong-python-de-adbc-driver-lian-jie-doris-zhi-xing-cha-xun-sql-du-qu-bu-dao-shu-ju)

## 3.0 リリースノート

### v3.0.5

1. DorisデータのArrowへのシリアライゼーション問題を修正。
[Fix UT DataTypeSerDeArrowTest of Array/Map/Struct/Bitmap/HLL/Decimal256 types](https://github.com/apache/doris/pull/48944)
- `Decimal256` 型の読み取り失敗；
- `DatetimeV2` 型読み取りの微細なエラー；
- `DateV2` 型読み取りの不正な結果；
- `IPV4/IPV6` 型読み取り時に結果がNULLの場合のエラー；

### v3.0.4

1. DBeaverなどのBIツールが `arrow-flight-sql` プロトコルを使用してDorisに接続し、メタデータツリーの正確な表示をサポート。
[Support arrow-flight-sql protocol getStreamCatalogs, getStreamSchemas, getStreamTables #46217](https://github.com/apache/doris/pull/46217)。

2. 複数エンドポイントの並列読み取りをサポート。
[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286)

3. NULLを許可する列を読み取る際のエラー `BooleanBuilder::AppendValues` を修正。
[Fix Doris NULL column conversion to arrow batch](https://github.com/apache/doris/pull/43929)

4. `show processlist` で重複するConnection IDが表示される問題を修正。
[Fix arrow-flight-sql ConnectContext to use a unified ID #46284](https://github.com/apache/doris/pull/46284)

5. Doris Arrow Flight SQLクエリが失敗して空の結果を返し、実際のエラー情報を返さない問題を修正。
[Fix query result is empty and not return query error message](https://github.com/apache/doris/pull/45023)

### v3.0.3

1. クエリエラー `0.0.0.0:xxx, connection refused` を修正。
[Fix return result from FE Arrow Flight server error 0.0.0.0:xxx, connection refused](https://github.com/apache/doris/pull/40002)

2. クエリエラー `Reach limit of connections` を修正。
[Fix exceed user property max connection cause Reach limit of connections #39127](https://github.com/apache/doris/pull/39127)

以前のバージョンでは、`SET PROPERTY FOR 'root' 'max_user_connections' = '1024';` を実行して現在のユーザーの現在の最大接続数を1024に変更することで、一時的に回避できます。

以前のバージョンはArrow Flight接続数を `qe_max_connection/2` 未満に制限するだけで、`qe_max_connection` はすべてのfeユーザーの総接続数でデフォルトは1024ですが、単一ユーザーのArrow Flight接続数を `UserProperty` の `max_user_connections` 未満に制限せず、デフォルトは100です。そのため、Arrow Flight接続数が現在のユーザーの接続数上限を超えると、エラー `Reach limit of connections` が報告されるため、現在のユーザーの `max_user_connections` を増やす必要があります。

問題の詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D18b1/2-1-4-ban-ben-python-shi-yong-arrow-flight-sql-lian-jie-bu-hui-duan-kai-lian-jie-shu-zhan-man-da-dao-100/E1ic1?commentId=10070000000005324)

3. 頻繁なログ出力 `Connection wait_timeout` を修正。
[Fix kill timeout FlightSqlConnection and FlightSqlConnectProcessor close](https://github.com/apache/doris/pull/41770)

4. Arrow Flight Bearer TokenのCache期限切れ後の除去を修正。
[Fix Arrow Flight bearer token cache evict after expired](https://github.com/apache/doris/pull/41754)

5. 複数のBEがクラスター外部からアクセス可能な同じIPアドレスを共有している場合、クエリ結果を正しく転送してADBC Clientに返すことができる。
[Arrow flight server supports data forwarding when BE uses public vip](https://github.com/apache/doris/pull/43281)

6. クエリエラー `FE not found arrow flight schema` を修正。
[Fix FE not found arrow flight schema](https://github.com/apache/doris/pull/43960)

7. `Datetime` と `DatetimeV2` 型を読み取る際にタイムゾーンが失われ、実際のデータより8時間少ないdatetimeになる問題を修正。
[Fix time zone issues and accuracy issues #38215](https://github.com/apache/doris/pull/38215)

### v3.0.2

1. Conf `arrow_flight_result_sink_buffer_size_rows` を追加して、単一トランザクションで返されるクエリ結果のArrowBatchサイズの変更をサポート、デフォルトは4096 * 8。
[Add config arrow_flight_result_sink_buffer_size_rows](https://github.com/apache/doris/pull/38221)

### v3.0.1

1. クエリ結果の欠失、クエリ結果行数 = 実際の行数 / BE数
[Fix get Schema failed when enable_parallel_result_sink is false #37779](https://github.com/apache/doris/pull/37779)

Doris 3.0.0では、クエリの最外層が集約の場合、SQLが `select k1, sum(k2) from xxx group by k1` のような場合に（クエリ結果行数 = 実際の行数 / BE数）に遭遇する可能性があります。これは [support parallel result sink](https://github.com/apache/doris/pull/36053) によって導入された問題です。[Fix get Schema failed when enable_parallel_result_sink is false](https://github.com/apache/doris/pull/37779) は一時的な修正で、[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286) が複数エンドポイントの並列読み取りをサポートした後に正式に修正される予定です。
