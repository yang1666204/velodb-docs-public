/**
 * doris 文档到 selectdb-docs 文档的映射关系
 * 
 * source: 源文档路径，相对于仓库根目录
 * target: 目标文档路径，相对于 selectdb-docs 仓库根目录
 * exclude: 排除的文件或目录列表，相对于 source 路径
 * 
 * 
 */


// version 2.1

/**
 * todo:
 * 如何处理新增的目录的label
 * 
 * 新增的最外层的目录可以通过 map 中的 label 字段指定
 * 但是如果新增的目录中还有子目录，需要通过 doris 的 i18n 文件和 doris的sidebars.json 来生成一个树状的 map
 * 比如： admin-manual 的 label 是 管理指南，生成 Management 
 *                                         /             \   
 *                                 Managing Cluster      Managing Workload   
 *  通过 i8n 文件可以拿到 Managing Cluster 对应的翻译为 "集群管理";  Managing Workload  对应的翻译为 "负载管理"
 * 
 */
const docsMapVerion2_1 = [
    {
        source: 'versioned_docs/version-2.1/admin-manual',
        target: 'enterprise_versioned_docs/version-2.1/admin-manual',
        label: 'Management',
        exclude: ['versioned_docs/version-2.1/admin-manual/auth', 'versioned_docs/version-2.1/admin-manual/audit-plugin.md', 'versioned_docs/version-2.1/admin-manual/security-overview.md', 'versioned_docs/version-2.1/admin-manual/config', 'versioned_docs/version-2.1/admin-manual/data-admin', 'versioned_docs/version-2.1/admin-manual/cluster-management', 'versioned_docs/version-2.1/admin-manual/log-management', 'versioned_docs/version-2.1/admin-manual/maint-monitor', 'versioned_docs/version-2.1/admin-manual/open-api', 'versioned_docs/version-2.1/admin-manual/workload-management']
    },
    {
        source: 'versioned_docs/version-2.1/data-operate',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/data-operate',
        label: 'Loading Data',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/db-connect',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/db-connect',
        label: 'Database Connection',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/ecosystem',
        target: 'enterprise_versioned_docs/version-2.1/ecosystem',
        label: 'Integrations',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/faq',
        target: 'enterprise_versioned_docs/version-2.1/faq',
        label: 'FAQ',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/lakehouse',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/lakehouse',
        label: 'Data Lakehouse',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/observability',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/observability',
        label: 'Observability',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/query-acceleration',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/query-acceleration',
        label: 'Queries Acceleration',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/query-data',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/query-data',
        label: 'Data Queries',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/sql-manual',
        target: 'enterprise_versioned_docs/version-2.1/sql-manual',
        label: 'Reference',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/table-design',
        target: 'enterprise_versioned_docs/version-2.1/use-guide/table-design',
        label: 'Data Table Design',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/authentication',
        target: 'enterprise_versioned_docs/version-2.1/security/authentication-and-authorization/authentication',
        label: 'Authentication',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/authorization',
        target: 'enterprise_versioned_docs/version-2.1/security/authentication-and-authorization/authorization',
        label: 'Authorization',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/audit-plugin.md',
        target: 'enterprise_versioned_docs/version-2.1/security/audit-plugin.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/security-overview.md.md',
        target: 'enterprise_versioned_docs/version-2.1/security/security-overview.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/certificate.md',
        target: 'enterprise_versioned_docs/version-2.1/security/encryption/certificate.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/encryption-function.md',
        target: 'enterprise_versioned_docs/version-2.1/security/encryption/encryption-function.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/fe-certificate.md',
        target: 'enterprise_versioned_docs/version-2.1/security/encryption/fe-certificate.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/ldap.md',
        target: 'enterprise_versioned_docs/version-2.1/security/encryption/ldap.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/auth/ranger.md',
        target: 'enterprise_versioned_docs/version-2.1/security/encryption/ranger.md',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/config',
        target: 'enterprise_versioned_docs/version-2.1/management-guide/config',
        label: 'Managing Configuration',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/data-admin',
        target: 'enterprise_versioned_docs/version-2.1/management-guide/data-admin',
        label: 'Managing Disaster Recovery',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/log-management',
        target: 'enterprise_versioned_docs/version-2.1/management-guide/log-management',
        label: 'Log Management',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/open-api',
        target: 'enterprise_versioned_docs/version-2.1/management-guide/open-api',
        label: 'OPEN API',
        exclude: []
    },
    {
        source: 'versioned_docs/version-2.1/admin-manual/workload-management',
        target: 'enterprise_versioned_docs/version-2.1/management-guide/workload-management',
        label: 'Managing Workload',
        exclude: []
    },
]

const docsMapVersion3_x = [
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual',
    //     target: 'enterprise/admin-manual',
    //     label: 'Management',
    //     exclude: ['versioned_docs/version-3.1/admin-manual/auth', 'versioned_docs/version-3.1/admin-manual/audit-plugin.md', 'versioned_docs/version-3.1/admin-manual/security-overview.md', 'versioned_docs/version-3.1/admin-manual/config', 'versioned_docs/version-3.1/admin-manual/data-admin', 'versioned_docs/version-3.1/admin-manual/cluster-management', 'versioned_docs/version-3.1/admin-manual/log-management', 'versioned_docs/version-3.1/admin-manual/maint-monitor', 'versioned_docs/version-3.1/admin-manual/open-api', 'versioned_docs/version-3.1/admin-manual/workload-management']
    // },
    // {
    //     source: 'versioned_docs/version-3.x/data-operate',
    //     target: 'enterprise/use-guide/data-operate',
    //     label: 'Loading Data',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/db-connect',
    //     target: 'enterprise/use-guide/db-connect',
    //     label: 'Database Connection',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/ecosystem',
    //     target: 'enterprise/integration',
    //     label: 'Integrations',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/faq',
    //     target: 'enterprise/faq',
    //     label: 'FAQ',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/lakehouse',
    //     target: 'enterprise/use-guide/lakehouse',
    //     label: 'Data Lakehouse',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/observability',
    //     target: 'enterprise/use-guide/observability',
    //     label: 'Observability',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/query-acceleration',
    //     target: 'enterprise/use-guide/query-optimization',
    //     label: 'Queries Acceleration',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/query-data',
    //     target: 'enterprise/use-guide/query-data',
    //     label: 'Data Queries',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/sql-manual',
    //     target: 'enterprise/sql-manual',
    //     label: 'Reference',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/table-design',
    //     target: 'enterprise/use-guide/table-design',
    //     label: 'Data Table Design',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/authentication',
    //     target: 'enterprise/security/authentication-and-authorization/authentication',
    //     label: 'Authentication',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/authorization',
    //     target: 'enterprise/security/authentication-and-authorization/authorization',
    //     label: 'Authorization',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/audit-plugin.md',
    //     target: 'enterprise/security/audit-plugin.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/certificate.md',
    //     target: 'enterprise/security/encryption/certificate.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/security-overview.md.md',
    //     target: 'enterprise/security/security-overview.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/encryption-function.md',
    //     target: 'enterprise/security/encryption/encryption-function.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/fe-certificate.md',
    //     target: 'enterprise/security/encryption/fe-certificate.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/ldap.md',
    //     target: 'enterprise/security/encryption/ldap.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/auth/ranger.md',
    //     target: 'enterprise/security/encryption/ranger.md',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/config',
    //     target: 'enterprise/management-guide/config',
    //     label: 'Managing Configuration',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/data-admin',
    //     target: 'enterprise/management-guide/data-admin',
    //     label: 'Managing Disaster Recovery',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/log-management',
    //     target: 'enterprise/management-guide/log-management',
    //     label: 'Log Management',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/open-api',
    //     target: 'enterprise/management-guide/open-api',
    //     label: 'OPEN API',
    //     exclude: []
    // },
    // {
    //     source: 'versioned_docs/version-3.x/admin-manual/workload-management',
    //     target: 'enterprise/management-guide/workload-management',
    //     label: 'Managing Workload',
    //     exclude: []
    // },
]


const docsMapVersion5_x_preview = [
    {
        source: 'versioned_docs/version-4.x/sql-manual',
        target: 'cloud_versioned_docs/version-5.x-preview/sql-manual',
        label: 'Reference',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/db-connect',
        target: 'cloud_versioned_docs/version-5.x-preview/db-connect',
        label: 'Database Connection',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/table-design',
        target: 'cloud_versioned_docs/version-5.x-preview/table-design',
        label: 'Data Table Design',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/data-operate',
        target: 'cloud_versioned_docs/version-5.x-preview/data-operate',
        label: 'Loading Data',
        exclude: ['versioned_docs/version-4.x/data-operate/import/cdc-load-manual-sample.md']
    },
    {
        source: 'versioned_docs/version-4.x/query-data',
        target: 'cloud_versioned_docs/version-5.x-preview/query-data',
        label: 'Data Queries',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/query-acceleration',
        target: 'cloud_versioned_docs/version-5.x-preview/query-acceleration',
        label: 'Queries Acceleration',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/lakehouse',
        target: 'cloud_versioned_docs/version-5.x-preview/lakehouse',
        label: 'Data Lakehouse',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/ai',
        target: 'cloud_versioned_docs/version-5.x-preview/ai',
        label: 'AI Functions',
        exclude: []
    },
    {
        source: 'versioned_docs/version-4.x/observability',
        target: 'cloud_versioned_docs/version-5.x-preview/observability',
        label: 'Observability',
        exclude: []
    },
]

const docsMapVersion4_x = [
    {
        source: 'versioned_docs/version-3.x/sql-manual',
        target: 'cloud_versioned_docs/version-4.x/sql-manual',
        label: 'Reference',
        exclude: []
    },
    {
        source: 'versioned_docs/version-3.x/db-connect',
        target: 'cloud_versioned_docs/version-4.x/user-guide/db-connect',
        label: 'Database Connection',
        exclude: []
    },
    {
        source: 'versioned_docs/version-3.x/table-design',
        target: 'cloud_versioned_docs/version-4.x/user-guide/table-design',
        label: 'Data Table Design',
        exclude: []
    },
    {
        source: 'versioned_docs/version-3.x/data-operate',
        target: 'cloud_versioned_docs/version-4.x/user-guide/data-operate',
        label: 'Loading Data',
        exclude: ['versioned_docs/version-3.x/data-operate/import/cdc-load-manual-sample.md']
    },
    {
        source: 'versioned_docs/version-3.x/query-data',
        target: 'cloud_versioned_docs/version-4.x/user-guide/query-data',
        label: 'Data Queries',
        exclude: []
    },
    {
        source: 'versioned_docs/version-3.x/query-acceleration',
        target: 'cloud_versioned_docs/version-4.x/user-guide/query-acceleration',
        label: 'Queries Acceleration',
        exclude: []
    },
    {
        source: 'versioned_docs/version-3.x/lakehouse',
        target: 'cloud_versioned_docs/version-4.x/user-guide/lakehouse',
        label: 'Data Lakehouse',
        exclude: []
    }
]

/**
 * 直接从 doris 拿这部分 sidebar 配置，覆盖掉当前的 sidebar配置
 * 
 * 用 targetLabel 替换传过来的 sourceLabel
 */
const cloudSidebarLabels = [{
    labelList: [
        { sourceLabel: 'Database Connection', targetLabel: 'Database Connection' },
        { sourceLabel: 'Data Table Design', targetLabel: 'Table Design' },
        { sourceLabel: 'Loading Data', targetLabel: 'Data Ingestion' },
        { sourceLabel: 'Data Update and Delete', targetLabel: 'Data Modification' },
        { sourceLabel: 'Exporting Data', targetLabel: 'Data Export' },
        { sourceLabel: 'Data Queries', targetLabel: 'Query Execution' },
        { sourceLabel: 'Queries Acceleration', targetLabel: 'Query Optimization' },
        { sourceLabel: 'AI', targetLabel: 'AI' },
        { sourceLabel: 'Data Lakehouse', targetLabel: 'Lakehouse Integration' },
        {sourceLabel: 'Reference', targetLabel: 'SQL Reference'}
    ], 
    // 如果没有 topLevel， targetLabel 就是一级目录
    // topLevel: 'User Guide', // 一级目录
    // topLevelId: 'user-guide'
}
// {
//     labelList: [{ sourceLabel: 'Observability', targetLabel: 'Observability' }],
//     topLevel: 'Use Cases', // 一级目录
//     topLevelId: 'use-cases'
// }
]

module.exports = {
    docsMapVerion2_1,
    docsMapVersion3_x,
    docsMapVersion4_x,
    docsMapVersion5_x_preview,
    cloudSidebarLabels
};