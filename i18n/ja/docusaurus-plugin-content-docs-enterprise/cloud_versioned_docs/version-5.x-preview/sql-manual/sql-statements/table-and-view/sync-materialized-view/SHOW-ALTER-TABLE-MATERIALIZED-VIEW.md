---
{
  "title": "SHOW ALTER TABLE MATERIALIZED VIEW",
  "description": "同期マテリアライズドビューのビルドタスクのステータスを確認します。",
  "language": "ja"
}
---
## Description

同期化されたマテリアライズドビューのビルドタスクのステータスを確認します。

同期化されたマテリアライズドビューの作成は非同期操作であるため、マテリアライズドビューの作成タスクを送信した後、ユーザーはコマンドを通じて同期化されたマテリアライズドビューのビルドのステータスを非同期で確認する必要があります。

## Syntax

```sql
SHOW ALTER TABLE MATERIALIZED VIEW FROM <database>
```
## 必須パラメータ

**1. `<database>`**

> 同期マテリアライズドビューのベーステーブルが属するデータベース。

## 権限

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持っている必要があります：

| Privilege  | Object | Notes                                                        |
| ---------- | ------ | ------------------------------------------------------------ |
| ALTER_PRIV | Table  | 現在のマテリアライズドビューが属するテーブルに対するALTER_PRIV権限が必要 |

## 例

```sql
SHOW ALTER TABLE MATERIALIZED VIEW FROM doc_db;
```
