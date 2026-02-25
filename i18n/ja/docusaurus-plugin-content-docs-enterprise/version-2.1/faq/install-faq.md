---
{
  "title": "インストールエラー",
  "description": "この文書は主にDorisの使用における運用・保守の一般的な問題を記録するために使用されます。随時更新されます。",
  "language": "ja"
}
---
# 運用保守エラー

このドキュメントは主にDorisの使用中における運用保守の一般的な問題を記録するために使用されます。定期的に更新される予定です。

**このドキュメントに記載されているBEバイナリ名は`doris_be`ですが、以前のバージョンでは`palo_be`でした。**

### Q1. DECOMMISSIONを通じてBEノードをログオフする際、なぜ常にいくつかのタブレットが残るのですか？

オフライン処理中、show backendsを使用してオフラインノードのtabletNumを確認すると、tabletNumの数が減少していることが観察できます。これは、データシャードがこのノードから移行されていることを示しています。数が0まで減少すると、システムは自動的にそのノードを削除します。しかし、場合によっては、tabletNumが特定の値まで下がった後変化しなくなることがあります。これは通常、2つの理由が考えられます：

1. タブレットが削除されたばかりのテーブル、パーティション、またはマテリアライズドビューに属している。削除されたばかりのオブジェクトはごみ箱に残っています。オフラインロジックはこれらのシャードを処理しません。オブジェクトがごみ箱に滞在する時間は、FE設定パラメータcatalog_trash_expire_secondを変更することで修正できます。これらのタブレットは、オブジェクトがごみ箱から削除されるときに処理されます。
2. これらのタブレットの移行タスクに問題がある。この場合、`show proc "/cluster_balance"`を通じて特定のタスクのエラーを確認する必要があります。

上記の状況については、まず`show proc "/cluster_health/tablet_health";`を通じてクラスタ内に不健全なシャードがあるかどうかを確認できます。0であれば、drop backend文を通じて直接BEを削除できます。そうでなければ、不健全なシャードのレプリカも詳細に確認する必要があります。

### Q2. priorty_networkはどのように設定すべきですか？

priorty_networkはFEとBE両方の設定パラメータです。このパラメータは主に、システムが正しいネットワークカードIPを自身のIPとして選択するのを支援するために使用されます。後続のマシンに新しいネットワークカードを追加することによって引き起こされる誤ったIP選択の問題を防ぐため、いかなる場合でもこのパラメータを明示的に設定することをお勧めします。

priorty_networkの値はCIDR形式で表現されます。2つの部分に分かれており、最初の部分はドット記法による10進数のIPアドレス、2番目の部分はプレフィックス長です。例えば10.168.1.0/8はすべての10.xx.xx.xx IPアドレスにマッチし、10.168.1.0/16はすべての10.168.xx.xx IPアドレスにマッチします。

特定のIPを直接指定するのではなくCIDR形式を使用する理由は、すべてのノードが統一された設定値を使用できるようにするためです。例えば、10.168.10.1と10.168.10.2という2つのノードがある場合、priorty_networkの値として10.168.10.0/24を使用できます。

### Q3. FEのMaster、Follower、Observerとは何ですか？

まず、FEには2つの役割のみがあることを明確にします：FollowerとObserver。MasterはFollowerノードのグループから選択されたFEに過ぎません。Masterは特殊な種類のFollowerと見なすことができます。そのため、クラスタにいくつのFEがあり、それらの役割は何かと聞かれた場合、正しい答えはすべてのFEノードの数、Follower役割の数、Observer役割の数であるべきです。

Follower役割のすべてのFEノードは選択可能なグループを形成し、Paxos合意プロトコルのグループ概念に似ています。グループ内のFollowerがMasterとして選出されます。Masterがダウンすると、新しいFollowerが自動的にMasterとして選択されます。ObserverはMasterに選出されることがないため、選出に参加しません。

メタデータログが成功と見なされるためには、大部分のFollowerノードで正常に書き込まれる必要があります。例えば、3つのFEがある場合、2つだけが正常に書き込まれればよいです。これが、Follower役割の数が奇数である必要がある理由です。

Observerの役割は、この単語の意味と同じです。正常に書き込まれたメタデータログを同期し、メタデータ読み取りサービスを提供する観察者としてのみ機能します。多数決書き込みのロジックには関与しません。

通常、1 Follower + 2 ObserverまたはFollower + N Observerを展開できます。前者は運用保守が簡単で、フォロワー間の整合性合意による複雑なエラー状況はほとんどありません（ほとんどの企業がこの方法を使用しています）。後者はメタデータ書き込みの高可用性を保証できます。高同時クエリシナリオの場合、Observerを適切に追加できます。

### Q4. ノードに新しいディスクが追加されたとき、なぜデータが新しいディスクに分散されないのですか？

現在のDorisの分散戦略はノードベースです。つまり、ノードの全体的な負荷指標（シャード数と総ディスク使用率）に従ってクラスタ負荷を判断します。そして、高負荷ノードから低負荷ノードにデータシャードを移行します。各ノードがディスクを追加した場合、ノード全体の観点から見ると負荷は変化しないため、分散ロジックをトリガーできません。

さらに、Dorisは現在、単一ノード内のディスク間での分散操作をサポートしていません。そのため、新しいディスクを追加した後、データは新しいディスクに分散されません。

ただし、ノード間でデータが移行される際、Dorisはディスクを考慮します。例えば、シャードがノードAからノードBに移行される場合、ノードBでディスク容量使用率の低いディスクが優先的に選択されます。

ここで、この問題を解決する3つの方法を提供します：

1. 新しいテーブルの再構築

   create table like文を通じて新しいテーブルを作成し、その後insert into select方法を使用して古いテーブルから新しいテーブルにデータを同期します。新しいテーブルが作成される際、新しいテーブルのデータシャードが新しいディスクに分散されるため、データも新しいディスクに書き込まれます。この方法は、データ量が少ない場合（数十GB以内）に適しています。

2. Decommissionコマンドを通じて

   decommissionコマンドは、BEノードを安全に廃止するために使用されます。このコマンドは最初にノード上のデータシャードを他のノードに移行し、その後ノードを削除します。前述のように、データ移行中は、ディスク使用率の低いディスクが優先されるため、この方法はデータを他のノードのディスクに「強制的に」移行できます。データ移行が完了したら、decommission操作をキャンセルし、データがこのノードに再分散されるようにします。すべてのBEノードで上記の手順を実行すると、データはすべてのノードのすべてのディスクに均等に分散されます。

   decommissionコマンドを実行する前に、オフライン後にノードが削除されることを避けるため、次のコマンドを実行してください。

   `admin set frontend config("drop_backend_after_decommission" = "false");`

3. APIを使用した手動データ移行

   DorisはHTTP APIを提供しており、1つのディスク上のデータシャードを別のディスクに手動で移行することを指定できます。

### Q5. FE/BEログを正しく読み取るにはどうすればよいですか？

多くの場合、ログを通じて問題をトラブルシューティングする必要があります。ここでは、FE/BEログの形式と表示方法について説明します。

1. FE

   FEログには主に以下が含まれます：

   - fe.log：メインログ。fe.out以外のすべてが含まれます。
   - fe.warn.log：メインログのサブセット、WARNとERRORレベルのログのみが記録されます。
   - fe.out：標準/エラー出力（stdoutとstderr）のログ。
   - fe.audit.log：監査ログ、このFEが受信したすべてのSQLリクエストを記録します。

   典型的なFEログは以下のようになります：

   ```text
   2021-09-16 23:13:22,502 INFO (tablet scheduler|43) [BeLoadRebalancer.selectAlternativeTabletsForCluster():85] cluster is balance: default_cluster with medium: HDD.skip
   ```
- `2021-09-16 23:13:22,502`: ログ時刻。
   - `INFO: log level, default is INFO`: ログレベル、デフォルトは INFO。
   - `(tablet scheduler|43)`: スレッド名とスレッド ID。スレッド ID を通じて、このスレッドのコンテキスト情報を確認し、このスレッドで何が起こったかをチェックできます。
   - `BeLoadRebalancer.selectAlternativeTabletsForCluster():85`: クラス名、メソッド名、コード行番号。
   - `cluster is balance xxx`: ログ内容。

   通常、主に fe.log ログを確認します。特殊なケースでは、一部のログが fe.out に出力される場合があります。

2. BE

   BE ログには主に以下が含まれます：

   - be.INFO: メインログ。これは実際にはソフトリンクで、最新の be.INFO.xxxx に接続されています。
   - be.WARNING: メインログのサブセットで、WARN と FATAL レベルのログのみが記録されます。これは実際にはソフトリンクで、最新の be.WARN.xxxx に接続されています。
   - be.out: 標準/エラー出力（stdout と stderr）のログ。

   典型的な BE ログは以下の通りです：

   ```text
   I0916 23:21:22.038795 28087 task_worker_pool.cpp:1594] finish report TASK. master host: 10.10.10.10, port: 9222
   ```
- `I0916 23:21:22.038795`: ログレベルと日時。大文字のIはINFO、WはWARN、FはFATALを意味します。
   - `28087`: スレッドID。スレッドIDを通じて、このスレッドのコンテキスト情報を確認し、このスレッドで何が起こったかをチェックできます。
   - `task_worker_pool.cpp:1594`: コードファイルと行番号。
   - `finish report TASK xxx`: ログ内容。

   通常は主にbe.INFOログを確認します。BE停止などの特殊な場合には、be.outをチェックする必要があります。

### Q6. FE/BEノードがダウンした場合のトラブルシューティング方法

1. BE

   BEプロセスはC/C++プロセスで、プログラムバグ（メモリの範囲外、不正なアドレスアクセスなど）やOut Of Memory (OOM)により停止することがあります。この場合、以下の手順でエラーの原因を確認できます：

   1. be.outを確認

      BEプロセスは例外によりプログラムが終了する際、現在のエラースタックをbe.outに出力します（be.INFOやbe.WARNINGではなく、be.outであることに注意してください）。エラースタックにより、通常はプログラムがどこで問題が発生したかを大体把握できます。

      be.outにエラースタックがある場合、通常はプログラムバグが原因であり、一般ユーザーでは自力で解決できない可能性があることに注意してください。WeChat group、github discussion、dev mail groupでのサポートを歓迎し、対応するエラースタックを投稿していただければ、問題を迅速にトラブルシュートできます。

   2. dmesg

      be.outにスタック情報がない場合、OOMによってシステムが強制終了させた可能性が高いです。この場合、dmesg -Tコマンドを使用してLinuxシステムログを確認できます。最後にMemory cgroup out of memory: Kill process 7187 (doris_be) score 1007またはsacrifice childのようなログが表示されている場合、OOMが原因であることを意味します。

      メモリ問題は、大規模なクエリ、インポート、compactionなど多くの理由が考えられます。Dorisもメモリ使用量の最適化を継続的に行っています。WeChat group、github discussion、dev mail groupでのサポートを歓迎します。

   3. be.INFOでFから始まるログがあるかを確認

      Fから始まるログはFatalログです。例えば、F0916は9月16日のFatalログを示します。Fatalログは通常、プログラムのアサーションエラーを示し、アサーションエラーはプロセスを直接終了させます（プログラムのバグを示します）。WeChat group、github discussion、dev mail groupでのサポートを歓迎します。

2. FE

   FEはjavaプロセスで、C/C++プログラムよりも堅牢性が優れています。通常FEが停止する理由はOOM (Out-of-Memory)またはメタデータ書き込み失敗の可能性があります。これらのエラーは通常、fe.logやfe.outにエラースタックが記録されます。エラースタック情報に基づいて詳細な調査が必要です。

### Q7. データディレクトリSSDとHDDの設定について、テーブル作成時に`Failed to find enough host with storage medium and tag`エラーが発生

Dorisは1つのBEノードで複数のストレージパスの設定をサポートしています。通常、各ディスクに1つのストレージパスを設定できます。同時に、DorisはSSDやHDDなど、パスを指定するストレージメディアプロパティをサポートしています。SSDは高速ストレージデバイス、HDDは低速ストレージデバイスを表します。

クラスターが1つのタイプのメディアのみを持つ場合（すべてHDDまたはすべてSSD）、ベストプラクティスはbe.confでメディアプロパティを明示的に指定しないことです。上記の```Failed to find enough host with storage medium and tag```エラーが発生した場合、通常はbe.confでSSDメディアのみを設定しているにも関わらず、テーブル作成段階で```properties {"storage_medium" = "hdd"}```を明示的に指定していることが原因です。同様に、be.confでHDDメディアのみを設定し、テーブル作成段階で```properties {"storage_medium" = "ssd"}```を明示的に指定した場合も同じエラーが発生します。解決策は、テーブル作成時のpropertiesパラメータを設定に合わせて変更するか、be.confでのSSD/HDDの明示的な設定を削除することです。

パスのストレージメディアプロパティを指定することで、Dorisのホットコールドデータパーティションストレージ機能を活用し、パーティションレベルでホットデータをSSDに格納しながら、コールドデータは自動的にHDDに転送されます。

Dorisはストレージパスが配置されているディスクの実際のストレージメディアタイプを自動的に認識しないことに注意が必要です。このタイプはユーザーがパス設定で明示的に示す必要があります。例えば、パス"/path/to/data1.SSD"はこのパスがSSDストレージメディアであることを意味します。そして"data1.SSD"は実際のディレクトリ名です。Dorisはディレクトリ名の後の".SSD"サフィックスに基づいてストレージメディアタイプを判定し、実際のストレージメディアタイプではありません。つまり、ユーザーは任意のパスをSSDストレージメディアとして指定でき、Dorisはディレクトリサフィックスのみを認識し、ストレージメディアが一致するかは判断しません。サフィックスが記載されていない場合、デフォルトでHDDになります。

言い換えれば、".HDD"と".SSD"はストレージディレクトリの「相対的な」「低速」と「高速」を識別するためのもので、実際のストレージメディアタイプではありません。したがって、BEノード上のストレージパスにメディアの違いがない場合、サフィックスを記載する必要はありません。

### Q8. NginxでWeb UIロードバランシングを実装する際、複数のFEでログインできない問題

Dorisは複数のFEをデプロイできます。Web UIにアクセスする際、Nginxをロードバランシングに使用すると、セッション問題により常にログインの再実行が求められます。この問題は実際にはセッション共有の問題です。Nginxは集中セッション共有を提供します。解決策では、nginxのip_hash技術を使用します。ip_hashは特定のipのリクエストを同じバックエンドに振り分けることができ、このipの下のクライアントとバックエンドが安定したセッションを確立できます。ip_hashはupstream設定で定義されます：

```text
upstream doris.com {
   server 172.22.197.238:8030 weight=3;
   server 172.22.197.239:8030 weight=4;
   server 172.22.197.240:8030 weight=4;
   ip_hash;
}
```
完全なNginx設定例は以下のとおりです：

```text
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;
    #include /etc/nginx/custom/*.conf;
    upstream doris.com {
      server 172.22.197.238:8030 weight=3;
      server 172.22.197.239:8030 weight=4;
      server 172.22.197.240:8030 weight=4;
      ip_hash;
    }

    server {
        listen 80;
        server_name gaia-pro-bigdata-fe02;
        if ($request_uri ~ _load) {
           return 307 http://$host$request_uri ;
        }

        location / {
            proxy_pass http://doris.com;
            proxy_redirect default;
        }
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }
    }
 }
```
### Q9. FE の起動に失敗し、「wait catalog to be ready. FE type UNKNOWN」が fe.log で繰り返し表示される

この問題には通常2つの理由があります：

1. 今回 FE を起動した際に取得したローカル IP が前回の起動時と一致していない。通常は `priority_network` が正しく設定されていないことが原因で、FE が起動時に間違った IP アドレスにマッチしてしまいます。`priority_network` を修正してから FE を再起動してください。
2. クラスター内のほとんどの Follower FE ノードが起動していない。例えば、3つの Follower があり、1つだけが起動している場合。この時、少なくとも他の1つの FE を起動する必要があり、そうすることで FE の選出可能なグループが Master を選出してサービスを提供できるようになります。

上記の状況で解決できない場合、Doris 公式サイトドキュメントの[metadata operation and maintenance document] (../admin-manual/trouble-shooting/metadata-operation.md)に従って復旧できます。

### Q10. Lost connection to MySQL server at 'reading initial communication packet', system error: 0

MySQL client を使用して Doris に接続する際に以下の問題が発生した場合、これは通常 FE のコンパイル時に使用した jdk バージョンと FE の実行時に使用した jdk バージョンが異なることが原因です。docker を使用してイメージをコンパイルする際、デフォルトの JDK バージョンは openjdk 11 であり、コマンドを通じて openjdk 8 に切り替えることができます（詳細はコンパイルドキュメントを参照）。

### Q11. recoveryTracker should overlap or follow on disk last VLSN of 4,422,880 recoveryFirst= 4,422,882 UNEXPECTED_STATE_FATAL

FE を再起動する際、時々上記のエラーが発生します（通常は複数の Follower がある場合のみ）。そして、エラー内の2つの値は2つ異なっています。これにより FE の起動が失敗します。

これは bdbje のバグでまだ解決されていません。この場合、[Metadata Operation and Maintenance Documentation](../admin-manual/trouble-shooting/metadata-operation.md) の障害復旧操作を実行してメタデータを復旧するしかありません。

### Q12. Doris コンパイルとインストール時の JDK バージョン非互換性の問題

Docker を使用して Doris をコンパイルする際、コンパイル・インストール後に FE を起動すると、例外メッセージ `java.lang.Suchmethoderror: java.nio.ByteBuffer.limit (I)Ljava/nio/ByteBuffer;` が表示されます。これは Docker 内のデフォルトが JDK 11 であるためです。インストール環境で JDK8 を使用している場合、Docker 内で JDK 環境を JDK8 に切り替える必要があります。具体的な切り替え方法については、[Compile Documentation](https://doris.apache.org/community/source-install/compilation-with-docker) を参照してください。

### Q13. FE のローカル起動またはユニットテスト時のエラー Cannot find external parser table action_table.dat
以下のコマンドを実行してください

```
cd fe && mvn clean install -DskipTests
```
同じエラーが報告された場合は、以下のコマンドを実行してください

```
cp fe-core/target/generated-sources/cup/org/apache/doris/analysis/action_table.dat fe-core/target/classes/org/apache/doris/analysis
```
### ### Q14. Dorisがバージョン1.0以降にアップグレードし、ODBC経由でMySQLの外観で``Failed to set ciphers to use (2026)`エラーが報告される。
この問題は、dorisがバージョン1.0にアップグレードしてConnector/ODBC 8.0.x以降を使用した後に発生します。Connector/ODBC 8.0.xには、yum経由でインストールされ`libssl.so.10`と`libcrypto.so.10`に依存する`/usr/lib64/libmyodbc8w.so`などの複数のアクセス方法があります。
doris 1.0以降では、opensslは1.1にアップグレードされ、dorisバイナリパッケージに組み込まれているため、これによりopensslの競合と以下のようなエラーが発生する可能性があります

```
ERROR 1105 (HY000): errCode = 2, detailMessage = driver connect Error: HY000 [MySQL][ODBC 8.0(w) Driver]SSL connection error: Failed to set ciphers to use (2026)
```
解決策は、`Connector/ODBC 8.0.28`バージョンのODBC Connectorを使用し、オペレーティングシステムで`Linux - Generic`を選択することです。このバージョンのODBC Driverはopenssl version 1.1を使用します。または、[Connector/ODBC 5.3.14](https://dev.mysql.com/downloads/connector/odbc/5.3.html)などの低いバージョンのODBC connectorを使用してください。詳細については、[ODBC exterior documentation](https://doris.apache.org/docs/1.2/lakehouse/external-table/odbc)を参照してください。

MySQL ODBC Driverが使用するopensslのバージョンは以下の方法で確認できます

```
ldd /path/to/libmyodbc8w.so |grep libssl.so
```
出力に``libssl.so.10``が含まれている場合、使用時に問題が発生する可能性があります。``libssl.so.1.1``が含まれている場合は、doris 1.0と互換性があります。

### Q15. バージョン1.2にアップグレード後、BE NoClassDefFoundError問題で起動に失敗する
Java UDF依存関係エラー
アップグレードサポートでbeを起動する場合、以下のJava `NoClassDefFoundError`エラーが発生します

```
Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/doris/udf/IniUtil
Caused by: java.lang.ClassNotFoundException: org.apache.doris.udf.JniUtil
```
公式サイトから `apache-doris-java-udf-jar-with-dependencies-1.2.0` のJava UDF関数依存関係パッケージをダウンロードし、BEインストールディレクトリ下のlibディレクトリに配置してから、BEを再起動する必要があります。

### Q16. バージョン1.2へのアップグレード後、BE起動時に Failed to initialize JNI が表示される

アップグレード後にBEを起動する際に、以下の `Failed to initialize JNI` エラーが発生する場合

```
Failed to initialize JNI: Failed to find the library libjvm.so.
```
`JAVA_HOME`環境変数を設定するか、be.confで`JAVA_HOME`変数を設定してBEノードを再起動する必要があります。

### Q17. Docker: backendの起動に失敗する
これはCPUがAVX2をサポートしていないことが原因である可能性があります。`docker logs -f be`でbackendログを確認してください。
CPUがAVX2をサポートしていない場合、`apache/doris:1.2.2-be-x86_64`の代わりに、
`apache/doris:1.2.2-be-x86_64-noavx2`イメージを使用する必要があります。
イメージのバージョン番号は時間の経過とともに変更されることに注意してください。最新のバージョンは[Dockerhub](https://registry.hub.docker.com/r/apache/doris/tags?page=1&name=avx2)で確認してください。
