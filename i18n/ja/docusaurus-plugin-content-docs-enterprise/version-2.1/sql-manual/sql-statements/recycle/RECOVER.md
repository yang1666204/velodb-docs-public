---
{
  "title": "RECOVER",
  "description": "このステートメントは、以前に削除されたデータベース、Table、またはパーティションを復旧するために使用されます。",
  "language": "ja"
}
---
## デスクリプション

この文は、以前削除されたデータベース、Table、またはパーティションを復旧するために使用されます。

名前またはIDによる指定されたメタデータの復旧をサポートし、復旧されたメタデータの名前変更を可能にします。

## Syntax:

```sql
RECOVER { DATABASE <db_name> [<db_id>] [AS <new_db_name>] 
        | TABLE [<db_name>.]<table_name> [<table_id>] [AS <new_table_name>] 
        | PARTITION <partition_name> [<partition_id>] FROM [<db_name>.]<table_name> [AS <new_partition_name>] }
```
## 必須パラメータ

データベースの復旧

**1. `<db_name>`**
> 復旧するデータベースの名前。

Tableの復旧

**1. `<table_name>`**
> 復旧するTableの名前。

パーティションの復旧

**1. `<partition_name>`**
> 復旧するパーティションの名前。

**2. `<table_name>`**
> パーティションが存在するTableの名前。

## オプションパラメータ

データベースの復旧

**1. `<db_id>`**
> 復旧するデータベースのID。

**2. `<new_db_name>`**
> 復旧したデータベースの新しい名前。

Tableの復旧

**1. `<db_name>`**
> Tableが存在するデータベースの名前。

**2. `<table_id>`**
> 復旧するTableのID。

**3. `<new_table_name>`**
> 復旧したTableの新しい名前。

パーティションの復旧

**1. `<partition_id>`**
> 復旧するパーティションのID。

**2. `<db_name>`**
> Tableが存在するデータベースの名前。

**3. `<new_partition_name>`**
> 復旧したパーティションの新しい名前。

## アクセス制御要件

| 権限        | オブジェクト | 注記 |
|-------------|-------------|------|
| ADMIN_PRIV  |             |      |

## 使用上の注意

- この操作は、一定期間内に削除されたメタデータのみ復旧できます。デフォルトは1日です（`fe.conf`の`catalog_trash_expire_second`パラメータで設定可能）。
- メタデータの復旧時にIDが指定されていない場合、同じ名前で最後に削除されたメタデータがデフォルトで復旧されます。
- 現在復旧可能なメタデータは`SHOW CATALOG RECYCLE BIN`で確認できます。

## 例

1. `example_db`という名前のデータベースを復旧する

    ```sql
    RECOVER DATABASE example_db;
    ```
2. `example_tbl`という名前のTableを復旧する

    ```sql
    RECOVER TABLE example_db.example_tbl;
    ```
3. Table`example_tbl`から`p1`という名前のパーティションを復旧する

    ```sql
    RECOVER PARTITION p1 FROM example_tbl;
    ```
4. ID `example_db_id` および名前 `example_db` のデータベースを復旧する

    ```sql
    RECOVER DATABASE example_db example_db_id;
    ```
5. ID `example_tbl_id` と名前 `example_tbl` のTableを復旧する

    ```sql
    RECOVER TABLE example_db.example_tbl example_tbl_id;
    ```
6. Table`example_tbl`からID `p1_id`と名前`p1`を持つパーティションを復旧する

    ```sql
    RECOVER PARTITION p1 p1_id FROM example_tbl;
    ```
7. ID `example_db_id` および名前 `example_db` のデータベースを復旧し、`new_example_db` にリネームする

    ```sql
    RECOVER DATABASE example_db example_db_id AS new_example_db;
    ```
8. `example_tbl`という名前のTableを復旧し、`new_example_tbl`にリネームする

    ```sql
    RECOVER TABLE example_db.example_tbl AS new_example_tbl;
    ```
9. Table`example_tbl`からID `p1_id`、名前`p1`のパーティションを復元し、`new_p1`にリネームする

    ```sql
    RECOVER PARTITION p1 p1_id AS new_p1 FROM example_tbl;
    ```
