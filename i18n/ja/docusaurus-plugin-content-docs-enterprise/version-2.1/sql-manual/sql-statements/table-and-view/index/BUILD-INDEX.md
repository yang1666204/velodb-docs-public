---
{
  "title": "BUILD INDEX",
  "description": "Table全体またはTableパーティションのインデックスを構築します。Table名とインデックス名を指定する必要があり、オプションでパーティションリストを指定することができます。",
  "language": "ja"
}
---
## デスクリプション

Table全体またはTableパーティション用のインデックスを構築します。Table名とインデックス名を指定する必要があり、オプションでパーティションリストを指定できます。

## Syntax

```sql
BUILD INDEX <index_name> ON <table_name> [partition_list]
```
ここで:

```sql
partition_list
  : PARTITION (<partition_name1>[ , parition_name2 ][ ... ])
```
## 必須パラメータ

**<index_name>**

> indexの識別子（名前）を指定します。これはTable内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（unicode name supportが有効な場合は任意の言語の文字）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用することはできません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

**<table_name>**

> Tableの識別子（名前）を指定します。これはデータベース内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（unicode name supportが有効な場合は任意の言語の文字）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用することはできません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## オプションパラメータ

**<partition_list>**

> カンマで区切られたパーティション識別子（名前）のリストを指定します。これらはTable内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（unicode name supportが有効な場合は任意の言語の文字）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用することはできません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege  | Object | 注釈                                        |
| :--------- | :----- | :------------------------------------------- |
| ALTER_PRIV | Table  | BUILD INDEX is an ALTER operation on a table |

## 使用上の注意

- 現在、inverted indexに対してのみ有効で、BloomFilter indexなどの他のindexには有効ではありません。
- 現在、compute-storage integrated modeでのみ有効で、compute-storage separated modeでは有効ではありません。
- BUILD INDEXの進行状況は、SHOW BUILD INDEXで確認できます

## 例

- Table全体table1にindex1を構築します。

  ```sql
  BUILD INDEX index1 ON table1
  ```
- table1のパーティションp1とp2にインデックスindex1を構築する。

  ```sql
  BUILD INDEX index1 ON table1 PARTITION(p1, p2)
  ```
