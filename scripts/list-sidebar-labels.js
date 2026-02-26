const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, '..', 'cloud_versioned_sidebars', 'version-4.x-sidebars.json');

const raw = fs.readFileSync(sidebarPath, 'utf8');
const sidebars = JSON.parse(raw);

const labels = new Set();

function collectLabels(item) {
  if (!item || typeof item !== 'object') return;

  if (item.type === 'category' && typeof item.label === 'string') {
    labels.add(item.label);
  }

  if (Array.isArray(item.items)) {
    item.items.forEach(collectLabels);
  }

  if (item.link && typeof item.link === 'object') {
    collectLabels(item.link);
  }
}

Object.values(sidebars).forEach((sidebarRoot) => {
  if (Array.isArray(sidebarRoot)) {
    sidebarRoot.forEach(collectLabels);
  } else {
    collectLabels(sidebarRoot);
  }
});

console.log(JSON.stringify(Array.from(labels).sort(), null, 2));

