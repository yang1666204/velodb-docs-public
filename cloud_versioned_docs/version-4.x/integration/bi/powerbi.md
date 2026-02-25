---
{
    "title": "Power BI",
    "language": "en",
    "description": "Power BI is a collection of software services and application connectors that can connect to multiple data sources, including Excel, SQL Server, Azure..."
}
---

# Power BI

Microsoft Power BI can query from Apache Doris or load data into memory.

You can use Power BI Desktop, the Windows desktop application for creating dashboards and visualizations.

This tutorial will guide you through the following process:

- Install the MySQL ODBC driver
- Install the Doris Power BI connector into Power BI Desktop
- Query data from Doris to visualize it in Power BI Desktop

## Prerequisites

### Power BI installation

This tutorial assumes that you have installed Microsoft Power BI Desktop on a Windows computer. You can download and install Power BI Desktop [here](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

We recommend updating to the latest version of Power BI.

### Connection information

Collect your Apache Doris connection details

You will need the following details to connect to your Apache Doris instance:

| Parameter | Description | Example                      |
| ---- | ---- |------------------------------|
| **Doris Data Source** | Database connection string, host + port | 127.0.1.28:9030              |
| **Database** | Database name | test_db                      |
| **Data Connectivity Mode** | Data connectivity mode, includes Import and DirectQuery |      DirectQuery                        |
| **SQL Statement** | SQL statement that must include the Database, only for Import mode | select * from database.table |
| **User Name** | User name | admin                        |
| **Password** | Password | xxxxxx                       |

## Power BI Desktop

To start querying data in Power BI Desktop, complete the following steps:

1. Install the MySQL ODBC driver
2. Find the Doris connector
3. Connect to Doris
4. Query and visualize data

### Install the ODBC driver

Download and install [MySQL ODBC](https://downloads.mysql.com/archives/c-odbc/), and configure it (version 5.3).

Run the provided `.msi` installer and follow the wizard.

![installer1](/images/cloud/integration/bi/powerbi/WYRLb9JmcoEHeuxr41Ec8yMQnff.png)

![installer2](/images/cloud/integration/bi/powerbi/LYh9bi780o3DaCxwF3BcuPrknlh.png)

![installer3](/images/cloud/integration/bi/powerbi/E1i7buBzHoquRCxT6VAc1FjCnNf.png)

Installation completed

![completed](/images/cloud/integration/bi/powerbi/PURIbSCFhoara3xodBBc5xaNnjc.png)

#### Verify the ODBC driver

After the driver installation is complete, you can verify that it was successful as follows:

In the Start menu, type ODBC and select "ODBC Data Sources **(64-bit)**".

![ODBC](/images/cloud/integration/bi/powerbi/QhVVbjalNoIwvdxd1u7cX3UAnEf.png)

Verify that the MySQL driver is listed.

![driver](/images/cloud/integration/bi/powerbi/OzVSbojxto9SpRxP3sLcnqHmnme.png)

### Install the Doris connector

The certification channel for Power BI custom connectors is currently closed, so the Doris custom connector is uncertified. For uncertified connectors, configure it as follows ([https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors)):

1. Assuming `power_bi_path` is the directory of Power BI Desktop in the Windows operating system, the default is usually: `power_bi_path = C:\Program Files\Power BI Desktop`. Refer to this path `%power_bi_path%\Custom Connectors folder` and place the [Doris.mez](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/PowerBI/latest/Doris.mez) custom connector file (if the path does not exist, create it manually as needed).
2. In Power BI Desktop, choose `File` > `Options and settings` > `Options` > `Security`. Under `Data Extensions`, check `(Not Recommended) Allow any extension to load without validation or warning` to bypass the restriction on uncertified connectors.

First, choose `File`

![choose](/images/cloud/integration/bi/powerbi/YeQDbcIoQoI5RtxU0mjcNXuJnrg.png)

Then choose `Options and settings` > `Options`

![choose2](/images/cloud/integration/bi/powerbi/LV6Tbdw54o5pqtxC2bCctM30nbe.png)

In the `Options` dialog, go to `GLOBAL` > `Security`. Under `Data Extensions`,

check `(Not Recommended) Allow any extension to load without validation or warning`.

![choose3](/images/cloud/integration/bi/powerbi/Tg5cbS75HoBGIMxpcKScJ9WXnRg.png)

Click `OK`, then restart Power BI Desktop.

### Find the Doris connector

1. Launch Power BI Desktop
2. On the Power BI Desktop start screen, click "New report". If you already have a local report, you can open the existing report.

![report](/images/cloud/integration/bi/powerbi/FuXNb5hb2oOq7cxNpPEcR1dKnyg.png)

3. Click "Get Data" and select the Doris database in the pop-up window.

![database](/images/cloud/integration/bi/powerbi/G9UWbT1P6otb53xlgj4cljUInz1.png)

### Connect to Doris

Select the connector and enter your Doris instance credentials:

- Doris Data Source (required) - Your instance domain/address or host:port.
- Database (required) - Your database name.
- SQL statement - A pre-executed SQL statement (only available in 'Import' mode)
- Data connectivity mode - DirectQuery/Import

![credentials](/images/cloud/integration/bi/powerbi/KiM2bVPWhoYBg5xGQUQcJFNcntg.png)

**Note**

We recommend choosing DirectQuery to query Doris directly.

If you have use cases with a small amount of data, you can choose Import mode, and the entire dataset will be loaded into Power BI.

- Specify the user name and password

![DirectQuery](/images/cloud/integration/bi/powerbi/KZXxbDPTBo2O3FxqgZdcE9I6ndc.png)

### Query and visualize data

Finally, you should see the database and tables in the navigator view. Select the desired table and click "Load" to load the table structure and preview the data from Apache Doris.

![load](/images/cloud/integration/bi/powerbi/J7xObwqSYoTdTQx3hjgcAjQznS5.png)

After the import is complete, your Doris data should be accessible in Power BI as usual, Configure the required statistical compass.

![complete](/images/cloud/integration/bi/powerbi/JvIgbbyo2oWPlgxcb6Cct5ssnld.png)

## Building Visualizations in Power BI

We've chosen TPC-H data as our data source. For instructions on building a Doris TPC-H data source, refer to [this document](../../benchmark/tpch).
Now that we've configured the Doris data source in Power BI, let's visualize the data...

Suppose we need to know the order revenue statistics for each region, then we will build a dashboard based on this requirement.

1. First, create the table model relationships. Click Model view.

![First](/images/cloud/integration/bi/powerbi/V7PsbP3oKoJpLjxK5HdcPsnLnKf.png)

2. Drag and drop to place these four tables on the same screen as needed, and then drag and drop the related fields.

![related1](/images/cloud/integration/bi/powerbi/FZL5b2kJcoifIaxI7Eocpak7nvf.png)

![related2](/images/cloud/integration/bi/powerbi/UxL2b1OV2or1LhxZjHsc0JG7ntb.png)

The relationships between the four tables are as follows:

- **customer** ：c_nationkey  --  **nation** : n_nationkey
- **customer** ：c_custkey  --  **orders** : o_custkey
- **nation** : n_regionkey  --  **region** : r_regionkey

3. The results after association are as follows:

![results](/images/cloud/integration/bi/powerbi/LomhbQTPPoZr58xp8f3cxcTen8d.png)

4. Return to the Report view workbench and build the dashboard.
5. Drag the `o_totalprice` field from the `orders` table to the dashboard.

![dashboard1](/images/cloud/integration/bi/powerbi/MB34bks6woK3mDx0eVccivKEngc.png)

6. Drag the `r_name` field from the `region` table to column X.

![dashboard2](/images/cloud/integration/bi/powerbi/JxpJbihDHoHGwixjWQScNyxvn4e.png)

7. You should now have the expected dashboard content.

![dashboard3](/images/cloud/integration/bi/powerbi/CfGWb6oaYoj4LyxpPIGcz3Binzb.png)

8. Click the save button in the upper left corner of the workbench to save the created statistical compass to your local machine.

![end](/images/cloud/integration/bi/powerbi/WozGbmqAOoP2mqxq2NmcJRFyntc.png)

At this point, you have successfully connected Power BI to Apache Doris and implemented data analysis and dashboard creation.
