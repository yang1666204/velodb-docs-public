---
{
    "title": "Tableau",
    "language": "en",
    "description": "Tableau is a lightweight data visualization analysis platform that combines data operations with beautiful charts perfectly."
}
---

# Tableau

VeloDB provides an official Tableau connector. This connector accesses data based on the MySQL JDBC Driver.

The connector has been tested by the [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) with a 100% pass rate.

With this connector, Tableau can integrate Doris databases and tables as data sources. To enable this, follow the setup guide below:

- Install Tableau and the Doris connector
- Configure an Doris data source in Tableau
- Build visualizations in Tableau
- Connection and usage tips
- Summary

## Install Tableau and Doris connector


1. Download and install [Tableau desktop](https://www.tableau.com/products/desktop/download).
2. Get the [tableau-doris](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Tableau/latest/doris_jdbc-latest.taco) custom connector connector (doris_jdbc-***.taco).
3. Get [MySQL JDBC](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Tableau/latest/mysql-connector-j-8.3.0.jar) (version 8.3.0).
4. Locations to place the Connector and JDBC driver
   MacOS:
    - Refer to this path: `~/Documents/My Tableau Repository/Connectors`, place the `doris_jdbc-latest.taco` custom connector file (if the path does not exist, create it manually as needed).
    - JDBC driver jar placement path: `~/Library/Tableau/Drivers`
      Windows:
      Assume `tableau_path` is the Tableau installation directory on Windows,
      typically defaults to: `tableau_path = C:\Program Files\Tableau`
    - Refer to this path: `%tableau_path%``\Connectors\`, place the `doris_jdbc-latest.taco` custom connector file (if the path does not exist, create it manually as needed).
    - JDBC driver jar placement path: `%tableau_path%\Drivers\`

Next, you can configure a Doris data source in Tableau and start building data visualizations!

## Configure a Doris data source in Tableau


Now that you have installed and set up the **JDBC and Connector** drivers, let's look at how to define a data source in Tableau that connects to the tpch database in Doris.

1. Gather your connection details

To connect to Doris via JDBC, you need the following information:

| Parameter          | Meaning                                                                           | Example                        |
|--------------------|-----------------------------------------------------------------------------------|--------------------------------|
| Server             | Database host                                                                     | 127.0.1.28                     |
| Port               | Database MySQL port                                                               | 9030                           |
| Catalog            | Doris Catalog, used when querying external tables and data lakes, set in Advanced | internal                       |
| Database           | Database name                                                                     | tpch                           |
| Authentication     | Choose database authentication method: Username / Username and Password           | Username and Password          |
| Username           | Username                                                                          | testuser                       |
| Password           | Password                                                                          |                                |
| Init SQL Statement | Initial SQL statement                                                             | `select * from database.table` |


2. Launch Tableau. (If you were already running it before placing the connector, please restart.)
3. From the left menu, click **More** under the **To a Server** section. In the list of available connectors, search for **Doris JDBC by VeloDB**:

![find connector](/images/cloud/integration/bi/tableau/p01.png)

4. Click **Doris by VeloDB ，the following dialog will pop up:**

![dialog](/images/cloud/integration/bi/tableau/p02.png)

5. Enter the corresponding connection information as prompted in the dialog.
6. Optional advanced configuration:

    - You can enter preset SQL in Initial SQL to define the data source
      ![Initial SQL](/images/cloud/integration/bi/tableau/p03.png)
    - In Advanced, you can use Catalog to access data lake data sources; the default value is internal,
      ![Catalog](/images/cloud/integration/bi/tableau/p04.png)
7. After completing the above input fields, click the **Sign In** button, and you should see a new Tableau workbook:
   ![Sign In](/images/cloud/integration/bi/tableau/p05.png)

Next, you can build some visualizations in Tableau!

## Build visualizations in Tableau

We choose TPC-H data as the data source, refer to [this document](../../benchmark/tpch.md) for the construction method of the Doris TPC-H data source

Now that we have configured the Doris data source in Tableau, let's visualize the data

1. Drag the customer table and orders table to the workbook. And select the table join field Custkey for them below

![table join](/images/cloud/integration/bi/tableau/p06.png)

2. Drag the nation table to the workbook and select the table join field Nationkey with the customer table
   ![table join2](/images/cloud/integration/bi/tableau/p07.png)
3. Now that you have associated the customer table, orders table and nation table as a data source, you can use this relationship to handle questions about the data. Select the `Sheet 1` tab at the bottom of the workbook to enter the workspace.
   ![Sheet 1](/images/cloud/integration/bi/tableau/p08.png)
4. Suppose you want to know the summary of the number of users per year. Drag OrderDate from orders to the `Columns` area (horizontal field), and then drag customer(count) from customer to `Rows`. Tableau will generate the following line chart:
   ![chart1](/images/cloud/integration/bi/tableau/p09.png)

A simple line chart is completed, but this dataset is automatically generated by the tpch script and default rules and is not actual data. It is not for reference and is intended to test availability.

5. Suppose you want to know the average order amount (USD) by region (country) and year:
    - Click the `New Worksheet` tab to create a new sheet
    - Drag Name from the nation table to `Rows`
    - Drag OrderDate from the orders table to `Columns`

You should see the following:
![chart2](/images/cloud/integration/bi/tableau/p10.png)

6. Note: The `Abc` value is just a placeholder value, because you have not defined aggregation logic for that mark, so you need to drag a measure onto the table. Drag Totalprice from the orders table to the middle of the table. Note that the default calculation is to perform a SUM on Totalprices:
   ![SUM on Totalprices](/images/cloud/integration/bi/tableau/p11.png)
7. Click `SUM` and change `Measure` to `Average`.
   ![sum](/images/cloud/integration/bi/tableau/p12.png)
8. From the same dropdown menu, select `Format ` and change `Numbers` to `Currency (Standard)`:
   ![us](/images/cloud/integration/bi/tableau/p13.png)
9. Get a table that meets expectations:
   ![chart2](/images/cloud/integration/bi/tableau/p14.png)

So far, Tableau has been successfully connected to Doris, and data analysis and visualization dashboard production has been achieved.

## Connection and usage tips

**Performance optimization**

- According to actual needs, reasonably create doris databases and tables, partition and bucket by time, which can effectively reduce predicate filtering and most data transmission
- Appropriate data pre-aggregation can be done by creating materialized views on the Doris side.
- Set a reasonable refresh plan to balance the computing resource consumption of refresh and the timeliness of dashboard data

**Security configuration**

- It is recommended to use VPC private connections to avoid security risks introduced by public network access.
- Configure security groups to restrict access.
- Enable access methods such as SSL/TLS connections.
- Refine Doris user account roles and access permissions to avoid excessive delegation of permissions.
