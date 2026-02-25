---
{
  "title": "BUILD INDEX のキャンセル",
  "description": "インデックス構築のバックグラウンドタスクをキャンセルします。",
  "language": "ja"
}
---
## Description

インデックス構築のバックグラウンドタスクをキャンセルします。

## Syntax

```sql
CANCEL BUILD INDEX ON <table_name> [ job_list ]
```
其中：

```sql
job_list
  : (<job_id1>[ , job_id2 ][ ... ])
```
## 必須パラメータ

**<table_name>**

> テーブルの識別子（つまり、名前）を指定します。これはDatabase内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（unicode名前サポートが有効な場合は任意の言語文字）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier RequirementsとReserved Keywordsを参照してください。

## オプションパラメータ

**<job_list>**

> インデックス構築タスクの識別子のリストを指定します。カンマで区切られ、括弧で囲まれます。
>
> 識別子は数値である必要があり、SHOW BUILD INDEXで確認できます。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| 権限       | オブジェクト | 注記                                                         |
| :--------- | :----------- | :----------------------------------------------------------- |
| ALTER_PRIV | Table        | CANCEL BUILD INDEXはテーブルに対するALTER操作と見なされます  |

## 使用上の注意

- 現在、inverted indexesに対してのみ有効で、bloomfilter indexなどの他のインデックスには有効ではありません。
- 現在、integrated storage and computing modeに対してのみ有効で、separated storage and computing modeには有効ではありません。
- BUILD INDEXの進行状況とインデックス構築タスクはSHOW BUILD INDEXで確認できます。

## 例

- テーブルtable1のすべてのインデックス構築タスクをキャンセル

  ```sql
  CANCEL BUILD INDEX ON TABLE table1
  ```
- テーブル table1 上のインデックス構築タスク jobid1 と jobid2 をキャンセルする

  ```sql
  CANCEL BUILD INDEX ON TABLE table1(jobid1, jobid2)
  ```
