---
{
  "title": "ALTER TABLE ROLLUP",
  "description": "この文は既存のテーブルに対してrollup変更操作を実行するために使用されます。rollupは非同期操作であり、",
  "language": "ja"
}
---
## Description

このステートメントは、既存のテーブルに対してrollup変更操作を実行するために使用されます。rollupは非同期操作であり、タスクが正常に送信されるとタスクが返されます。その後、[SHOW ALTER](../../../../sql-manual/sql-statements/table-and-view/table/SHOW-ALTER-TABLE)コマンドを使用して進行状況を確認できます。

grammar:

```sql
ALTER TABLE [database.]table alter_clause;
```
rollup の alter_clause は以下の作成方法をサポートします

1. rollup インデックスを作成する

文法:

```sql
ADD ROLLUP rollup_name (column_name1, column_name2, ...)
[FROM from_index_name]
[PROPERTIES ("key"="value", ...)]
```
properties: タイムアウト時間の設定をサポートし、デフォルトのタイムアウト時間は1日です。

2. rollupインデックスをバッチで作成

文法:

```sql
ADD ROLLUP [rollup_name (column_name1, column_name2, ...)
                    [FROM from_index_name]
                    [PROPERTIES ("key"="value", ...)],...]
```
注意:

- from_index_nameが指定されていない場合、デフォルトでbase indexから作成されます
- rollupテーブルの列は、from_index内に既に存在する列である必要があります
- propertiesでは、ストレージ形式を指定できます。詳細については、[CREATE TABLE](./CREATE-TABLE)を参照してください

3. rollup indexの削除

文法:

```sql
DROP ROLLUP rollup_name [PROPERTIES ("key"="value", ...)]
```
4. バッチでのrollupインデックス削除

文法:

```sql
DROP ROLLUP [rollup_name [PROPERTIES ("key"="value", ...)],...]
```
注意：

- base indexは削除できません

## Example

1. indexを作成：example_rollup_index、base index (k1,k2,k3,v1,v2)に基づく。Columnar storage。

```sql
ALTER TABLE example_db.my_table
ADD ROLLUP example_rollup_index(k1, k3, v1, v2);
```
2. インデックスを作成：example_rollup_index2、example_rollup_index (k1,k3,v1,v2) をベースとする

```sql
ALTER TABLE example_db.my_table
ADD ROLLUP example_rollup_index2 (k1, v1)
FROM example_rollup_index;
```
3. インデックスの作成: example_rollup_index3、ベースインデックス（k1,k2,k3,v1）に基づいて、カスタムrollupタイムアウトを1時間に設定。

```sql
ALTER TABLE example_db.my_table
ADD ROLLUP example_rollup_index(k1, k3, v1)
PROPERTIES("timeout" = "3600");
```
4. インデックスを削除: example_rollup_index2

```sql
ALTER TABLE example_db.my_table
DROP ROLLUP example_rollup_index2;
```
5. Batch Delete rollup index

```sql
ALTER TABLE example_db.my_table
DROP ROLLUP example_rollup_index2,example_rollup_index3;
```
4. キーワード

```text
ALTER, TABLE, ROLLUP, ALTER TABLE
```
## ベストプラクティス
