---
{
  "title": "BI FAQ",
  "description": "通常、これはPower BIがデータソースのタイムアウト時間を取得していることを示しています。データソースサーバーとデータベースを入力する際に、詳細オプションをクリックしてください。",
  "language": "ja"
}
---
## Power BI

### Q1. JDBCを使用してDesktop Power BIにデータを取り込む際にエラーが発生する。「Timeout expired. The timeout period elapsed prior to completion of the operation or the server is not responding」。

通常、これはPower BIがデータソースのタイムアウト時間を取得している状態です。データソースサーバーとデータベースを入力する際に、詳細オプションをクリックしてください。そこにタイムアウト時間があるので、時間をより高く設定してください。

### Q2. 2.1.xバージョンでJDBCを使用してPower BIに接続する際に、「An error happened while reading data from the provider: the given key was not present in the dictionary」エラーが発生する。

まずデータベースで「show collation」を実行してください。一般的に、utf8mb4_900_binのみが表示され、charsetはutf8mb4です。このエラーの主な原因は、Power BIに接続する際にID 33を見つける必要があることです。つまり、Table内の33idsを持つ行が必要で、バージョン2.1.5以降にアップグレードする必要があります。

### Q3. Doris接続時のエラー「Reading data from the provider times error index and count must refer to the location within the string」。

問題の原因は、接続プロセス中にグローバルパラメータが読み込まれ、SQLカラム名と値が同じであることです。

```
SELECT
@@max_allowed_packet  as max_allowed_packet, @@character_set_client ,@@character_set_connection ,
@@license,@@sql_mode ,@@lower_case_table_names , @@autocommit ;
```
新しいoptimizerは現在のバージョンでオフにするか、バージョン2.0.7または2.1.6以降にアップグレードすることができます。

### Q4. JDBC接続でバージョン2.1.xのエラーメッセージ「Character set 'utf8mb3' is not supported by.net.Framework」

この問題はバージョン2.1.xで頻繁に発生します。この問題が発生した場合は、JDBC Driverを8.0.32にアップグレードする必要があります。

## Tableau

### Q1. バージョン2.0.xでTableauがエラーコード37CE01A3でデータソースに接続できないと報告される

現在のバージョンで新しいoptimizerをオフにするか、2.0.7以降にアップグレードしてください

### Q2. SSL接続エラー：protocol version mismatch Failed to connect to the MySQL server

このエラーの原因は、DorisでSSL認証が有効になっているにも関わらず、接続時にSSL接続が使用されていないことです。fe.confのenable_ssl変数を無効にする必要があります。

### Q3. 接続エラー Unsupported command(COM_STMT_PREPARED)

MySQLドライバーのバージョンが不適切にインストールされています。代わりにMySQL 5.1.x接続ドライバーをインストールしてください。
