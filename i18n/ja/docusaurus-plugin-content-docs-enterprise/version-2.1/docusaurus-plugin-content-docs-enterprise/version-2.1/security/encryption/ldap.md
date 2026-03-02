---
{
  "title": "LDAP",
  "language": "ja"
}
---
# LDAP

Dorisに認証ログインとグループ認可サービスを提供するために、サードパーティのLDAPサービスにアクセスします。

LDAP認証ログインは、パスワード認証のためにLDAPサービスにアクセスすることでDoris認証ログインを補完します。DorisはまずLDAPを使用してユーザーのパスワードを認証し、LDAPサービスにユーザーが存在しない場合は、引き続きDorisを使用してパスワードを認証します。LDAPパスワードが正しくても、Dorisに対応するアカウントが存在しない場合は、一時的なユーザーを作成してDorisにログインします。

LDAPグループ認可は、LDAPのグループをDorisのRoleにマッピングします。ユーザーがLDAPで複数のユーザーグループに属している場合、Dorisにログイン後、ユーザーは全てのグループに対応するRoleの権限を取得します。グループ名とRole名が同じである必要があります。

## 用語解説

* LDAP: Lightweight Directory Access Protocol。アカウントパスワードの一元管理を可能にします。
* Privilege: 権限は、ノード、データベース、またはテーブルに作用します。異なる権限は異なる操作権限を表します。
* Role: Dorisでは、カスタムの名前付きロールを作成できます。ロールは権限のコレクションと考えることができます。

## LDAP関連概念

LDAPでは、データはツリー構造で組織化されます。

### 例（以下の説明はこの例に基づいて展開されます）
- dc=example,dc=com
- ou = ou1
  - cn = group1
  - cn = user1
- ou = ou2
  - cn = group2
    - cn = user2
- cn = user3

### LDAP用語の説明
- dc(Domain Component): 組織のドメイン名として理解でき、ツリーのルートノードとして機能します
- dn(Distinguished Name): 一意の名前に相当します。例えば、user1のdnはcn=user1,ou=ou1,dc=example,dc=com、user2のdnはcn=user2,cn=group2,ou=ou2,dc=example,dc=comです
- rdn(Relative Distinguished Name): dnの一部として、user1の4つのrdnはcn=user1 ou=ou1 dc=example and dc=comです
- ou(Organization Unit): サブ組織として理解でき、ユーザーをouに配置するか、example.comドメインに直接配置できます
- cn(common name):名前
- group: グループ。DorisのRoleとして理解できます
- user: ユーザー。DorisのUserに相当します
- objectClass: 各行のデータのタイプとして理解でき、例えばgroup1がグループかユーザーかをどのように区別するかです。各タイプのデータには以下で異なる属性が必要です。グループの場合はCNとmember（ユーザーリスト）、ユーザーの場合はCN、password、uidなどです

## LDAP認証の有効化
### サーバー側設定
'fe/conf/fe.conf'ファイルで認証方式をldap 'authentication_type=ldap'として設定します。

fe/conf/ldap.confファイルでLDAP基本情報を設定する必要があり、

LDAP管理者パスワードはsql文を使用して設定する必要があります。

#### fe/conf/ldap.confファイルの設定:
* ldap_host = 127.0.0.1  
  LDAPサービスip。
  
* ldap_port = 389  
  LDAPサービスポート。デフォルトの平文転送ポートは389です。現在DorisのLDAP機能は平文パスワード転送のみをサポートします。
  
* ldap_admin_name = cn=admin,dc=domain,dc=com  
  LDAP管理者アカウント「Distinguished Name」。ユーザーがLDAP認証を使用してDorisにログインする際、DorisはLDAPでユーザー情報を検索するために管理者アカウントをバインドします。
  
* ldap_user_basedn = ou=people,dc=domain,dc=com
  DorisがLDAPでユーザー情報を検索する際のbase dn。例えば、上記の例でuser2のみがDorisにログインすることを許可する場合、ou=ou2, dc=example, dc=comとして設定されます。上記の例でuser1、user2、user3がDorisにログインすることを許可する場合、dc=example, dc=comとして設定されます
  
* ldap_user_filter = (&(uid={login}))

  DorisがLDAPでユーザー情報を検索する際のフィルタリング条件。プレースホルダー「{login}」はログインユーザー名に置き換えられます。このフィルターで検索されるユーザーが一意であることを確保する必要があります。そうでない場合、DorisはLDAPを通じてパスワードを検証できず、ログイン時に「ERROR 5081 (42000): user is not unique in LDAP server.」というエラーメッセージが表示されます。
  
  例えば、LDAPユーザーノードのuid属性をユーザー名としてDorisにログインする場合、以下のように設定できます：    
  ldap_user_filter = (&(uid={login}))；  
  この項目は、LDAPユーザーのメールボックスプレフィックスをユーザー名として使用するように設定できます：   
  ldap_user_filter = (&(mail={login}@baidu.com))。

* ldap_group_basedn = ou=group,dc=domain,dc=com
  DorisがLDAPでグループ情報を検索する際のbase dn。この項目が設定されていない場合、LDAPグループ認可は有効になりません。ldap_user_basednと同様に、Dorisがグループを検索する範囲を制限します。

#### LDAP管理者パスワードの設定:
ldap.confファイルを設定後、feを起動し、rootまたはadminアカウントでDorisにログインし、sqlを実行します：

```sql
set ldap_admin_password = password('ldap_admin_password');
```
### クライアント側の設定

#### MySQL Client
クライアント側のLDAP認証には、mysql クライアント側の明示的認証プラグインを有効にする必要があります。コマンドラインを使用してDorisにログインする場合、mysql明示的認証プラグインを有効にする方法は2つあります。

* 環境変数LIBMYSQL_ENABLE_CLEARTEXT_PLUGINを値1に設定します。
  例えば、linuxまたはmax環境では次のコマンドを使用できます：

  ```shell
  echo "export LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN=1" >> ～/.bash_profile && source ～/.bash_profile
  ```
* Dorisにログインするたびに、パラメータ"--enable-cleartext-plugin"を追加してください。

  ```sql
  mysql -hDORIS_HOST -PDORIS_PORT -u user -p --enable-cleartext-plugin
  
  Enter ldap password
  ```
#### Jdbc Client

Jdbc ClientをDorislへの接続に使用する場合、プラグインをカスタマイズする必要があります。

まず、`MysqlClearPasswordPlugin`を継承する`MysqlClearPasswordPluginWithoutSSL`というクラスを作成します。このクラスでは、`requiresConfidentiality()`メソッドをオーバーライドしてfalseを返すようにします。

``` java
public class MysqlClearPasswordPluginWithoutSSL extends MysqlClearPasswordPlugin {
@Override  
public boolean requiresConfidentiality() {
    return false;
  }
}
```
データベース接続を取得する際は、カスタムプラグインをプロパティに設定する必要があります

つまり（xxxはカスタムクラスのパッケージ名）
- authenticationPlugins=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL
- defaultAuthenticationPlugin=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL
- disabledAuthenticationPlugins=com.mysql.jdbc.authentication.MysqlClearPasswordPlugin

例：

```sql
 jdbcUrl = "jdbc:mysql://localhost:9030/mydatabase?authenticationPlugins=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL&defaultAuthenticationPlugin=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL&disabledAuthenticationPlugins=com.mysql.jdbc.authentication.MysqlClearPasswordPlugin";
```
## LDAP認証の詳細説明
LDAPパスワード認証とグループ認可は、Dorisパスワード認証と認可を補完します。LDAP機能を有効にしても、Dorisパスワード認証と認可を完全に置き換えるものではなく、Dorisパスワード認証と認可と共存します。

### LDAP認証ログインの詳細
LDAPが有効になっている場合、ユーザーはDorisとLDAPで以下の状態を持ちます：

|LDAPユーザー|Dorisユーザー|パスワード|ログイン状態|Dorisユーザーへのログイン|
|--|--|--|--|--|
|存在|存在|LDAPパスワード|ログイン成功|Dorisユーザー|
|存在|存在|Dorisパスワード|ログイン失敗|なし|
|存在しない|存在|Dorisパスワード|ログイン成功|Dorisユーザー|
|存在|存在しない|LDAPパスワード|ログイン成功|Ldap一時ユーザー|

LDAPが有効になった後、ユーザーがmysqlクライアントを使用してログインする際、DorisはまずLDAPサービスを通じてユーザーのパスワードを検証し、LDAPユーザーが存在しパスワードが正しい場合、Dorisはそのユーザーを使用してログインします。この時、対応するアカウントが存在する場合、Dorisは直接そのアカウントにログインし、対応するアカウントが存在しない場合は、ユーザー用に一時アカウントを作成してそのアカウントにログインします。一時アカウントは適切な権限ペアを持ち（LDAPグループ認可を参照）、現在の接続でのみ有効です。dorisはユーザーを作成せず、ユーザーペア作成のためのメタデータも生成しません。
LDAPサービスにログインユーザーが存在しない場合、Dorisがパスワード認証に使用されます。

以下では、LDAP認証が有効で、ldap_user_filter = (&(uid={login}))が設定され、他のすべての設定項目が正しく、クライアントが環境変数LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN=1を設定していることを前提とします。

例：

#### 1: DorisとLDAPの両方にアカウントが存在する場合

Dorisアカウント存在：jack@'172.10.1.10'、パスワード：123456
LDAPユーザーノード存在属性：uid: jack ユーザーパスワード：abcdef
jack@'172.10.1.10'アカウントは、以下のコマンドを使用してDorisにログインすることでログインできます：

```shell
mysql -hDoris_HOST -PDoris_PORT -ujack -p abcdef
```
次のコマンドではログインが失敗します：

```shell
mysql -hDoris_HOST -PDoris_PORT -ujack -p 123456
```
#### 2: ユーザーがLDAPに存在し、対応するアカウントがDorisに存在しない場合

LDAP ユーザーノード存在属性: uid: jack ユーザーパスワード: abcdef  
以下のコマンドを使用して一時ユーザーを作成し、jack@'%'でログインします。一時ユーザーは基本権限 DatabasePrivs: Select_priv を持ち、Dorisはユーザーがログアウトして再ログインした後に一時ユーザーを削除します:

```shell
mysql -hDoris_HOST -PDoris_PORT -ujack -p abcdef
```
#### 3:ユーザーのLDAPが存在しません。

Dorisアカウントが存在します: jack@'172.10.1.10', password: 123456  
Dorisパスワードを使用してアカウントにログインし、成功しました:

```shell
mysql -hDoris_HOST -PDoris_PORT -ujack -p 123456
```
### LDAP グループ認可の詳細

DLAP ユーザー dn が LDAP グループノードの "member" 属性である場合、Doris はそのユーザーがグループに属していると判断します。Doris はユーザーがログアウトした後に、対応するロール権限を取り消します。LDAP グループ認可を使用する前に、Doris で対応するロールペアを作成し、ロールに権限を付与する必要があります。

ログインユーザーの権限は、Doris ユーザーとグループの権限に関連しており、以下の表に示されています：
|LDAP Users|Doris Users|Login User Privileges|
|--|--|--|
|exist|exist|LDAP group Privileges + Doris user Privileges|
|Does not exist|Exists|Doris user Privileges|
|exist|non-exist|LDAP group Privileges|

ログインユーザーが一時ユーザーでグループ権限が存在しない場合、ユーザーはデフォルトで information_schema の select_priv 権限を持ちます

例：
LDAP ユーザー dn が LDAP グループノードの "member" 属性である場合、そのユーザーはグループに属していると見なされ、Doris はグループ dn の最初の Rdn をグループ名として取得します。
例えば、ユーザー dn が "uid=jack,ou=aidp,dc=domain,dc=com" の場合、グループ情報は以下のようになります：

```text
dn: cn=doris_rd,ou=group,dc=domain,dc=com  
objectClass: groupOfNames  
member: uid=jack,ou=aidp,dc=domain,dc=com  
```
その後、グループ名はdoris_rdになります。

jackがLDAPグループdoris_qa、doris_pmにも属している場合、Dorisにロールdoris_rd、doris_qa、doris_pmが存在するとき、LDAP認証を使用してログインした後、ユーザーはアカウントの元の権限を持つだけでなく、doris_rd、doris_qa、doris_pmロールの権限も取得します。

>注意：
>
>ユーザーが属するグループは、LDAPツリーの組織構造とは関係ありません。例のセクションのuser2は必ずしもgroup2に属するとは限りません
> user2をgroup2に属させたい場合は、group2のmember属性にuser2を追加する必要があります

### LDAP情報キャッシュ
LDAPサービスへの頻繁なアクセスを避けるため、DorisはLDAP情報をメモリにキャッシュします。ldap.confの`ldap_user_cache_timeout_s`設定項目を通じてLDAPユーザーのキャッシュ時間を指定できます。デフォルトは12時間です。LDAPサービスの情報を変更した後、またはLDAPユーザーグループのRole権限を変更した後、キャッシュのために変更がすぐに反映されない可能性があるため、refresh ldap文でキャッシュを更新できます。[REFRESH-LDAP](../../sql-manual/sql-statements/account-management/REFRESH-LDAP)を参照してください。

## LDAP認証の制限事項

* DorisのLDAP機能は現在、平文パスワード認証のみをサポートしています。つまり、ユーザーがログインする際、パスワードはクライアントとfe間、およびfeとLDAPサービス間で平文で送信されます。

## FAQ

- LDAPユーザーがDorisでどのロールを持っているかを確認する方法は？

  LDAPユーザーを使用してDorisにログインし、` show grants`で現在のユーザーが持つロールを表示できます。その中で、ldapDefaultRoleは全てのldapユーザーがDorisで持つデフォルトロールです。
- DorisでのLDAPユーザーのロールが期待より少ない場合のトラブルシューティング方法は？

  1. 'show roles`で期待するロールがDorisに存在するかを確認します。存在しない場合は、'CREATE ROLE role'_ Name`でロールを作成する必要があります。
  2. 期待するグループが'ldap'_ Group_の対応する組織構造にあるかを確認します。
  3. 期待するグループにmember属性が含まれているかを確認します。
  4. 期待するグループのmember属性に現在のユーザーが含まれているかを確認します。
