#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * 递归重命名目录和 md/mdx 文件中的 "_" 为 "-"
 * @param {string} targetPath
 * 
 * 用法：node rename-underscores.js cloud_versioned_docs/verion-4.x
 */
function renameRecursively(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    // 先处理子级
    const entries = fs.readdirSync(targetPath);
    for (const entry of entries) {
      renameRecursively(path.join(targetPath, entry));
    }

    // 再处理当前目录本身
    const dirName = path.basename(targetPath);
    if (dirName.includes("_")) {
      const newDirName = dirName.replace(/_/g, "-");
      const newDirPath = path.join(path.dirname(targetPath), newDirName);

      if (!fs.existsSync(newDirPath)) {
        fs.renameSync(targetPath, newDirPath);
        console.log(`DIR  : ${targetPath} -> ${newDirPath}`);
      }
    }
  } else if (stat.isFile()) {
    const ext = path.extname(targetPath);
    if (ext !== ".md" && ext !== ".mdx") return;

    const fileName = path.basename(targetPath);
    if (!fileName.includes("_")) return;

    const newFileName = fileName.replace(/_/g, "-");
    const newFilePath = path.join(path.dirname(targetPath), newFileName);

    if (!fs.existsSync(newFilePath)) {
      fs.renameSync(targetPath, newFilePath);
      console.log(`FILE : ${targetPath} -> ${newFilePath}`);
    }
  }
}

// --------- CLI 入口 ---------

const inputDir = process.argv[2];

if (!inputDir) {
  console.error("Usage: node rename-underscores.js <relative-path>");
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), inputDir);
renameRecursively(absolutePath);
