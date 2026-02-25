---
{
  "title": "SET TABLE PARTITION VERSION",
  "description": "compute-storage coupledモードにおいて。このステートメントは、指定されたパーティションの可視バージョンを手動で変更するために使用されます。特殊なケースにおいて、",
  "language": "ja"
}
---
## 概要

compute-storage結合モードにおいて、このステートメントは指定されたパーティションの可視バージョンを手動で変更するために使用されます。一部の特殊なケースでは、メタデータ内のパーティションのバージョンが実際のレプリカのバージョンと一致しない場合があります。

このコマンドはメタデータ内のパーティションのバージョンを手動で変更することができます。このコマンドは一般的に緊急時の障害復旧にのみ使用されます。慎重に操作してください。

## 構文

```sql
ADMIN SET TABLE <table_name> PARTITION VERSION PROPERTIES ("<partition_id>" = "visible_version>");
```
## Required Parameters

<table_name>

> 設定するテーブルの名前。

<partition_id>

> Partition Idを指定します。

<visible_version>

> Versionを指定します。

## Examples

1. FEメタデータでpartition_id 10075のパーティションのバージョンを100に設定します。

  ```sql
  ADMIN SET TABLE __internal_schema.audit_log PARTITION VERSION PROPERTIES("partition_id" = "10075", "visible_version" = "100");
  ```
## Usage Note

1. パーティションバージョンを設定する前に、BEマシン上の実際のreplicaのバージョンを確認する必要があります。このコマンドは一般的に緊急時の障害復旧にのみ使用されます。慎重に操作してください。
2. このコマンドはstorage-computing separationモードではサポートされていません。設定しても有効になりません。
