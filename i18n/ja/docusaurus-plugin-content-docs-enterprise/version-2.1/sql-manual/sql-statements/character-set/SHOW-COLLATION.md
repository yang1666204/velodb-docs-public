---
{
  "title": "SHOW COLLATION",
  "description": "Dorisでは、SHOW COLLATIONコマンドは、データベースで利用可能な文字セット照合順序を表示するために使用されます。",
  "language": "ja"
}
---
## デスクリプション

Dorisでは、SHOW COLLATIONコマンドはデータベースで利用可能な文字セットのcollationを表示するために使用されます。collationとは、データがどのようにソートされ比較されるかを決定するルールのセットです。これらのルールは文字データの格納と取得に影響を与えます。

## Syntax

```sql
SHOW COLLATION
```
## 戻り値

| column name | description  |
| -- |--------------|
| Collation | 照合順序名         |
| Charset | 文字セット          |
| Id | 照合順序のID        |
| Default | この文字セットのデフォルト照合順序かどうか |
| Compiled | 照合順序がコンパイルされているかどうか        |
| Sortlen | ソート長         |



## 使用上の注意

Dorisでは、MySQL照合順序設定コマンドと互換性がありますが、実際には有効になりません。実行時には、utf8mb4_0900_binが常に比較ルールとして使用されます。

## 例

```sql
SHOW COLLATION;
```
```text
+--------------------+---------+------+---------+----------+---------+
| Collation          | Charset | Id   | Default | Compiled | Sortlen |
+--------------------+---------+------+---------+----------+---------+
| utf8mb4_0900_bin   | utf8mb4 |  309 | Yes     | Yes      |       1 |
| utf8mb3_general_ci | utf8mb3 |   33 | Yes     | Yes      |       1 |
+--------------------+---------+------+---------+----------+---------+
```
