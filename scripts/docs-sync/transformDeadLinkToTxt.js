/**
 * 将死链转为文本
 */
const fs = require('fs');
const path = require('path');

// 1. 读取 txt 文件
const logFilePath = path.resolve(__dirname, '../../deadlink.txt');
const content = fs.readFileSync(logFilePath, 'utf-8');

// 2. 按行拆分
const lines = content.split('\n').filter(Boolean);

// 3. 正则解析
// const regex =
//   /Docs markdown link couldn't be resolved:\s*\(([^)]+)\).*?source file\s+"([^"]+)"/;

// const result = lines
//   .map(line => {
//     const match = line.match(regex);
//     if (!match) return null;

//     return {
//       deadLink: match[1],
//       sourceFile: path.relative(process.cwd(), match[2])
//     };
//   })
//   .filter(Boolean);

// const regex =
//   /^(.+?\.mdx?):\s+Could not fix broken link\s+(.+)$/;

const regex =
  /^\[NOT FOUND\]\s+(.+?)\s+->\s+(.+)$/;

const result = lines
  .map(line => {
    const match = line.match(regex);
    if (!match) return null;

    return {
      sourceFile: match[1],
      deadLink: match[2],
    };
  })
  .filter(Boolean);






/**
 * 对 deadLink + sourceFile 完全一致的项进行去重
 *
 * @param {Array<{ deadLink: string, sourceFile: string }>} list
 * @returns {Array<{ deadLink: string, sourceFile: string }>}
 */
function dedupeDeadLinks(list) {
  const seen = new Set();
  const result = [];

  for (const item of list) {
    const key = `${item.deadLink}|||${item.sourceFile}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

const unique = dedupeDeadLinks(result)
console.log('unique', unique);

/**
 * @param {Array<{deadLink: string, sourceFile: string}>} deadLinks
 */
function fixDeadLinks(deadLinks) {
  // 1. 按 sourceFile 分组
  const fileMap = new Map();

  for (const item of deadLinks) {
    if (!fileMap.has(item.sourceFile)) {
      fileMap.set(item.sourceFile, []);
    }
    fileMap.get(item.sourceFile).push(item.deadLink);
  }

  // 2. 逐文件处理
  for (const [sourceFile, links] of fileMap.entries()) {
    if (!fs.existsSync(sourceFile)) {
      console.warn(`[SKIP] File not found: ${sourceFile}`);
      continue;
    }

    let content = fs.readFileSync(sourceFile, 'utf-8');
    let original = content;

    for (const deadLink of links) {
      const escaped = escapeRegExp(deadLink);

      /**
       * 匹配：
       * ![alt](deadLink)
       * [text](deadLink)
       */
      const mdLinkRegex = new RegExp(
        `!?\\[([^\\]]+)\\]\\(\\s*${escaped}(#[^)]+)?\\s*\\)`,
        'g'
      );

      content = content.replace(mdLinkRegex, (_, text) => text);
    }

    // 3. 仅在内容变更时写回
    if (content !== original) {
      fs.writeFileSync(sourceFile, content, 'utf-8');
      console.log(`[FIXED] ${sourceFile}`);
    }
  }
}

/**
 * 转义正则特殊字符
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* =======================
   示例调用
   ======================= */

const deadLinks = [
  {
    deadLink: '../../query-acceleration/materialized-view/overview.md',
    sourceFile:
      '/Users/liyang/code/velodb-docs/enterprise_versioned_docs/version-2.1/use-guide/lakehouse/lakehouse-overview.md',
  },
];

fixDeadLinks(unique);