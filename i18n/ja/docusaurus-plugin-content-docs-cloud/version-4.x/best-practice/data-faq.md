---
{
  "title": "データ操作エラー",
  "description": "このドキュメントは主にDorisの使用中におけるデータ操作の一般的な問題を記録するために使用されます。随時更新されます。",
  "language": "ja"
}
---
# Data Operation Error

この文書は主にDorisの使用中にデータ操作でよく発生する問題を記録するために使用されます。随時更新されます。

### Q1. Stream Loadを使用してFEのパブリックネットワークアドレスにアクセスしてデータをインポートする際、イントラネットIPにリダイレクトされる？

stream loadの接続先がFEのhttpポートの場合、FEはランダムにBEノードを選択してhttp 307リダイレクト操作を実行するため、ユーザーのリクエストは実際にはFEによって割り当てられたBEに送信されます。リダイレクトはBEのIP、つまりイントラネットIPを返します。そのため、FEのパブリックIPを通じてリクエストを送信した場合、内部ネットワークアドレスにリダイレクトされるため接続できない可能性が非常に高くなります。

通常の方法は、イントラネットIPアドレスにアクセスできることを確認するか、すべてのBE上位層にロードバランサーを配置し、stream loadリクエストを直接ロードバランサーに送信してBEノードに透過的にリクエストを転送することです。

### Q2. Dorisは列名の変更をサポートしていますか？

バージョン1.2.0以降、`"light_schema_change"="true"`オプションが有効になっている場合、列名を変更できます。

バージョン1.2.0以前、または`"light_schema_change"="true"`オプションが有効になっていない場合、列名の変更はサポートされていません。理由は以下の通りです：

Dorisはデータベース名、Table名、パーティション名、マテリアライズドビュー（Rollup）名の変更に加えて、列タイプ、コメント、デフォルト値などの変更をサポートしています。しかし残念ながら、現在列名の変更はサポートされていません。

歴史的な理由により、現在列名は直接データファイルに書き込まれています。Dorisがクエリを実行する際も、クラス名を通じて対応する列を検索します。そのため、列名の変更は単純なメタデータの変更ではなく、データの書き換えも伴う非常に重い操作になります。

将来的に軽量な列名変更操作をサポートするための互換性のある手段を検討することはあります。

### Q3. Unique KeyモデルのTableはマテリアライズドビューの作成をサポートしていますか？

サポートしていません。

Unique KeyモデルのTableはビジネスフレンドリーなTableです。主キーによる重複排除という独特の機能により、頻繁にデータが変更されるビジネスデータベースを簡単に同期できます。そのため、多くのユーザーはDorisにデータをアクセスする際にまずUnique Keyモデルの使用を検討します。

しかし残念ながら、Unique KeyモデルのTableにはマテリアライズドビューを設定できません。理由は、マテリアライズドビューの本質が事前計算によってデータを「事前計算」し、クエリ時に計算済みデータを直接返すことでクエリを高速化することにあるからです。マテリアライズドビューでは、「事前計算」されたデータは通常sumやcountなどの集約指標です。この時、updateやdeleteなどのデータ変更が発生すると、事前計算されたデータは詳細情報を失っているため同期的に更新できません。例えば、5という合計値は1+4または2+3の可能性があります。詳細情報の喪失により、この合計値がどのように計算されたかを区別できないため、更新の要求を満たすことができません。

### Q4. tablet writer write failed, tablet_id=27306172, txn_id=28573520, err=-235 or -238

このエラーは通常データインポート操作中に発生します。エラーコードは-235です。このエラーの意味は、対応するタブレットのデータバージョンが最大制限（デフォルト500、BEパラメーター`max_tablet_version_num`で制御）を超え、後続の書き込みが拒否されることです。例えば、質問中のエラーはタブレット27306172のデータバージョンが制限を超えたことを意味します。

このエラーは通常、インポート頻度が高すぎてバックエンドデータのcompaction速度を上回り、バージョンが蓄積して最終的に制限を超えることが原因です。この時点で、まずshow tablet 27306172ステートメントを実行し、その後結果内のshow procステートメントを実行してタブレットの各コピーの状態を確認できます。結果内のversionCountはバージョン数を表します。コピーのバージョン数が多すぎることが判明した場合、インポート頻度を下げるかインポートを停止してバージョン数が減少するかを観察する必要があります。インポート停止後もバージョン数が減少しない場合、対応するBEノードでbe.INFOログを確認し、tablet idとcompactionキーワードを検索してcompactionが正常に実行されているかを確認する必要があります。compactionチューニングについては、ApacheDoris公式アカウント記事：[Doris Best Practices - コンパクション Tuning (3)](https://mp.weixin.qq.com/s/cZmXEsNPeRMLHp379kc2aA)を参照してください。

-238エラーは通常、同じバッチのインポートデータが大きすぎて、タブレットのSegmentファイル数が多すぎる場合（デフォルト200、BEパラメーター`max_segment_num_per_rowset`で制御）に発生します。この場合、1回のバッチでインポートするデータ量を減らすか、BEの設定パラメーター値を適切に増加させて問題を解決することを推奨します。バージョン2.0以降、ユーザーはBE設定で`enable_segcompaction=true`を設定してsegment compaction機能を有効にし、segmentファイル数を減らすことができます。

### Q5. tablet 110309738 has few replicas: 1, alive backends: [10003]

このエラーはクエリまたはインポート操作中に発生する可能性があります。通常、対応するタブレットのコピーに例外があることを意味します。

この時点で、まずshow backendsコマンドを使用してBEノードがダウンしているかを確認できます。例えば、isAliveフィールドがfalse、またはLastStartTimeが最近の時間（最近再起動されたことを示す）の場合です。BEがダウンしている場合、BEに対応するノードに移動してbe.outログを確認する必要があります。BEが異常な理由でダウンしている場合、通常be.outに例外スタックが出力されて問題の特定に役立ちます。be.outにエラースタックがない場合、Linuxコマンドdmesg -Tを使用してプロセスがOOMによってシステムによってkillされたかを確認できます。

BEノードがダウンしていない場合、show tablet 110309738ステートメントを実行し、その後結果内のshow procステートメントを実行して各タブレットコピーの状態を確認してさらに調査する必要があります。

### Q6. Javaプログラムを通じてstream loadを呼び出してデータをインポートする際、データのバッチが大きいとBroken Pipeエラーが発生する場合がある

Broken Pipe以外にも、他の奇妙なエラーが発生する場合があります。

この状況は通常httpv2を有効にした後に発生します。httpv2はspring bootを使用して実装されたhttpサービスであり、デフォルトの内蔵コンテナーとしてtomcatを使用しているためです。しかし、tomcatの307転送処理には問題があるようで、後に内蔵コンテナーがjettyに変更されました。さらに、javaプログラムのapache http clientのバージョンは4.5.13以降のバージョンを使用する必要があります。以前のバージョンでは転送処理にも問題がありました。

そのため、この問題は2つの方法で解決できます：

1. httpv2を無効にする

   fe.confに`enable_http_server_v2=false`を追加してFEを再起動します。ただし、新バージョンのUIインターフェースは使用できなくなり、httpv2ベースの一部の新しいインターフェースも使用できません。（通常のインポートクエリは影響を受けません）。

2. アップグレード

   Doris 0.15以降にアップグレードするとこの問題は修正されています。

### Q7. インポートとクエリ時にエラー-214が報告される

インポート、クエリなどの操作を実行する際、以下のエラーが発生する場合があります：

```text
failed to initialize storage reader. tablet=63416.1050661139.aa4d304e7a7aff9c-f0fa7579928c85a0, res=-214, backend=192.168.100.10
```
-214 エラーは、対応するタブレットのデータバージョンが不足していることを意味します。例えば、上記のエラーは、192.168.100.10 の BE 上にあるタブレット 63416 のコピーのデータバージョンが不足していることを示しています。（他にも類似のエラーコードが存在する可能性があり、以下の方法で確認・修復できます）。

通常、データに複数のコピーがある場合、システムは自動的にこれらの問題のあるコピーを修復します。以下の手順でトラブルシューティングできます：

まず、`show tablet 63416` ステートメントを実行し、結果内の `show proc xxx` ステートメントを実行して、対応するタブレットの各コピーの状態を確認します。通常、`Version` 列のデータに注意する必要があります。

正常な場合、タブレットの複数のコピーの Version は同じである必要があります。そして、対応するパーティションの VisibleVersion バージョンと同じです。

`show partitions from tblx` で対応するパーティションのバージョンを確認できます（タブレットに対応するパーティションは `show tablet` ステートメントで取得できます）。

同時に、`show proc` ステートメントの CompactionStatus 列の URL にアクセス（ブラウザで開くだけ）して、より具体的なバージョン情報を表示し、どのバージョンが不足しているかを確認することもできます。

長時間自動修復されない場合は、`show proc "/cluster_balance"` ステートメントを使用して、システムが現在実行しているタブレット修復とスケジューリングタスクを確認する必要があります。スケジューリング待ちのタブレットが大量にあるため、修復時間が長くなっている可能性があります。`pending_tablets` と `running_tablets` の記録を追跡できます。

さらに、`admin repair` ステートメントを使用して、最初に修復するTableまたはパーティションを指定できます。詳細については、`help admin repair` を参照してください。

それでも修復できない場合は、複数のレプリカがある場合に、`admin set replica status` コマンドを使用して問題のあるレプリカを強制的にオフラインにします。詳細については、`help admin set replica status` でレプリカステータスを bad に設定する例を参照してください。（bad に設定した後、そのコピーはアクセスされなくなり、後で自動的に修復されます。ただし、操作前に他のコピーが正常であることを確認する必要があります）

### Q8. Not connected to 192.168.100.1:8060 yet, server_id=384

インポートやクエリ時にこのエラーに遭遇する可能性があります。対応する BE ログを確認すると、類似のエラーが見つかる場合もあります。

これは RPC エラーで、通常 2 つの可能性があります：1. 対応する BE ノードがダウンしている。2. rpc の輻輳やその他のエラー。

BE ノードがダウンしている場合は、具体的なダウンタイムの理由を確認する必要があります。ここでは rpc 輻輳の問題のみを説明します。

1 つのケースは OVERCROWDED で、rpc ソースに閾値を超える大量の未送信データがあることを意味します。BE にはこれに関連する 2 つのパラメータがあります：

1. `brpc_socket_max_unwritten_bytes`：デフォルト値は 1GB です。未送信データがこの値を超えるとエラーが報告されます。この値を適切に変更して OVERCROWDED エラーを回避できます。（ただし、これは対症療法であり、本質的には依然として輻輳が存在します）。
2. `tablet_writer_ignore_eovercrowded`：デフォルトは false です。true に設定すると、Doris はインポート中に OVERCROWDED エラーを無視します。このパラメータは主にインポートの失敗を回避し、インポートの安定性を向上させるためのものです。

2 つ目は、rpc のパケットサイズが max_body_size を超えることです。この問題は、クエリに非常に大きな String 型や bitmap 型がある場合に発生する可能性があります。以下の BE パラメータを変更することで回避できます：

```
brpc_max_body_size：default 3GB.
```
### Q9. [ Broker load ] org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe

インポート中に`org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe`が発生する。

この問題の原因は、外部ストレージ（HDFSなど）からデータをインポートする際に、ディレクトリ内のファイル数が多すぎるため、ファイルディレクトリの一覧取得に時間がかかりすぎることにある可能性があります。ここで、Broker RPCタイムアウトはデフォルトで10秒に設定されており、ここでタイムアウト時間を適切に調整する必要があります。

`fe.conf`設定ファイルを変更して、以下のパラメータを追加してください：

```
broker_timeout_ms = 10000
##The default here is 10 seconds, you need to increase this parameter appropriately
```
ここにパラメータを追加するには、FEサービスの再起動が必要です。

### Q10. [ Routine load ] ReasonOfStateChanged: ErrorReason{code=errCode = 104, msg='be 10004 abort task with reason: fetch failed due to requested offset not available on the broker: Broker: Offset out of range'}

この問題の原因は、Kafkaのcleanup policyがデフォルトで7日間に設定されていることです。routine loadタスクが何らかの理由で中断され、長期間にわたってタスクが復旧されない場合、タスクが再開された時に、routine loadが記録している消費offsetと、kafkaがクリーンアップした対応するoffsetとの間で、この問題が発生します。

この問題はalter routine loadで解決できます：

kafkaの最小offsetを確認し、ALTER ROUTINE LOADコマンドを使用してoffsetを変更し、タスクを再開してください

```sql
ALTER ROUTINE LOAD FOR db.tb
FROM kafka
(
 "kafka_partitions" = "0",
 "kafka_offsets" = "xxx",
 "property.group.id" = "xxx"
);
```
### Q11. ERROR 1105 (HY000): errCode = 2, detailMessage = (192.168.90.91)[CANCELLED][INTERNAL_ERROR]error setting certificate verify locations:  CAfile: /etc/ssl/certs/ca-certificates.crt CApath: none

```
yum install -y ca-certificates
ln -s /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt /etc/ssl/certs/ca-certificates.crt
```
### Q12. create partition failed. partition numbers will exceed limit variable max_auto_partition_num

自動パーティション化されたTableにデータをインポートする際に、誤って過度に多くのパーティションが作成されることを防ぐため、FE設定項目 `max_auto_partition_num` を使用して、そのようなTableに対して自動的に作成されるパーティションの最大数を制御しています。より多くのパーティションを作成する必要がある場合は、FE Masterノードのこの設定項目を変更してください。
