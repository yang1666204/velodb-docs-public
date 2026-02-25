---
{
  "title": "メタデータの操作と保守",
  "description": "この文書は、実際の本番環境においてDorisメタデータを管理する方法に焦点を当てています。FEノードの推奨デプロイメント、",
  "language": "ja"
}
---
:::warning

絶対に必要な場合を除いて、metadata_failure_recoveryの使用は避けてください。これを使用すると、メタデータの切り詰め、損失、およびスプリットブレインが発生する可能性があります。不適切な操作による不可逆的なデータ損傷を防ぐため、慎重に使用してください。
:::

このドキュメントでは、実際の本番環境でDorisメタデータを管理する方法に焦点を当てています。FEノードの推奨デプロイメント、一般的に使用される運用方法、および一般的なエラー解決方法が含まれています。

当面は、[Dorisメタデータ設計ドキュメント](https://doris.apache.org/community/design/metadata-design)を読んで、Dorisメタデータがどのように動作するかを理解してください。

## 重要なヒント

* 現在のメタデータ設計は下位互換性がありません。つまり、新しいバージョンに新しいメタデータ構造の変更がある場合（FEコードの`FeMetaVersion.java`ファイルに新しいVERSIONがあるかどうかで確認できます）、通常、新しいバージョンにアップグレードした後に古いバージョンにロールバックすることは不可能です。したがって、FEをアップグレードする前に、アップグレードドキュメントの操作に従ってメタデータの互換性を必ずテストしてください。

## メタデータカタログ構造

fe.confで指定された`meta_dir`のパスが`path/to/doris-meta`であると仮定します。通常のDorisクラスターでは、メタデータのディレクトリ構造は以下のようになります：

```
/path/to/doris-meta/
            |-- bdb/
            |   |-- 00000000.jdb
            |   |-- je.config.csv
            |   |-- je.info.0
            |   |-- je.info.0.lck
            |   |-- je.lck
            |   `-- je.stat.csv
            `-- image/
                |-- ROLE
                |-- VERSION
                `-- image.xxxx
```
1. bdb

分散型kVシステムとして[bdbje](https://www.oracle.com/technetwork/database/berkeleydb/overview/index-093405.html)を使用してメタデータジャーナルを保存しています。このBDBディレクトリはbdbjeの「データディレクトリ」に相当します。

`.jdb`サフィックスはbdbjeのデータファイルです。これらのデータファイルはメタデータジャーナルの増加に伴って増加します。Dorisが定期的にイメージを完成させると、古いログが削除されます。通常、これらのデータファイルの総サイズは数MBから数GB（インポート頻度などのDorisの使用方法によって異なる）で変動します。データファイルの総サイズが10GBより大きい場合、イメージが失敗したか、イメージの配布に失敗した履歴ジャーナルが削除できないかを確認する必要があります。

`je.info.0`はbdbjeの実行ログです。このログの時刻はUTC+0タイムゾーンです。これについては後のバージョンで修正する予定です。このログから、bdbjeがどのように動作するかも確認できます。

2. imageディレクトリ

imageディレクトリは、Dorisによって定期的に生成されるメタデータミラーを保存するために使用されます。通常、`image.xxxxx`ミラーファイルが表示されます。`xxxxx`は数字です。この数字は、イメージに`xxxx`より前のすべてのメタデータジャーナルが含まれていることを示します。このファイルの生成時間（`ls -al`で確認）は通常、ミラーの生成時間です。

`image.ckpt`ファイルも表示される場合があります。これは生成中のメタデータミラーです。`du -sh`コマンドでファイルサイズが増加していることが確認でき、ミラーコンテンツがファイルに書き込まれていることを示します。ミラーが書き込まれると、自動的に新しい`image.xxxxx`に名前を変更し、古いイメージファイルを置き換えます。

Masterロールを持つFEのみが定期的にイメージファイルを能動的に生成します。生成後、FEは他のnon-Masterロールにプッシュされます。他のすべてのFEがこのイメージを受信したことが確認されると、Master FEはbdbje内のメタデータジャーナルを削除します。そのため、イメージ生成が失敗するか、他のFEへのイメージプッシュが失敗すると、bdbje内のデータが蓄積されます。

`ROLE`ファイルはFEのタイプ（FOLLOWERまたはOBSERVER）を記録するテキストファイルです。

`VERSION`ファイルはDorisクラスタのクラスタIDとノード間のアクセス認証に使用されるトークンを記録するテキストファイルです。

`ROLE`ファイルと`VERSION`ファイルは同時に存在する場合もあれば、同時に存在しない場合もあります（初回起動時など）。

## 基本操作

### 単一ノードFE起動

単一ノードFEは最も基本的なデプロイメントモードです。完全なDorisクラスタには少なくとも1つのFEノードが必要です。FEノードが1つしかない場合、ノードのタイプはFollowerで、ロールはMasterです。

1. 初回起動

	1. fe.confで指定された`meta_dir`のパスを`path/to/doris-meta`とします。
	2. `path/to/doris-meta`が既に存在し、権限が正しく、ディレクトリが空であることを確認します。
	3. `sh bin/start_fe.sh`で直接起動します。
	4. 起動後、fe.logに以下のログが表示されます：

		* Palo FE starting...
		* image does not exist: /path/to/doris-meta/image/image.0
		* transfer from INIT to UNKNOWN
		* transfer from UNKNOWN to MASTER
		* the very first time to open bdb, dbname is 1
		* start fencing, epoch number is 1
		* finish replay in xxx msec
		* QE service start
		* thrift server started

		上記のログは必ずしもこの順序である必要はありませんが、基本的には類似しています。

	5. 単一ノードFEの初回起動では通常問題は発生しません。上記のログが表示されない場合、一般的にはドキュメントの手順を注意深く従っていない可能性があります。関連するwikiを注意深く読んでください。

2. 再起動

	1. 停止したFEノードは`sh bin/start_fe.sh`で再起動できます。
	2. 再起動後、fe.logに以下のログが表示されます：

		* Palo FE starting...
		* finished to get cluster id: xxxx, role: FOLLOWER and node name: xxxx
		* 再起動前にイメージが生成されていない場合：
		* image does not exist: /path/to/doris-meta/image/image.0

		* 再起動前にイメージが生成されている場合：
		* start load image from /path/to/doris-meta/image/image.xxx. is ckpt: false
		* finished load image in xxx ms

		* transfer from INIT to UNKNOWN
		* replayed journal id is xxxx, replay to journal id is yyyy
		* transfer from UNKNOWN to MASTER
		* finish replay in xxx msec
		* master finish replay journal, can write now.
		* begin to generate new image: image.xxxx
		*  start save image to /path/to/doris-meta/image/image.ckpt. is ckpt: true
		*  finished save image /path/to/doris-meta/image/image.ckpt in xxx ms. checksum is xxxx
		*  push image.xxx to other nodes. totally xx nodes, push succeeded xx nodes
		* QE service start
		* thrift server started

		上記のログは必ずしもこの順序である必要はありませんが、基本的には類似しています。

3. よくある問題

	単一ノードFEのデプロイメントでは、開始・停止で通常問題は発生しません。質問がある場合は、関連するWikiを参照し、操作手順を注意深く確認してください。

### FE追加

FEプロセスの追加については、弾性拡張ドキュメントで詳細に説明されているため、ここでは繰り返しません。注意点とよくある問題を示します。

1. 注意点

	* 新しいFEを追加する前に、現在のMaster FEが正常に動作していることを確認してください（接続が正常、JVMが正常、イメージ生成が正常、bdbjeデータディレクトリが大きすぎないなど）
	* 新しいFEを初回起動する際は、Master FEを指す`--helper`パラメータを必ず追加してください。再起動時は`--helper`を追加する必要はありません。（`--helper`が指定されている場合、FEは直接helperノードにロールを問い合わせます。指定されていない場合、FEは`doris-meta/image/`ディレクトリの`ROLE`および`VERSION`ファイルから情報を取得しようとします。
	* 新しいFEを初回起動する際は、FEの`meta_dir`が作成されており、正しい権限があり、空であることを確認してください。
	* 新しいFEの起動と`ALTER SYSTEM ADD FOLLOWER/OBSERVER`文の実行によるFEのメタデータへの追加は、順序が要求されません。新しいFEを先に起動し、文が実行されていない場合、新しいFEログに`current node is not added to the group. Please add it first.`が表示されます。文が実行されると、正常なプロセスに入ります。
	* 前のFEが正常に追加された後に、次のFEを追加することを確認してください。
	* MASTER FEに接続し、`ALTER SYSTEM ADD FOLLOWER/OBSERVER`文を実行してください。

2. よくある問題

	1. this need is DETACHED

		追加するFEを初回起動する際、Master FEのdoris-meta/bdb内のデータが大きい場合、追加するFEログに`this node is DETACHED`という文字が表示される場合があります。この時点でbdbjeがデータをコピーしており、追加するFEの`bdb/`ディレクトリが増加していることが確認できます。このプロセスは通常数分かかります（bdbje内のデータ量によって異なります）。その後、fe.logにbdbje関連のエラースタック情報が表示される場合があります。最終的なログに`QE service start`と`thrift server start`が表示されれば、通常は起動が成功しています。mysql-client経由でこのFEに接続を試すことができます。これらの文字が表示されない場合、bdbje複製ログタイムアウトの問題である可能性があります。この時点でFEを直接再起動すると通常問題が解決されます。

	2. 様々な理由による追加失敗

		* OBSERVERを追加する場合、OBSERVER タイプのFEはメタデータ書き込みの過半数に参加しないため、理論的には自由に起動・停止できます。そのため、OBSERVER追加失敗の場合、OBSERVER FEプロセスを直接killできます。OBSERVERのメタデータディレクトリをクリアした後、再度プロセスを追加してください。

		* FOLLOWERを追加する場合、FOLLOWERは参加メタデータによって大部分が書き込まれるため、FOLLOWERがbdbje選挙チームに加入している可能性があります。FOLLOWER ノードが2つしかない場合（MASTERを含む）、1つのFEを停止すると、大部分の時間書き込みができないため、もう1つのFEが終了する可能性があります。この時点で、まず`ALTER SYSTEM DROP FOLLOWER`コマンドでメタデータから新しく追加されたFOLLOWERノードを削除し、その後FOLLOWERプロセスをkillし、メタデータを空にしてプロセスを再追加する必要があります。

### FE削除

`ALTER SYSTEM DROP FOLLOWER/OBSERVER`コマンドで対応するタイプのFEを削除できます。以下の点に注意してください：

* OBSERVERタイプのFEの場合、直接DROPするだけで十分で、リスクはありません。

* FOLLOWERタイプのFEの場合、まず奇数個のFOLLOWER（3個以上）から削除を開始することを確認してください。

	1. non-MASTERロールのFEを削除する場合、MASTER FEに接続し、DROPコマンドを実行してからプロセスをkillすることを推奨します。
	2. MASTER FEを削除したい場合、まず奇数個のFOLLOWER FEが存在し、正常に動作していることを確認してください。その後、まずMASTER FEプロセスをkillしてください。この時点で、FEがMASTERに選出されます。残りのFEが正常に動作していることを確認した後、新しいMASTER FEに接続してDROPコマンドを実行し、古いMASTER FEを削除してください。

## 高度な操作

### 障害復旧

FEは何らかの理由でbdbjeの起動やFE間の同期に失敗する場合があります。現象にはメタデータの書き込み不能、MASTERの不在などがあります。この時点で、手動でFEを復旧する必要があります。FEの手動復旧の一般的な原則は、現在の`meta_dir`内のメタデータを通じて新しいMASTERを開始し、その後他のFEを1つずつ追加することです。以下の手順を厳密に従ってください：

1. まず、**すべてのFEプロセスとすべてのビジネスアクセスを停止してください**。メタデータ復旧中に外部アクセスが他の予期しない問題を引き起こさないことを確認してください。（これを行わないと、スプリットブレイン問題が発生する可能性があります）

2. どのFEノードのメタデータが最新かを特定します：

	* まず、**すべてのFEの`meta_dir`ディレクトリを必ずバックアップしてください。**
	* 通常、Master FEのメタデータが最新です。`meta_dir/image`ディレクトリ内のimage.xxxxファイルのサフィックスを確認できます。数字が大きいほど、メタデータが新しくなります。
	* 通常、すべてのFOLLOWER FEイメージファイルを比較することで、最新のメタデータを見つけることができます。
	* その後、最新のメタデータを持つFEノードを使用して復旧します。
	* OBSERVERノードのメタデータを使用して復旧するとより煩雑になるため、可能な限りFOLLOWERノードを選択することを推奨します。

3. ステップ2で選択したFEノードで以下の操作を実行します。

	1. fe.confを変更
       - ノードがOBSERVERの場合、まず`meta_dir/image/ROLE`ファイル内の`role=OBSERVER`を`role=FOLLOWER`に変更してください。（OBSERVERノードからの復旧はより煩雑になるため、まずここの手順に従い、その後個別に説明します）
       - fe.version < 2.0.2の場合、fe.confに設定を追加：`metadata_failure_recovery=true`。
	2. `sh bin/start_fe.sh --metadata_failure_recovery --daemon`でFEを起動してください。（OBSERVERノードから復旧している場合、このステップの後、後続のOBSERVERドキュメントにジャンプしてください。）
	3. 正常であれば、FEはMASTERのロールで起動し、前のセクション`単一ノードFE起動`の説明と類似します。fe.logに`transfer from XXXX to MASTER`という文字が表示されるはずです。
	4. 起動完了後、まずFEに接続し、いくつかのクエリインポートを実行して正常にアクセスできるかを確認してください。操作が正常でない場合、間違っている可能性があります。上記の手順を注意深く読み、以前にバックアップしたメタデータで再試行することを推奨します。それでもだめな場合、問題はより深刻である可能性があります。
	5. 成功した場合、`show frontends;`コマンドで、以前に追加したすべてのFEが表示され、現在のFEがmasterであることが確認できるはずです。
    6. **FEバージョン < 2.0.2の場合**、fe.conf内の`metadata_failure_recovery=true`設定項目を削除するか、`false`に設定してFEを再起動してください（**重要**）。

	:::tip
	 OBSERVERノードからメタデータを復旧している場合、上記の手順完了後、現在のFEロールがOBSERVERであるが、`IsMaster`が`true`として表示されることがわかります。これは、ここで見られる「OBSERVER」がDorisのメタデータに記録されているが、masterかどうかはbdbjeのメタデータに記録されているためです。OBSERVERノードから復旧したため、不整合が発生しました。この問題を修正するために以下の手順を実行してください（後のバージョンで修正予定）：

	 1. まず、この「OBSERVER」以外のすべてのFEノードをDROPしてください。

	 2. `ADD FOLLOWER`コマンドで新しいFOLLOWER FEを追加します（hostAにあると仮定）。

	 3. hostAで新しいFEを起動し、`helper`でクラスタに参加させてください。

	 4. 起動成功後、`show frontends;`文で2つのFEが表示されるはずです。1つは前のOBSERVER、もう1つは新しく追加されたFOLLOWERで、OBSERVERがmasterです。

	 5. 新しいFOLLOWERが正常に動作していることを確認した後、新しいFOLLOWERメタデータを使用して障害復旧操作を再度実行してください。
	 
	 6. 上記手順の目的は、人工的にFOLLOWERノードのメタデータを製造し、そのメタデータを使用して障害復旧を再起動することです。これにより、OBSERVERからメタデータを復旧する際の不整合を回避できます。

	`metadata_failure_recovery`の意味は、`bdbje`のメタデータを空にすることです。これにより、bdbjeは以前の他のFEに接続せず、独立したFEとして起動します。このパラメータは復旧起動時にのみtrueに設定する必要があります。復旧後は必ずfalseに設定してください。そうでないと、再起動時にbdbjeのメタデータが再び空になり、他のFEが正常に動作できなくなります。
	:::

4. ステップ3の成功実行後、`ALTER SYSTEM DROP FOLLOWER/OBSERVER`コマンドで以前のFEをメタデータから削除し、新しいFE追加の方法で再度追加します。

5. 上記の操作が正常であれば、復旧完了です。

### FEタイプ変更

既存のFOLLOWER/OBSERVERタイプFEをOBSERVER/FOLLOWERタイプに変更する必要がある場合、上記で説明した方法でFEを削除し、その後対応するタイプのFEを追加してください。

### FE移行

FEを現在のノードから別のノードに移行する必要がある場合、いくつかのシナリオがあります。

1. non-MASTERノードのFOLLOWERまたはOBSERVER移行

	新しいFOLLOWER/OBSERVERを直接追加した後、古いFOLLOWER/OBSERVERを削除してください。

2. 単一ノードMASTER移行

	FEが1つしかない場合、`障害復旧`セクションを参照してください。FEのdoris-metaディレクトリを新しいノードにコピーし、`障害復旧`セクションのステップ3で新しいMASTERを起動してください。

3. 一連のFOLLOWERを一連のノードから別の一連の新しいノードに移行

	新しいノードにFEをデプロイし、FOLLOWERを追加することで新しいノードを最初に追加してください。古いノードはDROPで1つずつ削除できます。DROP-by-DROPのプロセス中、MASTERは自動的に新しいFOLLOWERノードを選択します。

### FEポート交換

FEには現在以下のポートがあります

* Ed_log_port: bdbjeの通信ポート
* http_port: httpポート、イメージプッシュにも使用
* rpc_port: Frontendのthrift serverポート
* query_port: Mysql接続ポート
* arrow_flight_sql_port: Arrow Flight SQL接続ポート

1. edit_log_port

	このポートを交換する必要がある場合、`障害復旧`セクションの操作を参照して復旧する必要があります。ポートがbdbje自身のメタデータに永続化されている（Doris自身のメタデータにも記録されている）ため、Fe起動時に`metadata_failure_recovery`を設定してbdbjeのメタデータをクリアする必要があります。

2. http_port

	すべてのFE http_portは一致している必要があります。このポートを変更したい場合、すべてのFEを変更して再起動する必要があります。複数のFOLLOWERデプロイメントの場合、このポートの変更はより複雑になるため（卵と鶏の問題...）、この操作は推奨されません。必要な場合、`障害復旧`セクションの操作に直接従ってください。

3. rpc_port

	設定変更後、FEを直接再起動してください。Master FEはハートビートを通じてBEに新しいポートを通知します。Master FEのこのポートのみが使用されます。ただし、すべてのFEポートが一致していることを推奨します。

4. query_port

	設定変更後、FEを直接再起動してください。これはmysqlの接続ターゲットにのみ影響します。

5. arrow_flight_sql_port

	設定変更後、FEを直接再起動してください。これはarrow flight sql server接続ターゲットにのみ影響します。

### FEメモリからのメタデータ復旧
極端なケースでは、ディスク上のイメージファイルが破損している可能性がありますが、メモリ内のメタデータは完全です。この時点で、メモリからメタデータをダンプし、ディスク上のイメージファイルを置き換えてメタデータを復旧できます。全体的な無停止クエリサービス操作手順は以下の通りです：

1. すべてのLoad、Create、Alter操作を停止します。

2. 以下のコマンドを実行してMaster FEメモリからメタデータをダンプします：（以下image_memと呼びます）

```
curl -u $root_user:$password http://$master_hostname:8030/dump
```
3. OBSERVER FEノードの`meta_dir/image`ディレクトリにあるイメージファイルをimage_memファイルで置き換え、OBSERVER FEノードを再起動し、image_memファイルの整合性と正確性を検証します。FE WebページでDBとTableメタデータが正常かどうか、`fe.log`に例外があるかどうか、通常の再生されたjourにあるかどうかを確認できます。

    1.2.0以降、`image_mem`ファイルを検証するには以下の方法を使用することを推奨します：

    ```
    sh start_fe.sh --image path_to_image_mem
    ```
> 注意: `path_to_image_mem`は`image_mem`のパスです。
    >
    > 検証が成功した場合、`Load image success. Image file /absolute/path/to/image.xxxxxx is valid`が出力されます。
    >
    > 検証が失敗した場合、`Load image failed. Image file /absolute/path/to/image.xxxxxx is invalid`が出力されます。

4. FOLLOWER FEノードの`meta_dir/image`ディレクトリ内のimageファイルをimage_memファイルと順番に置き換え、FOLLOWER FEノードを再起動し、メタデータとクエリサービスが正常であることを確認します。

5. Master FEノードの`meta_dir/image`ディレクトリ内のimageファイルをimage_memファイルと置き換え、Master FEノードを再起動し、その後FE Masterの切り替えが正常であり、Master FEノードがcheckpointを通じて新しいimageファイルを生成できることを確認します。

6. すべてのLoad、Create、Alter操作を復旧します。

**注意: Imageファイルが大きい場合、全体のプロセスに長時間かかる可能性があるため、この期間中はMaster FEがcheckpointを通じて新しいimageファイルを生成しないようにしてください。Master FEノードの`meta_dir/image`ディレクトリ内のimage.ckptファイルがimage.xxxファイルと同じくらいの大きさになったことが確認できたら、image.ckptファイルは直接削除できます。**

### BDBJEでのデータ表示

FEのメタデータログはBDBJEにKey-Value形式で保存されます。一部の異常な状況では、メタデータエラーによりFEが開始されない場合があります。この場合、DorisはユーザーがBDBJEに保存されたデータをクエリする方法を提供し、トラブルシューティングを促進します。

まず、fe.confに設定を追加する必要があります：`enable_bdbje_debug_mode=true`、その後`sh start_fe.sh --daemon`を通じてFEを開始します。

この時、FEはデバッグモードに入り、httpサーバーとMySQLサーバーのみを開始し、BDBJEインスタンスを開きますが、メタデータやその他の後続の起動プロセスは読み込みません。

これにより、FEのWebページにアクセスするか、MySQLクライアント経由でDorisに接続した後、`show proc "/bdbje";`を通じて、BDBJEに保存されたデータを表示できます。

```
mysql> show proc "/bdbje";
+----------+---------------+---------+
| DbNames  | JournalNumber | Comment |
+----------+---------------+---------+
| 110589   | 4273          |         |
| epochDB  | 4             |         |
| metricDB | 430694        |         |
+----------+---------------+---------+
```
第1レベルディレクトリは、BDBJE内のすべてのデータベース名と各データベースのエントリ数を表示します。

```
mysql> show proc "/bdbje/110589";
+-----------+
| JournalId |
+-----------+
| 1         |
| 2         |

...
| 114858    |
| 114859    |
| 114860    |
| 114861    |
+-----------+
4273 rows in set (0.06 sec)
```
2番目のレベルに入ると、指定されたデータベース下のすべてのエントリキーが一覧表示されます。

```
mysql> show proc "/bdbje/110589/114861";
+-----------+--------------+---------------------------------------------+
| JournalId | OpType       | Data                                        |
+-----------+--------------+---------------------------------------------+
| 114861    | OP_HEARTBEAT | org.apache.doris.persist.HbPackage@6583d5fb |
+-----------+--------------+---------------------------------------------+
1 row in set (0.05 sec)
```
第3レベルでは、指定されたキーの値情報を表示できます。

## Best Practices

FEの展開推奨事項はInstallation and Deployment Documentに記載されています。ここではいくつかの補足を説明します。

* **FEメタデータの動作ロジックをよく知らない場合、またはFEメタデータの運用保守経験が十分でない場合、実際の運用では1つのFOLLOWER型FEのみをMASTERとして展開し、他のFEはOBSERVERにすることを強く推奨します。これにより多くの複雑な運用保守問題を軽減できます。** MASTERの単一点障害によるメタデータ書き込み失敗を過度に心配する必要はありません。第一に、適切に設定されていればjavaプロセスとしてのFEがハングアップすることは非常に困難です。第二に、MASTERディスクが破損した場合（確率は非常に低い）でも、OBSERVERのメタデータを使用して`fault recovery`により手動復旧することができます。

* FEプロセスのJVMは十分なメモリを確保する必要があります。FEのJVMメモリは最低10GB、32GBから64GBにすることを**強く推奨**します。そしてJVMメモリ使用量を監視するモニタリングを導入してください。FEでOOMが発生するとメタデータ書き込みが失敗し、**復旧不可能**な障害を引き起こす可能性があります！

* FEノードには過剰なメタデータによるディスク容量不足を防ぐため、十分なディスク容量が必要です。同時に、FEログも10数GBのディスク容量を消費します。

## その他の一般的な問題

1. fe.logに`meta out of date. current time: xxx, synchronized time: xxx, has log: xxx, fe type: xxx`が出力される

	これは通常FEがMasterを選出できないために発生します。例えば、3つのFOLLOWERが設定されているが1つのFOLLOWERのみが起動している場合、このFOLLOWERでこの問題が発生します。通常は残りのFOLLOWERを起動するだけで解決します。起動後も問題が解決しない場合は、`Failure Recovery`セクションの方法に従って手動復旧が必要になる可能性があります。

2. `Clock delta: xxxx ms. between Feeder: xxxx and this Replica exceeds max permissible delta: xxxx ms.`

	Bdbjeではノード間の時刻誤差が一定の閾値を超えてはいけません。超過した場合、ノードは異常終了します。デフォルトの閾値は5000msで、FEパラメータ`max_bdbje_clock_delta_ms`で制御され、適宜変更可能です。しかし、NTPなどの時刻同期方法を使用してDorisクラスターホストの時刻同期を確保することを推奨します。

3. `image/`ディレクトリ内のミラーファイルが長時間更新されていない

	Master FEはデフォルトでメタデータジャーナル50,000件ごとにミラーファイルを生成します。頻繁に使用されるクラスターでは、通常半日から数日ごとに新しいimageファイルが生成されます。imageファイルが長時間（例：1週間以上）更新されていない場合は、以下の順序で原因を確認できます：

	1. Master FEのfe.logで`memory is not enough to do checkpoint. Committed memory XXXX Bytes, used memory XXXX Bytes. `を検索します。見つかった場合は、現在のFEのJVMメモリがimage生成に不十分であることを示します（通常image生成にはFEメモリの半分を確保する必要があります）。この場合JVMメモリを追加してFEを再起動してから観察する必要があります。Master FEが再起動するたびに、新しいimageが直接生成されます。この再起動方法は能動的に新しいimageを生成するためにも使用できます。複数のFOLLOWER展開がある場合、現在のMaster FEを再起動すると別のFOLLOWER FEがMASTERになり、その後のimage生成は新しいMasterが担当することに注意してください。したがって、すべてのFOLLOWER FEのJVMメモリ設定を変更する必要がある可能性があります。

	2. Master FEのfe.logで`begin to generate new image: image.xxxx`を検索します。見つかった場合はimageが生成されています。このスレッドの後続ログを確認し、`checkpoint finished save image.xxxx`が表示されればimageの書き込みは成功です。`Exception when generating new image file`が発生した場合は生成が失敗しており、具体的なエラーメッセージを確認する必要があります。

4. `bdb/`ディレクトリのサイズが非常に大きく、数GB以上に達している

	新しいimageが生成できないエラーを解消した後も、BDBディレクトリは一定期間大きなままになります。これはMaster FEがimageのプッシュに失敗したことが原因の可能性があります。Master FEのfe.logで`push image.XXXX to other nodes. totally XX nodes, push succeeded YY nodes`を検索できます。YYがxxより小さい場合、一部のFEへのプッシュが失敗しています。fe.logで具体的なエラー`Exception when pushing image file.url = xxx`を確認できます。

	同時に、FE設定ファイルに設定を追加できます：`edit_log_roll_num = xxxx`。このパラメータはメタデータジャーナル数を設定し、一度imageを作成します。デフォルトは50000です。この数値を適宜減らしてimageをより頻繁に作成し、古いジャーナルの削除を高速化できます。

5. FOLLOWER FEが次々とハングアップする

	Dorisのメタデータは過半数書き込み戦略を採用しているため、メタデータジャーナルが成功とみなされるには少なくとも一定数のFOLLOWER FE（例：3つのFOLLOWERの場合、2つに正常に書き込み）への書き込みが必要です。書き込みが失敗した場合、FEプロセスは自ら終了します。例えば3つのFOLLOWER：A、B、Cがあるとします。最初にCがハングアップし、次にBがハングアップすると、Aもハングアップします。そのため`Best Practices`セクションで説明したように、メタデータ運用保守の豊富な経験がない場合は、複数のFOLLOWERの展開は推奨されません。

6. fe.logに`get exception when try to close previously opened bdb database. ignore it`が表示される

	後ろに`ignore it`という文言がある場合、通常は対処する必要はありません。興味がある場合は、`BDBEnvironment.java`でこのエラーを検索し、注釈を参照してください。

7. `show frontends;`から見ると、あるFEの`Join`が`true`と表示されているが、実際にはFEが異常である

	`show frontends;`で`Join`情報を確認します。この列が`true`の場合、FEが**クラスターに参加した**ことのみを意味します。クラスター内でまだ正常に存在していることを意味するものではありません。`false`の場合は、FEが**クラスターに参加したことがない**ことを意味します。

8. FEの`master_sync_policy`、`replica_sync_policy`、`txn_rollback_limit`の設定

	`master_sync_policy`はLeader FEがメタデータログを書き込む際にfsync()を呼び出すかどうかを指定し、`replica_sync_policy`はFE HA展開時に他のFollower FEが同期メタデータ時にfsync()を呼び出すかどうかを指定します。Dorisの以前のバージョンでは、これら2つのパラメータはデフォルトで`WRITE_NO_SYNC`、つまりfsync()を呼び出しませんでした。最新バージョンのDorisでは、デフォルトが`SYNC`、つまりfsync()を呼び出すように変更されました。fsync()の呼び出しはメタデータディスク書き込み効率を大幅に低下させます。一部の環境では、IOPSが数百まで低下し、レイテンシーが2-3msに増加する可能性があります（ただしDorisのメタデータ操作には十分です）。したがって、以下の設定を推奨します：

	1. 単一Follower FE展開の場合、`master_sync_policy`を`SYNC`に設定し、FEシステムの停止によるメタデータ損失を防ぎます。
	2. 複数Follower FE展開の場合、複数システムの同時停止確率は非常に低いと考えられるため、`master_sync_policy`と`replica_sync_policy`を`WRITE_NO_SYNC`に設定できます。

	単一Follower FE展開で`master_sync_policy`を`WRITE_NO_SYNC`に設定した場合、FEシステム停止が発生してメタデータが損失する可能性があります。この時点で他のObserver FEが再起動を試みると、エラーが報告される可能性があります：

    ```
    Node xxx must rollback xx total commits(numPassedDurableCommits of which were durable) to the earliest point indicated by transaction xxxx in order to rejoin the replication group, but the transaction rollback limit of xxx prohibits this.
    ```
これは、永続化されたいくつかのトランザクションをロールバックする必要があるが、エントリ数が上限を超えていることを意味します。ここでのデフォルトの上限は100で、`txn_rollback_limit`を設定することで変更できます。この操作はFEを正常に起動させることのみを目的としており、失われたメタデータを復旧することはできません。
