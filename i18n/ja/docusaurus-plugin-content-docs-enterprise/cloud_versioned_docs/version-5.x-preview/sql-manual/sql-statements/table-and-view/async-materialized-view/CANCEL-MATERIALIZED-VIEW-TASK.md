---
{
  "title": "CANCEL MATERIALIZED VIEW TASK",
  "description": "この文は、マテリアライズドビューのタスクをキャンセルするために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントはマテリアライズドビューのタスクをキャンセルするために使用されます

## 構文

```sql
CANCEL MATERIALIZED VIEW TASK <task_id> ON <mv_name>
```
## 必須パラメーター
**1. `<task_id>`**
> materialized viewのタスクIDを指定します。


**2. `<mv_name>`**
> materialized view名を指定します。
>
> materialized view名は文字（unicode名前サポートが有効な場合は任意の言語文字）で始まる必要があり、materialized view名文字列全体がバッククォート（例：`My Object`）で囲まれていない限り、スペースや特殊文字を含めることはできません。
>
> materialized view名は予約キーワードを使用できません。
>
> 詳細については、Reserved Keywordsを参照してください。

## アクセス制御要件
このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| 権限  | オブジェクト | 備考                                        |
| :--------- | :----- | :------------------------------------------- |
| ALTER_PRIV | Materialized View  | CANCELはmaterialized viewに対するALTER操作です |

## 例

- materialized view mv1でID 1のタスクをキャンセルする

    ```sql
    CANCEL MATERIALIZED VIEW TASK 1 on mv1;
    ```
