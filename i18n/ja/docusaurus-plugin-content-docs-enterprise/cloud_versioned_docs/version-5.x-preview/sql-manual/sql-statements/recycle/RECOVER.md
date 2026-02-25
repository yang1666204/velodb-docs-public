---
{
  "title": "RECOVER",
  "description": "この文は、以前に削除されたデータベース、テーブル、またはパーティションを復旧するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、以前に削除されたデータベース、テーブル、またはパーティションを復旧するために使用されます。

名前またはIDによる指定されたメタデータの復旧をサポートし、復旧されたメタデータの名前変更を可能にします。

## 構文：

```sql
RECOVER { DATABASE <db_name> [<db_id>] [AS <new_db_name>] 
        | TABLE [<db_name>.]<table_name> [<table_id>] [AS <new_table_name>] 
        | PARTITION <partition_name> [<partition_id>] FROM [<db_name>.]<table_name> [AS <new_partition_name>] }
```
## 必須パラメータ

データベースの復元

**1. `<db_name>`**
> 復元するデータベースの名前。

テーブルの復元

**1. `<table_name>`**
> 復元するテーブルの名前。

パーティションの復元

**1. `<partition_name>`**
> 復元するパーティションの名前。

**2. `<table_name>`**
> パーティションが存在するテーブルの名前。

## オプションパラメータ

データベースの復元

**1. `<db_id>`**
> 復元するデータベースのID。

**2. `<new_db_name>`**
> 復元されるデータベースの新しい名前。

テーブルの復元

**1. `<db_name>`**
> テーブルが存在するデータベースの名前。

**2. `<table_id>`**
> 復元するテーブルのID。

**3. `<new_table_name>`**
> 復元されるテーブルの新しい名前。

パーティションの復元

**1. `<partition_id>`**
> 復元するパーティションのID。

**2. `<db_name>`**
> テーブルが存在するデータベースの名前。

**3. `<new_partition_name>`**
> 復元されるパーティションの新しい名前。

## アクセス制御要件

| 権限        | オブジェクト | 注記 |
|-------------|------------|------|
| ADMIN_PRIV  |            |      |

## 使用上の注意

- この操作は一定期間内に削除されたメタデータのみ復元可能です。デフォルトは1日です（`fe.conf`の`catalog_trash_expire_second`パラメータで設定可能）。
- メタデータの復元時にIDが指定されない場合、同じ名前で最後に削除されたメタデータがデフォルトで復元されます。
- 現在復元可能なメタデータは`SHOW CATALOG RECYCLE BIN`を使用してクエリできます。

## 例

1. `example_db`という名前のデータベースを復元する

    ```sql
    RECOVER DATABASE example_db;
    ```
2. `example_tbl`という名前のテーブルを復旧する

    ```sql
    RECOVER TABLE example_db.example_tbl;
    ```
3. テーブル`example_tbl`から`p1`という名前のパーティションを復旧する

    ```sql
    RECOVER PARTITION p1 FROM example_tbl;
    ```
4. ID `example_db_id` と名前 `example_db` を持つデータベースを復旧する

    ```sql
    RECOVER DATABASE example_db example_db_id;
    ```
5. ID `example_tbl_id` と名前 `example_tbl` のテーブルを復旧する

    ```sql
    RECOVER TABLE example_db.example_tbl example_tbl_id;
    ```
6. テーブル`example_tbl`からID `p1_id`と名前`p1`を持つパーティションを復旧する

    ```sql
    RECOVER PARTITION p1 p1_id FROM example_tbl;
    ```
7. ID が `example_db_id` で名前が `example_db` のデータベースを復旧し、`new_example_db` にリネームする

    ```sql
    RECOVER DATABASE example_db example_db_id AS new_example_db;
    ```
8. `example_tbl`という名前のテーブルを復旧し、`new_example_tbl`にリネームする

    ```sql
    RECOVER TABLE example_db.example_tbl AS new_example_tbl;
    ```
9. テーブル`example_tbl`からID `p1_id`と名前`p1`のパーティションを復旧し、`new_p1`にリネームする

    ```sql
    RECOVER PARTITION p1 p1_id AS new_p1 FROM example_tbl;
    ```
