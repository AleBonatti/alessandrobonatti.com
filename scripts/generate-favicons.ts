/**
 * Draws the "AB" header badge (black square, yellow Inter Tight 800) as favicons into
 * public/favicon/. Run it by hand only when the logo changes, then commit the files:
 *   npm run build && npm run favicons
 *
 * It needs a built site because it borrows the self-hosted Inter Tight from dist/:
 * the browser opens the home page (fonts declared there), then draws on a <canvas>.
 * Canvas lets us centre the letters on their real glyph bounds, not the line box.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Page } from 'playwright';
import { ORIGIN, ROOT, serveDist } from './lib/serve-dist.ts';

const OUT = path.join(ROOT, 'public', 'favicon');
const BLACK = '#000000';
const YELLOW = '#ffe300';

/**
 * Text height relative to the square. The header badge uses 15px in 36px (≈0.42);
 * tiny icons get bigger letters, otherwise "AB" is a smudge at 16px.
 */
function textScale(size: number): number {
  return size <= 48 ? 0.58 : 0.46;
}

/** Renders the badge at `size`×`size` px and returns it as PNG bytes. */
async function drawBadge(page: Page, size: number): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    async ({ size, scale, black, yellow }) => {
      const family = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
      const font = `800 ${Math.round(size * scale)}px ${family}`;
      await document.fonts.load(font, 'AB');

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D canvas not available');

      ctx.fillStyle = black;
      ctx.fillRect(0, 0, size, size);

      ctx.font = font;
      ctx.letterSpacing = `${-0.02 * size * scale}px`; // same tracking as the header brand
      ctx.fillStyle = yellow;
      const m = ctx.measureText('AB');
      // Centre the ink box (actualBoundingBox*), not the advance width / em box.
      const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const x = (size - inkWidth) / 2 + m.actualBoundingBoxLeft;
      const y = (size - inkHeight) / 2 + m.actualBoundingBoxAscent;
      ctx.fillText('AB', x, y);

      return canvas.toDataURL('image/png');
    },
    { size, scale: textScale(size), black: BLACK, yellow: YELLOW },
  );
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
}

/**
 * Packs PNGs into a .ico. Since Windows Vista an .ico may embed PNGs directly:
 * 6-byte header, one 16-byte directory entry per image, then the PNG bytes.
 */
function buildIco(images: ReadonlyArray<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const PNG_FILES: ReadonlyArray<{ name: string; size: number }> = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];
const ICO_SIZES = [16, 32, 48] as const;

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await serveDist(context);
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });

    for (const { name, size } of PNG_FILES) {
      await writeFile(path.join(OUT, name), await drawBadge(page, size));
      console.log(`✓ public/favicon/${name}`);
    }

    const icoImages = [];
    for (const size of ICO_SIZES) icoImages.push({ size, png: await drawBadge(page, size) });
    await writeFile(path.join(OUT, 'favicon.ico'), buildIco(icoImages));
    console.log('✓ public/favicon/favicon.ico');
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
