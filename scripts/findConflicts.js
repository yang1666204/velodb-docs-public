#!/usr/bin/env node

/**
 * 脚本功能:
 * 遍历指定目录，查找是否存在同名的文件和目录（例如: `example.md` 和 `example/`
 */
const fs = require("fs");
const path = require("path");

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = new Set();
  const folders = new Set();

  for (const entry of entries) {
    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      const baseName = entry.name.replace(/\.(md|mdx)$/, "");
      files.add(baseName);
    } else if (entry.isDirectory()) {
      folders.add(entry.name);
      // 递归进入子目录
      checkDir(path.join(dir, entry.name));
    }
  }

  // 找到同名的文件和目录
  for (const name of files) {
    if (folders.has(name)) {
      console.log(`⚠️ 发现同名文件和目录: ${path.join(dir, name)}.md(x) 和 ${path.join(dir, name)}/`);
    }
  }
}

function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error("❌ 用法: node findConflicts.js <目录路径>");
    process.exit(1);
  }

  const absPath = path.resolve(targetDir);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ 路径不存在: ${absPath}`);
    process.exit(1);
  }

  checkDir(absPath);
}

main();
