---
{
  "title": "Aurora RDS PostgreSQL ソースセットアップ",
  "description": "Flink CDCを使用したVeloDBとのCDC同期のためのAurora RDS PostgreSQL設定",
  "language": "ja"
}
---
# Aurora RDS PostgreSQL Source Setup for VeloDB CDC

このガイドでは、Flink CDCを使用してVeloDBとのCDC（Change Data Capture）同期を行うためのAurora RDS PostgreSQL設定について説明します。

## サポート対象バージョン

| Database | Versions |
|----------|----------|
| Aurora RDS PostgreSQL | 13.x, 14.x, 15.x, 16.x |

参考：[Aurora PostgreSQL CDC](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Replication.Logical.html)

---

## Logical Replicationの有効化

Auroraでは`postgresql.conf`を直接編集する代わりにパラメータグループを使用します。

### 1. パラメータグループの作成

AWSコンソールで**RDS > Parameter groups**に移動し、既存のパラメータグループを確認します：

![Parameter Groups List](/images/cloud/integration/postgres/aurora-rds-00-parameter-groups-list.png)

logical replicationを有効にしたカスタムクラスターパラメータグループを作成します：

![Create Parameter Group](/images/cloud/integration/postgres/aurora-rds-01-parameter-group-create.png)

> **重要：** Auroraクラスターの場合は、タイプとして**DB Cluster Parameter Group**を選択してください（DB Parameter Groupではありません）。

```bash
aws rds create-db-cluster-parameter-group \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --db-parameter-group-family aurora-postgresql16 \
    --description "Aurora PostgreSQL with CDC enabled"

aws rds modify-db-cluster-parameter-group \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --parameters "ParameterName=rds.logical_replication,ParameterValue=1,ApplyMethod=pending-reboot"
```
または、AWS Consoleでパラメータグループを編集し、`rds.logical_replication`を`1`に設定することで設定できます：

![Edit Parameter Group - rds.logical_replication](/images/cloud/integration/postgres/aurora-rds-02-parameter-group-edit.png)

### 2. Clusterに適用

```bash
aws rds modify-db-cluster \
    --db-cluster-identifier your-cluster-name \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --apply-immediately
```
### 3. クラスタの再起動

`rds.logical_replication` を有効にするために再起動が必要です：

```bash
aws rds reboot-db-instance --db-instance-identifier your-instance-name
```
### 設定の確認

```sql
SHOW rds.logical_replication;
```
期待される結果:

```
 rds.logical_replication
-------------------------
 on
(1 row)
```
## ユーザー権限

Auroraでは、SUPERUSER属性の代わりに特定のロールが必要です。

### CDCユーザーの作成

```sql
-- Create user (no REPLICATION or SUPERUSER attributes)
CREATE USER cdc_user WITH LOGIN PASSWORD 'your_password';

-- Grant Aurora-specific roles
GRANT rds_replication TO cdc_user;
GRANT rds_superuser TO cdc_user;
GRANT pg_read_all_data TO cdc_user;

-- Grant database-level permissions
GRANT CONNECT ON DATABASE your_database TO cdc_user;
GRANT ALL ON DATABASE your_database TO cdc_user;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO cdc_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cdc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cdc_user;
```
### 必要なAuroraロール

| ロール | 目的 |
|------|---------|
| `rds_replication` | レプリケーションスロットの作成とWALの読み取り |
| `rds_superuser` | パブリケーションの管理（CDCに必要） |
| `pg_read_all_data` | 全スキーマの全テーブルの読み取り |

> **注意:** Auroraマスターユーザーは完全なSUSERUSER権限を持ちません。代わりにロールを使用してください。

### ユーザー権限の確認

```sql
SELECT r.rolname, ARRAY(
    SELECT b.rolname
    FROM pg_catalog.pg_auth_members m
    JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
    WHERE m.member = r.oid
) as memberof
FROM pg_roles r
WHERE r.rolname = 'cdc_user';
```
期待される結果:

```
  rolname  |                     memberof
-----------+--------------------------------------------------
 cdc_user  | {pg_read_all_data,rds_superuser,rds_replication}
(1 row)
```
## Publication Setup

master user (postgres) として publication を作成する:

```sql
-- As postgres user
CREATE PUBLICATION velodb_publication FOR ALL TABLES;
```
公開を確認:

```sql
SELECT * FROM pg_publication WHERE pubname = 'velodb_publication';
```
> **重要:** Auroraを使用する場合、Flink CDCに`--postgres-conf publication.name=velodb_publication`を渡してください。

---

## REPLICA IDENTITY (DELETEに必要)

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```
## Connection Test

CDC ユーザーが以下を実行できることを確認してください：

1. **Connect:**

```bash
psql -h your-cluster.cluster-xxxxx.us-west-2.rds.amazonaws.com -p 5432 -U cdc_user -d your_database
```
2. **公開物の一覧表示:**

```sql
SELECT * FROM pg_publication;
```
3. **テーブルの読み取り:**

```sql
SELECT COUNT(*) FROM your_table;
```
## Next Steps

Aurora RDS が CDC 用に設定されたら、[Flink CDC Ingestion Guide](../postgres-cdc) に従って VeloDB へのリアルタイム同期を設定してください。

**Aurora で Flink CDC を実行する際は** `--postgres-conf publication.name=velodb_publication` を追加することを忘れないでください。

---

## Sources

- [Aurora PostgreSQL Logical Replication](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Replication.Logical.html)
- [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)
