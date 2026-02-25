---
{
  "title": "audit_log",
  "description": "監査ログを保存する",
  "language": "ja"
}
---
## 概要

監査ログを格納

## データベース

`__internal_schema`

## テーブル情報

| カラム名          | 型           | 説明                                                         |
| ----------------- | ------------ | ------------------------------------------------------------ |
| query_id          | varchar(48)  | クエリのID                                                   |
| time              | datetime(3)  | クエリが実行された時刻（ミリ秒単位）                         |
| client_ip         | varchar(128) | クエリを送信したクライアントのIPアドレス                     |
| user              | varchar(128) | ユーザー                                                     |
| catalog           | varchar(128) | ステートメント実行時の現在のCatalog                          |
| db                | varchar(128) | ステートメント実行時の現在のDatabase                         |
| state             | varchar(128) | ステートメントの実行ステータス                               |
| error_code        | int          | エラーコード                                                 |
| error_message     | text         | エラーメッセージ                                             |
| query_time        | bigint       | ステートメントの実行時間                                     |
| scan_bytes        | bigint       | スキャンしたデータ量                                         |
| scan_rows         | bigint       | スキャンした行数                                             |
| return_rows       | bigint       | 返された行数                                                 |
| shuffleSendRows             | bigint  | ステートメント実行中にノード間で転送された行数。バージョン3.0以降でサポート。 |
| shuffleSendBytes            | bigint    | ステートメント実行中にノード間で転送されたデータ量。バージョン3.0以降でサポート。 | 
| scanBytesFromLocalStorage   | bigint    | ローカルディスクから読み込まれたデータ量。バージョン3.0以降でサポート。 |
| scanBytesFromRemoteStorage  | bigint    | リモートストレージから読み込まれたデータ量。バージョン3.0以降でサポート。 |
| stmt_id           | bigint       | ステートメントID                                             |
| stmt_type                   | string    | ステートメントタイプ。バージョン3.0以降でサポート。 |
| is_query          | tinyint      | クエリかどうか                                               |
| is_nereids                  | booean    | Nereids Optimizerを使用しているかどうか。 |
| frontend_ip       | varchar(128) | 接続されたFrontendのIPアドレス                               |
| cpu_time_ms       | bigint       | ステートメント実行でBackendが消費した累積CPU時間（ミリ秒単位） |
| sql_hash          | varchar(128) | ステートメントのハッシュ値                                   |
| sql_digest        | varchar(128) | ステートメントのダイジェスト（シグネチャ）                   |
| peak_memory_bytes | bigint       | ステートメント実行中のBackendのピークメモリ使用量            |
| workload_group    | text         | ステートメント実行に使用されたWorkload Group                 |
| compute_group                 | string    | ストレージと計算分離モードにおいて、実行ステートメントで使用される計算グループ。バージョン3.0以降でサポート。|
| trace_id                    | string    | ステートメント実行時に設定されたTrace ID。バージョン2.1.7以降で削除  |
| stmt              | text         | ステートメントのテキスト                                     |

## 説明

- `client_ip`: プロキシサービスが使用されIPパススルーが有効でない場合、実際のクライアントIPの代わりにプロキシサービスのIPがここに記録される場合があります。
- `state`: `EOF`はクエリが正常に実行されたことを示します。`OK`はDDLおよびDMLステートメントが正常に実行されたことを示します。`ERR`はステートメント実行が失敗したことを示します。
