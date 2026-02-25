// deleteMetaJson.js
const fs = require('fs').promises;
const path = require('path');

async function deleteMetaFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await deleteMetaFiles(fullPath); // 递归
    } else if (entry.name === '_meta.json') {
      await fs.unlink(fullPath);
      console.log(`🗑️ Deleted: ${fullPath}`);
    }
  }
}

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('❌ 请指定目录，例如:');
  console.error('   node deleteMetaJson.js ./docs');
  process.exit(1);
}

deleteMetaFiles(targetDir).then(() => {
  console.log('✅ 所有 _meta.json 文件已删除完毕。');
});
