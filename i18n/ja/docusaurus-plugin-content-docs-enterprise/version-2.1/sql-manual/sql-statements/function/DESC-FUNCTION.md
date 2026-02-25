---
{
  "title": "DESC FUNCTION",
  "description": "desc関数tablevaluedfunctionを使用して、対応するテーブル値関数のスキーマ情報を取得します。",
  "language": "ja"
}
---
## 説明

対応するテーブル値関数のスキーマ情報を取得するには、desc関数table_valued_functionを使用します。

## 構文

```sql
DESC FUNCTION <table_valued_function>
```
## 必須パラメータ

**<table_valued_function>**

> table_valued_function、テーブル値関数の名前。CATALOGSなど。サポートされているテーブル値関数のリストについては、「[Table-Valued Functions](https://doris.apache.org/docs/dev/lakehouse/file-analysis)」セクションを参照してください

## 例

テーブル値関数CATALOGSの情報を照会する：

```sql
DESC FUNCTION catalogs();
```
結果は以下の通りです:

```sql
+-------------+--------+------+-------+---------+-------+
| Field       | Type   | Null | Key   | Default | Extra |
+-------------+--------+------+-------+---------+-------+
| CatalogId   | bigint | No   | false | NULL    | NONE  |
| CatalogName | text   | No   | false | NULL    | NONE  |
| CatalogType | text   | No   | false | NULL    | NONE  |
| Property    | text   | No   | false | NULL    | NONE  |
| Value       | text   | No   | false | NULL    | NONE  |
+-------------+--------+------+-------+---------+-------+
```
