---
{
  "title": "復元",
  "language": "ja"
}
---
## 前提条件

1. リストア操作を実行するための**administrator**権限があることを確認してください。
2. バックアップを保存するための既存の**Repository**があることを確認してください。ない場合は、手順に従ってRepositoryを作成し、[backup](backup.md)を実行してください。
3. リストアに使用できる有効な**backup**スナップショットがあることを確認してください。

## 1. スナップショットのBackup Timestampを取得する

以下のSQL文を使用して、`example_repo`という名前のRepository内の既存のバックアップを表示できます。

   ```sql
   mysql> SHOW SNAPSHOT ON example_repo;
   +-----------------+---------------------+--------+
   | Snapshot            | Timestamp              | Status   |
   +-----------------+---------------------+--------+
   | exampledb_20241225 | 2022-04-08-15-52-29 | OK     |
   +-----------------+---------------------+--------+
   1 row in set (0.15 sec)
   ```
## 2. Snapshotからの復元

### Option 1: 現在のデータベースにSnapshotを復元する

以下のSQL文は、`example_repo`という名前のRepositoryから、タイムスタンプ`2022-04-08-15-52-29`でラベル付けされた`restore_label1`のsnapshotを現在のデータベースに復元します。

```sql
RESTORE SNAPSHOT `restore_label1`
FROM `example_repo`
PROPERTIES
(
    "backup_timestamp"="2022-04-08-15-52-29"
);
```
### Option 2: 指定されたデータベースへのスナップショットの復元

以下のSQL文は、`example_repo`という名前のRepositoryから`restore_label1`というラベルが付けられ、タイムスタンプが`2022-04-08-15-52-29`のスナップショットを`destdb`という名前のデータベースに復元します。

```sql
RESTORE SNAPSHOT destdb.`restore_label1`
FROM `example_repo`
PROPERTIES
(
    "backup_timestamp"="2022-04-08-15-52-29"
);
```
### オプション 3: スナップショットから単一Tableを復元

`example_repo` 内のスナップショットからTable `backup_tbl` を現在のデータベースに復元します。スナップショットのラベルは `restore_label1`、タイムスタンプは `2022-04-08-15-52-29` です。

```sql
RESTORE SNAPSHOT `restore_label1`
FROM `example_repo`
ON ( `backup_tbl` )
PROPERTIES
(
    "backup_timestamp"="2022-04-08-15-52-29"
);
```
### オプション 4: スナップショットからパーティションとTableを復元

バックアップスナップショット `snapshot_2` からスナップショットタイムスタンプ `"2018-05-04-17-11-01"` を使用して、Table `backup_tbl` のパーティション p1 と p2、およびTable `backup_tbl2` を現在のデータベース `example_db1` に `new_tbl` として名前を変更して復元します。

   ```sql
   RESTORE SNAPSHOT `restore_label1`
   FROM `example_repo`
   ON
   (
       `backup_tbl` PARTITION (`p1`, `p2`),
       `backup_tbl2` AS `new_tbl`
   )
   PROPERTIES
   (
       "backup_timestamp"="2022-04-08-15-55-43"
   );
   ```
## 3. Restore Job の実行ステータスを確認する

      ```sql
   mysql> SHOW RESTORE\G;
   *************************** 1. row ***************************
                  JobId: 17891851
                  Label: snapshot_label1
              Timestamp: 2022-04-08-15-52-29
                 DbName: default_cluster:example_db1
                  State: FINISHED
              AllowLoad: false
         ReplicationNum: 3
            RestoreObjs: {
     "name": "snapshot_label1",
     "database": "example_db",
     "backup_time": 1649404349050,
     "content": "ALL",
     "olap_table_list": [
       {
         "name": "backup_tbl",
         "partition_names": [
           "p1",
           "p2"
         ]
       }
     ],
     "view_list": [],
     "odbc_table_list": [],
     "odbc_resource_list": []
   }
             CreateTime: 2022-04-08 15:59:01
       MetaPreparedTime: 2022-04-08 15:59:02
   SnapshotFinishedTime: 2022-04-08 15:59:05
   DownloadFinishedTime: 2022-04-08 15:59:12
           FinishedTime: 2022-04-08 15:59:18
        UnfinishedTasks:
               Progress:
             TaskErrMsg:
                 Status: [OK]
                Timeout: 86400
   1 row in set (0.01 sec)
   ```
