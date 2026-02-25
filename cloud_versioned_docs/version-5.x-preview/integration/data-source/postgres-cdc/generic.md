---
{
    "title": "Generic PostgreSQL Source Setup",
    "language": "en",
    "description": "PostgreSQL server configuration for CDC synchronization with VeloDB using Flink CDC"
}
---

# Generic PostgreSQL Source Setup for VeloDB CDC

This guide covers the PostgreSQL server configuration required for CDC (Change Data Capture) synchronization with VeloDB using Flink CDC.

## Supported Versions

| Database | Versions |
|----------|----------|
| PostgreSQL | 10, 11, 12, 13, 14, 15, 16, 17 |
| Amazon Aurora PostgreSQL | 10.x, 11.x, 12.x, 13.x, 14.x, 15.x, 16.x |
| Amazon RDS PostgreSQL | 10.x, 11.x, 12.x, 13.x, 14.x, 15.x, 16.x |

Reference: [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)

---

## Logical Replication Configuration

Add or modify the following in your PostgreSQL configuration file (`postgresql.conf`):

```ini
# Enable logical replication (required for CDC)
wal_level = logical

# Number of replication slots (at least 1 per CDC connection)
max_replication_slots = 4

# Number of WAL sender processes (at least 1 per CDC connection)
max_wal_senders = 4
```

### Configuration Parameters

| Parameter | Required Value | Description |
|-----------|---------------|-------------|
| `wal_level` | `logical` | Enable logical replication (required for CDC) |
| `max_replication_slots` | ≥ 1 | Number of replication slots (1 per CDC pipeline) |
| `max_wal_senders` | ≥ 1 | Number of WAL sender processes |

### Restart PostgreSQL

After modifying `postgresql.conf`, restart PostgreSQL:

```bash
# SystemD (Ubuntu/Debian/CentOS)
sudo systemctl restart postgresql

# macOS (Homebrew)
brew services restart postgresql@16

# Docker
docker restart <container_name>
```

### Verify Configuration

```sql
SHOW wal_level;
SHOW max_replication_slots;
SHOW max_wal_senders;
```

Expected result:
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

---

## User Permissions

Create a dedicated CDC user with replication privileges:

```sql
CREATE USER cdc_user WITH REPLICATION LOGIN PASSWORD 'your_password';

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO cdc_user;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cdc_user;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cdc_user;
```

### For PostgreSQL 15+

PostgreSQL 15+ requires an additional privilege:

```sql
GRANT pg_create_subscription TO cdc_user;
```

### Required Privileges

| Privilege | Purpose |
|-----------|---------|
| `REPLICATION` | Read WAL (Write-Ahead Log) for CDC |
| `LOGIN` | Connect to database |
| `SELECT` | Read table data for initial snapshot |
| `pg_create_subscription` | Required for PostgreSQL 15+ |

### Verify User Permissions

```sql
SELECT usename, userepl FROM pg_user WHERE usename = 'cdc_user';
```

Expected result:
```
  usename  | userepl
-----------+---------
 cdc_user  | t
(1 row)
```

---

## Publication Setup (Optional)

For Aurora/RDS or production environments, manually create a publication:

```sql
-- As superuser (postgres)
CREATE PUBLICATION velodb_publication FOR ALL TABLES;
```

Verify publication:

```sql
SELECT * FROM pg_publication WHERE pubname = 'velodb_publication';
```

---

## REPLICA IDENTITY (Required for DELETEs)

To capture full row data for DELETE operations:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

> **Note:** Without `REPLICA IDENTITY FULL`, DELETE events only include the primary key.

---

## Connection Test

Verify the CDC user can:

1. **Connect to PostgreSQL:**
```bash
psql -h <host> -p 5432 -U cdc_user -d your_database
```

2. **View tables:**
```sql
\dt
```

3. **Select from tables:**
```sql
SELECT * FROM your_table LIMIT 5;
```

4. **Check replication status:**
```sql
SELECT * FROM pg_stat_replication;
```

---

## Next Steps

Once PostgreSQL is configured for CDC, follow the [Flink CDC Ingestion Guide](../postgres-cdc) to set up real-time sync to VeloDB.

---

## Sources

- [Flink CDC PostgreSQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/postgres-cdc/)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
