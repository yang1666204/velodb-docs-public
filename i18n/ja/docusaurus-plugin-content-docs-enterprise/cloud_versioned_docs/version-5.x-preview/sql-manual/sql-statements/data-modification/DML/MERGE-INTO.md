---
{
  "title": "MERGE-INTO",
  "description": "第2のテーブルまたはサブクエリの値に基づいて、テーブル内の値を挿入、更新、および削除します。",
  "language": "ja"
}
---
## Description

第2のテーブルまたはサブクエリの値に基づいて、テーブル内の値を挿入、更新、削除します。マージは、第2のテーブルがターゲットテーブル内の新しい行（挿入対象）、変更された行（更新対象）、またはマークされた行（削除対象）を含む変更ログである場合に有用です。

このコマンドは以下のケースを処理するためのセマンティクスをサポートします：

- 一致する値（更新および削除用）
- 一致しない値（挿入用）

このコマンドのターゲットテーブルはUNIQUE KEYモデルテーブルである必要があります。

## Syntax

```sql
MERGE INTO <target_table>
    USING <source>
    ON <join_expr>
    { matchedClause | notMatchedClause } [ ... ]
```
どこで

```sql
matchedClause ::=
    WHEN MATCHED
        [ AND <case_predicate> ]
        THEN { UPDATE SET <col_name> = <expr> [ , <col_name> = <expr> ... ] | DELETE } 
```
```sql
notMatchedClause ::=
    WHEN NOT MATCHED
        [ AND <case_predicate> ]
        THEN INSERT [ ( <col_name> [ , ... ] ) ] VALUES ( <expr> [ , ... ] )
```
## Parameters

**\<target_table\>**

> マージ対象のテーブルを指定します。

**\<source\>**

> ターゲットテーブルと結合するテーブルまたはサブクエリを指定します。

**\<join_expr\>**

> ターゲットテーブルとソースを結合する際の式を指定します。

### matchedClause（更新または削除用）

**WHEN MATCHED ... AND \<case_predicate\>**

> オプションで式を指定します。この式がtrueの場合、マッチングケースが実行されます。  
> デフォルト: 値なし（マッチングケースは常に実行される）

**WHEN MATCHED ... THEN { UPDATE SET ... | DELETE }**

> 値がマッチした場合に実行するアクションを指定します。

**SET col_name = expr [ , col_name = expr ... ]**

> ターゲットテーブルの指定されたカラムを、新しいカラム値に対応する式を使用して更新します（ターゲットとソースの両方のリレーションを参照可能）。  
> 単一のSETサブ句内で、更新する複数のカラムを指定できます。

**DELETE**

> ソースとマッチするターゲットテーブル内の行を削除します。

### notMatchedClause（挿入用）

**WHEN NOT MATCHED ... AND \<case_predicate\>**

> オプションで式を指定します。この式がtrueの場合、非マッチングケースが実行されます。
> デフォルト: 値なし（非マッチングケースは常に実行される）

**WHEN NOT MATCHED ... THEN INSERT [ ( col_name [ , ... ] ) ] VALUES ( expr [ , ... ] )**

> 値がマッチしない場合に実行するアクションを指定します。

**( col_name [ , ... ] )**

> オプションでターゲットテーブル内の1つ以上のカラムを指定し、ソースからの値で挿入します。
> デフォルト: 値なし（ターゲットテーブル内のすべてのカラムが挿入される）

**VALUES ( expr [ , ... ] )**

> 挿入されるカラム値に対応する式を指定します（ソースリレーションを参照する必要がある）。

## Access Control Requirements

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | Description |
| :---------------- | :------------ | :- |
| SELECT_PRIV       | target table and source |  |
| LOAD_PRIV       | target table |  |

## Usage Note

- このコマンドのターゲットテーブルはUNIQUE KEYモデルテーブルである必要があります。
- 単一のMERGE文には、複数のマッチングおよび非マッチング句を含めることができます（つまり、WHEN MATCHED ...とWHEN NOT MATCHED ...）。
- ANDサブ句を省略するマッチングまたは非マッチング句（デフォルト動作）は、文内でそのクラウズタイプの最後でなければなりません（例えば、WHEN MATCHED ...句の後にWHEN MATCHED AND ...句を続けることはできません）。このようにするとアクセスできないケースが生じ、エラーが返されます。

### Duplicate join behavior¶

現在、Dorisは重複する結合行が発生するかどうかを検出しません。重複が発生した場合、動作は未定義です。

結合後、同一のターゲットテーブル行に対して複数の操作（更新、削除、挿入など）が同時に適用される場合、動作はINSERT文と似ています：Sequenceカラムが存在する場合、最終的に書き込まれるデータはSequenceカラムの値によって決定されます。そうでなければ、いずれかの行が任意に書き込まれます。

## Examples

以下の例では、基本的なマージ操作を実行し、ソーステーブルの値を使用してターゲットテーブルのデータを更新します。まず、2つのテーブルを作成してロードします：

```sql
CREATE TABLE `merge_into_source_table` (
      `c1` int NULL,
      `c2` varchar(255) NULL
    ) ENGINE=OLAP
    PROPERTIES (
      "replication_allocation" = "tag.location.default: 1"
    );

CREATE TABLE `merge_into_target_base_table` (
      `c1` int NULL,
      `c2` varchar(255) NULL
    ) ENGINE=OLAP
    UNIQUE KEY(`c1`)
    DISTRIBUTED BY HASH(`c1`)
    PROPERTIES (
      "replication_allocation" = "tag.location.default: 1"
    );

INSERT INTO merge_into_source_table VALUES (1, 12), (2, 22), (3, 33);
INSERT INTO merge_into_target_base_table VALUES (1, 1), (2, 10);
```
テーブル内の値を表示する：

```sql
SELECT * FROM merge_into_source_table;
```
```
+----+----+
| c1 | c2 |
+----+----+
| 1  | 12 |
| 2  | 22 |
| 3  | 33 |
+----+----+
```
```sql
SELECT * FROM merge_into_target_base_table;
```
```
+----+----+
| c1 | c2 |
+----+----+
| 2  | 10 |
| 1  | 1  |
+----+----+
```
MERGE文を実行します：

```sql
WITH tmp AS (SELECT * FROM merge_into_source_table)
MERGE INTO merge_into_target_base_table t1
    USING tmp t2
    ON t1.c1 = t2.c1
    WHEN MATCHED AND t1.c2 = 10 THEN DELETE
    WHEN MATCHED THEN UPDATE SET c2 = 10
    WHEN NOT MATCHED THEN INSERT VALUES(t2.c1, t2.c2)
```
ターゲットテーブルに新しい値を表示します（ソーステーブルは変更されません）：

```sql
SELECT * FROM merge_into_target_base_table;
```
```
+----+----+
| c1 | c2 |
+----+----+
| 3  | 33 |
| 1  | 10 |
+----+----+
```
