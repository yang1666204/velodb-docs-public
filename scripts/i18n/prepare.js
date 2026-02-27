#!/usr/bin/env node

/**
 * prepare.js
 *
 * 目标：
 * 将英文 Markdown 文档转换为「安全可翻译的中间结构」，供 LLM 使用。
 *
 * 输入：
 *  - files.json: 需要翻译的英文 markdown 文件路径数组
 *  - 输出目录
 *  - manifest.json 输出路径
 *
 * 输出：
 *  - 每个 markdown 对应一个 JSON 中间文件
 *  - manifest.json：描述源文件与中间文件、最终输出路径的映射关系
 *
 * 设计原则：
 *  - 只翻译自然语言文本
 *  - 不翻译代码块 / inline code / URL / frontmatter key
 *  - Markdown 结构必须可 100% 还原
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SOURCE_PLUGIN_MAP = {
  cloud_versioned_docs: 'docusaurus-plugin-content-docs-cloud',
  enterprise_versioned_docs: 'docusaurus-plugin-content-docs-enterprise',
};

const [, , filesJsonPath, outDir, manifestPath] = process.argv;

if (!filesJsonPath || !outDir || !manifestPath) {
  console.error('Usage: node prepare.js <files.json> <outDir> <manifest.json>');
  process.exit(1);
}

const files = JSON.parse(fs.readFileSync(filesJsonPath, 'utf8'));

fs.mkdirSync(outDir, { recursive: true });

const manifest = [];

function normalizeSourcePath(sourcePath) {
  return sourcePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function resolveI18nTargetPath(sourcePath) {
  const normalizedSource = normalizeSourcePath(sourcePath);

  for (const [sourcePrefix, pluginDir] of Object.entries(SOURCE_PLUGIN_MAP)) {
    const prefix = `${sourcePrefix}/`;
    if (normalizedSource.startsWith(prefix)) {
      const relative = normalizedSource.slice(prefix.length);
      return path.posix.join('i18n/ja', pluginDir, relative);
    }
  }

  throw new Error(`Unsupported source path for translation target: ${sourcePath}`);
}

for (const file of files) {
  const absPath = path.resolve(file);
  const raw = fs.readFileSync(absPath, 'utf8');

  // 1. 解析 front matter
  const parsed = matter(raw);
  const content = parsed.content;

  // 2. 按代码块切分（```）
  const segments = [];
  let buffer = '';
  let inCodeBlock = false;
  let index = 0;

  const lines = content.split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      // flush buffer
      if (buffer.trim()) {
        segments.push({
          id: index++,
          type: 'text',
          value: buffer.trim()
        });
        buffer = '';
      }

      segments.push({
        id: index++,
        type: 'code',
        value: line
      });

      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      segments.push({
        id: index++,
        type: 'code',
        value: line
      });
    } else {
      buffer += line + '\n';
    }
  }

  if (buffer.trim()) {
    segments.push({
      id: index++,
      type: 'text',
      value: buffer.trim()
    });
  }

  // 3. 生成中间文件
  // Use repository root (process.cwd()) as base so files under cloud_versioned_docs/... map cleanly
  const relative = path.relative(process.cwd(), absPath);
  const intermediateName = relative.replace(/[\\/]/g, '_').replace(/\.mdx?$/, '.json');
  const intermediatePath = path.join(outDir, intermediateName);

  const intermediate = {
    source: file,
    frontMatter: parsed.data,
    segments,
  };

  fs.writeFileSync(intermediatePath, JSON.stringify(intermediate, null, 2));
  console.log(`Wrote intermediate: ${intermediatePath}`);

  // 4. 计算最终 ja 输出路径
  const targetPath = resolveI18nTargetPath(relative);

  manifest.push({
    source: file,
    intermediate: intermediatePath,
    target: targetPath
  });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Prepared ${manifest.length} files for translation.`);
