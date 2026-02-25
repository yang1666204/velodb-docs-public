#!/usr/bin/env node
/**
 * 文档同步脚本
 * 描述：默认根据doc-map文件，全量同步更新文档内容
 *
 * 使用：syncDocs(targetMap)
 *
 *
 * 注意：未考虑 doris 的 dev 版本文档
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import {
  docsMapVerion2_1,
  docsMapVersion5_x_preview,
  cloudSidebarLabels,
} from "../../shared/doc-map.js";
import { fileURLToPath } from "url";
import { updateSidebarConfig } from "./updateSidebarConfig.js";

const VERSIONS = [
  "version-2.1",
  "version-3.x",
  "version-4.x",
  "version-5.x-preview",
];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 覆盖单个 sidebar JSON 文件
 *
 * @param {string} jsonFilePath - sidebar json 文件路径
 * @param {Array} labelItems
 */
export function overrideSidebarJsonFile(jsonFilePath, labelItems) {
  const raw = fs.readFileSync(jsonFilePath, "utf-8");
  const json = JSON.parse(raw);

  const updated = overrideSidebarByLabelItems(json, labelItems);

  fs.writeFileSync(jsonFilePath, JSON.stringify(updated, null, 2), "utf-8");
}
function overrideSidebarByLabelItems(jsonSidebar, labelItems) {
  const replaceMap = new Map(
    labelItems.map((item) => [item.targetLabel, item])
  );

  function dfs(items) {
    return items.map((item) => {
      if (item.type === "category") {
        // 命中 targetLabel：整体替换
        if (replaceMap.has(item.label)) {
          const { targetLabel, ...rest } = replaceMap.get(item.label);
          return {
            ...rest,
            label: targetLabel,
            items: rest.items ?? [],
          };
        }

        // 未命中，递归
        return {
          ...item,
          items: Array.isArray(item.items) ? dfs(item.items) : item.items,
        };
      }

      return item;
    });
  }

  const result = {};

  for (const [key, value] of Object.entries(jsonSidebar)) {
    result[key] = Array.isArray(value) ? dfs(value) : value;
  }

  return result;
}

/**
 * todo:
 * 1. 按照文档名覆盖
 * 2. sidebar 目录顺序
 * 3.使用 doris 的 label
 * 3. 死链检查和修复
 * 4. 搜索
 * 5. 文档ui
 * 6. 图片路径格式检查并修复（下划线变连字符）
 * 7. 除了 cloud 和 enterprise 以外的文档如何处理
 * 8. 上线前 url 重定向
 */
class LightweightDocSync {
  constructor() {
    // this.githubToken = process.env.GITHUB_TOKEN;
    this.githubToken =
      "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";
    // doris 的 sidebar 配置文件 格式：json
    this.sourceSidebarConfig = {};
  }

  /**
   * 新的调用方式：通过函数调用传参（首选）
   * syncTool.main(sourceFileUrl, targetFileUrl, { branch, dryRun, force, token })
   *
   * 兼容回退：在命令行中仍可以 two-arg 形式运行：
   * node scripts/doc_sync.js <sourceFileUrl> <targetFileUrl>
   *
   * 仓库固定为：https://github.com/apache/doris-website.git
   */
  async main(sourceFileUrl, targetFileUrl, opts = {}, exclude = []) {
    try {
      console.log(chalk.blue("🚀 开始文档同步...\n"));
      // 固定仓库地址
      const fixedRepo = "https://github.com/apache/doris-website.git";

      // 优先使用函数传参；不提供则尝试从命令行参数读取
      let source = sourceFileUrl;
      let target = targetFileUrl;
      if (!source || !target) {
        const args = process.argv.slice(2);
        if (args.length >= 2) {
          source = args[0];
          target = args[1];
        }
      }

      if (!source || !target) {
        throw new Error(
          '请提供 sourceFileUrl 与 targetFileUrl。示例：syncTool.main("versioned_docs/...", "docs/...") 或 node scripts/doc_sync.js <source> <target>'
        );
      }

      let sourceSidebarPath = "";
      // 获取 sidebar 配置
      if (source.includes("version-2.1")) {
        sourceSidebarPath = "versioned_sidebars/version-2.1-sidebars.json";
      } else if (source.includes("version-3.x")) {
        sourceSidebarPath = "versioned_sidebars/version-3.x-sidebars.json";
      } else if (source.includes("version-4.x")) {
        sourceSidebarPath = "versioned_sidebars/version-4.x-sidebars.json";
      }

      const options = {
        source,
        target,
        branch: opts.branch || "master",
        dryRun: !!opts.dryRun,
        force: !!opts.force || true, // 强制覆盖 默认开启
        token: opts.token || process.env.GITHUB_TOKEN,
        sidebarPath: opts.sidebarPath, // 当前仓库的 sidebar 目录
        sourceSidebarPath,
      };

      // 解析固定仓库信息
      const repoInfo = this.parseRepoUrl(fixedRepo);
      if (!repoInfo) {
        throw new Error("固定的GitHub仓库URL无效: " + fixedRepo);
      }

      // 设置Token
      if (options.token) {
        this.githubToken = options.token;
      }

      if (!this.githubToken) {
        console.log(chalk.yellow("⚠️  未提供GitHub Token，可能会有API限制"));
      }

      // 获取需要同步的 文档/目录 对应的 sidebars.json
      // await this.updateSidebar(repoInfo, options);
      // return
      // 执行同步
      await this.syncWithAPI(repoInfo, options, exclude);

      console.log(chalk.green("\n✅ 文档同步完成!"));
    } catch (error) {
      console.error(chalk.red("\n❌ 同步失败:"), error.message);
      process.exit(1);
    }
  }

  parseRepoUrl(url) {
    // 支持多种格式的GitHub URL
    const patterns = [
      /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/,
      /https:\/\/github\.com\/([^/]+)\/([^/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(".git", ""),
        };
      }
    }
    return null;
  }

  async writeFile(localPath, fileInfo, repoInfo, options) {
    // 小文件直接使用API内容
    const response = await this.apiRequest(fileInfo.url);
    const fileData = await response.json();

    if (fileData.encoding === "base64") {
      const content = Buffer.from(fileData.content, "base64");
      const filename = localPath.split("/")[localPath.split("/").length - 1];
      const newLocalPath = localPath.replace(
        filename,
        filename.replace(/_/g, "-")
      );
      await fs.ensureDir(path.dirname(newLocalPath));
      
      // 下载图片并获取更新后的内容（图片路径中的下划线已替换为连字符）
      const updatedContent = await this.downloadImage(content, repoInfo, options);
      
      // 使用更新后的内容写入文件
      await fs.writeFile(newLocalPath, updatedContent);
      console.log("newLocalPath", newLocalPath);
      const [_doc, _version, ...pathArr] = newLocalPath.split("/");
    } else {
      throw new Error(`不支持的编码格式: ${fileData.encoding}`);
    }
  }

  async fetchSidebarConfig(repoInfo, options) {
    const { owner, repo } = repoInfo;
    const apiBase = "https://api.github.com";

    console.log(chalk.blue(`📡 连接GitHub API获取sidebar配置...`));
    const dirUrl = `${apiBase}/repos/${owner}/${repo}/contents/${options.sourceSidebarPath}?ref=${options.branch}`;
    try {
      const response = await this.apiRequest(dirUrl);
      const fileData = await response.json();
      if (fileData.encoding === "base64") {
        const content = Buffer.from(fileData.content, "base64").toString(
          "utf-8"
        );
        console.log("content", typeof content);
        return JSON.parse(content);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  // 覆盖当前的 sidebar 配置
  async updateSidebar(repoInfo, options) {
    const dorisSidebarConfig = await this.fetchSidebarConfig(repoInfo, options);
    console.log("dorisSidebarConfig", dorisSidebarConfig);
    for (let labels of cloudSidebarLabels) {
      let sidebarItems = this.findSidebarItemsByLabelMappings(
        labels.labelList,
        dorisSidebarConfig.docs
      );
      if (labels.topLevelId) {
        sidebarItems = this.addPrefixToSidebarStrings(
          sidebarItems,
          `${labels.topLevelId}/`
        );
      }
      for (let newItem of sidebarItems) {
        for (let labelItem of labels.labelList) {
          if (labelItem.sourceLabel === newItem.label) {
            newItem.targetLabel = labelItem.targetLabel;
          }
        }
      }
      console.log("sidebarItems", sidebarItems);
      overrideSidebarJsonFile(path.resolve(options.sidebarPath), sidebarItems);
    }
  }

  /**
   * 根据 sourceLabel 从 sidebar 中查找对应的 category item
   * @param {{ sourceLabel: string, targetLabel: string }[]} labelMappings
   * @param {Array} sidebar
   * @returns {Array} 与 labelMappings 顺序一致的 sidebar item 数组（未命中为 null）
   */
  findSidebarItemsByLabelMappings(labelMappings, sidebar) {
    const sourceLabelSet = new Set(labelMappings.map((m) => m.sourceLabel));

    const resultMap = new Map();

    function dfs(items) {
      for (const item of items) {
        if (item.type === "category" && sourceLabelSet.has(item.label)) {
          if (!resultMap.has(item.label)) {
            resultMap.set(item.label, item);
          }
        }

        if (item.items && item.items.length) {
          dfs(item.items);
        }
      }
    }

    dfs(sidebar);

    return labelMappings.map(
      ({ sourceLabel }) => resultMap.get(sourceLabel) || null
    );
  }

  /**
   * 为 sidebar 中所有字符串 item 添加前缀
   * @param {Array} sidebar
   * @param {string} prefix
   * @returns {Array} 新的 sidebar
   */
  addPrefixToSidebarStrings(sidebar, prefix) {
    return sidebar.map((item) => {
      // 字符串类型（doc id）
      if (typeof item === "string") {
        return `${prefix}${item}`;
      }

      // category 或其他对象
      if (typeof item === "object" && item !== null) {
        return {
          ...item,
          items: Array.isArray(item.items)
            ? this.addPrefixToSidebarStrings(item.items, prefix)
            : item.items,
        };
      }

      // 兜底（理论上不会发生）
      return item;
    });
  }

  async syncWithAPI(repoInfo, options, exclude) {
    const { owner, repo } = repoInfo;
    const apiBase = "https://api.github.com";

    console.log(chalk.blue(`📡 连接GitHub API获取目录结构...`));

    // 获取指定目录的内容
    const dirUrl = `${apiBase}/repos/${owner}/${repo}/contents/${options.source}?ref=${options.branch}`;
    console.log("dirUrl", dirUrl);

    try {
      const response = await this.apiRequest(dirUrl);
      const contents = await response.json();
      if (!Array.isArray(contents)) {
        // 单文件情况：如果是 md / mdx 则支持同步到 target（覆盖或放入目录）
        if (contents.type === "file") {
          const ext = path.extname(contents.name).toLowerCase();
          const isMarkdown = ext === ".md" || ext === ".mdx";
          if (!isMarkdown) {
            throw new Error(
              `路径 ${options.source} 不是一个目录 且不是 md/mdx 文件`
            );
          }

          // 判断 target 是目录还是文件（如果带有 md/mdx 后缀则视作文件）
          const targetExt = path.extname(options.target).toLowerCase();
          const targetLooksLikeFile =
            targetExt === ".md" || targetExt === ".mdx";

          if (targetLooksLikeFile) {
            // 目标是具体文件路径 -> 写到该文件（覆盖或跳过）
            const localPath = path.resolve(options.target);
            const parentDir = path.dirname(localPath);
            await fs.ensureDir(parentDir);

            if ((await fs.pathExists(localPath)) && !options.force) {
              if (options.dryRun) {
                console.log(
                  chalk.yellow(
                    `○ ${contents.path} (已存在，将覆盖目标文件 ${localPath} 但处于试运行，未实际写入)`
                  )
                );
                return;
              }
              console.log(
                chalk.yellow(
                  `○ ${contents.path} (目标文件 ${localPath} 已存在，跳过)`
                )
              );
              return;
            }

            if (options.dryRun) {
              console.log(
                chalk.cyan(
                  `[试运行] 将会下载: ${contents.path} -> ${localPath}`
                )
              );
              return;
            }

            // 真正写入
            if (contents.size > 1000000) {
              const downloadUrl = contents.download_url;
              if (!downloadUrl) {
                throw new Error("文件过大且无下载链接");
              }
              const resp = await fetch(downloadUrl);
              const buf = await resp.buffer();
              await fs.writeFile(localPath, buf);
            } else {
              await this.writeFile(localPath, contents, repoInfo, options);
              //   const resp = await this.apiRequest(contents.url);
              //   const fileData = await resp.json();
              //   if (fileData.encoding === "base64") {
              //     const buf = Buffer.from(fileData.content, "base64");
              //     console.log("options.target", options.target);

              //     const [_doc, _version, ...pathArr] = options.target.split("/");
              //     let docPath = "";
              //     if (VERSIONS.includes(_version)) {
              //       if (localPath.includes("enterprise_versioned_docs")) {
              //         docPath = ["enterprise", ...pathArr].join("/");
              //       } else if (localPath.includes("cloud_versioned_docs")) {
              //         docPath = ["cloud", ...pathArr].join("/");
              //       } else {
              //         docPath = pathArr.join("/");
              //       }
              //     } else {
              //       docPath = [_doc, _version, ...pathArr].join("/");
              //     }
              //     console.log("docPath", docPath);

              //     // 不需要在这里更新 sidebar 配置，改为分步进行：1、文档写入 2、把 doris 的 sidebar 配置切过来用
              //     // 更新sidebar配置
              //     // updateSidebarConfig(docPath, buf.toString('utf-8'), path.resolve(process.cwd(), options.sidebarPath), this.sourceSidebarConfig);
              //     await fs.writeFile(localPath, buf);
              //     // 下载对应图片
              //     await this.downloadImage(buf, repoInfo, options);
              //   } else {
              //     throw new Error(`不支持的编码格式: ${fileData.encoding}`);
              //   }
            }

            console.log(
              chalk.green(`✓ 已将 ${contents.path} 同步到文件 ${localPath}`)
            );
            return;
          } else {
            // 目标是目录 -> 确保目录存在并将文件放入该目录
            const targetDir = path.resolve(options.target);
            await fs.ensureDir(targetDir);

            // 调用已有的 downloadFile，将文件写入目录下（若已存在且非强制则跳过）
            const result = await this.downloadFile(
              contents,
              repoInfo,
              targetDir,
              options
            );
            if (result === "success") {
              console.log(
                chalk.green(`✓ 已将 ${contents.path} 同步到目录 ${targetDir}`)
              );
            } else {
              console.log(chalk.yellow(`○ ${contents.path} (已存在，跳过)`));
            }
            return;
          }
        }

        throw new Error(`路径 ${options.source} 不是一个目录`);
      }

      console.log(chalk.green(`✓ 找到目录，包含 ${contents.length} 个条目`));

      // 递归下载所有文档文件
      await this.downloadContents(
        contents,
        repoInfo,
        options.source,
        options.target,
        options,
        exclude
      );
    } catch (error) {
      if (error.message.includes("404")) {
        throw new Error(`目录不存在: ${options.source}`);
      }
      throw error;
    }
  }

  async apiRequest(url) {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Doc-Sync-Tool",
    };

    if (this.githubToken) {
      headers["Authorization"] = `token ${this.githubToken}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("API限制，请提供GitHub Token");
      } else if (response.status === 404) {
        throw new Error("资源未找到");
      } else {
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}`
        );
      }
    }

    return response;
  }

  async downloadContents(
    contents,
    repoInfo,
    sourcePath,
    targetPath,
    options,
    exclude
  ) {
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const item of contents) {
      try {
        if (exclude.includes(item.path)) {
          console.log(chalk.yellow(`○ ${item.path} (在排除列表中，跳过)`));
          skipCount++;
          continue;
        }
        if (item.type === "file") {
          const result = await this.downloadFile(
            item,
            repoInfo,
            targetPath,
            options
          );
          if (result === "success") {
            successCount++;
            console.log(chalk.green(`✓ ${item.path}`));
          } else {
            skipCount++;
          }
        } else if (item.type === "dir") {
          // 递归处理子目录
          const subDirUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${item.path}?ref=${options.branch}`;
          const subResponse = await this.apiRequest(subDirUrl);
          const subContents = await subResponse.json();

          const subTargetPath = path.join(targetPath, item.name);
          await fs.ensureDir(path.dirname(subTargetPath));

          await this.downloadContents(
            subContents,
            repoInfo,
            item.path,
            subTargetPath,
            options,
            exclude
          );
        }
      } catch (error) {
        errorCount++;
        console.log(chalk.red(`✗ ${item.path}: ${error.message}`));
      }
    }

    console.log(
      chalk.blue(
        `📊 当前目录统计: 成功 ${successCount}, 跳过 ${skipCount}, 失败 ${errorCount}`
      )
    );
  }

  async downloadImage(content, repoInfo, options) {
    // 读取文档中的图片url，下载图片到本地
    let fileText = content.toString("utf-8");
    const imageUrlPattern = /!\[([^\]]*)\]\(\/images\/([^)]+)\)/g;
    let match;
    const images = [];
    
    // 辅助函数：将路径中的下划线替换为连字符
    const replaceUnderscoresWithHyphens = (filePath) => {
      return filePath.split('/').map(segment => {
        // 分离文件名和扩展名
        const lastDotIndex = segment.lastIndexOf('.');
        if (lastDotIndex > 0) {
          const name = segment.substring(0, lastDotIndex);
          const ext = segment.substring(lastDotIndex);
          return name.replace(/_/g, '-') + ext;
        }
        // 没有扩展名的情况（目录名）
        return segment.replace(/_/g, '-');
      }).join('/');
    };
    
    // 收集所有需要替换的图片引用
    const replacements = [];
    
    while ((match = imageUrlPattern.exec(fileText)) !== null) {
      const fullMatch = match[0]; // 完整匹配：![描述](/images/xxx.jpg)
      const altText = match[1]; // 图片描述文本
      const imagePath = match[2]; // 图片路径（你需要的地址部分）
      const fullImageUrl = `/images/${imagePath}`; // 完整图片URL

      images.push({
        fullMatch,
        altText,
        imagePath,
        fullImageUrl,
      });
      
      // 原始路径（用于从 GitHub 下载）
      const originalLocalFilePath = `static${fullImageUrl}`;
      // 转换后的路径（下划线替换为连字符，用于本地保存）
      const convertedImagePath = replaceUnderscoresWithHyphens(imagePath);
      const convertedFullImageUrl = `/images/${convertedImagePath}`;
      const localFilePath = `static${convertedFullImageUrl}`;
      
      console.log("图片完整URL:", fullImageUrl);
      console.log("转换后本地路径:", localFilePath);
      
      // 记录需要替换的内容
      replacements.push({
        original: fullMatch,
        replacement: `![${altText}](${convertedFullImageUrl})`
      });
      
      // 从 GitHub 下载时使用原始路径
      const imgResponse = await this.apiRequest(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/static${fullImageUrl}?ref=${options.branch}`
      );
      const imgContentData = await imgResponse.json();

      try {
        if (imgContentData.encoding === "base64") {
          // 兼容文本文件情况
          const imgBuffer = Buffer.from(imgContentData.content, "base64");
          await fs.ensureDir(path.dirname(localFilePath));
          await fs.writeFile(localFilePath, imgBuffer);
        } else if (imgContentData.download_url) {
          // 通过 download_url 直接获取二进制内容
          const downloadResp = await fetch(imgContentData.download_url, {
            headers: {
              Accept: "application/vnd.github.v3.raw",
              Authorization: `token ${this.githubToken}`,
            },
          });

          const imgBuffer = Buffer.from(await downloadResp.arrayBuffer());

          await fs.ensureDir(path.dirname(localFilePath));
          await fs.writeFile(localFilePath, imgBuffer);
        } else {
          throw new Error(`无法处理图片，encoding: ${imgContentData.encoding}`);
        }
      } catch (err) {
        console.log(
          chalk.red(`无法处理图片，encoding: ${imgContentData.encoding}`)
        );
        console.log("err", err);
      }
    }
    
    // 更新 markdown 内容中的图片引用路径
    // 使用正则表达式进行全局替换，确保所有匹配项都被替换
    for (const { original, replacement } of replacements) {
      // 转义特殊字符，用于正则表达式匹配
      const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOriginal, 'g');
      fileText = fileText.replace(regex, replacement);
    }
    
    // 返回更新后的内容
    return Buffer.from(fileText, "utf-8");
  }

  async downloadFile(fileInfo, repoInfo, targetPath, options) {
    const fileName = fileInfo.name;
    const localPath = path.join(targetPath, fileName);

    // 检查是否是文档文件
    if (!this.isDocumentFile(fileName)) {
      return "skip";
    }

    // 检查文件是否已存在
    if ((await fs.pathExists(localPath)) && !options.force) {
      if (options.dryRun) {
        console.log(chalk.yellow(`○ ${fileInfo.path} (已存在，跳过)`));
        return "skip";
      }
      return "skip";
    }

    if (options.dryRun) {
      console.log(
        chalk.cyan(`[试运行] 将会下载: ${fileInfo.path} -> ${localPath}`)
      );
      return "success";
    }

    // 下载文件内容
    if (fileInfo.size > 1000000) {
      // 1MB以上文件使用下载URL
      const downloadUrl = fileInfo.download_url;
      if (!downloadUrl) {
        throw new Error("文件过大且无下载链接");
      }

      const response = await fetch(downloadUrl);
      const content = await response.buffer();
      await fs.writeFile(localPath, content);
    } else {
      await this.writeFile(localPath, fileInfo, repoInfo, options);
    }

    return "success";
  }

  isDocumentFile(fileName) {
    const docExtensions = [
      ".md",
      ".mdx",
      ".markdown",
      ".txt",
      ".rst",
      ".html",
      ".htm",
      ".pdf",
      ".doc",
      ".docx",
      ".json",
      ".yaml",
      ".yml",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
    ];

    const ext = path.extname(fileName).toLowerCase();
    return docExtensions.includes(ext);
  }
}

const syncTool = new LightweightDocSync();

export async function syncDocs(targetMap, sidebarPath) {
  if (Array.isArray(targetMap)) {
    for (let docsMapItem of targetMap) {
      await syncTool.main(
        docsMapItem.source,
        docsMapItem.target,
        { sidebarPath },
        docsMapItem.exclude
      );
    }
  } else {
    for (let docsMapItem of docsMapVersion5_x_preview) {
      await syncTool.main(
        docsMapItem.source,
        docsMapItem.target,
        { sidebarPath },
        docsMapItem.exclude
      );
    }
  }
}
