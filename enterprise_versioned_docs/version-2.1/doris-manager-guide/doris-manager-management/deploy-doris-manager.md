---
{
    "title": "Deploying Manager",
    "description": "Extract the Manager installation package."
}
---

# Deploying Manager

## Step 1: Download the Installation Package

Extract the Manager installation package.

The package directory structure is as follows:

```shell
├── agent        ## anget directory
│   ├── install.sh                              
│   ├── manager-agent-24.2.0-x64-bin.tar.gz     
│   └── validation.sh                           
├── deps        ## Third-Party Dependency Directory
│   ├── alertmanager                            
│   ├── foundationdb-7.1.38.tar.gz
│   ├── grafana
│   ├── jdk
│   ├── jdk17
│   ├── prometheus
│   └── webui
├── LICENSE
└── webserver    ## WebServer directory 
    ├── bin
    ├── conf
    ├── config-tool
    ├── inspection
    ├── lib
    └── static

```

## Step 2: Start the WebServer Component

1. **Modify the Installation Directory**

   Choose an appropriate installation directory. In this example, the extracted package is moved to /opt/doris/manager:

   ```sql
   mv ./doris-manager-24.2.0-x64-bin /opt/doris/manager
   ```

2. **Configure WebServer Service (Optional)**

   Modify the `webserver/conf/manager.conf` file to configure the WebServer service. The configuration parameters are as follows:

   | Parameter                          | Default | Description                                                                 |
   | ---------------------------------- | ------- | --------------------------------------------------------------------------- |
   | MANAGER_PORT                       | 8004    | Port for Manager Web service component                                |
   | DB_TYPE                            | h2      | Supported database types: mysql, h2 or postgresql                          |
   | DATA_PATH                          | ../data | Manager metadata storage path (only effective when DB_TYPE is h2)           |
   | DB_HOST                            | -       | Database access address (only effective for mysql/postgresql)               |
   | DB_PORT                            | -       | Database access port (only effective for mysql/postgresql)                 |
   | DB_USER                            | -       | Database access username (only effective for mysql/postgresql)             |
   | DB_PASS                            | -       | Database access password (only effective for mysql/postgresql)             |
   | DB_DBNAME                          | -       | Database name (only effective for mysql/postgresql)                        |
   | DB_URL_SUFFIX                      | -       | MySQL database connection URL suffix                                       |
   | HTTP_CONNECT_TIMEOUT               | 30      | HTTP handshake timeout (in seconds)                                        |
   | HTTP_SOCKET_TIMEOUT                | 60      | HTTP response receive timeout (in seconds)                                 |
   | LISTEN_PROTOCOL                    | ALL     | IP protocol for service listening: ALL, IPV4 or IPV6 (ALL means both)      |
   | FE_MIN_DISK_SPACE_FOR_UPGRADE      | 10      | Minimum free disk space for FE module installation path during upgrade (GB) |
   | BE_MIN_DISK_SPACE_FOR_UPGRADE      | 10      | Minimum free disk space for BE module installation path during upgrade (GB) |

3. **Start WebServer Service**

   Start the WebServer service using the following command. After starting, check the MANAGER_PORT status (default is 8004):

   ```sql
   webserver/bin/start.sh
   ```

   
## Step 3: Launch Manager via WebServer

Open http://{webserver-ip}:{manager-port} in your browser to access the WebServer service.

1.  **Initialize Manager Administrator Account**

    The first time you access the web service, you'll enter the user initialization page. Create the first Manager administrator user here.

    The Manager administrator account is independent of the cluster accounts and is used solely for Manager access control.

2.  **Configure Service Component Deployment Information**

    You can configure service information on the following page:

    ![component-config](/images/enterprise/doris-manager-guide/doris-manager-management/deploy-doris-manager/component-config.png)

    Configuration descriptions are as follows:

    | Configuration           | Description                                                                                                                                                                                                                                                                |
    | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Monitoring and Alerting Service | Optional. Used to configure Manager's monitoring and alerting modules. This will install Grafana, Prometheus, and Alertmanager. You'll need to select three available ports on the machine where Manager is installed.                                                              |
    | Email Alerting          | Configure the email server. Afterwards, you can use the "Email Alerting" channel for alerts.                                                                                                                                                                                            |
    | Proxy Configuration     | If the production environment is isolated from the external network, you can set up a proxy to send notifications to public office communication software.                                                                                                                             |
    | Installation Package Configuration | Configure the local storage path for Doris Core and Manager installation packages, used for creating new clusters and upgrading existing ones. |



