---
{
  "title": "BACKEND の廃止",
  "description": "この文は、クラスターからBEノードを安全に廃止するために使用されます。この操作は非同期です。",
  "language": "ja"
}
---
## Description

このステートメントは、クラスターからBEノードを安全に廃止するために使用されます。この操作は非同期です。

## Syntax

```sql
ALTER SYSTEM DECOMMISSION BACKEND "<be_identifier>" [, "<be_identifier>" ... ]
```
ここで：

```sql
be_identifier
  : "<be_host>:<be_heartbeat_port>"
  | "<backend_id>"
```
## 必須パラメータ

**1. <be_host>**

> BEノードのホスト名またはIPアドレスを指定できます。

**2. <heartbeat_port>**

> BEノードのハートビートポートです。デフォルトは9050です。

**3. <backend_id>**

> BEノードのIDです。

:::tip
`<be_host>`、`<be_heartbeat_port>`、`<backend_id>`は全て[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントでクエリすることで取得できます。
:::

## アクセス制御要件

このSQLを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege | Object | Notes |
|-----------|----|-------|
| NODE_PRIV |    |       |

## 使用上の注意

1. このコマンドを実行した後、[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントを使用して廃止状況（`SystemDecommissioned`列の値が`true`）と廃止進捗（`TabletNum`列の値が徐々に0まで低下）を確認できます。
2. 通常の状況では、`TabletNum`列の値が0まで低下した後、このBEノードは削除されます。DorisにBEを自動削除させたくない場合は、FE Masterの設定`drop_backend_after_decommission`をfalseに変更できます。
3. 現在のBEが比較的大量のデータを保存している場合、DECOMMISSION操作は数時間または数日間続く可能性があります。
4. DECOMMISSION操作の進捗が停滞した場合、具体的には[SHOW BACKENDS](./SHOW-BACKENDS.md)ステートメントの`TabletNum`列が特定の値で固定されている場合、以下の状況が原因である可能性があります：
   - 現在のBE上のタブレットを移行する適切な他のBEが存在しない。例えば、3レプリカを持つテーブルがある3ノードクラスタで、そのうちの1つのノードが廃止される場合、このノードはデータを移行する他のBEを見つけることができません（他の2つのBEは既にそれぞれ1つのレプリカを持っています）。
   - 現在のBE上のタブレットがまだ[Recycle Bin](../../recycle/SHOW-CATALOG-RECYCLE-BIN.md)内にある。ごみ箱を空にしてから廃止を待つことができます。
   - 現在のBE上のタブレットが大きすぎて、単一タブレットの移行が常にタイムアウトし、このタブレットを移行できない。FE Masterの設定`max_clone_task_timeout_sec`をより大きな値に調整できます（デフォルトは7200秒）。
   - 現在のBEのタブレット上に未完了のトランザクションが存在する。トランザクションの完了を待つか、手動でトランザクションを中止できます。
   - その他の場合、FE Masterのログで`replicas to decommission`キーワードをフィルタリングして異常なタブレットを見つけ、[SHOW TABLET](../../table-and-view/data-and-status-management/SHOW-TABLET.md)ステートメントを使用してこのタブレットが属するテーブルを見つけ、その後新しいテーブルを作成し、古いテーブルから新しいテーブルにデータを移行し、最後に[DROP TABLE FORCE](../../table-and-view/table/DROP-TABLE.md)を使用して古いテーブルを削除します。

## 例

1. BEのHostとHeartbeatPortに従って、クラスタから2つのノードを安全に廃止する。

   ```sql
   ALTER SYSTEM DECOMMISSION BACKEND "192.168.0.1:9050", "192.168.0.2:9050";
   ```
2. BEのIDに従ってクラスターからノードを安全に廃止する。

    ```sql
    ALTER SYSTEM DECOMMISSION BACKEND "10002";
    ```
