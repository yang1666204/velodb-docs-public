---
{
  "title": "CREATE WORKLOAD POLICY",
  "description": "特定の条件を満たすクエリに対して対応するアクションを実行するためのWorkload Policyを作成します。",
  "language": "ja"
}
---
## Description

特定の条件を満たすクエリに対して対応するアクションを実行するWorkload Policyを作成します。


## Syntax

```sql
CREATE WORKLOAD POLICY [ IF NOT EXISTS ] <workload_policy_name>
CONDITIONS(<conditions>) ACTIONS(<actions>)
[ PROPERTIES (<properties>) ]
```
### 必須パラメータ

`<workload_policy_name>`

Workload Policyの名前。



1. **be_scan_rows**: 単一のBEプロセス内でSQLクエリによってスキャンされた行数。SQLクエリが複数のBE上で並行実行される場合、これらの並行実行の累積値です。
2. **be_scan_bytes**: 単一のBEプロセス内でSQLクエリによってスキャンされたバイト数。SQLクエリが複数のBE上で並行実行される場合、これらの並行実行の累積値です（バイト単位）。
3. **query_time**: 単一のBEプロセス上でのSQLクエリの実行時間（ミリ秒単位）。
4. **query_be_memory_bytes** (バージョン2.1.5からサポート): 単一のBEプロセス内でSQLクエリによって使用されたメモリ量。SQLクエリが複数のBE上で並行実行される場合、これらの並行実行の累積値です（バイト単位）。


`<actions>`

1. **set_session_variable**: このアクションはset session variable文を実行します。同一ポリシー内で複数の**set_session_variable**アクションを指定でき、一つのポリシー内で複数のセッション変数変更文を実行できます。
2. **cancel_query**: クエリをキャンセルします。

### オプションパラメータ



1. **enabled**: trueまたはfalseの値を取り、デフォルト値はtrueです。trueに設定するとポリシーが有効になり、falseに設定するとポリシーが無効になります。
2. **priority**: 0から100までの整数値で、デフォルト値は0です。これはポリシーの優先度を表します。値が高いほど優先度が高くなります。複数のポリシーがマッチした場合、最も優先度の高いポリシーが選択されます。
3. **workload_group**: 現在、ポリシーは一つのworkload groupにバインドでき、このポリシーが特定のworkload groupにのみ適用されることを示します。デフォルトは空で、すべてのクエリに適用されることを意味します。

### アクセス制御要件

少なくとも`ADMIN_PRIV`権限が必要です。

## 例

1. クエリ時間が3秒を超えるすべてのクエリを強制終了する新しいWorkload Policyを作成します。

  ```Java
  create workload policy kill_big_query conditions(query_time > 3000) actions(cancel_query)
  ```
1. デフォルトでは有効になっていない新しいWorkload Policyを作成します。

  ```Java
  create workload policy kill_big_query conditions(query_time > 3000) actions(cancel_query) properties('enabled'='false')
  ```
