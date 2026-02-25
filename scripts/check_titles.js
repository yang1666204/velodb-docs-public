#!/usr/bin/env node

/**
 * 遍历指定目录下的所有 .md / .mdx 文件，
 * 检查 Front Matter 的 title 与正文第一行的 # 标题是否一致。
 * - 如果不一致，打印文件路径；
 * - 如果正文没有 # 标题，也打印文件路径。
 */

const fs = require("fs");
const path = require("path");

const rootDir = process.argv[2];
if (!rootDir) {
  console.error("❌ 请提供一个目录路径，例如：node check_titles.js ./docs");
  process.exit(1);
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const jsonBlock = match[1].trim();
  try {
    return JSON.parse(jsonBlock);
  } catch {
    return null;
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const frontMatter = parseFrontMatter(content);
  if (!frontMatter || !frontMatter.title) return; // 没有title就跳过

  // 提取正文（去掉 front matter）
  const body = content.replace(/^---\s*\n[\s\S]*?\n---/, "").trim();

  // 匹配正文第一行形如 "# 标题"
  const firstLine = body.split("\n").find(line => line.trim().startsWith("#"));
  if (!firstLine) {
    console.log(`❌ 无 # 标题: ${filePath}`);
    return;
  }

  const heading = firstLine.replace(/^#+\s*/, "").trim();

  if (heading !== frontMatter.title.trim()) {
    console.log(`⚠️ 标题不一致: ${filePath}`);
    console.log(`   FrontMatter: "${frontMatter.title}"`);
    console.log(`   Heading:      "${heading}"`);
  }
}

walkDir(path.resolve(rootDir), checkFile);

console.log("✅ 检查完成。");
