---
{
  "title": "QUERY",
  "description": "Query table function（table-valued-function、tvf）は、データクエリのためにクエリステートメントを直接カタログに透過的に送信するために使用できます。",
  "language": "ja"
}
---
## デスクリプション

クエリTable関数（table-valued-function、tvf）は、データクエリのためにクエリステートメントを直接catalogに透過的に送信するために使用できます

Dorisバージョン2.1.3でサポートされており、現在はjdbc catalogの透過的クエリのみがサポートされています。
まずDorisで対応するcatalogを作成する必要があります。


## Syntax

```sql
QUERY(
    "catalog" = "<catalog>", 
    "query" = "<query_sql>"
  );
```
## 必須パラメータ
クエリTable関数tvfの各パラメータは`"key"="value"`ペアです。

| Field      | デスクリプション                                |
|------------|--------------------------------------------|
| `catalog`  | カタログ名。カタログの名前に応じて入力する必要があります。 |
| `query`    | 実行するクエリステートメント。       |


## 例

`desc function`と組み合わせて使用できます

```sql
desc function query("catalog" = "jdbc", "query" = "select * from test.student");
```
```text
+-------+------+------+-------+---------+-------+
| Field | タイプ | Null | Key   | Default | Extra |
+-------+------+------+-------+---------+-------+
| id    | int  | Yes  | true  | NULL    |       |
| name  | text | Yes  | false | NULL    | NONE  |
+-------+------+------+-------+---------+-------+
```
jdbc catalogデータソース内のTableに対する透過的クエリ

```sql
select * from query("catalog" = "jdbc", "query" = "select * from test.student");
```
```text
+------+---------+
| id   | name    |
+------+---------+
| 1    | alice   |
| 2    | bob     |
| 3    | jack    |
+------+---------+
```
```sql
select * from query("catalog" = "jdbc", "query" = "select * from test.score");
```
```text
+------+---------+
| id   | score   |
+------+---------+
| 1    | 100     |
| 2    | 90      |
| 3    | 80      |
+------+---------+
```
jdbc catalogデータソース内のTableに対する透過的結合クエリ

```sql
select * from query("catalog" = "jdbc", "query" = "select a.id, a.name, b.score from test.student a join test.score b on a.id = b.id");
```
```
+------+---------+---------+
| id   | name    | score   |
+------+---------+---------+
| 1    | alice   | 100     |
| 2    | bob     | 90      |
| 3    | jack    | 80      |
+------+---------+---------+
```
