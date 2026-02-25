---
{
    "title": "Aurora RDS PostgreSQL Source Setup",
    "language": "en",
    "description": "Aurora RDS PostgreSQL configuration for CDC synchronization with VeloDB using Flink CDC"
}
---

# Aurora RDS PostgreSQL Source Setup for VeloDB CDC

This guide covers Aurora RDS PostgreSQL configuration for CDC (Change Data Capture) synchronization with VeloDB using Flink CDC.

## Supported Versions

| Database | Versions |
|----------|----------|
| Aurora RDS PostgreSQL | 13.x, 14.x, 15.x, 16.x |

Reference: [Aurora PostgreSQL CDC](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Replication.Logical.html)

---

## Enable Logical Replication

Aurora uses parameter groups instead of direct `postgresql.conf` editing.

### 1. Create Parameter Group

Navigate to **RDS > Parameter groups** in the AWS Console to view existing parameter groups:

![Parameter Groups List](/images/cloud/integration/postgres/aurora-rds-00-parameter-groups-list.png)

Create a custom cluster parameter group with logical replication enabled:

![Create Parameter Group](/images/cloud/integration/postgres/aurora-rds-01-parameter-group-create.png)

> **Important:** Select **DB Cluster Parameter Group** as the type (not DB Parameter Group) for Aurora clusters.

```bash
aws rds create-db-cluster-parameter-group \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --db-parameter-group-family aurora-postgresql16 \
    --description "Aurora PostgreSQL with CDC enabled"

aws rds modify-db-cluster-parameter-group \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --parameters "ParameterName=rds.logical_replication,ParameterValue=1,ApplyMethod=pending-reboot"
```

Or configure via AWS Console by editing the parameter group and setting `rds.logical_replication` to `1`:

![Edit Parameter Group - rds.logical_replication](/images/cloud/integration/postgres/aurora-rds-02-parameter-group-edit.png)

### 2. Apply to Cluster

```bash
aws rds modify-db-cluster \
    --db-cluster-identifier your-cluster-name \
    --db-cluster-parameter-group-name aurora-pg-cdc \
    --apply-immediately
```

### 3. Reboot Cluster

Reboot required for `rds.logical_replication` to take effect:

```bash
aws rds reboot-db-instance --db-instance-identifier your-instance-name
```

### Verify Configuration

```sql
SHOW rds.logical_replication;
```

Expected result:
```
 rds.logical_replication
-------------------------
 on
(1 row)
```

---

## User Permissions

Aurora requires specific roles instead of SUPERUSER attribute.

### Create CDC User

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

### Required Aurora Roles

| Role | Purpose |
|------|---------|
| `rds_replication` | Create replication slots and read WAL |
| `rds_superuser` | Manage publications (required for CDC) |
| `pg_read_all_data` | Read all tables in all schemas |

> **Note:** Aurora master user does NOT have full SUPERUSER privileges. Use roles instead.

### Verify User Permissions

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

Expected result:
```
  rolname  |                     memberof
-----------+--------------------------------------------------
 cdc_user  | {pg_read_all_data,rds_superuser,rds_replication}
(1 row)
```

---

## Publication Setup

Create publication as master user (postgres):

```sql
-- As postgres user
CREATE PUBLICATION velodb_publication FOR ALL TABLES;
```

Verify publication:

```sql
SELECT * FROM pg_publication WHERE pubname = 'velodb_publication';
```

> **Important:** Pass `--postgres-conf publication.name=velodb_publication` to Flink CDC when using Aurora.

---

## REPLICA IDENTITY (Required for DELETEs)

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

---

## Connection Test

Verify CDC user can:

1. **Connect:**
```bash
psql -h your-cluster.cluster-xxxxx.us-west-2.rds.amazonaws.com -p 5432 -U cdc_user -d your_database
```

2. **List publications:**
```sql
SELECT * FROM pg_publication;
```

3. **Read tables:**
```sql
SELECT COUNT(*) FROM your_table;
```

---

## Next Steps

Once Aurora RDS is configured for CDC, follow the [Flink CDC Ingestion Guide](../postgres-cdc) to set up real-time sync to VeloDB.

**Remember to add** `--postgres-conf publication.name=velodb_publication` when running Flink CDC with Aurora.

---

## Sources

- [Aurora PostgreSQL Logical Replication](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.Replication.Logical.html)
- [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)
