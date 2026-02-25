#!/usr/bin/env node

/**
 * 工作区的md/mdx文件中，链接中的下划线_需要替换为连字符-
 * 
 * 使用：
 * node scripts/docs-sync/fix-md-links.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * 获取 git 工作区中变更的 md / mdx 文件
 * 包含：新增、修改、未暂存
 */
function getChangedMarkdownFiles() {
  const output = execSync(
    "git status --porcelain",
    { encoding: "utf-8" }
  );

  return output
    .split("\n")
    .filter(Boolean)
    .map(line => line.slice(3)) // 去掉 git 状态标识
    .filter(file => file.endsWith(".md") || file.endsWith(".mdx"))
    .filter(file => fs.existsSync(file));
}

/**
 * 判断是否是相对路径链接
 */
function isRelativeLink(url) {
  return (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("#")
  );
}

/**
 * 修复单个文件中的链接
 */
function fixLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // 匹配 markdown 链接：[text](url)
  const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;

  let changed = false;

  const newContent = content.replace(linkRegex, (match, text, url) => {
    if (!isRelativeLink(url)) {
      return match;
    }

    if (!url.includes("_")) {
      return match;
    }

    const newUrl = url.replace(/_/g, "-");
    changed = true;

    return `[${text}](${newUrl})`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`✔ Fixed links in ${filePath}`);
  }
}

function main() {
  const files = getChangedMarkdownFiles();

  if (files.length === 0) {
    console.log("No changed md/mdx files found.");
    return;
  }

  files.forEach(fixLinksInFile);
}

main();
