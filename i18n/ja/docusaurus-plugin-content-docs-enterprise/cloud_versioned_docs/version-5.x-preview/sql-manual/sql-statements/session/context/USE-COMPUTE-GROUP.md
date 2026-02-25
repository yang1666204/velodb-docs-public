---
{
  "title": "COMPUTE GROUPを使用",
  "description": "storage-and-compute-separated版では、使用するコンピュートクラスターを指定します。",
  "language": "ja"
}
---
## Description

storage-and-compute-separated版では、使用するcomputeクラスターを指定します。

## Syntax

```sql
USE { [ <catalog_name>. ]<database_name>[ @<compute_group_name> ] | @<compute_group_name> }
```
## Required Parameters

`<compute_group_name>`：計算クラスターの名前。

## Return Value

計算クラスターの切り替えが成功した場合、"Database changed"を返します。切り替えが失敗した場合、対応するエラーメッセージを返します。

## Examples

1. 使用する計算クラスター`compute_cluster`を指定する：

    ```sql
    use @compute_cluster;
    Database changed
    ```
2. 使用するデータベース`mysql`とコンピュートクラスター`compute_cluster`の両方を指定します：

    ```sql
    use mysql@compute_cluster
    Database changed
    ```
## Permission Control

このSQLコマンドを正常に実行するための前提条件は、compute groupに対するUSAGE_PRIV権限を持つことです。権限に関するドキュメントを参照してください。

| Privilege  | Object        | Notes                                 |
| :--------- | :------------ | :------------------------------------ |
| USAGE_PRIV | Compute group | Permission to use the compute cluster |

ユーザーがcompute group権限を持たずにcompute groupを指定しようとした場合、エラーが報告されます。例えば、`test`はcompute group権限を持たない一般ユーザーです：

```sql
mysql -utest -h175.40.1.1 -P9030

use @compute_cluster;
ERROR 5042 (42000): errCode = 2, detailMessage = USAGE denied to user test'@'127.0.0.1' for compute group 'compute_cluster'
```
## Notes

1. データベース名またはcompute group名が予約キーワードの場合は、バッククォートで囲む必要があります。例：

    ```sql
    use @`create`
    ```
2. compute groupが存在しない場合、エラーメッセージが返されます：

    ```sql
    mysql> use @compute_group_not_exist;
    ERROR 5098 (42000): errCode = 2, detailMessage = Compute Group compute_group_not_exist not exist
    ```
