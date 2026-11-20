/**
 * Renders the print pages (/print/<locale>/) of the *built* site into PDFs:
 *   dist/cv/CV_AlessandroBonatti.pdf      (English, historical file name)
 *   dist/cv/CV_AlessandroBonatti_IT.pdf
 *   dist/cv/CV_AlessandroBonatti_SV.pdf
 *
 * Runs after `astro build` (see package.json), so the PDFs always match the HTML.
 * No web server needed: Playwright intercepts every request to a fake origin and answers
 * it straight from dist/ (absolute URLs like /_astro/font.woff2 just work).
 *
 * Run directly with Node ≥ 22.18, which strips TypeScript types natively:
 *   node scripts/generate-pdf.ts
 */
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Route } from 'playwright';
import { LOCALES, cvPdfPath } from '../src/i18n/locales.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'http://cv.local';

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

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await context.route(`${ORIGIN}/**`, serveFromDist);
    // Anything else (third parties) is blocked: the print page shouldn't need it.
    await context.route((url) => !url.href.startsWith(ORIGIN), (route) => route.abort());

    const page = await context.newPage();
    await page.emulateMedia({ media: 'print' });

    for (const locale of LOCALES) {
      await page.goto(`${ORIGIN}/print/${locale}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const output = path.join(DIST, cvPdfPath(locale));
      await mkdir(path.dirname(output), { recursive: true });
      await page.pdf({
        path: output,
        preferCSSPageSize: true, // use the @page size/margins from the print stylesheet
        printBackground: true, // keep the yellow accents
        tagged: true, // accessible, structured PDF
        outline: true, // PDF bookmarks from the headings
      });
      const { size } = await stat(output);
      console.log(`✓ ${path.relative(ROOT, output)} (${Math.round(size / 1024)} kB)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
