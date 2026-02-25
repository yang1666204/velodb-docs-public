---
{
  "title": "JSON_ARRAY",
  "description": "指定された要素を含むJSON配列を生成します。パラメータが渡されない場合は空の配列を返します。",
  "language": "ja"
}
---
## 説明
指定された要素を含むJSON配列を生成します。パラメータが渡されない場合は空の配列を返します。

## 構文

```sql
JSON_ARRAY([<expression>, ...]) 
```
## Arguments
### Variable arguments: 
- `<expression>`: JSON配列に含まれる要素は、NULLを含む単一の型または複数の型にすることができます。
## Returns
[`Nullable(JSON)`](../../../basic-element/sql-data-types/semi-structured/JSON.md): 指定された値を含むJSON配列を返します。値が指定されていない場合、空のJSON配列が返されます。

## Parameters
### Variable parameters:
- `<expression>`: JSON配列に含まれる要素。NULLを含む異なる型の単一または複数の値にすることができます。

## Return Value
[`JSON`](../../../basic-element/sql-data-types/semi-structured/JSON.md): パラメータリストで構成されたJSON配列を返します。

## Usage Notes
- JSON_ARRAY実装は、[`TO_JSON`](./to-json.md)関数を暗黙的に呼び出すことで、異なる型のパラメータをJSON値に変換するため、パラメータは[`TO_JSON`](./to-json.md)でサポートされている型である必要があります
- NULLはJSON nullに変換されます。配列内でnull値を保持したくない場合は、[`JSON_ARRAY_IGNORE_NULL`](./json-array-ignore-null.md)関数を使用できます。
- パラメータの型が[`TO_JSON`](./to-json.md)でサポートされていない場合、エラーが発生します。そのパラメータを最初にString型に変換することができます。例えば：

    ```sql
    select JSON_ARRAY(CAST(NOW() as String));
    ```
> NOW()関数はDateTime型を返すため、CAST関数を使用してString型に変換する必要があります
- パラメータがJSON文字列で、それをJSON オブジェクトとして配列に追加したい場合は、[`JSON_PARSE`](./json-parse.md)関数を明示的に呼び出してJSONオブジェクトとして解析する必要があります：

  ```sql
  select JSON_ARRAY(JSON_PARSE('{"key": "value"}'));
  ```
## 例
1. 通常のパラメータ

    ```sql
    select json_array() as empty_array, json_array(1) v1, json_array(1, 'abc') v2;
    ```
    ```
    +-------------+------+-----------+
    | empty_array | v1   | v2        |
    +-------------+------+-----------+
    | []          | [1]  | [1,"abc"] |
    +-------------+------+-----------+
    ```
2. NULL パラメータ

    ```sql
    select json_array(null) v1, json_array(1, null, 'I am a string') v2;
    ```
    ```
    +--------+--------------------------+
    | v1     | v2                       |
    +--------+--------------------------+
    | [null] | [1,null,"I am a string"] |
    +--------+--------------------------+
    ```
3. サポートされていないパラメータタイプ

    ```sql
    select json_array('item1', map(123, 'abc'));
    ```
    ```
    ERROR 1105 (HY000): errCode = 2, detailMessage = Can not find the compatibility function signature: to_json(MAP<TINYINT,VARCHAR(3)>)
    ```
4. Mapタイプパラメータは明示的にJSONに変換できます

    ```sql
    select json_array(1, cast(map('key', 'value') as json));
    ```
    ```
    +--------------------------------------------------+
    | json_array(1, cast(map('key', 'value') as json)) |
    +--------------------------------------------------+
    | [1,{"key":"value"}]                              |
    +--------------------------------------------------+
    ```
5. JSON文字列は文字列の形式で配列に追加されます

    ```sql
    select json_array('{"key1": "value", "key2": [1, "I am a string", 3]}');
    ```
    ```
    +------------------------------------------------------------------+
    | json_array('{"key1": "value", "key2": [1, "I am a string", 3]}') |
    +------------------------------------------------------------------+
    | ["{\"key1\": \"value\", \"key2\": [1, \"I am a string\", 3]}"]   |
    +------------------------------------------------------------------+
    ```
6. JSON文字列は`json_parse`を使用して解析し、その後`json_array`に渡すことができます

    ```sql
    select json_array(json_parse('{"key1": "value", "key2": [1, "I am a string", 3]}'));
    ```
    ```
    +------------------------------------------------------------------------------+
    | json_array(json_parse('{"key1": "value", "key2": [1, "I am a string", 3]}')) |
    +------------------------------------------------------------------------------+
    | [{"key1":"value","key2":[1,"I am a string",3]}]                              |
    +------------------------------------------------------------------------------+
    ```
