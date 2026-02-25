import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import type {Props} from '@theme/Footer/Layout';

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props): ReactNode {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, 'footer bg-[#FFF] border-t border-[#F5F5F5]', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container max-w-[1536px] container-fluid">
        {links}
        {(logo || copyright) && (
          <div className="footer__bottom items-center flex text--center">
            {logo && <div className="">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
