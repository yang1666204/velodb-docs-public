---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following the strict rules you've outlined. However, I don't see the actual text content to translate - only the word \"QUERY\" at the end.\n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "クエリテーブル関数（table-valued-function、tvf）は、データクエリのためにクエリステートメントをcatalogに直接透過的に送信するために使用できます。",
  "language": "ja"
}
---
## 説明

クエリテーブル関数（table-valued-function, tvf）は、データクエリのためにクエリステートメントを透過的にカタログに直接送信するために使用できます。

Doris バージョン 2.1.3 でサポートされており、現在は jdbc catalog の透過的クエリのみがサポートされています。
まず Doris で対応するカタログを作成する必要があります。


## 構文

```sql
QUERY(
    "catalog" = "<catalog>", 
    "query" = "<query_sql>"
  );
```
## 必須パラメータ
クエリテーブル関数tvfの各パラメータは`"key"="value"`ペアです。

| Field      | Description                                |
|------------|--------------------------------------------|
| `catalog`  | カタログ名。カタログの名前に従って入力する必要があります。 |
| `query`    | 実行するクエリステートメント。       |


## 例

`desc function`と組み合わせて使用できます

```sql
desc function query("catalog" = "jdbc", "query" = "select * from test.student");
```
```text
+-------+------+------+-------+---------+-------+
| Field | Type | Null | Key   | Default | Extra |
+-------+------+------+-------+---------+-------+
| id    | int  | Yes  | true  | NULL    |       |
| name  | text | Yes  | false | NULL    | NONE  |
+-------+------+------+-------+---------+-------+
```
jdbc カタログデータソース内のテーブルに対する透過的クエリ

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
jdbc catalogデータソース内のテーブルに対するTransparent joinクエリ

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
