import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from '../../lib/site';

interface SeoProps {
  /** Full <title> text for the page. */
  title: string;
  description: string;
  /** Route path, e.g. '/faq'. Used for the canonical and og:url tags. */
  path: string;
  /** Absolute URL of the share image. Defaults to the Pitons hero shot. */
  image?: string;
}

/**
 * Single source of truth for per-page metadata: title, description, canonical
 * URL, Open Graph and Twitter Card tags. Every public page renders one of
 * these so no page can drift onto the wrong domain or ship without a canonical.
 */
const Seo: React.FC<SeoProps> = ({ title, description, path, image = DEFAULT_OG_IMAGE }) => {
  const url = absoluteUrl(path);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default Seo;
