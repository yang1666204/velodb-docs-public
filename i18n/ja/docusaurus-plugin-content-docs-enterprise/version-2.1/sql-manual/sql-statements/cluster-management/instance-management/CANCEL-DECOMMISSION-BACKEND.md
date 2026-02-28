---
{
  "title": "CANCEL DECOMMISSION BACKEND",
  "description": "このステートメントは、BEノードの廃止操作をキャンセルするために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、BEノードの廃止操作をキャンセルするために使用されます。

## 構文

```sql
CANCEL DECOMMISSION BACKEND "<be_identifier>" [, "<be_identifier>" ... ]
```
ここで：

```sql
be_identifier
  : "<be_host>:<be_heartbeat_port>"
  | "<backend_id>"
```
## 必須パラメータ

**<be_host>**

> BEノードのホスト名またはIPアドレスを指定できます。

**<heartbeat_port>**

> BEノードのハートビートポートです。デフォルトは9050です。

**<backend_id>**

> BEノードのIDです。

:::tip
`<be_host>`、`<be_heartbeat_port>`、および`<backend_id>`は、すべて[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントでクエリすることで取得できます。
:::

## アクセス制御要件

このSQLを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege | Object | 注釈 |
|-----------|----|-------|
| NODE_PRIV |    |       |

## 使用上の注意

1. このコマンドを実行した後、[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントを通じて廃止ステータス（`SystemDecommissioned`列の値がfalse）と廃止の進行状況（`TabletNum`列の値がゆっくりと減少しなくなる）を確認できます。
2. クラスタは他のノードからタブレットを現在のBEにゆっくりと移行し戻すため、各BE上のタブレット数は最終的に近い値に収束する傾向があります。

## 例

1. BEのHostとHeartbeatPortに従って、クラスタから2つのノードを安全に廃止します。

   ```sql
   CANCEL DECOMMISSION BACKEND "192.168.0.1:9050", "192.168.0.2:9050";
   ```
2. BEのIDに従って、クラスターから1つのノードを安全に廃止します。

   ```sql
   CANCEL DECOMMISSION BACKEND "10002";
   ```
