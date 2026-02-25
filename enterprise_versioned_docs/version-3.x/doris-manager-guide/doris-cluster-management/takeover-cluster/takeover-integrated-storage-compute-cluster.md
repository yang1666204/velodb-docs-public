---
{
    "title": "Take Over Compute-Storage Integrated Cluster",
    "description": "Manager can manage an already deployed Doris cluster."
}
---

# Take Over Compute-Storage Integrated Cluster

Manager can manage an already deployed Doris cluster. After taking over, you can perform cluster operations such as monitoring, scaling, and restarting through the Manager platform.

## Step 1: Environment Configuration

![config-env-integrated](./assets/takeover-integrated-storage-compute-cluster/config-env-integrated.png)

When taking over a cluster, you need to provide the information for any available FE and the cluster's root user password.

:::tip
Note:

If you need to enable FE proxy, you must fill in the FE representative IP and the FE proxy address in the settings menu.

:::

## Step 2: Node Configuration

When configuring nodes, ensure that the cluster nodes and Agent status are normal. You can refer to the guide for Agent installation.

After confirming the status is normal, click "Take Over Cluster."

:::tip

Note:

When selecting the "auto-start" feature during cluster takeover, you must first disable any previous auto-start management for the cluster (e.g., systemd or supervisor). Manager will then take over the auto-start management to prevent conflicts.

:::

![install-agent-integrated](./assets/takeover-integrated-storage-compute-cluster/install-agent-integrated.png)