---
{
  "title": "高並行性LOAD最適化（Group Commit）",
  "description": "高頻度の小バッチ書き込みシナリオでは、従来のロード方法には以下の問題があります：",
  "language": "ja"
}
---
高頻度小バッチ書き込みシナリオにおいて、従来のロード方式には以下の問題があります：

- 各ロードが独立したトランザクションを作成し、FEがSQLを解析して実行プランを生成する必要があるため、全体的なパフォーマンスに影響します
- 各ロードが新しいバージョンを生成し、バージョンの急速な増加を引き起こし、バックグラウンドcompactionの負荷を増加させます

これらの問題を解決するため、DorisはGroup Commitメカニズムを導入しました。Group Commitは新しいロード方式ではなく、既存のロード方式の最適化拡張であり、主に以下を対象としています：

- `INSERT INTO tbl VALUES(...)`文
- Stream Load

複数の小バッチロードをバックグラウンドで1つの大きなトランザクションコミットにマージすることにより、高並行性小バッチ書き込みのパフォーマンスを大幅に向上させます。さらに、Group CommitをPreparedStatementと併用することで、より高いパフォーマンス向上を実現できます。

## Group Commitモード

Group Commitには3つのモードがあります：

* Offモード（`off_mode`）

    Group Commitが無効になります。

* 同期モード（`sync_mode`）

    Dorisはロードとテーブルの`group_commit_interval`プロパティに基づいて、複数のロードを1つのトランザクションでコミットし、トランザクションコミット後に結果を返します。これは、ロード後すぐにデータの可視性が必要な高並行性書き込みシナリオに適しています。

* 非同期モード（`async_mode`）

    DorisはまずデータをWAL（Write Ahead Log）に書き込み、その後すぐに結果を返します。Dorisはロードとテーブルの`group_commit_interval`プロパティに基づいて非同期でデータをコミットし、コミット後にデータが可視になります。WALがディスク容量を過度に占有することを防ぐため、大きな単一ロードに対しては自動的に`sync_mode`に切り替わります。これは書き込み遅延に敏感で高頻度書き込みのシナリオに適しています。

    WAL数は、ここに示すようにFE httpインターフェースを通じて確認するか、BEメトリクスで`wal`キーワードを検索することで確認できます。

## Group Commitの使用方法

テーブル構造が以下であると仮定します：

```sql
CREATE TABLE `dt` (
    `id` int(11) NOT NULL,
    `name` varchar(50) NULL,
    `score` int(11) NULL
) ENGINE=OLAP
DUPLICATE KEY(`id`)
DISTRIBUTED BY HASH(`id`) BUCKETS 1
PROPERTIES (
    "replication_num" = "1"
);
```
### JDBCの使用

ユーザーがJDBCの`insert into values`メソッドを使用して書き込みを行う際、SQLの解析および計画のオーバーヘッドを削減するため、FE側でMySQLプロトコルの`PreparedStatement`機能をサポートしています。`PreparedStatement`を使用する場合、SQLとそのロードプランはセッションレベルのメモリキャッシュにキャッシュされ、後続のロードでは直接キャッシュされたオブジェクトを使用することで、FE CPUの負荷を軽減します。以下はJDBCで`PreparedStatement`を使用する例です：

**1. JDBC URLを設定し、サーバー側でPrepared Statementを有効にする**

```
url = jdbc:mysql://127.0.0.1:9030/db?useServerPrepStmts=true&useLocalSessionState=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSqlLimit=99999&prepStmtCacheSize=500
```
**2. `group_commit` セッション変数を次の2つの方法のいずれかで設定します:**

* JDBC URLに `sessionVariables=group_commit=async_mode` を追加することによって

```
url = jdbc:mysql://127.0.0.1:9030/db?useServerPrepStmts=true&useLocalSessionState=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSqlLimit=99999&prepStmtCacheSize=500&sessionVariables=group_commit=async_mode
```
* SQL実行を通じて

```
try (Statement statement = conn.createStatement()) {
    statement.execute("SET group_commit = async_mode;");
}
```
**3. `PreparedStatement`を使用する**

```java
private static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";
private static final String URL_PATTERN = "jdbc:mysql://%s:%d/%s?useServerPrepStmts=true&useLocalSessionState=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSqlLimit=99999&prepStmtCacheSize=50$sessionVariables=group_commit=async_mode";
private static final String HOST = "127.0.0.1";
private static final int PORT = 9087;
private static final String DB = "db";
private static final String TBL = "dt";
private static final String USER = "root";
private static final String PASSWD = "";
private static final int INSERT_BATCH_SIZE = 10;

private static void groupCommitInsertBatch() throws Exception {
    Class.forName(JDBC_DRIVER);
    // add rewriteBatchedStatements=true and cachePrepStmts=true in JDBC url
    // set session variables by sessionVariables=group_commit=async_mode in JDBC url
    try (Connection conn = DriverManager.getConnection(
            String.format(URL_PATTERN, HOST, PORT, DB), USER, PASSWD)) {

        String query = "insert into " + TBL + " values(?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            for (int j = 0; j < 5; j++) {
                // 10 rows per insert
                for (int i = 0; i < INSERT_BATCH_SIZE; i++) {
                    stmt.setInt(1, i);
                    stmt.setString(2, "name" + i);
                    stmt.setInt(3, i + 10);
                    stmt.addBatch();
                }
                int[] result = stmt.executeBatch();
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```
注意：高頻度のinsert into文は大量の監査ログを出力し、最終的なパフォーマンスに影響するため、prepared statement監査ログの出力はデフォルトで無効になっています。セッション変数の設定を通じて、prepared statement監査ログを出力するかどうかを制御できます。

```sql
# Configure session variable to enable printing prepared statement audit log, default is false
set enable_prepared_stmt_audit_log=true;
```
**JDBC**の使用方法の詳細については、[Using Insert Method to Synchronize Data](./import-way/insert-into-manual.md)を参照してください。

### GolangでのGroup Commitの使用

Golangはprepared statementのサポートが限定的であるため、手動でクライアント側のバッチング処理を行うことでGroup Commitのパフォーマンスを向上させることができます。以下はサンプルプログラムです：

```Golang
package main

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const (
	host     = "127.0.0.1"
	port     = 9038
	db       = "test"
	user     = "root"
	password = ""
	table    = "async_lineitem"
)

var (
	threadCount = 20
	batchSize   = 100
)

var totalInsertedRows int64
var rowsInsertedLastSecond int64

func main() {
	dbDSN := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true", user, password, host, port, db)
	db, err := sql.Open("mysql", dbDSN)
	if err != nil {
		fmt.Printf("Error opening database: %s\n", err)
		return
	}
	defer db.Close()

	var wg sync.WaitGroup
	for i := 0; i < threadCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			groupCommitInsertBatch(db)
		}()
	}

	go logInsertStatistics()

	wg.Wait()
}

func groupCommitInsertBatch(db *sql.DB) {
	for {
		valueStrings := make([]string, 0, batchSize)
		valueArgs := make([]interface{}, 0, batchSize*16)
		for i := 0; i < batchSize; i++ {
		    valueStrings = append(valueStrings, "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
			valueArgs = append(valueArgs, rand.Intn(1000))
			valueArgs = append(valueArgs, rand.Intn(1000))
			valueArgs = append(valueArgs, rand.Intn(1000))
			valueArgs = append(valueArgs, rand.Intn(1000))
			valueArgs = append(valueArgs, sql.NullFloat64{Float64: 1.0, Valid: true})
			valueArgs = append(valueArgs, sql.NullFloat64{Float64: 1.0, Valid: true})
			valueArgs = append(valueArgs, sql.NullFloat64{Float64: 1.0, Valid: true})
			valueArgs = append(valueArgs, sql.NullFloat64{Float64: 1.0, Valid: true})
			valueArgs = append(valueArgs, "N")
			valueArgs = append(valueArgs, "O")
			valueArgs = append(valueArgs, time.Now())
			valueArgs = append(valueArgs, time.Now())
			valueArgs = append(valueArgs, time.Now())
			valueArgs = append(valueArgs, "DELIVER IN PERSON")
			valueArgs = append(valueArgs, "SHIP")
			valueArgs = append(valueArgs, "N/A")
		}
		stmt := fmt.Sprintf("INSERT INTO %s VALUES %s",
			table, strings.Join(valueStrings, ","))
		_, err := db.Exec(stmt, valueArgs...)
		if err != nil {
			fmt.Printf("Error executing batch: %s\n", err)
			return
		}
		atomic.AddInt64(&rowsInsertedLastSecond, int64(batchSize))
		atomic.AddInt64(&totalInsertedRows, int64(batchSize))
	}
}

func logInsertStatistics() {
	for {
		time.Sleep(1 * time.Second)
		fmt.Printf("Total inserted rows: %d\n", totalInsertedRows)
		fmt.Printf("Rows inserted in the last second: %d\n", rowsInsertedLastSecond)
		rowsInsertedLastSecond = 0
	}
}

```
### INSERT INTO VALUES

* 非同期モード

```sql
# Configure session variable to enable group commit (default is off_mode), enable asynchronous mode
mysql> set group_commit = async_mode;

# The returned label is prefixed with group_commit, indicating whether group commit is used
mysql> insert into dt values(1, 'Bob', 90), (2, 'Alice', 99);
Query OK, 2 rows affected (0.05 sec)
{'label':'group_commit_a145ce07f1c972fc-bd2c54597052a9ad', 'status':'PREPARE', 'txnId':'181508'}

# The label, txn_id, and previous one are the same, indicating that they are accumulated into the same import task
mysql> insert into dt(id, name) values(3, 'John');
Query OK, 1 row affected (0.01 sec)
{'label':'group_commit_a145ce07f1c972fc-bd2c54597052a9ad', 'status':'PREPARE', 'txnId':'181508'}

# Cannot query immediately
mysql> select * from dt;
Empty set (0.01 sec)

# 10 seconds later, data can be queried, and data visibility delay can be controlled by table attribute group_commit_interval.
mysql> select * from dt;
+------+-------+-------+
| id   | name  | score |
+------+-------+-------+
|    1 | Bob   |    90 |
|    2 | Alice |    99 |
|    3 | John  |  NULL |
+------+-------+-------+
3 rows in set (0.02 sec)
```
* Synchronous Mode

```sql
# Configure session variable to enable group commit (default is off_mode), enable synchronous mode
mysql> set group_commit = sync_mode;

# The returned label is prefixed with group_commit, indicating whether group commit is used, and import time is at least table attribute group_commit_interval.
mysql> insert into dt values(4, 'Bob', 90), (5, 'Alice', 99);
Query OK, 2 rows affected (10.06 sec)
{'label':'group_commit_d84ab96c09b60587_ec455a33cb0e9e87', 'status':'PREPARE', 'txnId':'3007', 'query_id':'fc6b94085d704a94-a69bfc9a202e66e2'}

# Data can be read immediately
mysql> select * from dt;
+------+-------+-------+
| id   | name  | score |
+------+-------+-------+
|    1 | Bob   |    90 |
|    2 | Alice |    99 |
|    3 | John  |  NULL |
|    4 | Bob   |    90 |
|    5 | Alice |    99 |
+------+-------+-------+
5 rows in set (0.03 sec)
```
* Off Mode

```sql
mysql> set group_commit = off_mode;
```
### Stream Load

`data.csv` に以下の内容が含まれていると仮定します：

```sql
6,Amy,60
7,Ross,98
```
* 非同期モード

```sql
# Import with "group_commit:async_mode" configuration in header

curl --location-trusted -u {user}:{passwd} -T data.csv -H "group_commit:async_mode"  -H "column_separator:,"  http://{fe_host}:{http_port}/api/db/dt/_stream_load
{
    "TxnId": 7009,
    "Label": "group_commit_c84d2099208436ab_96e33fda01eddba8",
    "Comment": "",
    "GroupCommit": true,
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 2,
    "NumberLoadedRows": 2,
    "NumberFilteredRows": 0,
    "NumberUnselectedRows": 0,
    "LoadBytes": 19,
    "LoadTimeMs": 35,
    "StreamLoadPutTimeMs": 5,
    "ReadDataTimeMs": 0,
    "WriteDataTimeMs": 26
}

# The returned GroupCommit is true, indicating that the group commit process is entered
# The returned Label is prefixed with group_commit, indicating the label associated with the import that truly consumes data
```
* Synchronous Mode

```sql
# Import with "group_commit:sync_mode" configuration in header

curl --location-trusted -u {user}:{passwd} -T data.csv -H "group_commit:sync_mode"  -H "column_separator:,"  http://{fe_host}:{http_port}/api/db/dt/_stream_load
{
    "TxnId": 3009,
    "Label": "group_commit_d941bf17f6efcc80_ccf4afdde9881293",
    "Comment": "",
    "GroupCommit": true,
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 2,
    "NumberLoadedRows": 2,
    "NumberFilteredRows": 0,
    "NumberUnselectedRows": 0,
    "LoadBytes": 19,
    "LoadTimeMs": 10044,
    "StreamLoadPutTimeMs": 4,
    "ReadDataTimeMs": 0,
    "WriteDataTimeMs": 10038
}

# The returned GroupCommit is true, indicating that the group commit process is entered
# The returned Label is prefixed with group_commit, indicating the label associated with the import that truly consumes data
```
Stream Loadの使用方法については、[Stream Load](./import-way/stream-load-manual)を参照してください。

データは時間間隔（デフォルト10秒）またはデータ量（デフォルト64 MB）の条件のいずれかが満たされると自動的にコミットされます。これらのパラメータは一緒に使用し、実際のシナリオに基づいて調整する必要があります。

### コミット間隔の変更

デフォルトのコミット間隔は10秒で、ユーザーはテーブル設定を通じて調整できます：

```sql
# Modify commit interval to 2 seconds
ALTER TABLE dt SET ("group_commit_interval_ms" = "2000");
```
**パラメータ調整の推奨事項**：
- より短い間隔（例：2秒）：
  - メリット：データ可視性レイテンシが低く、高いリアルタイム性能が求められるシナリオに適している
  - デメリット：コミット数が多く、バージョンの増大が早く、バックグラウンドコンパクション圧力が高い

- より長い間隔（例：30秒）：
  - メリット：コミットバッチが大きく、バージョンの増大が遅く、システムオーバーヘッドが低い
  - デメリット：データ可視性レイテンシが高い

データ可視性遅延に対するビジネス許容度に基づいて設定することを推奨します。システム圧力が高い場合は、間隔を増やすことを検討してください。

### Commitデータボリュームの変更

Group Commitのデフォルトコミットデータボリュームは64 MBです。ユーザーはテーブル設定を通じて調整できます：

```sql
# Modify commit data volume to 128MB
ALTER TABLE dt SET ("group_commit_data_bytes" = "134217728");
```
**パラメータ調整の推奨事項**：
- より小さい閾値（例：32MB）：
  - 利点：メモリ使用量が少ない、リソース制約のある環境に適している
  - 欠点：コミットバッチが小さくなる、スループットが制限される可能性がある

- より大きい閾値（例：256MB）：
  - 利点：バッチコミット効率が高い、システムスループットが向上する
  - 欠点：より多くのメモリを使用する

システムメモリリソースとデータ信頼性要件に基づいてバランスを取ることを推奨します。メモリが十分でより高いスループットが必要な場合は、128MB以上への増加を検討してください。


### BE設定

1. `group_commit_wal_path`

   * 説明：group commit WALファイルを格納するディレクトリ

   * デフォルト：設定された各`storage_root_path`の下に`wal`ディレクトリを作成します。設定例：

   ```
   group_commit_wal_path=/data1/storage/wal;/data2/storage/wal;/data3/storage/wal
   ```
## 使用制限

* **Group Commit制限**

  * `INSERT INTO VALUES`文は、以下の場合にnon-Group Commitモードに退化します：
    - トランザクション書き込み（`Begin; INSERT INTO VALUES; COMMIT`）
    - 指定されたLabel（`INSERT INTO dt WITH LABEL {label} VALUES`）
    - 式を含むVALUES（`INSERT INTO dt VALUES (1 + 100)`）
    - カラム更新書き込み
    - テーブルがlightweightモード変更をサポートしない場合

  * `Stream Load`は、以下の場合にnon-Group Commitモードに退化します：
    - 2フェーズコミットの使用
    - 指定されたLabel（`-H "label:my_label"`）
    - カラム更新書き込み
    - テーブルがlightweightモード変更をサポートしない場合

* **Unique Model**
  - Group Commitはコミット順序を保証しないため、データ一貫性を確保するためにSequenceカラムの使用を推奨します。

* **WAL制限**
  - `async_mode`はデータをWALに書き込み、成功後に削除し、失敗時はWALを通じて復旧します。
  - WALファイルは1つのBE上に単一レプリカで保存されるため、ディスク損傷や誤ったファイル削除によってデータ損失が発生する可能性があります。
  - BEノードをオフラインにする際は、データ損失を防ぐために`DECOMMISSION`コマンドを使用してください。
  - `async_mode`は以下の場合に`sync_mode`に切り替わります：
    - ロードデータ量が大きすぎる（WAL単一ディレクトリ容量の80%を超過）
    - データ量が不明なチャンクストリームロード
    - ディスク容量不足
  - 重量級Schema Change中、Group Commit書き込みは拒否され、クライアントは再試行が必要です。

## パフォーマンス

`Stream Load`と`JDBC`（`async mode`）を使用して、小さなデータ量での高同時実行シナリオにおけるgroup commitの書き込みパフォーマンスを個別にテストしました。

### Stream Load

#### 環境

* 1 Front End (FE)サーバー：Alibaba Cloud、8コアCPU、16GB RAM、100GB ESSD PL1 SSD 1台。

* 3 Backend (BE)サーバー：Alibaba Cloud、16コアCPU、64GB RAM、1TB ESSD PL1 SSD 1台。

* 1テストクライアント：Alibaba Cloud、16コアCPU、64GB RAM、100GB ESSD PL1 SSD 1台。

* テストバージョンはDoris-2.1.5。

#### データセット

* `httplogs`、31 GB、247249096（2億4700万）行

#### テストツール

* doris-streamloader

#### テスト方法

* `non group_commit`と`group_commit=async mode`モードの間で、リクエストごとの異なるデータサイズと同時実行レベルでテスト。

#### テスト結果

| Load Way           | Single-concurrency Data Size | Concurrency | Cost Seconds | Rows / Seconds | MB / Seconds |
|------------------|-------------|--------|-------------|--------------------|-------------------|
| group_commit     | 10 KB       | 10     | 3306      | 74,787         | 9.8              |
| group_commit     | 10 KB       | 30     | 3264      | 75,750         | 10.0            |
| group_commit     | 100 KB      | 10     | 424       | 582,447        | 76.7             |
| group_commit     | 100 KB      | 30     | 366       | 675,543        | 89.0             |
| group_commit     | 500 KB      | 10     | 187       | 1,318,661       | 173.7            |
| group_commit     | 500 KB      | 30     | 183       | 1,351,087       | 178.0            |
| group_commit     | 1 MB        | 10     | 178       | 1,385,148       | 182.5            |
| group_commit     | 1 MB        | 30     | 178       | 1,385,148       | 182.5            |
| group_commit     | 10 MB       | 10     | 177       | 1,396,887       | 184.0            |
| non group_commit   | 1 MB        | 10     | 2824      | 87,536          | 11.5             |
| non group_commit   | 10 MB       | 10     | 450       | 549,442         | 68.9             |
| non group_commit   | 10 MB       | 30     | 177       | 1,396,887       | 184.0            |

上記のテストにおいて、BEのCPU使用率は10-40%の間で変動しています。

`group_commit`はロードパフォーマンスを効果的に向上させると同時にバージョン数を削減し、それによってcompactionへの圧力を軽減します。

### JDBC

#### 環境

1 Front End (FE)サーバー：Alibaba Cloud、8コアCPU、16GB RAM、100GB ESSD PL1 SSD 1台。

1 Backend (BE)サーバー：Alibaba Cloud、16コアCPU、64GB RAM、500GB ESSD PL1 SSD 1台。

1テストクライアント：Alibaba Cloud、16コアCPU、64GB RAM、100GB ESSD PL1 SSD 1台。

テストバージョンはDoris-2.1.5。

パフォーマンスを向上させるためにprepared statement監査ログの出力を無効化。

#### データセット

* tpch sf10 `lineitem`テーブルのデータ、20ファイル、14 GB、1億2000万行

#### テスト方法

* [DataX](https://github.com/alibaba/DataX)

#### テスト方法

* `txtfilereader`を使用してデータを`mysqlwriter`に書き込み、異なる同時実行数と`INSERT` SQLごとの行数を設定。

#### テスト結果


| Rows per insert | Concurrency | Rows / Second | MB / Second |
|-------------------|--------|--------------------|--------------------|
| 100               | 10     | 107,172            | 11.47              |
| 100               | 20     | 140,317            | 14.79              |
| 100               | 30     | 142,882            | 15.28              |

上記のテストにおいて、BEのCPU使用率は10-20%の間で変動し、FEは60-70%の間で変動しています。


### Insert into Sync Mode小バッチデータ

**マシン構成**

* 1 Front-End (FE)：Alibaba Cloud、16コアCPU、64GB RAM、500GB ESSD PL1クラウドディスク 1台
* 5 Back-End (BE)ノード：Alibaba Cloud、16コアCPU、64GB RAM、1TB ESSD PL1クラウドディスク 1台。
* 1テストクライアント：Alibaba Cloud、16コアCPU、64GB RAM、100GB ESSD PL1クラウドディスク 1台
* テストバージョン：Doris-2.1.5

**データセット**

* tpch sf10 `lineitem`テーブルのデータ。

* create table文は

```sql
CREATE TABLE IF NOT EXISTS lineitem (
  L_ORDERKEY    INTEGER NOT NULL,
  L_PARTKEY     INTEGER NOT NULL,
  L_SUPPKEY     INTEGER NOT NULL,
  L_LINENUMBER  INTEGER NOT NULL,
  L_QUANTITY    DECIMAL(15,2) NOT NULL,
  L_EXTENDEDPRICE  DECIMAL(15,2) NOT NULL,
  L_DISCOUNT    DECIMAL(15,2) NOT NULL,
  L_TAX         DECIMAL(15,2) NOT NULL,
  L_RETURNFLAG  CHAR(1) NOT NULL,
  L_LINESTATUS  CHAR(1) NOT NULL,
  L_SHIPDATE    DATE NOT NULL,
  L_COMMITDATE  DATE NOT NULL,
  L_RECEIPTDATE DATE NOT NULL,
  L_SHIPINSTRUCT CHAR(25) NOT NULL,
  L_SHIPMODE     CHAR(10) NOT NULL,
  L_COMMENT      VARCHAR(44) NOT NULL
)
DUPLICATE KEY(L_ORDERKEY, L_PARTKEY, L_SUPPKEY, L_LINENUMBER)
DISTRIBUTED BY HASH(L_ORDERKEY) BUCKETS 32
PROPERTIES (
  "replication_num" = "3"
);
```
**テストツール**

* [Jmeter](https://jmeter.apache.org/)

画像に示すJMeterパラメータ設定

![jmeter1](/images/group-commit/jmeter1.jpg)
![jmeter2](/images/group-commit/jmeter2.jpg)

1. テスト前にInit Statementを設定:
set group_commit=async_mode and set enable_nereids_planner=false.

2. JDBC Prepared Statementを有効化:
完全なURL:
jdbc:mysql://127.0.0.1:9030?useServerPrepStmts=true&useLocalSessionState=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSqlLimit=99999&prepStmtCacheSize=50&sessionVariables=group_commit=async_mode,enable_nereids_planner=false.

3. Import TypeをPrepared Update Statementに設定。

4. Import Statementを設定。

5. インポートする値を設定:
インポートする値がデータ型と一対一で一致することを確認してください。

**テスト手法**

* JMeterを使用してDorisにデータを書き込み。各スレッドはinsert into文を使用して1実行あたり1行のデータを書き込み。

**テスト結果**

* データ単位: rows per second。

* 以下のテストは30、100、500の同時実行数に分けて実施。

**Syncモード、5 BE、3レプリカでの30同時実行ユーザーのパフォーマンステスト**

| Group Commit Interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 321.5      | 307.3      | 285.8    | 224.3    |

**Syncモード、5 BE、3レプリカでの100同時実行ユーザーのパフォーマンステスト**

| Group Commit Interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 1175.2     | 1108.7     | 1016.3    | 704.5  |

**Syncモード、5 BE、3レプリカでの500同時実行ユーザーのパフォーマンステスト**

| Group Commit Interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 3289.8    | 3686.7      | 3280.7    | 2609.2   |

### Insert into Syncモード 大容量バッチデータ

**マシン構成**

* 1 Front-End (FE): Alibaba Cloud、16コアCPU、64GB RAM、1 x 500GB ESSD PL1クラウドディスク

* 5 Back-End (BE)ノード: Alibaba Cloud、16コアCPU、64GB RAM、1 x 1TB ESSD PL1クラウドディスク。

* 1テストクライアント: Alibaba Cloud、16コアCPU、64GB RAM、1 x 100GB ESSD PL1クラウドディスク

* テストバージョン: Doris-2.1.5

**データセット**

* 1000行のInsert into文: `insert into tbl values(1,1)...` (1000行省略)

**テストツール**

* [Jmeter](https://jmeter.apache.org/)

**テスト手法**

* JMeterを使用してDorisにデータを書き込み。各スレッドはinsert into文を使用して1実行あたり1000行のデータを書き込み。

**テスト結果**

* データ単位: rows per second。

* 以下のテストは30、100、500の同時実行数に分けて実施。

**Syncモード、5 BE、3レプリカでの30同時実行ユーザーのパフォーマンステスト**

| Group commit interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 92.2K     | 85.9K     | 84K     | 83.2K     |

**Syncモード、5 BE、3レプリカでの100同時実行ユーザーのパフォーマンステスト**

| Group commit interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 70.4K     |70.5K     | 73.2K      | 69.4K    |

**Syncモード、5 BE、3レプリカでの500同時実行ユーザーのパフォーマンステスト**

| Group commit interval | 10ms | 20ms | 50ms | 100ms |
|-----------------------|---------------|---------------|---------------|---------------|
|                       | 46.3K      | 47.7K     | 47.4K      | 46.5K      |
