---
{
  "title": "SHOW CATALOG RECYCLE BIN",
  "description": "このステートメントは、recycle bin内のデータベース、Table、またはパーティションの復旧可能なメタデータを表示するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、ごみ箱内のデータベース、Table、またはパーティションの復元可能なメタデータを表示するために使用されます。

## 構文

```sql
SHOW CATALOG RECYCLE BIN [ WHERE NAME [ = "<name>" | LIKE "<name_matcher>"] ]
```
## オプションパラメータ

名前によるフィルタリング

**1. `<name>`**
> データベース、Table、またはパーティションの名前。

パターンマッチングによるフィルタリング

**1. `<name_matcher>`**
> データベース、Table、またはパーティションの名前に対するパターンマッチング。

## 戻り値

| Column         | タイプ     | Note                                                                                                                                                                             |
|----------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| タイプ           | String   | メタデータタイプ：Database、Table、パーティション                                                                                                                                        |
| Name           | String   | メタデータ名                                                                                                                                                                    |
| DbId           | Bigint   | データベースのID                                                                                                                                                               |
| TableId        | Bigint   | TableのID                                                                                                                                                                  |
| PartitionId    | Bigint   | パーティションのID                                                                                                                                                              |
| DropTime       | DateTime | メタデータがrecycle binに移動された時刻                                                                                                                              |
| DataSize       | Bigint   | データサイズ。メタデータタイプがデータベースの場合、この値にはrecycle bin内のすべてのTableとパーティションのデータサイズが含まれる                                                   |
| RemoteDataSize | Decimal  | リモートストレージ（HDFSまたはオブジェクトストレージ）上のデータサイズ。メタデータタイプがデータベースの場合、この値にはrecycle bin内のすべてのTableとパーティションのリモートデータサイズが含まれる |

## アクセス制御要件

| Privilege   | Object | 注釈 |
|-------------|--------|-------|
| ADMIN_PRIV  |        |       |

## 例

1. recycle bin内のすべてのメタデータを表示する

    ```sql
    SHOW CATALOG RECYCLE BIN;
    ```
2. リサイクルビンで名前が'test'のメタデータを表示する

    ```sql
    SHOW CATALOG RECYCLE BIN WHERE NAME = 'test';
    ```
3. recycle binで'test'で始まる名前のメタデータを表示する

    ```sql
    SHOW CATALOG RECYCLE BIN WHERE NAME LIKE 'test%';
    ```
