---
{
  "title": "COMPACT TABLE",
  "description": "storage-computing coupled modeでは、これは指定されたテーブルパーティション下のすべてのレプリカに対してcompactionをトリガーするために使用されます。",
  "language": "ja"
}
---
## 説明

ストレージ・コンピューティング結合モードにおいて、指定されたテーブルパーティション配下のすべてのレプリカに対してcompactionをトリガーするために使用されます。

このコマンドはストレージ・コンピューティング分離モードではサポートされていません。

## 構文

```sql
ADMIN COMPACT TABLE <table_name> 
PARTITION <partition_name> 
WHERE TYPE={ BASE | CUMULATIVE }
```
## 必須パラメータ

<table_name>

> compactionを実行するテーブルの名前。

<partition_name>

> compactionを実行するパーティションの名前。（注意：この行はテーブル名の説明を繰り返しているため修正が必要で、パーティション名を指定するべきです。）

TYPE={ BASE | CUMULATIVE }

> BASEはbase compactionの実行を指し、CUMULATIVEはcumulative compactionの実行を指します。詳細については、COMPACTIONセクションを参照してください。

## アクセス制御要件

このSQLコマンドを正常に実行するための前提条件は、ADMIN_PRIV権限を持つことです。権限に関するドキュメントを参照してください。

| Privilege  | Object                               | Notes                           |
| :--------- | :----------------------------------- | :------------------------------ |
| ADMIN_PRIV | Entire cluster management privileges | All privileges except NODE_PRIV |

## 例

1. テーブルtblのパーティションpar01に対してcumulative compactionを実行する。

  ```sql
  ADMIN COMPACT TABLE tbl PARTITION par01 WHERE TYPE='CUMULATIVE';
  ```
## 使用上の注意

1. このコマンドはstorage-computing separation modeではサポートされていません。このモードで実行するとエラーが発生します。例えば：

  ```sql
  ADMIN COMPACT TABLE tbl PARTITION par01 WHERE TYPE='CUMULATIVE';
  ```
エラーメッセージは以下の通りです：

  ```sql
  ERROR 1105 (HY000): errCode = 2, detailMessage = Unsupported operation
  ```
