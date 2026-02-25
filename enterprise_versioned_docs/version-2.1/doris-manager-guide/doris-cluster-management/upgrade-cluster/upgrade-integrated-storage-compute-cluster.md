---
{
    "title": "Upgrade Compute-Storage Integrated Cluster",
    "description": "Manager supports upgrading clusters and provides two upgrade modes: full downtime upgrade and online rolling upgrade."
}
---

# Upgrade Compute-Storage Integrated Cluster

Manager supports upgrading clusters and provides two upgrade modes: full downtime upgrade and online rolling upgrade. On the cluster page, click **Cluster Upgrade** from the top-right dropdown menu, then select the target upgrade version and upgrade mode to proceed with the cluster upgrade operation.

## Upgrade Precautions

* During a full upgrade, you can choose to back up data. If the cluster has a large amount of data, the backup may take a long time, during which the service will be unavailable.
* Data cannot be backed up during a rolling upgrade. Rolling upgrades cannot roll back to two-digit versions, but they can roll back to three-digit versions.

## Step 1: Click Upgrade Cluster

On the **Cluster - Nodes** page, in the top-right dropdown menu, select "Cluster Upgrade".

![upgrade-cluster-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/upgrade-cluster-integrated.png)

## Step 2: Select Upgrade Mode

![chose-upgrade-type-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/chose-upgrade-type-integrated.png)

When upgrading a cluster, you can choose between full downtime upgrade and online rolling upgrade:

| Upgrade Method      | Cluster Availability                                                 | Rollback Support                  |
| :------------------ | :------------------------------------------------------------------- | :-------------------------------- |
| Full Downtime Upgrade | Cluster is unavailable                                               | Supports data backup; can roll back after backup |
| Online Rolling Upgrade | Cluster is available, but nodes undergoing rolling restart will cause read/write request failures, requiring retries in the application client | Does not support data backup; cannot roll back  |

When data backup is selected, it will be stored in the `upgrade` directory under the FE or BE root directory. This directory can be deleted after confirming the cluster has been successfully upgraded.

## Step 3: Verify Upgrade

**Full Downtime Upgrade Verification**

Full downtime upgrade supports rollback. After a full downtime upgrade, you can check the completed cluster, and if any abnormalities are found, you can perform a rollback operation.

![full-upgrade-review-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/full-upgrade-review-integrated.png)

**Online Rolling Upgrade Verification**

During an online rolling upgrade, you can first upgrade a single node. Once the single node upgrade is complete, you can then perform a rolling upgrade of all remaining nodes.

![rollup-upgrade-reivew-integrated](/images/enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster/rollup-upgrade-reivew-integrated.png)