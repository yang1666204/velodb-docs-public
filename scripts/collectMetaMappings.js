#!/usr/bin/env node

/**
 * 收集 nextra 框架下的 meta 信息 以用于 修改 sidebars.ts下的 label
 */


const fs = require("fs");
const path = require("path");

// Step 1: 遍历 a 下所有 _meta.en-US.json
function collectMetaMappings(dir) {
  const mappings = {};

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === "_meta.en-US.json") {
        const json = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

        for (const [key, value] of Object.entries(json)) {
          if (typeof value === "string") {
            mappings[key] = value; // 直接是 "getting-started": "Getting Started"
          } else if (value && typeof value === "object" && value.type === "page") {
            // 如果是 page 类型，用 title
            if (value.title) {
              mappings[key] = value.title;
            }
          }
        }
      }
    }
  }

  walk(dir);
  return mappings;
}

// Step 2: 替换 sidebars.ts
function replaceSidebarLabels(sidebarFile, mappings) {
  let content = fs.readFileSync(sidebarFile, "utf-8");

  for (const [key, value] of Object.entries(mappings)) {
    const regex = new RegExp(`label:\\s*["'\`]${key}["'\`]`, "g");
    content = content.replace(regex, `label: "${value}"`);
  }

  fs.writeFileSync(sidebarFile, content, "utf-8");
  console.log("✅ sidebars.ts 已更新");
}

// 主逻辑
function main() {
  const [,, dirA, fileB] = process.argv;

  if (!dirA || !fileB) {
    console.error("用法: node script.js <meta目录a> <sidebars.ts路径b>");
    process.exit(1);
  }

  const absDirA = path.resolve(dirA);
  const absFileB = path.resolve(fileB);

  if (!fs.existsSync(absDirA)) {
    console.error(`目录不存在: ${absDirA}`);
    process.exit(1);
  }
  if (!fs.existsSync(absFileB)) {
    console.error(`文件不存在: ${absFileB}`);
    process.exit(1);
  }

  const mappings = collectMetaMappings(absDirA);
  console.log("📖 收集到的 key → value:", mappings);

  replaceSidebarLabels(absFileB, mappings);
}

main();
