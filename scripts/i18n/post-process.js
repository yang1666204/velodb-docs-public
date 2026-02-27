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

const SOURCE_PLUGIN_MAP = {
  cloud_versioned_docs: 'docusaurus-plugin-content-docs-cloud',
  enterprise_versioned_docs: 'docusaurus-plugin-content-docs-enterprise',
};

if (!INPUT_DIR || !TARGET_ROOT) {
  console.error('Usage: node post-process.js <translatedDir> <i18nRoot>');
  process.exit(1);
}

function normalizeSourcePath(sourcePath) {
  const raw = path.isAbsolute(sourcePath)
    ? path.relative(process.cwd(), sourcePath)
    : sourcePath;
  return raw.replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function resolveTargetPath(sourcePath, i18nRoot) {
  const normalizedSource = normalizeSourcePath(sourcePath);

  for (const [sourcePrefix, pluginDir] of Object.entries(SOURCE_PLUGIN_MAP)) {
    const prefix = `${sourcePrefix}/`;
    if (normalizedSource.startsWith(prefix)) {
      const relative = normalizedSource.slice(prefix.length);
      return path.join(i18nRoot, pluginDir, relative);
    }
  }

  throw new Error(`Unsupported source path for translation output: ${sourcePath}`);
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

    // 3. 根据源文档路径计算目标路径（cloud / enterprise）
    const targetPath = resolveTargetPath(source, TARGET_ROOT);

    ensureDir(targetPath);

    fs.writeFileSync(targetPath, finalMarkdown, 'utf8');

    console.log(`Written: ${targetPath}`);
  }
}

main();
