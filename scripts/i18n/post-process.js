#!/usr/bin/env node

/**
 * post-process.js
 *
 * 职责：
 * - 读取 translate-claude.js 输出的中间 JSON
 * - 将 translated segment 还原为合法 Markdown
 * - 写入 Docusaurus i18n 目录结构
 *
 * 设计原则：
 * - 结构 100% 可还原
 * - 翻译失败可回退到英文
 * - 不在此阶段调用任何 LLM
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const INPUT_DIR = process.argv[2];
const TARGET_ROOT = process.argv[3];

if (!INPUT_DIR || !TARGET_ROOT) {
  console.error('Usage: node post-process.js <translatedDir> <targetRoot>');
  process.exit(1);
}

/**
 * 确保目录存在
 */
function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/**
 * 将 segments 还原为 markdown 文本
 */
function restoreMarkdown(segments) {
  let output = '';

  for (const seg of segments) {
    if (seg.type === 'text') {
      output += (seg.translated || seg.value) + '\n\n';
    } else if (seg.type === 'code') {
      output += seg.value + '\n';
    }
  }

  return output.trim() + '\n';
}

function main() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    const { source, frontMatter = {}, segments } = data;

    // 1. 还原 Markdown body
    const body = restoreMarkdown(segments);

    // 2. 重新注入 front matter
    const finalMarkdown = matter.stringify(body, { ...frontMatter, language: 'ja' }, { language: 'json' });

    // 3. 计算目标路径
    const relative = path.relative('version-2.1', path.resolve(source));
    console.log('relative',relative);
    
    const targetPath = path.join(TARGET_ROOT, relative);

    ensureDir(targetPath);

    fs.writeFileSync(targetPath, finalMarkdown, 'utf8');

    console.log(`Written: ${targetPath}`);
  }
}

main();
