---
{
  "title": "DELETE コマンドによるデータの削除",
  "description": "DELETE文は、MySQLプロトコルを通じて条件に基づいて指定されたテーブルまたはパーティションからデータを削除します。",
  "language": "ja"
}
---
`DELETE`文は、MySQLプロトコルを通じて条件に基づいて指定されたテーブルまたはパーティションからデータを削除します。シンプルな述語の組み合わせを使用して削除するデータを指定することをサポートし、また`USING`句を使用して主キーテーブルでの削除のために複数のテーブルを結合することもサポートします。

## フィルタ述語を指定した削除

```sql
DELETE FROM table_name [table_alias]
  [PARTITION partition_name | PARTITIONS (partition_name [, partition_name])]
  WHERE column_name op { value | value_list } [ AND column_name op { value | value_list } ...];
```
### 必須パラメータ

- `table_name`: データを削除するテーブル。

- `column_name`: `table_name`に属するカラム。

- `op`: 論理比較演算子。以下を含む: =, >, <, >=, <=, !=, in, not in。

- `value | value_list`: 論理比較のための値または値のリスト。

### オプションパラメータ

- `PARTITION partition_name | PARTITIONS (partition_name [, partition_name])`: データ削除を実行するパーティション名を指定します。テーブルにこのパーティションが存在しない場合、エラーが報告されます。

- `table_alias`: テーブルのエイリアス。

### 使用制限

- Aggregateテーブルモデルを使用する場合、条件はKeyカラムに対してのみ指定できます。選択したKeyカラムがRollupに存在しない場合、削除を実行できません。

- パーティションテーブルの場合、パーティションを指定する必要があります。指定されない場合、Dorisは条件からパーティションを推測します。

  - 2つのケースでDorisは条件からパーティションを推測できません:
    1. 条件にパーティションカラムが含まれていない。
    2. パーティションカラムの`op`が`not in`である。

  - パーティションテーブルがUniqueテーブルではなく、パーティションを指定しない、または条件からパーティションを推測できない場合、セッション変数`delete_without_partition`を`true`に設定する必要があり、削除操作はすべてのパーティションに適用されます。

### 例

**1. `my_table`のパーティション`p1`で、カラム`k1`の値が3である行を削除**

```sql
DELETE FROM my_table PARTITION p1
  WHERE k1 = 3;
```
**2. `my_table`のパーティション`p1`において、列`k1`の値が3以上かつ列`status`の値が"outdated"である行を削除する**

```sql
DELETE FROM my_table PARTITION p1
WHERE k1 >= 3 AND status = "outdated";
```
**3. `my_table`のパーティション`p1`および`p2`において、列`k1`の値が3以上かつ列`dt`の値が"2024-10-01"から"2024-10-31"の間にある行を削除する**

```sql
DELETE FROM my_table PARTITIONS (p1, p2)
WHERE k1 >= 3 AND dt >= "2024-10-01" AND dt <= "2024-10-31";
```
## `USING`句を使用した削除

一部のシナリオでは、削除するデータを正確に特定するために複数のテーブルを結合する必要があります。このような場合、`USING`句が非常に有用です。構文は以下の通りです：

```sql
DELETE FROM table_name [table_alias]
  [PARTITION partition_name | PARTITIONS (partition_name [, partition_name])]
  [USING additional_tables]
  WHERE condition
```
### 必須パラメータ

- `table_name`: データを削除するテーブル。
- `WHERE condition`: 削除する行を選択するための条件を指定します。

### オプションパラメータ

- `PARTITION partition_name | PARTITIONS (partition_name [, partition_name])`: データ削除を実行するパーティション名を指定します。テーブルにこのパーティションが存在しない場合、エラーが報告されます。
- `table_alias`: テーブルのエイリアス。

### 注意事項

- この形式はUNIQUE KEYモデルテーブルでのみ使用できます。

### 例

テーブル`t2`と`t3`の結合結果を使用して、`t1`からデータを削除します。削除対象のテーブルはuniqueモデルのみサポートしています。

```sql
-- Create tables t1, t2, t3
CREATE TABLE t1
  (id INT, c1 BIGINT, c2 STRING, c3 DOUBLE, c4 DATE)
UNIQUE KEY (id)
DISTRIBUTED BY HASH (id)
PROPERTIES('replication_num'='1', "function_column.sequence_col" = "c4");

CREATE TABLE t2
  (id INT, c1 BIGINT, c2 STRING, c3 DOUBLE, c4 DATE)
DISTRIBUTED BY HASH (id)
PROPERTIES('replication_num'='1');

CREATE TABLE t3
  (id INT)
DISTRIBUTED BY HASH (id)
PROPERTIES('replication_num'='1');

-- Insert data
INSERT INTO t1 VALUES
  (1, 1, '1', 1.0, '2000-01-01'),
  (2, 2, '2', 2.0, '2000-01-02'),
  (3, 3, '3', 3.0, '2000-01-03');

INSERT INTO t2 VALUES
  (1, 10, '10', 10.0, '2000-01-10'),
  (2, 20, '20', 20.0, '2000-01-20'),
  (3, 30, '30', 30.0, '2000-01-30'),
  (4, 4, '4', 4.0, '2000-01-04'),
  (5, 5, '5', 5.0, '2000-01-05');

INSERT INTO t3 VALUES
  (1),
  (4),
  (5);

-- Delete data from t1
DELETE FROM t1
  USING t2 INNER JOIN t3 ON t2.id = t3.id
  WHERE t1.id = t2.id;
```
期待される結果は、テーブル`t1`において`id`が`1`である行を削除することです。

```Plain
+----+----+----+--------+------------+
| id | c1 | c2 | c3     | c4         |
+----+----+----+--------+------------+
| 2  | 2  | 2  |    2.0 | 2000-01-02 |
| 3  | 3  | 3  |    3.0 | 2000-01-03 |
+----+----+----+--------+------------+
```
## 関連する設定

**タイムアウト設定**

- `insert_timeout`: delete操作はSQLコマンドであり、特別な負荷として扱われるため、deleteステートメントはSessionの`insert_timeout`値の影響を受けます。`SET insert_timeout = xxx`でタイムアウトを延長できます。単位は秒です。

**IN述語設定**

- `max_allowed_in_element_num_of_delete`: ユーザーが`in`述語で大量の要素を使用する必要がある場合、この項目を調整して許可される要素の上限を増やすことができます。デフォルト値は1024です。

## 履歴の表示

ユーザーは`SHOW DELETE`ステートメントを使用して、完了したdeleteレコードの履歴を表示できます。

構文は以下の通りです：

```sql
SHOW DELETE [FROM db_name]
```
Example:
```sql
mysql> show delete from test_db;
+-----------+---------------+---------------------+-----------------+----------+
| TableName | PartitionName | CreateTime          | DeleteCondition | State    |
+-----------+---------------+---------------------+-----------------+----------+
| empty_tbl | p3            | 2020-04-15 23:09:35 | k1 EQ "1"       | FINISHED |
| test_tbl  | p4            | 2020-04-15 23:09:53 | k1 GT "80"      | FINISHED |
+-----------+---------------+---------------------+-----------------+----------+
2 rows in set (0.00 sec)
```
## パフォーマンスに関する推奨事項

1. 詳細テーブル（Duplicate Key）および集約テーブル（Aggregate Key）では、削除操作は高速に実行されますが、短期間に大量の削除操作を行うとクエリパフォーマンスに影響します。

2. 主キーテーブル（Unique Key）では、削除操作は`INSERT INTO`文に変換されます。大きな範囲を削除する場合、実行速度は遅くなりますが、短期間に大量の削除操作を行ってもクエリパフォーマンスに大きな影響は与えません。

## 構文

詳細な削除構文については、DELETE構文マニュアルを参照してください。
