#!/usr/bin/env node

/**
 * 使用方式：
 * node generateFrontMatterFromHeading.js /path/to/dir
 *
 * 功能：
 * 1. 遍历目录下所有 md/mdx 文件
 * 2. 如果没有 front matter，但存在 "# xxx" 标题，则生成 front matter
 * 3. title 从 "# xxx" 提取
 */
const fs = require('fs');
const path = require('path');

const [, , inputDir] = process.argv;

if (!inputDir) {
  console.error('❌ 请提供目录路径，例如：node generateFrontMatterFromHeading.js ./docs');
  process.exit(1);
}

/**
 * 递归获取目录下所有 md/mdx 文件
 */
function getAllMarkdownFiles(dir) {
  const result = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...getAllMarkdownFiles(fullPath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * 检查是否已有 front matter
 */
function hasFrontMatter(content) {
  return /^---\s*\n[\s\S]*?\n---/.test(content);
}

/**
 * 从文本中提取第一个 "# xxx" 标题
 */
function extractTitleFromHeading(content) {
  const match = content.match(/^#\s+(.+)/m);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * 处理文件
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (hasFrontMatter(content)) {
    console.log(`⚠️ 已有 front matter: ${filePath}`);
    return;
  }

  const title = extractTitleFromHeading(content);
  if (!title) {
    console.log(`⚠️ 无标题 (# xxx)，跳过: ${filePath}`);
    return;
  }

  const frontMatter = `---\n{\n  "title": "${title.replace(/"/g, '\\"')}"\n}\n---\n\n`;
  const newContent = frontMatter + content;
  fs.writeFileSync(filePath, newContent, 'utf8');

  console.log(`✅ 已生成 front matter: ${filePath}`);
}

// 遍历所有文件
const files = getAllMarkdownFiles(inputDir);

for (const file of files) {
  processFile(file);
}

console.log('\n🎉 front matter 自动生成完成');
