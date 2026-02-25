---
{
  "title": "ALTER TABLE RENAME",
  "description": "この文は既存のテーブルプロパティの特定の名前を変更するために使用されます。この操作は同期的です。",
  "language": "ja"
}
---
## Description

このステートメントは、既存のテーブルプロパティの特定の名前を変更するために使用されます。この操作は同期的で、コマンドの戻り値は実行の完了を示します。

grammar:

```sql
ALTER TABLE [database.]table alter_clause;
```
alter_clause の rename は以下の名前の修正をサポートします

1. テーブル名の修正

文法:

```sql
RENAME new_table_name;
```
2. rollupインデックス名を変更する

文法:

```sql
RENAME ROLLUP old_rollup_name new_rollup_name;
```
3. パーティション名を変更する

文法:

```sql
RENAME PARTITION old_partition_name new_partition_name;
```
4. カラム名の変更

:::tip Tips
この機能はApache Doris 1.2バージョン以降でサポートされています
:::

カラム名の変更



grammar:

```sql
RENAME COLUMN old_column_name new_column_name;
```
注意:

- テーブルを作成する際は、プロパティで'light_schema_change=true'を設定する必要があります。


## Example

1. table1という名前のテーブルをtable2に変更する

```sql
ALTER TABLE table1 RENAME table2;
```
2. テーブル example_table 内の rollup1 という名前の rollup インデックスを rollup2 に変更する

```sql
ALTER TABLE example_table RENAME ROLLUP rollup1 rollup2;
```
3. テーブル example_table 内の p1 という名前のパーティションを p2 に変更する

```sql
ALTER TABLE example_table RENAME PARTITION p1 p2;
```
4. テーブルexample_table内のc1という名前のカラムをc2に変更する

```sql
ALTER TABLE example_table RENAME COLUMN c1 c2;
```
## キーワード

```text
ALTER, TABLE, RENAME, ALTER TABLE
```
## ベストプラクティス
