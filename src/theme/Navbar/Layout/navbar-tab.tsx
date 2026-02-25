import Link from "@docusaurus/Link";
import { css } from "@emotion/css";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { useThemeConfig, ErrorCauseBoundary } from "@docusaurus/theme-common";
import NavbarItem, { type Props as NavbarItemConfig } from "@theme/NavbarItem";

export function NavbarTab() {
  const items = useThemeConfig().navbar.items as NavbarItemConfig[];
  const versionItems = items.filter(
    (item) => item.type === "docsVersionDropdown"
  );
  const isBrowser = useIsBrowser();
  if (!isBrowser) {
    return null;
  }
  return (
    <div className="px-6 h-[2.75rem] lg:h-[3.75rem] fixed w-full bg-[#FFF] top-[3.75rem] lg:top-20 z-[99] border-[#DFE5F0] border-b flex justify-between">
      <div className="flex gap-x-[3rem] items-center">
        <Link
          className={`relative font-semibold h-full text-[1rem]/[2.75rem] lg:text-[1rem]/[3.75rem] ${
            location.pathname.startsWith("/cloud") ||
            location.pathname.startsWith("/ja/cloud")
              ? `text-[#0BA2FF] ${css`
                  &::before {
                    background-color: #0ba2ff;
                    width: 100%;
                    height: 3px;
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 2px;
                    border-top-left-radius: 9999px;
                    border-top-right-radius: 9999px;
                  }
                `}`
              : "text-[#1D1D1D]"
          } `}
          href="/cloud/4.x/getting-started/overview"
        >
          VeloDB Cloud
        </Link>
        <Link
          className={`relative font-semibold h-full text-[1rem]/[2.75rem] lg:text-[1rem]/[3.75rem] ${
            location.pathname.startsWith("/enterprise") ||
            location.pathname.startsWith("/ja/enterprise")
              ? `text-[#0BA2FF] ${css`
                  &::before {
                    background-color: #0ba2ff;
                    width: 100%;
                    height: 3px;
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 2px;
                    border-top-left-radius: 9999px;
                    border-top-right-radius: 9999px;
                  }
                `}`
              : "text-[#1D1D1D]"
          }`}
          href="/enterprise/2.1/getting-started/velodb-enterprise-overview"
        >
          VeloDB Enterprise
        </Link>
      </div>

      <div>
        {versionItems.map((item, i) => (
          <ErrorCauseBoundary
            key={i}
            onError={(error) =>
              new Error(
                `A theme navbar item failed to render.
        Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
        ${JSON.stringify(item, null, 2)}`,
                { cause: error }
              )
            }
          >
            <NavbarItem {...item} />
          </ErrorCauseBoundary>
        ))}
      </div>
      {/* <Link
        className={`relative font-semibold text-[1rem]/[3rem] ${
          location.pathname.startsWith("/use-cases")
            ? `text-[#0BA2FF] ${css`
                &::before {
                  background-color: #0ba2ff;
                  width: 100%;
                  height: 3px;
                  content: "";
                  position: absolute;
                  bottom: 0;
                  left: 2px;
                  border-top-left-radius: 9999px;
                  border-top-right-radius: 9999px;
                }
              `}`
            : "text-[#1D1D1D]"
        }`}
        href="/use-cases/observability/overview"
      >
        Use Cases
      </Link> */}
    </div>
  );
}
