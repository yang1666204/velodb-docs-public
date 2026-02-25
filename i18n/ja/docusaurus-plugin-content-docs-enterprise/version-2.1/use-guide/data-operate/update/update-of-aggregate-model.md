---
{
  "title": "Aggregate Key Modelでのデータ更新",
  "description": "このドキュメントでは主に、データロードに基づいてDoris Aggregateモデルを更新する方法について説明します。",
  "language": "ja"
}
---
このドキュメントは、主にデータロードに基づくDoris Aggregateモデルの更新方法を紹介します。

## 全行更新

Stream Load、Broker Load、Routine Load、Insert Intoなど、Dorisがサポートする方法を使用してAggregateモデルテーブルにデータをロードする場合、新しい値は列の集約関数に従って古い値と集約され、新しい集約値が生成されます。この値は挿入時または非同期圧縮中に生成される可能性がありますが、ユーザーがクエリを実行する際には同じ戻り値を取得します。

## Aggregateモデルの部分列更新

Aggregateテーブルは、データ更新シナリオではなく、主に事前集約シナリオで使用されますが、集約関数をREPLACE_IF_NOT_NULLに設定することで部分列更新を実現できます。

**テーブル作成**

更新が必要なフィールドの集約関数を`REPLACE_IF_NOT_NULL`に設定します。

```sql
CREATE TABLE order_tbl (
  order_id int(11) NULL,
  order_amount int(11) REPLACE_IF_NOT_NULL NULL,
  order_status varchar(100) REPLACE_IF_NOT_NULL NULL
) ENGINE=OLAP
AGGREGATE KEY(order_id)
COMMENT 'OLAP'
DISTRIBUTED BY HASH(order_id) BUCKETS 1
PROPERTIES (
"replication_allocation" = "tag.location.default: 1"
);
```
**データ挿入**

Stream Load、Broker Load、Routine Load、または`INSERT INTO`のいずれの場合でも、更新対象フィールドのデータを直接書き込みます。

**例**

前の例と同様に、対応するStream Loadコマンドは以下のとおりです（追加のヘッダーは不要）：

```shell
$ cat update.csv

1,To be shipped

curl  --location-trusted -u root: -H "column_separator:," -H "columns:order_id,order_status" -T ./update.csv http://127.0.0.1:8030/api/db1/order_tbl/_stream_load
```
対応する`INSERT INTO`文は以下の通りです（追加のセッション変数設定は不要）：

```sql
INSERT INTO order_tbl (order_id, order_status) values (1,'Shipped');
```
## 部分的な列更新に関する注意事項

Aggregate Keyモデルは書き込みプロセス中に追加の処理を実行しないため、書き込みパフォーマンスは影響を受けず、通常のデータロードと同じです。ただし、クエリ時の集約のコストは比較的高く、典型的な集約クエリのパフォーマンスは、Unique KeyモデルのMerge-on-Write実装よりも5-10倍低くなります。

`REPLACE_IF_NOT_NULL`集約関数は値がNULLでない場合にのみ有効になるため、ユーザーはフィールド値をNULLに変更することはできません。
