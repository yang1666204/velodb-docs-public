---
{
  "title": "SHOW STORAGE POLICY USING",
  "description": "指定されたストレージポリシーに関連付けられているすべてのテーブルとパーティションを表示します。",
  "language": "ja"
}
---
## 説明

指定されたストレージポリシーに関連付けられているすべてのテーブルとパーティションを表示します。

## 構文

```sql
SHOW STORAGE POLICY USING [FOR <some_policy>]
```
## Optional Parameters
| Parameter Name          | Description                                                         |
|-------------------|--------------------------------------------------------------|
| `<policy_name>` | 照会するストレージポリシーの名前を指定します。指定した場合、指定されたストレージポリシーの詳細のみが表示されます。指定しない場合、すべてのストレージポリシーの情報が表示されます。 |

## Examples

1. ストレージポリシーが有効になっているすべてのオブジェクトを表示

   ```sql
   show storage policy using;
   ```
   ```sql
   +-----------------------+-----------------------------------------+----------------------------------------+------------+
   | PolicyName            | Database                                | Table                                  | Partitions |
   +-----------------------+-----------------------------------------+----------------------------------------+------------+
   | test_storage_policy   | regression_test_cold_heat_separation_p2 | table_with_storage_policy_1            | ALL        |
   | test_storage_policy   | regression_test_cold_heat_separation_p2 | partition_with_multiple_storage_policy | p201701    |
   | test_storage_policy_2 | regression_test_cold_heat_separation_p2 | partition_with_multiple_storage_policy | p201702    |
   | test_storage_policy_2 | regression_test_cold_heat_separation_p2 | table_with_storage_policy_2            | ALL        |
   | test_policy           | db2                                     | db2_test_1                             | ALL        |
   +-----------------------+-----------------------------------------+----------------------------------------+------------+
   ```
2. ストレージポリシーtest_storage_policyを使用するオブジェクトを表示する

    ```sql
    show storage policy using for test_storage_policy;
    ```
    ```sql
    +---------------------+-----------+---------------------------------+------------+
    | PolicyName          | Database  | Table                           | Partitions |
    +---------------------+-----------+---------------------------------+------------+
    | test_storage_policy | db_1      | partition_with_storage_policy_1 | p201701    |
    | test_storage_policy | db_1      | table_with_storage_policy_1     | ALL        |
    +---------------------+-----------+---------------------------------+------------+
   ```
