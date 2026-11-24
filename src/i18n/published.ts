/**
 * Which languages are public on *this* build.
 *
 * A language listed in UNRELEASED_LOCALES is fully written and validated (its YAML must still
 * match the others), but production leaves it out: no pages, no switcher entry, no hreflang,
 * no browser-language redirect, no PDF. Staging (dev.alessandrobonatti.com) builds every
 * language, so a reviewer can check it there before it goes live.
 * To release a language, remove it from UNRELEASED_LOCALES.
 *
 * Kept apart from locales.ts on purpose: this module reads import.meta.env, which only exists
 * inside Astro/Vite, while locales.ts is also imported by plain Node scripts (generate-pdf.ts).
 */
import { LOCALES, type Locale } from './locales';
import { isProductionSite } from '../lib/deploy';

export const UNRELEASED_LOCALES: readonly Locale[] = ['sv'];

// import.meta.env.SITE is the `site` from astro.config.mjs (production URL unless SITE_URL is set),
// available in every module, including getStaticPaths() where Astro.site is not.
// The dev server uses the production URL too, so `npm run dev` shows what production will;
// run `SITE_URL=https://dev.alessandrobonatti.com npm run dev` to see every language locally.
const production = isProductionSite(new URL(import.meta.env.SITE));

export const PUBLISHED_LOCALES: readonly Locale[] = production
  ? LOCALES.filter((locale) => !UNRELEASED_LOCALES.includes(locale))
  : LOCALES;
