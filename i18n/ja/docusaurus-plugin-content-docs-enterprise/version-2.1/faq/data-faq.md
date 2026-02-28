---
{
  "title": "データ操作エラー",
  "description": "このドキュメントは、主にDorisの使用中にデータ操作でよく発生する問題を記録するために使用されます。随時更新されます。",
  "language": "ja"
}
---
# Data Operation Error

この文書は主にDorisの使用中のデータ操作の一般的な問題を記録するために使用されます。随時更新されます。

### Q1. Stream Loadを使用してFEのパブリックネットワークアドレスにアクセスしてデータをインポートしようとしているが、イントラネットIPにリダイレクトされる

stream loadの接続先がFEのhttpポートの場合、FEはランダムにBEノードを選択してhttp 307リダイレクト操作を実行するため、ユーザーのリクエストは実際にはFEによって割り当てられたBEに送信されます。リダイレクトはBEのIPを返しますが、これはイントラネットIPです。そのため、FEのパブリックIPを通じてリクエストを送信する場合、内部ネットワークアドレスにリダイレクトされるため接続できない可能性が非常に高いです。

通常の方法は、イントラネットIPアドレスにアクセスできることを確認するか、すべてのBE上位層にロードバランサーを設置し、stream loadリクエストを直接ロードバランサーに送信し、ロードバランサーがリクエストをBEノードに透過的に転送することです。

### Q2. Dorisはカラム名の変更をサポートしていますか？

バージョン1.2.0以降では、`"light_schema_change"="true"`オプションが有効になっている場合、カラム名を変更することができます。

バージョン1.2.0以前、または`"light_schema_change"="true"`オプションが有効になっていない場合、カラム名の変更はサポートされていません。理由は以下の通りです：

Dorisはデータベース名、Table名、パーティション名、マテリアライズドビュー（Rollup）名の変更、およびカラムタイプ、コメント、デフォルト値などの変更をサポートしています。しかし残念ながら、カラム名の変更は現在サポートされていません。

歴史的な理由により、カラム名は現在データファイルに直接書き込まれています。Dorisがクエリを実行する際も、クラス名を通じて対応するカラムを見つけます。そのため、カラム名の変更は単純なメタデータの変更だけでなく、データの書き換えも伴う非常に重い操作です。

将来的には軽量なカラム名変更操作をサポートするための互換性のある手段を排除するものではありません。

### Q3. Unique KeyモデルのTableはマテリアライズドビューの作成をサポートしていますか？

サポートしていません。

Unique KeyモデルのTableはビジネスに優しいTableです。主キーに従った重複排除というユニークな機能により、頻繁にデータが変更されるビジネスデータベースを簡単に同期することができます。そのため、多くのユーザーはDorisにデータを取り込む際にまずUnique Keyモデルの使用を検討します。

しかし残念ながら、Unique KeyモデルのTableはマテリアライズドビューを確立することができません。理由は、マテリアライズドビューの本質は事前計算を通じてデータを「事前計算」し、クエリ実行時に計算済みデータを直接返してクエリを高速化することです。マテリアライズドビューでは、「事前計算」されたデータは通常、sumやcountなどの集約指標です。この時、updateやdeleteなどのデータ変更が発生すると、事前計算されたデータは詳細情報を失っているため、同期的に更新することができません。例えば、合計値5は1+4または2+3かもしれません。詳細情報の損失により、この合計値がどのように計算されたかを区別することができず、そのため更新のニーズを満たすことができません。

### Q4. tablet writer write failed, tablet_id=27306172, txn_id=28573520, err=-235 or -238

このエラーは通常データインポート操作中に発生します。エラーコードは-235です。このエラーの意味は、対応するタブレットのデータバージョンが最大制限（デフォルト500、BEパラメータ`max_tablet_version_num`で制御）を超え、後続の書き込みが拒否されることです。例えば、質問のエラーはタブレット27306172のデータバージョンが制限を超えていることを意味します。

このエラーは通常、インポート頻度が高すぎて、バックエンドデータのcompaction速度を上回り、バージョンが蓄積されて最終的に制限を超えることが原因です。この場合、まずshow tablet 27306172ステートメントを実行し、その後結果のshow procステートメントを実行してタブレットの各コピーのステータスを確認することができます。結果のversionCountはバージョン数を表します。コピーのバージョンが多すぎることがわかった場合は、インポート頻度を減らすか、インポートを停止してバージョン数が減少するかを観察する必要があります。インポートを停止してもバージョン数が減少しない場合は、対応するBEノードに移動してbe.INFOログを表示し、tablet idとcompactionキーワードを検索して、compactionが正常に実行されているかを確認する必要があります。compactionチューニングについては、ApacheDoris公式アカウントの記事：[Doris Best Practices - コンパクション Tuning (3)](https://mp.weixin.qq.com/s/cZmXEsNPeRMLHp379kc2aA)を参照してください。

-238エラーは通常、同じバッチのインポートデータが大きすぎて、タブレットのSegmentファイルが多すぎる（デフォルト200、BEパラメータ`max_segment_num_per_rowset`で制御）場合に発生します。この場合、一度にインポートするデータ量を減らすか、BEの設定パラメータ値を適切に増加させて問題を解決することをお勧めします。バージョン2.0以降、ユーザーはBE設定で`enable_segcompaction=true`を設定してsegment compaction機能を有効にし、segmentファイル数を削減することができます。

### Q5. tablet 110309738 has few replicas: 1, alive backends: [10003]

このエラーはクエリやインポート操作中に発生する可能性があります。通常、対応するタブレットのコピーに例外があることを意味します。

この場合、まずshow backendsコマンドを使用してBEノードがダウンしているかを確認することができます。例えば、isAliveフィールドがfalse、またはLastStartTimeが最近の時刻（最近再起動されたことを示す）の場合です。BEがダウンしている場合は、対応するBEのノードに移動してbe.outログを確認する必要があります。BEが異常な理由でダウンしている場合、通常be.outに例外スタックが印刷され、問題のトラブルシューティングに役立ちます。be.outにエラースタックがない場合は、linuxコマンドdmesg -Tを使用してプロセスがOOMのためシステムによって強制終了されたかを確認することができます。

BEノードがダウンしていない場合は、show tablet 110309738ステートメントを実行し、その後結果のshow procステートメントを実行して、各タブレットコピーのステータスを確認してさらに調査する必要があります。

### Q6. disk xxxxx on backend xxx exceed limit usage

通常Import、Alterなどの操作で発生します。このエラーは、BEに対応するディスクの使用量がしきい値（デフォルト95%）を超えていることを意味します。この場合、まずshow backendsコマンドを使用でき、MaxDiskUsedPctは対応するBEで最も使用量の多いディスクの使用率を表示します。95%を超えている場合、このエラーが報告されます。

この場合、対応するBEノードに移動してデータディレクトリの使用量を確認する必要があります。trashディレクトリとsnapshotディレクトリは手動でクリーンアップしてスペースを解放することができます。データディレクトリが大きなスペースを占有している場合は、一部のデータを削除してスペースを解放することを検討する必要があります。詳細については、Disk Space Managementを参照してください。

### Q7. Javaプログラムを通じてstream loadを呼び出してデータをインポートする際、データのバッチが大きい場合にBroken Pipeエラーが発生する可能性があります

Broken Pipe以外にも、他の奇妙なエラーが発生する可能性があります。

この状況は通常httpv2を有効にした後に発生します。httpv2はspring bootを使用して実装されたhttpサービスで、tomcatをデフォルトの組み込みコンテナとして使用しているためです。しかし、tomcatの307転送の処理にいくつかの問題があるようで、後に組み込みコンテナをjettyに変更されました。また、javaプログラムのapache http clientのバージョンは4.5.13以降のバージョンを使用する必要があります。以前のバージョンでは転送の処理にもいくつかの問題がありました。

そのため、この問題は2つの方法で解決できます：

1. httpv2を無効化

   fe.confにenable_http_server_v2=falseを追加してFEを再起動します。ただし、新しいバージョンのUIインターフェースは使用できなくなり、httpv2ベースの一部の新しいインターフェースも使用できません（通常のインポートクエリは影響を受けません）。

2. アップグレード

   Doris 0.15以降にアップグレードすることでこの問題が修正されています。

### Q8. インポートやクエリ時にエラー-214が報告される

インポート、クエリなどの操作を実行する際、以下のエラーが発生する可能性があります：

```text
failed to initialize storage reader. tablet=63416.1050661139.aa4d304e7a7aff9c-f0fa7579928c85a0, res=-214, backend=192.168.100.10
```
-214エラーは、対応するtabletのデータバージョンが不足していることを意味します。例えば、上記のエラーは192.168.100.10のBE上にあるtablet 63416のコピーのデータバージョンが不足していることを示しています。（他にも類似のエラーコードがある可能性があり、以下の方法で確認・修復できます）。

通常、データに複数のコピーがある場合、システムは自動的にこれらの問題のあるコピーを修復します。以下の手順でトラブルシューティングを行うことができます：

まず、`show tablet 63416`ステートメントを実行し、結果の`show proc xxx`ステートメントを実行して、対応するtabletの各コピーのステータスを確認します。通常、`Version`列のデータに注意する必要があります。

正常な場合、あるtabletの複数のコピーのVersionは同じである必要があります。そして、対応するpartitionのVisibleVersionバージョンと同じである必要があります。

`show partitions from tblx`で対応するpartitionのバージョンを確認できます（tabletに対応するpartitionは`show tablet`ステートメントで取得できます）。

同時に、`show proc`ステートメントのCompactionStatus列のURL（ブラウザで開くだけ）にアクセスして、より具体的なバージョン情報を確認し、どのバージョンが不足しているかをチェックできます。

長時間自動修復されない場合は、`show proc "/cluster_balance"`ステートメントを使用して、システムで現在実行されているtablet修復とスケジューリングタスクを確認する必要があります。スケジュール待ちのtabletが大量にあるため、修復時間が長くなっている可能性があります。`pending_tablets`と`running_tablets`の記録を追跡できます。

さらに、`admin repair`ステートメントを使用して、最初に修復するTableまたはpartitionを指定できます。詳細については、`help admin repair`を参照してください。

それでも修復できない場合は、複数のレプリカがある状況で、`admin set replica status`コマンドを使用して問題のあるレプリカを強制的にオフラインにします。詳細については、`help admin set replica status`でレプリカのステータスをbadに設定する例を参照してください。（badに設定後、そのコピーはアクセスされなくなります。そして後で自動的に修復されます。ただし、操作前に他のコピーが正常であることを確認してください）

### Q9. Not connected to 192.168.100.1:8060 yet, server_id=384

インポートやクエリ時にこのエラーが発生する場合があります。対応するBEログを確認すると、類似のエラーが見つかる場合もあります。

これはRPCエラーであり、通常2つの可能性があります：1. 対応するBEノードがダウンしている。2. rpcの輻輳またはその他のエラー。

BEノードがダウンしている場合は、具体的なダウン理由を確認する必要があります。ここではrpc輻輳の問題のみを説明します。

1つのケースはOVERCROWDEDで、これはrpcソースに閾値を超える大量の未送信データがあることを意味します。BEには関連する2つのパラメータがあります：

1. `brpc_socket_max_unwritten_bytes`：デフォルト値は1GBです。未送信データがこの値を超えるとエラーが報告されます。この値を適切に変更してOVERCROWDEDエラーを回避できます。（ただし、これは対症療法であり、本質的には依然として輻輳が存在します）。
2. `tablet_writer_ignore_eovercrowded`：デフォルトはfalseです。trueに設定すると、DorisはインポートおよびにOVERCROWDEDエラーを無視します。このパラメータは主にインポートの失敗を回避し、インポートの安定性を向上させるためのものです。

2つ目は、rpcのパケットサイズがmax_body_sizeを超えることです。この問題は、クエリに非常に大きなString型やbitmap型がある場合に発生する可能性があります。以下のBEパラメータを変更することで回避できます：

```
brpc_max_body_size：default 3GB.
```
### Q10. [ Broker load ] org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe

インポート時に`org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe`が発生する。

この問題の原因は、外部ストレージ（HDFSなど）からデータをインポートする際に、ディレクトリ内のファイル数が多すぎるため、ファイルディレクトリのリスト化に時間がかかりすぎることが考えられます。ここで、Broker RPCタイムアウトはデフォルトで10秒に設定されており、ここでタイムアウト時間を適切に調整する必要があります。

`fe.conf`設定ファイルを変更して、以下のパラメータを追加してください：

```
broker_timeout_ms = 10000
##The default here is 10 seconds, you need to increase this parameter appropriately
```
ここでパラメータを追加するにはFEサービスの再起動が必要です。

### Q11. [ Routine load ] ReasonOfStateChanged: ErrorReason{code=errCode = 104, msg='be 10004 abort task with reason: fetch failed due to requested offset not available on the broker: Broker: Offset out of range'}

この問題の原因は、Kafkaのcleanup policyがデフォルトで7日に設定されていることです。routine loadタスクが何らかの理由で中断され、長時間タスクが復旧されない場合、タスクが再開されるときに、routine loadは消費offsetを記録しますが、kafkaが対応するoffsetをクリーンアップしている場合にこの問題が発生します。

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
### Q12. ERROR 1105 (HY000): errCode = 2, detailMessage = (192.168.90.91)[CANCELLED][INTERNAL_ERROR]error setting certificate verify locations:  CAfile: /etc/ssl/certs/ca-certificates.crt CApath: none

```
yum install -y ca-certificates
ln -s /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt /etc/ssl/certs/ca-certificates.crt
```
### Q13. create partition failed. partition numbers will exceed limit variable max_auto_partition_num

自動パーティション化Tableのデータインポート時に誤って多数のパーティションが作成されることを防ぐため、FE設定項目`max_auto_partition_num`を使用して、そのようなTableに対して自動的に作成されるパーティションの最大数を制御しています。より多くのパーティションを作成する必要がある場合は、FE Masterノードのこの設定項目を変更してください。
