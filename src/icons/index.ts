/**
 * Monochrome icons (Font Awesome Free / Simple Icons, see design handoff).
 * Every name here must have a matching `<name>.svg` in this folder:
 * the Icon component throws at build time if one is missing.
 */
export const ICON_NAMES = [
  'accessibility', 'aws', 'cicd', 'claude', 'css3', 'digitalocean', 'docker', 'drizzle', 'fastify', 'figma', 'github',
  'gitkraken', 'laravel', 'linkedin', 'linux', 'mssql', 'mysql', 'next', 'node', 'npm',
  'php', 'postgresql', 'python', 'react', 'seo', 'tailwind', 'telegram', 'typescript',
  'vercel', 'vscode', 'vue', 'whatsapp',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * Vite's import.meta.glob runs at build time: with `query: '?raw'` + `eager: true` it gives us
 * every SVG file's text, keyed by path. No runtime fetching; the markup is inlined in the HTML.
 */
const files = import.meta.glob<string>('./*.svg', { query: '?raw', import: 'default', eager: true });

export function getIconSvg(name: IconName): string {
  const svg = files[`./${name}.svg`];
  if (svg === undefined) throw new Error(`Icon "${name}" not found in src/icons/`);
  // Make the glyph inherit the text colour, exactly like the design's CSS-mask approach.
  return svg.replace(/fill="#000"/g, 'fill="currentColor"');
}
