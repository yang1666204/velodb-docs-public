---
{
  "title": "URL_ENCODE",
  "description": "提供されたテキストのURL エンコーディングを完了するために UTF-8 エンコーディングを使用します。通常、URL の一部として渡されるパラメータ情報をエンコードするために使用されます。",
  "language": "ja"
}
---
## 説明

提供されたテキストのURL符号化を完了するためにUTF-8エンコーディングを使用します。通常、URLの一部として渡されるパラメータ情報をエンコードするために使用されます。

## 構文

```sql
URL_ENCODE(  <str>  ) 
```
## Required Parameters

## Required Parameters
| Parameters | Description |
|------|------|
| `<str>` | エンコードする文字列 |

##  Return Value


UTF-8エンコーディングは提供されたテキストのURLエンコーディングを完了します

##  Example

```sql
select  URL_ENCODE('Doris Q&A');
```
```sql
+-------------------------+
| url_encode('Doris Q&A') |
+-------------------------+
| Doris+Q%26A             |
+-------------------------+

```
