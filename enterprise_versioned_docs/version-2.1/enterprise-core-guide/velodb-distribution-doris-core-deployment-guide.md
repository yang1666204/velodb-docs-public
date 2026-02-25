---
{
    "title": "VeloDB Enterprise Core Installation Manual",
    "description": "This document is primarily for the direct installation of VeloDB Enterprise Core."
}
---

# VeloDB Enterprise Core Installation Manual

This document is primarily for the **direct installation** of VeloDB Enterprise Core. We recommend using our provided VeloDB Manager for a one-click completion of cluster deployment, scaling, and shrinking.

For convenient installation and usage, Java8 is embedded in the package, eliminating the need for a separate Java installation. After downloading, it can be executed directly.

## Machine Environment

### Overview

Apache Doris can run on the majority of mainstream Linux servers. It is recommended to choose newer versions of CentOS and Ubuntu for Linux, along with GCC version 4.8.2 and above. Before installation, ensure the following Linux system settings.



#### Increase the maximum open file handles for the system

```
vi /etc/security/limits.conf 
* soft nofile 65536
* hard nofile 65536
```

#### Adjust the size of vm.max_map_count

```
vi /etc/sysctl.conf
vm.max_map_count=2000000
Then execute to make it effective.
sysctl -p
```

#### Clock Synchronization

Doris's metadata requires time accuracy to be less than 5000ms. All machines in the cluster need to synchronize their clocks to avoid services experiencing abnormalities due to inconsistent metadata caused by clock issues.

#### Disable Swap Partition

Linux swap partition can introduce severe performance issues for Doris. It is necessary to disable the swap partition.

### Development and testing environment

| Module     | CPU  | Memery  | Disk               | Network      | Number of Instances |
| -------- | ---- | ----- | ------------------ | --------- | -------- |
| Frontend | 8 cores+ | 8GB+  | SSD or SATA, 10GB+ | Gigabit Ethernet+ | 1        |
| Backend  | 8 cores+ | 16GB+ | SSD or SATA, 10GB+ | Gigabit Ethernet+ | 1-3      |

### Production environment

| Module     | CPU   | Memery  | Disk                   | Network      | Number of Instances |
| -------- | ----- | ----- | ---------------------- | --------- | -------- |
| Frontend | 16 cores+ | 64GB+ | SSD or RAID card, 100GB+ | 10 Gigabit Ethernet+ | 1-3      |
| Backend  | 16 cores+ | 64GB+ | SSD or SATA, 100GB+     | 10 Gigabit Ethernet+ | 3 +      |


Note:

1. The disk space for FE is mainly used for storing metadata, including logs and images, occupying approximately several tens of gigabytes.
2. The disk space for BE is primarily used to store data. The total disk space is calculated based on the total data volume * 3 (3 replicas), and then an additional 20% of space is reserved for data compaction and storage of some intermediate data.
3. Multiple BE instances can be deployed on one machine, but it is recommended to deploy only one FE. For ensuring data high availability, it is advisable to deploy one BE instance on each of three machines (instead of deploying 3 BE instances on one machine).
4. FE roles include Follower and Observer (Leader is a role elected from the Follower group, collectively referred to as Follower).
5. The minimum data for an FE node is 1 (1 Follower). For providing high availability for reads, it is recommended to deploy 1 Follower and 1 Observer. If high availability is required for both reads and writes, then deploy 3 Followers.

#### Network Requirements

Doris instances communicate over the network. The table below shows all the required ports:

| Instance Name | Port Name              | Default Port | Communication Direction      | Description                                                  |
| --------------- | ------------------------ | -------------- | ------------------------------ | -------------------------------------------------------------- |
| BE            | be_port                | 9060         | FE --> BE                    | Port on BE for Thrift server to receive requests from FE     |
| BE            | webserver_port         | 8040         | BE <--> BE                   | Port for HTTP server on BE                                   |
| BE            | heartbeat_service_port | 9050         | FE --> BE                    | Port for Thrift heartbeat service on BE to receive from FE   |
| BE            | brpc_port              | 8060         | FE <--> BE, BE <--> BE       | BRPC port for communication between BEs                      |
| FE            | http_port              | 8030         | FE <--> FE, User <--> FE     | Port for HTTP server on FE                                   |
| FE            | rpc_port               | 9020         | BE --> FE, FE <--> FE        | Port for Thrift server on FE, consistent across FE instances |
| FE            | query_port             | 9030         | User <--> FE                 | Port for MySQL server on FE                                  |
| FE            | edit_log_port          | 9010         | FE <--> FE                   | Port for communication between BDBJE on FE                   |
| Broker        | broker_ipc_port        | 8000         | FE --> Broker, BE --> Broker | Port for Thrift server on Broker to receive requests         |

> Note: When deploying multiple FE instances, ensure that the `http_port` configurations are the same.


#### Network Configuration

Due to the presence of multiple network interfaces or the existence of virtual network interfaces caused by installations like Docker, a single host may have multiple different IP addresses. Doris currently cannot automatically identify available IPs. Therefore, when dealing with a deployment host that has multiple IPs, it is necessary to forcefully specify the correct IP through the priority_networks configuration.

priority_networks is a configuration option present in both FE and BE, and it should be included in the fe.conf and be.conf files. This configuration is used to instruct the process on which IP to bind to when starting FE or BE. The configuration example is as follows:

`priority_networks=172.16.21.0/24`

This is a representation in [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) format. FE or BE will use this configuration to find a matching IP to serve as its own listening IP.

**Note** : Configuring priority_networks and starting FE or BE ensures that FE or BE itself is bound to the correct IP. However, when using the ADD BACKEND or ADD FRONTEND statements, you also need to specify an IP that matches the priority_networks configuration; otherwise, the cluster will not be able to establish communication. For example:

If the BE configuration is: `priority_networks=172.16.21.0/24`

But when using `ADD BACKEND`, the following IP is used:

```sql
ALTER SYSTEM ADD BACKEND "172.16.1.12:9050";
```

FE and BE will not be able to communicate properly.

In such cases, it is necessary to drop the incorrectly added BE and re-execute ADD BACKEND with the correct IP.

The same principle applies to FE.

BROKER currently does not have, nor does it need, the priority_networks option. The Broker service binds by default to 0.0.0.0. It is only necessary to add the correct accessible BROKER IP when using ADD BROKER.

## Cluster Deployment

First, download the VeloDB Enterprise Core installation package.

The downloaded package will have a name similar to: velodb_doris_x.x.x.x-x86_64-avx2.tar.gz.

Next, unzip the installation package.

```
tar zxf velodb_doris_x.x.x.x-x86_64-avx2.tar.gz
```

After extraction, the directory will include the following contents

```
VeloDB_doris_x.x.x.x-x86_64-avx2
|-- README.md             ## Documentation
|-- apache_hdfs_broker    ## FS_Broker
|-- audit_loader          ## Auditlog Plugin
|-- be                    ## Doris be
|-- fe                    ## Doris FE
|-- java8                 ## Java Runtime Environment (JRE) required for Doris FE/BE/Broker 
|-- jdbc_drivers          ##Database driver dependencies for running Doris FE/BE with JDBC, as well as for Multi Catalog operations.
`-- udf
```

#### FE Deployment

* Copy the extracted folder to the designated node.

  If you are deploying only the FE without other services, you can retain only the fe, java8, and jdbc_drivers directories within this folder. Other directories can be deleted.

* Configure FE

  1. The configuration file is located at conf/fe.conf. Pay attention to the meta_dir, which is the location for storing metadata. The default value is ${DORIS_HOME}/doris-meta. This directory needs to be created manually.

     **Note：For production environments, it is strongly recommended to specify a separate directory outside of the Doris installation directory, preferably on a dedicated disk (preferably SSD). Default configurations can be used for testing and development environment**


  2. In fe.conf, the default setting for JAVA_OPTS specifies a maximum Java heap memory of 8GB. It is advisable to adjust this setting based on the available machine memory.

* Start FE

  `bin/start_fe.sh --daemon`

  The FE process will start and run in the background. The logs are, by default, stored in the log/ directory. If the startup fails, you can check the error information in log/fe.log or log/fe.out.

* Check FE Running Status

  Connect to the FE using the MySQL client and execute the following command to check the running status of BE:

  ```SQL
  SHOW FRONTENDS;
  ```

If everything is normal, the isAlive column should be true.

* If you need to deploy multiple FEs, please refer to [Elastic Expansion](https://doris.apache.org/docs/dev/admin-manual/cluster-management/elastic-expansion).

#### BE Deployment

* Copy the extracted folder to the designated node

  If you are deploying only the BE without other services, you can retain only the be, java8, and jdbc_drivers directories within this folder. Other directories can be deleted.

* Modify the configuration for all BEs

  Edit be/conf/be.conf. The main configuration to adjust is storage_root_path, which is the data storage directory. By default, it is under be/storage, and this directory needs to be created manually. Multiple paths should be separated by a semicolon ; (do not add ; after the last path).
  
  You can differentiate storage directories based on the storage medium, HDD, or SSD. You can add capacity limits at the end of each path, separated by `,`. If the user is not using a mix of SSD and HDD disks, it is not necessary to configure as shown in Example 1 and Example 2; just specify the storage directory.

  Example 1：

  **Note: If using an SSD, add `.SSD` after the directory; for an HDD, add `.HDD` after the directory**

  `storage_root_path=/home/disk1/doris.HDD;/home/disk2/doris.SSD;/home/disk2/doris`

  **Explanation**

    - /home/disk1/doris.HDD ： Indicates that the storage medium is HDD;
    - /home/disk2/doris.SSD： Indicates that the storage medium is SSD；
    - /home/disk2/doris： Indicates that the storage medium is HDD (default)

  Example 2：

  **Note: Regardless of whether it's an HDD or SSD disk directory, there is no need to add a suffix; specify the medium in the storage_root_path parameter.**

  `storage_root_path=/home/disk1/doris,medium:hdd;/home/disk2/doris,medium:ssd`

  **Explanation**

    - /home/disk1/doris,medium:hdd： Indicates that the storage medium is HDD;
    - /home/disk2/doris,medium:ssd： Indicates that the storage medium is SSD;

* Adding All BE Nodes in FE

 BE nodes need to be added in FE before they can be included in the cluster. You can use the MySQL client to connect to FE:

  ```sql
  ./mysql-client -h fe_host -P query_port -uroot
  ```
  
  In the provided information, `fe_host` represents the IP address of the FE node, and `query_port` is configured in fe/conf/fe.conf. The default login uses the root account with no password.
  
  After logging in, execute the following commands to add each BE:

  ```sql
  ALTER SYSTEM ADD BACKEND "be_host:heartbeat-service_port"
  ```

* Start BE

  ```
  bin/start_be.sh --daemon
  ```

  The BE process will start and run in the background. The logs are, by default, stored in the be/log/ directory. If the startup fails, you can check the error information in `be/log/be.log`  or `be/log/be.out`.

* Check BE Status

  Connect to the FE using the MySQL client and execute the following command to check the running status of BE

  ```sql
  SHOW BACKENDS;
  ```

  If everything is normal, the isAlive column should be true.

#### FS_Broker deployment (optional component)

The Broker is deployed independently of Doris in the form of a plugin. If you need to import data from a third-party storage system, you need to deploy the corresponding Broker. The default provided fs_broker reads from HDFS and object storage. The fs_broker is stateless, and it is recommended to deploy one Broker for each FE and BE node.

If deploying with FE and BE nodes together, you only need to keep the `apache_hdfs_broker` folder in the extracted directory.

* Modify the corresponding Broker configuration

  In the broker/conf/ directory under the corresponding broker folder, you can modify the relevant configurations.

* Start Broker

  ```
  sh bin/start_broker.sh --daemon
  ```

* Add Broker

  To let Doris' FE and BE know which nodes the Broker is on, add the Broker node list through the sql command.

  Use mysql-client to connect to the started FE and execute the following command:

  ```sql
  ALTER SYSTEM ADD BROKER broker_name "broker_host1:broker_ipc_port1","broker_host2:broker_ipc_port2",...;
  ```

  Among them, broker_host is the IP address of the node where the Broker is located; broker_ipc_port is in the Broker configuration file conf/apache_hdfs_broker.conf.

* Check Broker Status

  Use mysql-client to connect to any started FE and execute the following command to view the Broker status:

  ```sql
  SHOW PROC "/brokers";
  ```

  

