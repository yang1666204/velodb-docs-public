---
{
    "title": "VeloDB Manager",
    "description": "July 31, 2025"
}
---

# VeloDB Manager

## Enterprise Manager 25.2.x

### Enterprise Manager 25.2.0

November 31, 2025

New Features and Improvements
- Supports management and control of Doris version 4.0.
- Supports Doris FQDN mode.
- Supports hosting specified compute-storage separation clusters (created by Manager).
- Optimized the hosting process for proxy clusters.
- Upgraded the Grafana component to version 10.3.10.
- Added several best-practice parameters during cluster deployment in Manager.

Bug Fixes
- Fixed incorrect display of default alert policy titles.
- Fixed incomplete export of scheduled cluster inspection results.
- Added authentication by default to the Agent's /metrics interface.

## Enterprise Manager 25.1.x

### Enterprise Manager 25.1.0

September 31, 2025

New Features and Improvements
- ​Manager logs obscure passwords and AK/SK plain text.
- Streamlined alert recovery notifications.
- Optimized the alert title for the FE Collection Compaction Score monitor.
- Inspection task timeout duration now supports independent configuration.
- Optimized query timeout handling in Grafana CPU usage charts.
- Manager installation package now integrates the Doris diagnostic information collection tool (diag-tool).

Bug Fixes
- Fixed an issue preventing LDAP users from logging into Studio.
- Resolved a Manager upgrade failure caused by permission issues in RedHat environments.
- Fixed the CPU core count display in the inspection data overview which previously failed to filter out BE nodes.
- Addressed a check failure for priority_networks during cluster takeover.
- Fixed an issue where heartbeat requests between Webserver and Agent could fail due to NaN errors when retrieving host information, preventing a response.
- Fixed an issue where inspections did not use the FE proxy.
- Resolved sporadic getcwd errors occurring in specific machine environments.Supports FE scaling for disaggregated storage and compute clusters (follower requires version 3.0.7, observer has no restrictions).

### Enterprise Manager 25.1.0

July 31, 2025

New Features and Improvements
- Supports FE scaling for disaggregated storage and compute clusters (follower requires version 3.0.7, observer has no restrictions).
- Displays FDB node information for disaggregated storage and compute clusters.
- Optimized cluster health check, supporting single-item retry and general configuration.
- Automatic cleanup of historical cluster health check results.
- Optimized Manager login and password operations for enhanced security.
- Manager alerts support custom request parameters for webhooks.
- Automatic cleanup of historical alert results.
- Automatic cleanup of BE backup data after successful upgrade verification.
- Host nodes provide Agent restart and re-registration functions.
- SQL initiated by non-users in Manager and Studio now includes a tag prefix.
- Added automatic detection and build of JDK installation packages before upgrade or scale-out operations.
- Optimized Agent process liveness and automatic restart logic.
- Prints Agent startup logs.
- Security vulnerability fixes for third-party libraries in Manager and Studio.
- Optimized Manager logic for modifying Doris node configuration files.
- Optimized text on the service configuration page.
- Optimized FE node startup order during cluster configuration changes.
- Configurable monitoring metric collection interval.


Bug Fixes
- Fixed the issue where FE meta directory was overwritten during rolling upgrade rollback.
- Fixed the issue where tasks got stuck after restarting Manager during BE scale-in.
- Fixed the issue where multi-node clock checks were not performed in parallel.
- Fixed the issue where monitoring data path modification was ineffective.
- Fixed the issue where error reasons were not displayed during node checks for scale-out.
- Fixed alert issues related to the "number of inactive nodes" metric.
- Fixed the issue where batch modification of multi-node configurations in configuration changes could lead to configuration file overwrites.
- Fixed the issue where `DORIS_HOME` variable in configuration files was not correctly recognized.
- Fixed occasional inability to delete alert rules.
- Fixed repetitive IP addresses in BE Compaction Score metric-related alerts.
- Fixed the issue where semantic monitoring frequently caused warn messages in FE logs.
- Fixed Manager's own task failure retry and log display issues.
- Fixed Grafana Dashboard display issues.
- Fixed the issue where Manager DB data update failed during failed scale-out retry.
- Fixed float field overflow issue in Studio SQL editor.

## Enterprise Manager 25.0.x

### Enterprise Manager 25.0.0
Jun 20, 2025

New Features and Improvements
- Support compute-storage separation cluster upgrades
- Compute-storage separation clusters now support storage backends such as HDFS, MINIO, and GCP
- Support downgrade and version upgrades for clusters
- Log-based alerting functionality added
- Cluster inspection feature optimized
- Support HTTPS access for Manager
- Manager now automatically syncs compute group information from cluster nodes
- Support modifying compute group names via Manager
- Added process checks during cluster node upgrade steps
- Manager startup logs are now printed

Bug Fixes
- Fixed an issue where node operation database records failed to update in certain scenarios
- Fixed an issue where JDBC connection pools were not reused in some cases
- Fixed an issue where HostMonitor displayed incomplete data after Manager upgrade
- Fixed an issue where long network interface information caused save failures
- Rolling upgrade rollback now includes version restrictions
- Fixed an issue where Arm-based Manager failed to start due to FDB package copy errors
- Fixed an issue where the implementation and description of cluster root password modification were inconsistent

## Enterprise Manager 24.3.x

### Enterprise Manager 24.3.2

August 20, 2025

Bug Fixes

- Disable the Agent's auto-collection of diagnostic data for the Doris cluster

### Enterprise Manager 24.3.1

May 20, 2025

Bug Fixes

- Fix the issue where the crontab is accidentally cleared after performing an inspection
- Fix the incorrect default value of the "whether to enable the new optimizer" inspection item

### Enterprise Manager 24.3.0

May 6, 2025

New Features and Improvements
- Cluster inspection feature (Preview version)
- Refactored and optimized tasks for Manager deployment and upgrade
- Added validation for JAVA_HOME during node pre-check
- Added pre-checks for node start, restart, and batch restart
- IO-Util and disk throughput in host monitoring are now displayed by specific disks
- Optimized message prompts for backup data during cluster upgrade
- Studio supports version retrieval
- Optimized prompts for Studio redirection
- Optimized directory generation logic for node metadata, storage, and logs when creating a new cluster
- Added display of Agent deployment port and path on the host interface
- Allow setting auto-restart and FE proxy address even when the cluster is not running
- Optimized Manager log structure and removed `manager.out` log

Bug Fixes
- Fixed issue where historical monitoring data was not visible after re-taking over the same cluster
- Fixed workload group monitoring metric issues
- Fixed false positives in semantic monitoring content
- Fixed heartbeat failures sent to Agent under some abnormal conditions
- Fixed recursive directory issue during Agent upgrade causing upgrade failures
- Fixed incorrect node status display after Agent failure
- Fixed incorrect backup directory permission check result during cluster upgrade check
- Fixed incomplete error message display during cluster upgrade pre-check
- Fixed inaccurate disk space check in some scenarios during cluster upgrade
- Fixed inability to display backup progress when backing up BE data during upgrade
- Fixed soft link recognition error in ENV packaging during expansion
- Fixed incorrect node check status during expansion
- Fixed false error during node deployment directory check when creating a new cluster
- Fixed missing `priority_networks` parameter in metaservice for new compute-storage separation clusters
- Upgraded Tomcat version to mitigate security vulnerabilities
- Fixed issue where log module could not view new directory logs after changing `audit_log_dir` configuration

## Enterprise Manager 24.2.x

### Enterprise Manager 24.2.0

March 7, 2025

New Features and Improvements
- Supports compute-storage separation cluster deployment
- Modified alert metrics for better readability
- Supports CPU frequency monitoring alerts
- Added monitoring and alerting for workload group resources
- Supports collection of cluster failure information (TopH, jstack, pstack, jstat, flame graphs)
- Supports custom PromQL alert configuration
- Added time filter functionality to the log module
- Supports configuring Doris upgrade version dependencies
- Manager can now synchronize recorded cluster information with Doris cluster
- BE nodes support batch start/stop
- Optimized one-click Agent deployment
- Optimized prompt information for node directory checks
- Directly replaces dict package during upgrade
- WebUI supports displaying column comments in tables
- Added pagination for import list in WebUI
- Highlighted search results in WebUI
- WebUI table header supports fixing
- Added download label in WebUI query history
- WebUI session management page now shows FE IP
- WebUI renders workload group max concurrency default value as unlimited

Bug Fixes

- Fixed issue where saved WebUI session records were overwritten
- Upgraded logback version to mitigate security vulnerabilities
- Fixed alert metric label failure caused by cluster name change
- Fixed file system inconsistency error during BE data backup
- Fixed Manager compatibility issues with PostgreSQL
- Fixed inaccurate query results for bigint type data in WebUI
- Fixed BE directory cleanup failure during scale-in
- Fixed timeout issues on some Manager proxy WebUI pages
- Fixed navigation issues in WebUI directory tree with identical names
- Fixed login exception in WebUI when switching clusters
- Fixed cluster inspection failure caused by null pointer
- Fixed incomplete PATH parsing of shell commands by Agent


## VeloDB Manager 24.1.x

### VeloDB Manager 24.1.5

January 22, 2025

New features and optimizations
- Grafana version upgrade & bug fixes
- WebUI audit log successful record filtering optimization
- Upgrade pre-check switch controls whether to skip the replica number check
- One-click deployment of Agent supports user-defined manager ip

Bug fixes
- Fixed the issue of SQL execution leakage when WebUI SQL editor terminates SQL
- Fixed the issue of invalid username or password displayed on the monitoring page after upgrading to 24.1.2
- Fixed the issue of WebUI SQL execution rewriting limit, accidentally removing valid space characters
- Fixed the issue of node network card being displayed as UNKNOWN
- Fixed the issue of Jobs alarm strategy generating false alarms
- Fixed the issue of inspection failure caused by the absence of external cache
- Fixed the issue of WebUI load management error
- Fixed the issue of file handle leak caused by webserver log rotation

### VeloDB Manager 24.1.4

December 20, 2024

New features and enhancements
- Added retry check optimization for portOpen
- Agent does not allow detection to pass when crontab is not configured

Bug fixes
- Fixed the issue that the 24.1.3 Cluster inspection was not executed but the task was successful
- Fixed the issue that some monitoring charts had no data after the Manager was upgraded to 24.1.3
- Fixed the issue of Manager file handle leakage
- Fixed the issue of duplicate authorization data in the white version of WebUI

### VeloDB Manager 24.1.3

December 12, 2024

New features and enhancements
- In cluster settings, support setting FE access proxy address
- In advanced configuration of monitoring and alarm service, add configuration of monitoring data retention time and monitoring data path
- When installing Mananger/Agent, check whether the dependent tools or scripts are available
- Optimize Agent one-click deployment/automatic restart
- Manager monitoring adds indicators related to the number of brpc threads
- Optimize information about failure to connect to FE cluster
- One-click initialization of machine environment
- Optimize BE scaling down, Manager execution, support cancellation
- Support unbinding of registered unused hosts
- Parameter configuration does not restrict parameters such as meta_dir
- Manager Agent supports one-click deployment
- Support single-node management and control operation retry
- Pre-cluster upgrade check whether the metaDir/storageDir recorded by Manager is consistent with the node configuration
- Optimize upgrade disk capacity check: scenario where fe_meta and FE are not on the same disk

Bug fixes
- Fix the issue that the monitoring chart displays the total capacity of cluster data in the wrong numerical unit
- Fix monitoring filter instance not taking effect & The problem of failure to obtain the default number of panels
- Fix the issue that the Manager backend database crashes and causes the jump to the initialization page
- Fix the issue that the interface returns an error when WebUI adds permissions to the view
- Fix the issue of failure to view FE logs
- Fix the issue that non-admin users jump to WebUI and report errors
- Fix the issue that the permission button cannot be displayed when the WebUI root account connects to 2.0.14 doris
- Fix the issue that the peak value of audit log details memory usage is incorrect
- Fix the issue that the Manager and Agent heartbeats fail after the cluster creation fails and the retry succeeds
- Fix the issue that the inspection does not respond when the cluster status is abnormal
- Fix the issue that the Agent is not displayed after upgrading to 24.1.2
- Fix the issue that the Manager upgrades the old Doris cluster including the WebUI and reports that the agent does not exist under certain conditions
- Fix the issue that the Manager proxy WebUI request timeout is too short
- Fix the issue that the Manager writes invalid content to the be.pid file
- Fix the issue that the Manager statistical indicators are inconsistent
- Fixed the 24.1.3 version to create a 2.0.x version of doris The problem of error message
- Fix the issue of restart check metadata_failure_recovery prompt error
- Fix the issue of modifying jvm parameters of doris configuration file during upgrade
- Fix the issue of monitoring agent default read and write timeout being too small, resulting in query 405 error code
- Fix scanning vulnerability


### VeloDB Manager 24.1.2

November 4, 2024

Bug Fixes

* Fix the issue where tasks stop after retrying a failed full-cluster upgrade.
* Support configuration history display and change comparison.
* Fix the issue of no data on the monitoring page.
* Fix the issue where the Agent's crontab detection did not consider symbolic links.
* Optimize the issue where manual restart is required for inconsistent Agent versions.
* Add alert metrics and monitoring charts for Stream Load Jobs.
* Add monitoring and alerting for missing table replica anomalies.
* Optimize configurable parameters that allow modifications.
* Optimize the logic for directory cleanup during scaling down.
* Optimize the logic for checking the alive status of scaled-down nodes and replica counts.
* Verify the presence of installation packages in newly added directories during scaling up.
* Support retry for cluster restart tasks.
* Check for residual crontab tasks on new nodes added to the takeover cluster.
* Optimize the BE decommissioning process.
* Optimize the Manager's cleanup of residual directories and files after upgrades.
* Automatically and regularly clean up Manager task logs.
* Optimize the queuing strategy for asynchronous thread pools in WebUI metadata collection.
* Support aliases for WebUI query results.
* Fix the issue where null values in WebUI query results are rendered as 0.
* Upgrade the tomcat-embed dependency to 9.0.90 to address vulnerabilities in WebUI.

### VeloDB Manager 24.1.1

October 21, 2024

Bug Fixes

* Fix issues with failure in managing VeloDB 2.0.x clusters.
* Resolve issues with abnormal access to WebUI services after Manager upgrades.
* Fix missing IP information in alert content and lack of alert conditions during rule replication.
* Add health checks to monitoring and resolve nested issues on the monitoring page.
* Fix the issue where the notification method for updating regular inspections did not take effect.
* Improve error reporting for node checks and refine prompt information for Agent liveliness checks.
* Automatically clean up old upgrade directories during Agent upgrades.
* Support modifying the log directory through parameter configuration changes.
* Add a check for whether the deployment directory is occupied during scaling.
* Fix abnormal display of Agent Warning information during node scaling.
* Resolve issues with failed sending of regular inspection reports and discrepancies between expected and actual values in inspection data results, even when the results are normal.
* Enhance the enterprise edition's WebUI to include the parent level when double-clicking to add table names.
* Add pre-upgrade checks, configuration changes, and inspections to verify Agent service availability.
* WebUI supports query restrictions for the special "select*" query syntax.

### VeloDB Manager 24.1.0

October 8, 2024

New Features

* Optimization of the alert module: Policies now support specifying alert levels, importing/exporting, sending notifications upon alert recovery, and enhanced alert information details.
* Enhanced upgrade process: Supports incremental (breakpoint) upgrades and rollback in case of upgrade anomalies.
* Optimized configuration management: Validates configuration effectiveness and supports interruption of configuration changes.
* Integrated webui into manager: Packaged together with manager, eliminating the need for separate deployment.
* Webui now supports workload group management, allowing for creation, editing, and viewing of workload groups.
* Webui supports import task management, and a new function display has been added to the data section.

## VeloDB Manager 24.0.x

### VeloDB Manager 24.0.5

September 27, 2024

Bug Fixes

* Optimize the Manager's detection logic during database upgrades or FE restarts, and add a time synchronization service check for FE.
* Fix the issue with directory permission checks during pre-upgrade.
* Fix the problem where the configuration file cannot be found if the deployment directory during scaling does not end with FE.
* Fix the issue where the managed cluster cannot find the JDK during an upgrade.
* Fix the issue where the BE process does not automatically restart after sending a kill -15 signal.
* Fix the problem where the Agent falsely detects BE process death, leading to the execution of the start script.
* Fix the issue where some node statuses become inconsistent after management operations in the Manager.
* Fix the incorrect unit settings in the File cache configuration.
* Fix the issue where, after a failed downsizing attempt, modifying the configuration shows an unknown status while the overview page shows "Running."
* Fix the problem where downsizing fails because the Manager shows a BE node as active when it is not actually alive.
* Optimize the issue where downsizing of a Mix node is allowed even when only one Mix node exists.
* Optimize the failure in deployment caused by the File cache path or storage path being occupied by BE's other paths or duplicate configurations.
* Fix the issue where modifying parameters in a managed cluster is unsuccessful.
* Fix the issue where alert proxies are not effective.
* Fix the incomplete display of error messages during Agent registration.
* Fix the issue where the Agent fails to automatically apply strategy configurations.
* Optimize the message for inaccurate capacity detection during upgrades.
* Fix the issue where the status of a newly created cluster is incorrect (cluster creation fails, but task status shows "In Progress").
* Fix the issue where dirty data in the data table causes task anomalies.
* Upgrade Spring Web version to 5.3.33.
* Fix the problem with external table cache data optimization during cluster creation on the frontend.
* Implement various frontend optimizations (such as adding port validation and restrictions, cluster alignment, etc.).

### VeloDB Manager 24.0.3

July 17, 2024

Bug Fixes

* Support Doris Core 3.0.x (compute-storage coupled mode) deployment.
* Add version relationship restrictions between Manager and core versions.
* Fix the issue with creating Query Statistics alarm strategies.
* Fix the issue of incorrect BE storage path recognition during upgrade directory checks.
* Fix the issue of agent auto-upgrade failures.
* Optimize invalid status prompts for clusters and nodes.
* Fix the issue with incomplete display of upgrade check error messages.

### VeloDB Manager 24.0.2

June 14, 2024

Bug Fixes

* Fix the issue of incorrect process information retrieval when the manager is hosting.
* Resolve the issue of incomplete log viewing due to inconsistent Doris log directories.
* Rectify the issue where the status of the restarting node remains as "Restarting".
* Fix the incorrect FE/BE Not Alive alert expression.
* Address the incorrect value displayed for IO Util in the host interface.
* Resolve the issue of the manager initialization page repeatedly re-entering.
* Correct the text related to checking if transparent hugepages are disabled.
* Optimize the cluster upgrade logic by adjusting the pre-check to before initiating the upgrade operation.
* Support filtering label fields for BE nodes.
* Improve the error prompts for machine parameter checks, add agent restart prompts, and remove ssh information prompts.

### VeloDB Manager 24.0.1

May 6, 2024

Bug Fixes

* Fix the issue where BE shrinkage gets stuck.
* Fix the problem of garbled content in internal messages.
* Optimize error prompts for machine parameter checks, add agent restart prompts, and remove SSH information prompts.
* Add a percentage configuration for connections in the alarm strategy.
* Fix the issue where a single set of manager services supports deploying multiple agents on a single machine.
* Fix the problem where after stopping the FE node, the logs show a normal shutdown but the page still shows it as being in a stopped state.
* Fix the inconsistency issue between the BE node PID and the BE.pid record after upgrading the cluster.

### VeloDB Manager 24.0.0

April 1, 2024

New Features

* Upgrade control to Agent mode, enabling direct HTTP communication between Agent and Server for enhanced security.
* Add support for task auditing, providing detailed information such as operation time, operator, and content for each task.
* Deployment and scaling support additional computing nodes dedicated to data computation only, separate from data storage.
* Support regular inspections, with the ability to configure inspection cycles as needed and send notifications accordingly.
* Enhance monitoring module with machine metrics monitoring at the host level.
* Include pre-configured alarm templates based on best practices for quick and flexible setup of alarm rules.

## VeloDB Manager 23.11.x

### VeloDB Manager 23.11.13

Improvements

- 23.11.x is compatible with 3.0 Doris capacity expansion and contraction ADD node status check

Bug Fixes

- Fix the monitoring filter instance not taking effect & the default number of panels failed to obtain the problem
- Fix the restart check metadata_failure_recovery prompt error
- Fix the restart monitoring component after the Manager upgrade task failed and no log display

### VeloDB Manager 23.11.12

November 15, 2024

Improvements

- Optimize the manager to clean up the residual directories and files after the upgrade.

Bug Fixes

- Fix the issue of no data on the Manager monitoring page
- Fix the issue of crontab tasks lacking control components in 23.11.11 deployment Manager
- Fix the grafana page nesting problem
- Fix the issue of inconsistency between the webui crontab path and the actual deployment path in 23.11.11
- Fix the issue of incorrect agentPackage and md5 information caused by the config-tool-configs cache problem
- Fix the issue of adding crontab to webui when taking over the cluster
- Fix the interface concurrency problem of viewing the deployment manager task in 23.11.12
- Fix the issue of not displaying the node list of BE

### VeloDB Manager 23.11.11

October 21, 2024

Bug Fixes

* Fix the issue where setting the FE load balancing proxy address is ineffective, and causes abnormal issues such as inspections and rolling restarts after setting the proxy address.
* Fix the issue where the browser memory gets filled up due to excessive printing of backup data logs generated during BE upgrades.
* Fix the issue where inspection data results are normal, but the expected and actual values do not match.
* Fix the issue where node status display is inaccurate due to firewall settings.

### VeloDB Manager 23.11.10

September 27, 2024

Bug Fixes

* Fix the issue where downsizing a single FE removes the crontab for all FEs.
* Fix the problem where some prompt messages are incomplete or displayed at the wrong level.
* Fix the issue where crontab is not automatically added after a node startup failure.
* Fix the criteria for determining invalid node status (switching from API access to querying via show frontends/backends).
* Fix the issue where the alert proxy is not effective.

### VeloDB Manager 23.11.9

July 17, 2024

Bug Fixes

* Support Doris Core 3.0.x (compute-storage coupled mode) deployment.
* Add version relationship restrictions between Manager and core versions.
* Fix the issue with creating Query Statistics alarm strategies.
* Support stopping nodes when the Manager cluster is abnormal.
* Optimize invalid status prompts for clusters and nodes.
* Fix the issue with incomplete display of upgrade check error messages.

### VeloDB Manager 23.11.8

June 7, 2024

Bug Fixes

* Fixe the problem of getting wrong process information when manager is hosting
* Fixe the problem that the status of the restarted node is always restarting
* Fixe the problem that the IO Util in the host interface displays wrong values
* Fixe the problem of repeatedly entering the manager initialization page
* Fixe the text problem of checking whether the transparent large page is closed
* Optimize the cluster upgrade logic and adjusted the pre-check to before the upgrade is initiated
* BE node label field supports filtering
* Remove avx check when deploying FE

### VeloDB Manager 23.11.7

May 6, 2024

Bug Fixes

* Add label-based filtering to support Jobs alert policies
* Fix the issue of garbled text in site messages on the manager page
* Fix the problem where the automatic startup script for the Doris cluster was not working
* Add a new configuration for fe connections percentage in alert policies
* Fix the issue of slow response when querying the doris_be_cpu chart in Grafana

### VeloDB Manager 23.11.6

April 1, 2024

Bug Fixes

* Fix the problem of failed alert email notifications
* Fix the vulnerability scanning problem with PostgreSQL
* Fix the issue of incorrect display of some metric units and alert conditions
* Fix the issue of not displaying error information for managed clusters
* Resolve the error occurring during the execution of the manager startup script
* Add the configuration for FE load balancing proxy addresses

### VeloDB Manager 23.11.5

March 18, 2024

Bug Fixes

* Upgrade Gragana to address security vulnerabilities identified in older versions during vulnerability scans
* Optimize detection logic for obtaining package types during expansion
* Update cluster node upgrade checks to include machine time synchronization
* Enhance display information for inspections
* Optimize logic for data directory utilization during expansion

### VeloDB Manager 23.11.4

February 23, 2024

Bug Fixes

* Fix the problem of view check judgment when shrinking or upgrading
* Fix the problem that the FE node Master role is not displayed during expansion and contraction
* Fix the problem that the number of BE nodes is greater than 3 before the node is reduced, and the number of BE nodes is less than 3 after the node is reduced. The problem cannot be reduced.
* Optimize Grafana weak password problem
* Replace the jdk of the Manager installation package with open jdk
* WebUI and Manager optimize standard output file size

### VeloDB Manager 23.11.1

December 22, 2023

Bug Fixes

* Fix the problem of node role Master information display
* Fix the problem of abnormal notification and alarm sending in the site
* Fix the configuration problem when the database uses MySQL8
* Fix issue with version number selection for managed arm and noavx clusters
* Fix the alarm module mailbox information separator bug
* Create expansion to remove the strong dependence on the audit loader folder
* Optimize deployment, expansion and contraction, and upgrade check logic
* Optimize the repair suggestions for some inspection items

### VeloDB Manager 23.11.0

December 8, 2023

New Features

* Initialization allows specifying case sensitivity when creating a cluster.
* Upgrade supports choosing whether to perform backups.
* The velodb-doris cluster supports a separate deployment of WebUI.
* Service modules support status viewing, restart, and stop functionalities.
* Node additions include common Frontend (FE) and Backend (BE) port information, version details, and startup time.

## VeloDB Manager 23.10.x

### VeloDB Manager 23.10.5

December 1, 2023

Bug Fixes

* Optimize the logic for retrying node startup to prevent timeout retries from affecting process startup.
* Optimize the logic for scaling down Back-End (BE) nodes, supporting manual DROP of nodes when tablet count is non-zero.
* When entering node SSH information, if there is back-and-forth switching and SSH password is ultimately chosen, the frontend may transmit obsolete SSH key information into the SSH password information. Backend storage of this information can lead to control operation failures.
* Optimize the logic for decompressing during the version compatibility check phase in cluster upgrade.
* Fix Bug where modifying Doris paths does not take effect in the control (ctrl) system.
* When accessing the monitoring page, support entering domain information for Grafana in the service configuration.

### VeloDB Manager 23.10.1

November 13, 2023

Bug Fixes

* Fix Bug where the control service does not release the connection after remote SSH command execution.
* Fix Bug where the service configuration update does not reload existing cluster information after monitoring deployment.
* Fix Bug in the log service where reading remote files does not clean up unused resources on schedule.

### VeloDB Manager 23.10.0

November 10, 2023

New Features

* Log Viewing: Supports viewing and querying logs from Front-End (FE) and Back-End (BE) nodes, facilitating offline troubleshooting of cluster issues.
* Node List: Added display of WebUI nodes and support for starting and stopping nodes.
* Cluster Restart: Cluster restart supports both full restart and rolling restart modes.
* Resource Groups: Supports labeling BE nodes, automatically grouping nodes with the same label into a resource group.

## VeloDB Manager 23.9.x

### VeloDB Manager 23.9.3

November 3, 2023

Bug Fixes

* Error Occurs when Modifying Configuration with "file_cache_path" Inclusion
* Fix the Issue of Mutual Logouts between WebUI and Manager when logged in on the same machine.

### VeloDB Manager 23.9.2

October 27, 2023

Bug Fixes

* Check Deployment Directory Space Bug
* Modify Configuration File; Backend throws an error if a new key that does not exist in the old configuration file is added.
* Fix Bug where some components of the web server are not upgraded during the upgrade process.

### VeloDB Manager 23.9.0

October 13, 2023

New Features

Manager：

* Service Configuration: Automatically deploy dependent service components through web services. Additionally, it supports modification of service configuration content and self-upgrade of the manager.
* User System: Allows the creation of new users and roles, with the ability to configure corresponding roles for users.
* Deployment/Scaling with Node Personalized Configuration: New deployments and cluster scaling support customization of parameters such as ports and deployment directories, along with automatic control mode configuration.
* Parameter Configuration: Supports custom editing of node configuration files, and individual nodes allow viewing all running parameters.
* Node List: Supports the startup and shutdown of Front-End (FE) nodes, with the display of Master node roles.

WebUI：

* Data Exploration: Data exploration functionality for log query.
* Auto Save: Supports automatic saving of session windows. Saved session windows allow the creation of new folders for organizing sessions.

## VeloDB Manager 23.7.x

### VeloDB Manager 23.7.8

October 07, 2023

* Manager supports upgrading Doris to version 2.0.2 and higher.

### VeloDB Manager 23.7.6

September 22, 2023

Bug Fixes

* Manager is incompatible with the encoding of CPU/Memory/Network information, preventing successful cluster creation due to database storage issues.
* WebUI queries for datetime types now display precision up to milliseconds.

### VeloDB Manager 23.7.3

September 01, 2023

Bug Fixes

* Support for restarting inactive nodes.
* Optimize stop operations to enhance idempotence.
* Resolve issues related to systemd leftovers when creating and then taking over through the manager.
* Cancel the management of brokers when taking over the cluster.
* Compatibility with script execution on Ubuntu systems.

### VeloDB Manager 23.7.0

August 10, 2023

New Features

* Deploy Cluster : Deploy Apache Doris clusters on physical machines or virtual machines through Manager.
* Take Over Cluster : Take over existing Apache Doris clusters into Manager for operation and monitoring.
* Cluster Details : View the operational status, details, and connection information of the cluster.
* Cluster Scaling : Scale up or down FE and BE nodes within the cluster.
* Cluster Upgrade : Conveniently upgrade the cluster version, providing options for full-service stop upgrades and online rolling upgrades. Choose the upgrade method that suits your business scenario.
* Cluster Restart : Restart the entire cluster, FE, BE, or specific nodes.
* Node Details : View real-time status and machine information of nodes.
* Monitoring Alerts : Check predefined monitoring metrics, set up alerts for monitoring metrics, and receive alerts via email, chat software, Webhooks, etc.
* Parameter Configuration : Display and configure critical parameters, allowing modifications on a single or batch basis.
* Cluster Inspection : Perform a one-click check on machine conditions and cluster operational status, promptly discover and locate performance bottlenecks, and provide repair suggestions.
* WebUI : Access the entrance to the cluster's WebUI.
