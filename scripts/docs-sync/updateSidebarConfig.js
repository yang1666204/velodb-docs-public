/**
 * 新增了文档之后，更新sidebar配置文件
 * 
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 更新sidebar配置
 * @param {string} filePath - 新增文件的路径，如 'studio/connect-to-studio/a.md'
 * @param {string} fileContent - 文件内容，用于提取label
 * @param {string} sidebarPath - sidebar.json文件路径
 * @param {object} sidebarPath - doris文档的配置文件
 */
async function updateSidebarConfig(filePath, fileContent, sidebarPath, sourceSidebarConfig) {
    try {
        // 读取现有的sidebar配置
        const sidebarContent = await fs.readFile(sidebarPath, 'utf-8');
        let sidebar = JSON.parse(sidebarContent);
        // 提取文件信息
        const fileInfo = extractFileInfo(filePath, fileContent);

        // 更新sidebar配置
        updateSidebarStructure(sidebar, fileInfo, sourceSidebarConfig);
        console.log('sidebarPath', sidebarPath);

        // 写回文件
        await fs.writeFile(sidebarPath, JSON.stringify(sidebar, null, 2));
        console.log(`✓ Sidebar配置已更新: ${fileInfo.id}`);

        return sidebar;
    } catch (error) {
        console.error('✗ 更新sidebar配置失败:', error);
        throw error;
    }
}

/**
 * 从文件路径和内容中提取信息
 */
function extractFileInfo(filePath, fileContent) {
    // 移除 .md 或 .mdx 后缀，作为 id
    let id = filePath.replace(/\.(md|mdx)$/i, '');

    // 从文件内容中提取label（第一行的#标题）
    const label = extractLabelFromContent(fileContent);

    // 解析路径结构
    const pathParts = id.split('/');
    const category = pathParts[0]; // 如 'studio'
    const subPath = pathParts.slice(1); // 如 ['connect-to-studio', 'a']

    return {
        id,
        label: label || generateDefaultLabel(pathParts[pathParts.length - 1]),
        category,
        pathParts: subPath,
        depth: subPath.length
    };
}

// /**
//  * 从文件内容中提取label（第一行#标题）
//  */
// function extractLabelFromContent(content) {
//     const firstLine = content.trim().split('\n')[0];
//     const titleMatch = firstLine.match(/^#\s+(.+)$/);
//     return titleMatch ? titleMatch[1].trim() : null;
// }

function extractLabelFromContent(content) {
    // 1. 首先尝试提取 frontmatter title
    const frontMatterTitle = extractTitleFromFrontMatter(content);
    if (frontMatterTitle) {
        return frontMatterTitle;
    }

    // 2. 如果没有 frontmatter，尝试提取 # 标题
    const markdownTitle = extractMarkdownTitle(content);
    if (markdownTitle) {
        return markdownTitle;
    }

    return null;
}

function extractTitleFromFrontMatter(content) {
    // 匹配 frontmatter 块（支持 --- 和 *** 作为分隔符）
    const frontMatterMatch = content.match(/^(---|\*\*\*)\s*\n([\s\S]*?)\n\1/);
    if (!frontMatterMatch) {
        return null;
    }

    const frontMatterContent = frontMatterMatch[2];

    // 尝试解析为 JSON 格式
    try {
        const frontMatterObj = JSON.parse(frontMatterContent);
        if (frontMatterObj.title && typeof frontMatterObj.title === 'string') {
            return frontMatterObj.title.trim();
        }
    } catch (error) {
        // 如果不是 JSON，尝试 YAML 格式
    }

    // 尝试 YAML 格式解析
    const yamlTitleMatch = frontMatterContent.match(/title:\s*["']?([^"'\n]+)["']?/);
    if (yamlTitleMatch) {
        return yamlTitleMatch[1].trim();
    }

    // 尝试其他可能的 YAML 格式
    const yamlVariations = [
        /title:\s*"([^"]+)"/,      // title: "value"
        /title:\s*'([^']+)'/,      // title: 'value'
        /title:\s*([^\n]+)/        // title: value
    ];

    for (const pattern of yamlVariations) {
        const match = frontMatterContent.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    return null;
}

function extractMarkdownTitle(content) {
    // 移除 frontmatter 后查找 # 标题
    const contentWithoutFrontMatter = content.replace(/^(---|\*\*\*)\s*\n[\s\S]*?\n\1\s*\n?/, '');
    const lines = contentWithoutFrontMatter.trim().split('\n');

    for (const line of lines) {
        const titleMatch = line.match(/^#\s+(.+)$/);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
    }

    return null;
}

/**
 * 生成默认label（将文件名转换为可读格式）
 */
function generateDefaultLabel(fileName) {
    return fileName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * 更新sidebar结构
 * 
 * 
 */
function updateSidebarStructure(sidebar, fileInfo, sourceSidebarConfig) {
    let { category, pathParts, id, label } = fileInfo;

    // 确保顶级分类存在
    if (!sidebar[category]) {
        sidebar[category] = [];
    }

    // 递归查找或创建分类结构
    let currentLevel = sidebar[category];

    let currentDepth = 0;

    for (let i = 0; i < pathParts.length - 1; i++) {
        const currentPath = pathParts[i];
        let categoryFound = false;

        // 在当前层级查找分类
        for (let j = 0; j < currentLevel.length; j++) {
            const item = currentLevel[j];

            // item.label来判断是不是同一种目录下的文档 
            // 中文文档的label是中文，请求过来的label是英文，必须通过映射文件转换为中文
            // generateDefaultLabel生成的逻辑是：文件名小写并且移除连字符
            const fetchLabel = generateDefaultLabel(currentPath).toLowerCase();

            if (item.type === 'category' &&
                item.label.toLowerCase() === fetchLabel) {
                // 找到现有分类
                currentLevel = item.items;
                categoryFound = true;
                break;
            }
        }

        // 如果没找到分类，创建新的分类
        // label 需要跟翻译文件做映射
        if (!categoryFound) {
            const newCategory = {
                type: 'category',
                collapsed: i === 0 ? false : true,
                label: generateDefaultLabel(currentPath),
                items: []
            };
            currentLevel.push(newCategory);
            currentLevel = newCategory.items;
        }
    }

    if (id.startsWith('cloud/')) {
        id = id.replace('cloud/', '');
    } else if (id.startsWith('enterprise/')) {
        id = id.replace('enterprise/', '')
    }
    // 创建文档项
    const docItem = {
        type: 'doc',
        id: id,
        label: label
    };

    // 检查是否已存在相同id的文档
    const existingIndex = currentLevel.findIndex(item =>
        item.type === 'doc' && item.id === id
    );

    if (existingIndex !== -1) {
        // 更新现有文档
        currentLevel[existingIndex] = docItem;
    } else {
        // 添加新文档
        currentLevel.push(docItem);
    }

    // 排序items（可选：按label字母顺序排序）
    sortSidebarItems(currentLevel);
}

/**
 * 对sidebar items进行排序
 */
function sortSidebarItems(items) {
    items.sort((a, b) => {
        const getLabel = (item) => {
            if (item.type === 'doc') return item.label;
            if (item.type === 'category') return item.label;
            return '';
        };

        const labelA = getLabel(a).toLowerCase();
        const labelB = getLabel(b).toLowerCase();

        return labelA.localeCompare(labelB);
    });
}

// 使用示例
async function exampleUsage() {
    const filePath = 'studio/connect-to-studio/desktop/new-feature.md';
    const fileContent = `# 新功能说明
    
这是新功能的详细说明文档...
`;

    await updateSidebarConfig(filePath, fileContent, './sidebars.json');
}

module.exports = { updateSidebarConfig, extractFileInfo };