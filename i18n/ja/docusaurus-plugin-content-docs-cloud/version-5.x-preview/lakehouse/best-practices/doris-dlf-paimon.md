---
{
  "title": "Aliyun DLF Rest Catalogとの統合",
  "description": "Aliyun Data Lake Formation (DLF) は、クラウドネイティブデータレイクアーキテクチャの中核コンポーネントとして機能し、",
  "language": "ja"
}
---
Aliyun [Data Lake Formation (DLF)](https://www.alibabacloud.com/en/product/datalake-formation) は、クラウドネイティブデータレイクアーキテクチャの中核コンポーネントとして機能し、ユーザーがクラウドネイティブデータレイクアーキテクチャを迅速に構築することを支援します。Data Lake Formation は、レイク上での統一メタデータ管理、エンタープライズレベルの権限制御を提供し、複数のコンピューティングエンジンとシームレスに統合してデータサイロを打破し、ビジネス価値を引き出します。

- 統一メタデータとストレージ

    コンピューティングエンジンは統一されたレイクメタデータとストレージセットを共有し、レイクエコシステム製品間でのデータフローを可能にします。

- 統一権限管理

    コンピューティングエンジンは統一されたレイクテーブル権限設定セットを共有し、一度の設定で複数箇所での有効性を実現します。

- ストレージ最適化

    小さなファイルの統合、期限切れスナップショットのクリーンアップ、パーティション整理、廃止ファイルのクリーンアップなどの最適化戦略を提供し、ストレージ効率を向上させます。

- 包括的なクラウドエコシステムサポート

    ストリーミングおよびバッチコンピューティングエンジンを含むAlibaba Cloud製品との深い統合により、すぐに使用可能な機能を実現し、ユーザーエクスペリエンスと運用の利便性を向上させます。

DLF バージョン2.5から、Paimon Rest Catalog がサポートされています。Doris は、バージョン3.1.0以降、DLF 2.5+ Paimon Rest Catalog との統合をサポートし、DLFへのシームレスな接続によるPaimonテーブルデータのアクセスと分析を可能にします。本ドキュメントでは、Apache Doris を使用してDLF 2.5+に接続し、Paimonテーブルデータにアクセスする方法を説明します。

:::tip
この機能はDoris 3.1以降でサポートされています
:::

## 使用ガイド

### 01 DLFサービスの有効化

DLFサービスを有効化し、対応するCatalog、Database、Tableを作成するには、DLF公式ドキュメントを参照してください。

### 02 EMR Spark SQL を使用したDLFへのアクセス

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
次のエラーが発生した場合は、`/opt/apps/PAIMON/paimon-dlf-2.5/lib/spark3`から`paimon-jindo-x.y.z.jar`を削除し、Sparkサービスを再起動してから再試行してください。

    ```
    Ambiguous FileIO classes are:
    org.apache.paimon.jindo.JindoLoader
    org.apache.paimon.oss.OSSLoader
    ```
### 03 DorisをDLFに接続

- Paimon Catalogを作成

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
- DorisはDLFから返される一時的な認証情報を使用してOSSオブジェクトストレージにアクセスし、追加のOSS認証情報は必要ありません。
    - 同一VPC内でのDLFアクセスのみをサポートします。正しいuriアドレスを提供してください。

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
- システムテーブルのクエリ

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
- Batch Incremental Reading

    ```sql
    SELECT * FROM users_samples@incr('startSnapshotId'=1, 'endSnapshotId'=2) ORDER BY user_id;
    +---------+-----------+-------------------+------+
    | user_id | age_level | final_gender_code | clk  |
    +---------+-----------+-------------------+------+
    |       3 | 25-34     | M                 |    1 |
    |       4 | 18-24     | F                 |    0 |
    +---------+-----------+-------------------+------+
    ```
