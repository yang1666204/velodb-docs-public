---
{
    "title": "Deploy Compute-Storage Separated Cluster",
    "description": "Manager allows you to deploy Doris clusters on physical machines, virtual machines, and cloud servers, automatically performing environmental checks a..."
}
---

# Deploy Compute-Storage Separated Cluster

Manager allows you to deploy Doris clusters on physical machines, virtual machines, and cloud servers, automatically performing environmental checks and cluster configurations. To create a new compute-storage separated cluster, select **New/Take Over Cluster** under the **Current Cluster** tab, then choose **Create Compute-Storage Separated Cluster**.

## Precautions

* FE machines will simultaneously deploy FoundationDB and require at least 48GB of memory.
* You can mix deploy one FE and one BE on a single server, but you cannot deploy multiple FE and BE instances.
* Before deployment, you can refer to [Cluster Planning](https://doris.apache.org/zh-CN/docs/dev/install/preparation/cluster-planning) to estimate the number of nodes.
* When adding machines, you need to specify the **IP address**, not the hostname.

## Step 1: Environment Configuration

When configuring the cluster environment, you need to set the cluster name, select the deployment version, and specify the database root password as prompted.

You also need to configure shared storage for the compute-storage separated cluster.

![config-env-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-env-separating.png)

## Step 2: Host Registration

When registering hosts, you first need to add the host IP and then start the Agent service for each host.

1.  **Add Host IP and Specify Agent Port**

    ![register-host-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/register-host-separating.png)

    When adding host IPs, both IPV4 and IPV6 formats are supported.

2.  **Install Agent Service for Specified Hosts**

    ![install-agent-separating.png](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/install-agent-separating.png)

    Agent installation requires checking machine parameters on each registered host and one-click deployment of the Agent service.

    After deploying the Agent service, ensure that the Agent status is normal.

## Step 3: FE Configuration

![config-fe-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-fe-separating.png)

When adding FEs, you need to specify the [FE Role](https://doris.apache.org/zh-CN/docs/dev/gettingStarted/what-is-apache-doris#%E5%AD%98%E7%AE%97%E4%B8%80%E4%BD%93%E6%9E%B6%E6%9E%84). It's recommended to specify 3 FE Followers to form a high-availability architecture.

When specifying FE configurations, you can choose general configuration or modify a specific FE configuration individually. It's recommended to use general configuration to ensure consistent FE configurations.

Configuration descriptions are as follows:

| Parameter        | Description                                                                     |
| :--------------- | :------------------------------------------------------------------------------ |
| Http Port        | HTTP Server port on FE, default 8030                                            |
| Query Port       | MySQL Server port on FE, default 9030                                           |
| RPC Port         | Thrift Server port on FE, configuration for each FE should be consistent, default 9020 |
| Editlog Port     | bdbje communication port on FE, default 9010                                    |
| Deployment Directory | Doris deployment root directory                                                 |
| Metadata Storage Directory | FE metadata storage directory                                                 |
| Log Directory    | FE log directory                                                                |

## Step 4: BE Configuration

![config-be-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-be-separating.png)

When adding BE nodes, you first need to plan the compute groups and then add BE nodes to each compute group.

As shown in the image above, two resource groups are created, and one BE node is added to each resource group.

Configuration descriptions are as follows:

| Parameter          | Description                                                                     |
| :----------------- | :------------------------------------------------------------------------------ |
| BE Port            | Thrift Server port on BE, used to receive requests from FE, default 9060        |
| Webserver Port     | HTTP Server port on BE, default 8040                                            |
| Heartbeat Port     | Heartbeat service port (Thrift) on BE, used to receive heartbeats from FE, default 9050 |
| BRPC Port          | BRPC port on BE, used for communication between BEs, default 8060               |
| Deployment Directory | Doris deployment root directory                                                 |
| Data Storage Directory | BE data storage directory                                                       |
| Log Directory      | BE log storage directory                                                        |
| External Table Cache Directory | Federal analysis file cache directory                                           |
| Total File Cache Size | Federal analysis file cache size                                                |
| Single Query Cache Limit | Federal analysis single query cache size limit                                  |

## Step 5: Other Configurations

![config-others-separating](/images/enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster/config-others-separating.png)

When configuring cluster parameters, you can choose whether to automatically start services and whether table names are case-sensitive.