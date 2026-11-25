// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { PRODUCTION_SITE } from './src/lib/deploy.ts';

// https://astro.build/config
export default defineConfig({
  // Absolute URL of the site: used for canonical/hreflang URLs, og:url, the sitemap and robots.txt.
  // Production by default; CI sets SITE_URL=https://dev.alessandrobonatti.com for staging builds,
  // which also turns on noindex and a blocking robots.txt (see src/lib/deploy.ts).
  // The config file runs in Node, so process.env is available here.
  site: process.env.SITE_URL || PRODUCTION_SITE,

  // Pages are built as folders (dist/it/index.html), so their real URL ends with "/" and the
  // canonical/hreflang/sitemap URLs do too. 'ignore' only makes the *dev server* accept both
  // /it and /it/ (with 'always' it returns 404 for /it); the build output is identical.
  // In production the web server redirects /it → /it/ (see public/.htaccess).
  trailingSlash: 'ignore',

  // Astro's built-in i18n routing. English lives at "/", the others under "/it/" and "/sv/".
  // This config powers `Astro.currentLocale` and the helpers in `astro:i18n`.
  i18n: {
    locales: ['en', 'it', 'sv'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    // Enables React components as "islands" (only hydrated where we ask for it).
    react(),
    // Generates sitemap-index.xml with hreflang alternates; print and 404 pages are excluded.
    sitemap({
      filter: (page) => !page.includes('/print/') && !page.includes('/404'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', it: 'it', sv: 'sv' },
      },
    }),
  ],

  // Fonts API: downloads the Google Fonts at build time and self-hosts them,
  // so visitors' browsers never contact Google (GDPR-friendlier, one less DNS hop).
  // It also generates metric-matched fallback fonts to reduce layout shift.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter Tight',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
    // Only for the /seppia-cms/ page (it has its own look). Fonts are emitted only on pages
    // that render <Font cssVariable="…">, so the main site never downloads this one.
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-seppia',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
});
