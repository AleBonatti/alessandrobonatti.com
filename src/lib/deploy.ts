/**
 * Which deployment is this build for? Decided by `site` in astro.config.mjs, which reads the
 * SITE_URL environment variable. Only the production origin is indexed and tracked;
 * any other origin (staging, a local preview…) gets noindex, no analytics and a blocking robots.txt.
 */
export const PRODUCTION_SITE = 'https://alessandrobonatti.com';

export function isProductionSite(site: URL | undefined): boolean {
  return site?.origin === new URL(PRODUCTION_SITE).origin;
}
