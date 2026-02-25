const fs = require('fs');
const path = require('path');

/**
 * 将对象写入 JSON 文件
 * @param {Object} obj - 要写入的对象
 * @param {string} filePath - 输出 JSON 文件的完整路径
 */
function writeJsonToFile(obj, filePath) {
  try {
    const jsonString = JSON.stringify(obj, null, 2); // 格式化 JSON

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    console.log(`JSON 已写入：${filePath}`);
  } catch (err) {
    console.error('写入 JSON 时出错：', err);
  }
}

// 示例使用
const inputObject = {
  enterprise: [
    {
      type: "category",
      collapsed: false,
      label: "Getting Started",
      items: [
        {
          type: "doc",
          id: "enterprise/getting-started/velodb-enterprise-overview",
          label: "Introduction",
        },
        {
          type: "category",
          label: "Use Cases",
          items: [
            {
              type: "category",
              label: "Observability",
              items: [
                {
                  type: "doc",
                  id: "cloud/getting-started/use-cases/observability/overview",
                  label: "Overview",
                },
                {
                  type: "doc",
                  id: "cloud/getting-started/use-cases/observability/log",
                  label: "Log",
                },
                {
                  type: "doc",
                  id: "cloud/getting-started/use-cases/observability/trace",
                  label: "Trace",
                },
                {
                  type: "category",
                  label: "Integrations",
                  items: [
                    {
                      type: "doc",
                      id: "cloud/getting-started/use-cases/observability/integrations/logstash",
                      label: "Logstash",
                    },
                    {
                      type: "doc",
                      id: "cloud/getting-started/use-cases/observability/integrations/beats",
                      label: "Filebeat",
                    },
                    {
                      type: "doc",
                      id: "cloud/getting-started/use-cases/observability/integrations/opentelemetry",
                      label: "OpenTelemetry",
                    },
                    {
                      type: "doc",
                      id: "cloud/getting-started/use-cases/observability/integrations/fluentbit",
                      label: "FluentBit",
                    },
                  ],
                },
              ],
            },
          ],
        },
        
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Enterprise Manager",
      items: [
        {
          type: "doc",
          id: "enterprise/doris-manager-guide/what-is-doris-manager",
          label: "Introduction to Manager",
        },
        {
          type: "category",
          label: "Doris Manager Management",
          items: [
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/doris-manager-management/deploy-doris-manager",
              label: "Deploying Manager",
            },
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/doris-manager-management/upgrade-doris-manager",
              label: "Upgrading Manager",
            },
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/doris-manager-management/uninstall-doris-manager",
              label: "Uninstall Manager",
            },
          ],
        },
        {
          type: "category",
          label: "VeloDB Cluster Management",
          items: [
            {
              type: "category",
              label: "Deploy Cluster",
              items: [
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-integrated-storage-compute-cluster",
                  label: "Deploying an Integrated Storage-Compute Cluster",
                },
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/deploy-cluster/deploy-separating-storage-compute-cluster",
                  label: "Deploy Compute-Storage Separated Cluster",
                },
              ],
            },
            {
              type: "category",
              label: "Takeover Cluster",
              items: [
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/takeover-cluster/takeover-integrated-storage-compute-cluster",
                  label: "Take Over Compute-Storage Integrated Cluster",
                },
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/takeover-cluster/takeover-separating-storage-compute-cluster",
                  label: "Take Over Compute-Storage Separated Cluster",
                },
              ],
            },
            {
              type: "category",
              label: "Upgrade Cluster",
              items: [
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-integrated-storage-compute-cluster",
                  label: "Upgrade Compute-Storage Integrated Cluster",
                },
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/upgrade-cluster/upgrade-separating-storage-compute-cluster",
                  label: "Upgrade Compute-Storage Separated Cluster",
                },
              ],
            },
            {
              type: "category",
              label: "Scale Cluster",
              items: [
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-integrated-storage-compute-cluster",
                  label: "Scale Out/In Compute-Storage Integrated Cluster",
                },
                {
                  type: "doc",
                  id: "enterprise/doris-manager-guide/doris-cluster-management/scale-cluster/scale-separating-storage-compute-cluster",
                  label: "Scale Out/In Compute-Storage Separated Cluster",
                },
              ],
            },
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/doris-cluster-management/config-cluster",
              label: "Manage Cluster Monitoring",
            },
          ],
        },
        {
          type: "category",
          label: "VeloDB Monitor and Alerting",
          items: [
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/monitor-and-alerting/doris-monitor",
              label: "Doris Cluster Monitoring",
            },
            {
              type: "doc",
              id: "enterprise/doris-manager-guide/monitor-and-alerting/doris-alerting",
              label: "Doris Cluster Alerts",
            },
          ],
        },
        {
          type: "doc",
          id: "enterprise/doris-manager-guide/doris-inspection",
          label: "Cluster Inspection",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Enterprise Core",
      items: [
        {
          type: "doc",
          id: "enterprise/enterprise-core-guide/velodb-distribution-doris-core-deployment-guide",
          label: "VeloDB Enterprise Core Installation Manual",
        },
        {
          type: "doc",
          id: "enterprise/enterprise-core-guide/velodb-webui-guide",
          label: "WebUI Guide",
        },
        {
          type: "doc",
          id: "enterprise/enterprise-core-guide/velodb-apache-guide",
          label: "Apache Doris Documentation",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "Release Notes",
      items: [
        {
          type: "doc",
          id: "enterprise/release-notes/enterprisecore",
          label: "Enterprise Core",
        },
        {
          type: "doc",
          id: "enterprise/release-notes/enterprisemanager",
          label: "VeloDB Manager",
        },
      ],
    },
  ]
};

const outputPath = './enterprise-new.json';

writeJsonToFile(inputObject, outputPath);
