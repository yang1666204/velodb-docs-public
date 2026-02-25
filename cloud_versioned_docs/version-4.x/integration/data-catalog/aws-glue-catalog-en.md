---
{
    "title": "AWS Glue Catalog",
    "language": "en",
    "description": "AWS Glue is a fully managed, serverless metadata storage service provided by AWS. By creating an AWS Glue Catalog, you can directly query data lake tables stored on Amazon S3 with metadata managed by AWS Glue in VeloDB Cloud."
}
---

AWS Glue is a fully managed, serverless metadata storage service provided by AWS. By creating an AWS Glue Catalog, you can directly query data lake tables stored on Amazon S3 with metadata managed by AWS Glue in VeloDB Cloud.

VeloDB Cloud supports accessing the following two table formats via AWS Glue:

*   **Iceberg**: A modern open table format that supports ACID transactions, Schema Evolution, and Time Travel.
*   **Hive**: The traditional Hive table format, widely compatible with the Hadoop ecosystem.

## Prerequisites

Before creating an AWS Glue Catalog, please ensure the following conditions are met:

### AWS Preparation

*   Have an AWS account.
*   Prepare an Amazon S3 bucket (for storing Iceberg or Hive table data).
*   Prepare access credentials (Access Key or IAM Role) and configure corresponding Glue and S3 permissions.
*   Configure Lake Formation permissions (if Lake Formation permission control is enabled).

### AWS Permission Configuration

#### 1. IAM Permission Policy

To access Iceberg or Hive tables stored in S3 via AWS Glue Catalog using VeloDB, you need to configure the following IAM permission policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GlueCatalogAccess",
            "Effect": "Allow",
            "Action": [
                "glue:GetDatabase",
                "glue:GetDatabases",
                "glue:CreateDatabase",
                "glue:UpdateDatabase",
                "glue:DeleteDatabase",
                "glue:GetTable",
                "glue:GetTables",
                "glue:GetTableVersion",
                "glue:GetTableVersions",
                "glue:CreateTable",
                "glue:UpdateTable",
                "glue:DeleteTable",
                "glue:GetPartition",
                "glue:GetPartitions",
                "glue:BatchGetPartition",
                "glue:CreatePartition",
                "glue:UpdatePartition",
                "glue:DeletePartition",
                "glue:BatchCreatePartition",
                "glue:BatchUpdatePartition",
                "glue:BatchDeletePartition",
                "glue:GetUserDefinedFunction",
                "glue:GetUserDefinedFunctions",
                "glue:DeleteUserDefinedFunction"
            ],
            "Resource": [
                "arn:aws:glue:<region>:<account-id>:catalog",
                "arn:aws:glue:<region>:<account-id>:database/*",
                "arn:aws:glue:<region>:<account-id>:table/*/*",
                "arn:aws:glue:<region>:<account-id>:userDefinedFunction/*/*"
            ]
        },
        {
            "Sid": "S3DataAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::<bucket-name>",
                "arn:aws:s3:::<bucket-name>/*"
            ]
        }
    ]
}
```

> **Configuration Instructions**
>
> *   Replace `<region>` with the actual AWS region (e.g., us-east-1).
>
> *   Replace `<account-id>` with your AWS account ID.
>
> *   Replace `<bucket-name>` with the actual S3 Bucket name where Iceberg or Hive table data is stored.
>
> *   For more granular permission control, replace `*` with specific database names and table names.

#### 2. Lake Formation Permission Configuration

If your AWS account has Lake Formation permission control enabled, configuring IAM policies alone is not sufficient to access the Glue Data Catalog; you also need to grant corresponding permissions in Lake Formation.

> **How to determine if it is enabled?** If you encounter an error like `Insufficient Lake Formation permission(s)`, it indicates that Lake Formation permissions need to be configured.

1.  Log in to the AWS Lake Formation console.
2.  Select **Data permissions** in the left navigation bar.
3.  Click **Grant**.
4.  Configure the following options:

    *   **Principals**: Select **IAM users and roles**, then choose your IAM user or role.
    *   **LF-Tags or catalog resources**: Select **Named Data Catalog resources**.
    *   **Catalog**: Select your **Catalog**.
    *   **Databases**: Select the target database or **All databases**.
    *   **Tables**: Select the target table or **All tables**.

5.  Check the required permissions:
    *   **Database permissions**: Create database, Alter, Drop, Describe.
    *   **Table permissions**: Select, Insert, Delete, Describe, Alter, Drop.

6.  Click **Grant**.

### Network Requirements

*   VeloDB Cloud must be able to access AWS Glue service endpoints.
*   VeloDB Cloud must be able to access data storage (e.g., S3).

> **For VeloDB Cloud in SaaS Mode**
> *   Can only access Glue Endpoints and S3 Buckets in the same Region as the Warehouse.
>
> **For VeloDB Cloud in BYOC Mode**
> *   Accessing Glue Endpoint and S3 Bucket services requires reference to the network policies during deployment. Please refer to [create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources).

## Create Catalog

Follow the steps below to create an AWS Glue Catalog in VeloDB Cloud.

### Step 1: Enter the Creation Page

1.  Log in to the VeloDB Cloud console.
2.  In the left navigation bar, click **Catalogs**.
3.  Click the **Add External Catalog** button.
4.  Under the Data Lake category, select **AWS Glue**.

### Step 2: Fill in Basic Information

In the **Basic Information** section, configure the basic identification information for the Catalog.

![aws-glue-1](/images/integrations/data-catalog/aws-glue-1.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Catalog Name** | ✓ | The unique name of the Catalog, which will be used to identify this data source in SQL queries. |
| **Comment** | | Optional description information. |

### Step 3: Configure Metastore

In the **Metastore** section, configure the connection information for the AWS Glue metadata service.

#### Select Table Format

First, select the table format you want to access. Different table formats require different parameters.

| Table Format | Description |
| :--- | :--- |
| **Iceberg** | Apache Iceberg open table format. |
| **Hive** | Traditional Hive table format. |


#### Iceberg Format Configuration

When **Iceberg** format is selected, the following parameters need to be configured:

![aws-glue-2](/images/integrations/data-catalog/aws-glue-2.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Warehouse** | ✓ | The default data file storage location when VeloDB creates an Iceberg database. Format is S3 URI, e.g., `s3://my-bucket/iceberg-warehouse`. |
| **AWS Glue Region** | ✓ | The region where the AWS Glue service is located. |
| **AWS Glue Endpoint** | ✓ | The AWS Glue API endpoint, e.g., `https://glue.us-east-1.amazonaws.com`. |

#### Hive Format Configuration

When **Hive** format is selected, the following parameters need to be configured:

> **Note**: Hive format currently only supports querying and does not support creating databases or tables.

![aws-glue-3](/images/integrations/data-catalog/aws-glue-3.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **AWS Glue Region** | ✓ | The region where the AWS Glue service is located. |
| **AWS Glue Endpoint** | ✓ | The AWS Glue API endpoint, e.g., `https://glue.us-east-1.amazonaws.com`. |

### Step 4: Configure Metastore Authentication

In the **Authentication** section, configure the credentials for accessing the AWS Glue metadata service.

VeloDB Cloud supports two authentication methods:

#### Method 1: Access Key

Authenticate using an AWS IAM user's access keys. This is the simplest configuration method, suitable for quick testing and development environments.

![aws-glue-4](/images/integrations/data-catalog/aws-glue-4.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **AK** | ✓ | AWS Access Key ID. |
| **SK** | ✓ | AWS Secret Access Key. |

**Security Recommendations**:

*   Do not use the access keys of the AWS root account.
*   Create a dedicated IAM user for VeloDB Cloud.
*   Follow the principle of least privilege and grant only necessary Glue and S3 permissions.
*   Rotate access keys regularly.

#### Method 2: Cross-account IAM

Authenticate using a cross-account IAM role. This is a more secure method and is recommended for production environments.

![aws-glue-5](/images/integrations/data-catalog/aws-glue-5.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Cross-Account Role ARN** | ✓ | The ARN of the IAM role you created in your AWS account. Format is `arn:aws:iam::<your-account-id>:role/<role-name>`. |

**Configuration Steps**:

Click the **Authorization Guidelines Help** link on the page to view detailed configuration instructions.

### Step 5: Configure Storage Access

In the **Storage** section, configure credentials for accessing data files in S3.

VeloDB Cloud needs to access the actual data files stored on S3. You can choose to reuse the Metastore authentication information or configure storage access credentials separately.

#### Reuse Metastore Authentication

Turn on the **Use the authentication details configured for Metastore access** switch to use the same credentials as the Metastore to access S3.

![aws-glue-6](/images/integrations/data-catalog/aws-glue-6.png)

**Applicable Scenarios**:
*   Glue metadata and S3 data are in the same AWS account.
*   Use the same IAM user/role to access Glue and S3.
*   Wish to simplify configuration.

#### Configure Storage Authentication Separately

Turn off the **Use the authentication details configured for Metastore access** switch to configure credentials separately for S3 access.

![aws-glue-7](/images/integrations/data-catalog/aws-glue-7.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Region** | ✓ | The region where the S3 bucket is located. **Must be in the same region as Glue.** |
| **Authentication** | ✓ | Select Access Key or Cross-account IAM; the configuration method is the same as Metastore authentication. |

##### Authentication Method 1: Access Key

Authenticate using an AWS IAM user's access keys.

![aws-glue-8](/images/integrations/data-catalog/aws-glue-8.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **AK** | ✓ | AWS Access Key ID. |
| **SK** | ✓ | AWS Secret Access Key. |

##### Authentication Method 2: Cross-account IAM

Authenticate using a cross-account IAM role. This is more secure and recommended for production environments.

![aws-glue-9](/images/integrations/data-catalog/aws-glue-9.png)

| Field | Required | Description |
| :--- | :--- | :--- |
| **Cross-Account Role ARN** | ✓ | The ARN of the IAM role you created in your AWS account. Format is `arn:aws:iam::<your-account-id>:role/<role-name>`. |

**Configuration Steps**:

Click the **Authorization Guidelines Help** link to view detailed configuration instructions.

**Applicable Scenarios**:
*   Glue and S3 data are in different AWS accounts.
*   Need to use different permission controls for metadata access and data access.

### Step 6: Advanced Settings (Optional)

Click **Advanced Settings** to expand more configuration options.

![aws-glue-10](/images/integrations/data-catalog/aws-glue-10.png)

Advanced settings typically include:
*   Metadata cache configuration.
*   Connection timeout settings.

> **Tip**: In most scenarios, the default values are sufficient.

### Step 7: Confirm Creation

1.  Check if all configuration information is correct.
2.  Click the **Confirm** button to create the Catalog.
3.  Wait for connection verification to complete.

After successful creation, you can see the newly created AWS Glue Catalog in the Catalog list.

## Use Catalog

After successful creation, you can use the Catalog to query data in the SQL Editor.

### View Databases and Tables

```sql
-- View all databases under the Catalog
SHOW DATABASES FROM my_glue_catalog;

-- View all tables under a database
SHOW TABLES FROM my_glue_catalog.my_database;

-- View table schema
DESCRIBE my_glue_catalog.my_database.my_table;
```

### Query Data

```sql
-- Query data
SELECT * FROM my_glue_catalog.my_database.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM my_glue_catalog.my_database.my_table
WHERE date_column >= '2024-01-01';
```
