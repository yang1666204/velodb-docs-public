---
{
  "title": "SET DEFAULT STORAGE VAULT",
  "description": "この文は、Dorisにおけるデフォルトストレージvaultを設定するために使用されます。デフォルトストレージvaultは、内部またはシステムテーブルのデータを格納するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、Dorisのデフォルトストレージvaultを設定するために使用されます。デフォルトストレージvaultは、内部テーブルまたはシステムテーブルのデータを保存するために使用されます。デフォルトストレージvaultが設定されていない場合、Dorisは正常に動作することができません。デフォルトストレージvaultが一度設定されると、それを削除することはできません。


## 構文

```sql
SET <vault_name> AS DEFAULT STORAGE VAULT
```
## Required Parameters

| Parameter Name          | Description                                                         |
|-------------------|--------------------------------------------------------------|
| `<vault_name>`    | ストレージvaultの名前。デフォルトストレージvaultとして設定したいvaultの一意識別子です。           |

## Usage Notes:
> 1. ADMINユーザーのみがデフォルトストレージvaultを設定できます。

## Examples

1. s3_vaultという名前のストレージvaultをデフォルトストレージvaultとして設定します。

   ```sql
   SET s3_vault AS DEFAULT STORAGE VAULT;
   ```
