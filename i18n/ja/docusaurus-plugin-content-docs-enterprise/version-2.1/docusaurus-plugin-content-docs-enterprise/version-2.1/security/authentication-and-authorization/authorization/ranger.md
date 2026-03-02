---
{
  "title": "Ranger認可",
  "description": "Apache Rangerは、監視、サービスの有効化に使用されるセキュリティフレームワークです。",
  "language": "ja"
}
---
Apache Rangerは、Hadoopプラットフォーム上でのモニタリング、サービスの有効化、包括的なデータセキュリティアクセス管理に使用されるセキュリティフレームワークです。Rangerを使用すると、Ranger側で設定された権限が認可のためのDorisでのGrant文の実行に代わります。Rangerのインストールと設定については、以下を参照してください：Installing and Configuring Doris Ranger Plugin。

## Ranger Example

### Change Doris Configuration
1. `fe/conf/fe.conf`ファイルで、認可方法を`ranger access_controller_type=ranger-doris`として設定します。
2. すべてのFEsのconfディレクトリに、以下の内容で`ranger-doris-security.xml`ファイルを作成します：

   ```
   <?xml version="1.0" encoding="UTF-8"?>
   <?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
   <configuration>
       <property>
           <name>ranger.plugin.doris.policy.cache.dir</name>
           <value>/path/to/ranger/cache/</value>
       </property>
       <property>
           <name>ranger.plugin.doris.policy.pollIntervalMs</name>
           <value>30000</value>
       </property>
       <property>
           <name>ranger.plugin.doris.policy.rest.client.connection.timeoutMs</name>
           <value>60000</value>
       </property>
       <property>
           <name>ranger.plugin.doris.policy.rest.client.read.timeoutMs</name>
           <value>60000</value>
       </property>
       <property>
           <name>ranger.plugin.doris.policy.rest.url</name>
           <value>http://172.21.0.32:6080</value>
       </property>
       <property>
           <name>ranger.plugin.doris.policy.source.impl</name>
           <value>org.apache.ranger.admin.client.RangerAdminRESTClient</value>
       </property>
       <property>
           <name>ranger.plugin.doris.service.name</name>
           <value>doris</value>
       </property>
   </configuration>
   ```
この中で、`ranger.plugin.doris.policy.cache.dir`と`ranger.plugin.doris.policy.rest.url`は実際の値に変更する必要があります。
3. クラスターを起動します。

### 権限の例
1. Dorisで`user1`を作成します。
2. Dorisで、まず`admin`ユーザーを使用してCatalog: `hive`を作成します。
3. Rangerで`user1`を作成します。

#### グローバル権限
Doris内部の認可ステートメント`grant select_priv on *.*.* to user1`と同等です。
- グローバルオプションは、catalogと同じレベルのドロップダウンボックスで見つけることができます。
- 入力ボックスには`*`のみ入力できます。

  ![global](/images/ranger/global.png)

#### Catalog権限
Doris内部の認可ステートメント`grant select_priv on hive.*.* to user1`と同等です。

![catalog](/images/ranger/catalog.png)

#### データベース権限
Doris内部の認可ステートメント`grant select_priv on hive.db1.* to user1`と同等です。

![database](/images/ranger/database.png)

#### テーブル権限
> ここで、「テーブル」という用語は一般的にテーブル、ビュー、非同期マテリアライズドビューを指します。

Doris内部の認可ステートメント`grant select_priv on hive.db1.tbl1 to user1`と同等です。

![table](/images/ranger/table.png)

#### カラム権限
Doris内部の認可ステートメント`grant select_priv(col1,col2) on hive.db1.tbl1 to user1`と同等です。

![column](/images/ranger/column.png)

#### リソース権限
Doris内部の認可ステートメント`grant usage_priv on resource 'resource1' to user1`と同等です。
- リソースオプションは、catalogと同じレベルのドロップダウンボックスで見つけることができます。

![resource](/images/ranger/resource.png)

#### Workload Group権限
Doris内部の認可ステートメント`grant usage_priv on workload group 'group1' to user1`と同等です。
- workload groupオプションは、catalogと同じレベルのドロップダウンボックスで見つけることができます。

![group1](/images/ranger/group1.png)

### 行レベル権限の例

> バージョン2.1.3でサポート

1. 権限の例を参照して、`user1`に`internal.db1.user`テーブルのselect権限を付与します。
2. Rangerで、Row Level Filterポリシーを追加します

   ![Row Policy Example](/images/ranger/ranger-row-policy.jpeg)

3. `user1`でDorisにログインします。`select * from internal.db1.user`を実行し、条件`id > 3`かつ`age = 2`を満たすデータのみ表示されます。

### データマスキングの例

> バージョン2.1.3でサポート

1. 権限の例を参照して、`user1`に`internal.db1.user`テーブルのselect権限を付与します。
2. Rangerで、Maskingポリシーを追加します

   ![Data Mask Example](/images/ranger/ranger-data-mask.png)

3. `user1`でDorisにログインします。`select * from internal.db1.user`を実行し、電話番号が指定されたルールに従ってマスクされていることを確認します。

## よくある質問
1. Rangerアクセスが失敗した際にログを確認する方法は？

   全てのFEの`conf`ディレクトリに、以下の内容で`log4j.properties`ファイルを作成します：

    ```
	log4j.rootLogger = warn,stdout,D

	log4j.appender.stdout = org.apache.log4j.ConsoleAppender
	log4j.appender.stdout.Target = System.out
	log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
	log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n
	
	log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
	log4j.appender.D.File = /path/to/fe/log/ranger.log
	log4j.appender.D.Append = true
	log4j.appender.D.Threshold = INFO
	log4j.appender.D.layout = org.apache.log4j.PatternLayout
	log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
	```
`log4j.appender.D.File`を実際のパスに変更してください。このパスはRanger pluginログの保存に使用されます。
2. Row Level Filterポリシーが設定されているが、クエリ時にユーザーがpermission deniedエラーに遭遇する。

   Row Level Filterポリシーはテーブルのデータ内の特定のレコードへのユーザーアクセスを制限するためのもので、ユーザーへの認可はACCESS POLICYを通じて付与される必要があります。
3. サービス作成後、デフォルトでは'admin'ユーザーのみが権限を持つ` Root'ユーザーは権限を持たない

   画像に示すように、サービス作成時に設定`default.policy.users`を追加してください。完全な権限を持つ複数のユーザーを設定する必要がある場合は、`,`で区切ってください。
   ![default policy](/images/ranger/default-policy.png)
4. 認証にRangerを使用した後、内部認可はまだ有効ですか？

   現在、Rangerはグローバルレベルの権限設定をサポートしていないため、`GRANT priv ON *.*.*`のような内部認可は有効のままですが、他のレベルでの権限は機能しません。

## Doris Ranger Pluginのインストールと設定

### Pluginのインストール

1. 以下のファイルをダウンロードしてください

    - [ranger-doris-plugin-3.0.0-SNAPSHOT.jar](https://selectdb-doris-1308700295.cos.ap-beijing.myqcloud.com/release/ranger/2.1/ranger-doris-plugin-3.0.0-SNAPSHOT.jar)
    - [mysql-connector-java-8.0.25.jar](https://selectdb-doris-1308700295.cos.ap-beijing.myqcloud.com/release/jdbc_driver/mysql-connector-java-8.0.25.jar)

2. ダウンロードしたファイルをRangerサービスの`ranger-plugins/doris`ディレクトリに配置してください。例：

   ```
   /usr/local/service/ranger/ews/webapp/WEB-INF/classes/ranger-plugins/doris/ranger-doris-plugin-3.0.0-SNAPSHOT.jar
   /usr/local/service/ranger/ews/webapp/WEB-INF/classes/ranger-plugins/doris/mysql-connector-java-8.0.25.jar
   ```
3. Rangerサービスを再起動します。

4. [ranger-servicedef-doris.json](https://github.com/morningman/ranger/blob/doris-plugin/agents-common/src/main/resources/service-defs/ranger-servicedef-doris.json)をダウンロードします。

5. 以下のコマンドを実行して、定義ファイルをRangerサービスにアップロードします：

   ```
   curl -u user:password -X POST \
       -H "Accept: application/json" \
       -H "Content-Type: application/json" \
       http://172.21.0.32:6080/service/plugins/definitions \
       -d@ranger-servicedef-doris.json
   ```
username と password を Ranger WebUI の実際のログイン認証情報に置き換えてください。

サービスアドレスとポートは、`ranger-admin-site.xml` 設定ファイルの `ranger.service.http.port` 設定項目で確認できます。

実行が成功すると、以下のような JSON 形式のサービス定義が返されます：

   ```
   {
     "id": 207,
     "guid": "d3ff9e41-f9dd-4217-bb5f-3fa9996454b6",
     "isEnabled": true,
     "createdBy": "Admin",
     "updatedBy": "Admin",
     "createTime": 1705817398112,
     "updateTime": 1705817398112,
     "version": 1,
     "name": "doris",
     "displayName": "Apache Doris",
     "implClass": "org.apache.ranger.services.doris.RangerServiceDoris",
     "label": "Doris",
     "description": "Apache Doris",
     "options": {
       "enableDenyAndExceptionsInPolicies": "true"
     },
     ...
   }
   ```
サービス定義を再作成する場合は、以下のコマンドを使用してサービス定義を削除してから再アップロードできます：

   ```
   curl -v -u user:password -X DELETE \
   http://172.21.0.32:6080/service/plugins/definitions/207
   ```
`207`を、サービス定義作成時に返される実際のIDに置き換えてください。

削除前に、Ranger WebUIで作成したDorisサービスを削除する必要があります。

以下のコマンドを使用して、現在のサービス定義一覧を表示し、IDを取得することもできます：

   ```
   curl -v -u user:password -X GET \
   http://172.21.0.32:6080/service/plugins/definitions/
   ```
### Plugin設定

インストール後、Ranger WebUIを開くと、Service Managerインターフェースで Apache Doris pluginを確認できます：

![ranger](/images/ranger/ranger1.png)

pluginの横にある`+`ボタンをクリックして、Dorisサービスを追加します：

![ranger2](/images/ranger/ranger2.png)

Config Propertiesセクションには以下のパラメータがあります：

- `Username`/`Password`：Dorisクラスターのユーザー名とパスワード。Adminユーザーの使用を推奨します。
- `jdbc.driver_class`：Dorisへの接続に使用するJDBCドライバー。`com.mysql.cj.jdbc.Driver`
- `jdbc.url`：DorisクラスターのJDBC URL接続文字列。`jdbc:mysql://172.21.0.101:9030?useSSL=false`
- 追加パラメータ：
    - `resource.lookup.timeout.value.in.ms`：メタデータ取得のタイムアウト。`10000`（10秒）に設定することを推奨します。

`Test Connection`をクリックして接続が成功するかを確認できます。

`Add`をクリック後、Apache Doris pluginのService Managerインターフェースで作成されたサービスを確認できます。サービスをクリックしてRangerの設定を開始します。
