// 手动批量更新
import { docsMapVerion2_1, docsMapVersion4_x, docsMapVersion5_x_preview,docsMapVersion3_x } from '../../shared/doc-map.js';
import { syncDocs } from "./doc_sync.mjs";

export const sidebarPathMap = {
    cloud_v4: 'cloud_versioned_sidebars/version-4.x-sidebars.json',
    cloud_v5_preview: 'cloud_versioned_sidebars/version-5.x-preview-sidebars.json',
    enterprise_v3: 'enterprise_versioned_sidebars/version-3.x-sidebars.json',
    enterprise_v2: 'enterprise_versioned_sidebars/version-2.1-sidebars.json'
}

// 手动同步文档消除注释
// syncDocs(docsMapVersion5_x_preview, sidebarPathMap.cloud_v5_preview )