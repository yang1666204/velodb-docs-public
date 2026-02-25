---
{
  "title": "DROP USER",
  "description": "DROP USER文は、ユーザーを削除するために使用されます。",
  "language": "ja"
}
---
## 説明

`DROP USER`文は、ユーザーを削除するために使用されます。

## 構文

```sql
  DROP USER '<user_identity>'
```
## Required Parameters

**1. `<user_identity>`**

> 指定されたユーザーアイデンティティ。

## Access Control Requirements

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege     | Object    | Notes |
|:--------------|:----------|:------|
| ADMIN_PRIV    | USER or ROLE    | この操作は、ADMIN_PRIV権限を持つユーザーまたはロールによってのみ実行できます  |

## Example

- ユーザー jack@'192.%' を削除

```sql
DROP USER 'jack'@'192.%'
```
