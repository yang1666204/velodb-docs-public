---
{
  "title": "SHOW CREATE TABLE",
  "description": "このステートメントは、データTableの作成ステートメントを表示するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、データTableの作成ステートメントを表示するために使用されます。

## 構文

```sql
SHOW [BRIEF] CREATE TABLE [<db_name>.]<table_name>
```
## 必須パラメータ
**1.`<table_name>`**
> データベース内で一意である必要があるTable識別子（名前）を指定します。

> 識別子は英字で始まる必要があり（unicode name supportが有効な場合は任意の言語の文字）、識別子文字列全体がバッククォートで囲まれていない限り、スペースや特殊文字を含むことはできません（例：`My Object`）。

> 識別子は予約キーワードを使用できません。

> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## オプションパラメータ
**1.`BRIEF`**
> 列定義を除き、Tableに関する基本情報のみを表示します。

**2.`<db_name>`**
> データベースの識別子（つまり、名前）を指定します。

> 識別子は英字で始まる必要があり（unicode name supportが有効な場合は指定された言語の任意の文字）、識別子文字列全体がバッククォートで囲まれていない限り、スペースや特殊文字を含むことはできません（例：`My Database`）。

> 識別子は予約キーワードを使用できません。

> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## 戻り値
| column name | description |
| -- |-------------|
| Table | Table名          |
| Create Table | Table作成文        |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege         | Object    | 注釈                           |
|:------------------|:----------|:--------------------------------|
| Select_priv       | Table     | SHOW CREATE TABLEはTableのSELECT操作に属します |


## 例

1. Tableの作成文を表示する

   ```sql
   SHOW CREATE TABLE demo.test_table;
   ```
2. Tableの簡略化されたTable作成文を表示する

   ```sql
   SHOW BRIEF CREATE TABLE demo.test_table;
   ```
