---
{
  "title": "audit_log",
  "description": "監査ログを保存する",
  "language": "ja"
}
---
# audit_log

## 概要

監査ログを保存する

## データベース

`__internal_schema`

## テーブル情報

| Column Name       | Type         | Description                                                  |
| ----------------- | ------------ | ------------------------------------------------------------ |
| query_id          | varchar(48)  | クエリのID                                              |
| time              | datetime(3)  | クエリが実行された時刻（ミリ秒単位）                           |
| client_ip         | varchar(128) | クエリを送信するクライアントのIPアドレス                   |
| user              | varchar(128) | ユーザー                                                         |
| catalog           | varchar(128) | ステートメント実行中の現在のカタログ                   |
| db                | varchar(128) | ステートメント実行中の現在のデータベース                  |
| state             | varchar(128) | ステートメントの実行ステータス                            |
| error_code        | int          | エラーコード                                                   |
| error_message     | text         | エラーメッセージ                                                |
| query_time        | bigint       | ステートメントの実行時間                              |
| scan_bytes        | bigint       | スキャンされたデータ量                                       |
| scan_rows         | bigint       | スキャンされた行数                                       |
| return_rows       | bigint       | 返された行数                                      |
| shuffleSendRows             | bigint  | ステートメント実行中にノード間で転送された行数。バージョン3.0以降でサポート。 |
| shuffleSendBytes            | bigint    | ステートメント実行中にノード間で転送されたデータ量。バージョン3.0以降でサポート。 | 
| scanBytesFromLocalStorage   | bigint    | ローカルディスクから読み取られたデータ量。バージョン3.0以降でサポート。 |
| scanBytesFromRemoteStorage  | bigint    | リモートストレージから読み取られたデータ量。バージョン3.0以降でサポート。 |
| stmt_id           | bigint       | ステートメントID                                                 |
| stmt_type                   | string    | ステートメントタイプ。バージョン3.0以降でサポート。 |
| is_query          | tinyint      | クエリかどうか                                        |
| is_nereids                  | booean    | Nereids Optimizerを使用しているかどうか。 |
| frontend_ip       | varchar(128) | 接続されたFrontendのIPアドレス                         |
| cpu_time_ms       | bigint       | ステートメント実行でBackendが消費した累積CPU時間（ミリ秒単位） |
| sql_hash          | varchar(128) | ステートメントのハッシュ値                                  |
| sql_digest        | varchar(128) | ステートメントのダイジェスト（シグネチャ）                          |
| peak_memory_bytes | bigint       | ステートメント実行中のBackendのピークメモリ使用量  |
| workload_group    | text         | ステートメント実行に使用されるワークロードグループ                  |
| compute_group                 | string    | ストレージとコンピュート分離モードにおいて、実行ステートメントで使用されるコンピュートグループ。バージョン3.0以降でサポート。|
| trace_id                    | string    | ステートメント実行時に設定されるTrace ID。バージョン3.0.3以降で削除。 |
| stmt              | text         | ステートメントテキスト                                               |

## 説明

- `client_ip`: プロキシサービスが使用されIPパススルーが有効でない場合、実際のクライアントIPの代わりにプロキシサービスのIPが記録される場合があります。
- `state`: `EOF`はクエリが正常に実行されたことを示します。`OK`はDDLおよびDMLステートメントが正常に実行されたことを示します。`ERR`はステートメントの実行が失敗したことを示します。
