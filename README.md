# alessandrobonatti.com

Personal site / CV of Alessandro Bonatti. Static site built with [Astro](https://astro.build) 7,
TypeScript and one React island, in English, Italian and Swedish, plus generated PDF CVs.

## Commands

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `npm install`     | Install dependencies (then `npx playwright install chromium` once)   |
| `npm run dev`     | Dev server with hot reload at http://localhost:4321                  |
| `npm run check`   | Type-check `.astro`, `.ts` and `.tsx` files                          |
| `npm run build`   | `check` → static build into `dist/` → PDFs into `dist/cv/`           |
| `npm run pdf`     | Re-generate PDFs only (needs an existing `dist/`)                    |
| `npm run preview` | Serve `dist/` locally (runs in background: `npx astro preview stop`) |

Print layout while developing: open http://localhost:4321/print/en/ in the dev server.

## How it's organised

```
src/
  content/site/{en,it,sv}.yaml   ← ALL visible text, one file per language
  content.config.ts              ← Zod schema the YAML files must satisfy
  data/profile.ts                ← language-independent data: email, phones, links, iubenda/GA ids
  i18n/locales.ts                ← supported languages, URLs, PDF file names
  icons/*.svg + index.ts         ← monochrome icons, inlined at build time
  lib/content.ts                 ← loads content + checks all languages share the same structure
  lib/inline.ts                  ← tiny markup renderer (see below)
  layouts/BaseLayout.astro       ← <head>: SEO, hreflang, fonts, iubenda, GA, language detection
  components/                    ← Header, LanguageSwitcher (React), sections/*
  pages/[...lang]/index.astro    ← home page → /, /it/, /sv/
  pages/print/[lang].astro       ← A4 print layout → rendered to PDF
  pages/404.astro
scripts/generate-pdf.ts          ← post-build: print pages → dist/cv/*.pdf (Playwright)
public/                          ← copied verbatim: favicons, robots.txt, .htaccess
```

## Editing content

Edit `src/content/site/<lang>.yaml`. Inline markup inside text:

| Write              | Renders as                         |
| ------------------ | ---------------------------------- |
| `==text==`         | yellow highlight marker            |
| `**text**`         | bold                               |
| `_text_`           | Instrument Serif italic accent     |
| `[text](https://…)`| underlined link (new tab)          |

The build **fails** (with a precise message) if:

- a field is missing, empty, misspelled or of the wrong type (Zod schema);
- an icon name doesn't exist in `src/icons/`;
- a translation has a different number of items, or different `icon`/`url`/`years`/`code`/`letter`
  values, than `en.yaml`.

Adding an icon: drop `name.svg` (single path, `fill="#000"`) in `src/icons/` and add `name` to `ICON_NAMES`.

## Languages

- English at `/`, Italian at `/it/`, Swedish at `/sv/`; `hreflang` alternates + sitemap.
- On `/`, a tiny inline script redirects to `/it/` or `/sv/` if the browser prefers them
  (`navigator.languages`) and the visitor hasn't picked a language yet.
- The header dropdown stores the explicit choice in `localStorage` (`lang`), which always wins.

## PDF

`npm run build` renders `/print/<lang>/` with headless Chromium into:

- `/cv/CV_AlessandroBonatti.pdf` (English, same URL as the old site)
- `/cv/CV_AlessandroBonatti_IT.pdf`, `/cv/CV_AlessandroBonatti_SV.pdf`

The hero button links to the PDF of the current language. PDFs are never committed: they're
rebuilt with the HTML every time, so they can't go stale.

## Deploy (GitHub Actions)

`.github/workflows/deploy.yml`: every push/PR builds (type check + site + PDFs); pushes to `main`
then `rsync` `dist/` to the server over SSH.

Repository secrets (Settings → Secrets and variables → Actions):

| Secret               | Value                                                             |
| -------------------- | ----------------------------------------------------------------- |
| `DEPLOY_HOST`        | server hostname                                                   |
| `DEPLOY_USER`        | SSH user                                                          |
| `DEPLOY_PORT`        | SSH port (optional, default 22)                                   |
| `DEPLOY_SSH_KEY`     | private key (its public half in the user's `authorized_keys`)     |
| `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan -p <port> <host>` (pins the server's key)  |
| `DEPLOY_PATH`        | **dedicated** directory, e.g. `/var/www/alessandrobonatti.com/public_html` |

⚠️ `rsync --delete` makes `DEPLOY_PATH` an exact mirror of `dist/`: never point it at the old
Laravel folder or any directory containing other files. Create a new one and switch the virtual
host's `DocumentRoot` to it.

### Server config

Apache: `public/.htaccess` (HTTPS, www→apex, caching, compression, 404, security headers).
Requires `AllowOverride All`, `mod_rewrite`, `mod_headers`, `mod_deflate`.

nginx equivalent:

```nginx
root /var/www/alessandrobonatti.com/public_html;
index index.html;
error_page 404 /404.html;
location / { try_files $uri $uri/ =404; }
location /_astro/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location ~* \.(html|pdf)$ { add_header Cache-Control "public, max-age=0, must-revalidate"; }
```
