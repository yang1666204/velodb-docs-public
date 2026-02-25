#!/usr/bin/env node
/**
 * 
 * node scripts/sortSidebar.js ./sidebars.ts ./docs
 * 
 * 1.输入一个 sidebar 配置文件（TypeScript/JavaScript），
 * 
 * 2.输入一个目录 a。在目录 a 下寻找与 category.label 同名的 _meta.en-US.json 文件。

比如 label = "getting-started" → 找 a/getting-started/_meta.en-US.json

    3.解析 _meta.en-US.json，取出其中的 key 顺序

    4.对 sidebar 中 category.items 按这个 key 顺序重排：

item 如果是字符串 → 取最后一段路径 (cloud/getting-started/overview → overview) 去匹配 JSON key

item 如果是对象（子 category） → 取 label 去匹配 JSON key

    5.按顺序替换原来的 items 数组
 */
// todo 待调用 拿备份sidebar配置掉用
const fs = require("fs");
const path = require("path");

const sidebars = require("../sidebars-backup.js"); // docusaurus 的 sidebar 配置文件
console.log('sidebars',sidebars);

// 递归查找 label/_meta.en-US.json 文件
function findMetaJson(baseDir, label) {
  let result = null;

  function search(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // 如果目录名和 label 相同，检查 _meta.en-US.json
        if (file.name === label) {
          const metaFile = path.join(fullPath, "_meta.en-US.json");
          if (fs.existsSync(metaFile)) {
            result = metaFile;
            return;
          }
        }
        // 递归子目录
        search(fullPath);
        if (result) return;
      }
    }
  }

  search(baseDir);
  return result;
}

// 根据 meta.json 的 key 顺序来排序 items
function reorderItems(items, metaKeys) {
  const itemMap = new Map();

  for (const item of items) {
    if (typeof item === "string") {
      const last = item.split("/").pop();
      itemMap.set(last, item);
    } else if (typeof item === "object" && item.label) {
      itemMap.set(item.label, item);
    }
  }

  const ordered = [];
  for (const key of metaKeys) {
    if (itemMap.has(key)) {
      ordered.push(itemMap.get(key));
    }
  }

  // 把没匹配到的项保留（排在最后）
  for (const item of items) {
    if (!ordered.includes(item)) {
      ordered.push(item);
    }
  }

  return ordered;
}

// 处理 sidebar
function processSidebar(sidebar, baseDir) {
  for (const section of Object.values(sidebar)) {
    for (const entry of section) {
      if (entry.type === "category") {
        const metaPath = findMetaJson(baseDir, entry.label);
        if (metaPath) {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
          const metaKeys = Object.keys(meta);
          entry.items = reorderItems(entry.items, metaKeys);
        }

        // 递归处理子 category
        if (Array.isArray(entry.items)) {
          processSidebar({ tmp: entry.items }, baseDir);
        }
      }
    }
  }
  return sidebar;
}

// 执行
const baseDir = path.resolve("pages"); // docs 目录
const newSidebar = processSidebar(sidebars, baseDir);

// 输出到 sidebar.sorted.json
const outputFile = path.resolve("sidebar.sorted.json");
fs.writeFileSync(outputFile, JSON.stringify(newSidebar, null, 2), "utf-8");

console.log(`✅ 已生成排序后的 sidebar 到 ${outputFile}`);
