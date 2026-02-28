---
{
  "title": "ビルトイン Authorization | 認証",
  "description": "Dorisにおいて、useridentityはユーザーを一意に識別します。useridentityは、usernameとhostの2つの部分で構成されており、usernameはユーザー名です。",
  "language": "ja"
}
---
# 組み込み認証

## 主要概念

### ユーザー
Dorisでは、`user_identity`がユーザーを一意に識別します。`user_identity`は2つの部分で構成されます：`user_name`と`host`で、`user_name`はユーザー名です。`host`はユーザーが接続するホストアドレスを識別します。`host`部分はあいまいマッチングに`%`を使用できます。`host`が指定されていない場合、デフォルトで`%`となり、ユーザーは任意のホストからDorisに接続できることを意味します。

#### ユーザー属性
ユーザー属性は`user_identity`ではなく`user_name`に直接付与されます。つまり、`user@'192.%'`と`user@['domain']`は同じユーザー属性セットを共有します。これらの属性はユーザーに属し、`user@'192.%'`や`user@['domain']`には属しません。

ユーザー属性には以下が含まれますが、これらに限定されません：ユーザー接続の最大数、インポートクラスター設定など。

#### 組み込みユーザー
組み込みユーザーはDorisでデフォルトで作成されるユーザーで、デフォルトで特定の権限を持ちます。`root`と`admin`が含まれます。初期パスワードは空で、frontendの開始後にパスワード変更コマンドを使用して変更できます。デフォルトユーザーは削除できません。
- `root@'%'`：rootユーザー、任意のノードからのログインが許可され、ロールはoperatorです。
- `admin@'%'`：adminユーザー、任意のノードからのログインが許可され、ロールはadminです。

### パスワード
ユーザーログイン用の認証情報で、ユーザー作成時に管理者が設定し、作成後にユーザーが変更することも可能です。

#### パスワードポリシー
Dorisは、ユーザーがパスワードをより適切に管理できるよう、以下のパスワードポリシーをサポートしています。
- `PASSWORD_HISTORY`
  現在のユーザーがパスワードをリセットする際に履歴パスワードの使用を許可するかどうか。例えば、`PASSWORD_HISTORY 10`は過去10個のパスワードを新しいパスワードとして再利用できないことを意味します。`PASSWORD_HISTORY DEFAULT`に設定された場合、グローバル変数`password_history`の値が使用されます。0はこの機能が有効でないことを意味します。デフォルトは0です。
  例：
    - グローバル変数の設定：`SET GLOBAL password_history = 10`
    - ユーザーの設定：`ALTER USER user1@'ip' PASSWORD_HISTORY 10`
- `PASSWORD_EXPIRE`
  現在のユーザーのパスワード有効期限を設定します。例えば、`PASSWORD_EXPIRE INTERVAL 10 DAY`はパスワードが10日で期限切れになることを意味します。`PASSWORD_EXPIRE NEVER`はパスワードが期限切れにならないことを意味します。`PASSWORD_EXPIRE DEFAULT`に設定された場合、グローバル変数`default_password_lifetime`の値（日数）が使用されます。デフォルトは`NEVER`（または0）で、パスワードが期限切れにならないことを意味します。
  例：
    - グローバル変数の設定：`SET GLOBAL default_password_lifetime = 1`
    - ユーザーの設定：`ALTER USER user1@'ip' PASSWORD_EXPIRE INTERVAL 10 DAY`
- `FAILED_LOGIN_ATTEMPTS`と`PASSWORD_LOCK_TIME`
  アカウントがロックされる前の不正なパスワード試行回数とロック時間を設定します。例えば、`FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1 DAY`は3回のログイン試行失敗後にアカウントが1日間ロックされることを意味します。管理者は`ALTER USER`文を使用してロックされたアカウントをロック解除できます。
  例：
    - ユーザーの設定：`ALTER USER user1@'ip' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1 DAY`
- パスワード強度
  グローバル変数`validate_password_policy`によって制御されます。デフォルトは`NONE/0`で、パスワード強度チェックを行わないことを意味します。`STRONG/2`に設定された場合、パスワードには「大文字」、「小文字」、「数字」、「特殊文字」のうち少なくとも3つが含まれ、長さは少なくとも8文字である必要があります。
  例：
    - `SET validate_password_policy=STRONG`

## 認証メカニズム
1. クライアント認証情報の送信：クライアントはユーザー情報（ユーザー名、パスワード、データベースなど）をパッケージしてDorisサーバーに送信します。この情報はクライアントの身元を証明し、データベースへのアクセスを要求するために使用されます。
2. サーバー認証：Dorisはクライアントの認証情報を受信後、それを検証します。ユーザー名、パスワード、クライアントIPが正しく、ユーザーが選択されたデータベースにアクセスする権限がある場合、認証が成功し、Dorisはユーザーエンティティをシステムのユーザーアイデンティティにマップします。それ以外の場合、認証が失敗し、エラーメッセージがクライアントに返されます。

## ホワイトリストとブラックリスト
Doris自体はブラックリストをサポートせず、ホワイトリスト機能のみをサポートしますが、いくつかの方法でブラックリストをシミュレートできます。`user@'192.%'`という名前のユーザーが作成され、192.*からのユーザーがログインできるとします。192.168.10.1からのユーザーのログインを禁止したい場合、別のユーザー`cmy@'192.168.10.1'`を作成し、新しいパスワードを設定できます。192.168.10.1は192.%よりも高い優先度を持つため、192.168.10.1からのユーザーは古いパスワードを使用してログインできなくなります。

## 関連コマンド
- ユーザー作成：[CREATE USER](../../../sql-manual/sql-statements/account-management/CREATE-USER)
- ユーザー表示：[SHOW ALL GRANTS](../../../sql-manual/sql-statements/account-management/SHOW-GRANTS)
- ユーザー変更：[ALTER USER](../../../sql-manual/sql-statements/account-management/ALTER-USER)
- パスワード変更：[SET PASSWORD](../../../sql-manual/sql-statements/account-management/SET-PASSWORD)
- ユーザー削除：[DROP USER](../../../sql-manual/sql-statements/account-management/DROP-USER)
- ユーザー属性設定：[SET PROPERTY](../../../sql-manual/sql-statements/account-management/SET-PROPERTY)
- ユーザー属性表示：[SHOW PROPERTY](../../../sql-manual/sql-statements/account-management/SHOW-PROPERTY)

## その他の説明
  1. ログイン時のユーザーアイデンティティ優先度選択の問題

     上記で紹介したように、`user_identity`は`user_name`と`host`で構成されますが、ログイン時にユーザーは`user_name`のみを入力すればよいため、DorisはクライアントのIPに基づいてログインに使用する`user_identity`を決定します。

     クライアントのIPに基づいて1つの`user_identity`のみがマッチする場合、それがログインに使用され、問題は発生しません。しかし、複数の`user_identity`がマッチする場合、優先度の問題が発生します。
      1. ドメイン名とIPの間の優先度：
         以下のユーザーが作成されているとします：

         ```sql
              CREATE USER user1@['domain1'] IDENTIFIED BY "12345";
              CREATE USER user1@'ip1'IDENTIFIED BY "abcde";
         ```
`domain1`は2つのIP：`ip1`と`ip2`に解決されます。

優先度の観点では、IPがドメイン名よりも優先されます。したがって、ユーザー`user1`がパスワード`'12345'`を使用して`ip1`からDorisにログインを試みる場合、ログインは拒否されます。
2. 特定のIPと範囲IPの間の優先度：
   以下のユーザーが作成されているとします：

        ```sql
             CREATE USER user1@'%' IDENTIFIED BY "12345";
             CREATE USER user1@'192.%' IDENTIFIED BY "abcde";
        ```
優先度に関して、`'192.%'`は`'%'`よりも優先されます。したがって、ユーザー`user1`が`192.168.1.1`からパスワード`'12345'`を使用してDorisにログインしようとすると、ログインは拒否されます。

  2. パスワードを忘れた場合

     パスワードを忘れてDorisにログインできない場合は、FEの設定ファイルに`skip_localhost_auth_check=true`パラメータを追加してFEを再起動してください。これにより、`root`ユーザーを使用してFEマシンからパスワードなしでDorisにログインできるようになります。

     ログイン後、`SET PASSWORD`コマンドを使用してパスワードをリセットできます。

  3. `root`ユーザー自身を除き、どのユーザーも`root`ユーザーのパスワードをリセットできません。

  4. `current_user()`と`user()`

        ユーザーは`SELECT current_user()`と`SELECT user()`を使用して、それぞれ`current_user`と`user`を表示できます。`current_user`は現在のユーザーが認証システムを通過するために使用したアイデンティティを示し、`user`は現在のユーザーの実際のUser Identityです。

        例：

        `user1@'192.%'`が作成され、その後`user1`という名前のユーザーが`192.168.10.1`からシステムにログインしたとします。この時、`current_user`は`user1@'192.%'`であり、`user`は`user1@'192.168.10.1'`です。

        すべての権限は特定の`current_user`に付与され、実際のユーザーは対応する`current_user`のすべての権限を持ちます。
