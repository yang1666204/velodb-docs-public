---
{
  "title": "認証と認可",
  "description": "Dorisの権限管理システムは、MySQLの権限管理メカニズムをモデルとして構築されています。",
  "language": "ja"
}
---
# Authentication and Authorization

Dorisの権限管理システムは、MySQLの権限管理メカニズムをモデルとして設計されています。行および列レベルでのきめ細かい権限制御、ロールベースのアクセス制御をサポートし、またホワイトリストメカニズムもサポートしています。

## 用語集

1. User Identity

   権限システム内では、ユーザーはUser Identityとして識別されます。User Identityは2つの部分から構成されます：`username`と`host`です。`username`はユーザー名で、英語の文字（大文字と小文字の両方）から構成されます。`host`はユーザー接続の発信元IPを表します。User Identityは`username@'host'`として表現され、`host`からの`username`を示します。

   User Identityのもう一つの表現は`username@['domain']`で、`domain`はDNSを通じて一連のIPに解決できるドメイン名を指します。最終的には、これは一連の`username@'host'`として表現されるため、以降は一律に`username@'host'`を使用して表記します。

2. Privilege

   権限はノード、データディレクトリ、データベース、またはテーブルに適用されます。異なる権限は異なる操作許可を表します。

3. Role

   Dorisではカスタム名のロールの作成が可能です。ロールは権限の集合として捉えることができます。新しく作成されたユーザーにロールを割り当てることで、そのロールの権限を自動的に継承できます。その後のロール権限の変更は、そのロールに関連付けられたすべてのユーザーの権限にも反映されます。

4. User Property

   ユーザープロパティはユーザーに直接関連付けられ、User Identityには関連付けられません。つまり、`user@'192.%'`と`user@['domain']`の両方が同じユーザープロパティセットを共有し、これらはユーザー`user`に属し、`user@'192.%'`や`user@['domain']`には属しません。

   ユーザープロパティには、ユーザーの最大接続数、インポートクラスター構成などが含まれますが、これらに限定されません。

## Authentication and Authorization Framework

ユーザーがApache Dorisにログインするプロセスは2つの部分に分かれています：**Authentication**と**Authorization**です。

- Authentication：ユーザーが提供した認証情報（ユーザー名、クライアントIP、パスワードなど）に基づいて身元確認を行います。確認後、個々のユーザーはシステム定義のUser Identityにマッピングされます。
- Authorization：取得したUser Identityに基づき、そのUser Identityに関連付けられた権限に従って、ユーザーが意図した操作に必要な権限を持っているかどうかを確認します。

## Authentication

DorisはビルトインのauthenticationスキームとLDAP authenticationをサポートしています。

### Dorisビルトインauthenticationスキーム

authenticationは、Doris自体に保存されているユーザー名、パスワード、その他の情報に基づいて行われます。

管理者は`CREATE USER`コマンドでユーザーを作成し、`SHOW ALL GRANTS`コマンドで作成されたすべてのユーザーを表示します。

ユーザーがログインする際、システムはユーザー名、パスワード、クライアントIPアドレスが正しいかどうかを確認します。

#### Password Policy

Dorisは、ユーザーのより良いパスワード管理を支援するために、以下のパスワードポリシーをサポートしています。

1. `PASSWORD_HISTORY`

    ユーザーが現在のパスワードをリセットする際に、過去のパスワードを再利用できるかどうかを決定します。例えば、`PASSWORD_HISTORY 10`は、最後の10個のパスワードを新しいパスワードとして再利用できないことを意味します。`PASSWORD_HISTORY DEFAULT`を設定すると、グローバル変数`PASSWORD_HISTORY`の値を使用します。0に設定するとこの機能を無効にします。デフォルトは0です。

    例：

    - グローバル変数を設定：`SET GLOBAL password_history = 10`
    - ユーザーに設定：`ALTER USER user1@'ip' PASSWORD_HISTORY 10`

2. `PASSWORD_EXPIRE`

    現在のユーザーのパスワードの有効期限を設定します。例えば、`PASSWORD_EXPIRE INTERVAL 10 DAY`はパスワードが10日後に期限切れになることを意味します。`PASSWORD_EXPIRE NEVER`はパスワードが期限切れにならないことを示します。`PASSWORD_EXPIRE DEFAULT`を設定すると、グローバル変数`default_password_lifetime`（日数）の値を使用します。デフォルトはNEVER（または0）で、期限切れにならないことを示します。

    例：

    - グローバル変数を設定：`SET GLOBAL default_password_lifetime = 1`
    - ユーザーに設定：`ALTER USER user1@'ip' PASSWORD_EXPIRE INTERVAL 10 DAY`

3. `FAILED_LOGIN_ATTEMPTS`と`PASSWORD_LOCK_TIME`

    パスワードの誤入力回数を設定し、その後ユーザーアカウントがロックされ、ロック期間を設定します。例えば、`FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1 DAY`は、3回の間違ったログインがあった場合、アカウントが1日間ロックされることを意味します。管理者は`ALTER USER`文を使用してアカウントのロックを解除できます。

    例：

    - ユーザーに設定：`ALTER USER user1@'ip' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1 DAY`

4. Password Strength

    これはグローバル変数`validate_password_policy`によって制御されます。デフォルトは`NONE/0`で、パスワード強度チェックを行わないことを意味します。`STRONG/2`に設定すると、パスワードには大文字、小文字、数字、特殊文字のうち少なくとも3つを含める必要があり、8文字以上でなければなりません。

    例：

    - `SET validate_password_policy=STRONG`

詳細については、[ALTER USER](../../sql-manual/sql-statements/account-management/ALTER-USER)を参照してください。

## Authorization

### 権限操作

- ユーザー作成：[CREATE USER](../../sql-manual/sql-statements/account-management/CREATE-USER)
- ユーザー修正：[ALTER USER](../../sql-manual/sql-statements/account-management/ALTER-USER)
- ユーザー削除：[DROP USER](../../sql-manual/sql-statements/account-management/DROP-USER)
- 権限付与/ロール割り当て：[GRANT](../../sql-manual/sql-statements/account-management/GRANT-TO)
- 権限取り消し/ロール削除：[REVOKE](../../sql-manual/sql-statements/account-management/REVOKE-FROM)
- ロール作成：[CREATE ROLE](../../sql-manual/sql-statements/account-management/CREATE-ROLE)
- ロール削除：[DROP ROLE](../../sql-manual/sql-statements/account-management/DROP-ROLE)
- ロール修正：[ALTER ROLE](../../sql-manual/sql-statements/account-management/ALTER-ROLE)
- 現在のユーザーの権限とロールを表示：[SHOW GRANTS](../../sql-manual/sql-statements/account-management/SHOW-GRANTS)
- すべてのユーザーの権限とロールを表示：[SHOW ALL GRANTS](../../sql-manual/sql-statements/account-management/SHOW-GRANTS)
- 作成されたロールを表示：[SHOW ROLES](../../sql-manual/sql-statements/account-management/SHOW-ROLES)
- ユーザープロパティ設定：[SET PROPERTY](../../sql-manual/sql-statements/account-management/SET-PROPERTY)
- ユーザープロパティ表示：[SHOW PROPERTY](../../sql-manual/sql-statements/account-management/SHOW-PROPERTY)
- パスワード変更：[SET PASSWORD](../../sql-manual/sql-statements/account-management/SET-PASSWORD)
- サポートされているすべての権限を表示：[SHOW PRIVILEGES]
- 行ポリシー表示：[SHOW ROW POLICY]
- 行ポリシー作成：[CREATE ROW POLICY]

### 権限の種類

Dorisは現在、以下の権限をサポートしています：

1. `Node_priv`

    ノード変更権限。FE、BE、BROKERノードの追加、削除、オフライン化を含みます。

    rootユーザーはデフォルトでこの権限を持ちます。`Grant_priv`と`Node_priv`の両方を持つユーザーは、この権限を他のユーザーに付与できます。

    この権限はGlobalレベルでのみ付与できます。

2. `Grant_priv`

    権限変更権限。権限の付与、取り消し、ユーザー/ロールの追加/削除/変更を含む操作の実行を許可します。

    バージョン2.1.2以前では、他のユーザー/ロールに権限を付与する際、現在のユーザーは該当レベルの`Grant_priv`権限のみを必要としていました。バージョン2.1.2以降では、現在のユーザーは付与したいリソースの権限も必要です。

    他のユーザーにロールを割り当てる際は、Globalレベルの`Grant_priv`権限が必要です。

3. `Select_priv`

    データディレクトリ、データベース、テーブルの読み取り専用権限。

4. `Load_priv`

    データディレクトリ、データベース、テーブルの書き込み権限。Load、Insert、Deleteなどを含みます。

5. `Alter_priv`

    データディレクトリ、データベース、テーブルの変更権限。ライブラリ/テーブルの名前変更、列の追加/削除/変更、パーティションの追加/削除などを含みます。

6. `Create_priv`

    データディレクトリ、データベース、テーブル、ビューの作成権限。

7. `Drop_priv`

    データディレクトリ、データベース、テーブル、ビューの削除権限。

8. `Usage_priv`

    ResourcesとWorkload Groupsの使用権限。

9. `Show_view_priv`

    `SHOW CREATE VIEW`の実行権限。

### 権限レベル

#### Global権限

`*.*.*`スコープでのGRANT文で付与される権限。これらの権限は任意のカタログ内の任意のテーブルに適用されます。

#### Catalog権限

`ctl.*.*`スコープでのGRANT文で付与される権限。これらの権限は指定されたカタログ内の任意のテーブルに適用されます。

#### Database権限

`ctl.db.*`スコープでのGRANT文で付与される権限。これらの権限は指定されたデータベース内の任意のテーブルに適用されます。

#### Table権限

`ctl.db.tbl`スコープでのGRANT文で付与される権限。これらの権限は指定されたテーブル内の任意の列に適用されます。

#### Column権限

列権限は主に、テーブル内の特定の列へのユーザーアクセスを制限するために使用されます。具体的には、列権限により管理者は特定の列の表示、編集、その他の権限を設定し、特定の列データへのユーザーアクセスと操作を制御できます。

テーブルの特定の列の権限は`GRANT Select_priv(col1,col2) ON ctl.db.tbl TO user1`で付与できます。

現在、列権限は`Select_priv`のみをサポートしています。

#### 行レベル権限

Row Policiesにより、管理者はデータ内のフィールドに基づいてアクセスポリシーを定義し、どのユーザーがどの行にアクセスできるかを制御できます。

具体的には、Row Policiesにより管理者はデータに保存されている実際の値に基づいてユーザーの行へのアクセスをフィルタリングまたは制限するルールを作成できます。

バージョン1.2から、`CREATE ROW POLICY`コマンドで行レベル権限を作成できます。

バージョン2.1.2から、Apache Rangerの`Row Level Filter`を通じて行レベル権限を設定するサポートが利用可能です。

#### Usage権限

- Resource権限

    Resource権限はResourcesに対して特別に設定される権限で、データベースやテーブルの権限とは無関係であり、`Usage_priv`と`Grant_priv`のみを割り当てることができます。

    すべてのResourcesの権限は`GRANT USAGE_PRIV ON RESOURCE '%' TO user1`で付与できます。

- Workload Group権限

    Workload Group権限はWorkload Groupsに対して特別に設定される権限で、データベースやテーブルの権限とは無関係であり、`Usage_priv`と`Grant_priv`のみを割り当てることができます。

    すべてのWorkload Groupsの権限は`GRANT USAGE_PRIV ON WORKLOAD GROUP '%' TO user1`で付与できます。

### データマスキング

データマスキングは、元のデータを変更、置換、または隠蔽することにより機密データを保護する方法で、マスキングされたデータが特定の形式と特性を保持しながら、もはや機密情報を含まないようにします。

例えば、管理者はクレジットカード番号やID番号などの機密フィールドの一部または全部の数字をアスタリスク`*`やその他の文字で置き換えたり、実名を仮名で置き換えることを選択する場合があります。

バージョン2.1.2から、Apache RangerのData Maskingを通じて特定の列にデータマスキングポリシーを設定するサポートが利用可能で、現在は[Apache Ranger](authorization/ranger)を通じてのみ設定可能です。

### Dorisビルトインauthorizationスキーム

Dorisの権限設計はRBAC（Role-Based Access Control）モデルに基づいており、ユーザーはロールに関連付けられ、ロールは権限に関連付けられます。ユーザーはロールを通じて間接的に権限にリンクされます。

ロールが削除されると、ユーザーは自動的にそのロールに関連付けられたすべての権限を失います。

ユーザーがロールから関連付けを解除されると、そのロールのすべての権限を自動的に失います。

ロールに権限が追加または削除されると、そのロールに関連付けられたユーザーの権限も相応に変更されます。

```
┌────────┐        ┌────────┐         ┌────────┐
│  user1 ├────┬───►  role1 ├────┬────►  priv1 │
└────────┘    │   └────────┘    │    └────────┘
              │                 │
              │                 │
              │   ┌────────┐    │
              │   │  role2 ├────┤
┌────────┐    │   └────────┘    │    ┌────────┐
│  user2 ├────┘                 │  ┌─►  priv2 │
└────────┘                      │  │ └────────┘
                  ┌────────┐    │  │
           ┌──────►  role3 ├────┘  │
           │      └────────┘       │
           │                       │
           │                       │
┌────────┐ │      ┌────────┐       │ ┌────────┐
│  userN ├─┴──────►  roleN ├───────┴─►  privN │
└────────┘        └────────┘         └────────┘
```
上記に示すように：

User1とuser2の両方が`role1`を通じて権限`priv1`を持っています。

UserNは`role3`を通じて権限`priv1`を持ち、`roleN`を通じて権限`priv2`と`privN`を持っています。したがって、userNは権限`priv1`、`priv2`、`privN`を同時に持っています。

ユーザー操作を容易にするため、ユーザーに直接権限を付与することが可能です。内部的には、各ユーザーに対して固有のデフォルトロールが作成されます。ユーザーに権限が付与される際、本質的にはユーザーのデフォルトロールに権限を付与することになります。

デフォルトロールは削除できず、他の人に割り当てることもできません。ユーザーが削除されると、そのデフォルトロールも自動的に削除されます。

### Apache Rangerベースの認可スキーム

[Apache Rangerベースの認可スキーム](authorization/ranger)を参照してください。

## よくある質問

### 権限の説明

1. ADMIN権限またはGLOBALレベルでのGRANT権限を持つユーザーは、以下の操作を実行できます：

    - CREATE USER
    - DROP USER
    - ALTER USER
    - SHOW GRANTS
    - CREATE ROLE
    - DROP ROLE
    - ALTER ROLE
    - SHOW ROLES
    - SHOW PROPERTY FOR USER

2. GRANT/REVOKE

    - ADMIN権限を持つユーザーは、任意のユーザーの権限を付与または取り消すことができます。
    - ADMINまたはGLOBALレベルのGRANT権限を持つユーザーは、ユーザーにロールを割り当てることができます。
    - 対応するレベルのGRANT権限と割り当てる権限を持つユーザーは、それらの権限をユーザー/ロールに配布できます。

3. SET PASSWORD

    - ADMIN権限またはGLOBALレベルのGRANT権限を持つユーザーは、非rootユーザーのパスワードを設定できます。
    - 一般ユーザーは、対応するUser Identityのパスワードを設定できます。対応するUser Identityは`SELECT CURRENT_USER()`コマンドで確認できます。
    - ROOTユーザーは自分自身のパスワードを変更できます。

### 追加情報

1. Dorisが初期化されると、以下のユーザーとロールが自動的に作成されます：

    - operatorロール：このロールは`Node_priv`と`Admin_priv`を持ち、つまりDorisのすべての権限を持ちます。
    - adminロール：このロールは`Admin_priv`を持ち、つまりノード変更を除くすべての権限を持ちます。
    - root@'%'：rootユーザー、任意のノードからのログインが許可され、operatorロールを持ちます。
    - admin@'%'：adminユーザー、任意のノードからのログインが許可され、adminロールを持ちます。

2. デフォルトで作成されたユーザー、ロール、またはユーザーの削除や権限の変更はサポートされていません。
    - ユーザーroot@'%'とadmin@'%'の削除はサポートされていませんが、root@'xxx'とadmin@'xxx'ユーザー（xxxは%以外の任意のホストを指す）の作成と削除は許可されています（Dorisはこれらのユーザーを通常のユーザーとして扱います）。
    - root@'%'とadmin@'%'のデフォルトロールの取り消しはサポートされていません。
    - operatorとadminロールの削除はサポートされていません。
    - operatorとadminロールの権限の変更はサポートされていません。

3. operatorロールを持つユーザーはRootのみです。adminロールを持つユーザーは複数存在できます。

4. 潜在的に競合する操作について、以下のように説明します：

    1. ドメインとIPの競合：

        以下のユーザーが作成されたと仮定します：

        `CREATE USER user1@['domain'];`

        そして付与されます：

        `GRANT SELECT_PRIV ON *.* TO user1@['domain']`

        このドメインはip1とip2の2つのIPに解決されます。

        その後、`user1@'ip1'`に別の権限を付与したとします：

        `GRANT ALTER_PRIV ON . TO user1@'ip1';`

        すると`user1@'ip1'`はSelect_privとAlter_privの両方の権限を持つことになります。そして`user1@['domain']`の権限を再度変更した場合、`user1@'ip1'`はその変更に従いません。

    2. 重複IPの競合：

        以下のユーザーが作成されたと仮定します：

        ```
        CREATE USER user1@'%' IDENTIFIED BY "12345";
        CREATE USER user1@'192.%' IDENTIFIED BY "abcde";
        ```
優先度に関しては、`'192.%'`は`'%'`よりも優先されるため、マシン`192.168.1.1`からユーザー`user1`がパスワード`'12345'`を使用してDorisにログインしようとした場合、アクセスは拒否されます。

5. パスワードを忘れた場合

    パスワードを忘れてDorisにログインできない場合、FEの設定ファイルに`skip_localhost_auth_check=true`を追加してFEを再起動することで、ローカルマシンからパスワードなしでrootとしてDorisにログインできます。

    ログイン後、`SET PASSWORD`コマンドを使用してパスワードをリセットできます。

6. rootユーザー自身以外は、rootユーザーのパスワードをリセットできません。

7. `Admin_priv`権限は、GLOBALレベルでのみ付与または取り消すことができます。

8. `current_user()`と`user()`

    ユーザーは`SELECT current_user()`と`SELECT user()`をそれぞれ実行することで、自分の`current_user`と`user`を確認できます。ここで、`current_user`はユーザーが認証されたIDを示し、`user`はその時点での実際のUser Identityです。

    例えば：

    `user1@'192.%'`が作成され、ユーザー`user1`が`192.168.10.1`からログインした場合、`current_user`は`user1@'192.%'`となり、`user`は`user1@'192.168.10.1'`となります。

    すべての権限は特定の`current_user`に付与され、実際のユーザーは対応する`current_user`のすべての権限を持ちます。

## ベストプラクティス

以下は、Doris権限システムの使用例です。

1. シナリオ1

   Dorisクラスターのユーザーは、管理者（Admin）、開発エンジニア（RD）、ユーザー（Client）に分かれています。管理者はクラスター全体に対するすべての権限を持ち、主にクラスターのセットアップとノード管理を担当します。開発エンジニアは、データベースとテーブルの作成、インポート、データの変更を含むビジネスモデリングを担当します。ユーザーは異なるデータベースとテーブルにアクセスしてデータを取得します。

   このシナリオでは、管理者にはADMINまたはGRANT権限を付与できます。RDには、任意のまたは特定のデータベースとテーブルに対するCREATE、DROP、ALTER、LOAD、SELECT権限を付与できます。Clientには、任意のまたは特定のデータベースとテーブルに対するSELECT権限を付与できます。さらに、異なるロールを作成して複数のユーザーの認可プロセスを簡素化できます。

2. シナリオ2

   クラスターには複数のビジネスが含まれている可能性があり、それぞれが1つ以上のデータセットを使用する可能性があります。各ビジネスはそのユーザーを管理する必要があります。このシナリオでは、管理ユーザーは各データベースに対してDATABASEレベルのGRANT権限を持つユーザーを作成できます。このユーザーは指定されたデータベースのユーザーのみを認可できます。

3. ブラックリスト

   Doris自体はブラックリストをサポートしておらず、ホワイトリストのみをサポートしていますが、特定の手段を通じてブラックリストをシミュレートできます。`user@'192.%'`という名前のユーザーが作成され、`192.*`からのユーザーのログインを許可するとします。`192.168.10.1`からのユーザーのログインを禁止したい場合、新しいパスワードで別のユーザー`cmy@'192.168.10.1'`を作成できます。`192.168.10.1`は`192.%`よりも優先度が高いため、`192.168.10.1`からのユーザーは古いパスワードではログインできなくなります。
