---
{
  "title": "DOMAIN_WITHOUT_WWW",
  "description": "文字列URLから接頭辞wwwを除いたドメイン名を抽出する",
  "language": "ja"
}
---
## 説明

文字列URLから接頭辞wwwを除いたドメイン名を抽出します

## 構文

```sql
DOMAIN_WITHOUT_WWW ( <url> )
```
## Parameters

| Parameter | Description |
|-----------|----------------------|
| `<url>`   | www ドメイン名を除いた `URL` を抽出する必要があります |

## Return value

Parameter `<url>` プレフィックス www を除いたドメイン名

```sql
SELECT DOMAIN_WITHOUT_WWW("https://www.apache.org/docs/gettingStarted/what-is-apache-doris")
```
```text
+---------------------------------------------------------------------------------------+
| domain_without_www('https://www.apache.org/docs/gettingStarted/what-is-apache-doris') |
+---------------------------------------------------------------------------------------+
| apache.org                                                                            |
+---------------------------------------------------------------------------------------+
```
