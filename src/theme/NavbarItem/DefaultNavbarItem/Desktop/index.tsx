import React, { type ReactNode } from "react";
import clsx from "clsx";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import type { Props } from "@theme/NavbarItem/DefaultNavbarItem/Desktop";
import { ArrowIcon } from "@site/src/components/icons/arrow-icon";
import Link from "@docusaurus/Link";

const RIGHT_ITEMS = ["velodb.io", "Ticketing System"];
const SPECIAL_ITEM = "Start Free";

export default function DefaultNavbarItemDesktop({
  className,
  isDropdownItem = false,
  ...props
}: Props): ReactNode {
  const element = (
    <NavbarNavLink
      className={clsx(
        isDropdownItem ? "dropdown__link" : "navbar__item navbar__link",
        className
      )}
      isDropdownLink={isDropdownItem}
      {...props}
    />
  );

  if (isDropdownItem) {
    return <li>{element}</li>;
  }

  if (RIGHT_ITEMS.includes(props.label as string)) {
    return (
      <div className="flex group cursor-pointer gap-x-[6px]">
        <Link className='text-[0.75rem] lg:text-[1rem] ' href={props.href} target="_blank">
          {props.label}
        </Link>
        <span className="hidden lg:inline">
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-45  group-hover:scale-x-125 group-hover:scale-y-125" />
        </span>
      </div>
    );
  }

  if (props.label == SPECIAL_ITEM) {
    return (
      <div className="flex group cursor-pointer !px-4 py-[9px] items-center gap-x-[6px] bg-[#0BA2FF] rounded-lg text-[#FFF]">
        <Link className='text-[0.75rem] lg:text-[1rem] ' href={props.href} target="_blank">
          {props.label}
        </Link>
        <span className="hidden lg:inline">
          <ArrowIcon className="transition-transform text-[#FFF] duration-300 group-hover:translate-x-1 group-hover:rotate-45  group-hover:scale-x-125 group-hover:scale-y-125" />
        </span>
      </div>
    );
  }

  return element;
}
