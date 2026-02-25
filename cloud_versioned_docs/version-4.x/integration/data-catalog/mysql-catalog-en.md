---
{
    "title": "MySQL Catalog",
    "language": "en",
    "description": "By creating a MySQL Catalog, you can directly query data in a MySQL database within VeloDB Cloud, enabling federated queries across data sources."
}
---

By creating a MySQL Catalog, you can directly query data in a MySQL database within VeloDB Cloud, enabling federated queries across data sources.

## Prerequisites

- A MySQL database instance is running.
- A database user with query permissions is ready.
- VeloDB Cloud can access the MySQL instance via the network.

## AWS RDS/Aurora Configuration (Optional)

If you are using Amazon RDS for MySQL or Amazon Aurora MySQL, you need to complete the following preparations:

1. Get the database endpoint and port.
2. Log in to the AWS RDS Console.
3. Select **Databases** in the left navigation bar.
4. Click on your database instance name.
5. In the **Connectivity & security** tab, find:

   - **Endpoint**: Database connection address (e.g., `mydb.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com`).
   - **Port**: Database port (default is 3306 for MySQL).

   > **Aurora Cluster Tip**: If using Aurora, it is recommended to use the Reader endpoint (read-only queries) or Cluster endpoint (read-write), depending on your actual needs.

6. Configure Security Group

   Ensure the RDS instance's security group allows access from VeloDB Cloud:
   - In the **Connectivity & security** tab of the RDS instance details page, click the security group link under **VPC security groups**.
   - Select the **Inbound rules** tab and click **Edit inbound rules**.
   - Add rule:
     - **Type**: MySQL/Aurora
     - **Port range**: 3306 (or your custom port)
     - **Source**:
       - SaaS Mode: VeloDB Cloud connects to your VPC's IP address range via VPC Private Link.
       - BYOC Mode: Your VPC CIDR or security group.
   - Click **Save rules**.

7. Configure Database User Permissions

   Connect to the RDS instance and create a user with appropriate permissions:

   ```sql
   -- Create user
   CREATE USER 'velodb_user'@'%' IDENTIFIED BY 'your_password';
   -- Grant read-only permissions (recommended for query scenarios)
   GRANT SELECT ON your_database.* TO 'velodb_user'@'%';
   -- Or grant read-write permissions (if data writing is needed)
   GRANT SELECT, INSERT, UPDATE, DELETE ON your_database.* TO 'velodb_user'@'%';
   -- Flush privileges
   FLUSH PRIVILEGES;
   ```
   > **Security Advice**: Follow the principle of least privilege and grant only necessary database and table permissions.

### Network Requirements

- **VeloDB Cloud in SaaS Mode**: Accessing your MySQL service requires allowing VeloDB to access your VPC. Please refer to [velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc).
- **VeloDB Cloud in BYOC Mode**: Accessing your MySQL service requires referring to the network policy during deployment. Please refer to [create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources).
---

## Create Catalog

### Step 1: Enter Creation Page

1. Log in to the VeloDB Cloud Console.
2. Click **Catalogs** in the left navigation bar.
3. Click the **Add External Catalog** button.
4. Under the Database category, select **MySQL**.

### Step 2: Configure Connection Information

![mysql-1](/images/integrations/data-catalog/mysql-1.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Catalog Name** | ✓ | Unique name for the Catalog, used to identify the data source in SQL queries. |
| **Comment** | | Optional description. |
| **JDBC URL** | ✓ | JDBC connection string for MySQL. Format is `jdbc:mysql://<host>:<port>`, optionally specifying the database name. |
| **User** | ✓ | Database username. |
| **Password** | ✓ | Database password. |

**JDBC URL Examples**:
- Basic format: `jdbc:mysql://mysql.example.com:3306`
- Specify database: `jdbc:mysql://mysql.example.com:3306/mydb`
- With parameters: `jdbc:mysql://mysql.example.com:3306/mydb?useSSL=true`

### Step 3: Advanced Settings (Optional)

Click **Advanced Settings** to configure more options, such as connection pool size, timeout settings, etc.

### Step 4: Confirm Creation

1. Check configuration information.
2. Click the **Confirm** button to create the Catalog.

## Use Catalog

```sql
-- View database list
SHOW DATABASES FROM mysql_catalog;

-- View table list
SHOW TABLES FROM mysql_catalog.my_database;

-- Query data
SELECT * FROM mysql_catalog.my_database.my_table LIMIT 100;
```
