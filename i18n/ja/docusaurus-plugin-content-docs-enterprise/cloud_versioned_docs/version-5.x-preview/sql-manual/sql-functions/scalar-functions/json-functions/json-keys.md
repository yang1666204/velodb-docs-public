---
{
  "title": "I don't see any text provided to translate. You mentioned \"JSON_KEYS\" at the end, but there's no actual English technical documentation text included in your message.\n\nPlease provide the English text you'd like me to translate into Japanese, and I'll follow the guidelines you've specified.",
  "description": "JSON オブジェクトのすべてのキーを配列形式で返します。デフォルトでは、ルートオブジェクトのキーを返します。",
  "language": "ja"
}
---
## 説明
JSONオブジェクトのすべてのキーを配列形式で返します。デフォルトでは、ルートオブジェクトのキーを返しますが、パラメータを通じて特定のパスのオブジェクトキーを返すように制御することもできます。

## 構文

```sql
JSON_KEYS(<json_object>[, <path>])
```
## Parameters
### Required Parameters
- `<json_object>` JSON型、キーを抽出する必要があるJSONオブジェクト。

### Optional Parameters
- `<path>` String型、チェックするJSONサブドキュメントを指定するオプションのJSONパス。提供されない場合は、ルートドキュメントがデフォルトになります。

## Return Value
- Array<String> 文字列の配列を返します。配列のメンバーは、JSONオブジェクトのすべてのキーです。

## Notes
- `<json_object>`または`<path>`がNULLの場合、NULLを返します。
- JSONオブジェクトではない場合（例：JSON配列の場合）、NULLを返します。
- `<path>`が指すオブジェクトが存在しない場合、NULLを返します。

## Examples
1. Example 1

    ```sql
    SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}');
    ```
    ```text
    +---------------------------------------+
    | JSON_KEYS('{"a": 1, "b": {"c": 30}}') |
    +---------------------------------------+
    | ["a", "b"]                            |
    +---------------------------------------+
    ```
    ```sql
    SELECT JSON_KEYS('{}');
    ```
    ```text
    +-----------------+
    | JSON_KEYS('{}') |
    +-----------------+
    | []              |
    +-----------------+
    ```
2. パスを指定する

    ```sql
    SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.b');
    ```
    ```text
    +----------------------------------------------+
    | JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.b') |
    +----------------------------------------------+
    | ["c"]                                        |
    +----------------------------------------------+
    ```
3. NULLパラメータ

    ```sql
    SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}', NULL);
    ```
    ```text
    +---------------------------------------------+
    | JSON_KEYS('{"a": 1, "b": {"c": 30}}', NULL) |
    +---------------------------------------------+
    | NULL                                        |
    +---------------------------------------------+
    ```
    ```sql
    SELECT JSON_KEYS(NULL);
    ```
    ```text
    +-----------------+
    | JSON_KEYS(NULL) |
    +-----------------+
    | NULL            |
    +-----------------+
    ```
4. JSONオブジェクトではない

    ```sql
    SELECT JSON_KEYS('[1,2]');
    ```
    ```text
    +--------------------+
    | JSON_KEYS('[1,2]') |
    +--------------------+
    | NULL               |
    +--------------------+
    ```
    ```sql
    SELECT JSON_KEYS('{"k": [1, 2, 3]}', '$.k');
    ```
    ```text
    +--------------------------------------+
    | JSON_KEYS('{"k": [1, 2, 3]}', '$.k') |
    +--------------------------------------+
    | NULL                                 |
    +--------------------------------------+
    ```
5. パスで指定されたオブジェクトが存在しません

    ```sql
    SELECT JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.c');
    ```
    ```text
    +----------------------------------------------+
    | JSON_KEYS('{"a": 1, "b": {"c": 30}}', '$.c') |
    +----------------------------------------------+
    | NULL                                         |
    +----------------------------------------------+
    ```
