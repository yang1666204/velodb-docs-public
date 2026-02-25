---
{
  "title": "SHOW CATALOG RECYCLE BIN",
  "description": "この文は、recycle bin内のデータベース、テーブル、またはパーティションの復旧可能なメタデータを表示するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、ごみ箱内のデータベース、テーブル、またはパーティションの復旧可能なメタデータを表示するために使用されます。

## 構文

```sql
SHOW CATALOG RECYCLE BIN [ WHERE NAME [ = "<name>" | LIKE "<name_matcher>"] ]
```
## オプションパラメータ

名前で絞り込み

**1. `<name>`**
> データベース、テーブル、またはパーティションの名前。

パターンマッチングで絞り込み

**1. `<name_matcher>`**
> データベース、テーブル、またはパーティションの名前のパターンマッチング。

## 戻り値

| Column         | Type     | Note                                                                                                                                                                             |
|----------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Type           | String   | メタデータタイプ：Database、Table、Partition                                                                                                                                        |
| Name           | String   | メタデータ名                                                                                                                                                                    |
| DbId           | Bigint   | データベースのID                                                                                                                                                               |
| TableId        | Bigint   | テーブルのID                                                                                                                                                                  |
| PartitionId    | Bigint   | パーティションのID                                                                                                                                                              |
| DropTime       | DateTime | メタデータがゴミ箱に移動された時刻                                                                                                                              |
| DataSize       | Bigint   | データサイズ。メタデータタイプがdatabaseの場合、この値にはゴミ箱内のすべてのテーブルとパーティションのデータサイズが含まれます                                                   |
| RemoteDataSize | Decimal  | リモートストレージ（HDFSまたはオブジェクトストレージ）上のデータサイズ。メタデータタイプがdatabaseの場合、この値にはゴミ箱内のすべてのテーブルとパーティションのリモートデータサイズが含まれます |

## アクセス制御要件

| Privilege   | Object | Notes |
|-------------|--------|-------|
| ADMIN_PRIV  |        |       |

## 例

1. ゴミ箱内のすべてのメタデータを表示

    ```sql
    SHOW CATALOG RECYCLE BIN;
    ```
2. リサイクルビンで名前が'test'のメタデータを表示する

    ```sql
    SHOW CATALOG RECYCLE BIN WHERE NAME = 'test';
    ```
3. recycle bin内で'test'で始まる名前のメタデータを表示する

    ```sql
    SHOW CATALOG RECYCLE BIN WHERE NAME LIKE 'test%';
    ```
