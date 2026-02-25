---
{
  "title": "ALTER TABLE PROPERTY",
  "description": "この文は既存のテーブルのプロパティを変更するために使用されます。この操作は同期的です、",
  "language": "ja"
}
---
:::caution
Partition AttributesとTable Attributesの違い
- Partition attributesは一般的にbuckets数（buckets）、ストレージメディア（storage_medium）、レプリケーション数（replication_num）、ホット/コールドデータ分離ポリシー（storage_policy）に焦点を当てます。
  - 既存のパーティションの場合、ALTER TABLE {tableName} MODIFY PARTITION ({partitionName}) SET ({key}={value})を使用して変更できますが、buckets数（buckets）は変更できません。
  - 未作成のdynamic partitionsの場合、ALTER TABLE {tableName} SET (dynamic_partition.{key} = {value})を使用してそれらの属性を変更できます。
  - 未作成のauto partitionsの場合、ALTER TABLE {tableName} SET ({key} = {value})を使用してそれらの属性を変更できます。
  - ユーザーがpartition attributesを変更したい場合、既に作成されたパーティションの属性と、未作成のパーティションの属性の両方を変更する必要があります。
- 上記の属性以外は、すべてテーブルレベルです。
- 具体的な属性については、[create table attributes](../../../../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE.md#properties)を参照してください。
:::

## 説明

このステートメントは既存のテーブルのプロパティを変更するために使用されます。この操作は同期的であり、コマンドの戻り値は実行の完了を示します。

テーブルのプロパティを変更します。現在、bloom filterカラム、colocate_with属性、dynamic_partition属性、replication_numおよびdefault.replication_numの変更をサポートしています。

構文:

```sql
ALTER TABLE [database.]table alter_clause;
```
property の alter_clause は以下の変更方法をサポートしています。

注意：

上記のスキーマ変更操作にマージして変更することも可能です。以下の例を参照してください。

1. テーブルのbloom filterカラムを変更する

```sql
ALTER TABLE example_db.my_table SET ("bloom_filter_columns"="k1,k2,k3");
```
上記のスキーマ変更操作にも組み込むことができます（複数の句の構文が若干異なることに注意してください）

```sql
ALTER TABLE example_db.my_table
DROP COLUMN col2
PROPERTIES ("bloom_filter_columns"="k1,k2,k3");
```
2. テーブルのColocateプロパティを変更する

```sql
ALTER TABLE example_db.my_table set ("colocate_with" = "t1");
```
3. テーブルのbucketing方法をHash DistributionからRandom Distributionに変更する

```sql
ALTER TABLE example_db.my_table set ("distribution_type" = "random");
```
4. テーブルの動的パーティション属性を変更する（動的パーティション属性を持たないテーブルに動的パーティション属性を追加することをサポート）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "false");
```
動的パーティション属性を持たないテーブルに動的パーティション属性を追加する必要がある場合、すべての動的パーティション属性を指定する必要があります
   （注意：非パーティションテーブルに対する動的パーティション属性の追加はサポートされていません）

```sql
ALTER TABLE example_db.my_table set (
  "dynamic_partition.enable" = "true", 
  "dynamic_partition.time_unit" = "DAY", 
  "dynamic_partition.end" = "3", 
  "dynamic_partition.prefix" = "p", 
  "dynamic_partition. buckets" = "32"
);
```
5. テーブルのin_memory属性を変更します。値は'false'のみ設定可能です

```sql
ALTER TABLE example_db.my_table set ("in_memory" = "false");
```
6. バッチ削除機能を有効にする

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "BATCH_DELETE";
```
注意：

- ユニークテーブルのみサポート
- 古いテーブルではバッチ削除がサポートされており、新しいテーブルでは作成時に既にサポートされています

7. sequenceカラムの値に従ってインポート順序を保証する機能を有効化

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "SEQUENCE_LOAD" WITH PROPERTIES (
  "function_column.sequence_type" = "Date"
);
```
注意:

- 一意テーブルのみサポート
- sequence_typeはシーケンス列のタイプを指定するために使用され、integral型とtime型を指定可能
- 新しくインポートされたデータの順序性のみサポート。履歴データは変更不可

8. テーブルのデフォルトバケット数を50に変更

```sql
ALTER TABLE example_db.my_table MODIFY DISTRIBUTION DISTRIBUTED BY HASH(k1) BUCKETS 50;
```
注意:

- RANGE パーティションと HASH ディストリビューションを持つ非コロケートテーブルのみサポート

9. テーブルコメントの変更

```sql
ALTER TABLE example_db.my_table MODIFY COMMENT "new comment";
```
10. カラムコメントの変更

```sql
ALTER TABLE example_db.my_table MODIFY COLUMN k1 COMMENT "k1", MODIFY COLUMN k2 COMMENT "k2";
```
11. エンジンタイプの変更

MySQL タイプのみ ODBC タイプに変更できます。driver の値は odbc.init 設定内のドライバー名です。

```sql
ALTER TABLE example_db.mysql_table MODIFY ENGINE TO odbc PROPERTIES("driver" = "MySQL");
```
12. コピー数の変更

```sql
ALTER TABLE example_db.mysql_table SET ("replication_num" = "2");
ALTER TABLE example_db.mysql_table SET ("default.replication_num" = "2");
ALTER TABLE example_db.mysql_table SET ("replication_allocation" = "tag.location.default: 1");
ALTER TABLE example_db.mysql_table SET ("default.replication_allocation" = "tag.location.default: 1");
```
注意:
1. default接頭辞を持つプロパティは、変更されたテーブルのデフォルトレプリカ配置を示します。この変更は、テーブルの現在の実際のレプリカ配置を変更するのではなく、パーティション化されたテーブルの新しく作成されるパーティションのレプリカ配置にのみ影響します。
2. パーティション化されていないテーブルの場合、default接頭辞のないレプリカ配置プロパティを変更すると、テーブルのデフォルトレプリカ配置と実際のレプリカ配置の両方が変更されます。つまり、変更後、`show create table`と`show partitions from tbl`ステートメントを通じて、レプリカ配置が変更されたことが確認できます。
3. パーティション化されたテーブルの場合、テーブルの実際のレプリカ配置はパーティションレベルにあり、つまり、各パーティションが独自のレプリカ配置を持ちます。これは`show partitions from tbl`ステートメントを通じて確認できます。実際のレプリカ配置を変更したい場合は、`ALTER TABLE PARTITION`を参照してください。

13\. **[Experimental]** `light_schema_change`を有効にする

  light_schema_changeを有効にして作成されていないテーブルについては、以下のステートメントを使用してそれを有効にできます。

```sql
ALTER TABLE example_db.mysql_table SET ("light_schema_change" = "true");
```
## Example

1. テーブルのbloom filterカラムを変更する

```sql
ALTER TABLE example_db.my_table SET ("bloom_filter_columns"="k1,k2,k3");
```
上記のスキーマ変更操作にも組み込むことができます（複数の句の構文が若干異なることに注意してください）

```sql
ALTER TABLE example_db.my_table
DROP COLUMN col2
PROPERTIES ("bloom_filter_columns"="k1,k2,k3");
```
2. テーブルのColocateプロパティを変更する

```sql
ALTER TABLE example_db.my_table set ("colocate_with" = "t1");
```
3. テーブルのバケッティング方式をHash DistributionからRandom Distributionに変更する

```sql
ALTER TABLE example_db.my_table set ("distribution_type" = "random");
```
4. テーブルの動的パーティション属性を変更する（動的パーティション属性を持たないテーブルに動的パーティション属性を追加することをサポート）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "false");
```
動的パーティション属性を持たないテーブルに動的パーティション属性を追加する必要がある場合は、すべての動的パーティション属性を指定する必要があります
   （注意：非パーティションテーブルでは動的パーティション属性の追加はサポートされていません）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "true", "dynamic_partition.time_unit" = "DAY", "dynamic_partition.end" = "3", "dynamic_partition.prefix" = "p", "dynamic_partition. buckets" = "32");
```
5. テーブルのin_memory属性を変更します。値は'false'のみ設定可能です。

```sql
ALTER TABLE example_db.my_table set ("in_memory" = "false");
```
6. バッチ削除機能を有効化する

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "BATCH_DELETE";
```
7. sequence列の値に従ってimport順序を保証する機能を有効にする

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "SEQUENCE_LOAD" WITH PROPERTIES ("function_column.sequence_type" = "Date");
```
8. テーブルのデフォルトバケット数を50に変更する

```sql
ALTER TABLE example_db.my_table MODIFY DISTRIBUTION DISTRIBUTED BY HASH(k1) BUCKETS 50;
```
9. テーブルコメントを変更する

```sql
ALTER TABLE example_db.my_table MODIFY COMMENT "new comment";
```
10. カラムコメントを修正する

```sql
ALTER TABLE example_db.my_table MODIFY COLUMN k1 COMMENT "k1", MODIFY COLUMN k2 COMMENT "k2";
```
11. エンジンタイプを変更する

```sql
ALTER TABLE example_db.mysql_table MODIFY ENGINE TO odbc PROPERTIES("driver" = "MySQL");
```
12. テーブルにコールドおよびホットデータ分離のデータ移行戦略を追加する

```sql
 ALTER TABLE create_table_not_have_policy set ("storage_policy" = "created_create_table_alter_policy");
```
注意：テーブルは、ストレージポリシーに関連付けられていない場合にのみ、正常に追加できます。テーブルは1つのストレージポリシーのみを持つことができます。

13. テーブルのパーティションにホットデータとコールドデータの移行戦略を追加する

```sql
ALTER TABLE create_table_partition MODIFY PARTITION (*) SET("storage_policy"="created_create_table_partition_alter_policy");
```
注意: テーブルのパーティションは、ストレージポリシーに関連付けられていない場合にのみ正常に追加できます。テーブルは1つのストレージポリシーのみを持つことができます。


## Keywords

```text
ALTER, TABLE, PROPERTY, ALTER TABLE
```
## ベストプラクティス
