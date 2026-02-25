#!/usr/bin/env node
import {
  docsMapVerion2_1,
  docsMapVersion3_x,
  docsMapVersion5_x_preview,
  docsMapVersion4_x,
} from "../../shared/doc-map.js";
import { syncDocs } from "./doc_sync.mjs";
import { sidebarPathMap } from "./doc_sync_main.mjs";
/**
 * 版本映射关系
 *
 * enterprise:
 * doris 2.1 -> velodb enterprise 2.1
 * doris 3.x -> veldob enterprise 3.x
 *
 * cloud:
 * doris 3.x -> velodb cloud 4.x
 * doris 4.x -> velodb cloud 5.x
 *
 * doris dev的更新需要移除
 *
 */

/**
 *
 * @param {String[]} changedFiles
 * @param {{source:String,target:String,label:String,exclude:String[]}[]} docsMap
 */
function getTargetChangedFiles(changedFiles, docsMap) {
  // todo:如果是删除的文件，changedFiles会包含吗
  const targetChangedFiles = changedFiles.map((f) => {
    for (let doc of docsMap) {
      if (f.includes(doc.source)) {
        if (doc.source.includes(".md") || doc.source.includes(".mdx")) {
          // doc.source是文档
          return {
            source: f,
            target: doc.target, // doc.source是文档，doc.target一定是文档
          };
        } else {
          // doc是目录
          const tailPath = f.split(doc.source)?.[1];
          const excludes = doc.exclude || [];
          const isExclude = excludes.some(e => f.includes(e));
          if(isExclude) {
            return undefined;
          }
          if (!tailPath) {
            console.log("file path:", f);
            continue;
          }
          return {
            source: f,
            target: doc.target + tailPath, // 需要保证 doc.target 和 doc.source 都不能以 / 结尾
            exclude: [],
          };
        }
      }
    }
    return undefined;
  });

  return targetChangedFiles.filter((item) => !!item);
}

// 考虑 doris 文档删除的情况
// 考虑 不同文档 不同版本 变更流水线函数应该如何传参数
async function main() {
  const changedFiles = process.env.CHANGED.split("\n")
    .filter(Boolean)
    .filter(
      (f) =>
        f.includes("versioned_docs/version-2.1") ||
        f.includes("versioned_docs/version-3.x") ||
        f.includes("versioned_docs/version-4.x")
    );

  if (changedFiles.length === 0) {
    console.log("No changed .md/.mdx files to sync.");
    return;
  }

  console.log("🚀 Starting doc sync...");
  console.log("changedFiles.length:", changedFiles.length);

  console.log("Changed files:", changedFiles);

  const changedFilesEnterpriseV2 = getTargetChangedFiles(
    changedFiles,
    docsMapVerion2_1
  );
  const changedFilesEnterpriseV3 = getTargetChangedFiles(
    changedFiles,
    docsMapVersion3_x
  );
  const changedFilesCloudV4 = getTargetChangedFiles(
    changedFiles,
    docsMapVersion4_x
  );
  const changedFilesCloudV5 = getTargetChangedFiles(
    changedFiles,
    docsMapVersion5_x_preview
  );
  if (
    changedFilesEnterpriseV2?.length === 0 &&
    changedFilesEnterpriseV3?.length === 0 &&
    changedFilesCloudV4?.length === 0 &&
    changedFilesCloudV5?.length === 0
  ) {
    console.log("nothing to change");
    return;
  }
  if (changedFilesEnterpriseV2?.length) {
    console.log('changedFilesEnterpriseV2',changedFilesEnterpriseV2);
    
    await syncDocs(changedFilesEnterpriseV2, sidebarPathMap.enterprise_v2);
  }
  if (changedFilesEnterpriseV3?.length) {
    console.log('changedFilesEnterpriseV3',changedFilesEnterpriseV3);
    
    await syncDocs(changedFilesEnterpriseV3, sidebarPathMap.enterprise_v3);
  }
  if (changedFilesCloudV4?.length) {
    console.log('changedFilesCloudV4',changedFilesCloudV4);
    
    await syncDocs(changedFilesCloudV4, sidebarPathMap.cloud_v4);
  }
  if (changedFilesCloudV5?.length) {
    console.log('changedFilesCloudV5',changedFilesCloudV5);
    
    await syncDocs(changedFilesCloudV5, sidebarPathMap.cloud_v5_preview);
  }
  console.log("finished");
}

main();
