---
{
  "title": "REFRESH",
  "description": "この文はspecified Catalog/Database/Tableのmetadataを更新します。",
  "language": "ja"
}
---
## 説明

このステートメントは、指定されたCatalog/Database/Tableのメタデータを更新します。

## 構文

```sql
REFRESH CATALOG <catalog_name>;
REFRESH DATABASE [<catalog_name>.]<database_name>;
REFRESH TABLE [[<catalog_name>.]<database_name>.]<table_name>;
```
## 必須パラメータ

**1. `<catalog_name>`**

リフレッシュが必要なカタログの名前。

**2. `[<catalog_name>.]<database_name>`**

リフレッシュが必要なカタログ内のデータベースの名前。

**3. `[[<catalog_name>.]<database_name>.]<table_name>`**

リフレッシュが必要なカタログ内のテーブルの名前。

## アクセス制御要件
| 権限                                                                                    | オブジェクト  | 備考                                     |
|:---------------------------------------------------------------------------------------------|:--------|:------------------------------------------|
| ADMIN_PRIV / SELECT_PRIV / LOAD_PRIV / ALTER_PRIV / CREATE_PRIV / SHOW_VIEW_PRIV / DROP_PRIV | Catalog | 上記権限のいずれかが必要です。 |


## 使用上の注意
Catalogがリフレッシュされると、オブジェクト関連のCacheが強制的に無効化されます。Partition Cache、Schema Cache、File Cacheなどを含みます。

## 例

1. hive catalogをリフレッシュする

    ```sql
    REFRESH CATALOG hive;
    ```
2. database1を更新する

    ```sql
    REFRESH DATABASE ctl.database1;
    REFRESH DATABASE database1;
    ```
3. table1を更新する

    ```sql
    REFRESH TABLE ctl.db.table1;
    REFRESH TABLE db.table1;
    REFRESH TABLE table1;
    ```
