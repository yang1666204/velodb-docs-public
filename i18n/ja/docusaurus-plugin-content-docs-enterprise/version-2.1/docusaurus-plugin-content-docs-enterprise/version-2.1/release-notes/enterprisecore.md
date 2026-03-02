---
{
  "title": "エンタープライズコア",
  "description": "リリース日：2025年10月25日",
  "language": "ja"
}
---
# Enterprise Core

## Enterprise Core 3.1.x

### Enterprise Core 3.1.4
リリース日: 2026年1月30日

新機能

Query Engine

- Dereference Expressionsをサポート [#58550](https://github.com/apache/doris/pull/58550)

Data Lake & External Catalogs

- Catalogが`AwsCredentialsProviderChain`経由でクレデンシャルの読み込みをサポート [#59054](https://github.com/apache/doris/pull/59054)
- S3アクセス用にBEに`credentials_provider_type`を渡すことをサポート [#59158](https://github.com/apache/doris/pull/59158)
- Elasticsearch `flatten`データタイプをサポート [#58793](https://github.com/apache/doris/pull/58793)

Observability & Audit

- 監査ログに保存されるSQL文の暗号化をサポート [#58508](https://github.com/apache/doris/pull/58508)
- QueryPlanActionがテーブルクエリプランからのSQLを監査ログに書き込むことをサポート [#59121](https://github.com/apache/doris/pull/59121)
- Nereidsによって解析された文のSQL Digestを生成 [#59215](https://github.com/apache/doris/pull/59215)

最適化と改善

Query Engine

- 型推論と強制変換の動作を調整し、式の一貫性を改善 [#57961](https://github.com/apache/doris/pull/57961)
- 分析タスクによる列統計キャッシュの汚染を防止し、統計の精度を向上 [#58742](https://github.com/apache/doris/pull/58742)
- 複数のDISTINCT集約関数を含むクエリの実行を改善 [#58973](https://github.com/apache/doris/pull/58973)
- Join / Set / CTE / predicate pushdownルールを最適化し、不要なプランの複雑さを回避 [#58664](https://github.com/apache/doris/pull/58664), [#59141](https://github.com/apache/doris/pull/59141), [#59151](https://github.com/apache/doris/pull/59151)

Data Lake & External Catalogs

- Hiveパーティションプルーニングと書き込み性能を高速化し、大きなパーティションテーブルの書き込みレイテンシを大幅に削減 [#58886](https://github.com/apache/doris/pull/58886), [#58932](https://github.com/apache/doris/pull/58932)
- IcebergがCOUNT pushdownを改善するためにdangling deletesの無視をサポート [#59069](https://github.com/apache/doris/pull/59069)
- Iceberg REST Catalogの接続チェックとネットワークタイムアウト処理を強化 [#58433](https://github.com/apache/doris/pull/58433), [#58434](https://github.com/apache/doris/pull/58434)
- 単一スナップショットシナリオでのPaimon増分クエリ動作をSparkと整合 [#58253](https://github.com/apache/doris/pull/58253)

Doris Cloud（計算ストレージ分離）

- クラウド環境での運用の柔軟性を向上させるため、tabletリバランサー設定の動的更新をサポート [#58376](https://github.com/apache/doris/pull/58376)
- 不要なリモートブロードキャスト読み取りを回避するために、計算ストレージ分離シナリオでTopNクエリを最適化 [#58112](https://github.com/apache/doris/pull/58112), [#58155](https://github.com/apache/doris/pull/58155)
- アップグレードプロセス中のタブレットパフォーマンスの一貫性を改善し、ホットスポットリスクを削減 [#58247](https://github.com/apache/doris/pull/58247)
- 大きなテーブルのキャッシュ影響を減らすため、Schema Change中にFile Cacheを適応的に調整 [#58622](https://github.com/apache/doris/pull/58622)
- IO可観測性を改善するため、クエリプロファイルにダウンロード待機時間メトリクスを追加 [#58870](https://github.com/apache/doris/pull/58870)
- LRU dumpサポートによりFile Cacheデバッグ機能を強化 [#58871](https://github.com/apache/doris/pull/58871)

Security & Stability

- 外部カタログセキュリティを改善するため、Glue CatalogでHTTPSを強制 [#58366](https://github.com/apache/doris/pull/58366)
- Create StageにSSRF検証を追加 [#58874](https://github.com/apache/doris/pull/58874)

バグ修正

Query Engine (Nereids Optimizer)

- 特定のシナリオでTopN / Limit / Joinルールによって引き起こされる可能性のある無限ループを修正 [#58697](https://github.com/apache/doris/pull/58697)
- 集約、ウィンドウ関数、Repeat、型変換の論理エラーを修正 [#58080](https://github.com/apache/doris/pull/58080), [#58114](https://github.com/apache/doris/pull/58114), [#58330](https://github.com/apache/doris/pull/58330), [#58548](https://github.com/apache/doris/pull/58548)

Materialized Views (MV)

- MOWテーブルでvalue列predicateを持つ無効なマテリアライズドビューの作成を禁止 [#57937](https://github.com/apache/doris/pull/57937)

Data Ingestion

- JSON Readerの複数回呼び出しによる未定義動作を修正し、潜在的なデータ破損を防止 [#58192](https://github.com/apache/doris/pull/58192)
- Broker Loadで`COLUMNS FROM PATH`に関連する不正な動作を修正 [#58351](https://github.com/apache/doris/pull/58351), [#58904](https://github.com/apache/doris/pull/58904)
- ノードがオフラインまたは廃止された場合のGroup Commitの異常動作を修正 [#59118](https://github.com/apache/doris/pull/59118)
- 特定のエッジ条件下でのLoad / Delete / Partial Updateの失敗を修正 [#58553](https://github.com/apache/doris/pull/58553), [#58230](https://github.com/apache/doris/pull/58230), [#59096](https://github.com/apache/doris/pull/59096)

Doris Cloud（計算ストレージ分離）

- Tablet Drop、Compaction、初期起動の遅延など、計算ストレージ分離シナリオでの安定性問題を修正 [#58157](https://github.com/apache/doris/pull/58157), [#58195](https://github.com/apache/doris/pull/58195), [#58761](https://github.com/apache/doris/pull/58761)
- 異常条件またはBE障害下でのFile Cacheのクラッシュやリソースリークを修正 [#58196](https://github.com/apache/doris/pull/58196), [#58819](https://github.com/apache/doris/pull/58819), [#59058](https://github.com/apache/doris/pull/59058)
- コンパクション後にクリアされないSegment Footer Cacheによる異常な読み取り動作を修正 [#59185](https://github.com/apache/doris/pull/59185)
- ORC / Parquet形式でCopy Intoを実行する際の失敗を修正 [#58551](https://github.com/apache/doris/pull/58551)


## Enterprise Core 3.0.x

### Enterprise Core 3.0.10
リリース日: 2025年11月20日

新機能

- MaxCompute Catalog: MaxComputeカタログでproject-schema-table構造の読み取りサポートを追加
- Paimon Catalog: DLF統合によるPaimon RESTカタログのサポートを追加
- JDBC Catalog: DM（Dameng）データベースでnvarcharデータタイプのサポートを追加

改善

- MTMV: ベーステーブルスキーマ変更によりネストされたMTMVがスキーマ変更状態に入ることがなくなりました
- Routine Load: トランザクション失敗時にスケジュールを遅延させることでタスクスケジューリングを最適化
- String Performance: 文字列のシリアライゼーションおよびデシリアライゼーション性能を改善
- I/O Optimization: より良いI/Oチューニングのため読み取りスライスサイズを設定可能に

バグ修正

Data Type

- decimal256をfloat型にキャストする際の不安定なオーバーフローエラーを修正
- FEチェックポイントと再起動後の自動インクリメント値割り当ての不正を修正

Function

- explode関数によるクラッシュ問題を修正
- datetimev1型でのtimestampdiff関数の計算結果エラーを修正

Catalog

- IcebergカタログのNullPointerException問題を修正
- max_meta_object_cache_num設定の値が0より大きいことを保証する要件検証を修正
- CREATE or ALTER操作中にカタログがリフレッシュキューから誤って削除される問題を修正
- zeroDateTimeBehavior=convertToNullの異なるバージョンとの書き込み方法の互換性を改善
- クエリテーブル値関数での不正なJDBCテーブルID割り当てを修正

Nereids Optimizer

- Profile.releaseMemory()メソッドで物理プランを解放することによるメモリリークを修正
- Java UDFでproject mergeの能力を有効化
- ReorderJoinルールがmark joinをmulti joinに誤って吸収する問題を修正
- simplify compare predicate最適化による精度損失とnullキャスト問題を修正

MTMV

- パーティションテーブルにパーティションがない場合のリフレッシュ失敗を修正

Export

- エラー発生後にエクスポートジョブがキャンセルされない可能性がある問題を修正

HDFS

- プロファイル収集中のHDFSリーダーでのバックエンドcore dump問題を修正

Others

- show create viewコマンドで列定義が表示されない問題を修正
- kill connectionコマンドが現在の接続を誤って終了する問題を修正
- 非マスターノードでeditlogが書き込まれる可能性がある問題を修正

### Enterprise Core 3.0.9
リリース日: 2025年10月25日

動作変更
- デフォルトでzstd圧縮を使用

- ranger / LDAPを使用する際、VeloDBでのユーザー作成を禁止しないように変更

- `variant`の`nested`属性はデフォルトで無効。テーブル作成時に有効にするには、セッション変数で次のコマンドを先に実行する必要があります: `set enable_variant_flatten_nested = true`

新機能

- DM（Dameng）およびKingBase JDBCカタログサポートを追加

- CSVエクスポートで圧縮をサポート

- Hive CatalogでPresto Viewをサポート

- MySQLの`GROUP BY WITH ORDER`構文をサポート

改善

- バックアップメタ情報が2GBを超えるサイズをサポート

- count(*)時、子ノードで最小列を選択するように列刈り込みが可能

- LDAPが有効な場合にshow grantコマンドを実行可能

- パーティション単位でのinverted index format V2のローリングアップグレードメカニズムを提供し、バージョン2.1から3.0にアップグレードするユーザーがインデックス形式移行を段階的に完了できるようサポート

- メモリ不足時のフラッシュ戦略を最適化

- S3 LoadとTVFがAK/SKなしで公開読み取り可能オブジェクトへのアクセスをサポート

- キャッシュ容量が十分な場合、base compactionで生成されたrowsetをファイルキャッシュに書き込み可能

- `ALTER STORAGE VAULT`コマンドを最適化し、`type`属性を明示的に指定せずに自動推論可能

- ポイントクエリを1つのフラグメントのみでプランニングし、実行速度を向上

- ユニークキーテーブルでのポイントクエリ性能を改善

- トークン化されていないインデックス書き込み時の共通デフォルトトークナイザーの追加リソース消費を最適化

バグ修正

Data Ingestion

- マルチ文字列区切りを使用する際の`enclose`解析エラーを修正

- S3 Loadの進行状況が適時更新されない問題を修正

- JSON boolean型をINT列に読み込む際のエラーを修正

- Stream Loadでエラー発生時にエラーURLが返されない問題を修正

- schema changeで例外発生後にgroup commitがブロックされる問題を修正

- Routine loadでcompute group IDの代わりにcompute group nameを使用してcompute groupを選択

- メモリ制限を超えた場合にroutine loadがスケジューリングを停止する問題を修正

Query Optimizer

- 一部のself-joinシナリオで誤ってcolocate joinを使用する問題を修正

- `select distinct`とウィンドウ関数を併用する際の結果エラーの可能性を修正

- lambda式が予期しない場所に出現する場合により使いやすいエラーメッセージを提供

Permissions

- 外部ビューをクエリする際にビューでベーステーブルの権限を誤ってチェックする問題を修正

Query Execution

- IPV6型がIPV4型データを解析できない問題を修正

- IPV6型を解析する際のスタックオーバーフローエラーを修正

- SSLモードでクエリが失敗する可能性がある問題を修正

- rollupを持つテーブルにデータをインポートする際の型不一致エラーを修正

- topNクエリでcore dumpを引き起こす可能性がある問題を修正

- array_agg_foreach関数の結果エラーを修正

Complex Data Types

- BEが起動時に命令セットにマッチするsimdJsonパーサーを選択することをサポート

- variantネストデータタイプでのデータタイプ競合による型推論エラーを修正

- variantネストトップレベルネスト配列データのデフォルト値補完問題を修正

- クラウドでvariant型のインデックス構築を禁止

- variantでinverted indexを作成後、インデックス条件を満たさないデータを書き込む際の空インデックスファイル生成問題を修正

- variant型列を追加するためのalter後にクエリがクラッシュする可能性がある問題を修正

- variant型で空文字列をNULLにキャストする問題を修正

- arrayでjsonサブタイプをサポートしない問題を修正

- bz2圧縮での小ファイル出力を修正

- 空文字列をNULL(JSONB)にキャストする問題を修正

- `_sub_column_tree`への同時アクセスによるスレッドセーフティ問題を解決

Lakehouse

- Hive
  
  - 特定の場合でKerberos認証を使用してHive Metastoreにアクセスする際の失敗を修正
  
  - Hiveテーブルの`serialization.null.format`プロパティが正しく認識されない問題を修正
  
  - Hiveテーブルパーティションで中国語文字による重複パーティションID問題を修正
  
  - Alibaba Cloud OSS-HDFSに保存されたHiveテーブルへの書き込み失敗を修正

- Iceberg
  
  - decimal パーティションを持つicebergテーブルへの書き込み失敗問題を修正

- Paimon
  
  - JNIを使用してPaimonデータを読み取る際のタイムゾーン情報の紛失問題を修正
  
  - Paimonテーブルを読み取る際にlazy materialization最適化が正しく発動しない問題を修正

- Hudi
  
  - JNIを使用してHudiテーブルパーティション列を読み取る際の失敗を修正
  
  - 一部の場合でのHudiテーブルTimestamp型パーティション列のクエリ失敗問題を修正

- JDBC
  
  - 特定の予約キーワードがJDBCカタログのアクセス失敗を引き起こす問題を修正
  
  - 一部の場合でのJDBC SQL パススルー解析失敗問題を修正

- MaxCompute
  
  - MaxComputeカタログで述語プッシュダウンが列を見つけられない問題を修正
  
  - Alibaba Cloud International MaxComputeへのアクセスを妨げる問題を修正

- ES
  
  - ESカタログでの特別な時間形式の誤った処理問題を修正

- Other
  
  - 特定の場合でExternal CatalogのDatabaseとTable IDが誤って生成される問題を修正

Others

- 失敗したSCタスクの清理時に新しいタブレットが空になる問題を修正

- バケット列を元の順序で再構築

- バケット列の削除を禁止

- ネットワークエラーの場合の自動再試行をサポート

- `tabletInvertedIndex`でのデッドロックを回避

- 同名のテーブルとパーティションの同時作成・削除時にFEが終了する可能性がある問題を修正

- schema change式の誤った再利用問題を修正

- 自動パーティショニングで新しいパーティションを作成する際の時折発生するロード失敗問題を修正

- メモリ破損によるcoredumpを引き起こす可能性がある問題を修正

- バックアップ中のパーティションまたはテーブル削除時のエラーを修正

### Enterprise Core 3.0.7
リリース日: 2025年8月25日

動作変更
- `show frontends`と`show backends`の権限要件を対応するRESTful APIと合わせるよう調整（`information_schema`データベースでの`SELECT_PRIV`権限が必要）
- 指定ドメインを持つadminとrootユーザーはもはやシステムユーザーと見なされません
- ストレージ: データベースあたりのデフォルト並行トランザクション数を10000に調整

新機能

- Query Optimizer
  - MySQLの集約ロールアップ構文`GROUP BY ... WITH ROLLUP`をサポート
- Query Execution
  - `Like`文で`escape`構文をサポート
- Semi-structured Data Management
  - セッション変数`enable_add_index_for_new_data=true`を設定することで新データのみに対する非トークン化inverted indexとngram bloomfilter indexの構築をサポート
- New Functions
  - データ関数を追加: `cot`/`sec`/`cosec`

改善
- Data Ingestion
  - `SHOW CREATE LOAD`のエラーメッセージプロンプトを最適化
- Primary Key Model
  - セグメントキー境界切り詰め機能を追加し、単一大量インポート失敗を回避
- Storage
  - compactionおよびインポートデータの信頼性を向上
  - バランス速度を最適化
  - テーブル作成速度を最適化
  - compactionデフォルトパラメータと可観測性を最適化
  - クエリエラー-230問題を最適化
  - システムテーブル`backend_tablets`を追加
  - クラウドモードでフォロワーノードから`information_schema.tables`をクエリする性能を最適化
- Storage-Compute Decoupled
  - Meta-serviceリサイクラーの可観測性を向上
  - インポートcompaction時のクロスコンピュートグループ増分プリヒートをサポート
  - Storage vault接続チェックを最適化
  - MS API経由でのストレージバックエンド情報更新をサポート
- Lakehouse
  - x86環境でのORC zlib解凍性能を最適化し、潜在的問題を修正
  - 外部テーブル読み取りのデフォルト並行スレッド数を最適化
  - DDL操作をサポートしないCatalogのエラーメッセージを最適化
- Asynchronous Materialized Views
  - 透明リライトプランニング性能を最適化
- Query Optimizer
  - `group_concat`関数で非文字列型パラメータを許可
  - `sum`および`avg`関数で非数値型パラメータを許可
  - TOP-Nクエリでの遅延マテリアライゼーションサポート範囲を拡張し、部分列クエリ時の遅延マテリアライゼーションを有効化
  - パーティション作成時、listパーティションで`MAX_VALUE`の包含を許可
  - 集約モデルテーブルでのサンプリングと統計情報収集性能を最適化
  - サンプリングと統計情報収集時のNDV値の精度を最適化
- Inverted Index
  - `show create table`でのinverted indexプロパティ表示順序を統一
  - inverted indexフィルタ条件のコンディション別プロファイルメトリクス（ヒット行数、実行時間など）を追加し、性能分析を支援
  - プロファイルでのinverted index関連情報の表示を強化
- Permissions
  - Rangerでstorage vaultとcompute groupの権限設定をサポート

バグ修正

- Data Ingestion
  - マルチ文字区切りを持つCSVファイルインポート時に発生する可能性のある正確性問題を修正
  - タスクプロパティ修正後の`ROUTINE LOAD`タスク表示結果エラーを修正
  - プライマリノード再起動またはLeaderスイッチ後に一筋多表インポートプランが無効になる問題を修正
  - `ROUTINE LOAD`タスクが利用可能なBEノードを見つけられないためにすべてのスケジューリングタスクがブロックされる問題を修正
  - `runningTxnIds`の並行読み書き競合問題を修正
- Primary Key Model
  - 高頻度並行インポート下でのmowテーブルインポート性能を最適化
  - mowテーブルfull compactionで削除データの領域を解放
  - 極端なシナリオでのmowテーブル潜在的インポート失敗問題を修正
  - mowテーブルのcompaction性能を最適化
  - 並行インポートとschema change中のmowテーブル潜在的正確性問題を修正
  - 空mowテーブルでのschema changeがインポート停止またはschema change失敗を引き起こす可能性がある問題を修正
  - mow delete bitmapキャッシュのメモリリーク問題を修正
  - schema change後のmowテーブル潜在的正確性問題を修正
- Storage
  - compactionによるcloneプロセスでのrowset欠失問題を修正
  - autobucketの不正確なサイズ計算とデフォルト値問題を修正
  - バケット列による潜在的正確性問題を修正
  - 単一列テーブルがリネームできない問題を修正
  - memtableの潜在的メモリリーク問題を修正
  - 空テーブルトランザクション書き込みでサポートされていない操作の一致しないエラー報告問題を修正
- Storage-Compute Decoupled
  - File cacheのいくつかの修正
  - schema process中のcumulative point巻き戻り問題を修正
  - バックグラウンドタスクが自動再起動に影響する問題を修正
  - Azure環境でのデータリサイクルプロセスの未処理例外問題を修正
  - 単一rowsetをcompactする際のfile cache適時クリーンアップされない問題を修正
- Lakehouse
  - Kerberos環境でのIcebergテーブル書き込みトランザクションコミット失敗問題を修正
  - kerberos環境でのhudiクエリ問題を修正
  - マルチCatalogシナリオでの潜在的デッドロック問題を修正
  - 一部の場合での並行Catalogリフレッシュによるメタデータ不整合問題を修正
  - 一部の場合でのORC footerの複数回読み取り問題を修正
  - Table Valued Functionで圧縮されたjsonファイルが読み取れない問題を修正
  - SQL Server CatalogでIDENTITY列情報の識別をサポート
  - SQL ConvertorでHAのための複数URL指定をサポート
- Asynchronous Materialized Views
  - クエリが空結果セットに最適化された際のパーティション補償が誤って行われる可能性がある問題を修正
- Query Optimizer
  - `sql_select_limit`以外の要因がDML実行結果に影響する問題を修正
  - local shuffleを開始する際にマテリアライズドCTEが極端な場合にエラーを報告する可能性がある問題を修正
  - 非マスターノードでprepared insert文が実行できない問題を修正
  - `ipv4`を文字列にキャストする際の結果エラー問題を修正
- Permissions
  - ユーザーが複数の役割を持つ場合、複数役割の権限を統合してから認証を行う
- Query Execution
  - 一部のjson関数の問題を修正
  - 非同期スレッドプールが満杯の際の潜在的BE Core問題を修正
  - `hll_to_base64`の結果エラー問題を修正
  - `decimal256`をfloatにキャストする際の結果エラー問題を修正
  - 2つのメモリリーク問題を修正
  - `bitmap_from_base64`によるbe core問題を修正
  - `array_map`関数による潜在的be core問題を修正
  - `split_by_regexp`関数の潜在的エラー問題を修正
  - 極大データ量下での`bitmap_union`関数の潜在的結果エラー問題を修正
  - 一部の境界値での`format round`関数の潜在的core問題を修正
- Inverted Index
  - 異常状況でのinverted indexメモリリーク問題を修正
  - 空インデックスファイル書き込みとクエリ時のエラー報告問題を修正
  - inverted index文字列読み取りでのIO例外をキャッチし、例外によるプロセスクラッシュを回避
-
