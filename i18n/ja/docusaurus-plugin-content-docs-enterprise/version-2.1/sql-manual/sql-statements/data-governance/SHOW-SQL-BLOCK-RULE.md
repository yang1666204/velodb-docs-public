---
{
  "title": "SHOW SQL_BLOCK_RULE",
  "description": "設定されたSQL blocking rulesを表示します。rule名が指定されていない場合、すべてのruleが表示されます。",
  "language": "ja"
}
---
## デスクリプション  
設定されたSQLブロッキングルールを表示します。ルール名が指定されていない場合、すべてのルールが表示されます。

## Syntax

```sql
SHOW SQL_BLOCK_RULE [FOR <rule_name>];
```
## Optional パラメータ

`<rule_name>`

表示するSQL blocking ruleの名前。省略した場合、すべてのruleが表示されます。|

## Access Control Requirements

このコマンドを実行するユーザーは以下の権限を持つ必要があります：

| Privilege | Object        | 注釈  |
|-----------|--------------|--------|
| `ADMIN`   | User or Role | この操作を実行するために必要です。 |

## Examples

1. すべてのSQL blocking ruleを表示する

```sql
SHOW SQL_BLOCK_RULE;
```
```text
+------------+----------------------------+---------+-------------+------------+-------------+--------+--------+
| Name       | Sql                        | SqlHash | PartitionNum | TabletNum  | Cardinality | Global | Enable |
+------------+----------------------------+---------+-------------+------------+-------------+--------+--------+
| test_rule  | select * from order_analysis | NULL    | 0           | 0          | 0           | true   | true   |
| test_rule2 | NULL                        | NULL    | 30          | 0          | 10000000000 | false  | true   |
+------------+----------------------------+---------+-------------+------------+-------------+--------+--------+
```
2. 特定のSQLブロッキングルールを表示する

```sql
SHOW SQL_BLOCK_RULE FOR test_rule2;
```
```text
+------------+------+---------+-------------+------------+-------------+--------+--------+
| Name       | Sql  | SqlHash | PartitionNum | TabletNum  | Cardinality | Global | Enable |
+------------+------+---------+-------------+------------+-------------+--------+--------+
| test_rule2 | NULL | NULL    | 30          | 0          | 10000000000 | false  | true   |
+------------+------+---------+-------------+------------+-------------+--------+--------+
```
