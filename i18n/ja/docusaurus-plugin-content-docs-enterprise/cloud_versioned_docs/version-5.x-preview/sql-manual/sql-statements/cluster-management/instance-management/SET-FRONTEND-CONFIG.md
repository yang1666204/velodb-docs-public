---
{
  "title": "FRONTEND CONFIGを設定",
  "description": "この文は、クラスターの設定項目を設定するために使用されます（現在はFE設定項目の設定のみをサポートしています）。",
  "language": "ja"
}
---
## 説明

このステートメントは、クラスターの設定項目を設定するために使用されます（現在はFE設定項目の設定のみサポートしています）。

## 構文:

```sql
ADMIN SET {ALL FRONTENDS | FRONTEND} CONFIG ("<fe_config_key>" = "<fe_config_value>")
```
## 必要なパラメータ
**`{ALL FRONTENDS | FRONTEND}`**
> **`ALL FRONTENDS`**: Dorisクラスター内のすべてのFEノードを表します
>
> **`FRONTEND`**: 現在接続されているFEノード、すなわちユーザーが操作しているFEノードを表します

## オプションパラメータ
変更する必要がある`<fe_config_key>`と`<fe_config_value>`は、[SHOW FRONTEND CONFIG](./SHOW-FRONTEND-CONFIG)コマンドで確認できます

:::tip 説明

- バージョン2.0.11および2.1.5以降、`ALL`キーワードがサポートされています。`ALL`キーワードを使用する場合、設定パラメータはすべてのFEに適用されます（`master_only`パラメータを除く）。
- この構文は設定を永続的に変更しません。FEが再起動すると、変更された設定は無効になります。変更を永続化するには、fe.confに設定項目を同期的に追加する必要があります。
:::

## 例

1. `disable_balance`を`true`に設定

    ```sql
    ADMIN SET FRONTEND CONFIG ("disable_balance" = "true");
    ```
2. すべてのFEノードの`disable_balance`を`true`に設定する

   ```sql
   ADMIN SET ALL FRONTENDS CONFIG ("disable_balance" = "true");
   ```
