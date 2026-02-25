---
{
  "title": "I'm ready to translate the English technical documentation text into Japanese following your specified requirements. However, I notice that you've written \"BEGIN\" but haven't included the actual text content to translate yet. \n\nCould you please provide the English text that you'd like me to translate?",
  "description": "ユーザーはLabelを指定することができます。指定されていない場合、システムが自動的にLabelを生成します。",
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

> トランザクションに関連付けられるLabelを明示的に指定します。指定されない場合、システムが自動的に[label](../../../data-operate/transaction)を生成します。

## Notes

- 明示的なトランザクションがcommitまたはrollbackなしで開始された場合、再度BEGINコマンドを実行しても効果はありません。

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
