---
{
  "title": "Debug Point",
  "language": "ja"
}
---
# Debug Point

Debug pointは、FEまたはBEのコードに挿入されるコードの一部で、プログラムがこのコードに到達すると、

プログラムの変数や動作を変更することができます。

これは主に、通常の手段では例外をトリガーすることが不可能な場合の単体テストや回帰テストに使用されます。

各debug pointには名前があり、名前は任意のものにすることができます。debug pointを有効化および無効化するスイッチがあり、

debug pointにデータを渡すこともできます。

FEとBEの両方がdebug pointをサポートしており、debug pointのコードを挿入した後は、FEまたはBEの再コンパイルが必要です。

## Code Example

FEの例

```java
private Status foo() {
	// dbug_fe_foo_do_nothing is the debug point name
	// when it's active, DebugPointUtil.isEnable("dbug_fe_foo_do_nothing") returns true
	if (DebugPointUtil.isEnable("dbug_fe_foo_do_nothing")) {
      	return Status.Nothing;
    }
      	
    do_foo_action();
    
    return Status.Ok;
}
```
BE の例

```c++
void Status foo() {
     // dbug_be_foo_do_nothing is the debug point name
     // when it's active, DBUG_EXECUTE_IF will execute the code block
     DBUG_EXECUTE_IF("dbug_be_foo_do_nothing",  { return Status.Nothing; });
   
     do_foo_action();
     
     return Status.Ok;
}
```
## Global Config

デバッグポイントをグローバルに有効にするには、`enable_debug_points` を true に設定する必要があります。

`enable_debug_points` は FE の fe.conf と BE の be.conf に配置されています。


## 指定されたデバッグポイントのアクティベート

デバッグポイントがグローバルに有効になった後、デバッグポイント名を含む http リクエストを FE または BE ノードに送信する必要があります。<br/>
その後のみ、プログラムが指定されたデバッグポイントに到達した時に、関連するコードが実行されます。

### API

```
POST /api/debug_point/add/{debug_point_name}[?timeout=<int>&execute=<int>]
```
### Query Parameters

* `debug_point_name`
    デバッグポイント名。必須パラメータ。

* `timeout`
    タイムアウト（秒）。タイムアウト時、デバッグポイントは無効化されます。デフォルトは-1で、タイムアウトしません。オプション。

* `execute`
    有効化後、デバッグポイントが実行できる最大回数。デフォルトは-1で、無制限です。オプション。


### Request body

なし

### Response

```
{
    msg: "OK",
    code: 0
}
```
### Examples

debug point `foo` をアクティベートした後、最大5回まで実行されます。

```
curl -X POST "http://127.0.0.1:8030/api/debug_point/add/foo?execute=5"

```
## カスタムパラメータの渡し方
デバッグポイントをアクティブ化する際、上記で述べた"timeout"と"execute"以外にも、カスタムパラメータを渡すことが可能です。<br/>
パラメータは"key=value"形式のキー・バリューペアで、URLパス内でデバッグポイント名の後に'?'文字で結合します。<br/>
以下の例を参照してください。

### API

```
POST /api/debug_point/add/{debug_point_name}[?k1=v1&k2=v2&k3=v3...]
```
* `k1=v1` <br/>
  k1 はパラメータ名 <br/>
  v1 はパラメータ値 <br/>
  複数のkey-valueペアは `&` で連結される <br/>
  

  
### リクエストボディ

なし

### レスポンス

```
{
    msg: "OK",
    code: 0
}
```
### 例

fe.confでhttp_port=8030の設定を持つFEノードを想定して、<br/>
以下のhttpリクエストは、FEノード内の`foo`という名前のデバッグポイントをアクティブ化し、パラメータ`percent`と`duration`を渡します：
>注意: ユーザー名とパスワードが必要な場合があります。

```
curl -u root: -X POST "http://127.0.0.1:8030/api/debug_point/add/foo?percent=0.5&duration=3"
```
```
NOTE:
1. Inside FE and BE code, names and values of parameters are taken as strings.
2. Parameter names and values are case sensitive in http request and FE/BE code.
3. FE and BE share same url paths of REST API, it's just their IPs and Ports are different.
```
### FEとBEのコードでパラメータを使用する
以下のリクエストは、FEでデバッグポイント`OlapTableSink.write_random_choose_sink`を有効化し、パラメータ`needCatchUp`と`sinkNum`を渡します：

```
curl -u root: -X POST "http://127.0.0.1:8030/api/debug_point/add/OlapTableSink.write_random_choose_sink?needCatchUp=true&sinkNum=3"
```
FEのコードは、デバッグポイント`OlapTableSink.write_random_choose_sink`をチェックし、パラメータ値を取得します：

```java
private void debugWriteRandomChooseSink(Tablet tablet, long version, Multimap<Long, Long> bePathsMap) {
    DebugPoint debugPoint = DebugPointUtil.getDebugPoint("OlapTableSink.write_random_choose_sink");
    if (debugPoint == null) {
        return;
    }
    boolean needCatchup = debugPoint.param("needCatchUp", false);
    int sinkNum = debugPoint.param("sinkNum", 0);
    ...
}
```
以下のリクエストはBEでデバッグポイント`TxnManager.prepare_txn.random_failed`をアクティベートし、パラメータ`percent`を渡します：

```
curl -X POST "http://127.0.0.1:8040/api/debug_point/add/TxnManager.prepare_txn.random_failed?percent=0.7
```
BE内のコードはデバッグポイント`TxnManager.prepare_txn.random_failed`をチェックし、パラメータ値を取得します：

```c++
DBUG_EXECUTE_IF("TxnManager.prepare_txn.random_failed",
		{if (rand() % 100 < (100 * dp->param("percent", 0.5))) {
		        LOG_WARNING("TxnManager.prepare_txn.random_failed random failed");
		        return Status::InternalError("debug prepare txn random failed");
		}}
);
```
## Debug Pointの無効化

### API

```
	POST /api/debug_point/remove/{debug_point_name}
```
### Query Parameters

* `debug_point_name`
    デバッグポイント名。必須パラメータ。


### Request body

なし

### Response

```
{
    msg: "OK",
    code: 0
}
```
### Examples


デバッグポイント `foo` を無効にする。

```
curl -X POST "http://127.0.0.1:8030/api/debug_point/remove/foo"

```
## デバッグポイントのクリア

### API

```
POST /api/debug_point/clear
```
### Request body

なし

### Response

```
{
    msg: "OK",
    code: 0
}
```
### 例

```
curl -X POST "http://127.0.0.1:8030/api/debug_point/clear"
```
## Regression Testにおけるデバッグポイント

>コミュニティのCIシステムでは、FEとBEの`enable_debug_points`設定はデフォルトでtrueになっています。

Regression testフレームワークは、特定のデバッグポイントを有効化および無効化するメソッドも提供します。<br/>
これらは以下のように宣言されています：

```groovy
// "name" is the debug point to activate, "params" is a list of key-value pairs passed to debug point
def enableDebugPointForAllFEs(String name, Map<String, String> params = null);
def enableDebugPointForAllBEs(String name, Map<String, String> params = null);
// "name" is the debug point to deactivate
def disableDebugPointForAllFEs(String name);
def disableDebugPointForAllFEs(String name);
```
`enableDebugPointForAllFEs()` または `enableDebugPointForAllBEs()` は、エラーを生成したいテストアクションの前に呼び出す必要があり、<br/>
その後に `disableDebugPointForAllFEs()` または `disableDebugPointForAllBEs()` を呼び出す必要があります。

### 並行処理の問題

有効化されたデバッグポイントはFEまたはBEにグローバルに影響するため、プルリクエストで他の並行テストが予期せず失敗する可能性があります。<br/>
これを回避するため、デバッグポイントを使用するリグレッションテストは regression-test/suites/fault_injection_p0 ディレクトリに配置する必要があり、<br/>
グループ名は "nonConcurrent" である必要があるという規則があります。これらのリグレッションテストはプルリクエストワークフローによって順次実行されるためです。

### 例

```groovy
// .groovy file of the test case must be in regression-test/suites/fault_injection_p0
// and the group name must be 'nonConcurrent'
suite('debugpoint_action', 'nonConcurrent') {
    try {
        // Activate debug point named "PublishVersionDaemon.stop_publish" in all FE
        // and pass parameter "timeout"
        // "execute" and "timeout" are pre-existing parameters, usage is mentioned above
        GetDebugPoint().enableDebugPointForAllFEs('PublishVersionDaemon.stop_publish', [timeout:1])

        // Activate debug point named "Tablet.build_tablet_report_info.version_miss" in all BE
        // and pass parameter "tablet_id", "version_miss" and "timeout"
        GetDebugPoint().enableDebugPointForAllBEs('Tablet.build_tablet_report_info.version_miss',
                                                  [tablet_id:'12345', version_miss:true, timeout:1])

        // Test actions which will run into debug point and generate error
        sql """CREATE TABLE tbl_1 (k1 INT, k2 INT)
               DUPLICATE KEY (k1)
               DISTRIBUTED BY HASH(k1)
               BUCKETS 3
               PROPERTIES ("replication_allocation" = "tag.location.default: 1");
            """
        sql "INSERT INTO tbl_1 VALUES (1, 10)"
        sql "INSERT INTO tbl_1 VALUES (2, 20)"
        order_qt_select_1_1 'SELECT * FROM tbl_1'

    } finally {
        // Deactivate debug points
        GetDebugPoint().disableDebugPointForAllFEs('PublishVersionDaemon.stop_publish')
        GetDebugPoint().disableDebugPointForAllBEs('Tablet.build_tablet_report_info.version_miss')
    }
}
```
