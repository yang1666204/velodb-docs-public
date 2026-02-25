---
{
  "title": "GROUP_CONCAT",
  "description": "GROUPCONCAT関数は、結果セット内の複数行の結果を文字列に連結します。",
  "language": "ja"
}
---
## Description

GROUP_CONCAT関数は、結果セット内の複数行の結果を文字列に連結します。

## Syntax

```sql
GROUP_CONCAT([DISTINCT] <str>[, <sep>] [ORDER BY { <col_name> | <expr>} [ASC | DESC]])
```
## Parameters

| Parameters | Description |
| ------------ | ---------------------- |
| `<str>`      | 必須。連結する値の式。 |
| `<sep>`      | オプション。文字列間の区切り文字。 |
| `<col_name>` | オプション。ソートに使用される列。   |
| `<expr>`     | オプション。ソートに使用される式。 |

## Return Value

VARCHAR型の値を返します。

## Example

```sql
select value from test;
```
```text
+-------+
| value |
+-------+
| a     |
| b     |
| c     |
| c     |
+-------+
```
```sql
select GROUP_CONCAT(value) from test;
```
```text
+-----------------------+
| GROUP_CONCAT(`value`) |
+-----------------------+
| a, b, c, c            |
+-----------------------+
```
```sql
select GROUP_CONCAT(DISTINCT value) from test;
```
```text
+-----------------------+
| GROUP_CONCAT(`value`) |
+-----------------------+
| a, b, c               |
+-----------------------+
```
```sql 
select GROUP_CONCAT(value, " ") from test;
```
```text
+----------------------------+
| GROUP_CONCAT(`value`, ' ') |
+----------------------------+
| a b c c                    |
+----------------------------+
```
```sql
select GROUP_CONCAT(value, NULL) from test;
```
```text
+----------------------------+
| GROUP_CONCAT(`value`, NULL)|
+----------------------------+
| NULL                       |
+----------------------------+
```
