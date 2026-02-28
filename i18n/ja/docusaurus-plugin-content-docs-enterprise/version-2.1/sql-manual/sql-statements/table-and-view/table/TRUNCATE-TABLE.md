---
{
  "title": "TRUNCATE TABLE",
  "description": "この文は、指定されたTableおよびパーティションのデータをクリアするために使用されます。",
  "language": "ja"
}
---
## デスクリプション

このステートメントは、指定されたTableとパーティションのデータをクリアするために使用されます。

## Syntax

```sql
TRUNCATE TABLE [<db_name>.]<table_name>[ PARTITION ( <partition_name1> [, <partition_name2> ... ] ) ];
```
## 必須パラメータ

**1.`<db_name>`**
> データベースの識別子（名前）を指定します。
>
> 識別子は英字（unicode name supportが有効な場合は指定された言語の任意の文字）で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Database`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

**2.`<table_name>`**
> Table識別子（名前）を指定します。これは、配置されているデータベース内で一意である必要があります。
>
> 識別子は英字（unicode name supportが有効な場合は言語の任意の文字）で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## オプションパラメータ
**1.`<partition_name>`**
> パーティションの識別子（名前）を指定します。
>
> 識別子は英字（unicode name supportが有効な場合はスクリプトの任意の文字）で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、Identifier Requirements and Reserved Keywordsを参照してください。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege       | Object    | 注釈                      |
|:----------------|:----------|:---------------------------|
| Drop_priv       | Table     | TRUNCATE TABLEはTableのDROP操作に属します |

## 使用上の注意

- このステートメントはデータをクリアしますが、Tableまたはパーティションは保持されます。
- DELETEとは異なり、このステートメントは指定されたTableまたはパーティション全体のみをクリアでき、フィルタリング条件を追加することはできません。
- DELETEとは異なり、この方法でデータをクリアしてもクエリパフォーマンスに影響しません。
- この操作によって削除されたデータは復旧できません。
- このコマンドを使用する際、Tableの状態はNORMALである必要があります。つまり、SCHEMA CHANGEなどの操作は許可されません。
- このコマンドは進行中のインポートを失敗させる可能性があります。

## 例

1. example_db下のTabletblをクリアする

    ```sql
    TRUNCATE TABLE example_db.tbl;
    ```
2. Table tbl の p1 および p2 パーティションをクリアする

    ```sql
    TRUNCATE TABLE tbl PARTITION(p1, p2);
    ```
