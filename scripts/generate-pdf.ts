/**
 * Renders the print pages (/print/<locale>/) of the *built* site into PDFs:
 *   dist/cv/CV_AlessandroBonatti.pdf      (English, historical file name)
 *   dist/cv/CV_AlessandroBonatti_IT.pdf
 *   dist/cv/CV_AlessandroBonatti_SV.pdf
 *
 * Runs after `astro build` (see package.json), so the PDFs always match the HTML.
 * Run directly with Node ≥ 22.18, which strips TypeScript types natively:
 *   node scripts/generate-pdf.ts
 */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { LOCALES, cvPdfPath } from '../src/i18n/locales.ts';
import { DIST, ORIGIN, ROOT, serveDist } from './lib/serve-dist.ts';

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await serveDist(context);

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
