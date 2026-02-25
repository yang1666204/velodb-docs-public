#!/usr/bin/env node

/**
 * 背景：
 * 部署在 vercel 上的图片链接对于下划线_支持不好，需要将下划线替换为连字符-
 * 
 * 功能：
 * 1. 遍历 images 目录，重命名图片文件：_ → -
 * 2. 遍历 docs 目录，更新 md / mdx 中的图片引用：_ → -
 *
 * 使用：
 * node rename_images.js --docs ./docs --images ./static/images
 */

const fs = require("fs");
const path = require("path");

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"];
const MARKDOWN_EXTS = [".md", ".mdx"];

/**
 * 简单参数解析
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      result[key] = args[i + 1];
      i++;
    }
  }

  return result;
}

const args = parseArgs();
const docsDir = args.docs;
const imagesDir = args.images;

if (!docsDir || !imagesDir) {
  console.error(
    "❌ 参数错误\n用法：node normalize_images.js --docs <docsDir> --images <imagesDir>"
  );
  process.exit(1);
}

const absDocsDir = path.resolve(process.cwd(), docsDir);
const absImagesDir = path.resolve(process.cwd(), imagesDir);

if (!fs.existsSync(absDocsDir)) {
  console.error(`❌ docs 目录不存在: ${absDocsDir}`);
  process.exit(1);
}

if (!fs.existsSync(absImagesDir)) {
  console.error(`❌ images 目录不存在: ${absImagesDir}`);
  process.exit(1);
}

/**
 * 递归遍历目录
 */
function walkDir(dir, onFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, onFile);
    } else if (entry.isFile()) {
      onFile(fullPath);
    }
  }
}

/**
 * 第一步：重命名图片文件
 */
function renameImages() {
  console.log("🔍 开始重命名图片文件...");

  walkDir(absImagesDir, filePath => {
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXTS.includes(ext)) return;

    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);

    if (!baseName.includes("_")) return;

    const newName = baseName.replace(/_/g, "-") + ext;
    const newPath = path.join(dir, newName);

    if (fs.existsSync(newPath)) {
      console.warn(`⚠️ 目标文件已存在，跳过: ${newPath}`);
      return;
    }

    console.log(`🖼️  ${filePath}`);
    fs.renameSync(filePath, newPath);
  });

  console.log("✅ 图片重命名完成\n");
}

/**
 * 第二步：更新 Markdown 文档中的图片引用
 */
function updateMarkdownImageUrls() {
  console.log("🔍 开始更新 Markdown 图片引用...");

  walkDir(absDocsDir, filePath => {
    const ext = path.extname(filePath).toLowerCase();
    if (!MARKDOWN_EXTS.includes(ext)) return;

    const original = fs.readFileSync(filePath, "utf8");

    const updated = original.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, url) => {
        if (!url.includes("_")) return match;

        const newUrl = url.replace(/_/g, "-");
        return `![${alt}](${newUrl})`;
      }
    );

    if (original !== updated) {
      fs.writeFileSync(filePath, updated, "utf8");
      console.log(`📝 ${path.relative(absDocsDir, filePath)}`);
    }
  });

  console.log("✅ Markdown 图片引用更新完成\n");
}

/**
 * 主流程
 */
function main() {
  console.log("📁 Docs 目录 :", absDocsDir);
  console.log("🖼️  Images 目录:", absImagesDir);
  console.log("");

  renameImages();
  updateMarkdownImageUrls();

  console.log("🎉 全部处理完成！");
}

main();
