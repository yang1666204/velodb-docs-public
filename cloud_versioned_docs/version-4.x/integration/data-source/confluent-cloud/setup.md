---
{
    "title": "Confluent Cloud Setup",
    "language": "en",
    "description": "Set up Confluent Cloud cluster and sample data for VeloDB integration"
}
---

# Confluent Cloud Setup

This guide covers setting up a Confluent Cloud Kafka cluster with sample data for connecting to VeloDB.

## Prerequisites

- Confluent Cloud account ([Sign up free](https://confluent.cloud))

---

## Step 1: Create a Kafka Cluster

1. Log in to [Confluent Cloud](https://confluent.cloud)

![Confluent Cloud Home](/images/cloud/integration/confluent-cloud/confluent1.png)

2. Click **Add cluster** or navigate to **Environments** > **default** > **Add cluster**

3. Select cluster type:
   - **Basic** - Free tier, good for development and testing
   - **Standard** - Production workloads with higher limits

4. Choose **Provider and region**:
   - Select the same cloud provider and region as your VeloDB warehouse for best performance
   - Example: AWS us-east-1

![Create Cluster](/images/cloud/integration/confluent-cloud/confluent2.png)

5. Click **Launch cluster**

---

## Step 2: Create Sample Data with Datagen

Use Confluent's built-in Datagen connector to generate sample data:

1. In your cluster, go to **Connectors** in the left sidebar

2. Click **Add connector**

3. Search for **Sample Data** or **Datagen Source**

4. Click on **Sample Data** to open the quick launch dialog

![Launch Sample Data](/images/cloud/integration/confluent-cloud/confluent3.png)

5. Configure the connector:
   - **Topic**: `sample_data_orders` (or your preferred name)
   - **Select a template**: Choose **Orders** (recommended for this guide)

6. Click **Launch**

7. Wait for the connector status to show **Running**

![Connector Running](/images/cloud/integration/confluent-cloud/confluent4.png)

:::caution Important - Data Format
The default Datagen connector produces **AVRO** format. VeloDB only supports **JSON** and **CSV** formats.

To use JSON format, click **Additional configuration** before launching and set:
- **Output record value format**: `JSON`

If you already created the connector with AVRO, create a new topic with a new Datagen connector configured for JSON output.
:::

---

## Step 3: Create API Keys

1. Go to **API Keys** in the left sidebar under your cluster

![API Keys Page](/images/cloud/integration/confluent-cloud/confluent5.png)

2. Click **Create key**

3. Select **Global access** (or scope to specific resources)

4. Click **Next** and then **Create**

5. **Save both values** - you'll need them for VeloDB:
   - **API Key** (username)
   - **API Secret** (password)

:::warning
The API Secret is only shown once. Save it securely before closing the dialog.
:::

---

## Step 4: Get Bootstrap Server

1. Go to **Cluster Settings** in the left sidebar

![Cluster Settings](/images/cloud/integration/confluent-cloud/confluent6.png)

2. Find the **Endpoints** section

3. Copy the **Bootstrap server** URL (e.g., `pkc-xxxxx.us-east-1.aws.confluent.cloud:9092`)

---

## Values Needed for VeloDB

After completing setup, you'll need these values:

| Value | Description | Example |
|-------|-------------|---------|
| **Bootstrap Server** | Kafka broker endpoint | `pkc-xxxxx.us-east-1.aws.confluent.cloud:9092` |
| **API Key** | Authentication username | `ABCD1234EFGH5678` |
| **API Secret** | Authentication password | `cflt37r+oeQB...` |
| **Topic Name** | Topic to consume from | `sample_data_orders` |

---

## Verify Your Setup

Check that your connector is producing data:

1. Go to **Topics** in the left sidebar
2. Click on your topic (e.g., `sample_data_orders`)
3. Go to the **Messages** tab
4. You should see messages being produced

---

## Next Steps

Once your Confluent Cloud setup is complete, proceed to [Connect to Confluent Cloud](../confluent-cloud) to set up the streaming import in VeloDB.
