#!/usr/bin/env node

/**
 * 生成的 sidebar 需要全局删除 docs/ 前缀
 */
const fs = require('fs');
const path = require('path');

function generateSidebar(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subItems = generateSidebar(fullPath, relativePath);
      if (subItems.length > 0) {
        items.push({
          type: 'category',
          label: entry.name, // 用目录名当 label
          items: subItems
        });
      }
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      const fileName = entry.name.replace(/\.(md|mdx)$/, '');
      items.push(
        path
          .join(basePath, fileName)
          .replace(/\\/g, '/') // Windows 兼容
          .replace(/^docs\//, '') // 去掉 docs/ 前缀
      );
    }
  }

  return items;
}

// 主逻辑
function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error('请提供一个相对路径，例如：node generateSidebar.js ./docs/gettingStarted');
    process.exit(1);
  }

  const absPath = path.resolve(targetDir);
  if (!fs.existsSync(absPath)) {
    console.error(`路径不存在: ${absPath}`);
    process.exit(1);
  }

  const sidebar = {
    docs: [
      {
        type: 'category',
        label: path.basename(absPath),
        items: generateSidebar(absPath, path.basename(absPath))
      }
    ]
  };

  const outputFile = path.resolve(process.cwd(), 'sidebar.json');
  fs.writeFileSync(outputFile, JSON.stringify(sidebar, null, 2), 'utf-8');

  console.log(`✅ sidebar 已生成: ${outputFile}`);
}

main();
