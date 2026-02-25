---
{
    "title": "Platform Release Notes",
    "description": "This article describes the release notes for the management and control platform of VeloDB Cloud."
}
---

# Platform Release Notes

This article describes the release notes for the management and control platform of VeloDB Cloud.

<br />

## February 2026

**New Features**

- Added a tutorial to help users get started with easy-to-follow product guidance.

**New Regions**

- The BYOC model was launched in the Tokyo region of AWS.

## January 2026

**New Features**

- Added support for seamless, one-time full migration of data from Apache Doris and StarRocks into the VeloDB data warehouse.

**New Regions**

- The BYOC model was launched in the Frankfurt region of GCP.

## December 2025

**New Features**

- Added a one-click alert feature to rapidly set up an alerting system, enabling timely awareness of exceptions in key monitoring items.
- Optimized the AWS Cloud BYOC template mode by upgrading authentication from AK/SK to IAM Role and supporting reuse through a credential wizard.
- Added support for visual creation of external Catalogs, lowering the barrier for multi-source data integration.

## November 2025

**New Features**

- Added Transparent Data Encryption (TDE) function, providing higher-level security protection for static data.
- Supports data backup and recovery, ensuring the reliability and continuity of business data.
- Added operational audit logs, meeting security compliance and operational traceability requirements.
- BYOC supports wizard mode, making bring-your-own-cloud cluster deployment easier and faster.
- Supports seamless data import from Confluent Cloud and Kafka, simplifying real-time data integration.
- Added credit card payment method, providing users with more convenient and flexible payment options.
- AWS Marketplace supports Private Offer/Contract/Free Trial.

**Improvements**

- Deeply integrated with SQL editor, it delivers a seamless and smooth experience for data development and management.

## August 2025

**New Features**

- Added support for Single Sign-On (SSO) via Google and Microsoft.
- MFA now supports authenticator apps (such as Google Authenticator, Microsoft Authenticator, or Authy).

**Pricing**

- Warehouse usage is now free of charge, no separate fees will be applied.

**Improvements**

- Warehouse connections are now public by default, with an optimized private endpoint configuration process and improved connection information display.
- Reorganized the management platform menu for clearer organization and personal configuration options.
- Added a new warehouse usage guide and improved guidance from usage to payment.
- Enhanced alert notifications and added alert recovery reminders.
- Supports synchronous deployment of warehouse and cluster with parallelized processes.

**New Regions**

- The SaaS model was launched in the Tokyo region of AWS.

## June 2025

**New Features**

- Add premium technical support service billing item. Customers who purchase this service will need to pay an additional fee.
- Supported monitoring and alerting of cache space utilization.

**Improvements**

- Smooth out the commission fee difference between the cloud marketplace deduction channel and the cash deduction method. Customers who use AWS Marketplace or GCP Marketplace deduction channels will have the same cost as the cash deduction method for recharging on VeloDB Cloud. By using the cloud marketplace deduction channel, there is no need to bear additional commission fees.
- Optimized Studio login prompt information.

**New Regions**

- The BYOC model was launched in the Middle East (Bahrain) region of AWS.

## May 2025

**New Features**

- Supported multi availability zone disaster recovery, by mounting the active and standby clusters through the virtual cluster, it can automatically failover to the standby cluster in another availability zone when the active cluster fails, and continue to provide service. When users need to test and rehearse, they can also manually switch between the active and standby clusters. This feature has requirements for core version and region: core version not lower than 4.0.7, and at least 3 availability zones in the region.

**Improvements**

- Optimized the email notification content for warehouse code version upgrade failures.
- Optimized the BYOC warehouse core version upgrade function prompt content, reminding that after upgrading the core version, the cluster HTTP protocol port will change, and users need to add the new port to the access control whitelist to allow outgoing requests to access this port.
- The VeloDB Cloud product introduction page on AWS Marketplace had added the "Deploy on AWS" designation.

## April 2025

**New Features**

- Supported bank corporate transfer recharge.
- Supported VeloDB Professional Services purchase on AWS Marketplace.
- When creating a BYOC warehouse, a subnet segment detection step bad been added. If it is too small to allocate the IPs, the process will be interrupted and an error message will be displayed.

**Improvements**

- Optimized the BYOC warehouse core version upgrade function.

**New Regions**

- The BYOC model was launched in the Asia Pacific (Singapore) region of AWS.

## March 2025

**New Features**

- Add basic metrics and service metrics monitoring for warehouse.
- Add alarm for warehouse metrics.

**New Regions**

- The SaaS model was launched in the Asia Pacific (Hong Kong) region of AWS.

## February 2025

**New Features​**

- Supported BYOC warehouse and cluster custom tags.

**Improvements**

- Optimize error information when creating the BYOC warehouse.

**New Regions**

- The BYOC model was launched in the us-east4 region of GCP.

## January 2025

**New Features**

- Supported choosing CPU architecture when creating a new cluster in VeloDB Cloud SaaS or BYOC warehouse on AWS, default is x86, customers can choose ARM. Once a cluster is created, modifying the CPU architecture is not supported.


## December 2024

**New Features and Improvements**
- Support multi available zone disaster recovery
- Azure cluster supports independent cache expansion
- When creating a warehouse, you can specify whether the table name is case sensitive

**New Cloud Platforms**
- BYOC mode was launched on Azure

## November 2024

**New Features and Improvements**

- Support GCP Marketplace
- Alert rules and alert history support paging
- Add a permanent Get Help entrance in the lower right corner

## October 2024

**New Features and Improvements**

- Optimization of the registration/login/free trial links between the official website and Cloud
- The SaaS free trial warehouse period has been increased from 7 days to 14 days
- Open personal email registration/login, and add support for mobile phone login
- Automatically create an organization when a new user registers and logs in, reducing operations
- Verify when activating a free warehouse: whether the organization has been associated with an enterprise email, if not, it needs to be associated with an enterprise email

## September 2024

**New Features and Improvements**

- BYOC warehouse usage optimization
  - Optimize the process of creating a BYOC warehouse, add preparation guidance and document guidance
  - Optimize the deletion of the last BYOC warehouse and clear the BYOC environment
  - Optimize WebUI Link availability check, connection distinction between public and private IP
  - Optimize the core version upgrade, bind upgrade Meta Service
  - Optimize the minimum permission set of Amazon Web Services
  - Optimize the source of Amazon Web Services security group, narrow it down to subnet CIDR
  - Optimize the unified alarm link

**New Zones**
- BYOC mode was launched in Huawei Cloud Beijing 4 regions.


## August 2024

**New Regions**

- BYOC mode was launched in the US West (Oregon) region of AWS.

<br />

## July 2024

**New Features**

- Supported setting the **O&M Time Window** for each warehouse.
- Supported setting the **Patch Version Upgrade Policy** of VeloDB Core, users can choose auto upgrade or manually upgrade.
- Supported the **Scheduled Events** for each warehouse. The event type was only "**Upgrade Version**", including events that the system automatically upgrading the patch version of VeloDB Core according to the policy set by the user and the user manually upgrading the version of VeloDB Core by specifying an execution time window.
- Supported **Message Center**, currently including **In-site Messages** and **Scheduled Events** list management functions.

**New Cloud Platforms**

- BYOC mode was launched on GCP.
- SaaS mode was launched on Azure.

**New Regions**

- BYOC mode was launched in the Oregon (us-west1) region of GCP.
- SaaS mode was launched in the West US 3 (Arizona) region of Azure.

**Improvements**

- In-site message function optimization, supported list management, including: filtering by time range, one-click filtering of unread/read messages, paging messages, one-click marking of all messages as read, one-click marking of checked messages as read, etc.

<br />

## June 2024

**New Features**

- Supported presentation the port information of clusters, allowing users to conveniently import data using Stream Load method.
- Supported users to directly view the statistical results of Consumption Amount, Pretax Amount, and Arrears Amount.
- Supported *compaction score* metric monitoring and alarm.
- Supported whitelisted personal email registration the organization (account) on VeloDB Cloud.

**Improvements**

- Organization administrators (including organization creators) cannot modify their own roles.
- The Cash Balance, Voucher Balance, Cloud Marketplace Deduction Channel and other information layout optimization in Billing Center -> Billing Overview page.

<br />

## March 2024

**New Features**

- Supported users to individually adjust the cache space of the cluster (currently only scaling out is supported).
- The yearly billing resources of VeloDB Cloud cluster on AWS support scaling out.

**Improvements**

- Users can view monitoring information when the cluster is not running.
- When deleting the SaaS mode trial cluster, the SaaS mode trial warehouse will also be deleted.
- When users select the WeCom group, Lark group, or DingTalk group as the alert channel, they will be reminded that the VeloDB Cloud server IP address can be added in the access control whitelist of **Webhook**.

<br />

## February 2024

**New Features**

- Supported **on-demand(hourly)**, **subscription(monthly)**, and **subscription(yearly)** billing method for the paid clusters. The paid clusters can have only one of these billing methods, or a combination of [monthly + hourly] or [yearly + hourly] billing methods. Users can directly convert the on-demand(hourly) billing resources after testing and stabilization to monthly or yearly billing to save long-term ownership and use costs; they can also flexibly scale out/in the on-demand(hourly) resources at any time to cope with temporary increases and decreases in business on the basis of monthly or yearly billing resources.

**New Cloud Platforms**

- SaaS mode was launched on Alibaba Cloud.

**New Regions**

- SaaS mode was launched in the Singapore region of Alibaba Cloud.

**Improvements**

- The SaaS mode on Alibaba Cloud is officially commercialized with price.
- The SaaS mode on HUAWEI CLOUD is officially commercialized with price.
- When creating a new warehouse, the configuration parameter *region* supports classification, corresponding to different price classifications.

<br />

## December 2023

**New Features**

- BYOC mode supported distinguishing between the free warehouse and paid warehouses, and the free warehouse can be upgraded to paid use.
- BYOC free warehouse quota limit. Each organization can only activate one free warehouse. Only one free cluster can be created in the free warehouse. The maximum computing resources are 64 vCPU. The upper and lower limits of the cache space are limited by the computing resources and vary.

**Improvements**

- Optimization of the description, graphics and hypertext links for HUAWEI CLOUD **Private Network Connection** function in SaaS mode.

<br />

## November 2023

**New Features**

- Supported customizing the cache space when creating a new cluster. The upper and lower limits of the cache space are affected by computing resources and vary.

**New Cloud Platforms**

- SaaS mode was launched on HUAWEI CLOUD.

**New Regions**

- SaaS mode was launched in the AP-Jakarta region of HUAWEI CLOUD.

**Improvements**

- The **WebUI** login entrance had been added to the warehouse function menu, making it more convenient and faster.

<br />

## October 2023

**New Features**

- A new private warehouse (**BYOC, Bring Your Own Cloud**) product mode had been added, and whitelist customers were invited to experience it for free. For customers who need to run the VeloDB data warehouse in their own cloud account and VPC, they can use this product mode. This mode of product has the same capabilities as a proprietary warehouse (**SaaS, Software as a Service**) mode, including: cloud native computing and storage separation, elastic scaling, monitoring and alarming, etc. In addition, it can also meet customers' additional needs, including: higher compliance requirements, better cloud resource discounts, and better connection with the surrounding big data ecosystem.

**New Cloud Platforms**

- BYOC mode was launched on AWS.

**New Regions**

- BYOC mode was launched in the US East (N. Virginia) region of AWS.

**Improvements**

- Overall optimization of monitoring metrics.
- Storage resource usage statistics were more accurate.

<br />

## September 2023

**New Features**

- Supported **Auto Resume** when receiving a business request when the on-demand cluster was shut down, improving the **Auto Pause/Resume** function.
- Supported the **Auto Pause** function of the SaaS free trial cluster. This function is enabled by default (disable is not supported). It will be automatically paused after being idle for 360 minutes (user-definable). Users need to manually resume it.

**Improvements**

- The functional constraints of the free trial warehouse and cluster in various states are more standardized, and usage statistics are more accurate.
- Usage information display optimization.
- Added 3 new monitoring metrics: Load Rows Per Second (Row/s), Load Bytes Per Second (MB/s), and Finished Load Tasks.
- When deleting a warehouse, the current operator's email address is displayed for receiving verification codes.

<br />

## August 2023

**New Features**

- Supported creating and modifying organizations.
- Supported new customer self-registration organizations (login is registration).

**New Regions**

- AWS Europe (Frankfurt)

**Improvements**

- The list of AWS endpoints for private network connection was optimized, and tips and links were given on where to find the Endpoint DNS Name.
- **IP Whitelist Management** optimization for public network connection.
- Quota prompts for **New Organization**, **New Warehouse**, and **New Cluster**.
- Update the content of **In-site Notifications** and **Email Notifications**.

<br />

## June 2023

**New Features**

- On-demand billing clusters support **Time-based Scaling**, which can not only meet the needs of business load scenarios with obvious peaks and lows in a day and have time-periodical regularity, but also avoid the situation that the configuration is too low to cause insufficient resources or the configuration is too high to cause resource waste.

- On-demand billing clusters supported **Manual Pause/Resume**, and **Auto Pause**. It can release computing resources while retaining cache space when the cluster has no load, reducing resource waste and saving costs. It can also quickly pull up computing resources and mount reserved cache resources and data, so that business requests can be quickly responded to.

- WebUI supports multiple tab pages, which is convenient for users to process multiple SQL queries in parallel.

**Improvements**

- WebUI space utilization optimization and database table directory tree optimization provide larger query statement/result display space.

<br />

## May 2023 

**New Features**

- The cluster supported cloud disk caching, the ratio of vCPU memory is fixed at 1:8, and the ratio of vCPU cache is temporarily 1:50.

- Supported "Lake House", integrate structured or semi-structured source data such as Hive, object storage (S3), MySQL, and Elasticsearch from user data lake through public network or private network connections, and perform federated query analysis in one VeloDB Cloud data warehouse; At the same time, the style of the private network connection had been reconstructed, and two methods are supported: access to VeloDB Cloud data warehouse from the user's clients or applications and access to the user's data lake from VeloDB Cloud data warehouse.

- Supported **Multi-Factor Authentication (MFA)**, strengthen login identity authentication and sensitive operation security (related functions include: MFA policy settings, batch invite users, profile, enroll mobile phone, SMS verification, password reset, etc).

- Added 3 information cards to the **Usage** page: Latest Compute Capacity (vCPU), Latest Cache Space (GB), and Latest Storage Size (GB).

**New Regions**

- AWS Asia Pacific (Singapore)

**Improvements**

- The cluster was adjusted to the configuration of the cluster's overall resources (vCPU, memory, and cache) from the configuration of multiplying the node size and the number of nodes.

- Cloud marketplace deduction authorization process optimization (new user guidance prompts, authorized organizations directly enter the console).

- Security certification: Passed six certifications of ISO.

- WebUI login entrance optimization (prominent position, early prediction and prompts whether and how to log in).

- Optimized the **IP whitelist** for public network connections (adding the last operator information).

- Warehouse navigation and detail optimization (added zone and creator information, rearranging the overall information).

<br />

## February 2023 

**New Features**

- The **Billing Center** page had been revised, and it supported **Monthly Bill**, **Hourly Bill**, **Billing Details**, and **Voucher Management**.

**New Regions**

- AWS US West (N. California)

**Improvements**

- The account system was restructured, and the permissions of VeloDB Cloud users and the database users were separated.

- The **Query** function module was independently used as a **WebUI** tool, and users need to log in to the warehouse to query data.

- The **Usage** page had been revised, and the Unit metering mechanism had been changed to vCPU-Hour and GB-Hour metering mechanisms.

- The **Billing Center** page had been revised, and the Unit billing and deduction mechanism had been changed to currency billing and deduction mechanism.

- Improved message templates for **In-site Notification** function and **Email Notification** function, updates related links and description.

<br />

## November 2022 

**New Features**

- The core version can be configured when creating a new warehouse, and in the drop-down selection box, only the latest patch version was retained for each minor version x.y.
- The **Warehouse Details** card added the core version number information. If the current version is not the highest version in the region of the cloud, there will be an upgrade reminder. Click the link icon can go to the **Settings** page to upgrade the version.
- The **Warehouse Details** added creation time information.
- The Warehouse statuses added "upgrading".
- **In-site Notification** function, adding support for notification of core version upgrade success and notification of core version upgrade failure.
- Supported the reminder card for the remaining time of the trial warehouse, which can be upgraded to paid warehouse with one click.

**Improvements**

- Adjusted the position of the core version upgrade entry, moved from the **Cluster Details** page to the **Warehouse Details** card, and can upgrade the core version of the warehouse and all clusters in it. The core version number was divided into three levels: Major, Minor, and Patch, and the format is as follows: x.y.z.

- Both the cluster card on the **Cluster Overview** page and the basic information on the **Cluster Details** page shielded the core version number, and the function operation area on the **Cluster Details** page shielded the **Version Upgrade** function.

- The **Cluster Resize** function and the **Cluster Scaling** function were integrated, and the name of the new function was unified as "**Cluster Scaling**".

<br />

## October 2022 

**New Features**

- Cluster reconstruction, was split into the warehouse service and the computing cluster.

- Supported storage-computing separation architecture, multiple computing clusters, and shared object storage data.

- Supported local disk as cluster cache.

- Supported **AWS Marketplace Deduction Channel**, AWS customers can reuse the balance of the AWS cloud account, and uniformly issue bills and Invoices from AWS.

- **In-site Notification** function, adding support for notifications of warehouse creation success, notifications of warehouse creation failure, notifications of warehouse deletion success, notifications of warehouse deletion failure, reminders of trial warehouse is about to expire and stop service, notifications of trial warehouse expiration and suspension of service, reminders of trial warehouse and its data will soon be deleted, notifications of trial warehouse recovery service, notifications of trial warehouse and its data deletion, reminders of suspension of service of paid warehouses due to arrears of payment, notification of suspension of service of paid warehouses due to arrears of payment, reminders of paid warehouses and their data will be deleted, notifications of paid warehouse recovery service, and snotifications of paid warehouses and their data are deleted.

- **Email Notification** function, adding support for notifications of welcome to join the organization, notifications of verification code, reminders of trial warehouse is about to expire and stop service, notifications of trial warehouse expiration and suspension of service, reminders of trial warehouse and its data will soon be deleted, notifications of trial warehouse recovery service, notifications of trial warehouse and its data deletion, reminders of suspension of service of paid warehouses due to arrears of payment, notification of suspension of service of paid warehouses due to arrears of payment, reminders of paid warehouses and their data will be deleted, notifications of paid warehouse recovery service, and snotifications of paid warehouses and their data are deleted.

- The console **Login** page supported switching between the Chinese station and the international station.

**New Regions**

- AWS US West (Oregon)

**Improvements**

- For operations that would cause cost changes (including: **New Cluster**, **Cluster Resize**, and **Cluster Scaling**), added a second confirmation.

- The **Organization Management** function supported organization ID (unique identifier) and setting duplicate organization names.

- **Data Query** function was enhanced.

- The entrance position of the **Access Control** function was adjusted, and it was moved from the warehouse operation area to the user operation area.

- The console interface had been revised and optimized, and the overall layout and UI components had been unified and standardized.

<br />

## August 2022 

**New Features**

- Supported SaaS mode, that is, both the cluster and the management and control platform were deployed in the VeloDB VPC.

- The **Connection** module was independent from **Cluster Management**, and supported public network connection and private network connection, and the **Private Network Connection** function supported AWS PrivateLink.

- Supported cloud disk storage.

- The cluster added the "Trial" free trial node size.

- Supported the On-Demand billing method, and charged for the overall resources of the cluster.

- Both **In-site Notification** function and **Email Notification** function supported reminders of upcoming arrears, notifications of suspension of services due to arrears, reminders of imminent deletion of data, notifications of cluster recovery service, and notifications of cluster release and data deletion.

**Improvements**

- Console interface revision and optimization, including: **New Cluster**, **Cluster Details**, **Cluster Upgrade**, **Cluster Resize**, **Cluster Scaling**, **Cluster Deletion**, **Billing Overview**, **Billing Help**, **Purchase Units**, **Historical Orders**, etc.

- The **Metering and Billing** page was split into the **Usage** page and the **Billing Center** page. The **Usage** page remained in the navigation bar of the cluster operation area, and the entrance to the **Billing Center** page was moved to the user operation area.

- Removed the function of **AK&SK Authorization of Customer Cloud Account**.

<br />

## July 2022 

**New Features**

- Supported hybrid mode, that is, the cluster was deployed in the customer VPC, and the management and control platform is deployed in the VeloDB VPC.

- Supported basic functions such as **Cluster Management**, **Data Query**, **Performance Monitoring**, **Access Control**, **AK&SK Authorization of Customer Cloud Account**, and **Metering and Billing**.

- Supported the On-Demand billing method, and only charge value-added service fees.

**New Cloud Platforms**

- AWS

**New Regions**

- AWS US East (N. Virginia)
