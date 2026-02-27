---
{
  "title": "BEGIN",
  "description": "ユーザーはLabelを指定できます。指定されない場合、システムが自動的にLabelを生成します。",
  "language": "ja"
}
---
## Description

ユーザーはLabelを指定することができます。指定されない場合、システムが自動的にLabelを生成します。

## Syntax

```sql
BEGIN [ WITH LABEL <label> ]
```
## Optional Parameter

`[ WITH LABEL <label> ]`

> トランザクションに関連付けるLabelを明示的に指定します。指定しない場合、システムが自動的にラベルを生成します。

## Notes

- 明示的なトランザクションがcommitまたはrollbackなしで開始された場合、再度BEGINコマンドを実行しても効果がありません。

## Examples

システム生成のLabelを使用して明示的なトランザクションを開始する

```sql
mysql> BEGIN;
{'label':'txn_insert_624a0e16ef4c43d4-9814c7fa3e83a705', 'status':'PREPARE', 'txnId':''}
```
指定されたLabelで明示的なトランザクションを開始する

```sql
mysql> BEGIN WITH LABEL load_1;
{'label':'load_1', 'status':'PREPARE', 'txnId':''}
```
