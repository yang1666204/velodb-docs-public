---
{
    "title": "Integration with Glue + AWS S3 Tables",
    "language": "en",
    "description": "AWS S3 Tables is a special type of S3 Bucket that provides read and write interfaces compatible with Apache Iceberg table format standards,"
}
---

[AWS S3 Tables](https://aws.amazon.com/s3/features/tables/) is a special type of S3 Bucket that provides read and write interfaces compatible with Apache Iceberg table format standards, built on Amazon S3, offering the same durability, availability, scalability, and performance characteristics as S3 itself. Additionally, S3 Tables provides the following features:

- Compared to Iceberg tables stored in regular S3 Buckets, S3 Tables can deliver up to 3x higher query performance and up to 10x higher transactions per second.
- Automated table management. S3 Tables automatically optimizes Iceberg table data, including small file compaction, snapshot management, and garbage file cleanup.

The release of S3 Tables further simplifies Lakehouse architecture and brings more possibilities for cloud-native lake-warehouse systems. This includes cold-hot separation, data archiving, data backup, and compute-storage separation architectures, all of which could evolve into entirely new architectures based on S3 Tables.

Thanks to Amazon S3 Tables' high compatibility with the Iceberg API, Apache Doris can quickly integrate with S3 Tables. This article will demonstrate how to connect Apache Doris with S3 Tables and perform data analysis and processing.

:::tip
This feature is supported since Doris 3.1
:::

## Usage Guide

### 01 Create S3 Table Bucket

S3 Table Bucket is the third type of Bucket launched by S3, on par with the previous General purpose bucket and Directory bucket.

![AWS S3 Table Bucket](/images/Lakehouse/s3-table-bucket.png)

Here we create a Table Bucket named doris-s3-table-bucket. After creation, we will get a Table Bucket represented by an ARN.

![AWS S3 Table Bucket Create](/images/Lakehouse/s3-table-bucket-create.png)

### 02 Create Iceberg Catalog

- Connecting to `s3 tables` using AWS S3 Table Rest Catalog

    ```sql
    CREATE CATALOG aws_s3_tables PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'rest',
        'warehouse' = 'arn:aws:s3tables:us-east-1:<account_id>:bucket/<s3_table_bucket_name>',
        'iceberg.rest.uri' = 'https://s3tables.us-east-1.amazonaws.com/iceberg',
        'iceberg.rest.sigv4-enabled' = 'true',
        'iceberg.rest.signing-name' = 's3tables',
        'iceberg.rest.signing-region' = 'us-east-1',
        'iceberg.rest.access-key-id' = '<ak>',
        'iceberg.rest.secret-access-key' = '<sk>'
    );
    ```

- Connecting to `s3 tables` using Glue Rest Catalog 

    ```sql
    CREATE CATALOG glue_s3 PROPERTIES (
        'type' = 'iceberg',
        'iceberg.catalog.type' = 'rest',
        'iceberg.rest.uri' = 'https://glue.<region>.amazonaws.com/iceberg',
        'warehouse' = '<acount_id>:s3tablescatalog/<s3_table_bucket_name>',
        'iceberg.rest.sigv4-enabled' = 'true',
        'iceberg.rest.signing-name' = 'glue',
        'iceberg.rest.access-key-id' = '<ak>',
        'iceberg.rest.secret-access-key' = '<sk>',
        'iceberg.rest.signing-region' = '<region>'
    );
    ```

### 03 Access S3Tables

```sql
Doris > SWITCH iceberg_s3;

Doris > SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| my_namespace       |
| mysql              |
+--------------------+

Doris > USE my_namespace;

Doris > SHOW TABLES;
+------------------------+
| Tables_in_my_namespace |
+------------------------+
| my_table               |
+------------------------+

Doris > SELECT * FROM my_table;
+------+------+-------+
| id   | name | value |
+------+------+-------+
|    1 | ABC  |   100 |
|    2 | XYZ  |   200 |
+------+------+-------+
```

### 04 Create S3Tables Table and Write Data

```sql
Doris > CREATE TABLE partition_table (
    ->   `ts` DATETIME COMMENT 'ts',
    ->   `id` INT COMMENT 'col1',
    ->   `pt1` STRING COMMENT 'pt1',
    ->   `pt2` STRING COMMENT 'pt2'
    -> )
    -> PARTITION BY LIST (day(ts), pt1, pt2) ();

Doris > INSERT INTO partition_table VALUES
    -> ("2024-01-01 08:00:00", 1000, "us-east", "PART1"),
    -> ("2024-01-02 10:00:00", 1002, "us-sout", "PART2");
Query OK, 2 rows affected
{'status':'COMMITTED', 'txnId':'1736935786473'}

Doris > SELECT * FROM partition_table;
+----------------------------+------+---------+-------+
| ts                         | id   | pt1     | pt2   |
+----------------------------+------+---------+-------+
| 2024-01-02 10:00:00.000000 | 1002 | us-sout | PART2 |
| 2024-01-01 08:00:00.000000 | 1000 | us-east | PART1 |
+----------------------------+------+---------+-------+
```
## Tableau

### Q1. Version 2.0.x reports that Tableau cannot connect to the data source with error code 37CE01A3.

Turn off the new optimizer in the current version or upgrade to 2.0.7 or later

### Q2. SSL connection error:protocol version mismatch Failed to connect to the MySQL server

The cause of this error is that SSL authentication is enabled on Doris, but SSL connections are not used during the connection. You need to disable the enable_ssl variable in fe.conf.

### Q3. Connection error Unsupported command(COM_STMT_PREPARED) 

The MySQL driver version is improperly installed. Install the MySQL 5.1.x connection driver instead.