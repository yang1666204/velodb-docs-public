#!/usr/bin/env node

/**
 * 使用方式：
 * node syncFrontMatter.js /path/to/dirA /path/to/dirB
 *
 * 目录A：含 front matter
 * 目录B：无 front matter，需要迁移
 */

const fs = require('fs');
const path = require('path');

const [,, dirA, dirB] = process.argv;

if (!dirA || !dirB) {
  console.error('❌ 请提供目录A和目录B路径');
  process.exit(1);
}

/**
 * 递归读取目录下所有 md/mdx 文件路径
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
 * 从文本中提取 front matter 内容
 * 格式：
 * ---
 * {
 *   "title": "Power BI",
 *   "language": "en"
 * }
 * ---
 */
function extractFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (match) {
    return match[0]; // 返回完整的 front matter 块
  }
  return null;
}

// 读取目录A所有文件
const filesA = getAllMarkdownFiles(dirA);
const filesB = getAllMarkdownFiles(dirB);

// 建立A的文件名 -> front matter 映射
const frontMatterMap = new Map();

for (const file of filesA) {
  const content = fs.readFileSync(file, 'utf8');
  const fm = extractFrontMatter(content);
  if (fm) {
    const filename = path.basename(file);
    frontMatterMap.set(filename, fm);
    if(filename.includes('_')){
      const newFilename = filename.replace(/_/g, '-');
      frontMatterMap.set(newFilename, fm);
    }
  }
}

// 遍历B，迁移 front matter
for (const fileB of filesB) {
  const filename = path.basename(fileB);
  const fm = frontMatterMap.get(filename);
  if (!fm) continue; // A中没有相同文件

  const contentB = fs.readFileSync(fileB, 'utf8');
  const hasFM = extractFrontMatter(contentB);

  if (hasFM) {
    console.log(`⚠️ ${filename} 已经有 front matter，跳过`);
    continue;
  }

  const newContent = `${fm}\n\n${contentB}`;
  fs.writeFileSync(fileB, newContent, 'utf8');
  console.log(`✅ 已迁移 front matter 到: ${fileB}`);
}

console.log('\n🎉 front matter 同步完成');
