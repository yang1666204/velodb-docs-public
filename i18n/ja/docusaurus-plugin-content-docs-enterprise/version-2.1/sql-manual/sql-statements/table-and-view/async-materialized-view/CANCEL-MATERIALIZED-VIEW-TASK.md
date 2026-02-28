---
{
  "title": "CANCEL MATERIALIZED VIEW TASK",
  "description": "この文は、マテリアライズドビューのタスクをキャンセルするために使用されます。",
  "language": "ja"
}
---
## デスクリプション

このステートメントはマテリアライズドビューのタスクをキャンセルするために使用されます

## Syntax

```sql
CANCEL MATERIALIZED VIEW TASK <task_id> ON <mv_name>
```
## 必須パラメータ
**1. `<task_id>`**
> materialized viewのタスクIDを指定します。

**2. `<mv_name>`**
> materialized view名を指定します。
>
> materialized view名は文字で始まる必要があり（unicode名前サポートが有効な場合は任意の言語文字）、バッククォート（例：`My Object`）でmaterialized view名全体を囲まない限り、スペースや特殊文字を含むことはできません。
>
> materialized view名は予約キーワードを使用できません。
>
> 詳細については、Reserved Keywordsを参照してください。

## アクセス制御要件
このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| 権限       | オブジェクト | 備考                                        |
| :--------- | :----- | :------------------------------------------- |
| ALTER_PRIV | Materialized View  | CANCELはmaterialized viewのALTER操作です |

## 例

- materialized view mv1でID 1のタスクをキャンセルする

    ```sql
    CANCEL MATERIALIZED VIEW TASK 1 on mv1;
    ```
