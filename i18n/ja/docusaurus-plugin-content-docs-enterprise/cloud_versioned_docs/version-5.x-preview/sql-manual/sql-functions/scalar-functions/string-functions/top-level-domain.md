---
{
  "title": "TOP_LEVEL_DOMAIN",
  "description": "TOPLEVELDOMAIN関数は、URLからトップレベルドメインを抽出するために使用されます。入力URLが無効な場合、空の文字列を返します。",
  "language": "ja"
}
---
## 説明

TOP_LEVEL_DOMAIN関数は、URLからトップレベルドメインを抽出するために使用されます。入力URLが無効な場合は、空の文字列を返します。

## 構文

```sql
TOP_LEVEL_DOMAIN(<url>)
```
## Parameters
| Parameter | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `<url>` | トップレベルドメインを抽出するURL文字列。型: VARCHAR |

## Return Value

VARCHAR型を返し、抽出されたトップレベルドメインを表します。

特殊なケース:
- urlがNULLの場合はNULLを返します
- urlが有効なURL形式でない場合は空文字列を返します
- マルチレベルドメイン（例: .com.cn）の場合は最後のレベルドメインを返します

## Examples

1. 基本的なドメイン処理

```sql
SELECT top_level_domain('www.baidu.com');
```
```text
+-----------------------------------+
| top_level_domain('www.baidu.com') |
+-----------------------------------+
| com                               |
+-----------------------------------+
```
2. マルチレベルドメイン処理

```sql
SELECT top_level_domain('www.google.com.cn');
```
```text
+---------------------------------------+
| top_level_domain('www.google.com.cn') |
+---------------------------------------+
| cn                                    |
+---------------------------------------+
```
3. 無効なURL処理

```sql
SELECT top_level_domain('wwwwwwww');
```
```text
+------------------------------+
| top_level_domain('wwwwwwww') |
+------------------------------+
|                              |
+------------------------------+
```
