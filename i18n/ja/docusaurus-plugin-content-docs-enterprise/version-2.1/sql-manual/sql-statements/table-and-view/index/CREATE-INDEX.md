---
{
  "title": "CREATE INDEX",
  "description": "Tableに新しいインデックスを作成します。Table名とインデックス名を指定する必要があります。オプションで、インデックスタイプ、プロパティ、およびコメントを指定できます。",
  "language": "ja"
}
---
## 説明

Tableに新しいindexを作成します。Table名とindex名を指定する必要があります。オプションで、indexタイプ、プロパティ、およびコメントを指定できます。

## 構文

```sql
CREATE INDEX [IF NOT EXISTS] <index_name> 
             ON <table_name> (<column_name> [, ...])
             [USING {INVERTED | NGRAM_BF}]
             [PROPERTIES ("<key>" = "<value>"[ , ...])]
             [COMMENT '<index_comment>']
```
## 必須パラメータ

**1. `<index_name>`**

> indexの識別子（つまり名前）を指定します。これはTable内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（Unicode名前サポートが有効な場合、任意の言語の任意の文字を使用可能）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードにすることはできません。
>
> 詳細については、識別子と予約キーワードの要件を参照してください。

**2. `<table_name>`**

> Tableの識別子（つまり名前）を指定します。これはデータベース内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（Unicode名前サポートが有効な場合、任意の言語の任意の文字を使用可能）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードにすることはできません。
>
> 詳細については、識別子と予約キーワードの要件を参照してください。

**3. `<column_name> [, ...]`**

> indexを作成するカラムを指定します（現在は1つのカラムのみサポート）。カラムはTable内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（Unicode名前サポートが有効な場合、任意の言語の任意の文字を使用可能）、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードにすることはできません。
>
> 詳細については、識別子と予約キーワードの要件を参照してください。

## オプションパラメータ

**1. `USING {INVERTED | NGRAM_BF}`**

> indexタイプを指定します。現在、2つのタイプがサポートされています：**INVERTED**（転置index）と**NGRAM_BF**（ngram bloomfilter index）。

**2. `PROPERTIES ("<key>" = "<value>"[ ,  ...])`**

> 一般的なPROPERTIES形式を使用してindexのパラメータを指定します。各indexがサポートするパラメータとセマンティクスについては、特定のindexタイプのドキュメントを参照してください。

**3. `COMMENT '<index_comment>'`**

> メンテナンスを容易にするためのindexのコメントを指定します。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持っている必要があります：

| 権限       | オブジェクト | 備考                                                |
| ---------- | ------ | ---------------------------------------------------------- |
| ALTER_PRIV | Table  | CREATE INDEXはTableに対するALTER操作とみなされます |

## 使用上の注意

- **INVERTED**転置indexは、新しく挿入されるデータに対して即座に有効になります。履歴データについては、BUILD INDEX操作を使用してindexを構築する必要があります。
- **NGRAM_BF** NGram BloomFilter indexは、作成後にすべてのデータに対してバックグラウンドでスキーマ変更を実行し、index構築を完了します。進捗はSHOW ALTER TABLE COLUMNを使用して確認できます。

## 例

- `table1`に転置index `index1`を作成

  ```sql
  CREATE INDEX index1 ON table1 USING INVERTED;
  ```
- `table1`に対してNGram BloomFilterインデックス`index2`を作成する

  ```sql
  CREATE INDEX index2 ON table1 USING NGRAM_BF PROPERTIES("gram_size"="3", "bf_size"="1024");
  ```
