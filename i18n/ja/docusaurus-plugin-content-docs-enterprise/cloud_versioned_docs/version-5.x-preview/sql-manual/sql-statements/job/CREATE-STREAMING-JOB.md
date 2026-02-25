---
{
  "title": "CREATE STREAMING JOB\n\nストリーミングジョブの作成",
  "description": "Doris Streaming Jobは、Job + TVFアプローチに基づく継続的なインポートタスクです。Jobが送信された後、",
  "language": "ja"
}
---
## 説明

Doris Streaming JobはJob + TVFアプローチに基づく継続的なインポートタスクです。Jobが送信された後、Dorisはインポートジョブを継続的に実行し、TVF内のデータをクエリしてDorisテーブルにリアルタイムで書き込みます。

## 構文

```SQL
CREATE JOB <job_name>
ON STREAMING
[job_properties]
[ COMMENT <comment> ]
DO <Insert_Command> 
```
## 必須パラメータ

**1. `<job_name>`**
> ジョブ名はデータベース内でイベントを一意に識別するために使用されます。ジョブ名はグローバルに一意である必要があり、同じ名前のジョブが既に存在する場合はエラーが発生します。

**3. `<sql_body>`**
> DO句は、ジョブがトリガーされたときに実行される操作、つまりSQL文を指定します。現在、S3 TVFのみをサポートしています。

## オプションパラメータ

**1. `<job_properties>`**
| パラメータ | デフォルト値 | 説明 |
| ------------------ | ------ | ------------------------------------------------------------ |
| session.* | None | job_propertiesでのすべてのセッション変数の設定をサポートします |
| s3.max_batch_files | 256 | 累積ファイル数がこの値に達したときにインポート書き込みをトリガーします |
| s3.max_batch_bytes | 10G | 累積データ量がこの値に達したときにインポート書き込みをトリガーします |
| max_interval | 10s | 上流に新しいファイルやデータが追加されていない場合のアイドルスケジューリング間隔 |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：
| 権限 | オブジェクト | 備考 |
|:--------------|:-----------|:------------------------|
| LOAD_PRIV | Database (DB) | 現在、この操作を実行するには**LOAD**権限のみがサポートされています |

## 使用上の注意事項

- TASKは最新の100件のレコードのみを保持します。
- 現在、**INSERT internal table Select * From S3(...)**操作のみがサポートされており、今後より多くの操作がサポートされる予定です。

## 例

- S3の指定されたディレクトリ内のファイルを継続的に監視し、.csvで終わるファイルからdb1.tbl1にデータをインポートするmy_jobという名前のジョブを作成します。

    ```sql
    CREATE JOB my_job
    ON STREAMING
    DO 
    INSERT INTO db1.`tbl1`
    SELECT * FROM S3
    (
        "uri" = "s3://bucket/s3/demo/*.csv",
        "format" = "csv",
        "column_separator" = ",",
        "s3.endpoint" = "s3.ap-southeast-1.amazonaws.com",
        "s3.region" = "ap-southeast-1",
        "s3.access_key" = "",
        "s3.secret_key" = ""
    );
    ```
## CONFIG

**fe.conf**

| パラメータ | デフォルト値 | |
| ------------------------------------ | ------ | ------------------------------------------- |
| max_streaming_job_num | 1024 | Streamingジョブの最大数 |
| job_streaming_task_exec_thread_num | 10 | StreamingTaskを実行するために使用されるスレッド数 |
| max_streaming_task_show_count | 100 | StreamingTaskがメモリに保持するタスク実行記録の最大数 |
