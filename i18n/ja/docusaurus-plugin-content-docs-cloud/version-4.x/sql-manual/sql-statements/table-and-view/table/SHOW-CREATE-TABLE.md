---
{
  "title": "SHOW CREATE TABLE",
  "description": "この文は、データテーブルの作成文を表示するために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、データテーブルの作成ステートメントを表示するために使用されます。

## Syntax

```sql
SHOW [BRIEF] CREATE TABLE [<db_name>.]<table_name>
```
## 必須パラメータ
**1.`<table_name>`**
> テーブル識別子（名前）を指定します。これは、配置されているデータベース内で一意である必要があります。
>
> 識別子は英字（unicode名前サポートが有効な場合は任意の言語の文字）で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## オプションパラメータ
**1.`BRIEF`**
> カラム定義を除き、テーブルの基本情報のみを表示します。

**2.`<db_name>`**
> データベースの識別子（つまり名前）を指定します。
>
> 識別子は英字（unicode名前サポートが有効な場合は指定された言語の任意の文字）で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Database`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## 戻り値
| column name | description |
| -- |-------------|
| Table | テーブル名          |
| Create Table | テーブル作成文        |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege         | Object    | Notes                           |
|:------------------|:----------|:--------------------------------|
| Select_priv       | Table     | SHOW CREATE TABLEはテーブルのSELECT操作に属します |


## 例

1. テーブルの作成文を表示する

   ```sql
   SHOW CREATE TABLE demo.test_table;
   ```
2. テーブルの簡易テーブル作成文を表示する

   ```sql
   SHOW BRIEF CREATE TABLE demo.test_table;
   ```
