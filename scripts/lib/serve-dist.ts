/**
 * Lets Playwright load the *built* site (dist/) without a web server: every request to a fake
 * origin is intercepted and answered straight from disk, so absolute URLs like
 * /_astro/font.woff2 just work. Other origins (third parties) are blocked.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrowserContext, Route } from 'playwright';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DIST = path.join(ROOT, 'dist');
export const ORIGIN = 'http://site.local';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/** Maps a request URL to a file in dist/ (directories → index.html). */
async function resolveFile(url: string): Promise<string | null> {
  const { pathname } = new URL(url);
  let file = path.join(DIST, decodeURIComponent(pathname));
  if (!file.startsWith(DIST)) return null; // never escape dist/
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

async function serveFromDist(route: Route): Promise<void> {
  const file = await resolveFile(route.request().url());
  if (!file) return route.fulfill({ status: 404, body: 'Not found' });
  const contentType = MIME[path.extname(file)] ?? 'application/octet-stream';
  await route.fulfill({ body: await readFile(file), contentType });
}

/** Serve dist/ on ORIGIN for this browser context and block every other origin. */
export async function serveDist(context: BrowserContext): Promise<void> {
  try {
    await stat(path.join(DIST, 'index.html'));
  } catch {
    throw new Error('dist/ not found: run `astro build` first.');
  }
  await context.route(`${ORIGIN}/**`, serveFromDist);
  await context.route((url) => !url.href.startsWith(ORIGIN), (route) => route.abort());
}
