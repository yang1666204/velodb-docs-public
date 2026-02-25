#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const commit = process.argv[2];
if (!commit) {
  console.error("Usage: node seo_checker.js <commit>");
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

/**
 * 校验 h1 数量（只能有一个）
 */
function checkHeadingH1(content, errors) {
    // 移除 frontMatter
    const body = content.replace(/^---[\s\S]*?---/, "");
  
    // 匹配 Markdown h1（"# " 开头，且不是 "##"）
    const h1Matches = body.match(/^#\s+.+/gm) || [];
  
    if (h1Matches.length > 1) {
      errors.push(
        `[heading] multiple h1 detected (${h1Matches.length}): ${h1Matches.join(
          " | "
        )}`
      );
    }
  }
  

/**
 * 获取新增 / 修改的 md/mdx 文件
 */
function getChangedDocs(commit) {
  const output = run(
    `git diff-tree --no-commit-id --name-status -r ${commit}`
  );

  return output
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [status, file] = line.split(/\s+/);
      return { status, file };
    })
    .filter(
      ({ status, file }) =>
        (status === "A" || status === "M") &&
        /\.(md|mdx)$/.test(file)
    );
}

/**
 * 判断字符串是否包含中文
 */
function hasChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 校验 frontMatter（JSON）
 */
function checkFrontMatter(file, content, errors) {
  if (!content.startsWith("---")) {
    errors.push(`[frontMatter] missing frontMatter`);
    return;
  }

  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) {
    errors.push(`[frontMatter] invalid frontMatter format`);
    return;
  }

  let fm;
  try {
    fm = JSON.parse(match[1]);
  } catch (e) {
    errors.push(`[frontMatter] frontMatter is not valid JSON`);
    return;
  }

  const { title, description } = fm;

  if (!title) {
    errors.push(`[frontMatter] title is missing or empty`);
  }

  if (!description) {
    errors.push(`[frontMatter] description is missing or empty`);
  }

  if (title) {
    if (hasChinese(title)) {
      if (title.length >= 30) {
        errors.push(`[frontMatter] title (CN) length >= 30`);
      }
    } else {
      if (title.length >= 65) {
        errors.push(`[frontMatter] title (EN) length >= 65`);
      }
    }
  }

  if (description) {
    if (hasChinese(description)) {
      if (description.length >= 70) {
        errors.push(`[frontMatter] description (CN) length >= 70`);
      }
    } else {
      if (description.length >= 156) {
        errors.push(`[frontMatter] description (EN) length >= 156`);
      }
    }
  }
}

/**
 * 校验图片 alt
 */
function checkImageAlt(content, errors) {
  // Markdown 图片
  const mdImages = content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
  for (const match of mdImages) {
    const alt = match[1].trim();
    if (!alt) {
      errors.push(`[image] markdown image alt is empty: ${match[0]}`);
    }
  }

  // HTML img
  const htmlImages = content.matchAll(/<img\s+[^>]*>/gi);
  for (const match of htmlImages) {
    const tag = match[0];
    const altMatch = tag.match(/alt\s*=\s*["']([^"']*)["']/i);
    if (!altMatch || !altMatch[1].trim()) {
      errors.push(`[image] html img alt is missing or empty: ${tag}`);
    }
  }
}

/**
 * 校验图片 URL 不包含下划线
 */
function checkImageUrlNoUnderscore(content, errors) {
  // Markdown 图片
  const mdImages = content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of mdImages) {
    const url = match[1].trim();
    if (url.includes("_")) {
      errors.push(`[image] markdown image url contains "_": ${url}`);
    }
  }

  // HTML img
  const htmlImages = content.matchAll(/<img\s+[^>]*>/gi);
  for (const match of htmlImages) {
    const tag = match[0];
    const srcMatch = tag.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1].includes("_")) {
      errors.push(`[image] html img src contains "_": ${srcMatch[1]}`);
    }
  }
}

/**
 * 校验文件名
 */
function checkFileName(file, errors) {
  const base = path.basename(file);
  if (base.includes("_")) {
    errors.push(`[filename] filename contains "_"`);
  }
}

function main() {
  const files = getChangedDocs(commit);

  if (files.length === 0) {
    console.log("SEO Checker: no md/mdx changes detected.");
    return;
  }

  let hasError = false;

  for (const { file } of files) {
    const absPath = path.resolve(file);
    if (!fs.existsSync(absPath)) {
      continue;
    }

    const content = fs.readFileSync(absPath, "utf-8");
    const errors = [];

    checkFileName(file, errors);
    checkFrontMatter(file, content, errors);
    // checkHeadingH1(content, errors);
    checkImageAlt(content, errors);
    checkImageUrlNoUnderscore(content, errors);

    if (errors.length > 0) {
      hasError = true;
      console.error(`\n[SEO ERROR] ${file}`);
      for (const err of errors) {
        console.error(`  - ${err}`);
      }
    }
  }

  if (hasError) {
    console.error("\nSEO check failed.");
    process.exit(1);
  } else {
    console.log("SEO check passed.");
  }
}

main();
