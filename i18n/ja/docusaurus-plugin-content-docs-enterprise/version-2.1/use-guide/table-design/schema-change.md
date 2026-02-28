---
{
  "title": "スキーマ変更",
  "description": "ユーザーはAlter Table操作を通じてDorisTableのスキーマを変更できます。スキーマ変更は主にカラムの変更とインデックスの変更を含みます。",
  "language": "ja"
}
---
ユーザーは、Alter Table 操作を通じて Doris Tableのスキーマを変更できます。スキーマ変更は主に列の変更とインデックスの変更に関わります。この記事では主に列に関するスキーマ変更を紹介します。インデックスに関する変更については、[Table Index](./index/index-overview.md) を参照してインデックスを変更するさまざまな方法を理解してください。

## 原理の紹介

Doris は2種類のスキーマ変更操作をサポートします：軽量スキーマ変更と重量スキーマ変更です。違いは主に実行プロセスの複雑さ、実行速度、リソース消費にあります。

| 機能             | 軽量スキーマ変更 | 重量スキーマ変更 |
|---------------------|---------------------------|---------------------------|
| 実行速度      | 秒（ほぼリアルタイム） | 分、時間、日（Table内のデータ量に依存；データが大きいほど実行が遅くなる） |
| データの書き換えが必要  | いいえ                        | はい、データファイルの書き換えを伴う |
| システムパフォーマンスへの影響 | 最小限               | システムパフォーマンスに影響を与える可能性があり、特にデータ変換中 |
| リソース消費  | 低                       | 高、データを再編成するために計算リソースを消費し、プロセスに関わるTableのデータが占めるストレージ容量が2倍になる |
| 操作タイプ      | 値列の追加・削除、列名の変更、VARCHAR 長の変更 | 列のデータタイプの変更、主キーの変更、列の順序の変更など |

### 軽量スキーマ変更

軽量スキーマ変更とは、データの書き換えを伴わない単純なスキーマ変更操作を指します。これらの操作は通常メタデータレベルで実行され、データファイルの物理的な変更を伴わずにTableのメタデータを変更するだけで済みます。軽量スキーマ変更操作は通常数秒で完了し、システムパフォーマンスに大きな影響を与えません。軽量スキーマ変更には以下が含まれます：

- 値列の追加または削除
- 列名の変更
- VARCHAR 列の長さの変更（UNIQUE および DUP Tableのキー列を除く）

### 重量スキーマ変更

重量スキーマ変更は、データファイルの書き換えや変換を伴い、これらの操作は比較的複雑で、通常 Doris の Backend (BE) の支援を必要として実際のデータ変更や再編成を実行します。重量スキーマ変更操作は通常Tableのデータ構造への深い変更を伴い、ストレージの物理的レイアウトに影響を与える可能性があります。軽量スキーマ変更をサポートしない全ての操作は重量スキーマ変更に分類されます。例えば：

- 列のデータタイプの変更
- 列の順序の変更

重量操作はバックグラウンドでデータ変換のタスクを開始します。バックグラウンドタスクはTableの各 tablet を変換し、tablet 単位で元のデータを新しいデータファイルに書き換えます。データ変換プロセス中に「二重書き込み」現象が発生する可能性があり、新しいデータが新しい tablet と古い tablet の両方に同時に書き込まれます。データ変換が完了すると、古い tablet は削除され、新しい tablet がそれに置き換わります。

## ジョブ管理
### ジョブの表示

ユーザーは `SHOW ALTER TABLE COLUMN` コマンドを通じてスキーマ変更ジョブの進行状況を表示できます。このコマンドにより、ユーザーは現在実行中または完了したスキーマ変更ジョブを確認できます。スキーマ変更ジョブがマテリアライズドビューを伴う場合、このコマンドは複数行を表示し、各行がマテリアライズドビューに対応します。例は以下の通りです：

```sql
mysql > SHOW ALTER TABLE COLUMN\G;
*************************** 1. row ***************************
        JobId: 20021
    TableName: tbl1
   CreateTime: 2019-08-05 23:03:13
   FinishTime: 2019-08-05 23:03:42
    IndexName: tbl1
      IndexId: 20022
OriginIndexId: 20017
SchemaVersion: 2:792557838
TransactionId: 10023
        State: FINISHED
          Msg:
     Progress: NULL
      Timeout: 86400
1 row in set (0.00 sec)
```
### ジョブのキャンセル

ジョブのステータスがFINISHEDまたはCANCELLEDではない場合、以下のコマンドを使用してスキーマ変更ジョブをキャンセルできます：

```sql
CANCEL ALTER TABLE COLUMN FROM tbl_name;
```
## 使用例

### カラム名の変更

```sql
ALTER TABLE [database.]table RENAME COLUMN old_column_name new_column_name;
```
特定の構文については、ALTER TABLE RENAMEを参照してください。

### カラムの追加

- 集計モデルがvalueカラムを追加する場合、`agg_type`を指定する必要があります。

- 非集計モデル（DUPLICATE KEYなど）がkeyカラムを追加する場合、KEYキーワードを指定する必要があります。

*非集計Tableへのカラム追加*

1. Table作成文

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    col1 int,
    col2 int,
    col3 int,
    col4 int,
    col5 int
) DUPLICATE KEY(col1, col2, col3)
DISTRIBUTED BY RANDOM BUCKETS 10;
```
2. `example_db.my_table`の`col1`の後にキー列`key_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN key_col INT KEY DEFAULT "0" AFTER col1;
```
3. `example_db.my_table`の`col4`の後に値列`value_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN value_col INT DEFAULT "0" AFTER col4;
```
*集約Tableへのカラムの追加*

1. Create table文

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    col1 int,
    col2 int,
    col3 int,
    col4 int SUM,
    col5 varchar(32) REPLACE DEFAULT "abc"
) AGGREGATE KEY(col1, col2, col3)
DISTRIBUTED BY HASH(col1) BUCKETS 10;
```
2. `example_db.my_table`の`col1`の後にキー列`key_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN key_col INT DEFAULT "0" AFTER col1;
```
3. `example_db.my_table`の`col4`の後に、SUM集計タイプの値列`value_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN value_col INT SUM DEFAULT "0" AFTER col4;
```
### 複数のカラムの追加

- 集約モデルが値カラムを追加する場合、`agg_type`を指定する必要があります。

- 集約モデルがキーカラムを追加する場合、KEYキーワードを指定する必要があります。

*集約Tableへの複数カラムの追加*

1. Table作成文

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    col1 int,
    col2 int,
    col3 int,
    col4 int SUM,
    col5 varchar(32) REPLACE DEFAULT "abc"
) AGGREGATE KEY(col1, col2, col3)
DISTRIBUTED BY HASH(col1) BUCKETS 10;
```
2. `example_db.my_table`（集約モデル）に複数の列を追加する

```sql
ALTER TABLE example_db.my_table
ADD COLUMN (c1 INT DEFAULT "1", c2 FLOAT SUM DEFAULT "0");
```
### Delete Column

- パーティションカラムは削除できません。

- UNIQUE keyカラムは削除できません。

`example_db.my_table`からカラムを削除するには

1. Table作成文

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    col1 int,
    col2 int,
    col3 int,
    col4 int SUM,
    col5 varchar(32) REPLACE DEFAULT "abc"
) AGGREGATE KEY(col1, col2, col3)
DISTRIBUTED BY HASH(col1) BUCKETS 10;
```
2. `example_db.my_table`から`col4`列を削除する

```sql
ALTER TABLE example_db.my_table DROP COLUMN col4;
```
### カラムタイプと位置の変更

- 集計モデルが値カラムを変更する場合、`agg_type`を指定する必要があります。

- 非集計タイプがキーカラムを変更する場合、**KEY**キーワードを指定する必要があります。

- カラムのタイプのみ変更可能です。カラムの他の属性は同じままにする必要があります。
- パーティションカラムとバケットカラムは変更できません。

- 現在、以下のタイプ変換がサポートされています（ユーザーは精度の損失に注意する必要があります）：

  - TINYINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEタイプは、より大きな数値タイプに変換できます。

  - TINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLE/DECIMALはVARCHARに変換できます。

  - VARCHARは最大長の変更をサポートしています。

  - VARCHAR/CHARはTINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEに変換できます。

  - VARCHAR/CHARはDATEに変換できます（現在6つの形式をサポート："%Y-%m-%d"、"%y-%m-%d"、"%Y%m%d"、"%y%m%d"、"%Y/%m/%d"、"%y/%m/%d"）。

  - DATETIMEはDATEに変換できます（年月日の情報のみ保持、例：`2019-12-09 21:47:05` <--> `2019-12-09`）。

  - DATEはDATETIMEに変換できます（時、分、秒は自動的にゼロに設定、例：`2019-12-09` <--> `2019-12-09 00:00:00`）。

  - FLOATはDOUBLEに変換できます。

  - INTはDATEに変換できます（INTタイプのデータが無効な場合、変換は失敗し、元のデータは変更されません）。

  - DATEとDATETIME以外のすべてのタイプはSTRINGに変換できますが、STRINGは他のタイプに変換できません。

1. Table作成ステートメント

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    col0 int,
    col1 int DEFAULT "1",
    col2 int,
    col3 varchar(32),
    col4 int SUM,
    col5 varchar(32) REPLACE DEFAULT "abc"
) AGGREGATE KEY(col0, col1, col2, col3)
DISTRIBUTED BY HASH(col0) BUCKETS 10;
```
2. キー列 `col1` の型を BIGINT に変更し、列 `col2` の後に移動する

```sql
ALTER TABLE example_db.my_table 
MODIFY COLUMN col1 BIGINT KEY DEFAULT "1" AFTER col2;
```
注意: キー列を変更する場合でも値列を変更する場合でも、完全な列情報を宣言する必要があります。

3. ベースTableの`val1`列の最大長を変更します。元の`val1`は(val1 VARCHAR(32) REPLACE DEFAULT "abc")でした。

```sql
ALTER TABLE example_db.my_table 
MODIFY COLUMN col5 VARCHAR(64) REPLACE DEFAULT "abc";
```
注意: 列のタイプのみ変更できます。列の他の属性は同じままにしておく必要があります。

4. キー列のフィールドの長さを変更する

```sql
ALTER TABLE example_db.my_table
MODIFY COLUMN col3 varchar(50) KEY NULL comment 'to 50';
```
### Reorder

- すべての列を記載する必要があります。
- Value列はkey列の後に配置する必要があります。

1. Create table文

```sql
CREATE TABLE IF NOT EXISTS example_db.my_table(
    k1 int DEFAULT "1",
    k2 int,
    k3 varchar(32),
    k4 date,
    v1 int SUM,
    v2 int MAX,
) AGGREGATE KEY(k1, k2, k3, k4)
DISTRIBUTED BY HASH(k1) BUCKETS 10;
```
2. `example_db.my_table`の列を並び替える

```sql
ALTER TABLE example_db.my_table
ORDER BY (k3,k1,k2,k4,v2,v1);
```
## 制限事項

- Tableでは、同時に実行できるスキーマ変更ジョブは1つだけです。

- パーティションカラムとバケットカラムは変更できません。

- 集約TableでREPLACEメソッドを使用して集約された値カラムがある場合、キーカラムは削除できません。

- ユニークTableではキーカラムを削除できません。

- SUMまたはREPLACEの集約タイプで値カラムを追加する場合、そのカラムのデフォルト値は履歴データに対して意味を持ちません。

- 履歴データは詳細情報を失っているため、デフォルト値は実際には集約された値を反映できません。

- カラムタイプを変更する場合、Type以外のすべてのフィールドは元のカラムの情報で補完する必要があります。

- 新しいカラムタイプを除いて、集約メソッド、Nullable属性、およびデフォルト値は元の情報に従って補完する必要があることに注意してください。

- 集約タイプ、Nullable属性、およびデフォルト値の変更はサポートされていません。

## 関連設定

### FE設定

- `alter_table_timeout_second`: ジョブのデフォルトタイムアウト、86400秒。

### BE設定

- `alter_tablet_worker_count`: BE側で履歴データ変換を実行するために使用されるスレッド数。デフォルトは3です。スキーマ変更ジョブを高速化したい場合は、このパラメータを適切に増加させてBEを再起動できます。ただし、変換スレッドが多すぎるとIO圧迫が増加し、他の操作に影響を与える可能性があります。

- `alter_index_worker_count`: BE側で履歴データのインデックス構築を実行するために使用されるスレッド数（注意：現在は転置インデックスのみサポート）。デフォルトは3です。インデックス変更ジョブを高速化したい場合は、このパラメータを適切に増加させてBEを再起動できます。ただし、スレッドが多すぎるとIO圧迫が増加し、他の操作に影響を与える可能性があります。
