#!/usr/bin/env node

/**
 * 自动根据 git 工作区新增 / 删除 md/mdx 文件
 * 更新对应 docusaurus sidebar 配置
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHANGED_MAP_SIDEBAR_PATH = {
  "cloud_versioned_docs/version-4.x":
    "cloud_versioned_sidebars/version-4.x-sidebars.json",
  "cloud_versioned_docs/version-5.x-preview":
    "cloud_versioned_sidebars/version-5.x-preview-sidebars.json",
  "enterprise_versioned_docs/version-2.1":
    "enterprise_versioned_sidebars/version-2.1-sidebars.json",
  "enterprise_versioned_docs/version-3.x":
    "enterprise_versioned_sidebars/version-3.x-sidebars.json",
};

const MD_EXT = /\.(md|mdx)$/;

/* -------------------- git 变更获取 -------------------- */

function getGitChanges() {
  const changes = [];
  const seenFiles = new Set(); // 用于去重

  // 1. untracked 新增文件
  const untracked = execSync("git ls-files --others --exclude-standard", {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter((f) => f && /\.(md|mdx)$/.test(f));

  for (const file of untracked) {
    if (!seenFiles.has(file)) {
      changes.push({ status: "A", file });
      seenFiles.add(file);
    }
  }

  // 2. 相对于 HEAD 的所有变更（包括工作区和暂存区）
  // 这会检测到所有相对于 HEAD 的添加和删除
  const diff = execSync("git diff --name-status --diff-filter=AD HEAD", {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const line of diff) {
    const [status, file] = line.split(/\s+/);
    if (/\.(md|mdx)$/.test(file) && !seenFiles.has(file)) {
      changes.push({ status, file });
      seenFiles.add(file);
    }
  }

  console.log('changes', changes);
  
  return changes;
}

/* -------------------- 工具函数 -------------------- */

function matchDocRoot(filePath) {
  return Object.keys(CHANGED_MAP_SIDEBAR_PATH).find((root) =>
    filePath.startsWith(root + "/")
  );
}

function toDocId(root, filePath) {
  return filePath.replace(root + "/", "").replace(MD_EXT, "");
}

function loadSidebar(sidebarPath) {
  return JSON.parse(fs.readFileSync(sidebarPath, "utf-8"));
}

function saveSidebar(sidebarPath, data) {
  fs.writeFileSync(sidebarPath, JSON.stringify(data, null, 2) + "\n");
}

/* -------------------- sidebar 修改逻辑 -------------------- */

function removeDocFromItems(items, docId) {
  return items
    .filter((item) => {
      // 处理字符串格式的 doc id
      if (typeof item === "string") {
        return item !== docId;
      }
      // 处理对象格式的 doc id
      if (item.type === "doc" && item.id === docId) {
        return false;
      }
      return true;
    })
    .map((item) => {
      // 递归处理 category 中的 items
      if (item && typeof item === "object" && item.type === "category" && item.items) {
        item.items = removeDocFromItems(item.items, docId);
      }
      return item;
    });
}

function addDocToSidebar(sidebar, sidebarKey, docId) {
  const docParts = docId.split("/");
  const parentPath = docParts.slice(0, -1).join("/"); // security/auth

  const rootItems = sidebar[sidebarKey];

  // 检查 docId 是否已存在的辅助函数
  function docExists(items) {
    return items.some((i) => {
      // 检查字符串格式的 doc id
      if (typeof i === "string") {
        return i === docId;
      }
      // 检查对象格式的 doc id
      if (i && typeof i === "object" && i.type === "doc" && i.id === docId) {
        return true;
      }
      return false;
    });
  }

  function dfs(items) {
    for (const item of items) {
      if (item.type === "category" && Array.isArray(item.items)) {
        // 收集当前 category 下，属于同一 parentPath 的 docs
        const sameLevelDocs = item.items.filter(
          (i) =>
            (i.type === "doc" &&
              typeof i.id === "string" &&
              i.id.startsWith(parentPath + "/") &&
              i.id.split("/").length === docParts.length) ||
            (typeof i === "string" &&
              i.startsWith(parentPath + "/") &&
              i.split("/").length === docParts.length)
        );

        if (sameLevelDocs.length > 0) {
          // 检查当前 category 的 items 中是否已存在该 docId
          if (docExists(item.items)) {
            console.log(`[sidebar] Doc "${docId}" already exists in category, skipped insertion`);
            return true; // 返回 true 表示已处理（已存在，无需重复添加）
          }

          // 插入位置：同级 doc 之后，category 之前
          const insertIndex = item.items.findIndex(
            (i) => i.type === "category"
          );

          // const newItem = {
          //   type: "doc",
          //   id: docId,
          // };

          if (insertIndex === -1) {
            item.items.push(docId);
          } else {
            item.items.splice(insertIndex, 0, docId);
          }

          return true;
        }

        // 继续向下递归
        if (dfs(item.items)) {
          return true;
        }
      }
    }
    return false;
  }

  const inserted = dfs(rootItems);

  if (!inserted) {
    console.warn(
      `[sidebar] No suitable category found for "${docId}", skipped insertion`
    );
  }
}

/* -------------------- 主流程 -------------------- */

function main() {
  const changes = getGitChanges();
  if (!changes.length) {
    console.log("No md/mdx changes detected.");
    return;
  }

  const grouped = {};

  for (const { status, file } of changes) {
    const root = matchDocRoot(file);
    if (!root) continue;

    const sidebarPath = CHANGED_MAP_SIDEBAR_PATH[root];
    if (!grouped[sidebarPath]) grouped[sidebarPath] = [];

    grouped[sidebarPath].push({
      status,
      root,
      file,
      docId: toDocId(root, file),
    });
  }

  for (const [sidebarPath, items] of Object.entries(grouped)) {
    if (!fs.existsSync(sidebarPath)) continue;

    const sidebar = loadSidebar(sidebarPath);
    const sidebarKey = Object.keys(sidebar)[0];

    for (const { status, docId } of items) {
      if (status === "D") {
        sidebar[sidebarKey] = removeDocFromItems(sidebar[sidebarKey], docId);
        console.log(`Removed doc: ${docId}`);
      }

      if (status === "A") {
        addDocToSidebar(sidebar, sidebarKey, docId);
        console.log(`Added doc: ${docId}`);
      }
    }

    saveSidebar(sidebarPath, sidebar);
  }
}

main();
