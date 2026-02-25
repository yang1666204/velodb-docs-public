---
{
  "title": "I don't see any text to translate after \"Text:\" in your message. You mentioned \"JSON_REPLACE\" but this appears to be a placeholder rather than the actual content you want translated.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
  "description": "JSONREPLACE関数は、JSON内のデータを置換して結果を返すために使用されます。",
  "language": "ja"
}
---
## 説明
`JSON_REPLACE`関数は、JSON内のデータを置換し、結果を返すために使用されます。

## 構文

```sql
JSON_REPLACE (<json_object>, <path>,  <value>[, <path>,  <value>, ...])
```
## パラメータ
- `<json_object>`: JSON型の式、変更対象となるオブジェクト。
- `<path>`: String型の式、値を置換する場所のパスを指定
- `<value>`: JSON型または[`TO_JSON`](./to-json.md)でサポートされているその他の型、置換する値。

## 戻り値
- Nullable(JSON) 変更されたJSONオブジェクトを返します

## 使用上の注意
1. パス-値のペアは左から右に評価されることに注意してください。
2. `<path>`で指定された値がJSONオブジェクトに存在しない場合、何も影響しません。
3. `<path>`にワイルドカードを含めることはできません。ワイルドカードが含まれている場合、エラーが報告されます。
4. `<json_object>`または`<path>`がNULLの場合、NULLが返されます。`<value>`がNULLの場合、JSON null値が挿入されます。

## 例
1. パス-値のペアは左から右に評価されます

    ```sql
    select json_replace('{"k": {"k2": "v2"}}', '$.k', json_parse('{"k2": 321, "k3": 456}'), '$.k.k2', 123);
    ```
    ```text
    +-------------------------------------------------------------------------------------------------+
    | json_replace('{"k": {"k2": "v2"}}', '$.k', json_parse('{"k2": 321, "k3": 456}'), '$.k.k2', 123) |
    +-------------------------------------------------------------------------------------------------+
    | {"k":{"k2":123,"k3":456}}                                                                       |
    +-------------------------------------------------------------------------------------------------+
    ```
2. `<path>`が指す値がJSONオブジェクト内に存在しません

    ```sql
    select json_replace('{"k": 1}', "$.k2", 2);
    ```
    ```text
    +-------------------------------------+
    | json_replace('{"k": 1}', "$.k2", 2) |
    +-------------------------------------+
    | {"k":1}                             |
    +-------------------------------------+
    ```
3. `<path>`にはワイルドカードを含めることはできません

    ```sql
    select json_replace('{"k": 1}', "$.*", 2);
    ```
    ```text
    ERROR 1105 (HY000): errCode = 2, detailMessage = [INVALID_ARGUMENT] In this situation, path expressions may not contain the * and ** tokens or an array range, argument index: 1, row index: 0
    ```
4. NULLパラメータ

    ```sql
    select json_replace(NULL, '$[1]', 123);
    ```
    ```text
    +---------------------------------+
    | json_replace(NULL, '$[1]', 123) |
    +---------------------------------+
    | NULL                            |
    +---------------------------------+
    ```
    ```sql
    select json_replace('{"k": "v"}', NULL, 123);
    ```
    ```text
    +---------------------------------------+
    | json_replace('{"k": "v"}', NULL, 123) |
    +---------------------------------------+
    | NULL                                  |
    +---------------------------------------+
    ```
    ```sql
    select json_replace('{"k": "v"}', '$.k', NULL);
    ```
    ```text
    +-----------------------------------------+
    | json_replace('{"k": "v"}', '$.k', NULL) |
    +-----------------------------------------+
    | {"k":null}                              |
    +-----------------------------------------+
    ```
