/**
 * 移除文件名中的 en-US 部分
 * 输入相对路径
 */

const fs = require('fs');
const path = require('path');

/**
 * 递归处理目录，重命名所有文件
 * @param {string} dir - 要处理的目录
 */
function renameFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 递归处理子目录
      renameFiles(fullPath);
    } else {
      // 检查文件名是否包含 .en-US
      if (entry.name.includes('.en-US')) {
        const newName = entry.name.replace('.en-US', '');
        const newPath = path.join(dir, newName);

        fs.renameSync(fullPath, newPath);
        console.log(`重命名: ${entry.name} -> ${newName}`);
      }
    }
  }
}

// 从命令行参数获取路径
const targetDir = process.argv[2];
if (!targetDir) {
  console.error('❌ 请提供要处理的目录路径，例如：node rename-files.js ./content');
  process.exit(1);
}

const absolutePath = path.resolve(targetDir);
renameFiles(absolutePath);
console.log('✅ 文件重命名完成！');
