#!/usr/bin/env node
/**
 * rename_md_underscores.js
 *
 * 用法：
 *   node rename_md_underscores.js ./docs
 *
 * 功能：
 *   遍历输入目录下所有 .md / .mdx 文件，
 *   将文件名中的下划线 (_) 替换为连字符 (-)，
 *   目录名不修改。
 */

const fs = require("fs");
const path = require("path");

const inputDir = process.argv[2];

if (!inputDir) {
  console.error("❌ 请提供要处理的目录，例如：node rename_md_underscores.js ./docs");
  process.exit(1);
}

/**
 * 递归遍历目录，重命名 md/mdx 文件
 */
function walkAndRename(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkAndRename(fullPath);
      continue;
    }

    // 只处理 .md / .mdx 文件
    if (!/\.(md|mdx)$/.test(entry.name)) continue;

    if (entry.name.includes("_")) {
      const newName = entry.name.replace(/_/g, "-");
      const newPath = path.join(dirPath, newName);

      fs.renameSync(fullPath, newPath);
      console.log(`✅ 重命名: ${fullPath} → ${newPath}`);
    }
  }
}

walkAndRename(path.resolve(inputDir));
console.log("🎉 全部 .md / .mdx 文件重命名完成！");
