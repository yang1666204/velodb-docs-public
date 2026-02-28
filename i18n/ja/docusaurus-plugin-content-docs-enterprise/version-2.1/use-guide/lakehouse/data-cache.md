---
{
  "title": "データキャッシュ",
  "description": "Data Cacheは、リモートストレージシステム（HDFSまたはオブジェクト",
  "language": "ja"
}
---
Data Cacheは、リモートストレージシステム（HDFSまたはオブジェクトストレージ）から最近アクセスされたデータファイルをローカルディスクにキャッシュすることで、同じデータの後続のクエリを高速化します。同じデータに頻繁にアクセスするシナリオでは、Data Cacheは繰り返されるリモートデータアクセスのオーバーヘッドを回避し、ホットデータのクエリ分析のパフォーマンスと安定性を向上させることができます。

## 適用シナリオ

データキャッシュ機能は、Hive、Iceberg、Hudi、およびPaimonTableのクエリにのみ動作します。内部Tableのクエリや非ファイル外部Tableのクエリ（JDBCやElasticsearchなど）には効果がありません。

データキャッシュがクエリ効率を改善できるかどうかは、複数の要因に依存します。以下は、データキャッシュの適用シナリオです：

* 高速ローカルディスク

  データキャッシュディレクトリには、SSDやNVMEメディアローカルディスクなどの高速ローカルディスクの使用を推奨します。機械式ハードドライブをデータキャッシュディレクトリとして使用することは推奨されません。本質的に、ローカルディスクのIO帯域幅とIOPSは、ネットワーク帯域幅とソースストレージシステムのIO帯域幅およびIOPSよりも大幅に高くなければ、顕著なパフォーマンスの改善をもたらすことができません。

* 十分なキャッシュ容量サイズ

  データキャッシュは、キャッシュ退避ポリシーとしてLRU戦略を使用します。クエリされるデータにホットとコールドの明確な区別がない場合、キャッシュされたデータが頻繁に更新および置換される可能性があり、クエリパフォーマンスが低下する可能性があります。クエリパターンにホットとコールドの明確な区別があるシナリオ（例：ほとんどのクエリは今日のデータのみにアクセスし、履歴データにはほとんどアクセスしない）で、キャッシュ容量がホットデータを保存するのに十分である場合に、データキャッシュを有効にすることを推奨します。

* リモートストレージの不安定なIOレイテンシ

  この状況は通常HDFSストレージで発生します。多くの企業では、異なるビジネス部門が同じHDFSを共有しており、ピーク期間中に非常に不安定なIOレイテンシが発生する可能性があります。この場合、安定したIOレイテンシを確保する必要がある場合は、データキャッシュを有効にすることを推奨します。ただし、最初の2つの条件も考慮する必要があります。

## Data Cacheの有効化

データキャッシュ機能はデフォルトで無効になっており、FEとBEで関連パラメータを設定することで有効にする必要があります。

### BE設定

まず、`be.conf`でキャッシュパス情報を設定し、BEノードを再起動して設定を有効にします。

| パラメータ            | 必須 | 説明                              |
| ------------------- | --- | -------------------------------------- |
| `enable_file_cache` | はい   | Data Cacheを有効にするかどうか、デフォルトはfalse               |
| `file_cache_path`   | はい   | キャッシュディレクトリに関する設定、JSON形式。                      |
| `clear_file_cache`  | いいえ   | デフォルトはfalse。trueの場合、BEノードの再起動時にキャッシュディレクトリがクリアされます。 |

`file_cache_path`の設定例：

```sql
file_cache_path=[{"path": "/path/to/file_cache1", "total_size":53687091200},{"path": "/path/to/file_cache2", "total_size":53687091200},{"path": "/path/to/file_cache3", "total_size":53687091200}]
```
`path`はキャッシュが保存されるパスで、1つ以上のパスを設定できます。ディスクごとに1つのパスのみを設定することを推奨します。

`total_size`はキャッシュ容量サイズの上限で、単位はバイトです。キャッシュ容量を超えた場合、LRU戦略を使用してキャッシュされたデータを削除します。

### FE 構成

単一セッションでData Cacheを有効にする:

```sql
SET enable_file_cache = true;
```
Data Cacheをグローバルに有効化する：

```sql
SET GLOBAL enable_file_cache = true;
```
`enable_file_cache`が有効でない場合、BEにキャッシュディレクトリが設定されていてもキャッシュは使用されないことに注意してください。同様に、BEにキャッシュディレクトリが設定されていない場合、`enable_file_cache`が有効でもキャッシュは使用されません。

## Cache オブザーバビリティ

### キャッシュヒット率の確認

`set enable_profile=true`を実行してセッション変数を有効にすると、FE Webページの`Queries`タブでジョブのProfileを確認できます。データキャッシュ関連のメトリクスは以下の通りです：

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

* `NumLocalIOTotal`: ローカルキャッシュでのIO操作数。

* `NumRemoteIOTotal`: リモートIO操作数。

* `WriteCacheIOUseTimer`: キャッシュ書き込みのIO時間。

`BytesScannedFromRemote`が0の場合、キャッシュが完全にヒットしたことを意味します。

### Monitoring Metrics

ユーザーはシステムTable`file_cache_statistics`を通じて、各BackendノードのキャッシュStatisticsを確認できます。

## 付録

### Principle

データキャッシングは、アクセスされたリモートデータをローカルBEノードにキャッシュします。元のデータファイルは、アクセスされたIOサイズに基づいてBlocksに分割され、Blocksはローカルファイル`cache_path/hash(filepath).substr(0, 3)/hash(filepath)/offset`に保存され、BlockメタデータはBEノードに保存されます。同一のリモートファイルにアクセスする際、dorisはファイルのキャッシュデータがローカルキャッシュに存在するかを確認し、Blockのoffsetとサイズに基づいてローカルBlockから読み取るデータとリモートから取得するデータを決定し、新たに取得したリモートデータをキャッシュします。BEノードが再起動すると、`cache_path`ディレクトリをスキャンしてBlockメタデータを復元します。キャッシュサイズが上限に達すると、LRU原理に従って長時間使用されていないBlocksをクリーンアップします。
