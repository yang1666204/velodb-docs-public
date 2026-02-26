const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, '..', 'cloud_versioned_sidebars', 'version-4.x-sidebars.json');

const raw = fs.readFileSync(sidebarPath, 'utf8');
const sidebars = JSON.parse(raw);

function transformArray(arr) {
  return arr.map((item) => {
    if (item && typeof item === 'object' && item.type === 'doc' && typeof item.id === 'string') {
      // In sidebar items, replace doc objects with their id string
      return item.id;
    }
    return transformNode(item);
  });
}

function transformNode(node) {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return transformArray(node);
  }

  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'items' && Array.isArray(value)) {
      result[key] = transformArray(value);
    } else {
      result[key] = transformNode(value);
    }
  }
  return result;
}

const transformed = {};
for (const [key, value] of Object.entries(sidebars)) {
  transformed[key] = transformNode(value);
}

fs.writeFileSync(sidebarPath, JSON.stringify(transformed, null, 2) + '\n');

console.log('Normalized doc items to string ids.');

