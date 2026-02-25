import Head from '@docusaurus/Head';
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';

export default function SeoControl() {
  const version = useDocsVersion();
 console.log('version',version.version)
  const isIndexable = version.version === '4.x' || version.version === '2.1'; // 或 '5.x'

  return (
    <Head>
      {!isIndexable && (
        <meta name="robots" content="noindex, follow" />
      )}
    </Head>
  );
}
