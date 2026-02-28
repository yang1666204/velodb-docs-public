---
{
  "title": "ALTER TABLE COLUMN",
  "description": "この文は既存のTableに対してスキーマ変更操作を実行するために使用されます。スキーマ変更は非同期で実行され、",
  "language": "ja"
}
---
## 説明

このステートメントは既存のTableに対してスキーマ変更操作を実行するために使用されます。スキーマ変更は非同期で実行され、タスクが正常に送信されるとタスクが返されます。その後、[SHOW ALTER TABLE COLUMN](../../../../sql-manual/sql-statements/table-and-view/table/SHOW-ALTER-TABLE)コマンドを使用して進捗を確認できます。

DorisにはTable構築後にマテリアライズドインデックスという概念があります。Table構築が成功した後、それはベースTableとなり、マテリアライズドインデックスはベースインデックスとなります。rollupインデックスはベースTableに基づいて作成できます。ベースインデックスとrollupインデックスの両方がマテリアライズドインデックスです。スキーマ変更操作中にrollup_index_nameが指定されていない場合、操作はデフォルトでベースTableに基づいて実行されます。

:::tip
Doris 1.2.0では軽量なスケール構造変更のためのlight schema changeをサポートし、値列の加算および減算操作をより迅速かつ同期的に完了できます。Table作成時に手動で"light_schema_change" = 'true'を指定できます。このパラメータはバージョン2.0.0以降ではデフォルトで有効になっています。
:::

### 文法：

```sql
ALTER TABLE [database.]table alter_clause;
```
schema変更のalter_clauseは以下の変更方法をサポートしています：

**1. 指定されたインデックスの指定された位置にカラムを追加する**

**文法**

```sql
ALTER TABLE [database.]table table_name ADD COLUMN column_name column_type [KEY | agg_type] [DEFAULT "default_value"]
[AFTER column_name|FIRST]
[TO rollup_index_name]
[PROPERTIES ("key"="value", ...)]
```
**Example**
  
1. key_1の後にキー列new_colをexample_db.my_tableに追加する（非集約モデル）

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN new_col INT KEY DEFAULT "0" AFTER key_1;
  ```
2. example_db.my_tableのvalue_1の後に値列new_colを追加する（非集計モデル）

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN new_col INT DEFAULT "0" AFTER value_1;
  ```
3. example_db.my_table の key_1 の後にキーカラム new_col（aggregate model）を追加する

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN new_col INT KEY DEFAULT "0" AFTER key_1;
  ```
4. example_db.my_tableのvalue_1の後にvalue列を追加する new_col SUM集約タイプ（集約モデル）

  ```sql
  ALTER TABLE example_db.my_table   
  ADD COLUMN new_col INT SUM DEFAULT "0" AFTER value_1; 
  ```
5. new_colをexample_db.my_tableTableの最初の列位置に追加する（非集約モデル）

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN new_col INT KEY DEFAULT "0" FIRST;
  ```
:::tip 
- aggregation modelにvalue columnを追加する場合、agg_typeを指定する必要があります
- 非集約モデル（DUPLICATE KEYなど）の場合、key columnを追加する際はKEYキーワードを指定する必要があります
- base indexに既に存在するcolumnをrollup indexに追加することはできません（必要に応じてrollup indexを再作成できます）
:::


**2. 指定されたindexに複数のcolumnを追加する**

**文法**

```sql
ALTER TABLE [database.]table table_name ADD COLUMN (column_name1 column_type [KEY | agg_type] DEFAULT "default_value", ...)
[TO rollup_index_name]
[PROPERTIES ("key"="value", ...)]
```
**例**

1. example_db.my_tableに複数のカラムを追加します。ここで、new_colとnew_col2はSUM集計タイプです（集計モデル）

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN (new_col1 INT SUM DEFAULT "0" ,new_col2 INT SUM DEFAULT "0");
  ```
2. example_db.my_table（非集約モデル）に複数の列を追加します。ここで、new_col1がKEY列、new_col2がvalue列となります

  ```sql
  ALTER TABLE example_db.my_table
  ADD COLUMN (new_col1 INT key DEFAULT "0" , new_col2 INT DEFAULT "0");
  ```
:::tip
  - aggregationモデルにvalue列を追加する場合、agg_typeを指定する必要があります
  - aggregationモデルにkey列を追加する場合、KEYキーワードを指定する必要があります
  - base indexに既に存在する列をrollup indexに追加することはできません（必要に応じてrollup indexを再作成できます）
:::

**3. 指定されたindexから列を削除する**

**文法**

  ```sql
  ALTER TABLE [database.]table table_name DROP COLUMN column_name
  [FROM rollup_index_name]
  ```
**Example**

1. example_db.my_table から列 col1 を削除する

  ```sql
  ALTER TABLE example_db.my_table DROP COLUMN col1;
  ```
:::tip
  - パーティションカラムを削除することはできません
  - 集約モデルではKEYカラムを削除することはできません
  - ベースインデックスからカラムが削除された場合、rollupインデックスに含まれていても削除されます
:::

**4. 指定されたインデックスのカラムタイプとカラム位置を変更する**

**文法**

```sql
ALTER TABLE [database.]table table_name MODIFY COLUMN column_name column_type [KEY | agg_type] [NULL | NOT NULL] [DEFAULT "default_value"]
[AFTER column_name|FIRST]
[FROM rollup_index_name]
[PROPERTIES ("key"="value", ...)]
```
**Example**
  
1. ベースインデックスのキー列col1の型をBIGINTに変更し、col2列の後ろに移動する

  ```sql
  ALTER TABLE example_db.my_table 
  MODIFY COLUMN col1 BIGINT KEY DEFAULT "1" AFTER col2;
  ```
:::tip
キーカラムまたは値カラムを変更する場合、完全なカラム情報を宣言する必要があります
:::

2. base indexのval1カラムの最大長を変更します。元のval1は (val1 VARCHAR(32) REPLACE DEFAULT "abc") です

  ```sql
  ALTER TABLE example_db.my_table 
  MODIFY COLUMN val1 VARCHAR(64) REPLACE DEFAULT "abc";
  ```
:::tip
カラムのデータ型のみを変更できます。カラムの他の属性は変更されずに残る必要があります。
:::

3. Duplicate keyTableのKeyカラム内のフィールドの長さを変更する

  ```sql
  ALTER TABLE example_db.my_table 
  MODIFY COLUMN k3 VARCHAR(50) KEY NULL COMMENT 'to 50';
  ```
:::tip
  - aggregation modelでvalueカラムを変更する場合は、agg_typeを指定する必要があります
  - 非集約タイプでkeyカラムを変更する場合は、KEYキーワードを指定する必要があります
  - カラムのタイプのみ変更可能で、カラムの他の属性はそのまま保持されます（つまり、他の属性は元の属性に従ってステートメント内で明示的に記述する必要があります。例8を参照）
  - パーティショニングおよびバケッティングカラムは一切変更できません
  - 現在、以下のタイプの変換がサポートされています（精度の損失はユーザーが保証します）
    - TINYINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEタイプのより大きな数値タイプへの変換
    - TINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLE/DECIMALのVARCHARへの変換
    - VARCHARは最大長の変更をサポート
    - VARCHAR/CHARのTINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEへの変換
    - VARCHAR/CHARのDATEへの変換（現在"%Y-%m-%d"、"%y-%m-%d"、"%Y%m%d"、"%y%m%d"、"%Y/%m/%d"、"%y/%m/%d"の6つの形式をサポート）
    - DATETIMEのDATEへの変換（年月日情報のみ保持、例：`2019-12-09 21:47:05` <--> `2019-12-09`）
    - DATEのDATETIMEへの変換（時分秒は自動的にゼロで埋められます、例：`2019-12-09` <--> `2019-12-09 00:00:00`）
    - FLOATのDOUBLEへの変換
    - INTのDATEへの変換（INTタイプのデータが不正な場合、変換は失敗し、元のデータは変更されません）
    - DATEとDATETIMEを除くすべてがSTRINGに変換可能ですが、STRINGは他のタイプに変換できません
:::

**5. 指定されたインデックスでカラムを並べ替え**

**文法**

  ```sql
  ALTER TABLE [database.]table table_name ORDER BY (column_name1, column_name2, ...)
  [FROM rollup_index_name]
  [PROPERTIES ("key"="value", ...)]
  ```
**Example**
  
1. example_db.my_table（非集約モデル）のキーと値の列の順序を調整する

  ```sql
  CREATE TABLE `my_table`(
  `k_1` INT NULL,
  `k_2` INT NULL,
  `v_1` INT NULL,
  `v_2` varchar NULL,
  `v_3` varchar NULL
  ) ENGINE=OLAP
  DUPLICATE KEY(`k_1`, `k_2`)
  COMMENT 'OLAP'
  DISTRIBUTED BY HASH(`k_1`) BUCKETS 5
  PROPERTIES (
  "replication_allocation" = "tag.location.default: 1"
  );

  ALTER TABLE example_db.my_table ORDER BY (k_2,k_1,v_3,v_2,v_1);

  mysql> desc my_table;
  +-------+------------+------+-------+---------+-------+
  | Field | タイプ       | Null | Key   | Default | Extra |
  +-------+------------+------+-------+---------+-------+
  | k_2   | INT        | Yes  | true  | NULL    |       |
  | k_1   | INT        | Yes  | true  | NULL    |       |
  | v_3   | VARCHAR(*) | Yes  | false | NULL    | NONE  |
  | v_2   | VARCHAR(*) | Yes  | false | NULL    | NONE  |
  | v_1   | INT        | Yes  | false | NULL    | NONE  |
  +-------+------------+------+-------+---------+-------+
  ```
2. 2つのアクションを同時に実行する

  ```sql
  CREATE TABLE `my_table` (
  `k_1` INT NULL,
  `k_2` INT NULL,
  `v_1` INT NULL,
  `v_2` varchar NULL,
  `v_3` varchar NULL
  ) ENGINE=OLAP
  DUPLICATE KEY(`k_1`, `k_2`)
  COMMENT 'OLAP'
  DISTRIBUTED BY HASH(`k_1`) BUCKETS 5
  PROPERTIES (
  "replication_allocation" = "tag.location.default: 1"
  );

  ALTER TABLE example_db.my_table
  ADD COLUMN col INT DEFAULT "0" AFTER v_1,
  ORDER BY (k_2,k_1,v_3,v_2,v_1,col);

  mysql> desc my_table;
  +-------+------------+------+-------+---------+-------+
  | Field | タイプ       | Null | Key   | Default | Extra |
  +-------+------------+------+-------+---------+-------+
  | k_2   | INT        | Yes  | true  | NULL    |       |
  | k_1   | INT        | Yes  | true  | NULL    |       |
  | v_3   | VARCHAR(*) | Yes  | false | NULL    | NONE  |
  | v_2   | VARCHAR(*) | Yes  | false | NULL    | NONE  |
  | v_1   | INT        | Yes  | false | NULL    | NONE  |
  | col   | INT        | Yes  | false | 0       | NONE  |
  +-------+------------+------+-------+---------+-------+
  ```
:::tip
  - インデックス内のすべての列が書き出されます
  - value列はkey列の後に配置されます
  - key列の範囲内でのみkey列を調整できます。value列についても同様です
:::

## Keywords

```text
ALTER, TABLE, COLUMN, ALTER TABLE
```
## ベストプラクティス
