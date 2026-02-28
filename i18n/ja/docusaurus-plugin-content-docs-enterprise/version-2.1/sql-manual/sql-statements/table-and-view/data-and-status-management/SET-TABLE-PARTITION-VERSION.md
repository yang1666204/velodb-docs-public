---
{
  "title": "SET TABLE PARTITION VERSION",
  "description": "compute-storage coupledモードにおいて、このステートメントは指定されたパーティションの可視バージョンを手動で変更するために使用されます。特定の特殊なケースでは、",
  "language": "ja"
}
---
## デスクリプション

compute-storage coupled modeにおいて、このステートメントは指定されたパーティションの可視バージョンを手動で変更するために使用されます。特殊なケースでは、メタデータ内のパーティションのバージョンが実際のレプリカのバージョンと一致しない場合があります。

このコマンドは、メタデータ内のパーティションのバージョンを手動で変更できます。このコマンドは通常、緊急時の障害復旧にのみ使用されます。慎重に操作してください。

## Syntax

```sql
ADMIN SET TABLE <table_name> PARTITION VERSION PROPERTIES ("<partition_id>" = "visible_version>");
```
## Required パラメータ

<table_name>

> 設定するTableの名前。

<partition_id>

> パーティション Idを指定します。

<visible_version>

> Versionを指定します。

## Examples

1. FEメタデータ内でpartition_id 10075のパーティションのversionを100に設定します。

  ```sql
  ADMIN SET TABLE __internal_schema.audit_log PARTITION VERSION PROPERTIES("partition_id" = "10075", "visible_version" = "100");
  ```
## 使用上の注意

1. パーティションのバージョンを設定する前に、BEマシン上の実際のレプリカのバージョンを確認する必要があります。このコマンドは一般的に緊急時の障害復旧にのみ使用されます。慎重に操作してください。
2. このコマンドはstorage-computing separation modeではサポートされていません。設定しても効果がありません。
