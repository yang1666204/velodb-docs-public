/**
 * 把 meta.json 文件转为 meta.js 文件 并添加 export default
 */

// convert-meta.js
const fs = require('fs');
const path = require('path');

/**
 * 遍历目录，查找并转换 _meta.json -> _meta.js
 * @param {string} dir - 目录路径
 */
function convertMetaFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // 递归处理子目录
            convertMetaFiles(fullPath);
        } else if (entry.isFile() && entry.name === '_meta.json') {
            const newPath = path.join(dir, '_meta.js');

            // 读取 JSON 内容
            const jsonContent = fs.readFileSync(fullPath, 'utf-8');
            let parsed;
            try {
                parsed = JSON.parse(jsonContent);
            } catch (err) {
                console.error(`❌ 解析 JSON 失败: ${fullPath}`, err);
                continue;
            }

            // 转换为 JS 格式
            const jsContent = `export default ${JSON.stringify(parsed, null, 2)};\n`;

            // 写入新文件
            fs.writeFileSync(newPath, jsContent, 'utf-8');

            // 删除旧文件
            fs.unlinkSync(fullPath);

            console.log(`✅ 转换完成: ${fullPath} -> ${newPath}`);
        }
    }
}

// 从命令行参数获取路径
const targetDir = process.argv[2];
if (!targetDir) {
    console.error('❌ 请提供要处理的目录路径，例如：node convert-meta.js ./content');
    process.exit(1);
}

const absolutePath = path.resolve(targetDir);
convertMetaFiles(absolutePath);
console.log('🎉 所有 _meta.json 文件已转换为 _meta.js！');
