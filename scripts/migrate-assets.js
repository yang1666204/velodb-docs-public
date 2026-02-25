/**
 * 将所有 assets 目录下的静态资源迁移到 static/images 目录下，并更新文档中的引用路径。
 * 
 * 支持处理 md/mdx 文件中的图片引用，包括 Markdown 语法、HTML img 标签和 JSX Image 组件。
 */

const fs = require('fs');
const path = require('path');

// 配置
const ROOT_DIR = 'docs'; // 从当前目录开始搜索
const TARGET_DIR = 'static/images'; // 静态文件目标目录
const IMAGES_BASE_URL = '/images'; // 新的图片URL前缀
const DELETE_ORIGINAL_ASSETS = true; // 是否删除原assets目录

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['.md', '.mdx'];

// 主函数
async function migrateAllAssets() {
    console.log('开始递归迁移所有静态资源...\n');
    
    try {
        // 1. 查找所有assets目录和支持的文档文件
        const { assetsDirs, docFiles } = await scanDirectory(ROOT_DIR);
        
        console.log(`找到 ${assetsDirs.length} 个assets目录`);
        console.log(`找到 ${docFiles.length} 个文档文件 (${SUPPORTED_EXTENSIONS.join(', ')})`);
        
        if (assetsDirs.length === 0) {
            console.log('没有找到assets目录，无需迁移');
            return;
        }
        
        // 2. 迁移每个assets目录（去掉assets这一级）
        const migrationMap = new Map(); // 记录原路径到新URL的映射
        const migratedDirs = []; // 记录成功迁移的目录
        
        for (const assetsDir of assetsDirs) {
            const migratedFiles = await migrateAssetsDirectory(assetsDir, migrationMap);
            if (migratedFiles.length > 0) {
                console.log(`✓ 迁移 ${migratedFiles.length} 个文件: ${assetsDir}`);
                migratedDirs.push(assetsDir);
            }
        }
        
        // 3. 更新所有文档文件中的引用
        console.log('\n开始更新文档文件引用...');
        let totalUpdates = 0;
        
        for (const docFile of docFiles) {
            const updates = await updateDocFile(docFile, migrationMap);
            if (updates > 0) {
                console.log(`✓ 更新 ${updates} 个引用: ${docFile}`);
                totalUpdates += updates;
            }
        }
        
        // 4. 删除原assets目录（如果配置允许）
        if (DELETE_ORIGINAL_ASSETS) {
            console.log('\n开始清理原assets目录...');
            const deletedDirs = await deleteOriginalAssetsDirs(migratedDirs);
            console.log(`✓ 删除了 ${deletedDirs.length} 个原assets目录`);
        }
        
        console.log(`\n🎉 迁移完成！`);
        console.log(`• 迁移了 ${assetsDirs.length} 个assets目录`);
        console.log(`• 更新了 ${totalUpdates} 个图片引用`);
        console.log(`• 处理了 ${docFiles.length} 个文档文件`);
        if (DELETE_ORIGINAL_ASSETS) {
            console.log(`• 删除了原assets目录`);
        }
        
    } catch (error) {
        console.error('❌ 迁移过程中出错:', error);
    }
}

// 递归扫描目录，找到所有assets目录和文档文件
function scanDirectory(dir) {
    const assetsDirs = [];
    const docFiles = [];
    
    function scanRecursive(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            // 忽略node_modules、.git等目录
            if (item === 'node_modules' || item === '.git' || item === TARGET_DIR) {
                continue;
            }
            
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (item === 'assets') {
                    assetsDirs.push(fullPath);
                } else {
                    scanRecursive(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    docFiles.push(fullPath);
                }
            }
        }
    }
    
    scanRecursive(dir);
    return { assetsDirs, docFiles };
}

// 迁移单个assets目录（去掉assets这一级）
function migrateAssetsDirectory(assetsDir, migrationMap) {
    const migratedFiles = [];
    
    try {
        // 检查源目录是否存在且不为空
        if (!fs.existsSync(assetsDir)) {
            console.log(`⚠ 源目录不存在: ${assetsDir}`);
            return migratedFiles;
        }
        
        const items = fs.readdirSync(assetsDir);
        if (items.length === 0) {
            console.log(`⚠ 源目录为空: ${assetsDir}`);
            return migratedFiles;
        }
        
        // 计算原assets目录的父目录相对路径
        const parentDir = path.dirname(assetsDir);
        const relativeParentPath = path.relative(ROOT_DIR, parentDir);
        
        // 新的目标目录：static/原父目录路径/
        const newBaseDir = path.join(TARGET_DIR, relativeParentPath);
        
        // 确保目标目录存在
        fs.mkdirSync(newBaseDir, { recursive: true });
        
        // 复制assets目录内的所有文件（去掉assets这一级）
        copyAssetsContents(assetsDir, newBaseDir, migratedFiles, migrationMap, relativeParentPath);
        
        return migratedFiles;
        
    } catch (error) {
        console.error(`迁移assets目录失败: ${assetsDir}`, error);
        return migratedFiles;
    }
}

// 复制assets目录内容（去掉assets这一级）
function copyAssetsContents(srcAssetsDir, destBaseDir, migratedFiles, migrationMap, relativeParentPath) {
    function processDirectory(currentSrcDir, currentDestDir) {
        const items = fs.readdirSync(currentSrcDir);
        
        for (const item of items) {
            const srcPath = path.join(currentSrcDir, item);
            const destPath = path.join(currentDestDir, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
                // 递归处理子目录
                fs.mkdirSync(destPath, { recursive: true });
                processDirectory(srcPath, destPath);
            } else {
                // 复制文件
                fs.copyFileSync(srcPath, destPath);
                migratedFiles.push(item);
                
                // 记录路径映射
                const relativeFilePath = path.relative(srcAssetsDir, srcPath);
                const newImageUrl = `${IMAGES_BASE_URL}/${relativeParentPath}/${relativeFilePath}`.replace(/\\/g, '/');
                
                // 记录多种可能的引用方式
                const relativeFromRoot = path.relative(ROOT_DIR, srcPath);
                migrationMap.set(relativeFromRoot, newImageUrl);
                
                // 记录相对于assets目录的路径
                const relativeFromAssets = `assets/${relativeFilePath}`;
                migrationMap.set(relativeFromAssets, newImageUrl);
                
                // 记录完整路径
                migrationMap.set(srcPath, newImageUrl);
                
                console.log(`  复制: ${item} -> ${newImageUrl}`);
            }
        }
    }
    
    processDirectory(srcAssetsDir, destBaseDir);
}

// 更新单个文档文件中的引用
function updateDocFile(filePath, migrationMap) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updateCount = 0;
        
        // 更新Markdown格式的图片引用 ![alt](path)
        const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
        content = content.replace(markdownImageRegex, (match, altText, imgPath) => {
            const updatedUrl = findUpdatedUrl(imgPath, filePath, migrationMap);
            if (updatedUrl && updatedUrl !== imgPath) {
                updateCount++;
                return `![${altText}](${updatedUrl})`;
            }
            return match;
        });
        
        // 更新HTML img标签 <img src="path">
        const htmlImgRegex = /<img[^>]+src=(["'])(.*?)\1[^>]*>/g;
        content = content.replace(htmlImgRegex, (match, quote, imgPath) => {
            const updatedUrl = findUpdatedUrl(imgPath, filePath, migrationMap);
            if (updatedUrl && updatedUrl !== imgPath) {
                updateCount++;
                return match.replace(`src=${quote}${imgPath}${quote}`, `src=${quote}${updatedUrl}${quote}`);
            }
            return match;
        });
        
        // 更新JSX格式的img标签 src属性
        const jsxImgRegex = /<img[^>]+src=\{(.*?)\}[^>]*>/g;
        content = content.replace(jsxImgRegex, (match, jsxSrc) => {
            // 处理JSX中的字符串字面量
            const cleanedSrc = jsxSrc.trim().replace(/^["']|["']$/g, '');
            const updatedUrl = findUpdatedUrl(cleanedSrc, filePath, migrationMap);
            if (updatedUrl && updatedUrl !== cleanedSrc) {
                updateCount++;
                return match.replace(`src={${jsxSrc}}`, `src={"${updatedUrl}"}`);
            }
            return match;
        });
        
        // 更新JSX格式的Image组件（Next.js等）
        const jsxImageComponentRegex = /<Image[^>]+src=(["'])(.*?)\1[^>]*>/g;
        content = content.replace(jsxImageComponentRegex, (match, quote, imgPath) => {
            const updatedUrl = findUpdatedUrl(imgPath, filePath, migrationMap);
            if (updatedUrl && updatedUrl !== imgPath) {
                updateCount++;
                return match.replace(`src=${quote}${imgPath}${quote}`, `src=${quote}${updatedUrl}${quote}`);
            }
            return match;
        });
        
        // 更新JSX格式的Image组件（使用大括号）
        const jsxImageComponentBracesRegex = /<Image[^>]+src=\{(.*?)\}[^>]*>/g;
        content = content.replace(jsxImageComponentBracesRegex, (match, jsxSrc) => {
            const cleanedSrc = jsxSrc.trim().replace(/^["']|["']$/g, '');
            const updatedUrl = findUpdatedUrl(cleanedSrc, filePath, migrationMap);
            if (updatedUrl && updatedUrl !== cleanedSrc) {
                updateCount++;
                return match.replace(`src={${jsxSrc}}`, `src={"${updatedUrl}"}`);
            }
            return match;
        });
        
        if (updateCount > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
        
        return updateCount;
        
    } catch (error) {
        console.error(`更新文档文件失败: ${filePath}`, error);
        return 0;
    }
}

// 查找更新后的URL
function findUpdatedUrl(originalPath, docFilePath, migrationMap) {
    // 如果是绝对路径或网络路径，不处理
    if (originalPath.startsWith('http://') || 
        originalPath.startsWith('https://') ||
        originalPath.startsWith('/') ||
        originalPath.startsWith('data:') ||
        originalPath.startsWith('#')) {
        return originalPath;
    }
    
    // 方法1: 直接查找映射（相对路径）
    if (migrationMap.has(originalPath)) {
        return migrationMap.get(originalPath);
    }
    
    // 方法2: 解析相对于文档文件的完整路径
    const docFileDir = path.dirname(docFilePath);
    const fullPath = path.resolve(docFileDir, originalPath);
    const relativeFullPath = path.relative(ROOT_DIR, fullPath);
    
    if (migrationMap.has(relativeFullPath)) {
        return migrationMap.get(relativeFullPath);
    }
    
    // 方法3: 检查路径是否包含assets，尝试构造新URL
    if (originalPath.includes('assets/')) {
        // 提取assets之后的部分
        const assetsIndex = originalPath.indexOf('assets/');
        const afterAssets = originalPath.substring(assetsIndex + 7); // 7 = "assets/".length
        
        // 获取文档文件所在目录的相对路径
        const docRelativeDir = path.relative(ROOT_DIR, docFileDir);
        
        // 计算图片相对于ROOT_DIR的路径
        let imageRelativePath;
        if (originalPath.startsWith('./') || originalPath.startsWith('../')) {
            // 相对路径，需要计算实际路径
            const actualPath = path.resolve(docFileDir, originalPath);
            imageRelativePath = path.relative(ROOT_DIR, actualPath);
        } else {
            // 直接使用assets之后的部分
            imageRelativePath = path.join(docRelativeDir, 'assets', afterAssets);
        }
        
        // 去掉assets这一级，构造新的URL
        const parentDir = path.dirname(imageRelativePath.replace(/\\/g, '/'));
        const fileName = path.basename(imageRelativePath);
        const newUrl = `${IMAGES_BASE_URL}/${parentDir}/${fileName}`.replace(/\\/g, '/');
        
        console.log(`  自动转换: ${originalPath} -> ${newUrl}`);
        return newUrl;
    }
    
    return originalPath;
}

// 删除原assets目录
function deleteOriginalAssetsDirs(assetsDirs) {
    const deletedDirs = [];
    
    for (const assetsDir of assetsDirs) {
        try {
            // 安全检查：确保目录存在且是assets目录
            if (!fs.existsSync(assetsDir)) {
                console.log(`⚠ 目录已不存在: ${assetsDir}`);
                continue;
            }
            
            // 安全检查：确认目录名是assets
            if (path.basename(assetsDir) !== 'assets') {
                console.log(`⚠ 跳过非assets目录: ${assetsDir}`);
                continue;
            }
            
            // 删除目录
            fs.rmSync(assetsDir, { recursive: true, force: true });
            deletedDirs.push(assetsDir);
            console.log(`✓ 删除: ${assetsDir}`);
            
        } catch (error) {
            console.error(`❌ 删除目录失败: ${assetsDir}`, error);
        }
    }
    
    return deletedDirs;
}

// 运行脚本
if (require.main === module) {
    // 检查是否传入 --dry-run 参数进行试运行
    const isDryRun = process.argv.includes('--dry-run');
    
    if (isDryRun) {
        console.log('🚧 试运行模式（不实际执行删除操作）');
        migrateAllAssetsDryRun();
    } else {
        migrateAllAssets();
    }
}

// 试运行模式：显示将要执行的操作但不实际执行
async function migrateAllAssetsDryRun() {
    console.log('开始试运行迁移所有静态资源...\n');
    
    try {
        const { assetsDirs, docFiles } = await scanDirectory(ROOT_DIR);
        
        console.log(`找到 ${assetsDirs.length} 个assets目录:`);
        assetsDirs.forEach(dir => console.log(`  📁 ${dir}`));
        
        console.log(`\n找到 ${docFiles.length} 个文档文件 (${SUPPORTED_EXTENSIONS.join(', ')}):`);
        docFiles.forEach(file => console.log(`  📄 ${file}`));
        
        console.log(`\n将会执行以下操作:`);
        console.log(`1. 将 ${assetsDirs.length} 个assets目录迁移到 ${TARGET_DIR} 目录`);
        console.log(`2. 更新 ${docFiles.length} 个文档文件中的图片引用`);
        console.log(`3. 删除 ${assetsDirs.length} 个原assets目录`);
        
        console.log(`\n💡 使用以下命令实际执行迁移:`);
        console.log(`   node ${path.basename(__filename)}`);
        
    } catch (error) {
        console.error('试运行过程中出错:', error);
    }
}

module.exports = { migrateAllAssets };