---
{
  "title": "MySQL JDBC カタログ",
  "description": "Doris JDBC カタログ は標準 JDBC インターフェースを介して MySQL データベースへの接続をサポートします。",
  "language": "ja"
}
---
Doris JDBC Catalogは、標準のJDBCインターフェースを介してMySQLデータベースへの接続をサポートします。このドキュメントでは、MySQLデータベース接続の設定方法について説明します。

JDBC Catalogの概要については、以下を参照してください：[JDBC カタログ 概要](./jdbc-catalog-overview.md)

## 使用上の注意

MySQLデータベースに接続するには、以下が必要です：

* MySQL 5.7、8.0、またはそれ以降のバージョン。

* MySQLのJDBCドライバー。[Maven Repository](https://mvnrepository.com/artifact/com.mysql/mysql-connector-j)からダウンロードできます。MySQL Connector/Jバージョン8.0.31以降の使用を推奨します。

* 各Doris FEおよびBEノードとMySQLサーバー間のネットワーク接続。デフォルトポートは3306です。

## MySQLへの接続

```sql
CREATE CATALOG mysql_catalog PROPERTIES (
    'type' = 'jdbc',
    'user' = 'username',
    'password' = 'pwd',
    'jdbc_url' = 'jdbc:mysql://host:3306',
    'driver_url' = 'mysql-connector-j-8.3.0.jar',
    'driver_class' = 'com.mysql.cj.jdbc.Driver'
);
```
`jdbc_url`は、MySQL JDBCドライバに渡される接続情報とパラメータを定義します。サポートされているURLパラメータは[MySQL Developer Guide](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-configuration-properties.html)で確認できます。

### Connection Security

ユーザーがデータソースにグローバルに信頼された証明書がインストールされたTLSを設定している場合、`jdbc_url`プロパティに設定されたJDBC接続文字列にパラメータを追加することで、クラスタとデータソース間でTLSを有効にすることができます。

例えば、`MySQL Connector/J 8.0`の場合、`sslMode`パラメータを使用してTLS経由で接続を保護します。デフォルトでは、このパラメータはPREFERREDに設定されており、サーバが有効になっている場合に接続を保護できます。このパラメータはREQUIREDに設定することもでき、その場合TLSが確立されないと接続が失敗します。

`jdbc_url`に`sslMode`パラメータを追加することで設定できます：

```sql
'jdbc_url' = 'jdbc:mysql://host:3306/?sslMode=REQUIRED'
```
TLS設定オプションの詳細については、[MySQL JDBC Security Documentation](https://dev.mysql.com/doc/connector-j/en/connector-j-connp-props-security.html#cj-conn-prop_sslMode)を参照してください。

## 階層マッピング

MySQLをマッピングする際、DorisのDatabaseはMySQLのDatabaseに対応します。DorisのDatabase配下のTableは、MySQLの該当Database配下のTablesに対応します。マッピング関係は以下の通りです：

| Doris    | MySQL        |
| -------- | ------------ |
| カタログ  | MySQL サーバー |
| Database | Database     |
| Table    | Table        |

## カラムタイプマッピング

| MySQL タイプ                           | Doris タイプ                 | Comment                                                                        |
| ------------------------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| boolean                              | tinyint                    |                                                                                |
| tinyint                              | tinyint                    |                                                                                |
| smallint                             | smallint                   |                                                                                |
| mediumint                            | int                        |                                                                                |
| int                                  | int                        |                                                                                |
| bigint                               | bigint                     |                                                                                |
| unsigned tinyint                     | smallint                   | Dorisはunsignedデータタイプをサポートしていないため、unsignedデータタイプはDorisの対応するより大きなデータタイプにマッピングされます。             |
| unsigned mediumint                   | int                        | 上記と同様。                                                                            |
| unsigned int                         | bigint                     | 上記と同様。                                                                            |
| unsigned bigint                      | largeint                   | 上記と同様。                                                                            |
| float                                | float                      |                                                                                |
| double                               | double                     |                                                                                |
| decimal(P, S)                        | decimal(P, S)              |                                                                                |
| unsigned decimal(P, S)               | decimal(P + 1, S) / string | Dorisがサポートする最大精度を超える場合、Stringで処理されます。このタイプがStringにマッピングされる場合、クエリのみサポートし、MySQLへの書き込みはできないことに注意してください。 |
| date                                 | date                       |                                                                                |
| timestamp(S)                         | datetime(S)                |                                                                                |
| datetime(S)                          | datetime(S)                |                                                                                |
| year                                 | smallint                   | Dorisはyearタイプをサポートしていないため、yearタイプはsmallintにマッピングされます。                                       |
| time                                 | string                     | Dorisはtimeタイプをサポートしていないため、timeタイプはstringにマッピングされます。                                         |
| char                                 | char                       |                                                                                |
| varchar                              | varchar                    |                                                                                |
| json                                 | string                     | 読み取りと計算パフォーマンスのバランスを向上させるため、Dorisはjsonタイプをstringタイプにマッピングします。                                  |
| set                                  | string                     |                                                                                |
| enum                                 | string                     |                                                                                |
| bit                                  | boolean / string           | Dorisはbitタイプをサポートしていないため、bitタイプはbit(1)の場合にbooleanに、その他の場合はstringにマッピングされます。                |
| tinytext, text, mediumtext, longtext | string                     |                                                                                |
| blob, mediumblob, longblob, tinyblob, binary, varbinary | string/varbinary                     |  Catalogの`enable.mapping.varbinary`プロパティによって制御されます（4.0.2以降でサポート）。デフォルトは`false`で`string`にマッピングされ、`true`の場合は`varbinary`タイプにマッピングされます。                                                                              |
| other                                | UNSUPPORTED                |                                                                                |

## 付録

### タイムゾーンの問題

JDBC Catalogを通じてデータにアクセスする際、BEのJNI部分はJVMタイムゾーンを使用します。JVMタイムゾーンはデフォルトでBE展開マシンのタイムゾーンとなり、JDBCがデータを読み取る際のタイムゾーン変換に影響します。タイムゾーンの一貫性を確保するため、`be.conf`の`JAVA_OPTS`でJVMタイムゾーンをDorisセッション変数`time_zone`と一致するよう設定することを推奨します。

MySQLのtimestampタイプを読み取る際は、JDBC URLに`connectionTimeZone=LOCAL`および`forceConnectionTimeZoneToSession=true`パラメータを追加してください。これらのパラメータはMySQL Connector/Jバージョン8以上に適用可能で、読み取り時刻がMySQLサーバーのタイムゾーンではなく、Doris BE JVMタイムゾーンとなることを保証します。

## よくある問題

### 接続例外のトラブルシューティング

* Communications link failure The last packet successfully received from the server was 7 milliseconds ago.

  * 原因：

      * ネットワークの問題：

          * ネットワークの不安定性や接続の中断。

          * クライアントとサーバー間のネットワーク遅延が高い。

      * MySQLサーバー設定

          * MySQLサーバーが`wait_timeout`や`interactive_timeout`などの接続タイムアウトパラメータを設定している可能性があり、タイムアウトにより接続が閉じられる。

      * ファイアウォール設定

          * ファイアウォールルールがクライアントとサーバー間の通信をブロックしている可能性がある。

      * 接続プール設定

          * 接続プールの`connection_pool_max_life_time`設定により、接続が閉じられる、リサイクルされる、または適時に維持されない可能性がある。

      * サーバーリソースの問題

          * MySQLサーバーが新しい接続リクエストを処理するためのリソースが不足している可能性がある。

      * クライアント設定

          * `autoReconnect`パラメータが設定されていない、または不適切に設定されているなど、クライアントJDBCドライバーの設定が不正確。

  * 解決策

      * ネットワーク接続の確認：

          * クライアントとサーバー間の安定したネットワーク接続を確保し、高いネットワーク遅延を回避する。

      * MySQLサーバー設定の確認：

          * MySQLサーバーの`wait_timeout`および`interactive_timeout`パラメータを確認・調整し、適切に設定されていることを確認する。

      * ファイアウォール設定の確認：

          * ファイアウォールルールがクライアントとサーバー間の通信を許可していることを確認する。

      * 接続プール設定の調整：

          * 接続プールの設定パラメータ`connection_pool_max_life_time`を確認・調整し、MySQLの`wait_timeout`および`interactive_timeout`パラメータより小さく、SQLの最長実行時間より大きく設定されていることを確認する。

      * サーバーリソースの監視：

          * MySQLサーバーのリソース使用状況を監視し、接続リクエストを処理するのに十分なリソースがあることを確認する。

      * クライアント設定の最適化：

          * `autoReconnect=true`など、JDBCドライバーの設定パラメータが正しいことを確認し、中断後に接続が自動的に再接続できることを保証する。

* java.io.EOFException MESSAGE: Can not read response from server. Expected to read 819 bytes, read 686 bytes before connection was unexpectedly lost.

  * 原因：接続がMySQLによって強制終了された、またはMySQLがクラッシュした

  * 解決策：MySQLに接続を能動的に強制終了するメカニズムがあるか、または大きなクエリによりMySQLがクラッシュしたかを確認する

### その他の問題

1. MySQL emojiの読み書き時の文字化け

   DorisがMySQLをクエリする際、MySQLのデフォルトutf8エンコーディングはutf8mb3であり、4バイトエンコーディングが必要なemojiを表現できません。ここで、4バイトエンコーディングをサポートするために、MySQLのエンコーディングをutf8mb4に変更する必要があります。

   グローバルに設定項目を変更することができます

   ```text
   Modify the my.ini file in the mysql directory (for Linux systems, it is the my.cnf file in the etc directory)
   [client]
   default-character-set=utf8mb4

   [mysql]
   Set mysql default character set
   default-character-set=utf8mb4

   [mysqld]
   Set mysql character set server
   character-set-server=utf8mb4
   collation-server=utf8mb4_unicode_ci
   init_connect='SET NAMES utf8mb4

   Modify the type of the corresponding table and column
   ALTER TABLE table_name MODIFY colum_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ALTER TABLE table_name CHARSET=utf8mb4;
   SET NAMES utf8mb4
   ```
2. MySQL DATE/DATETIME型の読み取り時の例外

   ```text
   ERROR 1105 (HY000): errCode = 2, detailMessage = (10.16.10.6)[INTERNAL_ERROR]UdfRuntimeException: get next block failed: 
   CAUSED BY: SQLException: Zero date value prohibited
   CAUSED BY: DataReadException: Zero date value prohibited
   ```
JDBCにおいて、不正なDATE/DATETIMEはデフォルトで例外をスローすることで処理されます。この動作はURLパラメータ`zeroDateTimeBehavior`で制御できます。オプションパラメータは`exception`、`convertToNull`、`round`で、それぞれ例外エラー、`NULL`値への変換、`"0001-01-01 00:00:00"`への変換を意味します。

   Catalogを作成する際は、`jdbc_url`の末尾のJDBC接続文字列に`zeroDateTimeBehavior=convertToNull`を追加する必要があります。例：`"jdbc_url" = "jdbc:mysql://127.0.0.1:3306/test?zeroDateTimeBehavior=convertToNull"`。この場合、JDBCは0000-00-00または0000-00-00 00:00:00をnullに変換し、Dorisは現在のCatalogのすべてのDate/DateTime型カラムをnullable型として処理するため、正常に読み取ることができます。

3. MySQL Catalogまたは他のJDBC Catalogを読み取る際にクラス読み込みエラーが発生する場合（例：`failed to load driver class com.mysql.cj.jdbc.driver in either of hikariconfig class loader`）

   これはCatalog作成時に入力された`driver_class`が正しくないために発生し、正しく入力する必要があります。例えば、上記の例は大文字小文字の問題で、`'driver_class' = 'com.mysql.cj.jdbc.Driver'`と入力する必要があります。

4. MySQLを読み取る際の通信リンク例外

  ```text
  ERROR 1105 (HY000): errCode = 2, detailMessage = PoolInitializationException: Failed to initialize pool: Communications link failure

  The last packet successfully received from the server was 7 milliseconds ago.  The last packet sent successfully to the server was 4 milliseconds ago.
  CAUSED BY: CommunicationsException: Communications link failure
      
  The last packet successfully received from the server was 7 milliseconds ago.  The last packet sent successfully to the server was 4 milliseconds ago.
  CAUSED BY: SSLHandshakeException
  ```
beのbe.outログを確認し、以下の情報が含まれているかどうかを確認できます：

  ```
  WARN: Establishing SSL connection without server's identity verification is not recommended. 
  According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. 
  For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. 
  You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
  ```
`jdbc_url`に`useSSL=false`を追加できます。例：`'jdbc_url' = 'jdbc:mysql://127.0.0.1:3306/test?useSSL=false'`

* MySQLから大量のデータをクエリする際、クエリが時々成功し、時々以下のエラーが報告され、このエラーが発生すると、MySQLへのすべての接続が切断されてMySQL Serverに接続できなくなりますが、しばらく後にMySQLは正常に戻ります。ただし、以前の接続は失われています：

  ```text
  ERROR 1105 (HY000): errCode = 2, detailMessage = [INTERNAL_ERROR]UdfRuntimeException: JDBC executor sql has error:
  CAUSED BY: CommunicationsException: Communications link failure
  The last packet successfully received from the server was 4,446 milliseconds ago. The last packet sent successfully to the server was 4,446 milliseconds ago.
  ```
上記の現象が発生した場合、MySQL Serverのメモリまたは CPU リソースが枯渇し、MySQL サービスが利用できなくなっている可能性があります。MySQL サーバー のメモリまたは CPU 設定を増加させることを試すことができます。

* MySQL をクエリする過程で、クエリ結果が MySQL データベースの結果と一致しないことが判明した場合

  まず、クエリフィールドに大文字小文字を区別する状況があるかどうかを確認してください。例えば、Table のフィールド `c_1` に `"aaa"` と `"AAA"` の2つのデータがある場合、MySQL データベースが初期化時に大文字小文字を区別するように指定されていなければ、MySQL はデフォルトで大文字小文字を区別しませんが、Doris は厳密に大文字小文字を区別するため、以下の状況が発生します：

  ```text
  MySQL behavior:
  select count(c_1) from table where c_1 = "aaa"; Does not distinguish case, so the result is: 2

  Doris behavior:
  select count(c_1) from table where c_1 = "aaa"; Strictly distinguishes case, so the result is: 1
  ```
上記の現象が発生した場合は、要件に応じて以下のように調整する必要があります：

  * MySQLクエリで「BINARY」キーワードを追加して大文字小文字を区別するように強制する：`select count(c_1) from table where BINARY c_1 = "aaa";`

  * またはMySQLでTable作成時に指定する：`CREATE TABLE table (c_1 VARCHAR(255) CHARACTER SET binary);`

  * またはMySQLデータベース初期化時に大文字小文字を区別する照合順序ルールを指定する：

		```text
		[mysqld]
		character-set-server=utf8
		collation-server=utf8_bin
		[client]
		default-character-set=utf8
		[mysql]
		default-character-set=utf8
		```
* MySQLをクエリする際、長時間結果が返されずにスタックする、または長時間スタックしてfe.warn.logに大量の書き込みロックログが出力される場合。

  URLにsocketTimeoutを追加することを試してください。例：`jdbc:mysql://host:port/database?socketTimeout=30000`。これにより、MySQLによって閉じられた後にJDBCクライアントが無期限に待機することを防げます。

* MySQL Catalogの使用中に、FEのJVMメモリまたはThreads数が継続的に増加して減少せず、同時にForward to master connection timed outエラーが報告される場合があります

  FEのスレッドスタック`jstack fe_pid > fe.js`を出力し、大量の`mysql-cj-abandoned-connection-cleanup`スレッドが出現する場合、MySQL JDBCドライバーに問題があることを示しています。

  以下のように対処してください：

  * MySQL JDBCドライバーをバージョン8.0.31以上にアップグレードする

  * FEとBEのconfファイルの`JAVA_OPTS`にパラメータ`-Dcom.mysql.cj.disableAbandonedConnectionCleanup=true`を追加してMySQL JDBCドライバーの接続クリーンアップ機能を無効化し、クラスターを再起動する

	注意：Dorisのバージョンが2.0.13以上、または2.1.5以上の場合、このパラメータを追加する必要はありません。DorisはデフォルトでMySQL JDBCドライバーの接続クリーンアップ機能を無効化しているためです。MySQL JDBCドライバーのバージョンを置き換えるだけで済みます。ただし、以前にリークしたスレッドをクリーンアップするためにDorisクラスターを再起動する必要があります。
