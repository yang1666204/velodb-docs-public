---
{
  "title": "SHOW VARIABLES",
  "description": "このステートメントは、条件によってクエリすることができるDorisシステム変数を表示するために使用されます",
  "language": "ja"
}
---
## Description

このステートメントは、Dorisシステム変数を表示するために使用され、条件によってクエリできます。

## Syntax

```sql
SHOW [<effective_scope>] VARIABLES [<like_pattern> | <where>]
```
## オプションパラメータ
**1. `<effective_scope>`**
> Effective scopeは`GLOBAL`、`SESSION`、または`LOCAL`のいずれかです。effective scopeが指定されていない場合、デフォルト値は`SESSION`です。`LOCAL`は`SESSION`のエイリアスです。

**2. `<like_pattern>`**
> like文を使用して結果をマッチングおよびフィルタリングします

**3. `<where>`**
> where文を使用して結果をマッチングおよびフィルタリングします

## アクセス制御要件
このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| Privilege  | Object | Notes                                        |
| :--------- | :----- | :------------------------------------------- |
| Any_PRIV | Session  | 任意の権限でvariablesを表示可能 |


## 戻り値
| Variable_name | Value   | Default_Value                    | Changed |
|:--------------|:--------|:---------------------------------|:--------|
| variable name1      | value1 | default value1 |   0/1      |
| variable name2      | value2 | default value2 |   0/1      |


## 使用上の注意

- Show variablesは主にシステム変数の値を表示するために使用されます。
- SHOW VARIABLESコマンドの実行には特別な権限は必要なく、サーバーに接続できることのみが必要です。
- `戻り値`の`Changed`列について、0は変更なし、1は変更ありを意味します。
- `SHOW`文の使用には以下の制限があります：
  - where句で`or`を使用できません
  - 列名は左側に記述します
  - where句では等価比較のみサポートしています
  - variable_nameとのマッチングにはlike文を使用します
  - マッチングパターンの任意の位置で%パーセントワイルドカードを使用できます

## 例


- ここでのデフォルトはVariable_nameとのマッチングで、ここでは完全一致です

    ```sql
    show variables like 'max_connections';
    ```
パーセント記号（%）ワイルドカードによるマッチングは複数のアイテムにマッチすることができます

    ```sql
    show variables like '%connec%';
    ```
- Where句をマッチングクエリに使用する

    ```sql
    show variables where variable_name = 'version';
    ```
