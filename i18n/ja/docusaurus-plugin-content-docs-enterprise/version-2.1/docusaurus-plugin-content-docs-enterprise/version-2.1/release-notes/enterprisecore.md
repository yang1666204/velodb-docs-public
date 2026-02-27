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

- Dereference Expressionsのサポート [#58550](https://github.com/apache/doris/pull/58550)

Data Lake & External Catalogs

- CatalogがAwsCredentialsProviderChain経由でのクレデンシャル読み込みをサポート [#59054](https://github.com/apache/doris/pull/59054)
- S3アクセス用にBEへのcredentials_provider_type渡しをサポート [#59158](https://github.com/apache/doris/pull/59158)
- Elasticsearchのflattenデータタイプをサポート [#58793](https://github.com/apache/doris/pull/58793)

Observability & Audit

- 監査ログに保存されるSQL文の暗号化をサポート [#58508](https://github.com/apache/doris/pull/58508)
- QueryPlanActionがテーブルクエリプランからの SQL を監査ログに書き込むことをサポート [#59121](https://github.com/apache/doris/pull/59121)
- Nereidsによって解析された文のSQL Digestを生成 [#59215](https://github.com/apache/doris/pull/59215)

最適化と改良

Query Engine

- 型推論と強制変換の動作を調整し、式の一貫性を向上 [#57961](https://github.com/apache/doris/pull/57961)
- 分析タスクによる列統計キャッシュの汚染を防ぎ、統計の精度を向上 [#58742](https://github.com/apache/doris/pull/58742)
- 複数のDISTINCT集計関数を持つクエリの実行を改良 [#58973](https://github.com/apache/doris/pull/58973)
- Join / Set / CTE / 述語プッシュダウンルールを最適化し、不要なプランの複雑性を回避 [#58664](https://github.com/apache/doris/pull/58664), [#59141](https://github.com/apache/doris/pull/59141), [#59151](https://github.com/apache/doris/pull/59151)

Data Lake & External Catalogs

- Hiveパーティションプルーニングと書き込みパフォーマンスを加速し、大きなパーティション化されたテーブルの書き込み遅延を大幅に削減 [#58886](https://github.com/apache/doris/pull/58886), [#58932](https://github.com/apache/doris/pull/58932)
- IcebergがダングリングデリートのCOUNTプッシュダウンを改善するために無視をサポート [#59069](https://github.com/apache/doris/pull/59069)
- Iceberg REST Catalogの接続チェックとネットワークタイムアウト処理を強化 [#58433](https://github.com/apache/doris/pull/58433), [#58434](https://github.com/apache/doris/pull/58434)
- 単一スナップショットシナリオでPaimon増分クエリの動作をSparkと整合 [#58253](https://github.com/apache/doris/pull/58253)

Doris Cloud (コンピュート・ストレージ分離)

- タブレットリバランサー設定の動的更新をサポートし、クラウド環境での運用柔軟性を向上 [#58376](https://github.com/apache/doris/pull/58376)
- コンピュート・ストレージ分離シナリオでのTopNクエリを最適化し、不要なリモートブロードキャスト読み取りを回避 [#58112](https://github.com/apache/doris/pull/58112), [#58155](https://github.com/apache/doris/pull/58155)
- アップグレードプロセス中のタブレットパフォーマンス一貫性を改善し、ホットスポットリスクを軽減 [#58247](https://github.com/apache/doris/pull/58247)
- Schema Change中にFile Cacheを適応的にし、大きなテーブルのキャッシュ影響を軽減 [#58622](https://github.com/apache/doris/pull/58622)
- クエリプロファイルにダウンロード待機時間メトリクスを追加し、IO観測性を向上 [#58870](https://github.com/apache/doris/pull/58870)
- LRUダンプサポートでFile Cacheデバッグ機能を強化 [#58871](https://github.com/apache/doris/pull/58871)

Security & Stability

- 外部カタログセキュリティを向上させるためGlue CatalogでHTTPSを強制 [#58366](https://github.com/apache/doris/pull/58366)
- Create StageにSSRF検証を追加 [#58874](https://github.com/apache/doris/pull/58874)

バグ修正

Query Engine (Nereidsオプティマイザー)

- 特定のシナリオでTopN / Limit / Joinルールによって引き起こされる潜在的な無限ループを修正 [#58697](https://github.com/apache/doris/pull/58697)
- 集計、ウィンドウ関数、Repeat、型変換のロジックエラーを修正 [#58080](https://github.com/apache/doris/pull/58080), [#58114](https://github.com/apache/doris/pull/58114), [#58330](https://github.com/apache/doris/pull/58330), [#58548](https://github.com/apache/doris/pull/58548)

マテリアライズドビュー (MV)

- MOWテーブル上で値列述語を持つ無効なマテリアライズドビューの作成を禁止 [#57937](https://github.com/apache/doris/pull/57937)

データインジェスト

- JSON Readerの複数回呼び出しによって引き起こされる未定義動作を修正し、潜在的なデータ破損を防止 [#58192](https://github.com/apache/doris/pull/58192)
- Broker Loadでの`COLUMNS FROM PATH`に関連する不正な動作を修正 [#58351](https://github.com/apache/doris/pull/58351), [#58904](https://github.com/apache/doris/pull/58904)
- ノードがオフラインまたは退役したときのGroup Commitの異常な動作を修正 [#59118](https://github.com/apache/doris/pull/59118)
- 特定のエッジ条件下でのLoad / Delete / Partial Updateの失敗を修正 [#58553](https://github.com/apache/doris/pull/58553), [#58230](https://github.com/apache/doris/pull/58230), [#59096](https://github.com/apache/doris/pull/59096)

Doris Cloud (コンピュート・ストレージ分離)

- Tablet Drop、Compaction、起動時の低速を含むコンピュート・ストレージ分離シナリオでの安定性問題を修正 [#58157](https://github.com/apache/doris/pull/58157), [#58195](https://github.com/apache/doris/pull/58195), [#58761](https://github.com/apache/doris/pull/58761)
- 異常な条件またはBE障害でのFile Cacheのクラッシュとリソースリークを修正 [#58196](https://github.com/apache/doris/pull/58196), [#58819](https://github.com/apache/doris/pull/58819), [#59058](https://github.com/apache/doris/pull/59058)
- コンパクション後のSegment Footer Cacheの未クリアによって引き起こされる異常な読み取り動作を修正 [#59185](https://github.com/apache/doris/pull/59185)
- ORC / ParquetフォーマットでのCopy Into実行時の失敗を修正 [#58551](https://github.com/apache/doris/pull/58551)


## Enterprise Core 3.0.x

### Enterprise Core 3.0.10
リリース日: 2025年11月20日

新機能

- MaxCompute Catalog: MaxCompute catalogでのproject-schema-table構造の読み取りサポートを追加
- Paimon Catalog: DLF統合によるPaimon RESTカタログのサポートを追加
- JDBC Catalog: DM（Dameng）データベースのnvarcharデータタイプのサポートを追加

改良

- MTMV: ベーステーブルのスキーマ変更によってネストされたMTMVがスキーマ変更ステータスに入らなくなりました
- Routine Load: トランザクション失敗時にスケジュールを遅延させることでタスクスケジューリングを最適化
- String Performance: 文字列のシリアライゼーションとデシリアライゼーションのパフォーマンスを向上
- I/O最適化: より良いI/Oチューニングのために読み取りスライスサイズを設定可能にしました

バグ修正

データタイプ

- decimal256からfloat型へのキャスト時の不安定なオーバーフローエラーを修正
- FEチェックポイントと再起動後の自動インクリメント値割り当ての不正を修正

関数

- explode関数によって引き起こされるクラッシュ問題を修正
- datetimev1型のtimestampdiff関数の不正な計算結果を修正

カタログ

- Icebergカタログでのnullポインター例外問題を修正
- max_meta_object_cache_num設定の要件検証を修正し、値が0より大きいことを確保
- CREATEまたはALTER操作中にカタログがリフレッシュキューから不正に削除される問題を修正
- zeroDateTimeBehavior=convertToNullの異なるバージョンの書き込み方法との互換性を向上
- クエリテーブル値関数のJDBCテーブルIDの不正な割り当てを修正

Nereidsオプティマイザー

- Profile.releaseMemory()メソッドで物理プランを解放することでメモリリークを修正
- Java UDFのプロジェクトマージ機能を有効化
- ReorderJoinルールがマークジョインをマルチジョインに不正に吸収する問題を修正
- 比較述語の単純化最適化によって引き起こされる精度損失とnullキャストの問題を修正

MTMV

- パーティションテーブルにパーティションがない場合のリフレッシュ失敗を修正

エクスポート

- エラー発生後にエクスポートジョブがキャンセルされない可能性がある問題を修正

HDFS

- プロファイル収集中のHDFSリーダーでのバックエンドコアダンプ問題を修正

その他

- show create viewコマンドが列定義を表示しない問題を修正
- kill connectionコマンドが現在の接続を誤って終了する問題を修正
- 非マスターノードでeditlogが書き込まれる問題を修正

### Enterprise Core 3.0.9
リリース日: 2025年10月25日

動作変更
- デフォルトでzstd圧縮を使用

- ranger / LDAPを使用する際、VeloDBでのユーザー作成が禁止されなくなりました

- `variant`の`nested`属性はデフォルトで無効になっています。テーブル作成時に有効にするには、まずセッション変数で以下のコマンドを実行する必要があります: `set enable_variant_flatten_nested = true`

新機能

- DM（Dameng）とKingBase JDBC Catalogサポートを追加

- CSVエクスポートで圧縮をサポート

- Hive CatalogでPresto Viewをサポート

- MySQLの`GROUP BY WITH ORDER`構文をサポート

改良

- バックアップメタ情報が2GBを超えるサイズをサポート

- count(*)実行時、列プルーニングで子ノードの最小列を選択可能

- LDAPが有効な場合にshow grantコマンドを実行可能

- パーティション別に転置インデックスフォーマットV2のローリングアップグレード機能を提供し、バージョン2.1から3.0にアップグレードするユーザーがインデックスフォーマット移行を段階的に完了できるようサポート

- メモリ不足時のフラッシュ戦略を最適化

- S3 LoadとTVFでAK/SKなしでパブリック読み取り可能オブジェクトへのアクセスをサポート

- キャッシュスペースが十分な場合、ベースコンパクションによって生成されたrowsetをファイルキャッシュに書き込み可能

- `ALTER STORAGE VAULT`コマンドを最適化し、`type`属性を明示的に指定せずに自動推論可能

- ポイントクエリが1つのフラグメントのみを持つようプランされ、ポイントクエリの実行速度を向上

- ユニークキーテーブルのポイントクエリパフォーマンスを向上

- トークン化されていないインデックスを書き込む際の共通デフォルトトークナイザーの追加リソース消費を最適化

バグ修正

データインジェスト

- マルチバイト列区切り文字使用時の`enclose`解析エラーを修正

- S3 Loadの進捗が適時更新されない問題を修正

- JSON boolean型をINT列にロードする際のエラーを修正

- Stream Loadでエラーurl戻り値が欠落する問題を修正

- スキーマ変更で例外が発生した後にgroup commitがブロックされる問題を修正

- Routine loadでコンピュートグループIDの代わりにコンピュートグループ名を使用してコンピュートグループを選択

- メモリ制限を超えた場合にroutine loadがスケジュールを停止する問題を修正

クエリオプティマイザー

- 一部の自己結合シナリオでcolocate joinが誤って使用される問題を修正

- `select distinct`がウィンドウ関数と使用される際の潜在的な結果エラーを修正

- 予期しない位置にlambda式が現れる場合により使いやすいエラーメッセージを提供

権限

- 外部ビューをクエリする際にベーステーブル権限が誤ってチェックされる問題を修正

クエリ実行

- IPV6タイプがIPV4タイプデータを解析できない問題を修正

- IPV6タイプ解析時のスタックオーバーフローエラーを修正

- SSLモードでクエリが失敗する可能性がある問題を修正

- rollupを持つテーブルへのデータインポート時の型不一致エラーを修正

- topNクエリがコアダンプを引き起こす可能性がある問題を修正

- array_agg_foreach関数の不正な結果を修正

複雑なデータタイプ

- BEで起動時に命令セットに一致するsimdJsonパーサーの選択をサポート

- variantネストデータタイプでのデータタイプ競合による誤った型推論を修正

- variantネストトップレベルのネスト配列データのデフォルト値填充問題を修正

- クラウドでvariantタイプのインデックス構築を禁止

- variantの転置インデックス作成後、インデックス条件を満たさないデータ書き込み時の空インデックスファイル生成問題を修正

- variant型列を追加するalter後にクエリがクラッシュする可能性がある問題を修正

- variant型が空文字列をNULLにキャストする問題を修正

- arrayがjsonサブタイプをサポートしない問題を修正

- bz2圧縮での小ファイル出力を修正

- 空文字列がNULL(JSONB)にキャストされるべき問題を修正

- `_sub_column_tree`への並行アクセスによるスレッドセーフティ問題を解決

レイクハウス

- Hive
  
  - 一部のケースでKerberos認証でHive Metastoreアクセスが失敗する問題を修正
  
  - Hiveテーブルの`serialization.null.format`プロパティが正しく認識されない問題を修正
  
  - Hiveテーブルパーティションの中国語文字による重複パーティションID問題を修正
  
  - Alibaba Cloud OSS-HDFSに格納されたHiveテーブルへの書き込み失敗を修正

- Iceberg
  
  - decimalパーティションを持つicebergテーブルへの書き込み失敗問題を修正

- Paimon
  
  - JNIを使用してPaimonデータを読み取る際にタイムゾーン情報が失われる問題を修正
  
  - Paimonテーブル読み取り時にlazy materialization最適化が正しくトリガーされない問題を修正

- Hudi
  
  - JNIを使用してHudiテーブルパーティション列読み取りが失敗する問題を修正
  
  - 一部のケースでHudiテーブルTimestamp型パーティション列のクエリ失敗問題を修正

- JDBC
  
  - 特定の予約キーワードがJDBC Catalogでアクセス失敗を引き起こす問題を修正
  
  - 一部のケースでJDBC SQLパススルー解析失敗問題を修正

- MaxCompute
  
  - MaxCompute Catalogで述語プッシュダウンが列を見つけられない問題を修正
  
  - Alibaba Cloud International MaxComputeアクセスを阻止する問題を修正

- ES
  
  - ES Catalogでの特殊時間フォーマットの不正な処理問題を修正

- その他
  
  - 特定のケースでExternal CatalogでDatabase IDとTable IDが不正に生成される問題を修正

その他

- 失敗したSCタスククリーンアップ時に新しいタブレットが空になる問題を修正

- 元の順序でバケット列を再構築

- バケット列の削除を禁止

- ネットワークエラーの場合の自動リトライをサポート

- `tabletInvertedIndex`でのデッドロックを回避

- 同じ名前のテーブルとパーティションの並行作成・削除時にFEが終了する可能性がある問題を修正

- スキーマ変更表現の不正な再利用問題を修正

- 自動パーティション分割で新しいパーティションを作成する際の occasional load failure問題を修正

- メモリ破損によってcoredumpが引き起こされる可能性がある問題を修正

- バックアップ中にパーティションやテーブルが削除される際のエラー問題を修正

### Enterprise Core 3.0.7
リリース日: 2025年8月25日

動作変更
- `show frontends`と`show backends`の権限要件を対応するRESTful APIに合わせて調整し、`information_schema`データベースでの`SELECT_PRIV`権限が必要になりました
- 指定されたドメインを持つadminとrootユーザーはシステムユーザーとは見なされなくなりました
- ストレージ: データベースあたりのデフォルト同時トランザクション数を10000に調整

新機能

- クエリオプティマイザー
  - MySQLの集計ロールアップ構文`GROUP BY ... WITH ROLLUP`をサポート
- クエリ実行
  - `Like`文で`escape`構文をサポート
- 半構造化データ管理
  - セッション変数`enable_add_index_for_new_data=true`を設定することで、新しいデータのみに対する非トークン化転置インデックスとngram bloomfilterインデックスの構築をサポート
- 新関数
  - データ関数を追加: `cot`/`sec`/`cosec`

改良
- データインジェスト
  - `SHOW CREATE LOAD`のエラーメッセージプロンプトを最適化
- プライマリキーモデル
  - セグメントキー境界切り捨て機能を追加し、単一の大規模インポート失敗を回避
- ストレージ
  - コンパクションとインポートデータの信頼性を向上
  - バランス速度を最適化
  - テーブル作成速度を最適化
  - コンパクションのデフォルトパラメータと観測性を最適化
  - クエリエラー-230問題を最適化
  - システムテーブル`backend_tablets`を追加
  - クラウドモードのフォロワーノードから`information_schema.tables`をクエリするパフォーマンスを最適化
- ストレージ・コンピュート分離
  - Meta-service recyclerの観測性を向上
  - インポートコンパクション中のクロスコンピュートグループ増分プレヒーティングをサポート
  - Storage vaultの接続性チェックを最適化
  - MS APIを通じたストレージバックエンド情報の更新をサポート
- レイクハウス
  - x86環境でのORC zlib解凍パフォーマンスを最適化し、潜在的な問題を修正
  - 外部テーブル読み取りのデフォルト並行スレッド数を最適化
  - DDL操作をサポートしないCatalogのエラーメッセージを最適化
- 非同期マテリアライズドビュー
  - 透明書き換えプランニングのパフォーマンスを最適化
- クエリオプティマイザー
  - `group_concat`関数で非文字列型パラメータを許可
  - `sum`と`avg`関数で非数値型パラメータを許可
  - TOP-Nクエリでの遅延マテリアライゼーションのサポート範囲を拡大し、部分列クエリ時の遅延マテリアライゼーションを有効化
  - パーティション作成時、リストパーティションで`MAX_VALUE`を含めることを許可
  - 集計モデルテーブルのサンプリングと統計情報収集のパフォーマンスを最適化
  - サンプリングと統計情報収集時のNDV値の精度を最適化
- 転置インデックス
  - `show create table`での転置インデックス表示プロパティの順序を統一
  - 転置インデックスフィルター条件ごとのプロファイルメトリクス（ヒット行数と実行時間など）を追加してパフォーマンス分析を容易に
  - プロファイルでの転置インデックス関連情報表示を強化
- 権限
  - Rangerでstorage vaultとcompute groupの権限設定をサポート

バグ修正

- データインジェスト
  - マルチバイト区切り文字を持つCSVファイルインポート時に発生する可能性がある正確性問題を修正
  - タスクプロパティ変更後の`ROUTINE LOAD`タスク表示結果が不正な問題を修正
  - プライマリノード再起動またはリーダー切り替え後のワンストリーム・マルチテーブルインポートプランが無効になる問題を修正
  - `ROUTINE LOAD`タスクが利用可能なBEノードを見つけられないためにすべてのスケジューリングタスクがブロックされる問題を修正
  - `runningTxnIds`の並行読み書き競合問題を修正
- プライマリキーモデル
  - 高頻度並行インポート下でのmowテーブルのインポートパフォーマンスを最適化
  - mowテーブルフルコンパクションで削除データのスペースを解放
  - 極端なシナリオでのmowテーブルの潜在的インポート失敗問題を修正
  - mowテーブルのコンパクションパフォーマンスを最適化
  - 並行インポートとスキーマ変更中のmowテーブルの潜在的正確性問題を修正
  - 空のmowテーブルでのスキーマ変更がインポートスタックやスキーマ変更失敗を引き起こす可能性がある問題を修正
  - mow delete bitmapキャッシュのメモリリーク問題を修正
  - スキーマ変更後のmowテーブルの潜在的正確性問題を修正
- ストレージ
  - コンパクションによるクローンプロセスでの欠落rowset問題を修正
  - autobacketのサイズ計算とデフォルト値の不正確性問題を修正
  - バケット列による潜在的正確性問題を修正
  - 単一列テーブルがリネームできない問題を修正
  - memtableの潜在的メモリリーク問題を修正
  - 空テーブルトランザクション書き込みでサポートされない操作の不一致エラー報告問題を修正
- ストレージ・コンピュート分離
  - File cacheのいくつかの修正
  - スキーマプロセス中のcumulative pointロールバック問題を修正
  - バックグラウンドタスクが自動再起動に影響する問題を修正
  - azure環境でのデータリサイクルプロセスでの未処理例外問題を修正
  - 単一rowsetコンパクション時のファイルキャッシュのタイムリーなクリーンアップされない問題を修正
- レイクハウス
  - Kerberos環境でのIcebergテーブル書き込みのトランザクションコミット失敗問題を修正
  - kerberos環境でのhudiクエリ問題を修正
  - マルチCatalogシナリオでの潜在的デッドロック問題を修正
  - 一部のケースでの並行Catalogリフレッシュによるメタデータ不整合問題を修正
  - 一部のケースでORCフッターが複数回読み取られる問題を修正
  - Table Valued Functionが圧縮jsonファイルを読み取れない問題を修正
  - SQL Server CatalogでIDENTITY列情報の識別をサポート
  - SQL Convertorで高可用性のための複数URL指定をサポート
- 非同期マテリアライズドビュー
  - クエリが空の結果セットに最適化される際にパーティション補正が誤って実行される可能性がある問題を修正
- クエリオプティマイザー
  - `sql_select_limit`以外の要因がDML実行結果に影響する問題を修正
  - ローカルシャッフルを開始する際にマテリアライズドCTEが極端なケースでエラーを報告する可能性がある問題を修正
  - 準備されたinsert文が非マスターノードで実行できない問題を修正
  - `ip
