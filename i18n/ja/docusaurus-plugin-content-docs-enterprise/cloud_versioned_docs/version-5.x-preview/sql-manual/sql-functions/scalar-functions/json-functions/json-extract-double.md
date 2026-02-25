---
{
  "title": "JSON_EXTRACT_DOUBLE",
  "description": "JSONEXTRACTDOUBLE は、JSONオブジェクトから <jsonpath> で指定されたフィールドを抽出し、DOUBLE型に変換します。",
  "language": "ja"
}
---
## Description
`JSON_EXTRACT_DOUBLE`は、JSONオブジェクトから`<json_path>`で指定されたフィールドを抽出し、[`DOUBLE`](../../../basic-element/sql-data-types/numeric/FLOATING-POINT.md)型に変換します。

## Syntax

```sql
JSON_EXTRACT_DOUBLE(<json_object>, <json_path>)
```
## パラメータ
- `<json_object>`: JSON型、抽出対象となるパラメータ。
- `<json_path>`: String型、対象JSONから目的の要素を抽出するためのJSONパス。

## 戻り値
`Nullable(DOUBLE)` 抽出されたDOUBLE値を返します。場合によってはNULLを返します。

## 使用上の注意
1. `<json_object>`または`<json_path>`がNULLの場合、NULLを返します。
2. `<json_path>`で指定された要素が存在しない場合、NULLを返します。
3. `<json_path>`で指定された要素がDOUBLEに変換できない場合、NULLを返します。
4. その動作は「cast + json_extract」と一致しており、以下と等価です：

    ```sql
    CAST(JSON_EXTRACT(<json_object>, <json_path>) as DOUBLE)
    ```
## Examples
1. 通常のパラメータ

    ```sql
    SELECT json_extract_double('{"id": 123.345, "name": "doris"}', '$.id');
    ```
    ```text
    +-----------------------------------------------------------------+
    | json_extract_double('{"id": 123.345, "name": "doris"}', '$.id') |
    +-----------------------------------------------------------------+
    |                                                         123.345 |
    +-----------------------------------------------------------------+
    ```
2. パスが存在しない場合

    ```sql
    SELECT json_extract_double('{"id": 123.345, "name": "doris"}', '$.id2');
    ```
    ```text
    +------------------------------------------------------------------+
    | json_extract_double('{"id": 123.345, "name": "doris"}', '$.id2') |
    +------------------------------------------------------------------+
    |                                                             NULL |
    +------------------------------------------------------------------+
    ```
3. NULLパラメータ

    ```sql
    SELECT json_extract_double('{"id": 123.345, "name": "doris"}', NULl);
    ```
    ```text
    +---------------------------------------------------------------+
    | json_extract_double('{"id": 123.345, "name": "doris"}', NULl) |
    +---------------------------------------------------------------+
    |                                                          NULL |
    +---------------------------------------------------------------+
    ```
    ```sql
    SELECT json_extract_double(NULL, '$.id2');
    ```
    ```text
    +------------------------------------+
    | json_extract_double(NULL, '$.id2') |
    +------------------------------------+
    |                               NULL |
    +------------------------------------+
    ```
4. DOUBLEへの変換が不可能な場合

    ```sql
    SELECT json_extract_double('{"id": 123, "name": "doris"}','$.name');
    ```
    ```text
    +--------------------------------------------------------------+
    | json_extract_double('{"id": 123, "name": "doris"}','$.name') |
    +--------------------------------------------------------------+
    |                                                         NULL |
    +--------------------------------------------------------------+
    ```
