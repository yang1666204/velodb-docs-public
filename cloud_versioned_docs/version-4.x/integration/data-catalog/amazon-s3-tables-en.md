---
{
    "title": "Amazon S3 Tables",
    "language": "en",
    "description": "VeloDB Cloud connects to S3 Tables via the AWS Glue Iceberg REST endpoint. When you enable S3 Tables integration in AWS Lake Formation, AWS Glue creates a federated catalog named `s3tablescatalog` in the Data Catalog. VeloDB Cloud accesses your S3 Tables data through the Iceberg REST API of this directory."
}
---

Amazon S3 Tables is a storage service optimized for tabular data introduced by AWS, with native support for the Apache Iceberg format.

VeloDB Cloud connects to S3 Tables via the AWS Glue Iceberg REST endpoint. When you enable S3 Tables integration in AWS Lake Formation, AWS Glue creates a federated catalog named `s3tablescatalog` in the Data Catalog. VeloDB Cloud accesses your S3 Tables data through the Iceberg REST API of this directory.

## Prerequisites

Before creating an Amazon S3 Tables Catalog, ensure the following preparations are completed on the AWS side.

### 1. Create S3 Table Bucket

First, you need to create a Table Bucket in AWS S3:

1. Log in to the AWS S3 Console.
2. In the left navigation bar, select **Table buckets**.
3. Click **Create table bucket**.
4. Enter the bucket name and select the region.
5. Complete the creation.

### 2. Enable S3 Tables Integration in Lake Formation

To access S3 Tables via the AWS Glue Iceberg REST endpoint, integration must first be enabled in Lake Formation:

1. Log in to the AWS Lake Formation Console.
2. In the left navigation bar, select **Data Catalog** > **Catalogs**.
3. In the prompt banner at the top of the page, click the **Enable S3 Table integration** button.

![aws-s3-tables-1](/images/integrations/data-catalog/aws-s3-tables-1.png)

Once enabled, AWS Glue automatically creates a federated catalog named `s3tablescatalog`, and your S3 Table Buckets will appear as sub-directories within it.

> For detailed steps, please refer to the AWS official documentation: [Creating an Amazon S3 Tables catalog in the AWS Glue Data Catalog](https://docs.aws.amazon.com/lake-formation/latest/dg/create-s3-tables-catalog.html)

### 3. Create Namespace and Table

Create a Namespace and table in the S3 Table Bucket:

1. On the Table buckets page of the S3 Console, select your Table Bucket.
2. Create a Namespace.
3. Create a table within the Namespace.

### 4. Configure Lake Formation Permissions

Grant necessary permissions in Lake Formation:

1. Log in to the AWS Lake Formation Console.
2. In the left navigation bar, select **Permissions** → **Data permissions**.
3. Click **Grant**.
4. Configure the following options:
   - **Principals**: Select IAM users and roles, then choose your IAM user or role.
   - **LF-Tags or catalog resources**: Select Named Data Catalog resources.
   - **Catalogs**: Select s3tablescatalog.
   - **Databases**: Select the target database under `s3tablescatalog/<table-bucket-name>`, or select All databases.
   - **Tables**: Select the target table or All tables.
5. Check the required permissions:
   - **Table permissions**: Select, Insert, Delete, Describe, Alter, Drop, etc.
6. Click **Grant**.

### 5. Configure IAM Permissions

Configure the following permission policy for the IAM user/role accessing S3 Tables:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GlueCatalogAccess",
            "Effect": "Allow",
            "Action": [
                "glue:GetCatalog",
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:CreateDatabase",
                "glue:UpdateDatabase",
                "glue:DeleteDatabase",
                "glue:GetTable",
                "glue:GetTables",
                "glue:CreateTable",
                "glue:UpdateTable",
                "glue:DeleteTable",
                "glue:GetUserDefinedFunction",
                "glue:GetUserDefinedFunctions",
                "glue:DeleteUserDefinedFunction"
            ],
            "Resource": [
                "arn:aws:glue:<region>:<account-id>:catalog",
                "arn:aws:glue:<region>:<account-id>:catalog/s3tablescatalog",
                "arn:aws:glue:<region>:<account-id>:catalog/s3tablescatalog/<table-bucket-name>",
                "arn:aws:glue:<region>:<account-id>:database/s3tablescatalog/<table-bucket-name>/*",
                "arn:aws:glue:<region>:<account-id>:table/s3tablescatalog/<table-bucket-name>/*/*",
                "arn:aws:glue:<region>:<account-id>:userDefinedFunction/s3tablescatalog/<table-bucket-name>/*/*"
            ]
        },
        {
            "Sid": "S3TablesAccess",
            "Effect": "Allow",
            "Action": [
                "s3tables:GetTableBucket",
                "s3tables:ListTableBuckets",
                "s3tables:CreateNamespace",
                "s3tables:GetNamespace",
                "s3tables:ListNamespaces",
                "s3tables:DeleteNamespace",
                "s3tables:CreateTable",
                "s3tables:GetTable",
                "s3tables:ListTables",
                "s3tables:UpdateTableMetadataLocation",
                "s3tables:GetTableMetadataLocation",
                "s3tables:RenameTable",
                "s3tables:DeleteTable",
                "s3tables:GetTableData",
                "s3tables:PutTableData"
            ],
            "Resource": [
                "arn:aws:s3tables:<region>:<account-id>:bucket/<table-bucket-name>",
                "arn:aws:s3tables:<region>:<account-id>:bucket/<table-bucket-name>/*"
            ]
        },
        {
            "Sid": "LakeFormationDataAccess",
            "Effect": "Allow",
            "Action": [
                "lakeformation:GetDataAccess"
            ],
            "Resource": "*"
        }
    ]
}
```

> **Configuration Instructions**
>
> - Replace `<region>` with the actual AWS region (e.g., us-east-1).
> - Replace `<account-id>` with your AWS Account ID.
> - Replace `<table-bucket-name>` with your S3 Table Bucket name.

### 6. Network Requirements

- VeloDB Cloud must be able to access the S3 Table Glue REST endpoint.
- VeloDB Cloud must be able to access data storage (e.g., S3).

> **For VeloDB Cloud in SaaS Mode**
>
> - Can only access S3 Table Glue REST endpoints and S3 Buckets in the same region as the Warehouse.
>
> **For VeloDB Cloud in BYOC Mode**
>
> - Accessing S3 Table Glue REST endpoints and S3 Bucket services requires reference to the network policies during deployment. Please refer to [create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources).

## Create Catalog

Follow these steps to create an Amazon S3 Tables Catalog in VeloDB Cloud.

### Step 1: Enter the Creation Page

1. Log in to the VeloDB Cloud Console.
2. In the left navigation bar, click **Catalogs**.
3. Click the **Add External Catalog** button.
4. Under the Data Lake category, select **Amazon S3 Tables**.

### Step 2: Fill in Basic Information

In the **Basic Information** section, configure the basic identification information for the Catalog.

![aws-s3-tables-2](/images/integrations/data-catalog/aws-s3-tables-2.png)

| Field | Required | Description |
| --- | --- | --- |
| **Catalog Name** | ✓ | A unique name for the Catalog, used to identify this data source in SQL queries. |
| **Comment** |  | Optional description. |

### Step 3: Configure Metastore

In the **Metastore** section, configure the information required to connect to S3 Tables. S3 Tables uses the Iceberg REST Catalog interface provided by AWS Glue.

![aws-s3-tables-3](/images/integrations/data-catalog/aws-s3-tables-3.png)

| Field | Required | Description |
| --- | --- | --- |
| **Iceberg REST URI** | ✓ | AWS Glue Iceberg REST API endpoint. Format is `https://glue.<region>.amazonaws.com/iceberg`, where `<region>` is your AWS region. |
| **Warehouse** | ✓ | Identifier for the S3 Table Bucket. Format is `<account-id>:s3tablescatalog/<table-bucket-name>`. Can be found on the Table Buckets page in the AWS S3 Console. |
| **Region** | ✓ | The AWS region where the S3 Table Bucket is located, consistent with the Glue Iceberg REST endpoint. |
| **Signing-name** | ✓ | AWS service signing name. For S3 Tables, fill in `glue`. |

**About Warehouse Format**:

The format for Warehouse is `<account-id>:s3tablescatalog/<table-bucket-name>`, consisting of three parts:

- `<account-id>`: Your AWS Account ID (12 digits).
- `s3tablescatalog`: Fixed prefix indicating this is an S3 Tables directory.
- `<table-bucket-name>`: The name of the S3 Table Bucket.

### Step 4: Configure Authentication

In the **Authentication** section, configure credentials for accessing AWS services.

![aws-s3-tables-4](/images/integrations/data-catalog/aws-s3-tables-4.png)

| Field | Required | Description |
| --- | --- | --- |
| **AK** | ✓ | AWS Access Key ID. |
| **SK** | ✓ | AWS Secret Access Key. |

**Security Recommendations**:

- Do not use the access keys of the AWS root account.
- Create a dedicated IAM user for VeloDB Cloud.
- Follow the principle of least privilege and grant only necessary permissions for S3 Tables, Glue, and S3.
- Rotate access keys regularly.

### Step 5: Advanced Settings (Optional)

Click **Advanced Settings** to expand more configuration options.

![aws-s3-tables-5](/images/integrations/data-catalog/aws-s3-tables-5.png)

Advanced settings typically include:

- Metadata cache configuration.
- Connection timeout settings.

> **Tip**: In most scenarios, the default values are sufficient.

### Step 6: Confirm Creation

1. Check if all configuration information is correct.
2. Click the **Confirm** button to create the Catalog.
3. Wait for the connection verification to complete.

After successful creation, you can see the newly created Amazon S3 Tables Catalog in the Catalog list.

## Use Catalog

After successful creation, you can use the Catalog to query data in the SQL Editor.

### View Namespaces and Tables

```sql
-- View all Namespaces under the Catalog
SHOW DATABASES FROM s3_tables_catalog;

-- View all tables under a specific Namespace
SHOW TABLES FROM s3_tables_catalog.my_database;

-- View table structure
DESCRIBE s3_tables_catalog.my_database.my_table;
```

### Query Data

```sql
-- Query data
SELECT * FROM s3_tables_catalog.my_database.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM s3_tables_catalog.my_database.my_table
WHERE event_date >= '2024-01-01';
```
