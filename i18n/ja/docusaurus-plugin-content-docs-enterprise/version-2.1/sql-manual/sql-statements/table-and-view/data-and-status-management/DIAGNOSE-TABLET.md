---
{
  "title": "TABLET の診断",
  "description": "compute-storage coupled モードでは、このステートメントは指定されたタブレットを診断するために使用されます。",
  "language": "ja"
}
---
## 説明

compute-storage coupled モードでは、このステートメントは指定されたタブレットを診断するために使用されます。結果には、タブレットに関する情報といくつかの潜在的な問題が表示されます。

このコマンドはcompute-storage coupledモードではサポートされていません。

## 構文

```sql
SHOW TABLET DIAGNOSIS <tablet_id>;
```
## 必須パラメータ

<tablet_id>

> 診断対象のtabletのID

## 戻り値 (Return Value)

tabletに関する情報を返します

- TabletExist

  > tabletが存在するかどうか

- TabletId

    > Tablet ID

- Database

  > tabletが属するDBとそのID

- Table

  > tabletが属するTableとそのID

- パーティション

  > tabletが属するPartitionとそのID

- MaterializedIndex

  > tabletが属するマテリアライズドビューとそのID

- Replicas

  > tabletのレプリカと対応するBE

- ReplicasNum

  > レプリカ数が正しいかどうか

- ReplicaBackendStatus

  > レプリカが配置されているBEノードが正常かどうか

- ReplicaVersionStatus

  > レプリカのバージョン番号が正常かどうか

- ReplicaStatus

  > レプリカのステータスが正常かどうか

- ReplicaCompactionStatus

  > レプリカのcompactionステータスが正常かどうか

## 例

1. 指定されたtablet id 10078のtabletの情報を診断する

  ```sql
  show tablet diagnosis 10078;
  +----------------------------------+---------------------------------------------+------------+
  | Item                             | Info                                        | Suggestion |
  +----------------------------------+---------------------------------------------+------------+
  | TabletExist                      | Yes                                         |            |
  | TabletId                         | 10078                                       |            |
  | Database                         | __internal_schema: 10005                    |            |
  | Table                            | audit_log: 10058                            |            |
  | パーティション                        | p20241109: 10075                            |            |
  | MaterializedIndex                | audit_log: 10059                            |            |
  | Replicas(ReplicaId -> BackendId) | {"10099":10003,"10116":10002,"10079":10004} |            |
  | ReplicasNum                      | OK                                          |            |
  | ReplicaBackendStatus             | OK                                          |            |
  | ReplicaVersionStatus             | OK                                          |            |
  | ReplicaStatus                    | OK                                          |            |
  | ReplicaCompactionStatus          | OK                                          |            |
  +----------------------------------+---------------------------------------------+------------+
  ```
## Access Control Requirements (Access Control Requirements)

このSQLコマンドを正常に実行するための前提条件は、ADMIN_PRIV権限を持つことです。権限に関するドキュメントを参照してください。

| Privilege (Privilege) | Object (Object)                      | 注釈 (注釈)                   |
| :-------------------- | :----------------------------------- | :------------------------------ |
| ADMIN_PRIV            | クラスター全体の管理権限 | NODE_PRIV以外のすべての権限 |

## Usage Note (Usage Note)

1. このコマンドはストレージ・コンピューティング分離モードではサポートされていません。このモードで実行するとエラーが発生します。例：

  ```sql
  show tablet diagnosis 15177;
  ```
エラーメッセージは以下の通りです：

  ```Plain
  ERROR 1105 (HY000): errCode = 2, detailMessage = Unsupported operation
  ```
