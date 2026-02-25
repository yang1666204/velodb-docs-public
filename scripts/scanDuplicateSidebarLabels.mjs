import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * 扫描 sidebar.json 中重复的 category label
 *
 * @param {string} jsonFilePath
 */
export function scanDuplicateSidebarLabels(jsonFilePath) {
  const raw = fs.readFileSync(jsonFilePath, 'utf-8');
  const json = JSON.parse(raw);

  const labelMap = new Map();
  // label => [{ path }]
  function dfs(items, path) {
    for (const item of items) {
      if (item?.type === 'category' && typeof item.label === 'string') {
        if (!labelMap.has(item.label)) {
          labelMap.set(item.label, []);
        }
        labelMap.get(item.label).push({ path });
      }

      if (item?.items && Array.isArray(item.items)) {
        dfs(item.items, `${path} > ${item.label ?? '[unknown]'}`);
      }
    }
  }

  for (const [key, value] of Object.entries(json)) {
    if (Array.isArray(value)) {
      dfs(value, key);
    }
  }

  // 打印重复项
  let hasDuplicate = false;

  for (const [label, entries] of labelMap.entries()) {
    if (entries.length > 1) {
      hasDuplicate = true;
      console.log(`\n⚠️  Duplicate label: "${label}"`);
      console.log(`   Count: ${entries.length}`);
      entries.forEach((e, idx) => {
        console.log(`   ${idx + 1}. ${e.path}`);
      });
    }
  }

  if (!hasDuplicate) {
    console.log('✔ No duplicate category labels found.');
  }
}

scanDuplicateSidebarLabels(path.resolve(__dirname, '../sidebarsCloud.json'))