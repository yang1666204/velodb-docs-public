---
{
  "title": "SQL エラー",
  "description": "これは、対応するタブレットがクエリ可能なコピーを見つけられないために発生します。通常、BEがダウンしている、コピーが欠落しているなどの理由によるものです。",
  "language": "ja"
}
---
# SQL Error

### Q1. Query error: Failed to get scan range, no queryable replica found in tablet: xxxx

これは、対応するtabletがクエリ可能なコピーを見つけられないために発生します。通常、BEがダウンしている、コピーが欠損している等が原因です。まず`show tablet tablet_id`文を実行し、その後以下の`show proc`文を実行して、このtabletに対応するレプリカ情報を確認し、レプリカが完全かどうかをチェックできます。同時に、`show proc "/cluster_balance"`情報を通じて、クラスター内のレプリカスケジューリングと修復の進行状況をクエリすることもできます。

データコピー管理に関するコマンドについては、Data Copy Managementを参照してください。

### Q2. Show backends/frontends 表示される情報が不完全

`show backends/frontends`などの特定の文を実行した後、結果の一部の列が不完全であることがあります。例えば、show backendsの結果でディスク容量情報が見えない場合があります。

通常、この問題は、クラスターに複数のFEがある場合に発生します。ユーザーが非Master FEノードに接続してこれらの文を実行すると、不完全な情報が表示されます。これは、一部の情報がMaster FEノードにのみ存在するためです。例えば、BEのディスク使用情報などです。したがって、Master FEに直接接続した後でのみ完全な情報を取得できます。

もちろん、ユーザーはこれらの文を実行する前に`set forward_to_master=true;`を実行することもできます。このセッション変数をtrueに設定すると、その後実行される一部の情報表示文は自動的にMaster FEに転送されて結果を取得します。この方法により、ユーザーがどのFEに接続していても、完全な結果を取得できます。

### Q3. invalid cluster id: xxxx

このエラーは、show backendsまたはshow frontendsコマンドの結果に表示される場合があります。通常、FEまたはBEノードのエラーメッセージ列に表示されます。このエラーの意味は、Master FEがノードにハートビート情報を送信した後、ノードがハートビート情報に含まれるcluster idとローカルに保存されているcluster idが異なることを発見し、ハートビートへの応答を拒否することです。

DorisのMaster FEノードは、各FEまたはBEノードに積極的にハートビートを送信し、ハートビート情報にcluster_idを含めます。cluster_idは、クラスターが初期化される際にMaster FEが生成する一意のクラスターIDです。FEまたはBEが初回ハートビート情報を受信すると、cluster_idはローカルにファイル形式で保存されます。FEのファイルはメタデータディレクトリのimage/ディレクトリにあり、BEはすべてのデータディレクトリにcluster_idファイルを持ちます。その後、ノードがハートビートを受信するたびに、ローカルのcluster_idの内容とハートビート内の内容を比較します。一致しない場合、ハートビートへの応答を拒否します。

このメカニズムは、クラスター外のノードから送信される偽のハートビートメッセージの受信を防ぐためのノード認証メカニズムです。

このエラーから回復する必要がある場合、まず、すべてのノードが正しいクラスターにあることを確認する必要があります。その後、FEノードについては、メタデータディレクトリのimage/VERSIONファイルのcluster_id値を変更し、FEを再起動してみることができます。BEノードについては、データディレクトリのすべてのcluster_idファイルを削除し、BEを再起動できます。

### Q4. Unique Keyモデルのクエリ結果が一致しない

場合によっては、ユーザーが同じSQLを使用してUnique KeyモデルのTableをクエリする際に、複数回のクエリの結果が一致しない場合があります。そして、クエリ結果は常に2-3種類の間で変化します。

これは、同じバッチのインポートデータ内に、同じキーだが異なる値を持つデータがある場合に発生する可能性があります。これにより、データ上書きのシーケンスの不確定性により、異なるレプリカ間で結果が一致しなくなります。

例えば、Tableがk1, v1として定義されているとします。インポートデータのバッチは以下の通りです：

```text
1, "abc"
1, "def"
```
その結果、copy 1の結果は`1, "abc"`となり、copy 2の結果は`1, "def"`となる可能性があります。その結果、クエリ結果に一貫性がなくなります。

異なるレプリカ間でデータシーケンスが一意であることを保証するには、Sequence Column機能を参照してください。

### Q5. bitmap/hll型データのクエリでNULLが返される問題

バージョン1.1.xで、ベクター化が有効になっており、クエリデータTableのbitmap型フィールドがNULL結果を返す場合、

1. まず`set return_object_data_as_binary=true;`を実行する必要があります
2. ベクター化を無効にします`set enable_vectorized_engine=false;`
3. SQLキャッシュを無効にします`set [global] enable_sql_cache = false;`

これは、ベクター化実行エンジンにおいてbitmap/hll型の入力がすべてNULLの場合、出力結果も0ではなくNULLになるためです。

### Q5. bitmap/hll型データのクエリでNULLが返される問題

バージョン1.1.xで、ベクター化が有効になっており、クエリデータTableのbitmp型フィールドがNULL結果を返す場合、

1. まず`set return_object_data_as_binary=true;`を実行する必要があります
2. ベクター化を無効にします`set enable_vectorized_engine=false;`
3. SQLキャッシュを無効にします`set [global] enable_sql_cache = false;`

これは、ベクター化実行エンジンにおいてbitmap/hll型の入力がすべてNULLの場合、出力結果も0ではなくNULLになるためです。

### Q6. オブジェクトストレージアクセス時のエラー: curl 77: Problem with the SSL CA cert

be.INFOログに`curl 77: Problem with the SSL CA cert`エラーが表示される場合は、以下の方法で解決を試すことができます：

1. [https://curl.se/docs/caextract.html](https://curl.se/docs/caextract.html)から証明書をダウンロードします: cacert.pem
2. 証明書を指定された場所にコピーします: `sudo cp /tmp/cacert.pem /etc/ssl/certs/ca-certificates.crt`
3. BEノードを再起動します。

### Q7. インポートエラー："Message": "[INTERNAL_ERROR]single replica load is disabled on BE."

1. be.confの`enable_single_replica_load`パラメータがtrueに設定されていることを確認してください
2. BEノードを再起動します。
