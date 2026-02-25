---
{
    "title": "Scale Out/In Compute-Storage Integrated Cluster",
    "description": "Manager supports scaling out and scaling in clusters. You can perform these operations by clicking \"Cluster Scale\" on the cluster page."
}
---

# Scale Out/In Compute-Storage Integrated Cluster

Manager supports scaling out and scaling in clusters. You can perform these operations by clicking "Cluster Scale" on the cluster page.

## Precautions

## Scale Out FE

**Step 1: Add Hosts**

Click the "Cluster Scale" button and select "Scale Out FE Node".

On the cluster page, after selecting "Add Node", choose "Add Host" from the IP dropdown box. You can add multiple hosts.

![add-new-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-new-agent-integrated.png)

**Step 2: Deploy Agent for Hosts**

Follow the prompted steps to install the agent service for the hosts. Ensure that the Agent status for all hosts is normal.

![register-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**Step 3: Add FE Nodes**

Select the hosts to add and choose the role for the FE nodes. In this example, with 3 highly available Follower nodes already existing, select "Observer" as the role for the new FE.

![add-fe-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-fe-integrated.png)

## Scale In FE

Click the "Cluster Scale" button, select "Scale In FE Node", and choose the node to decommission. For instance, in this example, the Observer node is selected for decommissioning.

![scale-in-fe-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/scale-in-fe-integrated.png)

## Scale Out BE

**Step 1: Add Hosts**

Click the "Cluster Scale" button and select "Scale Out BE Node".

On the cluster page, after selecting "Add Node", choose "Add Host" from the IP dropdown box. You can add multiple hosts.

![add-new-benode-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/add-new-benode-integrated.png)

**Step 2: Deploy Agent for Hosts**

Follow the prompted steps to install the agent service for the hosts. Ensure that the Agent status for all hosts is normal.

![register-agent-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/register-agent-integrated.png)

**Step 3: Add BE Nodes**

Select the hosts to add. You can register the BE nodes as standard nodes or as compute nodes.

![chose-new-be-node-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/chose-new-be-node-integrated.png)

## Scale In BE

Click the "Cluster Scale" button, select "Scale In BE Node", and choose the node to decommission.

![scale-in-be-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster/scale-in-be-integrated.png)