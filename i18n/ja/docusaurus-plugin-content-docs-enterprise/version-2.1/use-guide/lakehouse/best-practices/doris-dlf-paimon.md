---
{
  "title": "Aliyun DLF Rest Catalogとの統合",
  "description": "Aliyun Data Lake Formation (DLF) は、クラウドネイティブデータレイクアーキテクチャの中核コンポーネントとして機能します。",
  "language": "ja"
}
---
Aliyun [Data Lake Formation (DLF)](https://www.alibabacloud.com/en/product/datalake-formation) は、クラウドネイティブデータレイクアーキテクチャのコアコンポーネントとして機能し、ユーザーがクラウドネイティブデータレイクアーキテクチャを迅速に構築できるよう支援します。Data Lake Formation は、レイク上での統一メタデータ管理、エンタープライズレベルの権限制御を提供し、複数のコンピューティングエンジンとシームレスに統合することで、データサイロを打破しビジネス価値を引き出します。

- 統一メタデータとストレージ

    コンピューティングエンジンが統一されたレイクメタデータとストレージのセットを共有し、レイクエコシステム製品間のデータフローを可能にします。

- 統一権限管理

    コンピューティングエンジンが統一されたレイクTable権限設定のセットを共有し、一度の設定で複数箇所での有効性を実現します。

- ストレージ最適化

    小ファイルのマージ、期限切れスナップショットのクリーンアップ、パーティション整理、不要ファイルのクリーンアップなどの最適化戦略を提供し、ストレージ効率を向上させます。

- 包括的なクラウドエコシステムサポート

    Alibaba Cloud製品との深い統合により、ストリーミングおよびバッチコンピューティングエンジンを含む即座に利用可能な機能を実現し、ユーザーエクスペリエンスと運用の利便性を向上させます。

DLF バージョン 2.5 以降、Paimon Rest カタログ がサポートされています。Doris は、バージョン 3.1.0 以降、DLF 2.5+ Paimon Rest カタログ との統合をサポートしており、DLF へのシームレスな接続を実現し、Paimon Tableデータへのアクセスと分析を可能にします。この文書では、Apache Doris を使用して DLF 2.5+ に接続し、Paimon Tableデータにアクセスする方法を説明します。

:::tip
この機能は Doris 3.1 以降でサポートされています
:::

## 使用ガイド

### 01 DLF サービスを有効化

DLF 公式ドキュメントを参照して DLF サービスを有効化し、対応する カタログ、Database、Table を作成してください。

### 02 EMR Spark SQL を使用した DLF へのアクセス

- 接続

    ```sql
    spark-sql --master yarn \
        --conf spark.driver.memory=5g \
        --conf spark.sql.defaultCatalog=paimon \
        --conf spark.sql.catalog.paimon=org.apache.paimon.spark.SparkCatalog \
        --conf spark.sql.catalog.paimon.metastore=rest \
        --conf spark.sql.extensions=org.apache.paimon.spark.extensions.PaimonSparkSessionExtensions \
        --conf spark.sql.catalog.paimon.uri=http://<region>-vpc.dlf.aliyuncs.com \
        --conf spark.sql.catalog.paimon.warehouse=<your-catalog-name> \
        --conf spark.sql.catalog.paimon.token.provider=dlf \
        --conf spark.sql.catalog.paimon.dlf.token-loader=ecs
    ```
> 対応する`warehouse`と`uri`アドレスを置き換えてください。

- データの書き込み

    ```sql
    USE <your-catalog-name>;

    CREATE TABLE users_samples
    (
        user_id INT,             
        age_level STRING,           
        final_gender_code STRING,    
        clk BOOLEAN
    );

    INSERT INTO users_samples VALUES
    (1, '25-34', 'M', true),
    (2, '18-24', 'F', false);

    INSERT INTO users_samples VALUES
    (3, '25-34', 'M', true),
    (4, '18-24', 'F', false);

    INSERT INTO users_samples VALUES
    (5, '25-34', 'M', true),
    (6, '18-24', 'F', false);
    ```
以下のエラーが発生した場合は、`/opt/apps/PAIMON/paimon-dlf-2.5/lib/spark3`から`paimon-jindo-x.y.z.jar`を削除し、Sparkサービスを再起動してから再試行してください。

    ```
    Ambiguous FileIO classes are:
    org.apache.paimon.jindo.JindoLoader
    org.apache.paimon.oss.OSSLoader
    ```
### 03 DorisをDLFに接続する

- Paimon Catalogを作成する

    ```sql
    CREATE CATALOG paimon_dlf_test PROPERTIES (
        'type' = 'paimon',
        'paimon.catalog.type' = 'rest',
        'uri' = 'http://<region>-vpc.dlf.aliyuncs.com',
        'warehouse' = '<your-catalog-name>',
        'paimon.rest.token.provider' = 'dlf',
        'paimon.rest.dlf.access-key-id' = '<ak>',
        'paimon.rest.dlf.access-key-secret' = '<sk>'
    );
    ```
- Dorisは、DLFから返される一時的な認証情報を使用してOSSオブジェクトストレージにアクセスし、追加のOSS認証情報は必要ありません。
    - 同一VPC内でのDLFアクセスのみをサポートしているため、正しいuriアドレスを提供してください。

- データのクエリ

    ```sql
    SELECT * FROM users_samples ORDER BY user_id;
    +---------+-----------+-------------------+------+
    | user_id | age_level | final_gender_code | clk  |
    +---------+-----------+-------------------+------+
    |       1 | 25-34     | M                 |    1 |
    |       2 | 18-24     | F                 |    0 |
    |       3 | 25-34     | M                 |    1 |
    |       4 | 18-24     | F                 |    0 |
    |       5 | 25-34     | M                 |    1 |
    |       6 | 18-24     | F                 |    0 |
    +---------+-----------+-------------------+------+
    ```
- Query システム Tables

    ```sql
    SELECT snapshot_id, commit_time, total_record_count FROM users_samples$snapshots;
    +-------------+-------------------------+--------------------+
    | snapshot_id | commit_time             | total_record_count |
    +-------------+-------------------------+--------------------+
    |           1 | 2025-08-09 05:56:02.906 |                  2 |
    |           2 | 2025-08-13 03:41:32.732 |                  4 |
    |           3 | 2025-08-13 03:41:35.218 |                  6 |
    +-------------+-------------------------+--------------------+
    ```
- バッチ増分読み取り

    ```sql
    SELECT * FROM users_samples@incr('startSnapshotId'=1, 'endSnapshotId'=2) ORDER BY user_id;
    +---------+-----------+-------------------+------+
    | user_id | age_level | final_gender_code | clk  |
    +---------+-----------+-------------------+------+
    |       3 | 25-34     | M                 |    1 |
    |       4 | 18-24     | F                 |    0 |
    +---------+-----------+-------------------+------+
    ```
