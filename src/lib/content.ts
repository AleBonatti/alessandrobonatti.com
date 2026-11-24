import { getEntry } from 'astro:content';
import type { SiteContent } from '../content.config';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/locales';

/**
 * Keys whose values must be identical in every language: they are data, not prose.
 * If en.yaml says a tile uses icon "vue", it.yaml and sv.yaml must too.
 */
const INVARIANT_KEYS = new Set(['icon', 'url', 'years', 'code', 'letter']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Walks two content trees in parallel and collects structural differences.
 * Uses `unknown` + type guards instead of `any`: TypeScript forces us to check
 * what each value is before touching it.
 */
function diffStructure(reference: unknown, other: unknown, path: string, issues: string[]): void {
  if (Array.isArray(reference)) {
    if (!Array.isArray(other)) {
      issues.push(`${path}: expected a list`);
      return;
    }
    if (reference.length !== other.length) {
      issues.push(`${path}: ${reference.length} items in "${DEFAULT_LOCALE}", ${other.length} here`);
    }
    const n = Math.min(reference.length, other.length);
    for (let i = 0; i < n; i++) diffStructure(reference[i], other[i], `${path}[${i}]`, issues);
    return;
  }
  if (isRecord(reference) && isRecord(other)) {
    for (const key of Object.keys(reference)) {
      const childPath = path ? `${path}.${key}` : key;
      if (INVARIANT_KEYS.has(key) && reference[key] !== other[key]) {
        issues.push(`${childPath}: "${String(other[key])}" should be "${String(reference[key])}"`);
      }
      diffStructure(reference[key], other[key], childPath, issues);
    }
    // Optional keys (e.g. a tile's icon) present here but missing in the reference.
    for (const key of Object.keys(other)) {
      if (!(key in reference) && INVARIANT_KEYS.has(key)) {
        issues.push(`${path}.${key}: not present in "${DEFAULT_LOCALE}"`);
      }
    }
  }
}

let checked = false;

async function loadEntry(locale: Locale): Promise<SiteContent> {
  const entry = await getEntry('site', locale);
  if (!entry) throw new Error(`Missing content file: src/content/site/${locale}.yaml`);
  return entry.data;
}

/** Runs once per build: compares every locale against the default one. */
async function assertLocalesConsistent(): Promise<void> {
  if (checked) return;
  const reference = await loadEntry(DEFAULT_LOCALE);
  const problems: string[] = [];
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const issues: string[] = [];
    diffStructure(reference, await loadEntry(locale), '', issues);
    problems.push(...issues.map((issue) => `  [${locale}] ${issue}`));
  }
  if (problems.length > 0) {
    throw new Error(`Content structure differs between languages:\n${problems.join('\n')}`);
  }
  checked = true;
}

/** Typed content for one language. This is what pages call. */
export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  await assertLocalesConsistent();
  return loadEntry(locale);
}
