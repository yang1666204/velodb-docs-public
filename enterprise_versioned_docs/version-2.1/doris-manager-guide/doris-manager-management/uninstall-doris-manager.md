---
{
    "title": "Uninstall Manager",
    "description": "Uninstalling Manager will lead to the loss of Manager control metadata and monitoring information, so proceed with caution."
}
---

# Uninstall Manager

Uninstalling Manager will lead to the loss of Manager control metadata and monitoring information, so proceed with caution. Uninstalling Manager will not affect the normal operation of your Doris cluster; you can still manage the Doris cluster via command line or other methods.

## Step 1: Stop Non-WebServer Services

In the user configuration page at the bottom left, click "Service Configuration," select the "Services" menu, and stop all services.

![component-config](/images/enterprise/doris-manager-guide/doris-manager-management/uninstall-doris-manager/stop-service.png)

## Step 2: Stop WebServer Service

1.  **Stop WebServer Service**

    Navigate to the manager deployment directory. After executing the following command, you can delete the installation path:

    ```sql
    webserver/bin/stop.sh
    ```

2.  **Stop Agents on Nodes**

    In the Agent installation directory, execute the following command to delete the installation path:

    ```sql
    bin/stop.sh
    ```