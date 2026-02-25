---
{
  "title": "FAQ を読み込む",
  "description": "問題の説明：読み込み中のデータ品質エラー。",
  "language": "ja"
}
---
# Load FAQ

## 一般的なLoad FAQ

### エラー "[DATA_QUALITY_ERROR] Encountered unqualified data"
**問題の説明**: ロード中のデータ品質エラー。

**解決方法**:
- Stream LoadとInsert Into操作はエラーURLを返します。Broker Loadの場合は`Show Load`コマンドでエラーURLを確認できます。
- ブラウザまたはcurlコマンドを使用してエラーURLにアクセスし、具体的なデータ品質エラーの理由を確認してください。
- strict_modeとmax_filter_ratioパラメータを使用して、許容可能なエラー率を制御してください。

### エラー "[E-235] Failed to init rowset builder"
**問題の説明**: ロード頻度が高すぎてデータが適時にコンパクト化されず、バージョン制限を超えた場合にエラー-235が発生します。

**解決方法**:
- データロードのバッチサイズを増やし、ロード頻度を下げてください。
- `be.conf`の`max_tablet_version_num`パラメータを増やしてください。5000を超えないことを推奨します。

### エラー "[E-238] Too many segments in rowset"
**問題の説明**: 単一rowset下のセグメント数が制限を超えた場合にエラー-238が発生します。

**一般的な原因**:
- テーブル作成時に設定されたバケット数が小さすぎる。
- データスキューが発生している。よりバランスの取れたバケットキーの使用を検討してください。

### エラー "Transaction commit successfully, BUT data will be visible later"
**問題の説明**: データロードは成功したが、一時的に表示されない。

**原因**: 通常、システムリソース圧迫によるトランザクションpublish遅延が原因です。

### エラー "Failed to commit kv txn [...] Transaction exceeds byte limit"
**問題の説明**: shared-nothingモードで、単一ロードに関与するパーティションとタブレットが多すぎて、トランザクションサイズ制限を超えている。

**解決方法**:
- パーティション別にバッチでデータをロードし、単一ロードに関与するパーティション数を減らしてください。
- テーブル構造を最適化してパーティションとタブレットの数を減らしてください。

### CSVファイルの最後の列に余分な"\r"がある
**問題の説明**: 通常、Windowsの行末文字が原因です。

**解決方法**:
正しい行区切り文字を指定してください: `-H "line_delimiter:\r\n"`

### 引用符付きCSVデータがnullとしてインポートされる
**問題の説明**: 引用符付きCSVデータがインポート後にnullになる。

**解決方法**:
`trim_double_quotes`パラメータを使用してフィールド周りのダブルクォートを削除してください。

## Stream Load

### ロードが遅い理由
- CPU、IO、メモリ、またはネットワークカードリソースのボトルネック。
- クライアントマシンとBEマシン間のネットワークが遅い。クライアントからBEマシンへのping遅延で初期診断可能です。
- Webserverスレッド数のボトルネック。単一BEでのStream Load同時実行数が多すぎる（be.conf webserver_num_workers設定を超える）とスレッド数ボトルネックを引き起こす可能性があります。
- Memtable Flushスレッド数のボトルネック。BEメトリクスdoris_be_flush_thread_pool_queue_sizeを確認し、キューイングが深刻かどうかを見てください。be.conf flush_thread_num_per_storeパラメータを増やすことで解決できます。

### 列名の特殊文字の処理
列名に特殊文字が含まれている場合、バッククォート付きシングルクォートを使用してcolumnsパラメータを指定してください:

```shell
curl --location-trusted -u root:"" \
    -H 'columns:`@coltime`,colint,colvar' \
    -T a.csv \
    -H "column_separator:," \
    http://127.0.0.1:8030/api/db/loadtest/_stream_load
```
## Routine Load

### 主要なバグ修正

| 問題の説明 | トリガー条件 | 影響範囲 | 一時的な解決策 | 影響バージョン | 修正バージョン | 修正PR |
|-----------|-------------|----------|---------------|---------------|--------------|--------|
| Kafkaへの接続時に少なくとも1つのジョブがタイムアウトすると、他のジョブのインポートに影響し、グローバルRoutine Loadインポートが遅くなる。 | Kafkaへの接続時に少なくとも1つのジョブがタイムアウトする。 | Shared-nothingおよびshared-storage | 問題を解決するために、ジョブを停止するか手動で一時停止する。 | <2.1.9 <3.0.5 | 2.1.9 3.0.5 | [#47530](https://github.com/apache/doris/pull/47530) |
| FE Masterの再起動後にユーザーデータが失われる可能性がある。 | ジョブのoffsetがOFFSET_ENDに設定され、FEが再起動される。 | Shared-storage | 消費モードをOFFSET_BEGINNINGに変更する。 | 3.0.2-3.0.4 | 3.0.5 | [#46149](https://github.com/apache/doris/pull/46149) |
| インポート中に大量の小さなトランザクションが生成され、compactionが失敗し、継続的な-235エラーが発生する。 | Dorisがデータを消費するのが速すぎる、またはKafkaデータフローが小さなバッチ単位である。 | Shared-nothingおよびshared-storage | Routine Loadジョブを一時停止し、次のコマンドを実行する：`ALTER ROUTINE LOAD FOR jobname FROM kafka ("property.enable.partition.eof" = "false");` | <2.1.8 <3.0.4 | 2.1.8 3.0.4 | [#45528](https://github.com/apache/doris/pull/45528), [#44949](https://github.com/apache/doris/pull/44949), [#39975](https://github.com/apache/doris/pull/39975) |
| Kafkaサードパーティライブラリのデストラクタがハングし、データ消費が失敗する。 | Kafkaトピックの削除（他の条件の可能性もある）。 | Shared-nothingおよびshared-storage | すべてのBEノードを再起動する。 | <2.1.8 <3.0.4 | 2.1.8 3.0.4 | [#44913](https://github.com/apache/doris/pull/44913) |
| Routine Loadスケジューリングがハングする。 | FEがMeta Serviceでトランザクションを中止する際にタイムアウトが発生する。 | Shared-storage | FEノードを再起動する。 | <3.0.2 | 3.0.2 | [#41267](https://github.com/apache/doris/pull/41267) |
| Routine Load再起動の問題。 | BEノードの再起動。 | Shared-nothingおよびshared-storage | ジョブを手動で再開する。 | <2.1.7 <3.0.2 | 2.1.7 3.0.2 | [#41134](https://github.com/apache/doris/pull/41134) |

### デフォルト設定の最適化

| 最適化内容 | 適用バージョン | 対応PR |
|-----------|---------------|--------|
| Routine Loadのタイムアウト時間を増加。 | 2.1.7 3.0.3 | [#42042](https://github.com/apache/doris/pull/42042), [#40818](https://github.com/apache/doris/pull/40818) |
| `max_batch_interval`のデフォルト値を調整。 | 2.1.8 3.0.3 | [#42491](https://github.com/apache/doris/pull/42491) |
| `max_batch_interval`の制限を削除。 | 2.1.5 3.0.0 | [#29071](https://github.com/apache/doris/pull/29071) |
| `max_batch_rows`と`max_batch_size`のデフォルト値を調整。 | 2.1.5 3.0.0 | [#36632](https://github.com/apache/doris/pull/36632) |

### 可観測性の最適化

| 最適化内容 | 適用バージョン | 対応PR |
|-----------|---------------|--------|
| 可観測性関連のメトリクスを追加。 | 3.0.5 | [#48209](https://github.com/apache/doris/pull/48209), [#48171](https://github.com/apache/doris/pull/48171), [#48963](https://github.com/apache/doris/pull/48963) |

### エラー "failed to get latest offset"
**問題の説明**: Routine LoadがKafkaの最新offsetを取得できない。

**一般的な原因**:
- 通常はKafkaとのネットワーク接続の問題による。pingやtelnetを使用してKafkaドメイン名をテストして確認する。
- サードパーティライブラリのバグによるタイムアウト、エラー: java.util.concurrent.TimeoutException: Waited X seconds

### エラー "failed to get partition meta: Local:'Broker transport failure"
**問題の説明**: Routine LoadがKafka Topic Partition Metaを取得できない。

**一般的な原因**:
- 通常はKafkaとのネットワーク接続の問題による。pingやtelnetを使用してKafkaドメイン名をテストして確認する。
- ドメイン名を使用している場合、/etc/hostsでドメイン名マッピングを設定してみる

### エラー "Broker: Offset out of range"
**問題の説明**: 消費するoffsetがKafkaに存在しない、おそらくKafkaによってクリーンアップされている。

**解決策**:
- 消費用に新しいoffsetを指定する必要がある。例えば、offsetをOFFSET_BEGINNINGに設定する。
- インポート速度に基づいて適切なKafkaログクリーンアップパラメータを設定する必要がある: log.retention.hours、log.retention.bytes等。
