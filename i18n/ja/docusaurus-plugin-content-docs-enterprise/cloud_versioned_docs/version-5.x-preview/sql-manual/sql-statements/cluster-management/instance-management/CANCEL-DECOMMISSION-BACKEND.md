---
{
  "title": "BACKEND のデコミッション取り消し",
  "description": "この文は、BEノードの廃止操作をキャンセルするために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、BEノードの廃止操作をキャンセルするために使用されます。

:::tip
このステートメントは、ストレージとコンピューティングの分離モードではサポートされていません。
:::

## 構文

```sql
CANCEL DECOMMISSION BACKEND "<be_identifier>" [, "<be_identifier>" ... ]
```
ここで:

```sql
be_identifier
  : "<be_host>:<be_heartbeat_port>"
  | "<backend_id>"
```
## 必須パラメータ

**<be_host>**

> BEノードのホスト名またはIPアドレスを指定できます。

**<heartbeat_port>**

> BEノードのハートビートポート。デフォルトは9050です。

**<backend_id>**

> BEノードのIDです。

:::tip
`<be_host>`、`<be_heartbeat_port>`、および`<backend_id>`は、すべて[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントでクエリすることで取得できます。
:::

## アクセス制御要件

このSQLを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | Notes |
|-----------|----|-------|
| NODE_PRIV |    |       |

## 使用上の注意

1. このコマンドを実行した後、[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントでデコミッション状態（`SystemDecommissioned`列の値がfalse）とデコミッション進行状況（`TabletNum`列の値がゆっくり減少しなくなる）を確認できます。
2. クラスタは他のノードから現在のBEにタブレットをゆっくりと移行し、各BEのタブレット数が最終的に近似するように調整されます。

## 例

1. BEのHostとHeartbeatPortに基づいて、クラスタから2つのノードを安全にデコミッションします。

   ```sql
   CANCEL DECOMMISSION BACKEND "192.168.0.1:9050", "192.168.0.2:9050";
   ```
2. BEのIDに従って、クラスターから1つのノードを安全に廃止します。

   ```sql
   CANCEL DECOMMISSION BACKEND "10002";
   ```
