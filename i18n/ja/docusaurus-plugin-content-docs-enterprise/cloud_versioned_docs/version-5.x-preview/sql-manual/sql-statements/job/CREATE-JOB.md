---
{
  "title": "JOBの作成",
  "description": "Doris Jobは設定された計画に従って実行されるタスクです。特定の時刻または指定された時間間隔で事前定義された操作をトリガーするために使用されます。",
  "language": "ja"
}
---
## 説明

Doris Jobは設定された計画に従って実行されるタスクです。特定の時間または指定された時間間隔で事前に定義された操作をトリガーするために使用され、いくつかのタスクを自動的に実行するのに役立ちます。機能的には、オペレーティングシステムのスケジュールされたタスク（LinuxのcronやWindowsのスケジュールされたタスクなど）に似ています。

ジョブには2つのタイプがあります：`ONE_TIME`と`RECURRING`です。その中で、`ONE_TIME`タイプのジョブは指定された時点でトリガーされます。主に一回限りのタスクに使用され、一方`RECURRING`タイプのジョブは指定された時間間隔内で周期的にトリガーされます。この方法は主に定期的なタスクに使用されます。

`RECURRING`タイプのジョブは開始時間と終了時間、つまり`STARTS/ENDS`を指定することができます。開始時間が指定されていない場合、デフォルトの最初の実行時間は現在時刻+1スケジューリングサイクルです。終了時間が指定されている場合、タスクの実行は完了します。終了時間に達した場合（または超過した場合、または次の実行サイクルが終了時間を超える場合）、FINISHEDステートに更新され、この時点でそれ以上のタスクは生成されません。

ジョブには4つのステート（`RUNNING`、`STOPPED`、`PAUSED`、`FINISHED`）があります。

初期ステートは`RUNNING`です。`RUNNING`ステートのジョブは、確立されたスケジューリングサイクルに従って実行用のTASKを生成します。ジョブが完了し終了時間に達すると、ステートは`FINISHED`に変わります。

`PAUSED`ステートのジョブは、RESUME操作を通じて再開でき、RUNNINGステートに変更されます。

`STOPPED`ステートのジョブはユーザーによってアクティブにトリガーされ、実行中のジョブはキャンセルされ、ジョブは削除されます。

`FINISHED`ステートのジョブはシステム内に24時間保持され、24時間後に削除されます。

JOBはジョブ情報のみを記述します。実行はTASKを生成します。TASKステータスは`PENDING`、`RUNNING`、`SUCCEESS`、`FAILED`、`CANCELED`に分かれます。

`PENDING`はトリガー時間に達したがリソースの実行を待っていることを意味します。リソースが割り当てられた後、ステータスは`RUNNING`に変わります。実行の成功/失敗は`SUCCESS`/`FAILED`に変わります。

`CANCELED`はキャンセルステータスを意味します。TASKは最終ステータス、つまり`SUCCESS`/`FAILED`を永続化します。他のステータスは操作中にチェックできますが、再起動すると表示されません。

## 構文

```sql
CREATE
    JOB  
    <job_name>
    ON SCHEDULE <schedule>
    [ COMMENT <string> ]
    DO <sql_body> 
```
どこで：

```sql
schedule:
  { AT <at_timestamp> | EVERY <interval> [STARTS <start_timestamp> ] [ENDS <end_timestamp> ] }
```
どこで：

```sql
interval:
  quantity { WEEK | DAY | HOUR | MINUTE }
```
## 必須パラメータ

**1. `<job_name>`**
> ジョブ名で、db内の一意なイベントを識別します。ジョブ名はグローバルに一意である必要があります。同じ名前のジョブが既に存在する場合、エラーが報告されます。システム内部での使用のため**inner_**プレフィックスを予約しているため、ユーザーは**inner_**で始まる名前を作成できません。

**2. `<schedule>`**
> ON SCHEDULE句は、ジョブのタイプ、トリガー時間、および頻度を指定します。一回限りのジョブまたは定期的なジョブを指定できます。

**3. `<sql_body>`**
> DO句は、ジョブがトリガーされた時に実行される操作、つまりSQL文を指定します。

## オプションパラメータ

**1. `AT <at_timestamp>`**
> フォーマット: 'YYYY-MM-DD HH:MM:SS'、**一回限りのイベント**で使用され、指定された日時のタイムスタンプでイベントが一度だけ実行されることを指定し、実行が完了すると、ジョブステータスはFINISHEDに変更されます。

**2. `EVERY <interval>`**
> 定期的に繰り返される操作を示し、ジョブの実行頻度を指定します。キーワードの後に時間間隔を指定する必要があり、日、時間、分、秒、または週を指定できます。

**3. `STARTS <start_timestamp>`**
> フォーマット: 'YYYY-MM-DD HH:MM:SS'、ジョブの開始時間を指定するために使用されます。指定されない場合、現在時刻の次の時点から実行されます。開始時間は現在時刻より大きい必要があります。

**4. `ENDS <end_timestamp>`**
> フォーマット: 'YYYY-MM-DD HH:MM:SS'、ジョブの終了時間を指定するために使用されます。指定されない場合、永続的な実行を意味します。日付は現在時刻より大きい必要があります。開始時間が指定されている場合、つまりSTARTSが指定されている場合、終了時間は開始時間より大きい必要があります。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| Privilege     | Object     | Notes                                                                   |
|:--------------|:-----------|:------------------------------------------------------------------------|
| ADMIN_PRIV    | Database   | 現在この操作を実行するには**ADMIN**権限のみをサポートしています |

## 使用上の注意

- TASKは最新の100件のレコードのみを保持します。

- 現在**INSERT internal table**操作のみをサポートしており、将来的にはより多くの操作をサポート予定です。

- 次にスケジュールされたタスク時間が満了した時、つまりタスクが実行のためにスケジュールされる必要がある時に、現在のJOBがまだ実行中の履歴タスクを持っている場合、現在のタスクスケジューリングはスキップされます。そのため、適切な実行間隔を制御することが非常に重要です。

## 例

- my_jobという名前のジョブを作成し、1分ごとに実行されます。実行される操作は、db2.tbl2のデータをdb1.tbl1にインポートすることです。

  ```sql
  CREATE JOB my_job ON SCHEDULE EVERY 1 MINUTE DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2;
  ```
- 2020-01-01 00:00:00に一度だけ実行され、db2.tbl2のデータをdb1.tbl1にインポートするワンタイムジョブを作成します。

  ```sql
  CREATE JOB my_job ON SCHEDULE AT '2020-01-01 00:00:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2;
  ```
- 2020-01-01 00:00:00から実行を開始し、1日に1回実行する定期Jobを作成する。実行される操作は、db2.tbl2のデータをdb1.tbl1にインポートすることである。

  ```sql
  CREATE JOB my_job ON SCHEDULE EVERY 1 DAY STARTS '2020-01-01 00:00:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2 WHERE create_time >= days_add(now(),-1);
  ```
- 2020-01-01 00:00:00に開始し、1日に1回実行される定期ジョブを作成します。操作内容は、db2.tbl2のデータをdb1.tbl1にインポートすることです。ジョブは2020-01-01 00:10:00に終了します。

  ```sql
  CREATE JOB my_job ON SCHEDULE EVERY 1 DAY STARTS '2020-01-01 00:00:00' ENDS '2020-01-01 00:10:00' DO INSERT INTO db1.tbl1 SELECT * FROM db2.tbl2 create_time >= days_add(now(),-1);
  ```
## Best Practices

- 大量のジョブが同時にトリガーされることを避けるために、ジョブを適切に管理してください。これにより、タスクの蓄積が発生し、システムの正常な動作に影響を与えることを防げます。
- タスク実行間隔は、少なくともタスク実行時間より大きい、適切な範囲内に設定する必要があります。

## Related Documents

- [Pause-JOB](../job/PAUSE-JOB.md)
- [Resume-JOB](../job/RESUME-JOB.md)
- [Delete-JOB](../job/DROP-JOB.md)
- [Query-JOB](../../../sql-manual/sql-functions/table-valued-functions/jobs.md)
- [Query-TASKS](../../sql-functions/table-valued-functions/jobs.md)

## CONFIG

**fe.conf**

- job_dispatch_timer_job_thread_num：時限タスクの配布に使用されるスレッド数。デフォルト値は2です。定期実行タスクが大量にある場合は、このパラメータを増やすことができます。

- job_dispatch_timer_job_queue_size：タスクが蓄積された際に時限タスクを格納するキューサイズ。デフォルト値は1024です。大量のタスクが同時にトリガーされる場合は、このパラメータを増やすことができます。そうしないと、キューが満杯になり、送信されたタスクがブロック状態に入り、後続のタスクの送信が失敗する原因となります。

- finished_job_cleanup_threshold_time_hour：完了したタスクをクリーンアップする時間閾値（時間単位）。デフォルト値は24時間です。

- job_insert_task_consumer_thread_num = 10：Insertタスクの実行に使用されるスレッド数。値は0より大きい必要があり、そうでない場合はデフォルト値5が使用されます。
