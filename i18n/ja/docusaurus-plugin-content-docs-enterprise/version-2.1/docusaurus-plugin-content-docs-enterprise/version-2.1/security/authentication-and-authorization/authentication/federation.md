---
{
  "title": "フェデレーテッド認証",
  "description": "サードパーティのLDAPサービスを統合して、Dorisにログイン認証とグループ認可サービスを提供する。",
  "language": "ja"
}
---
## LDAP

サードパーティのLDAPサービスを統合して、DorisにログインAuthentication（認証）とグループAuthorization（認可）サービスを提供します。

### LDAPログインAuthentication

LDAPログインAuthenticationとは、LDAPサービスからのパスワード検証を統合することで、Dorisのログイン認証を補完することを指します。DorisはLDAPを使用してユーザーパスワードを検証することを優先します。ユーザーがLDAPサービスに存在しない場合、Dorisは引き続き独自のパスワード検証を使用します。LDAPパスワードが正しいがDorisに対応するアカウントがない場合、DorisにログインするためのTemporary User（一時ユーザー）が作成されます。

LDAPを有効にした後、ユーザーはDorisとLDAPで以下のシナリオで存在できます：

| LDAP User      | Doris User     | Password       | Login Status     | User Logged into Doris |
| -------------- | -------------- | -------------- | ---------------- | ---------------------- |
| 存在する       | 存在する       | LDAP Password  | ログイン成功     | Doris User             |
| 存在する       | 存在する       | Doris Password | ログイン失敗     | なし                   |
| 存在しない     | 存在する       | Doris Password | ログイン成功     | Doris User             |
| 存在する       | 存在しない     | LDAP Password  | ログイン成功     | Ldap Temporary User    |

LDAPを有効にした後、ユーザーがMySQLクライアントを使用してログインすると、DorisはまずLDAPサービスを通じてユーザーパスワードを検証します。ユーザーがLDAPに存在し、パスワードが正しい場合、Dorisはそのユーザーでログインします。Dorisに対応するアカウントがある場合は、そのアカウントに直接ログインします。対応するアカウントがない場合は、ユーザーがログインするためのTemporary Account（一時アカウント）が作成されます。一時アカウントには対応する権限があり（LDAP Group Authorizationを参照）、現在の接続でのみ有効です。Dorisはユーザーを作成したり、ユーザー作成メタデータを生成したりしません。
ログインユーザーがLDAPサービスに存在しない場合は、Dorisのパスワード認証が使用されます。

LDAP認証が有効で、`ldap_user_filter = (&(uid={login}))`で設定され、その他の設定が正しいと仮定して、クライアントは環境変数を適切に設定します。

例：

1. DorisとLDAPの両方にアカウントが存在する場合：

    Dorisアカウント：`jack@'172.10.1.10'`、パスワード：`123456`

    LDAPユーザーノードの属性：`uid: jack` ユーザーパスワード：`abcdef`

    以下のコマンドを使用してDorisにログインすると、`jack@'172.10.1.10'`アカウントにログインできます：

    ```sql
    mysql -hDoris_HOST -PDoris_PORT -ujack -p abcdef
    ```
次のコマンドを使用するとログインに失敗します：

    ```sql
    mysql -hDoris_HOST -PDoris_PORT -ujack -p 123456
    ```
2. LDAPにユーザーが存在するが、Dorisに対応するアカウントがない場合：

    LDAPユーザーノードの属性：`uid: jack` ユーザーパスワード：`abcdef`

    以下のコマンドを使用して一時ユーザーを作成し、`jack@'%'`でログインします。一時ユーザーには基本権限DatabasePrivs: Select_privが付与され、ログアウト後にユーザーは削除されます：

    ```sql
    mysql -hDoris_HOST -PDoris_PORT -ujack -p abcdef
    ```
3. LDAPにユーザーが存在しない場合：

    Dorisアカウント：`jack@'172.10.1.10'`、パスワード：`123456`

    Dorisのパスワードを使用してアカウントにログインし、成功：

    ```sql
    mysql -hDoris_HOST -PDoris_PORT -ujack -p 123456
    ```
### LDAP グループ認可

LDAP グループ認可は、LDAP グループを Doris ロールにマッピングし、ログインユーザーに対応するすべてのロール権限を付与することです。ログアウト後、Doris は対応するロール権限を取り消します。LDAP グループ認可を使用する前に、Doris で対応するロールを作成し、そのロールに権限を付与する必要があります。

ログインユーザーの権限は、Doris ユーザーとグループ権限に関連しており、次の表に示すとおりです：

| LDAP User      | Doris User     | Login User's Permissions                        |
| -------------- | -------------- | ----------------------------------------------- |
| Exists         | Exists         | LDAP Group Permissions + Doris User Permissions |
| Does Not Exist | Exists         | Doris User Permissions                          |
| Exists         | Does Not Exist | LDAP Group Permissions                          |

ログインユーザーが一時ユーザーでグループ権限を持たない場合、そのユーザーはデフォルトで information_schema の select_priv 権限を持ちます。

例：

LDAP ユーザー dn が LDAP グループノードの "member" 属性である場合、Doris はそのユーザーがそのグループに属すると判断します。Doris はグループ dn の最初の Rdn をグループ名として使用します。

例えば、ユーザー dn が `uid=jack,ou=aidp,dc=domain,dc=com` で、グループ情報は次のとおりです：

```text
dn: cn=doris_rd,ou=group,dc=domain,dc=com
objectClass: groupOfNames
member: uid=jack,ou=aidp,dc=domain,dc=com
```
その後、グループ名は`doris_rd`になります。

`jack`もLDAPグループ`doris_qa`と`doris_pm`に属していると仮定し、DorisにはロールGYLDAPLoginTemplate: `doris_rd`、`doris_qa`、`doris_pm`がある場合、LDAP認証を使用してログインした後、ユーザーはアカウントの元の権限だけでなく、ロール`doris_rd`、`doris_qa`、`doris_pm`の権限も取得します。

> 注記:
>
> ユーザーが属するグループは、LDAPツリーの組織構造とは無関係です。例のUser2は必ずしもgroup2に属するわけではありません。

### LDAP例

#### Doris設定の変更

1. `fe/conf/fe.conf`ファイルで、認証方法をldapとして設定します: `authentication_type=ldap`。
2. `fe/conf/ldap.conf`ファイルで、基本的なLDAP情報を設定します。
3. LDAP管理者パスワードを設定します: `ldap.conf`ファイルを設定した後、feを開始し、rootまたはadminアカウントを使用してDorisにログインし、SQLを実行します

```sql
set ldap_admin_password = password('ldap_admin_password');
```
#### MySQL Clientを使用したログイン

```sql
mysql -hDORIS_HOST -PDORIS_PORT -u user -p --enable-cleartext-plugin
Enter the LDAP password
```
注意: 他のクライアントを使用してログインする場合は、以下の「How Clients Use Clear Text Login」セクションを参照してください。

### LDAP Information Cache

LDAP サービスへの頻繁なアクセスを避けるため、Doris は LDAP 情報をメモリにキャッシュします。`ldap.conf` ファイル内の `ldap_user_cache_timeout_s` パラメータを設定して LDAP ユーザーのキャッシュ時間を指定できます。デフォルトは 12 時間です。LDAP サービス内の情報を変更したり、Doris 内の対応するロール権限を変更した後、キャッシュのため変更がすぐに反映されない場合があります。`refresh ldap` ステートメントを使用してキャッシュを更新できます。詳細については、[REFRESH-LDAP](../../../sql-manual/sql-statements/account-management/REFRESH-LDAP) を参照してください。

### LDAP 検証の制限事項

-   現在、Doris の LDAP 機能はクリアテキストパスワード検証のみをサポートしており、これはパスワードがクライアントと fe 間、および fe と LDAP サービス間でクリアテキストで送信されることを意味します。

### よくある問題

-   LDAP ユーザーが Doris でどのロールを持っているかを確認するには？

    LDAP ユーザーを使用して Doris にログインし、`show grants;` を実行して現在のユーザーのロールを確認します。`ldapDefaultRole` は各 LDAP ユーザーが Doris で持つデフォルトロールです。

-   LDAP ユーザーの Doris でのロールが期待より少ないのはなぜですか？

    1. `show roles;` を使用して、期待するロールが Doris に存在するかを確認します。存在しない場合は、`CREATE ROLE rol_name;` を使用してロールを作成します。
    2. 期待するグループが `ldap_group_basedn` に対応する組織構造下にあるかを確認します。
    3. 期待するグループにメンバー属性があるかを確認します。
    4. 期待するグループのメンバー属性に現在のユーザーが含まれているかを確認します。

### LDAP の概念

LDAP では、データはツリー構造で組織化されています。

#### 例（以下の説明はこの例に基づいています）

```
- dc=example,dc=com
 - ou = ou1
   - cn = group1
   - cn = user1
 - ou = ou2
   - cn = group2
     - cn = user2
 - cn = user3
```
#### LDAP用語

-   dc (Domain Component): 組織のドメイン名として理解でき、ツリーのルートノードとして機能します。
-   dn (Distinguished Name): 一意の名前に相当します。例えば、user1のdnは`cn=user1,ou=ou1,dc=example,dc=com`、user2のdnは`cn=user2,cn=group2,ou=ou2,dc=example,dc=com`です。
-   rdn (Relative Distinguished Name): dnの一部です。例えば、user1の4つのrdnは`cn=user1`、`ou=ou1`、`dc=example`、`dc=com`です。
-   ou (Organization Unit): サブ組織として理解できます。ユーザーはouの下に配置することも、example.comドメインの直下に配置することもできます。
-   cn (common name): 名前。
-   group: グループ。Dorisのロールとして理解できます。
-   user: ユーザー。Dorisのユーザーに相当します。
-   objectClass: 各データ行のタイプとして理解できます。例えば、group1をグループかユーザーかを区別する方法として、各タイプのデータには異なる属性が必要です。例えば、groupにはcnとmember（ユーザーリスト）が必要で、userにはcn、password、uidなどが必要です。

### クライアントによるクリアテキストログインの使用方法

#### MySQLクライアント

LDAP認証を使用するには、クライアントでMySQLクライアントのクリアテキスト認証プラグインを有効にする必要があります。コマンドラインを使用してDorisにログインするには、以下のいずれかの方法でMySQLクリアテキスト認証プラグインを有効にできます：

-   環境変数`LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN`を1に設定

    例えば、LinuxまたはMac環境では、以下を使用できます：

    ```shell
    echo "export LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN=1" >> ～/.bash_profile && source ～/.bash_profile
    ```
- Dorisにログインする際は毎回パラメータ`--enable-cleartext-plugin`を追加してください

    ```shell
    mysql -hDORIS_HOST -PDORIS_PORT -u user -p --enable-cleartext-plugin

    Enter the LDAP password
    ```
#### JDBC Client

JDBC クライアントを使用してDorisにログインするには、プラグインをカスタマイズする必要があります。

まず、`MysqlClearPasswordPlugin`を継承する`MysqlClearPasswordPluginWithoutSSL`という名前のクラスを作成します。このクラスで、`requiresConfidentiality()`メソッドをオーバーライドしてfalseを返します。

```java
public class MysqlClearPasswordPluginWithoutSSL extends MysqlClearPasswordPlugin {
@Override
public boolean requiresConfidentiality() {
    return false;
  }
}
```
データベース接続を取得する際は、propertiesでカスタマイズされたプラグインを設定する必要があります。

つまり、（xxxはカスタマイズされたクラスのパッケージ名）

-   authenticationPlugins=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL
-   defaultAuthenticationPlugin=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL
-   disabledAuthenticationPlugins=com.mysql.jdbc.authentication.MysqlClearPasswordPlugin

例：

```sql
jdbcUrl = "jdbc:mysql://localhost:9030/mydatabase?authenticationPlugins=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL&defaultAuthenticationPlugin=xxx.xxx.xxx.MysqlClearPasswordPluginWithoutSSL&disabledAuthenticationPlugins=com.mysql.jdbc.authentication.MysqlClearPasswordPlugin";
```
