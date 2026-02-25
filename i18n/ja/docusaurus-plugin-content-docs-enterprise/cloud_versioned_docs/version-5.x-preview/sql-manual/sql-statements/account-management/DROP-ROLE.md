---
{
  "title": "DROP ROLE",
  "description": "DROP ROLE文は、ロールを削除するために使用されます。",
  "language": "ja"
}
---
## Description

`DROP ROLE`文は、ロールを削除するために使用されます。

## Syntax

```sql
  DROP ROLE [IF EXISTS] <role_name>;
```
## 必須パラメータ

**1. `<role_name>`**：

> ロールの名前。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege     | Object    | Notes |
|:--------------|:----------|:------|
| ADMIN_PRIV    | USER or ROLE    | この操作はADMIN_PRIV権限を持つユーザーまたはロールのみが実行できます  |

## 使用上の注意

- ロールを削除しても、以前そのロールに属していたユーザーの権限には影響しません。これは単にロールとユーザーの関連付けを解除することと同等です。ユーザーがそのロールから取得した権限は変更されません。

## 例

- role1を削除する

```sql
DROP ROLE role1;
```
