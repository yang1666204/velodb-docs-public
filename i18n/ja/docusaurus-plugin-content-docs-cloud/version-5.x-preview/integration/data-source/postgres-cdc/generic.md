---
{
  "title": "Generic PostgreSQL Source の設定",
  "description": "Flink CDCを使用したVeloDBとのCDC同期のためのPostgreSQLサーバー設定",
  "language": "ja"
}
---
# VeloDB CDC向けGeneric PostgreSQL Sourceセットアップ

このガイドでは、Flink CDCを使用したVeloDBとのCDC（Change Data Capture）同期に必要なPostgreSQLサーバーの設定について説明します。

## サポート対象バージョン

| Database | Versions |
|----------|----------|
| PostgreSQL | 10, 11, 12, 13, 14, 15, 16, 17 |
| Amazon Aurora PostgreSQL | 10.x, 11.x, 12.x, 13.x, 14.x, 15.x, 16.x |
| Amazon RDS PostgreSQL | 10.x, 11.x, 12.x, 13.x, 14.x, 15.x, 16.x |

参考: [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)

---

## Logical Replicationの設定

PostgreSQL設定ファイル（`postgresql.conf`）に以下を追加または変更してください：

```ini
# Enable logical replication (required for CDC)
wal_level = logical

# Number of replication slots (at least 1 per CDC connection)
max_replication_slots = 4

# Number of WAL sender processes (at least 1 per CDC connection)
max_wal_senders = 4
```
### 設定パラメータ

| パラメータ | 必要な値 | 説明 |
|-----------|----------|------|
| `wal_level` | `logical` | 論理レプリケーションを有効にする（CDCに必要） |
| `max_replication_slots` | ≥ 1 | レプリケーションスロット数（CDCパイプライン1つにつき1つ） |
| `max_wal_senders` | ≥ 1 | WALセンダープロセス数 |

### PostgreSQLの再起動

`postgresql.conf`を変更した後、PostgreSQLを再起動してください：

```bash
# SystemD (Ubuntu/Debian/CentOS)
sudo systemctl restart postgresql

# macOS (Homebrew)
brew services restart postgresql@16

# Docker
docker restart <container_name>
```
### 設定の確認

```sql
SHOW wal_level;
SHOW max_replication_slots;
SHOW max_wal_senders;
```
期待される結果：

```
    wal_level
-----------------
 logical
(1 row)

 max_replication_slots
-----------------------
 4
(1 row)

 max_wal_senders
-----------------
 4
(1 row)
```
## User Permissions

レプリケーション権限を持つ専用のCDCユーザーを作成します：

```sql
CREATE USER cdc_user WITH REPLICATION LOGIN PASSWORD 'your_password';

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO cdc_user;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cdc_user;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cdc_user;
```
### PostgreSQL 15+ の場合

PostgreSQL 15+ では追加の権限が必要です：

```sql
GRANT pg_create_subscription TO cdc_user;
```
### 必要な権限

| 権限 | 目的 |
|-----------|---------|
| `REPLICATION` | CDCのためのWAL（Write-Ahead Log）の読み取り |
| `LOGIN` | データベースへの接続 |
| `SELECT` | 初期スナップショットのためのテーブルデータの読み取り |
| `pg_create_subscription` | PostgreSQL 15+で必要 |

### ユーザー権限の確認

```sql
SELECT usename, userepl FROM pg_user WHERE usename = 'cdc_user';
```
期待される結果:

```
  usename  | userepl
-----------+---------
 cdc_user  | t
(1 row)
```
## Publication Setup (オプション)

Aurora/RDS または本番環境では、手動でpublicationを作成してください：

```sql
-- As superuser (postgres)
CREATE PUBLICATION velodb_publication FOR ALL TABLES;
```
公開の確認:

```sql
SELECT * FROM pg_publication WHERE pubname = 'velodb_publication';
```
## REPLICA IDENTITY (DELETE操作に必要)

DELETE操作の完全な行データを取得するには：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```
> **注意:** `REPLICA IDENTITY FULL`なしでは、DELETEイベントは主キーのみを含みます。

---

## 接続テスト

CDCユーザーが以下を実行できることを確認してください：

1. **PostgreSQLへの接続:**

```bash
psql -h <host> -p 5432 -U cdc_user -d your_database
```
2. **テーブルの表示:**

```sql
\dt
```
3. **テーブルから選択:**

```sql
SELECT * FROM your_table LIMIT 5;
```
4. **レプリケーションステータスを確認する:**

```sql
SELECT * FROM pg_stat_replication;
```
## 次のステップ

PostgreSQLがCDC用に設定されたら、[Flink CDC Ingestion Guide](../postgres-cdc)に従ってVeloDBへのリアルタイム同期を設定してください。

---

## 参考資料

- [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
