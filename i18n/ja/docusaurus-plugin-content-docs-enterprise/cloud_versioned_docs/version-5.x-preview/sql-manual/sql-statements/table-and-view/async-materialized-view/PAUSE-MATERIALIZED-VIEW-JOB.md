---
{
  "title": "MATERIALIZED VIEW JOBを一時停止する",
  "description": "この文は、マテリアライズドビューのスケジュールされたスケジューリングを一時停止するために使用されます",
  "language": "ja"
}
---
## Description

このステートメントは、マテリアライズドビューのスケジュールされたスケジューリングを一時停止するために使用されます

## Syntax

```sql
PAUSE MATERIALIZED VIEW JOB ON <mv_name>
```
## 必須パラメータ
**1. `<mv_name>`**
> マテリアライズドビュー名を指定します。
>
> マテリアライズドビュー名は文字で始まる必要があり（unicode name supportが有効な場合は任意の言語文字）、マテリアライズドビュー名全体がバッククォートで囲まれていない限り（例：`My Object`）、スペースや特殊文字を含むことはできません。
>
> マテリアライズドビュー名は予約キーワードを使用できません。
>
> 詳細については、Reserved Keywordsを参照してください。


## アクセス制御要件
このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege  | Object | Notes                                        |
| :--------- | :----- | :------------------------------------------- |
| ALTER_PRIV | Materialized View  | PAUSEはマテリアライズドビューに対するALTER操作です |


## 使用上の注意

- このステートメントを使用した後、RESUME materialized viewステートメントを使用して復元できます。


## 例

- マテリアライズドビューmv1のスケジュール実行を一時停止する

    ```sql
    PAUSE MATERIALIZED VIEW JOB ON mv1;
    ```
