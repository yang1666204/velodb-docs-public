#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const IMAGE_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.avif',
]);

const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Usage: node rename-images-underscore-to-dash.js <relative-image-dir>');
  process.exit(1);
}

const ROOT = path.resolve(process.cwd(), targetDir);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    if (!entry.name.includes('_')) continue;

    const newName = entry.name.replace(/_/g, '-');
    const newPath = path.join(dir, newName);

    if (fs.existsSync(newPath)) {
      console.warn(`[SKIP] Target exists: ${newPath}`);
      continue;
    }

    fs.renameSync(fullPath, newPath);
    console.log(`[RENAME] ${entry.name} -> ${newName}`);
  }
}

if (!fs.existsSync(ROOT)) {
  console.error(`Directory not found: ${ROOT}`);
  process.exit(1);
}

walk(ROOT);
console.log('\nDone.');
