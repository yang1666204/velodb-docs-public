---
{
  "title": "AutoMQ Load",
  "description": "AutoMQは、S3のようなオブジェクトストレージにストレージを分離することで実現されたKafkaのクラウドネイティブフォークです。",
  "language": "ja"
}
---
# AutoMQ Load

[AutoMQ](https://github.com/AutoMQ/automq)は、ストレージをS3などのオブジェクトストレージに分離することでKafkaをクラウドネイティブ化したフォークです。Apache Kafka®との100%の互換性を維持しながら、ユーザーに最大10倍のコスト効率性と100倍の弾力性を提供します。革新的な共有ストレージアーキテクチャにより、高スループットと低レイテンシを確保しながら、数秒でのパーティション再割り当て、自動負荷分散、オートスケーリングなどの機能を実現しています。
![AutoMQ Storage Architecture](/images/cloud/integration/more/automq-storage-architecture.png)

この記事では、Apache Doris Routine Loadを使用してAutoMQからDorisにデータをインポートする方法を説明します。Routine Loadの詳細については、[Routine Load](../../user-guide/data-operate/import/import-way/routine-load-manual)のドキュメントを参照してください。

## 環境準備
### Apache Dorisとテストデータの準備

動作するApache Dorisクラスターがすでに設定されていることを確認してください。デモンストレーションの目的で、[Quick Started](../../getting-started/quick-start)のドキュメントに従って、Linux上にテスト用のApache Doris環境をデプロイしました。
データベースとテストTableを作成します：

```
create database automq_db;
CREATE TABLE automq_db.users (
                                 id bigint NOT NULL,
                                 name string NOT NULL,
                                 timestamp string NULL,
                                 status string NULL

) DISTRIBUTED BY hash (id) PROPERTIES ('replication_num' = '1');
```
### Kafka Command Line Tools の準備

[AutoMQ Releases](https://github.com/AutoMQ/automq)から最新のTGZパッケージをダウンロードして展開します。展開ディレクトリを$AUTOMQ_HOMEと仮定すると、この記事では$AUTOMQ_HOME/bin配下のスクリプトを使用してトピックの作成とテストデータの生成を行います。

### AutoMQとテストデータの準備

AutoMQの[公式デプロイメントドキュメント](https://docs.automq.com/docs/automq-opensource/EvqhwAkpriAomHklOUzcUtybn7g)を参照して機能的なクラスターをデプロイし、AutoMQとApache Doris間のネットワーク接続が確保されていることを確認します。
以下の手順に従って、AutoMQでexample_topicという名前のトピックを素早く作成し、テスト用のJSONデータを書き込みます。

**トピックの作成**

AutoMQのApache Kafka®コマンドラインツールを使用してトピックを作成します。Kafka環境にアクセス可能で、Kafkaサービスが実行されていることを確認してください。以下はトピックを作成するコマンドの例です：

```
$AUTOMQ_HOME/bin/kafka-topics.sh --create --topic exampleto_topic --bootstrap-server 127.0.0.1:9092  --partitions 1 --replication-factor 1
```
> Tips: コマンドを実行する際は、`topic` と `bootstarp-server` を実際の AutoMQ Bootstrap サーバー アドレスに置き換えてください。

トピック作成後、以下のコマンドを使用してトピックが正常に作成されたことを確認できます。

```
$AUTOMQ_HOME/bin/kafka-topics.sh --describe example_topic --bootstrap-server 127.0.0.1:9092
```
**テストデータの生成**

先ほど言及したTableに対応する、JSON形式のテストデータエントリを作成します。

```
{
  "id": 1,
  "name": "testuser",
  "timestamp": "2023-11-10T12:00:00",
  "status": "active"
}
```
**テストデータの書き込み**

Kafkaのコマンドラインツールまたはプログラミングアプローチを使用して、`example_topic`という名前のトピックにテストデータを書き込みます。以下はコマンドラインツールを使用した例です：

```
echo '{"id": 1, "name": "testuser", "timestamp": "2023-11-10T12:00:00", "status": "active"}' | sh kafka-console-producer.sh --broker-list 127.0.0.1:9092 --topic example_topic
```
トピックに書き込まれたデータを確認するには、以下のコマンドを使用してください：

```
sh $AUTOMQ_HOME/bin/kafka-console-consumer.sh --bootstrap-server 127.0.0.1:9092 --topic example_topic --from-beginning
```
> Tips: コマンドを実行する際は、`topic`と`bootstarp-server`を実際のAutoMQ Bootstrap Serverアドレスに置き換えてください。

## Routine Loadインポートジョブの作成

Apache Dorisコマンドラインで、AutoMQ Kafkaトピックからデータを継続的にインポートするためにJSONデータを受け入れるRoutine Loadジョブを作成します。Routine Loadの詳細なパラメータ情報については、[Doris Routine Load]を参照してください。

```
CREATE ROUTINE LOAD automq_example_load ON users
COLUMNS(id, name, timestamp, status)
PROPERTIES
(
    "format" = "json",
    "jsonpaths" = "[\"$.id\",\"$.name\",\"$.timestamp\",\"$.status\"]"
 )
FROM KAFKA
(
    "kafka_broker_list" = "127.0.0.1:9092",
    "kafka_topic" = "example_topic",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```
> Tips: コマンドを実行する際は、kafka_broker_listを実際のAutoMQ Bootstrap Serverアドレスに置き換える必要があります。

## データインポートの確認

まず、Routine Loadインポートジョブのステータスを確認して、タスクが実行中であることを確認します。

```
show routine load\G;
```
Apache Doris データベースの関連するTableをクエリすると、データが正常にインポートされていることが確認できます。

```
select * from users;
+------+--------------+---------------------+--------+
| id   | name         | timestamp           | status |
+------+--------------+---------------------+--------+
|    1 | testuser     | 2023-11-10T12:00:00 | active |
|    2 | testuser     | 2023-11-10T12:00:00 | active |
+------+--------------+---------------------+--------+
2 rows in set (0.01 sec)
```
