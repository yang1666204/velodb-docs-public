#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function maskCodeFences(content) {
  const blocks = [];
  const masked = content.replace(/(?:```|~~~)[\s\S]*?(?:```|~~~)/g, (m) => {
    const idx = blocks.length;
    blocks.push(m);
    return `__CODEBLOCK_${idx}__`;
  });
  return { masked, blocks };
}

function restoreCodeFences(content, blocks) {
  return content.replace(/__CODEBLOCK_(\d+)__/g, (_, i) => blocks[Number(i)]);
}

function removeCalloutFromImports(content) {
  // 匹配 import ... from 'nextra/components'（支持多行）
  return content.replace(/import\s+([^;]*?)\s+from\s+(['"])nextra\/components\2;?\s*\n?/g, (match, importsPart) => {
    const s = importsPart.trim();
    // 提取 default import (可能不存在) 与 named imports (可能不存在)
    // 可能的形式:
    //  - "{ A, B }"
    //  - "Default"
    //  - "Default, { A, B }"
    const m = s.match(/^([^,{]+)?\s*(?:,\s*)?(\{[\s\S]*\})?$/);
    const defaultImport = m && m[1] ? m[1].trim() : null;
    const namedImportsRaw = m && m[2] ? m[2].trim() : null;

    if (!namedImportsRaw) {
      // 没有花括号的命名导入，可能是 default 导入是 Callout（极少见）
      if (defaultImport && /\bCallout\b/.test(defaultImport)) {
        return ''; // 删除整行
      }
      return match; // 保持原样
    }

    // 处理命名导入里的各项，删除包含 Callout 的项
    const inner = namedImportsRaw.replace(/^\{/, '').replace(/\}$/, '').trim();
    const parts = inner.split(',').map(p => p.trim()).filter(Boolean);

    const remaining = parts.filter(p => !/^\s*Callout(\s+as\s+\w+)?\s*$/.test(p));

    if (remaining.length === 0) {
      // 没有剩余命名导入
      if (defaultImport) {
        // 变成只有 default import
        return `import ${defaultImport} from 'nextra/components';\n`;
      } else {
        // 删除整行
        return '';
      }
    } else {
      const namedStr = `{ ${remaining.join(', ')} }`;
      if (defaultImport) {
        return `import ${defaultImport}, ${namedStr} from 'nextra/components';\n`;
      } else {
        return `import ${namedStr} from 'nextra/components';\n`;
      }
    }
  });
}

function convertCallouts(content) {
  // 匹配 <Callout ...> ... </Callout>
  // group1: 属性字符串，group2: inner content
  return content.replace(/<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g, (match, attrs, inner) => {
    // 取 type 属性，支持双/单引号
    const typeMatch = attrs.match(/type\s*=\s*(?:"([^"]+)"|'([^']+)')/);
    const type = typeMatch ? (typeMatch[1] || typeMatch[2]) : 'note';

    // 去掉最外层的单首尾换行（保留内部行首缩进，保留代码块缩进）
    if (inner.startsWith('\n')) inner = inner.slice(1);
    if (inner.endsWith('\n')) inner = inner.slice(0, -1);

    return `:::${type}\n${inner}\n:::`; // 保持内部原有缩进/格式
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 先 mask code fences，避免误替换代码示例里的 Callout 字面量
  const { masked, blocks } = maskCodeFences(content);

  // 删除或修剪 import { Callout } from 'nextra/components'
  let out = removeCalloutFromImports(masked);

  // 转换 <Callout ...> ... </Callout>（包含无 type 的情况 -> 默认 note）
  out = convertCallouts(out);

  // restore code fences
  out = restoreCodeFences(out, blocks);

  if (out !== content) {
    fs.writeFileSync(filePath, out, 'utf8');
    console.log('✅ Converted:', filePath);
    return true;
  }
  return false;
}

function traverseDir(dir) {
  let changedCount = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      changedCount += traverseDir(full);
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      if (processFile(full)) changedCount++;
    }
  }
  return changedCount;
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node convertCallout.js <relative-path>');
    process.exit(1);
  }
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) {
    console.error('Path not found:', abs);
    process.exit(1);
  }
  const total = traverseDir(abs);
  console.log(`\nDone. Updated ${total} file(s).`);
}

main();
