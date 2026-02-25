---
{
  "title": "EXTRACT_URL_PARAMETER",
  "description": "URL内のnameパラメータの値が存在する場合はその値を返し、存在しない場合は空文字列を返します。",
  "language": "ja"
}
---
## Description

URLに`name`パラメータが存在する場合はその値を返し、存在しない場合は空文字列を返します。

この名前を持つパラメータが複数ある場合、最初に出現するものが返されます。

この関数は、パラメータ名が渡されたパラメータと全く同じようにURLでエンコードされていることを前提として動作します。

URLの他の部分を取得したい場合は、[parse_url](parse-url.md)を使用できます。

## Syntax

```sql
EXTRACT_URL_PARAMETER ( <url> , <name> )
```
## Parameters

| Parameters | Description |
|------------|---------------|
| `<url>`    | 返される対象となるパラメータのurl文字列 |
| `<name>`   | 返される対象となるパラメータの名前 |

## Return Value

`<url>`内のパラメータ`<name>`の値

## Example

```sql
SELECT EXTRACT_URL_PARAMETER("http://doris.apache.org?k1=aa&k2=bb&test=cc#999", "k2")
```
```text
+--------------------------------------------------------------------------------+
| extract_url_parameter('http://doris.apache.org?k1=aa&k2=bb&test=cc#999', 'k2') |
+--------------------------------------------------------------------------------+
| bb                                                                             |
+--------------------------------------------------------------------------------+
```
