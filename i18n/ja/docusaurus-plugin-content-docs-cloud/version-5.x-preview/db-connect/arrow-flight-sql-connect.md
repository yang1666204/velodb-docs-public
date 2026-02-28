---
{
  "title": "Arrow Flight SQL Protocolによる接続",
  "description": "Doris 2.1以降、Arrow Flight SQLプロトコルに基づく高速データリンクが実装されています。",
  "language": "ja"
}
---
Doris 2.1以降、Arrow Flight SQLプロトコルに基づく高速データリンクが実装され、複数の言語でDorisから大容量データをSQLクエリで迅速に取得できるようになりました。Arrow Flight SQLは汎用的なJDBCドライバーも提供し、同じくArrow Flight SQLプロトコルに準拠するデータベースとのシームレスな連携をサポートしています。一部のシナリオでは、MySQL ClientやJDBC/ODBCドライバーを使用したデータ転送ソリューションと比較して、パフォーマンスが最大100倍向上する場合があります。

## 実装原理

Dorisでは、クエリ結果はBlocksとして列形式で整理されます。2.1より前のバージョンでは、MySQL ClientやJDBC/ODBCドライバーを介してターゲットクライアントにデータを転送できましたが、これには行ベースのBytesを列形式にデシリアライズする必要がありました。Arrow Flight SQLに基づく高速データ転送リンクを構築することで、ターゲットクライアントもArrow列形式をサポートしている場合、転送プロセス全体でシリアライゼーションとデシリアライゼーションの操作を回避し、それらに関連する時間とパフォーマンスのオーバーヘッドを完全に排除できます。

![Arrow Flight SQL](/images/db-connect/arrow-flight-sql/Arrow-Flight-SQL.png)

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

- fe/conf/fe.confのarrow_flight_sql_portを利用可能なポート（例：8070）に変更します。
- be/conf/be.confのarrow_flight_sql_portを利用可能なポート（例：8050）に変更します。

`注意：fe.confとbe.confで設定するarrow_flight_sql_portのポート番号は異なります`

設定を変更してクラスターを再起動した後、fe/log/fe.logファイルで`Arrow Flight SQL service is started`を検索すると、FEのArrow Flight Serverが正常に起動したことを示します。be/log/be.INFOファイルで`Arrow Flight Service bind to host`を検索すると、BEのArrow Flight Serverが正常に起動したことを示します。

DorisインスタンスのFEとBEのArrow Flight SQLサービスがそれぞれポート8070と8050で実行され、Dorisのユーザー名/パスワードが"user"/"pass"であると仮定すると、接続プロセスは以下のようになります：

```Python
conn = flight_sql.connect(uri="grpc://{FE_HOST}:{fe.conf:arrow_flight_sql_port}", db_kwargs={
            adbc_driver_manager.DatabaseOptions.USERNAME.value: "user",
            adbc_driver_manager.DatabaseOptions.PASSWORD.value: "pass",
        })
cursor = conn.cursor()
```
接続が完了すると、返されたCursorを使用してSQLを通じてDorisと連携し、Tableの作成、メタデータの取得、データのインポート、クエリなどの操作を実行できます。

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
StatusResultが0を返す場合、Queryが正常に実行されたことを意味します（この設計の理由はJDBCとの互換性のためです）。

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

作成したTableに少量のテストデータをインポートするため、INSERT INTOを実行します：

```Python
cursor.execute("""INSERT INTO arrow_flight_sql_test VALUES
        ('0', 0.1, "ID", 0.0001, 9999999999, '2023-10-21'),
        ('1', 0.20, "ID_1", 1.00000001, 0, '2023-10-21'),
        ('2', 3.4, "ID_1", 3.1, 123456, '2023-10-22'),
        ('3', 4, "ID", 4, 4, '2023-10-22'),
        ('4', 122345.54321, "ID", 122345.54321, 5, '2023-10-22');""")
print(cursor.fetchallarrow().to_pandas())
```
以下は、importが成功したことを証明しています：

```
  StatusResult
0            0
```
Dorisに大量のデータをインポートする必要がある場合は、pydorisを使用してStream Loadを実行できます。

### クエリの実行

次に、上記でインポートしたTableに対してクエリを実行します。これには集約、ソート、Set Session Variableなどの操作が含まれます。

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
**注意:** クエリ結果を取得するには、`cursor.fetchallarrow()`を使用してarrow形式を返すか、`cursor.fetch_df()`を使用してpandas dataframeを直接返す必要があります。これにより、データは列形式で保持されます。`cursor.fetchall()`は使用しないでください。そうしないと、列形式のデータが行形式に変換され、本質的にmysql-clientを使用するのと同じになります。実際、クライアント側で追加の列から行への変換操作が発生するため、mysql-clientよりも遅くなる可能性があります。

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

Arrow Flight SQLプロトコルのオープンソースJDBCドライバーは標準JDBC APIと互換性があり、ほとんどのBIツールがJDBCを通じてDorisにアクセスするために使用でき、Apache Arrowデータの高速伝送をサポートしています。使用方法はMySQLプロトコルのJDBCドライバーを通じてDorisに接続する場合と同様です。リンクURL内のjdbc:mysqlプロトコルをjdbc:arrow-flight-sqlプロトコルに置き換えるだけです。クエリ結果は引き続きJDBC ResultSetデータ構造で返されます。

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
**注意：** Java 9以降を使用する場合、Javaコマンドに`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加してJDK内部構造を公開する必要があります。そうしないと、`module java.base does not "opens java.nio" to unnamed module`や`module java.base does not "opens java.nio" to org.apache.arrow.memory.core`、`java.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`などのエラーが発生する可能性があります。

```shell
# Directly on the command line
$ java --add-opens=java.base/java.nio=ALL-UNNAMED -jar ...
# Indirectly via environment variables
$ env _JAVA_OPTIONS="--add-opens=java.base/java.nio=ALL-UNNAMED" java -jar ...
```
IntelliJ IDEAでデバッグする場合、`Run/Debug Configurations`の`Build and run`に`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加する必要があります。下記の画像を参照してください：

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
## Java Usage

JDBCの使用に加えて、Pythonと同様に、JAVAでもDriverを作成してDorisを読み取り、Arrow形式でデータを返すことができます。以下は、AdbcDriverとJdbcDriverを使用してDoris Arrow Flight Serverに接続する方法です。

POM dependency:

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

Java 9以降を使用する場合、java コマンドに --add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED を追加して、一部のJDK内部機能を公開する必要があります：

```shell
# Directly on the command line
$ java --add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED -jar ...
# Indirectly via environment variables
$ env _JAVA_OPTIONS="--add-opens=java.base/java.nio=org.apache.arrow.memory.core,ALL-UNNAMED" java -jar ...
```
そうでなければ、`module java.base does not "opens java.nio" to unnamed module`や`module java.base does not "opens java.nio" to org.apache.arrow.memory.core`、`ava.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`などのエラーが発生する場合があります。

IntelliJ IDEAでデバッグする場合は、`Run/Debug Configurations`の`Build and run`に`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加する必要があります。下記の画像を参照してください：

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
### Jdbcおよび Java接続方式の選択

[JDBC/Java Arrow Flight SQL サンプル](https://github.com/apache/doris/blob/master/samples/arrow-flight-sql/java/README.md) は Arrow FLight SQLを使用したJDBC/Javaデモです。これを使用してArrow Flight Serverにクエリを送信するための様々な接続方式をテストでき、Arrow FLight SQLの使用方法の理解とパフォーマンステストに役立ちます。期待される実行結果については、[Add Arrow Flight Sql demo for Java](https://github.com/apache/doris/pull/45306)を参照してください。

従来の`jdbc:mysql`接続方式と比較して、JdbcおよびJavaのArrow Flight SQL接続方式のパフォーマンステストは[GitHub Issue](https://github.com/apache/doris/issues/25514)のセクション6.2で確認できます。以下は、テスト結論に基づく使用提案です。

1. 上記の3つのJava Arrow Flight SQL接続方式について、後続のデータ分析が行ベースのデータ形式に基づく場合は、jdbc:arrow-flight-sqlを使用してください。これはJDBC ResultSet形式でデータを返します。後続のデータ分析がArrow形式や他の列ベースのデータ形式に基づくことができる場合は、Flight AdbcDriverまたはFlight JdbcDriverを使用してArrow形式で直接データを返すことで、行列変換を回避し、Arrowの特性を活用してデータ解析を高速化できます。

2. JDBC ResultSetまたはArrow形式でデータを解析する場合、どちらも解析にかかる時間はデータ読み取りにかかる時間より長くなります。Arrow Flight SQLのパフォーマンスが期待通りでなく、`jdbc:mysql://`と比較して改善が限定的な場合は、データ解析に時間がかかりすぎているかどうかを分析することをお勧めします。

3. すべての接続方式において、JDK 17はJDK 1.8よりもデータ読み取りが高速です。

4. 大量のデータを読み取る場合、Arrow Flight SQLは`jdbc:mysql://`よりもメモリ使用量が少なくなります。メモリ不足に悩んでいる場合は、Arrow Flight SQLを試してみることもできます。

5. 上記の3つの接続方式に加えて、ネイティブのFlightClientを使用してArrow Flight Serverに接続することもでき、複数のエンドポイントをより柔軟に並列読み取りできます。Flight AdbcDriverもFlightClientに基づいて作成されたリンクで、FlightClientを直接使用するよりもシンプルです。

## 他のビッグデータコンポーネントとの連携

### Spark & Flink

Arrow Flightは現在、SparkおよびFlinkを公式にサポートする予定はありません（[GitHub Issue](https://github.com/apache/arrow-adbc/issues/1490)）。バージョン24.0.0以降、Doris独自の[Spark Connector](https://github.com/apache/doris-spark-connector)および[Flink Connector](https://github.com/apache/doris-flink-connector)がArrow Flight SQL経由でのDorisアクセスをサポートしており、これによって読み取りパフォーマンスが数倍向上することが期待されます。

コミュニティでは以前、オープンソースの[Spark-Flight-Connector](https://github.com/qwshen/spark-flight-connector)を参考にし、SparkでFlightClientを使用してDorisに接続してテストしました。ArrowとDoris Blockの間のデータ形式変換がより高速で、CSV形式とDoris Blockの変換速度の10倍であり、MapやArrayなどの複雑な型に対するサポートも優れていることが判明しました。これは、Arrowデータ形式が高い圧縮率を持ち、転送時のネットワークオーバーヘッドが低いためです。しかし、Doris Arrow Flightはまだマルチノード並列読み取りを実装しておらず、クエリ結果をBEノードに集約して返します。単純なデータのバッチエクスポートの場合、Tabletレベルの並列読み取りをサポートするDoris Spark Connectorほど高速でない可能性があります。SparkでArrow Flight SQLを使用してDorisに接続したい場合は、オープンソース化された[Spark-Flight-Connector](https://github.com/qwshen/spark-flight-connector)と[Dremio-Flight-Connector](https://github.com/dremio-hub/dremio-flight-connector)を参考に自分で実装できます。

### BIツールのサポート

Doris v2.1.8以降、DBeaverなどのBIツールが`arrow-flight-sql`プロトコルを使用してDorisに接続することをサポートしています。DBeaverが`arrow-flight-sql` Driverを使用してDorisに接続する方法については、以下を参照してください：[how-to-use-jdbc-driver-with-dbeaver-client](https://www.dremio.com/blog/jdbc-driver-for-arrow-flight-sql/#h-how-to-use-jdbc-driver-with-dbeaver-client)、[client-applications/clients/dbeaver/](https://docs.dremio.com/current/sonar/client-applications/clients/dbeaver/?_gl=1*1epgwh0*_gcl_au*MjUyNjE1ODM0LjE3MzQwMDExNDg)。

## 拡張アプリケーション

### 複数のBEが並列で結果を返す

Dorisはデフォルトで、すべてのBEノードでのクエリ結果を1つのBEノードに集約します。Mysql/JDBCクエリでは、FEはこの集約されたデータノードからクエリ結果を要求します。Arrow Flight SQLクエリでは、FEはこのノードのIP/PortをEndpointに包んでADBC Clientに返します。ADBC ClientはこのEndpointに対応するBEノードに要求してデータをプルします。

クエリが単純にDorisからデータをプルするSelectで、Join、Sort、Window Functionなどのデータシャッフル動作を持つオペレータがない場合、クエリはTablet粒度で分割できます。現在、Doris Spark/Flink Connectorはこの方式を使用して並列データ読み取りを実装しており、2つのステップに分かれます：
1. `explain sql`を実行し、FEが返すクエリプランのScanOperatorにはScanのすべてのTablet ID Listが含まれます。
2. 上記のTablet ID Listに基づいて元のSQLを複数のSQLに分割します。各SQLは一部のTabletのみを読み取ります。使用方法は`SELECT * FROM t1 TABLET(10001,10002) limit 1000;`に似ています。分割後の複数のSQLは並列実行できます。[Support select table sample](https://github.com/apache/doris/pull/10170)を参照してください。

クエリの最外層が集約の場合、SQLは`select k1, sum(k2) from xxx group by k1`のようになります。Doris v3.0.4以降では、`set enable_parallel_result_sink=true;`を実行してクエリの各BEノードが独立してクエリ結果を返すことを許可できます。FEが返すEndpointリストを受信後、ADBC Clientは複数のBEノードから並列で結果をプルします。ただし、集約結果が非常に小さい場合、複数のBEを返すとRPCの負荷が増加することに注意してください。具体的な実装については、[support parallel result sink](https://github.com/apache/doris/pull/36053)を参照してください。理論的には、最外層のクエリがソートされている場合を除いて、他のクエリは各BEノードが並列で結果を返すことをサポートできますが、現在はこの利便性の必要がないため、さらなる実装は行われていません。

### 複数のBEがクラスタ外部からアクセス可能な同じIPを共有

Dorisクラスタがあり、そのFEノードはクラスタ外部からアクセス可能で、すべてのBEノードはクラスタ内部からのみアクセス可能な場合があります。Mysql ClientおよびJDBCを使用してDorisに接続してクエリを実行する場合はこれで問題なく、クエリ結果はDoris FEノードによって返されます。しかし、Arrow Flight SQLを使用してDorisに接続する場合は動作しません。なぜなら、ADBC Clientがクエリ結果をプルするためにDoris BEノードに接続する必要がありますが、Doris BEノードはクラスタ外部からのアクセスが許可されていないからです。

本番環境では、Doris BEノードをクラスタ外部に公開するのは不便な場合がよくあります。しかし、すべてのDoris BEノードにリバースプロキシ（Nginxなど）を追加することができます。クラスタ外部のクライアントがNginxに接続すると、Doris BEノードにランダムにルーティングされます。デフォルトでは、Arrow Flight SQLクエリ結果はDoris BEノードにランダムに保存されます。NginxによってランダムにルーティングされたDoris BEノードと異なる場合、Doris BEノード内でデータ転送が必要になります。

Doris v2.1.8以降、すべてのDoris BEノードの`be.conf`で`public_host`と`arrow_flight_sql_proxy_port`を、複数のDoris BEノードが共有し、クラスタ外部からアクセス可能なIPとポートに設定することで、クエリ結果を正しく転送してADBC Clientに返すことができます。

```conf
public_host={nginx ip}
arrow_flight_sql_proxy_port={nginx port}
```
## FAQ

1. Q: エラー `connection error: desc = "transport: Error while dialing: dial tcp <ip:arrow_flight_port>: i/o timeout"`。

A: エラーメッセージ内の`<ip:arrow_flight_port>`がDoris FEノードのIPとarrow-flight-portの場合、

まず、Doris FEノードのarrow-flight-serverが正常に起動しているかを確認してください。fe/log/fe.logファイル内で`Arrow Flight SQL service is started`を検索することで、FEのArrow Flight Serverが正常に起動していることを確認できます。

Doris FEノードのarrow-flight-serverが正常に起動している場合、Clientが配置されているマシンがエラーメッセージ内のIP`<ip:arrow_flight_port>`を`ping`できるかを確認してください。`ping`できない場合、Doris FEノードに外部からアクセス可能なIPを開放し、クラスターを再デプロイする必要があります。

A: エラーメッセージ内の`<ip:arrow_flight_port>`がDoris BEノードのIPとarrow-flight-portの場合。

まず、Doris BEノードのarrow-flight-serverが正常に起動しているかを確認してください。be/log/be.INFOファイル内で`Arrow Flight Service bind to host`を検索することで、BEのArrow Flight Serverが正常に起動していることを確認できます。

Doris BEノードのarrow-flight-serverが正常に起動している場合、クライアントマシンがエラーメッセージに報告された`<ip:arrow_flight_port>`内のIPを`ping`できるかを確認してください。`ping`できず、Doris BEノードが外部からアクセスできないイントラネット内にあることが分かっている場合、以下の2つの方法を使用します：

- 各Doris BEノードに外部からアクセス可能なIPを開放することを検討してください。Doris v2.1.8以降では、このDoris BEノードの`be.conf`でこのIPを`public_host`として設定できます。同様に、すべてのDoris BEノードの`public_host`を、クライアントからアクセス可能な対応するBEノードのIPに設定してください。

- 上記の[Multiple BEs share the same IP that can be accessed externally by the cluster]セクションを参照して、すべてのDoris BEノードにリバースプロキシのレイヤーを追加してください。

Doris BEが完全にイントラネット内にあるかどうか不明な場合、クライアントマシンとDoris BEノードが配置されているマシンの他のIP間の接続性を確認してください。Doris BEノードが配置されているマシンで`ifconfig`を実行すると、現在のマシンのすべてのIPが返されます。そのうちの1つのIPは`<ip:arrow_flight_port>`内のIPと同じで、`show backends`で表示されるDoris BEノードのIPと同じはずです。`ifconfig`で返される他のIPを順番に`ping`してください。Doris BEノードにClientからアクセス可能なIPがある場合、上記を参照してこのIPを`public_host`として設定してください。Doris BEノードのすべてのIPがClientからアクセスできない場合、そのDoris BEノードは完全にイントラネット内にあります。

2. Q: JDBCまたはJAVAを使用してArrow Flight SQLに接続する際、エラーメッセージが表示される：`module java.base does not "opens java.nio" to unnamed module`または`module java.base does not "opens java.nio" to org.apache.arrow.memory.core`または`java.lang.NoClassDefFoundError: Could not initialize class org.apache.arrow.memory.util.MemoryUtil (Internal; Prepare)`

A: まず、fe/conf/fe.conf内の`JAVA_OPTS_FOR_JDK_17`に`--add-opens=java.base/java.nio=ALL-UNNAMED`が含まれているかを確認してください。含まれていない場合は追加してください。次に、上記の[JDBC Connector with Arrow Flight SQL]の注意事項を参照して、Javaコマンドに`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加してください。IntelliJ IDEAでデバッグする場合は、`Run/Debug Configurations`の`Build and run`に`--add-opens=java.base/java.nio=ALL-UNNAMED`を追加する必要があります。

3. Q: ARM環境でエラー`get flight info statement failed, arrow flight schema timeout, TimeoutException: Waited 5000 milliseconds for io.grpc.stub.クライアント`が報告される。

A: Linuxカーネルバージョンが <= 4.19.90の場合、4.19.279以上にアップグレードするか、より低いバージョンのLinuxカーネル環境でDoris BEを再コンパイルする必要があります。具体的なコンパイル方法については、ドキュメント<docs/dev/install/source-install/compilation-arm>を参照してください。

原因：これは古いバージョンのLinuxカーネルとArrow間の互換性問題が原因です。`cpp: arrow::RecordBatch::MakeEmpty()`がArrow Record Batchを構築する際にスタックし、Doris BEのArrow Flight ServerがDoris FEのArrow Flight ServerのRPCリクエストに5000ms以内に応答できなくなり、FEがrpc timeout failedをClientに返すためです。SparkとFlinkがDorisを読み取る際も、クエリ結果をArrow Record Batchに変換して返すため、同じ問題が存在します。

kylinv10 SP2とSP3のLinuxカーネルバージョンは最大でも4.19.90-24.4.v2101.ky10.aarch64のみです。カーネルバージョンはそれ以上アップグレードできません。Doris BEをkylinv10で再コンパイルするしかありません。新しいバージョンのldb_toolchainでDoris BEをコンパイルしても問題が解決しない場合は、より低いバージョンのldb_toolchain v0.17でコンパイルを試すことができます。ARM環境が外部ネットワークに接続できない場合、Huawei CloudはARM + kylinv10を提供し、Alibaba Cloudはx86 + kylinv10を提供しています。

4. Q: Prepared statementでパラメータを渡すとエラーが報告される。

A: 現在、`jdbc:arrow-flight-sql`とJava ADBC/JDBCDriverはprepared statementのパラメータ渡しをサポートしていません。例えば、`select * from xxx where id=?`は`parameter ordinal 1 out of range`エラーを報告します。これはArrow Flight SQLのバグです（[GitHub Issue](https://github.com/apache/arrow/issues/40118)）。

5. Q: 一部のシナリオでパフォーマンスを向上させるため、`jdbc:arrow-flight-sql`が毎回読み取るバッチサイズを変更する方法。

A: `org.apache.arrow.adbc.driver.jdbc.JdbcArrowReader`ファイル内の`makeJdbcConfig`メソッドで`setTargetBatchSize`を変更することで可能です（デフォルトは1024）。変更後、同じパス名でローカルディレクトリに保存し、元のファイルを上書きして有効にします。

6. Q: ADBC v0.10、JDBCとJava ADBC/JDBCDriverは並列読み取りをサポートしていない。

A: `stmt.executePartitioned()`メソッドが実装されていません。ネイティブのFlightClientのみを使用して複数のエンドポイントの並列読み取りを実装でき、方法は`sqlClient=new FlightSqlClient, execute=sqlClient.execute(sql), endpoints=execute.getEndpoints(), for(FlightEndpoint endpoint: endpoints)`です。さらに、ADBC V0.10のデフォルトのAdbcStatementは実際にはJdbcStatementです。executeQuery後、行形式のJDBC ResultSetがArrow列形式に変換されます。Java ADBC はADBC 1.0.0で完全に機能することが期待されています[GitHub Issue](https://github.com/apache/arrow-adbc/issues/1490)。

7. Q: URLでデータベース名を指定する。

A: Arrow v15.0時点では、Arrow JDBC ConnectorはURL内でのデータベース名指定をサポートしていません。例えば、`jdbc:arrow-flight-sql://{FE_HOST}:{fe.conf:arrow_flight_sql_port}/test?useServerPrepStmts=false`で`test`データベースへの接続を指定することは無効で、手動でSQL `use database`を実行する必要があります。Arrow v18.0はURL内でのデータベース名指定をサポートしていますが、実際のテストではまだバグがあります。

8. Q: Python ADBC で`Warning: Cannot disable autocommit; conn will not be DB-API 2.0 compliant`が表示される。

A: Pythonを使用する際はこのWarningを無視してください。これはPython ADBC Clientの問題でクエリには影響しません。

9. Q: Pythonでエラー`grpc: received message larger than max (20748753 vs. 16777216)`が報告される。

A: [Python: grpc: received message larger than max (20748753 vs. 16777216) #2078](https://github.com/apache/arrow-adbc/issues/2078)を参照して、Database Optionに`adbc_driver_flightsql.DatabaseOptions.WITH_MAX_MSG_SIZE.value`を追加してください。

10. Q: エラー`invalid bearer token`が報告される。

A: `SET PROPERTY FOR 'root' 'max_user_connections' = '10000';`を実行して現在のユーザーの現在の最大接続数を10000に変更し、`fe.conf`にqe_max_connection=30000とarrow_flight_token_cache_size=8000を追加してFEを再起動してください。

ADBC ClientとArrow Flight Server間の接続は本質的に長いリンクで、Auth Token、Connection、SessionをServer上でキャッシュする必要があります。接続作成後、単一クエリ終了時に即座に切断されることはありません。Clientがclose()リクエストを送信してクリーンアップする必要がありますが、実際にはClientがcloseリクエストを送信しないことが多く、そのためAuth Token、Connection、SessionがArrow Flight Server上に長時間保存されます。デフォルトでは3日後にタイムアウトして切断されるか、接続数が`arrow_flight_token_cache_size`の制限を超えた後にLRUに従って削除されます。

Doris v2.1.8時点では、Arrow Flight接続とMysql/JDBC接続は同じ接続制限を使用し、すべてのFEユーザーの総接続数`qe_max_connection`と`UserProperty`内の単一ユーザーの接続数`max_user_connections`が含まれます。しかし、デフォルトの`qe_max_connection`と`max_user_connections`はそれぞれ1024と100です。Arrow Flight SQLはJDBCシナリオの置き換えによく使用されますが、JDBC接続はクエリ終了後すぐに解放されます。そのため、Arrow Flight SQLを使用する際、Dorisのデフォルト接続制限は小さすぎ、接続数が`arrow_flight_token_cache_size`の制限を超えて、まだ使用中の接続が削除されることがよくあります。

11. Q: JDBCまたはJAVAを使用してArrow Flight SQLに接続してDatatime型を読み取ると、フォーマットされた時間ではなくタイムスタンプが返される。

A: JDBCまたはJAVAを使用してArrow Flight SQLに接続してDatatime型を読み取る場合、タイムスタンプを自分で変換する必要があります。[Add java parsing datetime type in arrow flight sql sample #48578](https://github.com/apache/doris/pull/48578)を参照してください。Python Arrow Flight SQLを使用してDatatime型を読み取ると`2025-03-03 17:23:28Z`の結果が返されますが、JDBCまたはJAVAでは`1740993808`が返されます。

12. Q: JDBCまたはJava JDBC ClientでArrow Flight SQLに接続してArray入れ子型を読み取るとエラー`構成 does not provide a mapping for array column 2`が返される。

A: [`sample/arrow-flight-sql`](https://github.com/apache/doris/blob/master/samples/arrow-flight-sql/java/src/main/java/doris/arrowflight/demo/FlightAdbcDriver.java)を参照してJAVA ADBC Clientを使用してください。

Python ADBC クライアント、JAVA ADBC クライアント、Java JDBC DriverManagerはすべてArray入れ子型の読み取りで問題ありません。JDBCまたはJava JDBC ClientでArrow Flight SQLに接続する場合のみ問題があります。実際、Arrow Flight JDBCの互換性は保証されておらず、Arrowが公式に開発したものではなく、サードパーティのデータベース会社Dremioによるものです。以前にも他の互換性問題が発見されているため、まずJAVA ADBC Clientの使用を推奨します。

## 2.1 Release Note

> DorisのArrow Flightはバージョンv2.1.4以前では完全ではないため、使用前にアップグレードすることを推奨します。

### v2.1.9

1. DorisデータのArrowへのシリアル化問題を修正。
[Fix UT DataTypeSerDeArrowTest of Array/Map/Struct/Bitmap/HLL/Decimal256 types](https://github.com/apache/doris/pull/48944)
- `Decimal256`型の読み取りに失敗；
- `DatetimeV2`型の読み取りで微細なエラー；
- `DateV2`型の読み取り結果が不正；
- `IPV4/IPV6`型の結果がNULLの場合のエラー；

2. Doris Arrow Flight SQLクエリが失敗して空の結果を返し、実際のエラー情報を返さない問題を修正。
[Fix query result is empty and not return query error message](https://github.com/apache/doris/pull/45023)

### v2.1.8

1. DBeaverなどのBIツールが`arrow-flight-sql`プロトコルを使用してDorisに接続し、メタデータツリーの正しい表示をサポート。
[Support arrow-flight-sql protocol getStreamCatalogs, getStreamSchemas, getStreamTables #46217](https://github.com/apache/doris/pull/46217)。

2. 複数のBEがクラスター外部からアクセス可能な同じIPを共有する場合、クエリ結果をADBC Clientに正しく転送して返すことができる。
[Arrow flight server supports data forwarding when BE uses public vip](https://github.com/apache/doris/pull/43281)

3. 複数エンドポイントでの並列読み取りをサポート。
[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286)

4. クエリエラー`FE not found arrow flight schema`を修正。
[Fix FE not found arrow flight schema](https://github.com/apache/doris/pull/43960)

5. NULLを許可する列の読み取り時のエラー`BooleanBuilder::AppendValues`を修正。
[Fix Doris NULL column conversion to arrow batch](https://github.com/apache/doris/pull/43929)

6. `show processlist`で重複するConnection IDが表示される問題を修正。
[Fix arrow-flight-sql ConnectContext to use a unified ID #46284](https://github.com/apache/doris/pull/46284)

7. `Datetime`と`DatetimeV2`型を読み取る際にタイムゾーンが失われ、実際のデータより8時間少ないdatetimeとなる問題を修正。
[Fix time zone issues and accuracy issues #38215](https://github.com/apache/doris/pull/38215)

### v2.1.7

1. 頻繁なログ出力`Connection wait_timeout`を修正。
[Fix kill timeout FlightSqlConnection and FlightSqlConnectProcessor close](https://github.com/apache/doris/pull/41770)

2. Arrow Flight Bearer TokenのCacheからの期限切れを修正。
[Fix Arrow Flight bearer token cache evict after expired](https://github.com/apache/doris/pull/41754)

### v2.1.6

1. クエリエラー`0.0.0.0:xxx, connection refused`を修正。
[Fix return result from FE Arrow Flight server error 0.0.0.0:xxx, connection refused](https://github.com/apache/doris/pull/40002)

2. クエリエラー`Reach limit of connections`を修正。
[Fix exceed user property max connection cause Reach limit of connections #39127](https://github.com/apache/doris/pull/39127)

以前のバージョンでは、`SET PROPERTY FOR 'root' 'max_user_connections' = '1024';`を実行して現在のユーザーの現在の最大接続数を1024に変更することで、一時的に回避できます。

以前のバージョンではArrow Flight接続数を`qe_max_connection/2`未満に制限するのみで、`qe_max_connection`はすべてのfeユーザーの総接続数（デフォルト1024）であり、単一ユーザーのArrow Flight接続数を`UserProperty`内の`max_user_connections`（デフォルト100）未満に制限しないため、Arrow Flight接続数が現在のユーザーの接続数上限を超えると`Reach limit of connections`エラーが報告されるため、現在のユーザーの`max_user_connections`を増加させる必要があります。

問題の詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D18b1/2-1-4-ban-ben-python-shi-yong-arrow-flight-sql-lian-jie-bu-hui-duan-kai-lian-jie-shu-zhan-man-da-dao-100/E1ic1?commentId=10070000000005324)

3. 1回で返すクエリ結果のArrowBatchサイズの変更をサポートするConf `arrow_flight_result_sink_buffer_size_rows`を追加、デフォルトは4096 * 8。
[Add config arrow_flight_result_sink_buffer_size_rows](https://github.com/apache/doris/pull/38221)

### v2.1.5

1. Arrow Flight SQLクエリ結果が空になる問題を修正。
[Fix arrow flight result sink #36827](https://github.com/apache/doris/pull/36827)

Doris v2.1.4では大量データの読み取り時にエラーが報告される可能性があります。詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D1Ia1/arrow-flight-sql-shi-yong-python-de-adbc-driver-lian-jie-doris-zhi-xing-cha-xun-sql-du-qu-bu-dao-shu-ju)

## 3.0 Release Note

### v3.0.5

1. DorisデータのArrowへのシリアル化問題を修正。
[Fix UT DataTypeSerDeArrowTest of Array/Map/Struct/Bitmap/HLL/Decimal256 types](https://github.com/apache/doris/pull/48944)
- `Decimal256`型の読み取りに失敗；
- `DatetimeV2`型の読み取りで微細なエラー；
- `DateV2`型の読み取り結果が不正；
- `IPV4/IPV6`型の結果がNULLの場合のエラー；

### v3.0.4

1. DBeaverなどのBIツールが`arrow-flight-sql`プロトコルを使用してDorisに接続し、メタデータツリーの正しい表示をサポート。
[Support arrow-flight-sql protocol getStreamCatalogs, getStreamSchemas, getStreamTables #46217](https://github.com/apache/doris/pull/46217)。

2. 複数エンドポイントでの並列読み取りをサポート。
[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286)

3. NULLを許可する列の読み取り時のエラー`BooleanBuilder::AppendValues`を修正。
[Fix Doris NULL column conversion to arrow batch](https://github.com/apache/doris/pull/43929)

4. `show processlist`で重複するConnection IDが表示される問題を修正。
[Fix arrow-flight-sql ConnectContext to use a unified ID #46284](https://github.com/apache/doris/pull/46284)

5. Doris Arrow Flight SQLクエリが失敗して空の結果を返し、実際のエラー情報を返さない問題を修正。
[Fix query result is empty and not return query error message](https://github.com/apache/doris/pull/45023)

### v3.0.3

1. クエリエラー`0.0.0.0:xxx, connection refused`を修正。
[Fix return result from FE Arrow Flight server error 0.0.0.0:xxx, connection refused](https://github.com/apache/doris/pull/40002)

2. クエリエラー`Reach limit of connections`を修正。
[Fix exceed user property max connection cause Reach limit of connections #39127](https://github.com/apache/doris/pull/39127)

以前のバージョンでは、`SET PROPERTY FOR 'root' 'max_user_connections' = '1024';`を実行して現在のユーザーの現在の最大接続数を1024に変更することで、一時的に回避できます。

以前のバージョンではArrow Flight接続数を`qe_max_connection/2`未満に制限するのみで、`qe_max_connection`はすべてのfeユーザーの総接続数（デフォルト1024）であり、単一ユーザーのArrow Flight接続数を`UserProperty`内の`max_user_connections`（デフォルト100）未満に制限しないため、Arrow Flight接続数が現在のユーザーの接続数上限を超えると`Reach limit of connections`エラーが報告されるため、現在のユーザーの`max_user_connections`を増加させる必要があります。

問題の詳細については以下を参照：[Questions](https://ask.selectdb.com/questions/D18b1/2-1-4-ban-ben-python-shi-yong-arrow-flight-sql-lian-jie-bu-hui-duan-kai-lian-jie-shu-zhan-man-da-dao-100/E1ic1?commentId=10070000000005324)

3. 頻繁なログ出力`Connection wait_timeout`を修正。
[Fix kill timeout FlightSqlConnection and FlightSqlConnectProcessor close](https://github.com/apache/doris/pull/41770)

4. Arrow Flight Bearer TokenがCacheから期限切れで削除される問題を修正。
[Fix Arrow Flight bearer token cache evict after expired](https://github.com/apache/doris/pull/41754)

5. 複数のBEがクラスター外部からアクセス可能な同じIPアドレスを共有する場合、クエリ結果をADBC Clientに正しく転送して返すことができる。
[Arrow flight server supports data forwarding when BE uses public vip](https://github.com/apache/doris/pull/43281)

6. クエリエラー`FE not found arrow flight schema`を修正。
[Fix FE not found arrow flight schema](https://github.com/apache/doris/pull/43960)

7. `Datetime`と`DatetimeV2`型を読み取る際にタイムゾーンが失われ、実際のデータより8時間少ないdatetimeとなる問題を修正。
[Fix time zone issues and accuracy issues #38215](https://github.com/apache/doris/pull/38215)

### v3.0.2

1. 1回の処理で返されるクエリ結果のArrowBatchサイズの変更をサポートするConf `arrow_flight_result_sink_buffer_size_rows`を追加、デフォルトは4096 * 8。
[Add config arrow_flight_result_sink_buffer_size_rows](https://github.com/apache/doris/pull/38221)

### v3.0.1

1. クエリ結果の欠損、クエリ結果行数 = 実際の行数 / BE数
[Fix get Schema failed when enable_parallel_result_sink is false #37779](https://github.com/apache/doris/pull/37779)

Doris 3.0.0では、クエリの最外層が集約の場合、SQLが`select k1, sum(k2) from xxx group by k1`のような場合、（クエリ結果行数 = 実際の行数 / BE数）に遭遇する可能性があり、これは[support parallel result sink](https://github.com/apache/doris/pull/36053)によって導入された問題です。[Fix get Schema failed when enable_parallel_result_sink is false](https://github.com/apache/doris/pull/37779)は一時的な修正で、[Arrow Flight support multiple endpoints](https://github.com/apache/doris/pull/44286)が複数エンドポイントの並列読み取りをサポートした後に正式に修正されます。
