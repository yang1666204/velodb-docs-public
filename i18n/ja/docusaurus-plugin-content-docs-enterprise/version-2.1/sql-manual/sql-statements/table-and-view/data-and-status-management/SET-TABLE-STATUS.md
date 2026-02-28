---
{
  "title": "SET TABLE STATUS",
  "description": "SET TABLE STATUS文は、OLAPTableのステータスを手動で設定するために使用されます。この文には以下の機能があります：",
  "language": "ja"
}
---
## 説明

`SET TABLE STATUS`文は、OLAPTableのステータスを手動で設定するために使用されます。この文には以下の機能があります：

- OLAPTableのステータス設定のみをサポートします。
- Tableステータスを指定されたターゲット状態に変更できます。
- Tableステータスによって引き起こされるタスクブロッキングを解決するために使用されます。

**サポートされる状態**：

| 状態              | 説明                                |
|-------------------|--------------------------------------|
| NORMAL            | Tableが正常な状態であることを示します。 |
| ROLLUP            | TableがROLLUP操作中であることを示します。 |
| SCHEMA_CHANGE     | Tableがスキーマ変更中であることを示します。 |
| BACKUP            | Tableがバックアップ操作中であることを示します。 |
| RESTORE           | Tableがリストア操作中であることを示します。 |
| WAITING_STABLE    | Tableが安定状態を待機中であることを示します。 |

## 構文

```sql
ADMIN SET TABLE <table_name> STATUS PROPERTIES ("<key>" = "<value>" [, ...]);
```
どこで：

```sql
<key>
  : "state"

<value>
  : "NORMAL"
  | "ROLLUP"
  | "SCHEMA_CHANGE"
  | "BACKUP"
  | "RESTORE"
  | "WAITING_STABLE"
```
## 必須パラメータ

**1. `<table_name>`**

> ステータスを設定する必要があるTableの名前を指定します。
>
> Table名はそのデータベース内で一意である必要があります。

**2. `PROPERTIES ("state" = "<value>")`**

> Tableの対象ステータスを指定します。
>
> "state"プロパティは設定する必要があり、その値はサポートされているステートの1つである必要があります。

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| Privilege       | Object      | 注釈                                         |
| :-------------- | :---------- | :-------------------------------------------- |
| ADMIN           | システム      | このコマンドを実行するには、ユーザーはADMIN権限を持つ必要があります。 |

## 使用上の注意

- このコマンドは緊急時の障害復旧を目的としており、慎重に使用してください。
- OLAPTableのみをサポートし、その他のタイプのTableはサポートしていません。
- Tableが既に対象ステートにある場合、このコマンドは無視されます。
- 不適切なステート設定はシステムの異常を引き起こす可能性があります。技術サポートの指導の下でこのコマンドを使用することを推奨します。
- ステータスの変更後は、システムの動作状況を速やかに監視することをお勧めします。

## 例

- TableステータスをNORMALに設定する：

    ```sql
    ADMIN SET TABLE tbl1 STATUS PROPERTIES("state" = "NORMAL");
    ```
- TableのステータスをSCHEMA_CHANGEに設定する:

    ```sql
    ADMIN SET TABLE tbl2 STATUS PROPERTIES("state" = "SCHEMA_CHANGE");
    ```
