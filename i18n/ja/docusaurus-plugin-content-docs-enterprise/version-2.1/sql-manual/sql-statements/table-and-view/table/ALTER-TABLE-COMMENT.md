---
{
  "title": "ALTER TABLE COMMENT",
  "description": "この文は既存のTableのコメントを変更するために使用されます。この操作は同期的であり、コマンドは完了を示すために戻り値を返します。",
  "language": "ja"
}
---
## 説明

このステートメントは、既存のTableのコメントを変更するために使用されます。この操作は同期的であり、コマンドは完了を示すために戻り値を返します。

grammar：

```sql
ALTER TABLE [database.]table alter_clause;
```
1. Tableコメントを変更する

grammar：

```sql
MODIFY COMMENT "new table comment";
```
2. カラムコメントの変更

文法：

```sql
MODIFY COLUMN col1 COMMENT "new column comment";
```
## Examples

1. table1のコメントをtable1_commentに変更する

```sql
ALTER TABLE table1 MODIFY COMMENT "table1_comment";
```
2. table1のcol1のコメントをtable1_commentに変更する

```sql
ALTER TABLE table1 MODIFY COLUMN col1 COMMENT "table1_col1_comment";
```
## キーワード

```text
ALTER, TABLE, COMMENT, ALTER TABLE
```
## ベストプラクティス
