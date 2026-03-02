---
{
  "title": "Apache Rangerとの統合",
  "language": "ja"
}
---
Apache Rangerは、Hadoopプラットフォーム上でサービスの監視、有効化、および包括的なデータセキュリティアクセス管理に使用されるセキュリティフレームワークです。

バージョン2.1.0では、DorisはApache Rangerを統合することにより、統合権限管理をサポートしています。

> 注意：
> 
> - この機能は現在実験的であり、Rangerで設定可能なリソースオブジェクトと権限は、今後のバージョンで変更される可能性があります。
> 
> - Apache Rangerのバージョンは2.4.0以上である必要があります。

## インストール

### Doris Rangerプラグインのインストール

1. 以下のファイルをダウンロードします

	- [ranger-doris-plugin-3.0.0-SNAPSHOT.jar](https://selectdb-doris-1308700295.cos.ap-beijing.myqcloud.com/ranger/ranger-doris-plugin-3.0.0-SNAPSHOT.jar)
	- [mysql-connector-java-8.0.25.jar](https://selectdb-doris-1308700295.cos.ap-beijing.myqcloud.com/release/jdbc_driver/mysql-connector-java-8.0.25.jar)

2. ダウンロードしたファイルをRangerサービスの`ranger-plugins/doris`ディレクトリに配置します。例：

	```
	/usr/local/service/ranger/ews/webapp/WEB-INF/classes/ranger-plugins/doris/ranger-doris-plugin-3.0.0-SNAPSHOT.jar
	/usr/local/service/ranger/ews/webapp/WEB-INF/classes/ranger-plugins/doris/mysql-connector-java-8.0.25.jar
	```
3. Rangerサービスを再起動します。

4. [ranger-servicedef-doris.json](https://github.com/morningman/ranger/blob/doris-plugin/agents-common/src/main/resources/service-defs/ranger-servicedef-doris.json)をダウンロードします

5. 以下のコマンドを実行して、定義ファイルをRangerサービスにアップロードします：

	```
	curl -u user:password -X POST \
		-H "Accept: application/json" \
		-H "Content-Type: application/json" \
		http://172.21.0.32:6080/service/plugins/definitions \
		-d@ranger-servicedef-doris.json
	```
usernameとpasswordは、Ranger WebUIにログインするために使用するusernameとpasswordです。

	サービスアドレスのポートは、`ranger-admin-site.xml`設定ファイルの`ranger.service.http.port`設定項目で確認できます。

	実行が成功すると、Json形式のサービス定義が返されます。例えば：

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
もう一度作成したい場合は、以下のコマンドを使用してサービス定義を削除してから再度アップロードできます：

	```
	curl -v -u user:password -X DELETE \
	http://172.21.0.32:6080/service/plugins/definitions/207
	```
`207`は作成時に返されるidです。削除する前に、Ranger WebUIで作成されたDorisサービスを削除する必要があります。

また、以下のコマンドを使用して、現在追加されているサービス定義を一覧表示し、idを取得することもできます：

	```
	curl -v -u user:password -X GET \
	http://172.21.0.32:6080/service/plugins/definitions/
	```
### Doris Ranger プラグインの設定

インストール完了後、Ranger WebUIを開くと、Service ManagerインターフェースにApache Dorisプラグインが表示されます：

![ranger1](/images/ranger/ranger1.png)

プラグインの隣にある `+` ボタンをクリックしてDorisサービスを追加します：

![ranger2](/images/ranger/ranger2.png)

Config Propertiesの一部のパラメータの意味は以下のとおりです：

- `Username`/`Password`: Dorisクラスタのユーザー名とパスワード。ここではAdminユーザーを使用することを推奨します。
- `jdbc.driver_class`: DorisへのJDBC接続で使用されるドライバ。`com.mysql.cj.jdbc.Driver`
- `jdbc.url`: DorisクラスタのJDBC URL接続文字列。`jdbc:mysql://172.21.0.101:9030?useSSL=false`
- 追加パラメータ:
	- `resource.lookup.timeout.value.in.ms`: メタ情報取得のタイムアウト。10秒である `10000` を入力することを推奨します。

`Test Connection` をクリックして接続可能かどうかを確認できます。

次に `Add` をクリックしてサービスを追加します。

その後、Service ManagerページのApache DorisプラグインでとDorisクラスタの設定

1. すべてのFEのconfディレクトリに `ranger-doris-security.xml` ファイルを作成し、以下の内容を記述します：

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
`ranger.plugin.doris.policy.cache.dir` と `ranger.plugin.doris.policy.rest.url` を実際の値に変更する必要があります。

2. 以下の内容で、すべてのFEのconfディレクトリに `ranger-doris-audit.xml` ファイルを作成します：

    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
    <configuration>
    </configuration>
    ```
3. すべてのFEのconfディレクトリに以下の内容で`log4j.properties`ファイルを作成します：

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
`log4j.appender.D.File`を実際の値に変更する必要があります。この値はRangerプラグインのログを保存するために使用されます。

4. すべてのFEのfe.confに設定を追加します：

	`access_controller_type=ranger-doris`

5. すべてのFEノードを再起動します。

## リソースと権限

1. RangerでサポートされているDorisリソースには以下が含まれます：

	- `Catalog`
	- `Database`
	- `Table`
	- `Column`
	- `Resource`
	- `Workload Group`

2. RangerでサポートされているDoris権限には以下が含まれます：

	- `SHOW`
	- `SHOW_VIEW`
	- `SHOW_RESOURCES`
	- `SHOW_WORKLOAD_GROUP`
	- `LOAD`
	- `ALTER`
	- `CREATE`
	- `ALTER_CREATE`
	- `ALTER_CREATE_DROP`
	- `DROP`
	- `SELECT`
	- `USAGE`

## ベストプラクティス

### 権限の設定
1. Dorisで`user1`を作成します。
2. Dorisの`admin`ユーザーを使用して、`hive`という名前のCatalogを作成します。
3. Rangerで`user1`を作成します。

#### Global Priv
Dorisの内部認証ステートメント`grant select_priv on *.*.* to user1`と同等です；
- グローバルオプションはcatalogの同一レベルのドロップダウンメニューで見つけることができます
- 入力ボックスには`*`のみ入力できます

  ![global](/images/ranger/global.png)

#### Catalog Priv
Dorisの内部認証ステートメント`grant select_priv on hive.*.* to user1`と同等です；

![catalog](/images/ranger/catalog.png)

#### Database Priv
Dorisの内部認証ステートメント`grant select_priv on hive.tpch.* to user1`と同等です；

![database](/images/ranger/database.png)

#### Table Priv
Dorisの内部認証ステートメント`grant select_priv on hive.tpch.user to user1`と同等です；

![table](/images/ranger/table.png)

#### Column Priv
Dorisの内部認証ステートメント`grant select_priv(name,age) on hive.tpch.user to user1`と同等です；

![column](/images/ranger/column.png)

#### Resource Priv
Dorisの内部認証ステートメント`grant usage_priv on resource 'resource1' to user1`と同等です；
- リソースオプションはcatalogの同一レベルのドロップダウンメニューで見つけることができます

![resource](/images/ranger/resource.png)

#### Workload Group Priv
Dorisの内部認証ステートメント`grant usage_priv on workload group 'group1' to user1`と同等です；
- workload groupオプションはcatalogの同一レベルのドロップダウンメニューで見つけることができます

![group1](/images/ranger/group1.png)

### Row Policy例

> バージョン2.1.3でサポート

1. 権限の設定を参照してテーブルinternal.db1.userに対するselect権限をuser1に割り当てます。
2. RangerでRow Level Filterポリシーを追加します

    ![Row Policy Example](/images/ranger/ranger-row-policy.jpeg)

3. user1としてDorisにログインします。`select * from internal.db1.user`を実行し、`id > 3`かつ`age = 2`を満たすデータのみが表示されることを確認します。

### Data Mask例

> バージョン2.1.3でサポート

1. 権限の設定を参照してテーブルinternal.db1.userに対するselect権限をuser1に割り当てます。
2. RangerでMaskingポリシーを追加します

    ![Data Mask Example](/images/ranger/ranger-data-mask.png)

3. user1としてDorisにログインします。`select * from internal.db1.user`を実行し、電話番号が指定されたルールに従ってマスクされていることを確認します。
