import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  /** A schema.org object, or an array of them, to embed as JSON-LD. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Emits structured data as <script type="application/ld+json">.
 *
 * Rendered through Helmet so the tag is captured by the build-time
 * prerenderer (src/entry-server.tsx collects helmet.script), which means
 * crawlers and AI engines receive the schema in the static HTML rather than
 * only after JavaScript executes.
 */
const JsonLd: React.FC<JsonLdProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  </Helmet>
);

export default JsonLd;
