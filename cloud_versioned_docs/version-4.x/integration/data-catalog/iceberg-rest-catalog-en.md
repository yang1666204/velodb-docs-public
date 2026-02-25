---
{
    "title": "Iceberg REST Catalog",
    "language": "en",
    "description": "The Iceberg REST Catalog is a standard REST API specification defined by Apache Iceberg, providing a universal way to manage and access Iceberg table metadata. Any service that implements this specification can be used as an Iceberg REST Catalog. By creating an Iceberg REST Catalog, you can connect to any Catalog service compatible with the Iceberg REST specification within VeloDB Cloud."
}
---

The Iceberg REST Catalog is a standard REST API specification defined by Apache Iceberg, providing a universal way to manage and access Iceberg table metadata. Any service that implements this specification can be used as an Iceberg REST Catalog.

By creating an Iceberg REST Catalog, you can connect to any Catalog service compatible with the Iceberg REST specification within VeloDB Cloud.

> **Tip**: If you are using Apache Polaris or Amazon S3 Tables, it is recommended to use the specialized Catalog types, as they provide more targeted configuration options.

## Prerequisites

Before creating an Iceberg REST Catalog, please ensure the following conditions are met:

### REST Catalog Service Preparation

* The Iceberg REST Catalog service is deployed and accessible via the network from VeloDB Cloud.
* If authentication is enabled for the REST Catalog, prepare OAuth2 credentials (Client ID, Client Secret).

### Storage Preparation

* If the REST Catalog supports Vended Credentials, no additional storage credentials are required.
* If Vended Credentials are not supported, prepare credentials for accessing storage (e.g., AWS Access Key).

### Network Requirements

* VeloDB Cloud can access the REST Catalog service endpoint.
* VeloDB Cloud can access the data storage (e.g., S3).

> **For VeloDB Cloud in SaaS Mode:**
> * Accessing your Iceberg REST service may require allowing VeloDB to access your VPC. Refer to [velodb-accesses-your-vpc](https://docs.velodb.io/cloud/4.x/management-guide/connections#velodb-accesses-your-vpc).
> * Only S3 Buckets in the same Region as the Warehouse can be accessed.
>
> **For VeloDB Cloud in BYOC Mode:**
> * Accessing your Iceberg REST service and S3 Bucket requires reference to the network policies during deployment. Refer to [create-vpc-network-resources](https://docs.velodb.io/cloud/4.x/management-guide/more/amazon-aws/create-vpc-network-resources).

## Create Catalog

Follow the steps below to create an Iceberg REST Catalog in VeloDB Cloud.

### Step 1: Enter the Creation Page

1. Log in to the VeloDB Cloud console.
2. In the left navigation bar, click **Catalogs**.
3. Click the **Add External Catalog** button.
4. Under the Data Lake category, select **Iceberg REST Catalog**.

### Step 2: Fill in Basic Information

In the **Basic Information** section, configure the basic identification information for the Catalog.

![irc-1](/images/integrations/data-catalog/irc-1.png)

| Field | Required | Description |
| ---------------- | -- | -------------------------------- |
| **Catalog Name** | ✓  | A unique name for the Catalog, used to identify this data source in SQL queries. |
| **Comment**      |    | Optional description.                         |

### Step 3: Configure Metastore

In the **Metastore** section, configure the connection information for the REST Catalog service.

![irc-2](/images/integrations/data-catalog/irc-2.png)

#### Connection Configuration

| Field | Required | Description |
| ------------- | -- | --------------------------------------------------------------------------------------- |
| **URI**       | ✓  | The API endpoint address of the REST Catalog service. This is the entry URL for the Iceberg REST API.                                  |
| **Warehouse** | ✓  | The data warehouse identifier for Iceberg tables. The format depends on the REST Catalog implementation, which can be a storage path (e.g., `s3://bucket/warehouse`) or a Catalog name. |

#### Auth Type

Select the appropriate authentication method based on the requirements of the REST Catalog service.

##### None

If the REST Catalog service does not require authentication, select **None**.

![irc-3](/images/integrations/data-catalog/irc-3.png)

Suitable for REST Catalog services with authentication disabled.

##### OAuth2

If the REST Catalog service uses OAuth2 for identity authentication, select **OAuth2**.

![irc-4](/images/integrations/data-catalog/irc-4.png)

| Field | Required | Description |
| ----------------- | -- | ------------------------------------------------------------------- |
| **Client ID**     | ✓  | OAuth2 Client ID. Provided by the REST Catalog service.                                  |
| **Client Secret** | ✓  | OAuth2 Client Secret. Used in pair with Client ID for authentication.                               |
| **Scope**         | ✓  | OAuth2 permission scope. Defines the scope of resources accessible by the credentials. Common value is `PRINCIPAL_ROLE:ALL`.                |
| **Server URI**    |    | OAuth2 Token endpoint address. The URL used to obtain access tokens. If left empty, the default OAuth endpoint of the REST Catalog will be used. |

### Step 4: Configure Storage Access

In the **Storage** section, configure how to access data files.

#### Vended Credentials (Recommended)

The **Enable Vended Credentials** switch controls whether to use temporary credentials issued by the REST Catalog to access storage.

![irc-5](/images/integrations/data-catalog/irc-5.png)

**Enable Vended Credentials**:

* The REST Catalog dynamically issues temporary storage access credentials for each request.
* No need to configure long-term storage credentials in VeloDB Cloud.
* Credentials are automatically rotated for higher security.

**Applicable Scenarios**:

* The REST Catalog service supports and has configured Credential Vending.
* You wish to centrally manage storage access permissions.
* You pursue higher security.

> **Note**: Not all REST Catalog implementations support Vended Credentials. Please confirm if your REST Catalog service supports this feature.

#### Manual Storage Credential Configuration

After turning off the **Enable Vended Credentials** switch, you need to manually configure credentials with access permissions for the corresponding S3 Bucket.

Permission policy reference:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
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

![irc-6](/images/integrations/data-catalog/irc-6.png)

| Field | Required | Description |
| ------------------ | -- | ------------------------ |
| **Region**         | ✓  | The region where the storage bucket is located, e.g., `us-east-1`. |
| **Authentication** | ✓  | Authentication method, select Access Key.      |
| **AK**             | ✓  | AWS Access Key ID.       |
| **SK**             | ✓  | AWS Secret Access Key.   |

**Applicable Scenarios**:

* The REST Catalog does not support Vended Credentials.
* Specific storage access credentials are required.

### Step 5: Advanced Settings (Optional)

Click **Advanced Settings** to expand more configuration options.

![irc-7](/images/integrations/data-catalog/irc-7.png)

Advanced settings typically include:

* Metadata cache configuration
* Connection timeout settings

> **Tip**: In most scenarios, the default values are sufficient.

### Step 6: Confirm Creation

* Check if all configuration information is correct.
* Click the **Confirm** button to create the Catalog.
* Wait for the connection verification to complete.

After successful creation, you can see the newly created Iceberg REST Catalog in the Catalog list.

## Use Catalog

After successful creation, you can use this Catalog to query data in the SQL Editor.

### View Namespaces and Tables

```sql
-- View all Namespaces under the Catalog
SHOW DATABASES FROM iceberg_rest;

-- View all tables under a Namespace
SHOW TABLES FROM iceberg_rest.my_namespace;

-- View table schema
DESCRIBE iceberg_rest.my_namespace.my_table;
```

### Query Data

```sql
-- Query data
SELECT * FROM iceberg_rest.my_namespace.my_table LIMIT 100;

-- Query with conditions
SELECT column1, column2
FROM iceberg_rest.my_namespace.my_table
WHERE created_at >= '2024-01-01';
```
