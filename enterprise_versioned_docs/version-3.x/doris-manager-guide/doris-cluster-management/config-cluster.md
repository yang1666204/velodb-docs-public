
If FE and BE nodes fail to start successfully, you can check the corresponding Doris cluster logs or output logs for further troubleshooting.

## Manage Cluster Monitoring

Click **Service Configuration** in the bottom left corner to enable or disable monitoring and alerting services.

![cluster-monitor](./assets/config-cluster/cluster-monitor.png)

```sql
[root@r61 manager-agent]# tail -f log/supervise.log | grep 'start to supervise be node'
time="2025-04-10T05:01:17.546-04:00" level=debug msg="start to supervise be node [:9050]"
time="2025-04-10T05:01:32.546-04:00" level=debug msg="start to supervise be node [:9050]"
time="2025-04-10T05:01:47.546-04:00" level=debug msg="start to supervise be node [:9050]"
```

If FE and BE nodes fail to start successfully, you can check the corresponding Doris cluster logs or output logs for further troubleshooting.

## Manage Cluster Monitoring

Click **Service Configuration** in the bottom left corner to enable or disable monitoring and alerting services.

![cluster-monitor](./assets/config-cluster/cluster-monitor.png)
