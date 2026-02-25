import React, { type ReactNode } from "react";
import clsx from "clsx";
import TOCItems from "@theme/TOCItems";
import type { Props } from "@theme/TOC";

import styles from "./styles.module.css";

// Using a custom className
// This prevents TOCInline/TOCCollapsible getting highlighted by mistake
const LINK_CLASS_NAME = "table-of-contents__link toc-highlight";
const LINK_ACTIVE_CLASS_NAME = "table-of-contents__link--active";

export default function TOC({ className, ...props }: Props): ReactNode {
  return (
    <div
      className={clsx(
        styles.tableOfContents,
        "thin-scrollbar",
        "toc-container",
        className
      )}
    >
      <div>
        <span className="ml-4 title-text">On This Page</span>
        <TOCItems
          {...props}
          linkClassName={LINK_CLASS_NAME}
          linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
        />
      </div>
    </div>
  );
}
