---
{
  "title": "設定手順",
  "language": "ja"
}
---
この文書では、CCRを使用する際に調整が必要な設定や注意が必要な設定について説明します。

## FE設定

`fe.conf`で設定します。例：`restore_reset_index_id = true`

| **名前**|**説明**|**デフォルト値**| **バージョン** |
|---|---|---|---|
|`restore_reset_index_id`|同期Tableでinverted indexまたはbitmap indexが使用されている場合、`false`に設定する必要があります。| false| 2.1.8および3.0.4以降 |
|`ignore_backup_tmp_partitions`|上流での一時パーティション作成による同期中断を回避するため、`true`に設定する必要があります。|false| 2.1.8および3.0.4以降 |
|`max_backup_restore_job_num_per_db`|メモリ内でのDB毎のバックアップ/リストアジョブ数の制限。2に設定することを推奨します。|10 | 全バージョン |
|`label_num_threshold`|TXN Labelの数を制御してトランザクション復旧が速すぎることを防ぎます。大きすぎるとより多くのメモリを占有し、小さすぎると例外的状況でデータ重複が発生する場合があります。ほとんどの場合はデフォルト値で十分です。| 2000 | 2.1以降 |
|`restore_job_compressed_serialization`| tablet数が100,000を超える場合、trueに設定することを推奨します。<br />ダウングレード前に設定をオフにし、FEがcheckpointを完了することを確認してください。<br />2.1から3.0にアップグレードする場合、少なくとも3.0.3にアップグレードしてください。|false| 2.1.8および3.0.3以降 |
|`backup_job_compressed_serialization`| tablet数が100,000を超える場合、trueに設定することを推奨します。<br />ダウングレード前に設定をオフにし、FEがcheckpointを完了することを確認してください。<br />2.1から3.0にアップグレードする場合、少なくとも3.0.3にアップグレードしてください。|false| 2.1.8および3.0.3以降 |
|`backup_job_default_timeout_ms`|バックアップ/リストアジョブのタイムアウト。ソースクラスターとターゲットクラスター両方のFEで設定が必要です。|なし|要件に応じて設定|
|`enable_restore_snapshot_rpc_compression`|RPCメッセージサイズを削減するためのsnapshot info圧縮を有効にします。trueに設定することを推奨します。| true | 2.1.8および3.0.3以降 |


## BE

`be.conf`で設定します。例：`thrift_max_message_size = 2000000000`

| **名前**|**説明**|**デフォルト値**| **バージョン** |
|---|---|---|---|
|`thrift_max_message_size`|BE thriftサーバーの単一RPCパケット制限。CCRジョブに関わるtablet数が多い場合、2000000000に設定することを推奨します。|100MB| 全バージョン |
|`be_thrift_max_pkg_bytes`|BE Thrift RPCメッセージパッケージサイズ制限。|20MB| 2.0固有| 全バージョン |
|`max_download_speed_kbps`|下流BEの各ダウンロードワーカーのダウンロード速度制限。デフォルトはスレッドあたり50MB/s。|50MB/s| 全バージョン |
|`download_worker_count`|ダウンロードジョブのスレッド数。ネットワークカード、ディスク、および負荷に応じて設定。| 1 | 全バージョン |


## Table属性

`Create Table`または`Alter Table`で設定します。

| **名前**|**説明**|**デフォルト値**| **バージョン** |
|---|---|---|---|
|`binlog.max_bytes`|binlogの最大メモリ使用量。少なくとも4GBを維持することを推奨します。|無制限| 全バージョン |
|`binlog.ttl_seconds`|binlogの保持時間。| 2.0.5より前は無制限、2.0.5以降は1日（86400）| 全バージョン |
