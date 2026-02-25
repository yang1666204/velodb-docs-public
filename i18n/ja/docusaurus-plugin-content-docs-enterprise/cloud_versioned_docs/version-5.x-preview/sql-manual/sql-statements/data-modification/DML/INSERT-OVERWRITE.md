---
{
  "title": "INSERT OVERWRITE",
  "description": "この文の機能は、テーブルまたはテーブルの一部のパーティションを上書きすることです",
  "language": "ja"
}
---
## 説明

このステートメントの機能は、テーブルまたはテーブルの一部のパーティションを上書きすることです。

```sql
INSERT OVERWRITE table table_name
    [ PARTITION (p1, ... | *) ]
    [ WITH LABEL label]
    [ (column [, ...]) ]
    [ [ hint [, ...] ] ]
    { VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query }
```
パラメータ

> table_name: 上書きする対象テーブル。このテーブルは存在している必要があります。`db_name.table_name`の形式で指定できます
>
> partitions: 上書きが必要なテーブルパーティション。以下の2つの形式がサポートされています
>
> > 1. パーティション名。カンマで区切られた`table_name`内の既存パーティションのいずれかでなければなりません
> > 2. アスタリスク(*)。[auto-detect-partition](#overwrite-auto-detect-partition)を有効にします。書き込み操作は、データに関係するパーティションを自動的に検出し、それらのパーティションを上書きします。この形式はApache Doris 2.1.3バージョン以降でサポートされています。
>
> label: Insertタスクのラベルを指定します
>
> column_name: 指定された対象カラムは`table_name`内の既存カラムのいずれかでなければなりません
>
> expression: カラムに割り当てる必要がある対応する式
>
> DEFAULT: カラムにデフォルト値を使用させます
>
> query: 一般的なクエリ。クエリの結果がターゲットを上書きします。
>
> hint: `INSERT`の実行動作を示すために使用される指示子。次の値のいずれかを選択できます：`/*+ STREAMING */`、`/*+ SHUFFLE */`または`/*+ NOSHUFFLE */`。
>
> 1. STREAMING: 現在、実用的な効果はなく、以前のバージョンとの互換性のためにのみ予約されています。（以前のバージョンでは、このhintを追加するとラベルが返されましたが、現在はデフォルトでラベルを返します）
> 2. SHUFFLE: 対象テーブルがパーティションテーブルの場合、このhintを有効にするとrepartiitonが実行されます。
> 3. NOSHUFFLE: 対象テーブルがパーティションテーブルであっても、repartiitonは実行されませんが、データが各パーティションに正しく配置されることを保証するために他の操作が実行されます。

注意：

1. 現在のバージョンでは、セッション変数`enable_insert_strict`はデフォルトで`true`に設定されています。`INSERT OVERWRITE`文の実行中に対象テーブルの形式に適合しないデータがフィルタされる場合（パーティションを上書きする際にすべてのパーティション条件が満たされない場合など）、対象テーブルの上書きは失敗します。
2. `INSERT OVERWRITE`文は最初に新しいテーブルを作成し、上書きされるデータを新しいテーブルに挿入してから、古いテーブルを新しいテーブルでアトミックに置き換えて名前を変更します。したがって、テーブルの上書き処理中、古いテーブルのデータは上書きが完了するまで通常通りアクセスできます。

### Auto Partition Tableの場合

INSERT OVERWRITEの対象テーブルが自動パーティションテーブルの場合、動作は[Session Variable](../../session/variable/SET-VARIABLE.md) `enable_auto_create_when_overwrite`によって以下のように制御されます：

1. PARTITIONが指定されていない場合（テーブル全体を上書き）、`enable_auto_create_when_overwrite`が`true`の場合、テーブルが上書きされ、対応するパーティションが存在しないデータについてはテーブルの自動パーティション化ルールに従ってパーティションが作成され、それらのデータは受け入れられます。`enable_auto_create_when_overwrite`が`false`の場合、パーティションが見つからないデータはエラー行が蓄積されて失敗します。
2. 上書きPARTITIONが指定されている場合、AUTO PARTITIONテーブルはこの処理中は通常のパーティションテーブルとして動作し、既存パーティションの条件を満たさないデータは新しいパーティションを作成する代わりにフィルタされます。
3. PARTITIONを`partition(*)`として指定した場合（自動パーティション検出と上書き）、`enable_auto_create_when_overwrite`が`true`の場合、テーブル内に対応するパーティションを持つデータについては対応するパーティションを上書きし、他の既存パーティションは変更されません。同時に、対応するパーティションがないデータについては、テーブルの自動パーティション化ルールに従ってパーティションを作成し、対応するパーティションがないデータを格納します。`enable_auto_create_when_overwrite`が`false`の場合、パーティションが見つからないデータはエラー行が蓄積されて失敗します。

`enable_auto_create_when_overwrite`がないバージョンでは、変数の値が`false`であるかのように動作します。

簡易チェック結論は以下の通りです：

1. `enable_auto_create_when_overwrite`が有効な自動パーティションテーブルの場合：

|    | 上書きするパーティション | 他のパーティションをクリア | パーティション化されていないデータの自動作成 |
|-|-|-|-|
| 無指定（全テーブル） | すべて | √ | √ |
| 指定パーティション | 明示的パーティション | × | × |
| `partition(*)` | データが属するパーティション | × | √ |

2. 通常のテーブル、`enable_auto_create_when_overwrite`が無効な自動パーティションテーブルの場合：

|    | 上書きするパーティション | 他のパーティションをクリア | パーティション化されていないデータの自動作成 |
|-|-|-|-|
| 無指定（全テーブル） | すべて | √ | × |
| 指定パーティション | 明示的パーティション | × | × |
| `partition(*)` | データが属するパーティション | × | × |

例を以下に示します：

```sql
mysql> create table auto_list(
    ->              k0 varchar null
    ->          )
    ->          auto partition by list (k0)
    ->          (
    ->              PARTITION p1 values in (("Beijing"), ("BEIJING")),
    ->              PARTITION p2 values in (("Shanghai"), ("SHANGHAI")),
    ->              PARTITION p3 values in (("xxx"), ("XXX")),
    ->              PARTITION p4 values in (("list"), ("LIST")),
    ->              PARTITION p5 values in (("1234567"), ("7654321"))
    ->          )
    ->          DISTRIBUTED BY HASH(`k0`) BUCKETS 1
    ->          properties("replication_num" = "1");
Query OK, 0 rows affected (0.14 sec)

mysql> insert into auto_list values ("Beijing"),("Shanghai"),("xxx"),("list"),("1234567");
Query OK, 5 rows affected (0.22 sec)

mysql> insert overwrite table auto_list partition(*) values ("BEIJING"), ("new1");
Query OK, 2 rows affected (0.28 sec)

mysql> select * from auto_list;
+----------+ --- p1 is overwritten, new1 gets the new partition, and the other partitions remain unchanged.
| k0       |
+----------+
| 1234567  |
| BEIJING  |
| list     |
| xxx      |
| new1     |
| Shanghai |
+----------+
6 rows in set (0.48 sec)

mysql> insert overwrite table auto_list values ("SHANGHAI"), ("new2");
Query OK, 2 rows affected (0.17 sec)

mysql> select * from auto_list;
+----------+ --- The whole table is overwritten, and new2 gets the new partition.
| k0       |
+----------+
| new2     |
| SHANGHAI |
+----------+
2 rows in set (0.15 sec)
```
## 例

`test`という名前のテーブルがあると仮定します。このテーブルには2つの列`c1`と`c2`、および2つのパーティション`p1`と`p2`が含まれています。

```sql
CREATE TABLE IF NOT EXISTS test (
  `c1` int NOT NULL DEFAULT "1",
  `c2` int NOT NULL DEFAULT "4"
) ENGINE=OLAP
UNIQUE KEY(`c1`)
PARTITION BY LIST (`c1`)
(
PARTITION p1 VALUES IN ("1","2","3"),
PARTITION p2 VALUES IN ("4","5","6")
)
DISTRIBUTED BY HASH(`c1`) BUCKETS 3
PROPERTIES (
  "replication_allocation" = "tag.location.default: 1",
  "in_memory" = "false",
  "storage_format" = "V2"
);
```
### Overwrite Table

1. `VALUES`の形式を使用して`test`テーブルを上書きします。

   ```sql
   // Single-row overwrite.
   INSERT OVERWRITE table test VALUES (1, 2);
   INSERT OVERWRITE table test (c1, c2) VALUES (1, 2);
   INSERT OVERWRITE table test (c1, c2) VALUES (1, DEFAULT);
   INSERT OVERWRITE table test (c1) VALUES (1);
   // Multi-row overwrite.
   INSERT OVERWRITE table test VALUES (1, 2), (3, 2 + 2);
   INSERT OVERWRITE table test (c1, c2) VALUES (1, 2), (3, 2 * 2);
   INSERT OVERWRITE table test (c1, c2) VALUES (1, DEFAULT), (3, DEFAULT);
   INSERT OVERWRITE table test (c1) VALUES (1), (3);
   ```
- 1番目と2番目のステートメントは同じ効果を持ちます。上書き時にターゲット列が指定されていない場合、テーブル内の列順序がデフォルトのターゲット列として使用されます。上書きが成功した後、`test`テーブルにはデータが1行のみ存在します。
- 3番目と4番目のステートメントは同じ効果を持ちます。指定されていない列`c2`はデフォルト値4で上書きされます。上書きが成功した後、`test`テーブルにはデータが1行のみ存在します。
- 5番目と6番目のステートメントは同じ効果を持ちます。ステートメント内で式（`2+2`、`2*2`など）を使用できます。式の結果はステートメントの実行中に計算され、その後`test`テーブルに上書きされます。上書きが成功した後、`test`テーブルにはデータが2行存在します。
- 7番目と8番目のステートメントは同じ効果を持ちます。指定されていない列`c2`はデフォルト値4で上書きされます。上書きが成功した後、`test`テーブルにはデータが2行存在します。

2. クエリステートメントの形式で`test`テーブルを上書きします。`test2`テーブルと`test`テーブルのデータ形式は一致している必要があります。一致していない場合、暗黙的なデータ型変換が実行されます。

   ```sql
   INSERT OVERWRITE table test SELECT * FROM test2;
   INSERT OVERWRITE table test (c1, c2) SELECT * from test2;
   ```
- 最初と2番目のステートメントは同じ効果を持ちます。これらのステートメントの目的は、`test2`テーブルからデータを取得し、取得したデータで`test`テーブルを上書きすることです。上書きが成功した後、`test`テーブル内のデータは`test2`テーブル内のデータと一致します。

3. `test`テーブルを上書きしてラベルを指定する。

   ```sql
   INSERT OVERWRITE table test WITH LABEL `label1` SELECT * FROM test2;
   INSERT OVERWRITE table test WITH LABEL `label2` (c1, c2) SELECT * from test2;
   ```
- ユーザーは `SHOW LOAD;` コマンドを使用して、この `label` によってインポートされたジョブのステータスを確認できます。label は一意であることに注意してください。

### テーブルパーティションの上書き

INSERT OVERWRITE を使用してパーティションを書き換える際、実際には以下の3つのステップを単一のトランザクションにカプセル化して実行します。途中で失敗した場合、実行済みの操作はロールバックされます：

1. パーティション `p1` が書き換え対象として指定されたと仮定し、まず書き換え対象のパーティションと同じ構造を持つ空の一時パーティション `pTMP` を作成します。
2. `pTMP` にデータを書き込みます。
3. `p1` を `pTMP` アトムで置き換えます

以下は例です：

1. `VALUES` の形式を使用して `test` テーブルのパーティション `P1` と `P2` を上書きします。

   ```sql
   // Single-row overwrite.
   INSERT OVERWRITE table test PARTITION(p1,p2) VALUES (1, 2);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1, c2) VALUES (1, 2);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1, c2) VALUES (1, DEFAULT);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1) VALUES (1);
   // Multi-row overwrite.
   INSERT OVERWRITE table test PARTITION(p1,p2) VALUES (1, 2), (4, 2 + 2);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1, c2) VALUES (1, 2), (4, 2 * 2);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1, c2) VALUES (1, DEFAULT), (4, DEFAULT);
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1) VALUES (1), (4);
   ```
テーブル全体を上書きするのとは異なり、上記のステートメントはテーブル内のパーティションを上書きしています。パーティションは一度に1つずつ上書きすることも、複数のパーティションを一度に上書きすることも可能です。対応するパーティションフィルタリング条件を満たすデータのみが正常に上書きできることに注意してください。上書きするデータ内に、いずれのパーティションも満たさないデータが存在する場合、上書きは失敗します。失敗例を以下に示します。

   ```sql
   INSERT OVERWRITE table test PARTITION(p1,p2) VALUES (7, 2);
   ```
上記のステートメント（`c1=7`）によって上書きされるデータは、パーティション`P1`と`P2`の条件を満たさないため、上書きは失敗します。

2. クエリステートメントの形式で`test`テーブルのパーティション`P1`と`P2`を上書きします。`test2`テーブルと`test`テーブルのデータ形式は一致している必要があります。一致していない場合、暗黙的なデータ型変換がトリガーされます。

   ```sql
   INSERT OVERWRITE table test PARTITION(p1,p2) SELECT * FROM test2;
   INSERT OVERWRITE table test PARTITION(p1,p2) (c1, c2) SELECT * from test2;
   ```
3. `test`テーブルのパーティション`P1`と`P2`を上書きし、ラベルを指定します。

   ```sql
   INSERT OVERWRITE table test PARTITION(p1,p2) WITH LABEL `label3` SELECT * FROM test2;
   INSERT OVERWRITE table test PARTITION(p1,p2) WITH LABEL `label4` (c1, c2) SELECT * from test2;
   ```
### Overwrite Auto Detect Partition

> この機能はバージョン2.1.3から利用可能です。

INSERT OVERWRITEコマンドで指定されたPARTITION句が`PARTITION(*)`の場合、この上書きはデータが配置されているパーティションを自動的に検出します。例：

```sql
mysql> create table test(
    -> k0 int null
    -> )
    -> partition by range (k0)
    -> (
    -> PARTITION p10 values less than (10),
    -> PARTITION p100 values less than (100),
    -> PARTITION pMAX values less than (maxvalue)
    -> )
    -> DISTRIBUTED BY HASH(`k0`) BUCKETS 1
    -> properties("replication_num" = "1");
Query OK, 0 rows affected (0.11 sec)

mysql> insert into test values (1), (2), (15), (100), (200);
Query OK, 5 rows affected (0.29 sec)

mysql> select * from test order by k0;
+------+
| k0   |
+------+
|    1 |
|    2 |
|   15 |
|  100 |
|  200 |
+------+
5 rows in set (0.23 sec)

mysql> insert overwrite table test partition(*) values (3), (1234);
Query OK, 2 rows affected (0.24 sec)

mysql> select * from test order by k0;
+------+
| k0   |
+------+
|    3 |
|   15 |
| 1234 |
+------+
3 rows in set (0.20 sec)
```
ご覧のように、データ3と1234が配置されているパーティション`p10`と`pMAX`のすべてのデータが上書きされる一方で、パーティション`p100`は変更されません。この操作は、INSERT OVERWRITE操作中にPARTITION句によって上書きされる特定のパーティションを指定するための構文糖として解釈でき、これは[上書きするパーティションを指定](#overwrite-table-partition)と同じ方法で実装されています。`PARTITION(*)`構文により、大量のパーティションを上書きする際にすべてのパーティション名を手動で入力する必要がなくなります。

## Keywords

INSERT OVERWRITE, OVERWRITE, AUTO DETECT
