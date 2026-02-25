---
{
  "title": "I don't see any text to translate in your message. You mentioned \"Text:\" followed by \"JSON_OBJECT\" but there doesn't appear to be any actual English technical documentation content provided.\n\nCould you please provide the English text that you would like me to translate into Japanese?",
  "description": "指定されたKey-Valueを含むjsonオブジェクトを生成します。Keyがnullの場合、またはパラメータ数が奇数の場合は例外エラーが返されます。",
  "language": "ja"
}
---
## Description
指定されたKey-Valueを含むjsonオブジェクトを生成します。
KeyがNULLの場合またはパラメータ数が奇数の場合、例外エラーが返されます。

## Syntax

```sql
JSON_OBJECT (<key>, <value>[,<key>, <value>, ...])
```
## Parameters

| Parameter      | Description                                       |
|---------|------------------------------------------|
| `<key>`   | 生成されるjsonオブジェクトのKey-ValueのKey値。   |
| `<value>` | 生成されるjsonオブジェクトのKey-ValueのValue値。 |

## Usage Notes

- 慣例により、引数リストは交互にキーと値で構成されます。
- Key引数はテキストに強制変換されます。
- Value引数はjsonに変換可能な形式に従って変換され、現在array/struct/map/jsonをvalueとしてサポートしています。

## Return Values
jsonオブジェクトを返します。特殊なケースは以下の通りです：
* パラメータが渡されない場合、空のjsonオブジェクトを返します。
* 渡されたパラメータの数が奇数の場合、例外エラーを返します。
* 渡されたKeyがNULLの場合、例外エラーを返します。
* 渡されたValueがNULLの場合、返されるjsonオブジェクトのKey-ValueペアのValue値はNULLになります。

## Examples

```sql
select json_object();
```
```text
+---------------+
| json_object() |
+---------------+
| {}            |
+---------------+
```
```sql
select json_object('time',curtime());
```
```text
+--------------------------------+
| json_object('time', curtime()) |
+--------------------------------+
| {"time": "10:49:18"}           |
+--------------------------------+
```
```sql
SELECT json_object('id', 87, 'name', 'carrot');
```
```text
+-----------------------------------------+
| json_object('id', 87, 'name', 'carrot') |
+-----------------------------------------+
| {"id": 87, "name": "carrot"}            |
+-----------------------------------------+
```
```sql
select json_object('username',null);
```
```text
+---------------------------------+
| json_object('username', 'NULL') |
+---------------------------------+
| {"username": NULL}              |
+---------------------------------+
```
```sql
select json_object(null,null);
```
```text
ERROR 1105 (HY000): errCode = 2, detailMessage = json_object key can't be NULL: json_object(NULL)
```
```sql
-- support array as object value
SELECT json_object('id', 1, 'level', array('"aaa"','"bbb"'));
```
```text
+------------------------------------------------------------------------------------------------------+
| json_object('id', cast(1 as VARCHAR(65533)), 'level', cast(array('"aaa"', '"bbb"') as JSON), '6267') |
+------------------------------------------------------------------------------------------------------+
| {"id":1,"level":["\"aaa\"","\"bbb\""]}                                                               |
+------------------------------------------------------------------------------------------------------+
```
```sql
-- support map as object value
SELECT json_object('id', 1, 'level', map('a', 'b', 'c', 'd'));
```
```text
+------------------------------------------------------------------------------------------------------+
| json_object('id', cast(1 as VARCHAR(65533)), 'level', cast(map('a', 'b', 'c', 'd') as JSON), '6267') |
+------------------------------------------------------------------------------------------------------+
| {"id":1,"level":{"a":"b","c":"d"}}                                                                   |
+------------------------------------------------------------------------------------------------------+
```
```sql
-- support struct as object value
SELECT json_object('id', 1, 'level', named_struct('name', 'a', 'age', 1));
```
```text
+------------------------------------------------------------------------------------------------------------------+
| json_object('id', cast(1 as VARCHAR(65533)), 'level', cast(named_struct('name', 'a', 'age', 1) as JSON), '6267') |
+------------------------------------------------------------------------------------------------------------------+
| {"id":1,"level":{"name":"a","age":1}}                                                                            |
+------------------------------------------------------------------------------------------------------------------+
```
```sql
-- support json as object value
SELECT json_object('id', 1, 'level', cast('{\"a\":\"b\"}' as JSON));
```
```text
+------------------------------------------------------------------------------------------+
| json_object('id', cast(1 as VARCHAR(65533)), 'level', cast('{"a":"b"}' as JSON), '6267') |
+------------------------------------------------------------------------------------------+
| {"id":1,"level":{"a":"b"}}                                                               |
+------------------------------------------------------------------------------------------+
```
