---
{
  "title": "NOT_NULL_OR_EMPTY",
  "description": "notnullorempty関数は、指定された値がNULLでなく、かつ空でないかを判定するために使用されます。入力値がNULLでも空でもない場合、",
  "language": "ja"
}
---
## 説明

`not_null_or_empty`関数は、指定された値がNULLでなく、かつ空でないかどうかを判定するために使用されます。入力値がNULLでも空でもない場合はtrueを返し、そうでない場合はfalseを返します。

## 構文

```sql
NOT_NULL_OR_EMPTY (<str>)
```
## パラメータ
- `<str>`: String型、NULLまたは空であるかをチェックする文字列。

## 戻り値
文字列が空の文字列またはNULLの場合はfalseを返し、そうでなければtrueを返します。

## 例
1. 例1

    ```sql
    select not_null_or_empty(null), not_null_or_empty("");, not_null_or_empty(" ");
    ```
    ```text
    +-------------------------+-----------------------+------------------------+
    | not_null_or_empty(null) | not_null_or_empty("") | not_null_or_empty(" ") |
    +-------------------------+-----------------------+------------------------+
    |                       0 |                     0 |                      1 |
    +-------------------------+-----------------------+------------------------+
    ```
