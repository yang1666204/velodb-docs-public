---
{
  "title": "ALTER TABLE PROPERTY",
  "description": "この文は既存のTableのプロパティを変更するために使用されます。この操作は同期的であり、",
  "language": "ja"
}
---
:::caution
パーティション属性とTable属性の違い
- パーティション属性は一般的にバケット数（buckets）、ストレージメディア（storage_medium）、レプリケーション数（replication_num）、およびホット/コールドデータ分離ポリシー（storage_policy）に焦点を当てます。
  - 既存のパーティションの場合、ALTER TABLE {tableName} MODIFY PARTITION ({partitionName}) SET ({key}={value})を使用して変更できますが、バケット数（buckets）は変更できません。
  - 未作成の動的パーティションの場合、ALTER TABLE {tableName} SET (dynamic_partition.{key} = {value})を使用してそれらの属性を変更できます。
  - 未作成の自動パーティションの場合、ALTER TABLE {tableName} SET ({key} = {value})を使用してそれらの属性を変更できます。
  - ユーザーがパーティション属性を変更したい場合、既に作成されたパーティションの属性と未作成のパーティションの属性の両方を変更する必要があります。
- 上記の属性以外は、すべてTableレベルの属性です。
- 具体的な属性については、[create table attributes](../../../../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE)を参照してください。
:::

## 説明

このステートメントは既存のTableのプロパティを変更するために使用されます。この操作は同期的であり、コマンドの戻りは実行の完了を示します。

Tableのプロパティを変更します。現在、bloom filterカラム、colocate_with属性、dynamic_partition属性、replication_numおよびdefault.replication_numの変更をサポートしています。

構文:

```sql
ALTER TABLE [database.]table alter_clause;
```
alter_clause of property では、以下の変更方法をサポートしています。

注意：

上記のスキーマ変更操作にマージして変更することも可能です。以下の例を参照してください。

1. Tableのbloom filterカラムを変更する

```sql
ALTER TABLE example_db.my_table SET ("bloom_filter_columns"="k1,k2,k3");
```
上記のスキーマ変更操作に組み込むこともできます（複数の句の構文が若干異なることに注意してください）

```sql
ALTER TABLE example_db.my_table
DROP COLUMN col2
PROPERTIES ("bloom_filter_columns"="k1,k2,k3");
```
2. TableのColocateプロパティを変更する

```sql
ALTER TABLE example_db.my_table set ("colocate_with" = "t1");
```
3. Tableのバケット化方法をHash DistributionからRandom Distributionに変更する

```sql
ALTER TABLE example_db.my_table set ("distribution_type" = "random");
```
4. Tableの動的パーティション属性を変更する（動的パーティション属性を持たないTableに動的パーティション属性を追加することをサポート）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "false");
```
動的パーティション属性を持たないTableに動的パーティション属性を追加する必要がある場合は、すべての動的パーティション属性を指定する必要があります
   （注意：非パーティションTableに対する動的パーティション属性の追加はサポートされていません）

```sql
ALTER TABLE example_db.my_table set (
  "dynamic_partition.enable" = "true", 
  "dynamic_partition.time_unit" = "DAY", 
  "dynamic_partition.end" = "3", 
  "dynamic_partition.prefix" = "p", 
  "dynamic_partition. buckets" = "32"
);
```
5. Tableのin_memory属性を変更します。値は'false'のみ設定可能です

```sql
ALTER TABLE example_db.my_table set ("in_memory" = "false");
```
6. バッチ削除機能を有効にする

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "BATCH_DELETE";
```
注意：

- 一意Tableのみサポート
- 旧Tableではバッチ削除がサポートされており、新Tableは作成時に既にサポートされている

7. sequenceカラムの値に従ってインポート順序を保証する機能を有効化

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "SEQUENCE_LOAD" WITH PROPERTIES (
  "function_column.sequence_type" = "Date"
);
```
注意：

- ユニークTableのみサポート
- sequence_typeはシーケンス列の型を指定するために使用され、integralおよびtime型を指定できます
- 新しくインポートされるデータの順序性のみサポートされます。履歴データは変更できません

8. Tableのデフォルトバケット数を50に変更する

```sql
ALTER TABLE example_db.my_table MODIFY DISTRIBUTION DISTRIBUTED BY HASH(k1) BUCKETS 50;
```
注意:

- RANGE パーティションと HASH ディストリビューションを持つ非 colocate Tableのみサポート

9. Tableコメントの変更

```sql
ALTER TABLE example_db.my_table MODIFY COMMENT "new comment";
```
10. カラムコメントの変更

```sql
ALTER TABLE example_db.my_table MODIFY COLUMN k1 COMMENT "k1", MODIFY COLUMN k2 COMMENT "k2";
```
11. エンジンタイプの変更

MySQLタイプのみをODBCタイプに変更できます。driverの値は、odbc.init設定内のドライバー名です。

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
1. defaultプレフィックス付きのプロパティは、変更されたTableのデフォルトレプリカ分散を示します。この変更は、Tableの現在の実際のレプリカ分散を変更するものではなく、パーティションTableの新しく作成されるパーティションのレプリカ分散にのみ影響します。
2. 非パーティションTableの場合、defaultプレフィックスなしでレプリカ分散プロパティを変更すると、Tableのデフォルトレプリカ分散と実際のレプリカ分散の両方が変更されます。つまり、変更後は`show create table`および`show partitions from tbl`ステートメントを通じて、レプリカ分散が変更されたことを確認できます。
3. パーティションTableの場合、Tableの実際のレプリカ分散はパーティションレベルにあります。つまり、各パーティションは独自のレプリカ分散を持ち、これは`show partitions from tbl`ステートメントを通じて確認できます。実際のレプリカ分散を変更したい場合は、`ALTER TABLE PARTITION`を参照してください。

13\. **[実験的]** `light_schema_change`を有効にする

  light_schema_changeを有効にして作成されなかったTableについては、以下のステートメントを使用して有効にできます。

```sql
ALTER TABLE example_db.mysql_table SET ("light_schema_change" = "true");
```
## Examples

1. Tableのbloom filterカラムを変更する

```sql
ALTER TABLE example_db.my_table SET ("bloom_filter_columns"="k1,k2,k3");
```
上記のスキーマ変更操作にも組み込むことができます（複数の句の構文が若干異なることに注意してください）

```sql
ALTER TABLE example_db.my_table
DROP COLUMN col2
PROPERTIES ("bloom_filter_columns"="k1,k2,k3");
```
2. TableのColocateプロパティを変更する

```sql
ALTER TABLE example_db.my_table set ("colocate_with" = "t1");
```
3. Tableのバケット化方式をHash DistributionからRandom Distributionに変更する

```sql
ALTER TABLE example_db.my_table set ("distribution_type" = "random");
```
4. Tableの動的パーティション属性を変更する（動的パーティション属性を持たないTableに動的パーティション属性を追加することをサポート）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "false");
```
動的パーティション属性を持たないTableに動的パーティション属性を追加する必要がある場合は、すべての動的パーティション属性を指定する必要があります
   （注意：非パーティションTableでは動的パーティション属性の追加はサポートされていません）

```sql
ALTER TABLE example_db.my_table set ("dynamic_partition.enable" = "true", "dynamic_partition.time_unit" = "DAY", "dynamic_partition.end" = "3", "dynamic_partition.prefix" = "p", "dynamic_partition. buckets" = "32");
```
5. Tableのin_memory属性を変更します。値は'false'のみ設定可能です

```sql
ALTER TABLE example_db.my_table set ("in_memory" = "false");
```
6. バッチ削除機能を有効にする

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "BATCH_DELETE";
```
7. sequence列の値に従ってインポート順序を保証する機能を有効にする

```sql
ALTER TABLE example_db.my_table ENABLE FEATURE "SEQUENCE_LOAD" WITH PROPERTIES ("function_column.sequence_type" = "Date");
```
8. Tableのデフォルトのバケット数を50に変更する

```sql
ALTER TABLE example_db.my_table MODIFY DISTRIBUTION DISTRIBUTED BY HASH(k1) BUCKETS 50;
```
9. Tableコメントの変更

```sql
ALTER TABLE example_db.my_table MODIFY COMMENT "new comment";
```
10. カラムコメントを変更する

```sql
ALTER TABLE example_db.my_table MODIFY COLUMN k1 COMMENT "k1", MODIFY COLUMN k2 COMMENT "k2";
```
11. エンジンタイプを変更する

```sql
ALTER TABLE example_db.mysql_table MODIFY ENGINE TO odbc PROPERTIES("driver" = "MySQL");
```
12. Tableにコールドとホットの分離データ移行戦略を追加する

```sql
 ALTER TABLE create_table_not_have_policy set ("storage_policy" = "created_create_table_alter_policy");
```
注意：Tableは、ストレージポリシーに関連付けられていない場合にのみ、正常に追加できます。Tableは1つのストレージポリシーのみを持つことができます。

13. Tableのパーティションにホットおよびコールドデータ移行戦略を追加する

```sql
ALTER TABLE create_table_partition MODIFY PARTITION (*) SET("storage_policy"="created_create_table_partition_alter_policy");
```
注意: Tableのpartitionは、ストレージポリシーに関連付けられていない場合にのみ正常に追加できます。Tableは1つのストレージポリシーのみを持つことができます。


## Keywords

```text
ALTER, TABLE, PROPERTY, ALTER TABLE
```
## Best Practice
