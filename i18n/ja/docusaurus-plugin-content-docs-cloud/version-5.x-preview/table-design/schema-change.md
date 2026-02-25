---
{
  "title": "スキーマ変更",
  "description": "ユーザーはAlter Table操作を通じてDorisテーブルのスキーマを変更できます。スキーマ変更は主にカラムの変更とインデックスの変更を含みます。",
  "language": "ja"
}
---
ユーザーは[Alter Table](../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-COLUMN.md)操作を通じてDorisテーブルのスキーマを変更できます。スキーマ変更は主にカラムの変更とインデックスの変更を含みます。この記事では主にカラム関連のスキーマ変更について紹介します。インデックス関連の変更については、[Table Index](./index/index-overview.md)を参照してインデックスを変更する様々な方法について理解してください。

## 原理の紹介

Dorisは2種類のスキーマ変更操作をサポートしています：軽量スキーマ変更と重量スキーマ変更です。主な違いは実行プロセスの複雑さ、実行速度、リソース消費にあります。

| 特徴             | 軽量スキーマ変更 | 重量スキーマ変更 |
|---------------------|---------------------------|---------------------------|
| 実行速度      | 数秒（ほぼリアルタイム） | 数分、数時間、数日（テーブル内のデータ量に依存；データが多いほど実行が遅くなる） |
| データ再書き込みが必要  | なし                        | あり、データファイルの再書き込みを伴う |
| システムパフォーマンスへの影響 | 最小限               | システムパフォーマンスに影響する可能性があり、特にデータ変換中 |
| リソース消費  | 低い                       | 高い、データを再編成するため計算リソースを消費し、プロセスに関与するテーブルデータが占有するストレージ容量が倍になる |
| 操作タイプ      | value列の追加・削除、列名変更、VARCHAR長の変更 | 列のデータタイプ変更、主キー変更、列順序の変更など |

### 軽量スキーマ変更

軽量スキーマ変更とは、データの再書き込みを伴わない単純なスキーマ変更操作を指します。これらの操作は通常メタデータレベルで実行され、テーブルのメタデータを変更するだけで、データファイルの物理的な変更は伴いません。軽量スキーマ変更操作は通常数秒で完了し、システムパフォーマンスに大きな影響を与えません。軽量スキーマ変更には以下が含まれます：

- value列の追加または削除
- 列名の変更
- VARCHAR列の長さの変更（UNIQUEおよびDUPテーブルのキー列を除く）

### 重量スキーマ変更

重量スキーマ変更はデータファイルの再書き込みまたは変換を伴い、これらの操作は比較的複雑で、通常DorisのBackend（BE）の支援を必要として実際のデータ変更や再編成を実行します。重量スキーマ変更操作は通常テーブルのデータ構造に深い変更を伴い、ストレージの物理レイアウトに影響を与える可能性があります。軽量スキーマ変更をサポートしない全ての操作は重量スキーマ変更に該当します：

- 列のデータタイプの変更
- 列の順序の変更

重量操作はバックグラウンドでデータ変換のタスクを開始します。バックグラウンドタスクはテーブルの各tabletを変換し、元のデータをtablet単位で新しいデータファイルに再書き込みします。データ変換プロセス中に「二重書き込み」現象が発生する可能性があり、新しいデータが新しいtabletと古いtabletの両方に同時に書き込まれます。データ変換が完了すると、古いtabletは削除され、新しいtabletがそれを置き換えます。

## ジョブ管理
### ジョブの確認

ユーザーは[`SHOW ALTER TABLE COLUMN`](../sql-manual/sql-statements/table-and-view/table/SHOW-ALTER-TABLE.md)コマンドを通じてスキーマ変更ジョブの進捗を確認できます。このコマンドにより、ユーザーは現在実行中または完了したスキーマ変更ジョブを確認できます。スキーマ変更ジョブがマテリアライズドビューを含む場合、このコマンドは複数行を表示し、それぞれがマテリアライズドビューに対応します。例は以下の通りです：

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

ジョブステータスがFINISHEDまたはCANCELLEDでない場合、以下のコマンドを使用してスキーマ変更ジョブをキャンセルできます：

```sql
CANCEL ALTER TABLE COLUMN FROM tbl_name;
```
## 使用例

### カラム名の変更

```sql
ALTER TABLE [database.]table RENAME COLUMN old_column_name new_column_name;
```
特定の構文については、[ALTER TABLE RENAME](../sql-manual/sql-statements/table-and-view/table/ALTER-TABLE-RENAME)を参照してください。

### カラムの追加

- 集計モデルでvalue columnを追加する場合、`agg_type`を指定する必要があります。

- 非集計モデル（DUPLICATE KEYなど）でkey columnを追加する場合、KEYキーワードを指定する必要があります。

*非集計テーブルへのカラム追加*

1. テーブル作成文

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
3. `example_db.my_table`の`col4`の後に値カラム`value_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN value_col INT DEFAULT "0" AFTER col4;
```
*集約テーブルへの列の追加*

1. テーブル作成文

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
3. `example_db.my_table`の`col4`の後にSUM集約タイプの値列`value_col`を追加する

```sql
ALTER TABLE example_db.my_table ADD COLUMN value_col INT SUM DEFAULT "0" AFTER col4;
```
### 複数列の追加

- 集約モデルが値列を追加する場合、`agg_type`を指定する必要があります。

- 集約モデルがキー列を追加する場合、KEYキーワードを指定する必要があります。

*集約テーブルへの複数列の追加*

1. テーブル作成文

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
2. `example_db.my_table`（aggregateモデル）に複数のカラムを追加する

```sql
ALTER TABLE example_db.my_table
ADD COLUMN (c1 INT DEFAULT "1", c2 FLOAT SUM DEFAULT "0");
```
### Delete Column

- パーティションカラムは削除できません。

- UNIQUE keyカラムは削除できません。

`example_db.my_table`からカラムを削除するには

1. テーブル作成文

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

- 集約モデルで値カラムを変更する場合、`agg_type`を指定する必要があります。

- 非集約タイプでキーカラムを変更する場合、**KEY**キーワードを指定する必要があります。

- カラムのタイプのみ変更可能です。カラムの他の属性は同じままでなければなりません。

- パーティションカラムとバケットカラムは変更できません。

- 現在サポートされている型変換は以下の通りです（ユーザーは精度の損失に注意する必要があります）：

  - TINYINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEタイプは、より大きな数値タイプに変換できます。

  - TINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLE/DECIMALはVARCHARに変換できます。

  - VARCHARは最大長の変更をサポートしています。

  - VARCHAR/CHARはTINTINT/SMALLINT/INT/BIGINT/LARGEINT/FLOAT/DOUBLEに変換できます。

  - VARCHAR/CHARはDATEに変換できます（現在6つのフォーマットをサポート："%Y-%m-%d"、"%y-%m-%d"、"%Y%m%d"、"%y%m%d"、"%Y/%m/%d"、"%y/%m/%d"）。

  - DATETIMEはDATEに変換できます（年月日の情報のみ保持、例：`2019-12-09 21:47:05` <--> `2019-12-09`）。

  - DATEはDATETIMEに変換できます（時、分、秒は自動的にゼロに設定、例：`2019-12-09` <--> `2019-12-09 00:00:00`）。

  - FLOATはDOUBLEに変換できます。

  - INTはDATEに変換できます（INTタイプのデータが無効な場合、変換は失敗し、元のデータは変更されません）。

  - DATEとDATETIMEを除くすべてのタイプはSTRINGに変換できますが、STRINGは他のタイプに変換できません。

1. テーブル作成文

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
2. キー列`col1`の型をBIGINTに変更し、列`col2`の後に移動する

```sql
ALTER TABLE example_db.my_table 
MODIFY COLUMN col1 BIGINT KEY DEFAULT "1" AFTER col2;
```
注意：キーカラムまたは値カラムを変更する場合、完全なカラム情報を宣言する必要があります。

3. ベーステーブル内の`val1`カラムの最大長を変更します。元の`val1`は (val1 VARCHAR(32) REPLACE DEFAULT "abc") でした。

```sql
ALTER TABLE example_db.my_table 
MODIFY COLUMN col5 VARCHAR(64) REPLACE DEFAULT "abc";
```
注意: 列のタイプのみ変更可能です。列の他の属性は同じままにする必要があります。

4. キー列内のフィールドの長さを変更する

```sql
ALTER TABLE example_db.my_table
MODIFY COLUMN col3 varchar(50) KEY NULL comment 'to 50';
```
### Reorder

- すべての列をリストする必要があります。
- 値列はキー列の後に配置する必要があります。

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

- テーブルでは同時に実行できるスキーマ変更ジョブは1つのみです。

- パーティションカラムとバケットカラムは変更できません。

- 集約テーブルでREPLACEメソッドを使用して集約された値カラムがある場合、キーカラムは削除できません。

- ユニークテーブルではキーカラムを削除できません。

- SUMまたはREPLACEの集約タイプを持つ値カラムを追加する場合、そのカラムのデフォルト値は履歴データに対して意味を持ちません。

- 履歴データは詳細な情報が失われているため、デフォルト値は実際の集約値を反映することはできません。

- カラムタイプを変更する場合、Type以外のすべてのフィールドは元のカラムの情報で補完する必要があります。

- 新しいカラムタイプを除き、集約メソッド、Nullable属性、デフォルト値は元の情報に従って補完する必要があることに注意してください。

- 集約タイプ、Nullable属性、デフォルト値の変更はサポートされていません。

## 関連設定

### FE設定

- `alter_table_timeout_second`: ジョブのデフォルトタイムアウト、86400秒。

### BE設定

- `alter_tablet_worker_count`: BE側で履歴データ変換を実行するために使用されるスレッド数。デフォルトは3です。スキーマ変更ジョブを高速化したい場合は、このパラメータを適切に増加させてBEを再起動できます。ただし、変換スレッドが多すぎるとIO圧迫が増加し、他の操作に影響する可能性があります。

- `alter_index_worker_count`: BE側で履歴データのインデックス構築を実行するために使用されるスレッド数（注意：現在は転置インデックスのみサポート）。デフォルトは3です。インデックス変更ジョブを高速化したい場合は、このパラメータを適切に増加させてBEを再起動できます。ただし、スレッドが多すぎるとIO圧迫が増加し、他の操作に影響する可能性があります。
