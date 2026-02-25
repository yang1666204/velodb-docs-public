---
{
  "title": "DOMAIN_WITHOUT_WWW",
  "description": "文字列URLから接頭辞wwwを除いたドメイン名を抽出する",
  "language": "ja"
}
---
## Description

文字列URLからプレフィックスwwwを除いたドメイン名を抽出する

## Syntax

```sql
DOMAIN_WITHOUT_WWW ( <url> )
```
## Parameters

| Parameter | Description |
|-----------|----------------------|
| `<url>`   | wwwドメイン名を除いた`URL`を抽出する必要があります |

## Return value

Parameter `<url>` プレフィックスwwwを除いたドメイン名

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
