---
{
  "title": "読み込みの概要",
  "description": "Apache Dorisは、データのインポートと統合のためのさまざまな方法を提供しており、様々なソースからデータベースにデータをインポートすることができます。",
  "language": "ja"
}
---
Apache Dorisはデータのインポートと統合のための様々な方法を提供しており、様々なソースからデータベースにデータをインポートすることができます。これらの方法は4つのタイプに分類できます：

- **リアルタイム書き込み**: HTTPまたはJDBC経由でリアルタイムにDorisテーブルにデータが書き込まれ、即座の分析とクエリが必要なシナリオに適しています。

    - 少量のデータ（5分に1回）の場合、[JDBC INSERT](./import-way/insert-into-manual.md)を使用できます。

    - より高い同時実行性や頻度（20以上の同時書き込みまたは1分間に複数の書き込み）の場合、[Group Commit](./group-commit-manual.md)を有効にしてJDBC INSERTまたはStream Loadを使用できます。

    - 高スループットの場合、HTTP経由で[Stream Load](./import-way/stream-load-manual)を使用できます。

- **ストリーミング同期**: リアルタイムデータストリーム（例：Flink、Kafka、トランザクションデータベース）をDorisテーブルにインポートし、リアルタイム分析とクエリに最適です。

    - Flink Doris Connectorを使用してFlinkのリアルタイムデータストリームをDorisに書き込むことができます。

    - Kafkaのリアルタイムデータストリームには[Routine Load](./import-way/routine-load-manual.md)またはDoris Kafka Connectorを使用できます。Routine LoadはKafkaからDorisにデータをプルし、CSVとJSON形式をサポートします。一方、Kafka ConnectorはDorisにデータを書き込み、Avro、JSON、CSV、Protobuf形式をサポートします。

    - Flink CDCまたはDataxを使用してトランザクションデータベースのCDCデータストリームをDorisに書き込むことができます。

- **バッチインポート**: 外部ストレージシステム（例：Object Storage、HDFS、ローカルファイル、NAS）からDorisテーブルにデータをバッチロードし、非リアルタイムデータインポートのニーズに適しています。

    - [Broker Load](./import-way/broker-load-manual.md)を使用してObject StorageとHDFSからファイルをDorisに書き込むことができます。

    - [INSERT INTO SELECT](./import-way/insert-into-manual.md)を使用してObject Storage、HDFS、NASからファイルをDorisに同期的にロードでき、JOBを使用して非同期的に操作を実行することもできます。

    - [Stream Load](./import-way/stream-load-manual)またはDoris Streamloaderを使用してローカルファイルをDorisに書き込むことができます。

- **外部データソース統合**: 外部ソース（例：Hive、JDBC、Iceberg）からデータをクエリし、部分的にDorisテーブルにインポートします。

    - [Catalog](../../lakehouse/lakehouse-overview.md)を作成して外部ソースからデータを読み取り、[INSERT INTO SELECT](./import-way/insert-into-manual.md)を使用してこのデータをDorisに同期し、JOB経由で非同期実行することができます。

Dorisの各インポート方法は、デフォルトで暗黙的なトランザクションです。トランザクションの詳細については、[Transactions](../transaction.md)を参照してください。

### インポート方法の概要

Dorisのインポートプロセスは主に、データソース、データ形式、インポート方法、エラー処理、データ変換、トランザクションなどの様々な側面を含みます。以下の表で、各インポート方法に適したシナリオとサポートされているファイル形式を素早く確認できます。

| インポート方法                                      | 使用ケース                                   | サポートされているファイル形式 | インポートモード |
| :-------------------------------------------- | :----------------------------------------- | ----------------------- | -------- |
| [Stream Load](./import-way/stream-load-manual)           | HTTP経由でローカルファイルをインポートまたはアプリケーションでデータをプッシュ。                             | csv, json, parquet, orc | 同期     |
| [Broker Load](./import-way/broker-load-manual.md)        | オブジェクトストレージ、HDFSなどからインポート。                     | csv, json, parquet, orc | 非同期     |
| [INSERT INTO VALUES](./import-way/insert-into-manual.md) | JDBC経由でデータを書き込み。 | SQL                     | 同期     |
| [INSERT INTO SELECT](./import-way/insert-into-manual.md) | カタログ内のテーブルやObject Storage、HDFSのファイルなどの外部ソースからインポート。      | SQL                     | 同期、Job経由で非同期     |
| [Routine Load](./import-way/routine-load-manual.md)      | Kafkaからリアルタイムインポート                            | csv, json               | 非同期     |
| [MySQL Load](./import-way/mysql-load-manual.md)          | ローカルファイルからインポート。                             | csv                     | 同期     |
| [Group Commit](./group-commit-manual.md)          | 高頻度での書き込み。                            | 使用されるインポート方法に依存 | -     |
