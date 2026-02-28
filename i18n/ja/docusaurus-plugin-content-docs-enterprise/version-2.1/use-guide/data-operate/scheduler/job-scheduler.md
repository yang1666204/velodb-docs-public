---
{
  "title": "ジョブScheduler | Scheduler",
  "description": "より洗練されたデータ管理ニーズの文脈において、スケジュールされたタスクは重要な役割を果たします。",
  "language": "ja"
}
---
# Job Scheduler

## 背景

データ管理のニーズがますます高度化する中で、スケジュールタスクは重要な役割を果たします。一般的に以下のシナリオで適用されます：

- **定期的なデータ更新：** 定期的なデータインポートとETL操作により手動介入を削減し、データ処理の効率性と精度を向上させます。
- **カタログ統合：** 外部データソースの定期的な同期により、複数ソースのデータをターゲットシステムに効率的かつ正確に統合し、複雑なビジネス分析要件を満たします。
- **データクリーンアップ：** 期限切れ・無効なデータの定期的なクリーニングによりストレージ容量を解放し、過度な古いデータによるパフォーマンス問題を防止します。

Apache Dorisの以前のバージョンでは、上記の要件を満たすために外部スケジューリングシステム（ビジネスコードベースのスケジューリングやサードパーティスケジューリングツール、分散スケジューリングプラットフォームなど）に依存することが多くありました。しかし、これらの外部システムはDorisの柔軟なスケジューリング戦略やリソース管理のニーズを満たさない場合があります。さらに、外部スケジューリングシステムの障害はビジネスリスクを増大させ、追加のメンテナンス時間と労力を必要とします。

## Job Scheduler

これらの問題に対処するため、Apache Dorisはバージョン2.1でJob Scheduler機能を導入し、秒レベルの精度で自律的なタスクスケジューリングを可能にしました。

この機能はデータインポートの完全性と一貫性を保証しながら、ユーザーが柔軟かつ便利にスケジューリング戦略を調整できるようにします。外部システムへの依存を削減することで、システム障害リスクとメンテナンスコストも軽減し、より統一された信頼性の高いユーザーエクスペリエンスを提供します。

## Doris Job Schedulerの機能

Doris Job Schedulerは事前設定されたスケジュールに基づいて動作するタスク管理システムで、特定の時間や間隔で事前定義された操作をトリガーし、自動化されたタスク実行を行います。主要機能は以下のとおりです：

- **効率的なスケジューリング：** 指定された間隔内でタスクとイベントをスケジュールでき、効率的なデータ処理を保証します。タイムホイールアルゴリズムにより精密な秒レベルトリガーを実現します。
- **柔軟なスケジューリング：** 分、時間、日、週単位でのスケジューリングなど、複数のスケジューリングオプションが利用可能です。一回限りのスケジューリングと繰り返し（循環）イベントスケジューリングをサポートし、循環スケジュールの開始時刻と終了時刻をカスタマイズできます。
- **イベントプールと高性能処理キュー：** Disruptorを使用して実装され、高性能なプロデューサー・コンシューマーモデルを実現し、タスク実行のオーバーヘッドを最小化します。
- **追跡可能なスケジューリング記録：** 最新のタスク実行記録を保存し（設定可能）、シンプルなコマンドで表示できるため、トレーサビリティを保証します。
- **高可用性：** Dorisの高可用性メカニズムを活用することで、Job Schedulerは容易に自己回復と高可用性を実現できます。

**関連ドキュメント：** CREATE-JOB

## 構文概要

有効なJob文には以下のコンポーネントが含まれている必要があります：

- **CREATE JOB：** ジョブ名が必要で、データベース内でイベントを一意に識別します。
- **ON SCHEDULE句：** ジョブタイプ、トリガー時間、および頻度を指定します。
    - **AT timestamp：** 一回限りのイベント用。指定された日時にジョブを一度実行します。**AT current_timestamp**は現在の日時を指定します。ジョブは作成と同時に実行され、非同期タスクの作成に使用できます。
    - **EVERY interval：** 定期ジョブ用で、実行頻度を指定します。キーワードには**WEEK**、**DAY**、**HOUR**、**MINUTE**があります。
        - **Interval：** 実行頻度を定義します。例：**1 DAY**で毎日、**1 HOUR**で毎時、**1 MINUTE**で毎分、**1 WEEK**で毎週。
        - **STARTS句（オプション）：** 繰り返し間隔の開始時間を指定します。**CURRENT_TIMESTAMP**は現在の日時を設定します。ジョブは作成と同時に実行されます。
        - **ENDS句（オプション）：** ジョブイベントの終了時間を指定します。
- **DO句：** ジョブがトリガーされた時に実行する操作を指定します。現在は**INSERT**文をサポートしています。

```sql 
CREATE
JOB
  job_name
  ON SCHEDULE schedule
  [COMMENT 'string']
  DO execute_sql;

schedule: {
    AT timestamp
    | EVERY interval
    [STARTS timestamp ]
    [ENDS timestamp ]
}
interval:
    quantity { WEEK |DAY | HOUR | MINUTE}
```
## 使用例

```sql
CREATE JOB my_job ON SCHEDULE EVERY 1 MINUTE DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2;
```
これは「my_job」という名前のジョブを作成し、毎分実行してdb2.tbl2からdb1.tbl1にデータをインポートします。

ワンタイムジョブの作成：

```sql
CREATE JOB my_job ON SCHEDULE AT '2025-01-01 00:00:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2;
```
これは "my_job" という名前のジョブを作成し、2025-01-01 00:00:00 に一度実行され、db2.tbl2 からdb1.tbl1 にデータをインポートします。

終了時刻のない定期ジョブの作成：

```sql

CREATE JOB my_job ON SCHEDULE EVERY 1 DAY STARTS '2025-01-01 00:00:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2 WHERE create_time >= days_add(now(), -1);
```
これにより、2025-01-01 00:00:00に開始し毎日実行される"my_job"という名前のジョブが作成され、db2.tbl2からdb1.tbl1にデータをインポートします。

終了時間を指定した定期ジョブの作成：

```sql
CREATE JOB my_job ON SCHEDULE EVERY 1 DAY STARTS '2025-01-01 00:00:00' ENDS '2026-01-01 00:10:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2 WHERE create_time >= days_add(now(), -1);
```
これにより、2025-01-01 00:00:00に開始し、毎日実行され、2026-01-01 00:10:00に終了する"my_job"という名前のジョブが作成され、db2.tbl2からdb1.tbl1にデータをインポートします。

Job を非同期実行に使用する場合:

```sql
CREATE JOB my_job ON SCHEDULE AT current_timestamp DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2;
```
DorisのジョブはSyncタスクとして作成されますが非同期で実行されるため、この例では開始時間を現在時刻とする一回限りのタスクとしてジョブを設定しており、insert into selectのような非同期タスクに適しています。
## Job SchedulerとCatalogによる自動データ同期
例えば、Eコマースのシナリオでは、ユーザーはMySQLからビジネスデータを抽出してDorisに同期し、データ分析を行って精密なマーケティング活動をサポートする必要があることがよくあります。Job SchedulerとMulti Catalog機能を組み合わせることで、データソース間の定期的なデータ同期を効率的に実現できます。

```sql
CREATE TABLE IF NOT EXISTS user.activity (
     `user_id` INT NOT NULL,
     `date` DATE NOT NULL,
     `city` VARCHAR(20),
    `age` SMALLINT,
    `sex` TINYINT,
    `last_visit_date` DATETIME DEFAULT '1970-01-01 00:00:00',
    `cost` BIGINT DEFAULT '0',
    `max_dwell_time` INT DEFAULT '0',
    `min_dwell_time` INT DEFAULT '99999'
);
INSERT INTO user.activity VALUES
    (10000, '2017-10-01', 'Beijing', 20, 0, '2017-10-01 06:00:00', 20, 10, 10),
    (10000, '2017-10-01', 'Beijing', 20, 0, '2017-10-01 07:00:00', 15, 2, 2),
    (10001, '2017-10-01', 'Beijing', 30, 1, '2017-10-01 17:05:00', 2, 22, 22),
    (10002, '2017-10-02', 'Shanghai', 20, 1, '2017-10-02 12:59:00', 200, 5, 5),
    (10003, '2017-10-02', 'Guangzhou', 32, 0, '2017-10-02 11:20:00', 30, 11, 11),
    (10004, '2017-10-01', 'Shenzhen', 35, 0, '2017-10-01 10:00:00', 100, 3, 3),
    (10004, '2017-10-03', 'Shenzhen', 35, 0, '2017-10-03 10:20:00', 11, 6, 6);
```
| user\_id | date       | city      | age  | sex  | last\_visit\_date   | cost | max\_dwell\_time | min\_dwell\_time |
| -------- | ---------- | --------- | ---- | ---- | ------------------- | ---- | ---------------- | ---------------- |
| 10000    | 2017-10-01 | Beijing   | 20   | 0    | 2017-10-01 06:00    | 20   | 10               | 10               |
| 10000    | 2017-10-01 | Beijing   | 20   | 0    | 2017-10-01 07:00    | 15   | 2                | 2                |
| 10001    | 2017-10-01 | Beijing   | 30   | 1    | 2017-10-01 17:05:45 | 2    | 22               | 22               |
| 10002    | 2017-10-02 | Shanghai  | 20   | 1    | 2017-10-02 12:59:12 | 200  | 5                | 5                |
| 10003    | 2017-10-02 | Guangzhou | 32   | 0    | 2017-10-02 11:20:00 | 30   | 11               | 11               |
| 10004    | 2017-10-01 | Shenzhen  | 35   | 0    | 2017-10-01 10:00:15 | 100  | 3                | 3                |
| 10004    | 2017-10-03 | Shenzhen  | 35   | 0    | 2017-10-03 10:20:22 | 11   | 6                | 6                |


ワークフローの例
1. DorisTableの作成:

```sql
CREATE TABLE IF NOT EXISTS user_activity (
  `user_id` LARGEINT NOT NULL COMMENT "User ID",
  `date` DATE NOT NULL COMMENT "Data import date",
  `city` VARCHAR(20) COMMENT "User city",
  `age` SMALLINT COMMENT "User age",
  `sex` TINYINT COMMENT "User gender",
  `last_visit_date` DATETIME REPLACE DEFAULT "1970-01-01 00:00:00" COMMENT "Last visit date",
  `cost` BIGINT SUM DEFAULT "0" COMMENT "Total spending",
  `max_dwell_time` INT MAX DEFAULT "0" COMMENT "Max dwell time",
  `min_dwell_time` INT MIN DEFAULT "99999" COMMENT "Min dwell time"
) AGGREGATE KEY(`user_id`, `date`, `city`, `age`, `sex`)
DISTRIBUTED BY HASH(`user_id`) BUCKETS 1
PROPERTIES (
  "replication_allocation" = "tag.location.default: 1"
);
```
2. MySQL データベース用の カタログ の作成:

```sql
CREATE CATALOG activity PROPERTIES (
  "type"="jdbc",
  "user"="root",
  "password"="123456",
  "jdbc_url" = "jdbc:mysql://127.0.0.1:3306/user?useSSL=false",
  "driver_url" = "mysql-connector-java-5.1.49.jar",
  "driver_class" = "com.mysql.jdbc.Driver"
);
```
3. MySQLからDorisへのデータインポート：

- 一回限りのスケジューリング：

```sql

CREATE JOB one_time_load_job ON SCHEDULE AT '2024-08-10 03:00:00' DO INSERT INTO user_activity SELECT * FROM activity.user_activity;
```
- 定期スケジューリング:

```sql
CREATE JOB schedule_load ON SCHEDULE EVERY 1 DAY DO INSERT INTO user_activity SELECT * FROM activity.user_activity WHERE last_visit_date >= days_add(now(), -1);
```
## 設計と実装
効率的なスケジューリングは、特に高精度スケジューリングにおいて、大幅なリソース消費を伴うことが多くあります。Javaの組み込みスケジューリング機能やその他のライブラリを使用した従来の実装では、精度とメモリ使用量に関して重大な問題が生じる可能性があります。リソース使用量を最小限に抑えながらパフォーマンスを確保するため、TimingWheelアルゴリズムとDisruptorを組み合わせて秒レベルのタスクスケジューリングを実現しています。
技術詳細

NettyのHashedWheelTimerを使用してタイムホイールアルゴリズムを実装し、Job Managerは定期的に（デフォルトでは10分ごと）将来のイベントをタイムホイールにスケジュールします。Disruptorはシングルプロデューサー、マルチコンシューマーモデルを構築し、過度なリソース使用量なしに効率的なタスクトリガーを保証します。タイムホイールはタスクをトリガーするのみで、直接実行はしません。即座に実行すべきタスクについては、それぞれの実行スレッドプールに投入されます。

単発実行イベントについては、スケジュール後にイベント定義が削除されます。周期的イベントについては、タイムホイールのシステムイベントが次のサイクルの実行タスクを定期的にプルします。これにより、1つのバケット内でのタスククラスタリングが回避され、無意味な走査が削減され、処理効率が向上します。トランザクショナルタスクについては、Job Schedulerが強力な関連付けとコールバックメカニズムを通じて、タスク実行結果が期待に沿うことを保証し、データの整合性と一貫性を維持します。
結論

## 今後の計画
Doris Job Schedulerは、データ処理に不可欠な強力で柔軟なタスクスケジューリングツールです。データレイク分析や内部ETLなどの一般的なシナリオを超えて、非同期マテリアライズドビューの実装において重要な役割を果たします。非同期マテリアライズドビューは事前計算された結果セットを格納し、その更新頻度はソースTableの変更と密接に関連しています。ソースTableデータの頻繁な更新は
