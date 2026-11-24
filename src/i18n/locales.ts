/**
 * Single source of truth for supported languages.
 *
 * `as const` makes TypeScript infer the literal tuple ['en', 'it', 'sv'] instead of string[],
 * so `Locale` below is the union 'en' | 'it' | 'sv' and typos become compile errors.
 * Keep this in sync with `i18n.locales` in astro.config.mjs (the config file is plain JS
 * and is loaded before TS modules, so it cannot import from here).
 */
export const LOCALES = ['en', 'it', 'sv'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Labels used by the language switcher (always shown in their own language). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  sv: 'Svenska',
};

/** Order of options in the dropdown, as in the design. */
export const SWITCHER_ORDER: readonly Locale[] = ['it', 'en', 'sv'];

/** localStorage key holding the visitor's explicit language choice. */
export const LANG_STORAGE_KEY = 'lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Root URL of the home page for a locale: '/' for English, '/it/' etc. otherwise. */
export function homePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}

/** Public URL of the generated PDF for a locale. */
export function cvPdfPath(locale: Locale): string {
  // English keeps the historical file name so existing links keep working.
  return locale === DEFAULT_LOCALE
    ? '/cv/CV_AlessandroBonatti.pdf'
    : `/cv/CV_AlessandroBonatti_${locale.toUpperCase()}.pdf`;
}
