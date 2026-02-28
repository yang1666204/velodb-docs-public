---
{
  "title": "データ操作エラー",
  "description": "この文書は主にDorisの使用中におけるデータ操作の一般的な問題を記録するために使用されます。随時更新されます。",
  "language": "ja"
}
---
# Data Operation Error

この文書は主にDorisの使用中にデータ操作でよく発生する問題を記録するために使用されます。随時更新されます。

### Q1. Stream LoadでFEのパブリックネットワークアドレスにアクセスしてデータをインポートする際、イントラネットIPにリダイレクトされる？

stream loadの接続先がFEのhttpポートの場合、FEはBEノードをランダムに選択してhttp 307リダイレクト操作を実行するため、ユーザーのリクエストは実際にはFEによって割り当てられたBEに送信されます。リダイレクトはBEのIP、つまりイントラネットIPを返します。そのため、FEのパブリックIPを通じてリクエストを送信する場合、内部ネットワークアドレスにリダイレクトされるため接続できない可能性が高くなります。

一般的な方法は、イントラネットIPアドレスにアクセスできることを確認するか、すべてのBE上位層にロードバランサーを想定し、stream loadリクエストを直接ロードバランサーに送信し、ロードバランサーがリクエストをBEノードに透過的に転送することです。

### Q2. Dorisはカラム名の変更をサポートしていますか？

バージョン1.2.0以降、`"light_schema_change"="true"`オプションが有効になっている場合、カラム名を変更できます。

バージョン1.2.0以前、または`"light_schema_change"="true"`オプションが有効になっていない場合、カラム名の変更はサポートされていません。理由は以下の通りです：

Dorisはデータベース名、テーブル名、パーティション名、マテリアライズドビュー（Rollup）名の変更、およびカラムタイプ、コメント、デフォルト値などの変更をサポートしています。しかし残念ながら、カラム名の変更は現在サポートされていません。

歴史的な理由により、カラム名は現在データファイルに直接書き込まれています。Dorisがクエリを実行する際も、クラス名を通じて対応するカラムを見つけます。そのため、カラム名の変更は単純なメタデータの変更だけでなく、データの書き換えも必要となり、非常に重い操作になります。

将来的に軽量なカラム名変更操作をサポートするための互換性のある手段を排除するものではありません。

### Q3. Unique Keyモデルのテーブルはマテリアライズドビューの作成をサポートしていますか？

サポートしていません。

Unique Keyモデルのテーブルはビジネスフレンドリーなテーブルです。プライマリキーによる重複排除という独自の機能により、頻繁にデータが変更されるビジネスデータベースを簡単に同期できます。そのため、多くのユーザーはDorisにデータをアクセスする際、まずUnique Keyモデルの使用を検討します。

しかし残念ながら、Unique Keyモデルのテーブルはマテリアライズドビューを確立できません。理由は、マテリアライズドビューの本質は事前計算によってデータを「事前計算」し、クエリ時に計算されたデータを直接返してクエリを高速化することです。マテリアライズドビューでは、「事前計算された」データは通常sumやcountなどの集約指標です。この時、updateやdeleteなどのデータ変更が発生した場合、事前計算されたデータは詳細情報を失っているため、同期して更新できません。例えば、5というsum値は1+4または2+3の可能性があります。詳細情報が失われているため、この合計値がどのように計算されたかを区別できず、更新の要求を満たすことができません。

### Q4. tablet writer write failed, tablet_id=27306172, txn_id=28573520, err=-235 or -238

このエラーは通常、データインポート操作中に発生します。エラーコードは-235です。このエラーの意味は、対応するtabletのデータバージョンが最大制限（デフォルト500、BEパラメータ`max_tablet_version_num`で制御）を超え、その後の書き込みが拒否されることです。例えば、質問のエラーはtablet 27306172のデータバージョンが制限を超えていることを意味します。

このエラーは通常、インポート頻度が高すぎて、バックエンドデータのcompaction速度を上回り、バージョンが蓄積して最終的に制限を超えることが原因です。この時、まずshow tablet 27306172文を通過し、その後結果でshow proc文を実行してtabletの各コピーのステータスを確認できます。結果のversionCountはバージョン数を表します。コピーのバージョンが多すぎることが分かった場合、インポート頻度を減らすかインポートを停止してバージョン数が減少するかを観察する必要があります。インポート停止後もバージョン数が減少しない場合は、対応するBEノードに移動してbe.INFOログを表示し、tablet idとcompactionキーワードを検索して、compactionが正常に実行されているかを確認する必要があります。compactionチューニングについては、ApacheDoris公式アカウント記事を参照してください：[Doris Best Practices - Compaction Tuning (3)](https://mp.weixin.qq.com/s/cZmXEsNPeRMLHp379kc2aA)

-238エラーは通常、同じバッチのインポートデータが大きすぎて、tabletのSegmentファイルが多すぎる（デフォルトは200、BEパラメータ`max_segment_num_per_rowset`で制御）場合に発生します。この時、1回のバッチでインポートするデータ量を減らすか、BE設定パラメータ値を適切に増やして問題を解決することをお勧めします。バージョン2.0以降、ユーザーはBE configで`enable_segcompaction=true`を設定してsegment compaction機能を有効にし、segmentファイル数を減らすことができます。

### Q5. tablet 110309738 has few replicas: 1, alive backends: [10003]

このエラーはクエリまたはインポート操作中に発生する可能性があります。通常、対応するtabletのコピーに例外があることを意味します。

この時、まずshow backendsコマンドを使用してBEノードがダウンしているかを確認できます。例えば、isAliveフィールドがfalse、またはLastStartTimeが最近の時間（最近再起動されたことを示す）の場合です。BEがダウンしている場合は、BEに対応するノードに移動してbe.outログを確認する必要があります。BEが異常な理由でダウンした場合、通常be.outに例外スタックが出力され、問題のトラブルシューティングに役立ちます。be.outにエラースタックがない場合は、linuxコマンドdmesg -Tを使用して、プロセスがOOMのためにシステムによってkillされたかを確認できます。

BEノードがダウンしていない場合は、show tablet 110309738文を通過し、その後結果でshow proc文を実行して各tabletコピーのステータスを確認し、さらなる調査を行う必要があります。

### Q6. Javaプログラムを通じてstream loadを呼び出してデータをインポートする際、データのバッチが大きい場合にBroken Pipeエラーが発生する可能性がある。

Broken Pipe以外にも、他の奇妙なエラーが発生する可能性があります。

この状況は通常httpv2を有効にした後に発生します。httpv2はspring bootを使用して実装されたhttpサービスで、tomcatをデフォルトの組み込みコンテナとして使用するためです。しかし、tomcatの307転送処理に問題があるようで、後に組み込みコンテナをjettyに変更しました。また、javaプログラムのapache http clientのバージョンは4.5.13以降のバージョンを使用する必要があります。以前のバージョンでは転送処理にも問題がありました。

そのため、この問題は2つの方法で解決できます：

1. httpv2を無効にする

   fe.confにenable_http_server_v2=falseを追加後、FEを再起動します。ただし、新しいバージョンのUIインターフェースは使用できなくなり、httpv2に基づく一部の新しいインターフェースも使用できません。（通常のインポートクエリは影響を受けません）。

2. アップグレード

   Doris 0.15以降にアップグレードすると、この問題は修正されています。

### Q7. インポートやクエリ時にエラー-214が報告される

インポート、クエリなどの操作を実行する際、以下のエラーが発生する可能性があります：

```text
failed to initialize storage reader. tablet=63416.1050661139.aa4d304e7a7aff9c-f0fa7579928c85a0, res=-214, backend=192.168.100.10
```
-214エラーは、対応するタブレットのデータバージョンが欠落していることを意味します。例えば、上記のエラーは、192.168.100.10のBE上のタブレット63416のコピーのデータバージョンが欠落していることを示します。（他にも類似のエラーコードがある可能性があり、以下の方法で確認・修復できます）。

通常、データに複数のコピーがある場合、システムは自動的にこれらの問題のあるコピーを修復します。以下の手順でトラブルシューティングを行うことができます：

まず、`show tablet 63416`ステートメントを実行し、結果の`show proc xxx`ステートメントを実行して、対応するタブレットの各コピーの状態を確認します。通常、`Version`列のデータに注意する必要があります。

通常、タブレットの複数のコピーのVersionは同じであるべきです。そして、対応するパーティションのVisibleVersionバージョンと同じです。

対応するパーティションバージョンは`show partitions from tblx`で確認できます（タブレットに対応するパーティションは`show tablet`ステートメントで取得できます）。

同時に、`show proc`ステートメントのCompactionStatus列のURL（ブラウザで開くだけ）にアクセスして、より具体的なバージョン情報を表示し、どのバージョンが欠落しているかを確認することもできます。

長時間自動修復が行われない場合は、`show proc "/cluster_balance"`ステートメントを使用して、システムが現在実行中のタブレット修復とスケジューリングタスクを確認する必要があります。スケジュール待ちの大量のタブレットがあることが原因で、修復時間が長くなっている可能性があります。`pending_tablets`と`running_tablets`の記録を追跡できます。

さらに、`admin repair`ステートメントを使用して、最初に修復するテーブルまたはパーティションを指定できます。詳細については、`help admin repair`を参照してください。

それでも修復できない場合は、複数のレプリカがある場合に、`admin set replica status`コマンドを使用して問題のあるレプリカを強制的にオフラインにします。詳細については、`help admin set replica status`でレプリカステータスをbadに設定する例を参照してください。（badに設定後、そのコピーはアクセスされなくなります。その後自動的に修復されます。しかし、操作前に他のコピーが正常であることを確認する必要があります）

### Q8. Not connected to 192.168.100.1:8060 yet, server_id=384

インポートまたはクエリ時にこのエラーが発生する可能性があります。対応するBEログを確認すると、類似のエラーも見つかる場合があります。

これはRPCエラーであり、通常2つの可能性があります：1. 対応するBEノードがダウンしている。2. rpc輻輳またはその他のエラー。

BEノードがダウンしている場合は、具体的なダウン理由を確認する必要があります。ここではrpc輻輳の問題のみを説明します。

1つのケースはOVERCROWDEDで、これはrpcソースに閾値を超える大量の未送信データがあることを意味します。BEにはこれに関連する2つのパラメータがあります：

1. `brpc_socket_max_unwritten_bytes`：デフォルト値は1GBです。未送信データがこの値を超えるとエラーが報告されます。この値を適切に変更してOVERCROWDEDエラーを回避できます。（ただし、これは対症療法であり、本質的にはまだ輻輳があります）。
2. `tablet_writer_ignore_eovercrowded`：デフォルトはfalseです。trueに設定すると、Dorisはインポート中のOVERCROWDEDエラーを無視します。このパラメータは主にインポートの失敗を回避し、インポートの安定性を向上させるためのものです。

2つ目は、rpcのパケットサイズがmax_body_sizeを超える場合です。この問題は、クエリに非常に大きなString型またはbitmap型がある場合に発生する可能性があります。以下のBEパラメータを変更することで回避できます：

```
brpc_max_body_size：default 3GB.
```
### Q9. [ Broker load ] org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe

インポート中に`org.apache.thrift.transport.TTransportException: java.net.SocketException: Broken pipe`が発生する。

この問題の原因は、外部ストレージ（HDFSなど）からデータをインポートする際に、ディレクトリ内のファイル数が多すぎるため、ファイルディレクトリのリスト化に時間がかかりすぎることが考えられます。ここで、Broker RPC Timeoutはデフォルトで10秒に設定されており、ここでタイムアウト時間を適切に調整する必要があります。

`fe.conf`設定ファイルを変更して、以下のパラメータを追加してください：

```
broker_timeout_ms = 10000
##The default here is 10 seconds, you need to increase this parameter appropriately
```
ここにパラメータを追加するには、FEサービスの再起動が必要です。

### Q10. [ Routine load ] ReasonOfStateChanged: ErrorReason{code=errCode = 104, msg='be 10004 abort task with reason: fetch failed due to requested offset not available on the broker: Broker: Offset out of range'}

この問題の原因は、Kafkaのcleanupポリシーがデフォルトで7日間に設定されていることです。routine loadタスクが何らかの理由で中断され、長時間タスクが復旧されない場合、タスクが再開されたときに、routine loadは消費offsetを記録しますが、kafkaが対応するoffsetをクリーンアップしているとこの問題が発生します。

そのため、この問題はalter routine loadで解決できます：

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

自動パーティション化されたテーブルにデータをインポートする際に、誤って過度に多くのパーティションが作成されることを防ぐため、FE設定項目`max_auto_partition_num`を使用して、そのようなテーブルに対して自動的に作成されるパーティションの最大数を制御しています。より多くのパーティションを作成する必要がある場合は、FE Masterノードのこの設定項目を変更してください。
