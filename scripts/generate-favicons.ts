/**
 * Builds the favicons in public/favicon/ from the logo, src/assets/logo.svg.
 * Run it by hand only when the logo changes, then commit the files:
 *   npm run favicons
 *
 * - favicon.svg: the logo itself, used by modern browsers (sharp at any size).
 * - favicon.ico (16/32/48 px): older browsers.
 * - PNGs: iOS home screen (apple-touch-icon) and Android/PWA manifest.
 * All rasters are rendered by headless Chromium.
 * Tiny sizes use a tighter crop: at 16px every pixel of rune counts.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = path.join(ROOT, 'src', 'assets', 'logo.svg');
const OUT = path.join(ROOT, 'public', 'favicon');

/** viewBox (in the logo's original 720×720 space) for each output size. The rune spans y 131–588. */
function viewBoxFor(size: number): string {
  return size <= 48 ? '105 105 510 510' : '80 80 560 560';
}

/** Returns the logo SVG with a different viewBox and explicit pixel size. */
function svgAt(svg: string, size: number): string {
  return svg.replace(/<svg\b[^>]*>/, `<svg viewBox="${viewBoxFor(size)}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`);
}

/** Renders the SVG at size×size px (device scale 1) and returns PNG bytes. */
async function render(page: Page, svg: string, size: number): Promise<Buffer> {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><style>html,body{margin:0}svg{display:block}</style>${svgAt(svg, size)}`);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size, height: size } });
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
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];
const ICO_SIZES = [16, 32, 48] as const;

async function main(): Promise<void> {
  const svg = await readFile(LOGO, 'utf8');

  // SVG favicon: tight crop (it's mostly shown at 16–32px), comment stripped.
  const favSvg = svg.replace(/<!--[\s\S]*?-->\n?/g, '').replace(/<svg\b[^>]*>/, `<svg viewBox="${viewBoxFor(16)}" xmlns="http://www.w3.org/2000/svg">`);
  await writeFile(path.join(OUT, 'favicon.svg'), favSvg);
  console.log('✓ public/favicon/favicon.svg');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });

    for (const { name, size } of PNG_FILES) {
      await writeFile(path.join(OUT, name), await render(page, svg, size));
      console.log(`✓ public/favicon/${name}`);
    }

    const icoImages = [];
    for (const size of ICO_SIZES) icoImages.push({ size, png: await render(page, svg, size) });
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
