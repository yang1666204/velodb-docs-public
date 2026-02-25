import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  ecosystem: [
    {
      type: "category",
      collapsed: false,
      label: "Deploy VeloDB/Doris on Kubernetes",
      items: [
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/install-env",
          label: "Cluster Environment Requirements",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/install-config-cluster",
          label: "Configure Doris Cluster",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/install-doris-cluster",
          label: "Deploy Doris Cluster",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/doris-cluster-upgrade",
          label: "Upgrade Apache Doris cluster deployed by Doris-Operator",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/root-user-use",
          label: "Used by Root users",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/expansion-and-contraction",
          label: "Service expansion and contraction",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/debug-crash",
          label: "How to enter the container when the service crashes",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/helm-chart-deploy",
          label: "Deploy Doris on Helm Chart",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/network",
          label: "Access the Doris cluster",
        },
        {
          type: "doc",
          id: "ecosystem/deploy-velodb-on-kubernetes/persistent-volume",
          label: "Persistent Volume and ConfigMap",
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "X2Doris",
      items: [
        {
          type: "doc",
          id: "ecosystem/x2doris/install-and-deploy",
          label: "Installation and Deployment",
        },
        {
          type: "doc",
          id: "ecosystem/x2doris/use-manual",
          label: "Use Manual",
        },
      ],
    },
  ],
  "use-cases": [
    {
      type: "category",
      label: "Observability",
      items: [
        {
          type: "doc",
          id: "use-cases/observability/overview",
          label: "Overview",
        },
        {
          type: "doc",
          id: "use-cases/observability/log",
          label: "Log Storage and Analysis",
        },
      ],
    },
  ],
  legal: [
    {
      type: "doc",
      id: "legal/cookie-policy",
      label: "Cookie Policy",
    },
    {
      type: "doc",
      id: "legal/customer-agreement",
      label: "Customer Agreement",
    },
    {
      type: "category",
      label: "Privacy Policy",
      items: [
        {
          type: "doc",
          id: "legal/privacy-policy/velodb-privacy-policy",
          label: "Privacy Policy",
        },
        {
          type: "category",
          label: "Archive",
          items: [
            {
              type: "doc",
              id: "legal/privacy-policy/archive/20231206",
              label: "Privacy Policy",
            },
            {
              type: "doc",
              id: "legal/privacy-policy/archive/20250410",
              label: "Privacy Policy",
            },
          ],
        },
      ],
    },
    {
      type: "doc",
      id: "legal/service-level-agreement",
      label: "VeloDB Cloud Service Level Agreement (SLA)",
    },
    {
      type: "doc",
      id: "legal/terms-of-service",
      label: "Terms of Service",
    },
  ],
};

export default sidebars;
