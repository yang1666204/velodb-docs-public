---
{
  "title": "AutoMQ Load",
  "description": "AutoMQは、S3などのオブジェクトストレージにストレージを分離することで、Kafkaをクラウドネイティブ化したフォークです。",
  "language": "ja"
}
---
[AutoMQ](https://github.com/AutoMQ/automq)は、S3などのオブジェクトストレージにストレージを分離することでKafkaをクラウドネイティブ化したフォークです。Apache Kafka®との100%の互換性を維持しながら、最大10倍のコスト効率性と100倍のエラスティシティをユーザーに提供します。革新的な共有ストレージアーキテクチャにより、数秒でのパーティション再割り当て、セルフバランシング、オートスケーリングなどの機能を実現し、高スループットと低レイテンシを保証します。
![AutoMQ Storage Architecture](/images/automq/automq-storage-architecture.png)

本記事では、Apache DorisのRoutine Loadを使用してAutoMQからDorisにデータをインポートする方法について説明します。Routine Loadの詳細については、[Routine Load](https://doris.apache.org/docs/data-operate/import/routine-load-manual/)ドキュメントを参照してください。

## 環境準備
### Apache Dorisとテストデータの準備

動作するApache Dorisクラスターがすでに設定されていることを確認してください。デモンストレーションの目的で、Quick Startedドキュメントに従ってLinux上にテスト用のApache Doris環境をデプロイしました。
データベースとテストテーブルを作成します：

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

[AutoMQ Releases](https://github.com/AutoMQ/automq)から最新のTGZパッケージをダウンロードし、展開してください。展開ディレクトリを$AUTOMQ_HOMEとすると、本記事では$AUTOMQ_HOME/bin配下のスクリプトを使用してトピックを作成し、テストデータを生成します。

### AutoMQとテストデータの準備

AutoMQの[公式デプロイメントドキュメント](https://docs.automq.com/docs/automq-opensource/EvqhwAkpriAomHklOUzcUtybn7g)を参照して機能するクラスターをデプロイし、AutoMQとApache Doris間のネットワーク接続を確保してください。
以下の手順に従って、AutoMQでexample_topicという名前のトピックを素早く作成し、テストJSONデータを書き込みます。

**トピック作成**

AutoMQ内のApache Kafka®コマンドラインツールを使用してトピックを作成します。Kafka環境へのアクセス権があり、Kafkaサービスが実行されていることを確認してください。トピックを作成するコマンドの例は以下の通りです：

```
$AUTOMQ_HOME/bin/kafka-topics.sh --create --topic exampleto_topic --bootstrap-server 127.0.0.1:9092  --partitions 1 --replication-factor 1
```
> Tips: コマンドを実行する際は、`topic`と`bootstarp-server`を実際のAutoMQ Bootstrap Serverアドレスに置き換えてください。

トピック作成後、以下のコマンドを使用してトピックが正常に作成されたことを確認できます。

```
$AUTOMQ_HOME/bin/kafka-topics.sh --describe example_topic --bootstrap-server 127.0.0.1:9092
```
**テストデータの生成**

先ほど言及したテーブルに対応するJSON形式のテストデータエントリを作成します。

```
{
  "id": 1,
  "name": "testuser",
  "timestamp": "2023-11-10T12:00:00",
  "status": "active"
}
```
**テストデータの書き込み**

Kafkaのコマンドラインツールまたはプログラミングによるアプローチを使用して、`example_topic`という名前のトピックにテストデータを書き込みます。以下はコマンドラインツールを使用した例です：

```
echo '{"id": 1, "name": "testuser", "timestamp": "2023-11-10T12:00:00", "status": "active"}' | sh kafka-console-producer.sh --broker-list 127.0.0.1:9092 --topic example_topic
```
トピックに書き込まれたデータを表示するには、以下のコマンドを使用してください:

```
sh $AUTOMQ_HOME/bin/kafka-console-consumer.sh --bootstrap-server 127.0.0.1:9092 --topic example_topic --from-beginning
```
> Tips: コマンドを実行する際は、`topic`と`bootstarp-server`を実際のAutoMQ Bootstrap Serverアドレスに置き換えてください。

## Routine Loadインポートジョブの作成

Apache Dorisコマンドラインで、JSONデータを受け入れてAutoMQ Kafkaトピックからデータを継続的にインポートするRoutine Loadジョブを作成します。Routine Loadの詳細なパラメータ情報については、[Doris Routine Load]を参照してください。

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
> ヒント: コマンドを実行する際は、kafka_broker_listを実際のAutoMQ Bootstrap Serverアドレスに置き換える必要があります。

## データインポートの検証

まず、Routine Loadインポートジョブのステータスを確認して、タスクが実行されていることを確認します。

```
show routine load\G;
```
その後、Apache Dorisデータベースの関連テーブルをクエリすると、データが正常にインポートされていることが確認できます。

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
