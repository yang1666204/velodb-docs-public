---
{
  "title": "UNSET VARIABLE",
  "description": "この文はDorisシステム変数を復元するために使用されます。これらのシステム変数はグローバルレベルまたはセッションレベルで変更することができます。",
  "language": "ja"
}
---
## Description

このステートメントは、Dorisシステム変数を復元するために使用されます。これらのシステム変数は、グローバルレベルまたはセッションレベルで変更することができます。

## Syntax

```sql
UNSET [<effective_scope>] VARIABLE (<variable_name>)
```
## 必須パラメータ
**1. `<variable_name>`**
> 変数名を指定します。すべての変数をunsetしたい場合は、このパラメータにキーワード`ALL`を指定できます。

## オプションパラメータ
**1. `<effective_scope>`**
> 有効スコープは`GLOBAL`、`SESSION`、`LOCAL`のいずれかです。有効スコープが指定されていない場合、デフォルト値は`SESSION`です。`LOCAL`は`SESSION`のエイリアスです。

## アクセス制御要件
このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege  | Object | Notes                                        |
| :--------- | :----- | :------------------------------------------- |
| ADMIN_PRIV | Session  | unset global variables need admin privilege |

## 使用上の注意

- ADMINユーザーのみがグローバルに有効な変数のunsetを実行できます
- `GLOBAL`で変数を復元した場合、現在使用中のセッションと新しく開かれるセッションにのみ影響します。他の現在開かれているセッションには影響しません。

## 例

- タイムゾーンの値を復元

   ```
   UNSET VARIABLE time_zone;
   ```
- グローバル実行メモリサイズを復元する

   ```
   UNSET GLOBAL VARIABLE exec_mem_limit;
   ```
- すべての変数をグローバルに復元する

   ```
   UNSET GLOBAL VARIABLE ALL;
   ```
