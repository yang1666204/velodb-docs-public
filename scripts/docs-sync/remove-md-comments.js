// remove-md-comments-simple.js
const fs = require('fs');
const { execSync } = require('child_process');

// 匹配 <!-- 注释内容 --> 格式的正则表达式
const COMMENT_REGEX = /<!--[\s\S]*?-->/g;

/**
 * 获取工作区有改动的 .md 和 .mdx 文件
 */
function getChangedFiles() {
    try {
        const output = execSync('git status --porcelain', { encoding: 'utf8' });
        return output
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.substring(3))
            .filter(file => /\.(md|mdx)$/i.test(file));
    } catch (error) {
        console.error('错误:', error.message);
        return [];
    }
}

/**
 * 处理文件
 */
function processFiles(dryRun = false) {
    const files = getChangedFiles();
    
    if (files.length === 0) {
        console.log('没有找到改动的 Markdown 文件');
        return;
    }
    
    console.log(`找到 ${files.length} 个改动的 Markdown 文件`);
    
    let totalRemoved = 0;
    let totalModified = 0;
    
    files.forEach(file => {
        if (!fs.existsSync(file)) return;
        
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(COMMENT_REGEX) || [];
        
        if (matches.length === 0) return;
        
        console.log(`${file}: 找到 ${matches.length} 个注释`);
        
        if (!dryRun) {
            const newContent = content.replace(COMMENT_REGEX, '');
            if (newContent !== content) {
                fs.writeFileSync(file, newContent, 'utf8');
                console.log(`  → 已移除注释`);
                totalModified++;
                totalRemoved += matches.length;
            }
        }
    });
    
    console.log(`\n完成!`);
    if (!dryRun) {
        console.log(`移除了 ${totalRemoved} 个注释，修改了 ${totalModified} 个文件`);
    }
}

// 运行
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');
processFiles(dryRun);