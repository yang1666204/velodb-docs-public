const fs = require('fs').promises;
const path = require('path');

/**
 * 遍历目录下的所有文件
 */
async function getAllFiles(dir, exts = ['.md', '.mdx']) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, exts)));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 处理单个文件
 */
async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');

  // 匹配无描述图片语法：![](path)
  const updated = content.replace(/!\[\]\(([^)]+)\)/g, (match, imgPath) => {
    const fileName = path.basename(imgPath, path.extname(imgPath)); // 去扩展名
    const altText = fileName.replace(/[-_]+/g, ' '); // 替换 - _
    return `![${altText}](${imgPath})`;
  });

  if (updated !== content) {
    await fs.writeFile(filePath, updated, 'utf8');
    console.log(`🖼️ Updated: ${filePath}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.error('❌ 请指定要扫描的目录，例如:');
    console.error('   node fillImageDescriptions.js ./docs');
    process.exit(1);
  }

  const files = await getAllFiles(targetDir);
  console.log(`📂 检测到 ${files.length} 个 Markdown 文件。`);

  for (const file of files) {
    await processFile(file);
  }

  console.log('✅ 所有图片描述已自动补全。');
}

main().catch((err) => {
  console.error('❌ 运行出错:', err);
});
