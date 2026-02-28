---
{
  "title": "COMPACT TABLE",
  "description": "storage-computing coupled モードにおいて、これは指定されたTableパーティション配下のすべてのレプリカに対してcompactionをトリガーするために使用されます。",
  "language": "ja"
}
---
## デスクリプション

storage-computing結合モードにおいて、指定されたTableパーティション配下のすべてのレプリカに対してcompactionをトリガーするために使用されます。

このコマンドはstorage-computing分離モードではサポートされていません。

## Syntax

```sql
ADMIN COMPACT TABLE <table_name> 
PARTITION <partition_name> 
WHERE TYPE={ BASE | CUMULATIVE }
```
## 必須パラメータ

<table_name>

> compactionを実行するTableの名前。

<partition_name>

> compactionを実行するパーティションの名前。（注意：この行はTable名の説明と重複しているため修正が必要です。パーティション名を指定する必要があります。）

TYPE={ BASE | CUMULATIVE }

> BASEはbase compactionの実行を指し、CUMULATIVEはcumulative compactionの実行を指します。詳細については、COMPACTIONセクションを参照してください。

## アクセス制御要件

このSQLコマンドを正常に実行するための前提条件は、ADMIN_PRIV権限を持つことです。権限ドキュメントを参照してください。

| Privilege  | Object                               | 注釈                           |
| :--------- | :----------------------------------- | :------------------------------ |
| ADMIN_PRIV | Entire cluster management privileges | All privileges except NODE_PRIV |

## 例

1. Tabletblのパーティションpar01に対してcumulative compactionを実行する。

  ```sql
  ADMIN COMPACT TABLE tbl PARTITION par01 WHERE TYPE='CUMULATIVE';
  ```
## 使用上の注意

1. このコマンドはstorage-computing separation modeではサポートされていません。このモードでこのコマンドを実行するとエラーが発生します。例：

  ```sql
  ADMIN COMPACT TABLE tbl PARTITION par01 WHERE TYPE='CUMULATIVE';
  ```
エラーメッセージは以下の通りです：

  ```Plain
  ERROR 1105 (HY000): errCode = 2, detailMessage = Unsupported operation
  ```
