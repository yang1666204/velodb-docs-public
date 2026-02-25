---
{
  "title": "デフォルトストレージボルトの設定を解除",
  "description": "指定されたデフォルトストレージVaultをキャンセルする",
  "language": "ja"
}
---
## 説明
指定されたデフォルトストレージボルトをキャンセルする

## 構文

```sql
UNSET DEFAULT STORAGE VAULT
```
## Permission Control

| Privilege  | Object        | Notes                                                      |
| :--------- | :------------ | :--------------------------------------------------------- |
| ADMIN_PRIV | Storage Vault | 管理者ユーザーのみがこのステートメントを実行する権限を持ちます |

## Example

```sql
UNSET DEFAULT STORAGE VAULT
```
