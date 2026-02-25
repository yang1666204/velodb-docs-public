---
{
  "title": "DROP CATALOG RECYCLE BIN",
  "description": "この文は、リサイクルビン内のデータベース、テーブル、またはパーティションを即座に削除するために使用されます。",
  "language": "ja"
}
---
## Description

この文は、recycle bin内のデータベース、テーブル、またはパーティションを即座に削除するために使用されます。

## Syntax

```sql
DROP CATALOG RECYCLE BIN WHERE { 'DbId' = <db_id> | 'TableId' = <table_id> | 'PartitionId' = <partition_id> }
```
## 必須パラメータ

DbIdでデータベースを削除する

**1. `<db_id>`**
> 即座に削除されるデータベースのID。

TableIdでテーブルを削除する

**1. `<table_id>`**
> 即座に削除されるテーブルのID。

PartitionIdでパーティションを削除する

**1. `<partition_id>`**
> 即座に削除されるパーティションのID。

## アクセス制御要件

| Privilege   | Object | Note |
|-------------|--------|------|
| ADMIN_PRIV  |        |      |

## 使用上の注意

- データベース、テーブル、またはパーティションを削除する際、ごみ箱は`catalog_trash_expire_second`秒後（`fe.conf`で設定）にそれらを削除します。このステートメントはそれらを即座に削除します。
- `'DbId'`、`'TableId'`、`'PartitionId'`は大文字小文字を区別せず、シングルクォートとダブルクォートも区別しません。
- ごみ箱にないデータベースを削除する場合、ごみ箱内の同じ`DbId`を持つすべてのテーブルとパーティションも削除されます。何も削除されなかった場合（データベース、テーブル、またはパーティション）のみエラーが報告されます。ごみ箱にないテーブルを削除する場合も同様です。
- `SHOW CATALOG RECYCLE BIN`を使用して、現在削除可能なメタデータを照会できます。

## 例

1. DbId `example_db_id`を持つデータベース、テーブル、パーティションを削除する

    ```sql
    DROP CATALOG RECYCLE BIN WHERE 'DbId' = example_db_id;
    ```
2. TableId `example_tbl_id`を持つテーブルとパーティションを削除する

    ```sql
    DROP CATALOG RECYCLE BIN WHERE 'TableId' = example_tbl_id;
    ```
3. PartitionId `p1_id`を持つパーティションを削除する

    ```sql
    DROP CATALOG RECYCLE BIN WHERE 'PartitionId' = p1_id;
    ```
