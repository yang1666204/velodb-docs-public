#!/usr/bin/env node

/**
 * 功能：
 * 遍历目录，找到所有 md/mdx 文件
 * 把文档中链接里的 *.en-US.mdx 改成 *.mdx
 * 
 * 使用：
 * node ./scripts/fixLinks.js ./docs
 */

const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // 匹配 markdown 链接里的 *.en-US.mdx
  const updated = content.replace(
    /\(([^)]+)\.en-US\.(mdx?|md)\)/g,
    (_, prefix, ext) => `(${prefix}.${ext})`
  );
  
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`✅ 已更新: ${filePath}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error("❌ 用法: node fixLinks.js <目录路径>");
    process.exit(1);
  }

  const absPath = path.resolve(targetDir);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ 路径不存在: ${absPath}`);
    process.exit(1);
  }

  walkDir(absPath);
  console.log("🎉 所有文件处理完成");
}

main();
