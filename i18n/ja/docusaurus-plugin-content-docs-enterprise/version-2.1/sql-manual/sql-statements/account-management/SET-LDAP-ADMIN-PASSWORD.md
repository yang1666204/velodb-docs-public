---
{
  "title": "SET LDAP_ADMIN_PASSWORD",
  "description": "SET LDAPADMINPASSWORD コマンドは、LDAP管理者パスワードを設定するために使用されます。LDAP認証を使用する場合、",
  "language": "ja"
}
---
## Description

`SET LDAP_ADMIN_PASSWORD`コマンドは、LDAP管理者パスワードを設定するために使用されます。LDAP認証を使用する場合、dorisはログインユーザー情報をLDAPサービスに問い合わせるために管理者アカウントとパスワードを使用する必要があります。

## Syntax

```sql
 SET LDAP_ADMIN_PASSWORD = PASSWORD('<plain_password>')
```
## 必要なパラメータ

**1. `<plain_password>`**

LDAP管理者パスワード

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| 権限 | オブジェクト | 備考                  |
| :--------------------- | :-------------- | :--------------------- |
| ADMIN_PRIV        | USER または ROLE    | この操作は`ADMIN_PRIV`権限を持つユーザーまたはロールのみが実行できます |

## 例

- LDAP管理者パスワードを設定する

  ```sql
  SET LDAP_ADMIN_PASSWORD = PASSWORD('123456')
  ```
