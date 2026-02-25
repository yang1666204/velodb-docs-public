import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
const isDevelopment = process.env.NODE_ENV === "development";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "VeloDB Docs",
  tagline: "VeloDB Docs",
  favicon: "favicon/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    experimental_faster: true,
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  markdown: {
    format: "detect",
  },
  // Set the production url of your site here
  url: "https://docs.velodb.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "velodb", // Usually your GitHub org/user name.
  projectName: "velodb", // Usually your repo name.

  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja"],
  },
  plugins: [
    "docusaurus-plugin-sass",
    // "docusaurus-plugin-matomo",
    async function tailwindcssPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "cloud",
        path: "cloud",
        routeBasePath: "cloud",
        sidebarPath: require.resolve("./sidebars.json"),
        lastVersion: "current",
        versions: {
          current: { label: "hidden", banner: "none", noIndex: true },
          "4.x": {
            label: "4.x",
            path: "4.x",
            banner: "none",
          },
          "5.x-preview": {
            label: "5.x-preview", // Cloud 当前版本的显示名称
            path: "5.x-preview",
            banner: "none",
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "enterprise",
        path: "enterprise",
        routeBasePath: "enterprise",
        lastVersion: "current",
        sidebarPath: require.resolve("./sidebars.json"),
        versions: {
          current: { label: "hidden", banner: "none", noIndex: true },
          "2.1": {
            label: "2.1",
            path: "2.1",
            banner: "none",
          },
          "3.x": {
            label: "3.x", // Enterprise 当前版本的显示名称
            path: "3.x",
            banner: "none",
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        fromExtensions: ["html", "htm"],
        redirects: [
          {
            from : '/',
            to: '/cloud/4.x/getting-started/overview'
          }
        ]
      }
    ],
    [
      "posthog-docusaurus",
      {
        apiKey: isDevelopment
          ? "phc_rdIaVZeMdHnr4NJVrMQcIqKJkqG1ndYidvlgBObPvnj"
          : "phc_1mc98GkJKgSqI44AswbdVO8hT9PT2w6NS9j4U9WEUmc",
        appUrl: "https://us.i.posthog.com",
        enableInDevelopment: true,
      },
    ]
  ],
  presets: [
    [
      "classic",
      {
        // docs: {
        //   sidebarPath: "./sidebars.ts",
        //   routeBasePath: "/",
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        // },
        blog: false,
        theme: {
          customCss: require.resolve("./src/scss/custom.scss"),
        },
        sitemap:{
          ignorePatterns:[
            '/cloud/5.x-preview/**',
            '/enterprise/3.x/**'
          ]
        }
      } satisfies Preset.Options,
    ],
  ],
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        // indexPages: true,
        indexDocs: true,
        // docsRouteBasePath: ["/"],
        // docsRouteBasePath: ['enterprise/3.x','enterprise/2.1', 'cloud/4.x', 'cloud/5.x'],
        docsRouteBasePath: ["cloud", "enterprise"],
        indexBlog: false,
        explicitSearchResultPath: true,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchResultLimits: 100,
        forceIgnoreNoIndex: true
      },
    ],
  ],
  themeConfig: {
    image: "images/velodb-documentation.png",
    navbar: {
      title: "DOCUMENTATION",
      logo: {
        alt: "VeloDB Docs",
        src: "/images/icon/logo-primary-icon.svg",
        target: "_self",
        href: "/cloud/4.x/getting-started/overview",
      },
      items: [
        {
          type: "search",
          position: "left",
          className: "docs-search",
        },
        {
          type: "localeDropdown",
          position: "left",
        },
        {
          type: "docsVersionDropdown",
          docsPluginId: "cloud",
          versions: ["4.x", "5.x-preview"],
        },
        {
          type: "docsVersionDropdown",
          docsPluginId: "enterprise",
          versions: ["2.1", "3.x"],
        },
        {
          href: "https://www.velodb.io/",
          label: "velodb.io",
          position: "right",
        },
        {
          href: "https://support.velodb.io/#/vip/index?identity=velodb",
          label: "Ticketing System",
          position: "right",
        },
        {
          href: "https://www.velodb.cloud/signup",
          label: "Start Free",
          position: "right",
        },
      ],
    },
    footer: {
      logo: {
        alt: "VeloDB Logo",
        src: "/images/icon/logo-primary-icon.svg",
        height: 36,
      },
      copyright: ` © VeloDB Inc. ｜ Apache, Doris, Apache Doris, the Apache feather logo and the Apache Doris logo are trademarks of The Apache Software Foundation.`,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
    prism: {
      theme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
