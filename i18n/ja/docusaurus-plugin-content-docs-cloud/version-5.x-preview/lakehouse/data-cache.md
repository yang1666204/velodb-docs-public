---
{
  "title": "データキャッシュ",
  "description": "Data Cacheは、リモートストレージシステム（HDFSまたはオブジェクト",
  "language": "ja"
}
---
Data Cacheは、リモートストレージシステム（HDFSまたはオブジェクトストレージ）から最近アクセスされたデータファイルをローカルディスクにキャッシュすることで、同じデータの後続のクエリを高速化します。同じデータに頻繁にアクセスするシナリオでは、Data Cacheは繰り返されるリモートデータアクセスのオーバーヘッドを回避し、ホットデータに対するクエリ分析のパフォーマンスと安定性を向上させることができます。

## 適用シナリオ

データキャッシュ機能は、Hive、Iceberg、Hudi、およびPaimonテーブルに対するクエリでのみ動作します。内部テーブルクエリや非ファイル外部テーブルクエリ（JDBCやElasticsearchなど）には効果がありません。

データキャッシュがクエリ効率を改善できるかどうかは、複数の要因に依存します。以下は、データキャッシュの適用シナリオです：

* 高速ローカルディスク

  データキャッシュディレクトリとして、SSDやNVMEメディアローカルディスクなどの高速ローカルディスクを使用することを推奨します。データキャッシュディレクトリとして機械式ハードドライブを使用することは推奨されません。基本的に、ローカルディスクのIO帯域幅とIOPSが、ネットワーク帯域幅およびソースストレージシステムのIO帯域幅とIOPSよりも大幅に高い必要があり、これにより目に見えるパフォーマンス向上をもたらします。

* 十分なキャッシュ容量サイズ

  データキャッシュは、キャッシュ削除ポリシーとしてLRU戦略を使用します。クエリされるデータにホットとコールドの明確な区別がない場合、キャッシュされたデータが頻繁に更新および置換される可能性があり、これによりクエリパフォーマンスが低下する場合があります。クエリパターンにホットとコールドの明確な区別がある（例：ほとんどのクエリが今日のデータのみにアクセスし、履歴データにはほとんどアクセスしない）シナリオで、かつキャッシュ容量がホットデータを格納するのに十分である場合に、データキャッシュを有効にすることを推奨します。

* リモートストレージの不安定なIOレイテンシ

  この状況は通常HDFSストレージで発生します。ほとんどの企業では、異なる事業部門が同じHDFSを共有しており、これによりピーク時間帯に非常に不安定なIOレイテンシが発生する可能性があります。この場合、安定したIOレイテンシを確保する必要がある場合は、データキャッシュを有効にすることを推奨します。ただし、最初の2つの条件も考慮する必要があります。

## Data Cacheの有効化

データキャッシュ機能はデフォルトで無効になっており、FEとBEで関連パラメータを設定することで有効にする必要があります。

### BE設定

まず、`be.conf`でキャッシュパス情報を設定し、BEノードを再起動して設定を有効にします。

| パラメータ            | 必須 | 説明                              |
| ------------------- | --- | -------------------------------------- |
| `enable_file_cache` | はい   | Data Cacheを有効にするかどうか、デフォルトはfalse               |
| `file_cache_path`   | はい   | キャッシュディレクトリに関する設定、JSON形式                      |
| `clear_file_cache`  | いいえ   | デフォルトはfalse。trueの場合、BEノードの再起動時にキャッシュディレクトリがクリアされます |

`file_cache_path`の設定例：

```sql
file_cache_path=[{"path": "/path/to/file_cache1", "total_size":53687091200},{"path": "/path/to/file_cache2", "total_size":53687091200},{"path": "/path/to/file_cache3", "total_size":53687091200}]
```
`path` はキャッシュが保存されるパスで、1つ以上のパスを設定できます。ディスクごとに1つのパスのみを設定することを推奨します。

`total_size` はキャッシュ領域サイズの上限値で、単位はバイトです。キャッシュ領域を超過した場合、LRU戦略を使用してキャッシュされたデータを削除します。

### FE Configuration

単一セッションでData Cacheを有効にする：

```sql
SET enable_file_cache = true;
```
Data Cacheをグローバルに有効にする：

```sql
SET GLOBAL enable_file_cache = true;
```
`enable_file_cache`が有効でない場合、BEがキャッシュディレクトリで設定されていてもキャッシュは使用されないことに注意してください。同様に、BEがキャッシュディレクトリで設定されていない場合、`enable_file_cache`が有効であってもキャッシュは使用されません。

## Cache Observability

### キャッシュヒット率の確認

`set enable_profile=true`を実行してセッション変数を有効にすると、FE webページの`Queries`タブでジョブのProfileを確認できます。データキャッシュ関連のメトリクスは以下の通りです：

```sql
-  FileCache:  0ns
    -  BytesScannedFromCache:  2.02  GB
    -  BytesScannedFromRemote:  0.00  
    -  BytesWriteIntoCache:  0.00  
    -  LocalIOUseTimer:  2s723ms
    -  NumLocalIOTotal:  444
    -  NumRemoteIOTotal:  0
    -  NumSkipCacheIOTotal:  0
    -  RemoteIOUseTimer:  0ns
    -  WriteCacheIOUseTimer:  0ns
```
* `BytesScannedFromCache`: ローカルキャッシュから読み取られたデータ量。

* `BytesScannedFromRemote`: リモートから読み取られたデータ量。

* `BytesWriteIntoCache`: キャッシュに書き込まれたデータ量。

* `LocalIOUseTimer`: ローカルキャッシュのIO時間。

* `RemoteIOUseTimer`: リモート読み取りのIO時間。

* `NumLocalIOTotal`: ローカルキャッシュでのIO操作の回数。

* `NumRemoteIOTotal`: リモートIO操作の回数。

* `WriteCacheIOUseTimer`: キャッシュへの書き込みのIO時間。

`BytesScannedFromRemote`が0の場合、キャッシュが完全にヒットしていることを意味します。

### Monitoring Metrics

ユーザーは、システムテーブル`file_cache_statistics`を通じて各Backendノードのキャッシュ統計を確認できます。

## Cache Warmup

Data Cacheは、外部データをBEノードのローカルキャッシュに事前読み込みすることで、後続の初回クエリのキャッシュヒット率とクエリパフォーマンスを向上させるキャッシュ「warmup」機能を提供します。

> この機能はバージョン4.0.2以降でサポートされています。

### Syntax

```sql
WARM UP SELECT <select_expr_list>
FROM <table_reference>
[WHERE <boolean_expression>]
```
使用制限:

* サポート対象:

  * 単一テーブルクエリ（一つのtable_referenceのみ許可）
  * 指定された列に対するシンプルなSELECT
  * WHERE フィルタリング（通常の述語をサポート）

* サポート対象外:

  * JOIN、UNION、サブクエリ、CTE
  * GROUP BY、HAVING、ORDER BY
  * LIMIT
  * INTO OUTFILE
  * マルチテーブル / 複雑なクエリプラン
  * その他の複雑な構文

### 例

1. テーブル全体をウォームアップする

  ```sql
  WARM UP SELECT * FROM hive_db.tpch100_parquet.lineitem;
  ```
2. パーティション別の部分カラムのウォームアップ

  ```sql
  WARM UP SELECT l_orderkey, l_shipmode
  FROM hive_db.tpch100_parquet.lineitem
  WHERE dt = '2025-01-01';
  ```
3. フィルター条件による部分カラムのウォームアップ

  ```sql
  WARM UP SELECT l_shipmode, l_linestatus
  FROM hive_db.tpch100_parquet.lineitem
  WHERE l_orderkey = 123456;
  ```
### 実行結果

`WARM UP SELECT`を実行した後、FEは各BEにタスクを配布します。BEはリモートデータをスキャンし、Data Cacheに書き込みます。

システムは各BEのスキャンおよびキャッシュ書き込み統計を直接返します（注：統計は一般的に正確ですが、多少の誤差がある場合があります）。例えば：

```
+---------------+-----------+-------------+---------------------------+----------------------------+---------------------+
| BackendId     | ScanRows  | ScanBytes   | ScanBytesFromLocalStorage | ScanBytesFromRemoteStorage | BytesWriteIntoCache |
+---------------+-----------+-------------+---------------------------+----------------------------+---------------------+
| 1755134092928 | 294744184 | 11821864798 | 538154009                 | 11283717130                | 11899799492         |
| 1755134092929 | 305293718 | 12244439301 | 560970435                 | 11683475207                | 12332861380         |
| TOTAL         | 600037902 | 24066304099 | 1099124444                | 22967192337                | 24232660872         |
+---------------+-----------+-------------+---------------------------+----------------------------+---------------------+
```
フィールドの説明：

* ScanRows: スキャンして読み取った行数。
* ScanBytes: スキャンして読み取ったデータ量。
* ScanBytesFromLocalStorage: ローカルキャッシュからスキャンして読み取ったデータ量。
* ScanBytesFromRemoteStorage: リモートストレージからスキャンして読み取ったデータ量。
* BytesWriteIntoCache: このウォームアップ中にData Cacheに書き込まれたデータ量。

## 付録

### 原理

データキャッシュは、アクセスされたリモートデータをローカルのBEノードにキャッシュします。元のデータファイルは、アクセスされたIOサイズに基づいてBlocksに分割され、Blocksはローカルファイル`cache_path/hash(filepath).substr(0, 3)/hash(filepath)/offset`に保存されます。BlockメタデータはBEノードに保存されます。同じリモートファイルにアクセスする際、dorisはローカルキャッシュにファイルのキャッシュデータが存在するかをチェックし、Blockのオフセットとサイズに基づいて、どのデータをローカルBlockから読み取り、どのデータをリモートから取得するかを判断して、新たに取得したリモートデータをキャッシュします。BEノードが再起動する際、`cache_path`ディレクトリをスキャンしてBlockメタデータを復元します。キャッシュサイズが上限に達すると、LRU原則に従って長期間未使用のBlocksをクリーンアップします。
