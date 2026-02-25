---
{
  "title": "数値",
  "description": "一つの列のみを含む一時テーブルを生成するテーブル関数で、列名は number、すべての要素の値は constvalue である場合",
  "language": "ja"
}
---
## Description

`const_value`が指定されている場合は、列名`number`の1つの列のみを含み、すべての要素値が`const_value`である一時テーブルを生成するテーブル関数です。指定されていない場合は、[0,`number`)でインクリメントされた値になります。

## Syntax

```sql
NUMBERS(
    "number" = "<number>"
    [, "<const_value>" = "<const_value>" ]
  );
```
## 必須パラメータ

| Field         | Description               |
|---------------|---------------------------|
| **number**    | 行数        |

## オプションパラメータ

| Field             | Description                              |
|-------------------|------------------------------------------|
| **const_value**   | 生成される定数値を指定   |



## 戻り値
| Field      | Type    | Description                     |
|----------------|---------|---------------------------------|
| **number**     | BIGINT  | 各行に対して返される値 |


## 例

```sql
select * from numbers("number" = "5");
```
```text
+--------+
| number |
+--------+
|      0 |
|      1 |
|      2 |
|      3 |
|      4 |
+--------+
```
```sql
select * from numbers("number" = "5", "const_value" = "-123");
```
```text
+--------+
| number |
+--------+
|   -123 |
|   -123 |
|   -123 |
|   -123 |
|   -123 |
+--------+
```
