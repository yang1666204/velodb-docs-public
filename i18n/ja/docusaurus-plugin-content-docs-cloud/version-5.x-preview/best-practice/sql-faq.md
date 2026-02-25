---
{
  "title": "SQL エラー",
  "description": "show backends/frontendsなどの特定のステートメントを実行した後、結果の一部のカラムが不完全である場合があります。",
  "language": "ja"
}
---
# SQL Error

### Q1. Show backends/frontends 表示される情報が不完全

`show backends/frontends`などの特定のステートメントを実行した後、結果の一部の列が不完全であることがわかる場合があります。例えば、show backendsの結果でディスク容量情報が表示されません。

通常、この問題はクラスタに複数のFEがある場合に発生します。ユーザーがMaster FE以外のノードに接続してこれらのステートメントを実行すると、不完全な情報が表示されます。これは、一部の情報がMaster FEノードにのみ存在するためです。例えば、BEのディスク使用量情報などです。したがって、Master FEに直接接続した後でのみ完全な情報を取得できます。

もちろん、ユーザーはこれらのステートメントを実行する前に`set forward_to_master=true;`を実行することもできます。このセッション変数がtrueに設定された後、その後実行される一部の情報表示ステートメントは自動的にMaster FEに転送されて結果を取得します。これにより、ユーザーがどのFEに接続していても、完全な結果を取得できます。

### Q2. invalid cluster id: xxxx

このエラーは、show backendsまたはshow frontendsコマンドの結果に表示される場合があります。通常、FEまたはBEノードのエラーメッセージ列に表示されます。このエラーの意味は、Master FEがノードにハートビート情報を送信した後、ノードがハートビート情報に含まれるcluster idがローカルに保存されているcluster idと異なることを発見し、ハートビートへの応答を拒否することです。

DorisのMaster FEノードは、各FEまたはBEノードにアクティブにハートビートを送信し、ハートビート情報にcluster_idを含めます。cluster_idは、クラスタが初期化されるときにMaster FEによって生成される一意のクラスタIDです。FEまたはBEが初回ハートビート情報を受信すると、cluster_idはファイル形式でローカルに保存されます。FEのファイルはメタデータディレクトリのimage/ディレクトリにあり、BEはすべてのデータディレクトリにcluster_idファイルを持ちます。その後、ノードがハートビートを受信するたびに、ローカルのcluster_idの内容とハートビート内の内容を比較します。一致しない場合、ハートビートへの応答を拒否します。

このメカニズムは、クラスタ外のノードから送信される偽のハートビートメッセージを受信することを防ぐノード認証メカニズムです。

このエラーから復旧する必要がある場合。最初にすべてのノードが正しいクラスタにあることを確認する必要があります。その後、FEノードの場合、メタデータディレクトリのimage/VERSIONファイルのcluster_id値を変更してFEを再起動することを試すことができます。BEノードの場合、データディレクトリ内のすべてのcluster_idファイルを削除してBEを再起動できます。

### Q3. Unique Keyモデルのクエリ結果が一致しない

場合によっては、ユーザーがUnique Keyモデルのテーブルに対して同じSQLを使用してクエリを実行すると、複数回のクエリの結果が一致しない場合があります。そして、クエリ結果は常に2-3種類の間で変化します。

これは、同じバッチのインポートデータ内に、同じキーだが異なる値を持つデータがあるためかもしれません。これにより、データ上書きの順序の不確実性により、異なるレプリカ間で結果が一致しなくなります。

例えば、テーブルがk1, v1として定義されているとします。インポートデータのバッチは以下の通りです：

```text
1, "abc"
1, "def"
```
その結果、copy 1の結果が`1, "abc"`で、copy 2の結果が`1, "def"`になることがあります。結果として、クエリ結果に一貫性がなくなります。

異なるレプリカ間でデータシーケンスが一意であることを保証するには、[Sequence Column](../user-guide/data-modification/update/update-of-unique-model)機能を参照してください。

### Q4. bitmap/hll型データのクエリでNULLが返される問題

バージョン1.1.xで、ベクトル化が有効になっており、クエリデータテーブルのbitmap型フィールドがNULL結果を返す場合：

1. まず`set return_object_data_as_binary=true;`を実行する必要があります
2. ベクトル化を無効にします`set enable_vectorized_engine=false;`
3. SQLキャッシュを無効にします`set [global] enable_sql_cache = false;`

これは、bitmap / hll型がベクトル化実行エンジンにおいて、入力がすべてNULLの場合、出力結果も0ではなくNULLになるためです。

### Q5. bitmap/hll型データのクエリでNULLが返される問題

バージョン1.1.xで、ベクトル化が有効になっており、クエリデータテーブルのbitmp型フィールドがNULL結果を返す場合：

1. まず`set return_object_data_as_binary=true;`を実行する必要があります
2. ベクトル化を無効にします`set enable_vectorized_engine=false;`
3. SQLキャッシュを無効にします`set [global] enable_sql_cache = false;`

これは、bitmap/hll型がベクトル化実行エンジンにおいて、入力がすべてNULLの場合、出力結果も0ではなくNULLになるためです。

### Q6. オブジェクトストレージアクセス時のエラー：curl 77: Problem with the SSL CA cert

be.INFOログに`curl 77: Problem with the SSL CA cert`エラーが表示される場合は、以下の方法で解決を試してください：

1. [https://curl.se/docs/caextract.html](https://curl.se/docs/caextract.html)で証明書をダウンロードします：cacert.pem
2. 証明書を指定された場所にコピーします：`sudo cp /tmp/cacert.pem /etc/ssl/certs/ca-certificates.crt`
3. BEノードを再起動します。

### Q7. importエラー："Message": "[INTERNAL_ERROR]single replica load is disabled on BE."

1. be.confの`enable_single_replica_load`パラメータがtrueに設定されていることを確認してください
2. BEノードを再起動します。
