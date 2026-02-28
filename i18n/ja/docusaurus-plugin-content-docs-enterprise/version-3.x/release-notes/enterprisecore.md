---
{
  "title": "Enterprise Core",
  "description": "リリース日: 2025年10月25日",
  "language": "ja"
}
---
# Enterprise Core

## Enterprise Core 3.0.x

### Enterprise Core 3.0.10
リリース日: 2025年12月25日

新機能

- mmh64_v2関数をサポート

改善

- BEとFEのGraceful Shutdownの動作を改善し、BEシャットダウン中のクエリリトライを最適化
- 動作の変更: BEとFEがより優雅にシャットダウンを処理し、BEシャットダウン中のクエリをより効率的にリトライするようになりました

バグ修正

- MoWTableの値列に関する条件でmvの作成を禁止
- 動作の変更: MoWTableの値列に関する条件でmvを作成することが禁止されました
- `cloud_tablet_rebalancer_interval_second`設定の動的変更をサポート
- 動作の変更: cloud_tablet_rebalancer_interval_second設定が再起動なしに動的に変更できるようになりました
- compaction後にinput rowsetが早期にevictされ、クエリ失敗を引き起こす問題を修正
- インデックス変更によるsync MV損失を修正
- 一部のJSONパスが正しくマッチしない問題を修正
- パーティション topn最適化では、すべてのwindow式が同じ順序である必要がある
- group setsが存在する場合のeliminateによるnot in aggregateの出力エラーを修正
- join reorder時にeq function not exist例外を投げる実行エラーを修正
- 関数が常にnullableの場合のaggregate function roll up失敗を修正
- castが含まれ、castターゲットデータ型がcastソースデータ型と同じ場合のcreate partition mv失敗を修正
- 初回起動時に生きるまで長時間かかる問題を修正
- 古いバージョンからのアップグレード時の不均一なタブレットパフォーマンスを修正
- コロンを含むs3パスのlistエラーを修正
- ハンドシェイク失敗時のSSL unwrap無限ループを修正
- nullptrによるcoredumpを回避

### Enterprise Core 3.0.10
リリース日: 2025年11月20日

新機能

- MaxCompute カタログ: MaxComputeカタログでのproject-schema-table構造の読み取りサポートを追加
- Paimon カタログ: DLF統合でPaimon RESTカタログのサポートを追加
- JDBC カタログ: DM（Dameng）データベースでnvarcharデータ型のサポートを追加

改善

- MTMV: ベースTableのスキーマ変更によって、ネストされたMTMVがスキーマ変更状態に入らないようになりました
- Routine Load: トランザクション失敗時にスケジュールを遅延させることでタスクスケジューリングを最適化
- String Performance: 文字列のシリアライゼーションとデシリアライゼーションのパフォーマンスを向上
- I/O 最適化: より良いI/Oチューニングのためにread slice sizeを設定可能にしました

バグ修正

Data タイプ

- decimal256からfloat型へのキャスト時の不安定なオーバーフローエラーを修正
- FEチェックポイントと再起動後の不正な自動インクリメント値割り当てを修正

ファンクション

- explode関数によるクラッシュ問題を修正
- datetimev1型でのtimestampdiff関数の不正な計算結果を修正

カタログ

- Icebergカタログのnullpointerexception問題を修正
- max_meta_object_cache_num設定の要件検証を修正し、値が0より大きいことを保証
- CREATEまたはALTER操作中にカタログがリフレッシュキューから不正に削除される問題を修正
- 異なるバージョンのzeroDateTimeBehavior=convertToNullの書き込み方法との互換性を向上
- クエリTable値関数での不正なJDBCTableID割り当てを修正

Nereids Optimizer

- Profile.releaseMemory()メソッドでphysical planを解放することでメモリリークを修正
- Java UDFのproject merge機能を有効化
- ReorderJoinルールがmark joinをmulti joinに不正に吸収する問題を修正
- simplify compare predicate最適化による精度損失とnull castの問題を修正

MTMV

- パーティションTableにパーティションがない場合のリフレッシュ失敗を修正

Export

- エラー発生後にexportジョブがキャンセルされない問題を修正

HDFS

- プロファイル収集中のHDFSリーダーでのbackend core dumpの問題を修正

Others

- show create viewコマンドでカラム定義が表示されない問題を修正
- kill connectionコマンドが現在の接続を不正に終了する問題を修正
- 非マスターノードでeditlogが書き込まれる問題を修正

### Enterprise Core 3.0.9
リリース日: 2025年10月25日

動作の変更
- デフォルトでzstd圧縮を使用

- ranger/LDAP使用時に、VeloDBでのユーザー作成が禁止されなくなりました

- `variant`の`nested`属性はデフォルトで無効です。Table作成時に有効にするには、まずセッション変数で次のコマンドを実行する必要があります: `set enable_variant_flatten_nested = true`

新機能

- DM（Dameng）とKingBase JDBC Catalogサポートを追加

- CSVエクスポートで圧縮をサポート

- Hive CatalogでPresto Viewをサポート

- MySQLの`GROUP BY WITH ORDER`構文をサポート

改善

- メタ情報のバックアップで2GBを超えるサイズをサポート

- count(*)時に、カラムプルーニングで子ノードの最小カラムを選択可能

- LDAPが有効な場合にshow grantコマンドを実行可能

- inverted indexフォーマットV2のパーティション単位でのローリングアップグレード機能を提供し、バージョン2.1から3.0へのアップグレードユーザーが段階的にインデックスフォーマット移行を完了することをサポート

- メモリ不足時のフラッシュ戦略を最適化

- S3 LoadとTVFでAK/SK なしの公開読み取り可能オブジェクトアクセスをサポート

- キャッシュ領域が十分な場合、base compactionで生成されるrowsetをファイルキャッシュに書き込み可能

- `ALTER STORAGE VAULT`コマンドを最適化し、`type`属性を明示的に指定せずに自動推論可能

- ポイントクエリは1つのフラグメントのみを持つように計画され、ポイントクエリの実行速度を向上

- unique keyTableのポイントクエリにおけるパフォーマンスを改善

- 非トークン化インデックス書き込み時の共通デフォルトトークナイザーの追加リソース消費を最適化

バグ修正

Data Ingestion

- マルチ文字のカラムセパレータ使用時の`enclose`パース エラーを修正

- S3 Loadの進捗が適時更新されない問題を修正

- JSON boolean型をINTカラムに読み込む際のエラーを修正

- Stream Loadでエラー URL返却が欠落する問題を修正

- スキーマ変更で例外投出後にgroup commitがブロックされる問題を修正

- Routine loadでcompute group IDの代わりにcompute group名を使用してcompute groupを選択

- メモリ制限を超過した場合にroutine loadがスケジューリングを停止する問題を修正

Query Optimizer

- 一部のself-joinシナリオでcolocate joinを不正に使用する問題を修正

- window関数で`select distinct`使用時の潜在的な結果エラーを修正

- lambda式が予期しない位置にある場合のより分かりやすいエラーメッセージを提供

Permissions

- 外部ビュークエリ時にビュー内のベースTable権限を不正にチェックする問題を修正

Query Execution

- IPV6型がIPV4型データを解析できない問題を修正

- IPV6型解析時のスタックオーバーフローエラーを修正

- SSLモードでクエリが失敗する可能性のある問題を修正

- rollupを持つTableにデータをインポートする際の型不一致エラーを修正

- topNクエリがcore dumpを引き起こす可能性のある問題を修正

- array_agg_foreach関数の不正な結果を修正

Complex Data Types

- 起動時にBEが命令セットにマッチするsimdjsonパーサーを選択することをサポート

- variantネストされたデータ型のデータ型衝突による不正な型推論を修正

- variantネストされたトップレベルネストされた配列データのデフォルト値フィル問題を修正

- クラウドでvariant型のインデックス構築を禁止

- variant用のinverted index作成後にインデックス条件を満たさないデータ書き込み時に空のインデックスファイルが生成される問題を修正

- variant型カラムを変更追加した後のクエリクラッシュ可能性のある問題を修正

- variant型が空文字列をNULLにキャストする問題を修正

- arrayがjson subtypeをサポートしない問題を修正

- bz2圧縮での小ファイル出力を修正

- 空文字列はNULL(JSONB)にキャストされるべき

- `_sub_column_tree`への同時アクセスによるスレッドセーフティ問題を解決

レイクハウス

- Hive
  
  - 特定のケースでKerberos認証を使用したHive Metastoreアクセス失敗を修正
  
  - HiveTableのプロパティーTMFSI `serialization.null.format`が正しく認識されない問題を修正
  
  - HiveTableパーティション内の中国語による重複パーティションID問題を修正
  
  - Alibaba Cloud OSS-HDFSに保存されたHiveTableへの書き込み失敗を修正

- Iceberg
  
  - decimalパーティションを持つicebergTableへの書き込み失敗問題を修正

- Paimon
  
  - JNIを使用したPaimonデータ読み取り時にタイムゾーン情報が失われる問題を修正
  
  - PaimonTable読み取り時にlazy materialization最適化が正しくトリガーされない問題を修正

- Hudi
  
  - JNIを使用したHudiTableパーティションカラム読み取り失敗を修正
  
  - 一部のケースでHudiTableTimestamp型パーティションカラムのクエリ失敗問題を修正

- JDBC
  
  - 特定の予約キーワードがJDBC Catalogでアクセス失敗を引き起こす問題を修正
  
  - 一部のケースでJDBC SQLパススルー解析失敗の問題を修正

- MaxCompute
  
  - MaxCompute Catalogで述語pushdownがカラムを見つけられない問題を修正
  
  - Alibaba Cloud International MaxComputeアクセスを阻む問題を修正

- ES
  
  - ES Catalogでの特別な時刻フォーマットの不正な処理問題を修正

- Other
  
  - 特定のケースで外部カタログでDatabaseとTable IDが不正に生成される問題を修正

Others

- 失敗したSCタスククリーンアップ時に新しいタブレットが空になる問題を修正

- 元の順序でbucketカラムを再構築

- bucketカラム削除を禁止

- ネットワークエラーの場合の自動リトライをサポート

- `tabletInvertedIndex`でのデッドロックを回避

- 同名のTableとパーティションを同時に作成・削除する際にFEが終了する可能性のある問題を修正

- スキーマ変更式の不正な再利用問題を修正

- 自動パーティショニングで新しいパーティションを作成する際の偶発的な読み込み失敗問題を修正

- メモリ破損によるcoredump可能性のある問題を修正

- バックアップ中にパーティションまたはTableが削除される際のエラーを修正

### Enterprise Core 3.0.7
リリース日: 2025年8月25日

動作の変更
- `show frontends`と`show backends`の権限要件を対応するRESTful APIに合わせて調整（`information_schema`データベースでの`SELECT_PRIV`権限が必要）
- 指定ドメインを持つAdminとrootユーザーはシステムユーザーとみなされなくなりました
- Storage: データベースあたりの同時トランザクション数のデフォルトを10000に調整

新機能

- Query Optimizer
  - MySQLのaggregate roll-up構文`GROUP BY ... WITH ROLLUP`をサポート
- Query Execution
  - `Like`文で`escape`構文をサポート
- Semi-structured Data Management
  - セッション変数`enable_add_index_for_new_data=true`を設定することで、新しいデータのみに対して非トークン化inverted indexとngram bloomfilter indexの構築をサポート
- New Functions
  - データ関数を追加: `cot`/`sec`/`cosec`

改善
- Data Ingestion
  - `SHOW CREATE LOAD`のエラーメッセージプロンプトを最適化
- Primary Key Model
  - segment key bounds truncation機能を追加し、単一の大きなインポート失敗を回避
- Storage
  - compactionとインポートされたデータの信頼性を向上
  - バランス速度を最適化
  - Table作成速度を最適化
  - compactionのデフォルトパラメータとオブザーバビリティを最適化
  - クエリエラー-230の問題を最適化
  - システムTable`backend_tablets`を追加
  - クラウドモードでフォロワーノードからの`information_schema.tables`クエリ性能を最適化
- Storage-Compute Decoupled
  - Meta-service recyclerのオブザーバビリティを向上
  - インポートcompaction時のcompute group間インクリメンタルプリヒートをサポート
  - Storage vault接続性チェックを最適化
  - MS API経由でのストレージバックエンド情報更新をサポート
- レイクハウス
  - x86環境でのORC zlib解凍性能を最適化し、潜在的な問題を修正
  - 外部Table読み取りでの同時スレッド数のデフォルトを最適化
  - DDL操作をサポートしないCatalogのエラーメッセージを最適化
- Asynchronous Materialized Views
  - 透明リライトプランニングの性能を最適化
- Query Optimizer
  - `group_concat`関数で非文字列型パラメータを許可
  - `sum`と`avg`関数で非数値型パラメータを許可
  - TOP-Nクエリでの遅延マテリアライゼーションサポート範囲を拡張し、部分カラムクエリ時の遅延マテリアライゼーションを有効化
  - パーティション作成時、listパーティションで`MAX_VALUE`の包含を許可
  - aggregateモデルTableの統計情報収集のサンプリング性能を最適化
  - 統計情報収集のサンプリング時のNDV値の精度を最適化
- Inverted Index
  - `show create table`でのinverted indexプロパティ表示順序を統一
  - inverted indexフィルター条件の条件別プロファイルメトリック（ヒット行数、実行時間など）を追加し、性能分析を促進
  - プロファイルでのinverted index関連情報表示を強化
- Permissions
  - Rangerでstorage vaultとcompute groupの権限設定をサポート

バグ修正

- Data Ingestion
  - マルチ文字セパレータを持つCSVファイルインポート時の正確性問題を修正
  - タスクプロパティ変更後の`ROUTINE LOAD`タスク表示結果が不正な問題を修正
  - プライマリノード再起動またはLeader切り替え後にone-stream multi-tableインポートプランが無効になる問題を修正
  - `ROUTINE LOAD`タスクが利用可能なBEノードを見つけられないため、すべてのスケジュールタスクがブロックされる問題を修正
  - `runningTxnIds`の同時読み書き競合問題を修正
- Primary Key Model
  - 高頻度同時インポート下でのmowTableのインポート性能を最適化
  - mowTableのfull compactionで削除データの領域を解放
  - 極端なシナリオでのmowTableの潜在的インポート失敗問題を修正
  - mowTableのcompaction性能を最適化
  - 同時インポートとスキーマ変更時のmowTableの潜在的正確性問題を修正
  - 空のmowTableでのスキーマ変更がインポートスタックやスキーマ変更失敗を引き起こす可能性のある問題を修正
  - mow delete bitmap cacheのメモリリーク問題を修正
  - スキーマ変更後のmowTableの潜在的正確性問題を修正
- Storage
  - compactionによるcloneプロセスでの欠落rowset問題を修正
  - autobucketの不正確なサイズ計算とデフォルト値問題を修正
  - bucketカラムによる潜在的正確性問題を修正
  - 単一カラムTableがリネームできない問題を修正
  - memtableの潜在的メモリリーク問題を修正
  - 空Table transaction writerでのサポートされていない操作の一貫性のないエラー報告問題を修正
- Storage-Compute Decoupled
  - File cacheに関する複数の修正
  - スキーマプロセス中のcumulative pointのロールバック問題を修正
  - バックグラウンドタスクが自動再起動に影響する問題を修正
  - azure環境でのデータリサイクルプロセスでの未処理例外問題を修正
  - 単一rowsetのcompact時にfile cacheが適時クリーンアップされない問題を修正
- レイクハウス
  - Kerberos環境でのIcebergTable書き込みのトランザクションコミット失敗問題を修正
  - kerberos環境でのhudiクエリ問題を修正
  - マルチCatalogシナリオでの潜在的デッドロック問題を修正
  - 一部のケースでの同時Catalog refresh によるメタデータ非一致問題を修正
  - 一部のケースでORCフッターが複数回読み取られる問題を修正
  - Table Valued Functionが圧縮jsonファイルを読み取れない問題を修正
  - SQL サーバー CatalogでIDENTITYカラム情報の識別をサポート
  - SQL ConvertorでHAのための複数URL指定をサポート
- Asynchronous Materialized Views
  - クエリが空の結果セットに最適化された場合のパーティション補償が不正に実行される可能性のある問題を修正
- Query Optimizer
  - `sql_select_limit`以外の要因がDML実行結果に影響する問題を修正
  - local shuffle開始時にmaterialized CTEが極端なケースでエラーを報告する可能性のある問題を修正
  - 非マスターノードでprepared insert文が実行できない問題を修正
  - `ipv4`から文字列へのキャスト時の結果エラー問題を修正
- Permissions
  - ユーザーに複数ロールがある場合、複数ロールの権限を認可前にマージ
- Query Execution
  - 一部のjson関数での問題を修正
  - 非同期スレッドプールが満杯の場合の潜在的なBE Core問題を修正
  - `hll_to_base64`の不正な結果問題を修正
  - `decimal256`からfloatへのキャスト時の結果エラー問題を修正
  - 2つのメモリリーク問題を修正
  - `bitmap_from_base64`によるbe core問題を修正
  - `array_map`関数による潜在的be core問題を修正
  - `split_by_regexp`関数の潜在的エラー問題を修正
  - 極端に大きなデータ量での`bitmap_union`関数の潜在的結果エラー問題を修正
  - 一部の境界値での`format round`関数の潜在的core問題を修正
- Inverted Index
  - 異常な状況でのinverted indexのメモリリーク問題を修正
  - 空インデックスファイルの書き込み・クエリ時のエラー報告問題を修正
  - inverted index文字列読み取りでのIO例外をキャッチし、例外によるプロセスクラッシュを回避
- Complex Data Types
  - Variant Nestedデータ型衝突時の潜在的型推論エラーを修正
  - `map`関数のパラメータ型推論エラーを修正
  - jsonpathで`'$.'`をパスとして指定した際のデータが不正にNULLに変換される問題を修正
  - Variantのサブフィールドに`.`が含まれる場合のシリアライゼーション形式復元不能問題を修正
- Others
  - auditlogTableのIPフィールド長不足問題を修正
  - SQL解析失敗時にaudit logに記録されるクエリidが前のクエリのものになる問題を修正

### Enterprise Core 3.0.6
リリース日: 2025年6月20日

動作の変更
- UniqueTableでの時系列Compactionの使用を禁止
- ストレージ・コンピュート分離シナリオで、デフォルトのAuto Bucketサイズを10GBに調整

新機能
- レイクハウス
  - AWS S3 Table BucketのIcebergTableフォーマットアクセスをサポート
- Storage
  - オブジェクトストレージアクセスでIAM Role認証をサポート、import/export、backup/restore、ストレージ・コンピュート分離に適用
- New Functions
  - json_extract_no_quotes
  - unhex_null
  - xpath_string
  - str_to_map
  - months_between
  - next_day
  - format_round

改善
- Import
  - ブラックリスト機能を導入: Routine Loadが利用できないBEノードへメタデータを配布しないように防止
  - 高優先度loadの閾値を増加: `load_task_high_priority_threshold_second`のデフォルト値を上昇
- Primary Key Model
  - 冗長なログ出力を削減
- Storage 最適化
  - コンパクション ProfileとログをシンプルにSimplified 
  - スケジューリング戦略を改善してCompactionスループットを向上
- Storage-Compute Separation
  - 起動最適化: File Cacheの初期化を高速化
  - クエリ高速化: File Cacheクエリ性能を最適化
  - メタデータアクセス最適化: `get_version`による性能ボトルネックに対処
  - オブジェクトリサイクル高速化: 分離モードでのガベージコレクション効率を改善
  - 安定性向上: オブジェクトストレージのリトライ戦略を最適化
  - Profile粒度: Tablet/Segment Footerレベルメトリクスを強化
  - スキーマ変更フォルトトレランス: -230エラー回避のため、New Tablet Compactionをデフォルトで有効化
- レイクハウス
  - Hive CatalogでパーティションキャッシュのTTL制御をサポート（`partition.cache.ttl-second`）
  - HiveTableプロパティ`skip.header.line.count`をサポート
  - `org.openx.data.jsonserde.JsonSerDe`フォーマット使用のHiveTableと互換
  - Paimonをバージョン1.0.1にアップグレード
  - Icebergをバージョン1.6.1にアップグレード
  - Alibaba Cloud OSS-HDFS Root Policyをサポート
  - Dialect互換性: Hiveフォーマットクエリ結果を返却
  - ドキュメント参照: SQL Converter
- Asynchronous Materialized Views
  - メモリ最適化: 透明リライトでのメモリ使用量を削減
- Query Optimizer
  - バケットプルーニングの性能を改善
  - Lambda式の強化: 外部スロット参照をサポート
- Query Execution
  - TopNクエリ高速化: コンピュート・ストレージ分離での性能最適化
  - 関数拡張: `substring_index`で可変引数をサポート
  - Geo関数: ST_CONTAINS、ST_INTERSECTS、ST_TOUCHES、ST_DISJOINTを追加
- Core Components
  - メモリ追跡最適化: 高同時実行で10%性能改善
  - Audit Logの強化: `audit_plugin_max_insert_stmt_length`でINSERT文長を制限
  - ドキュメント参照: Audit Plugin
  - SQL Converter制御: セッション変数`sql_convertor_config`と`enable_sql_convertor_features`を追加
  - ドキュメント参照: SQL Converter

バグ修正
- Import
  - BEトランザクションのクリーンアップ失敗を修正
  - Routine Loadタスクでのエラー精度を改善
  - `disable_load=true`ノードへのメタデータタスク配布を禁止
  - FE再起動後の消費オフセットロールバックを解決
  - Group CommitとSchema Changeの競合によるCore Dumpを解決
  - S3 LoadでのHTTPSプロトコルエラーを修正
- Primary Key Model
  - 競合条件によるキー重複を修正
- Storage
  - CCRとディスクバランシング間の競合を解決
  - デフォルトパーティションキーが永続化されない問題を修正
  - CCRでRollupTableをサポート
  - `cooldown_ttl=0`境界条件を修正
  - GCとpublishの競合によるデータ損失を防止
  -
