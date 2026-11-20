/**
 * robots.txt as an *endpoint*: a .ts file in src/pages exporting GET. In a static build Astro calls
 * it once and writes the returned body to dist/robots.txt (file extensions in the route name are kept).
 * Unlike a file in public/, it can depend on the build: staging blocks every crawler.
 */
import type { APIRoute } from 'astro';
import { PRODUCTION_SITE, isProductionSite } from '../lib/deploy';

export const GET: APIRoute = ({ site }) => {
  const body = isProductionSite(site)
    ? ['User-agent: *', 'Disallow: /print/', '', `Sitemap: ${new URL('/sitemap-index.xml', site ?? PRODUCTION_SITE).href}`]
    : ['# Staging build: not for search engines.', 'User-agent: *', 'Disallow: /'];
  return new Response(body.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
