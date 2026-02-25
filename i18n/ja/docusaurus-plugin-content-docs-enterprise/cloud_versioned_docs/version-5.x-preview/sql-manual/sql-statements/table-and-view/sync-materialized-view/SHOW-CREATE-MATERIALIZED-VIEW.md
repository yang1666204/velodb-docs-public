---
{
  "title": "SHOW CREATE SYNC MATERIALIZED VIEW",
  "description": "マテリアライズドビューの作成文を表示します。",
  "language": "ja"
}
---
## 説明

マテリアライズドビューの作成文を表示します。

## 構文

```sql
SHOW CREATE MATERIALIZED VIEW <materialized_view_name> ON <table_name>
```
## 必須パラメータ

**1. `<materialized_view_name>`**

> マテリアライズドビューの名前。

**2. `<table_name>`**

> マテリアライズドビューが属するテーブル。

## 戻り値

|列名 | 説明   |
| -- |------|
| TableName | テーブルの名前   |
| ViewName | マテリアライズドビューの名前 |
| CreateStmt | マテリアライズドビューの作成に使用されるステートメント |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、最低限以下の権限を持つ必要があります：

| 権限 | オブジェクト | 備考                                                        |
| --------- | ------ | ------------------------------------------------------------ |
| SELECT_PRIV/LOAD_PRIV/ALTER_PRIV/CREATE_PRIV/DROP_PRIV | Table  | 現在のマテリアライズドビューが属するテーブルの権限を持つ必要があります |

## 例

1. 同期マテリアライズドビューの作成ステートメントを表示

   ```sql
   SHOW CREATE MATERIALIZED VIEW sync_agg_mv on lineitem;
   ```
