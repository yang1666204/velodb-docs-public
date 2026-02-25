---
{
  "title": "DROP WORKLOAD POLICY",
  "description": "Workload Policyを削除する",
  "language": "ja"
}
---
## Description

Workload Policyを削除する

## Syntax

```sql
DROP WORKLOAD POLICY [ IF EXISTS ] <workload_policy_name>
```
## 必須パラメータ

**<workload_policy_name>**

Workload Policyの名前

## アクセス制御要件

最低でも`ADMIN_PRIV`権限が必要

## 例

1. cancel_big_queryという名前のWorkload Policyを削除する

  ```sql
  drop workload policy if exists cancel_big_query
  ```
