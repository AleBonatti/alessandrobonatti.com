/**
 * Tiny inline-markup renderer for content strings.
 *
 *   ==text==        → <em class="hl">text</em>     yellow highlight marker
 *   **text**        → <strong>text</strong>
 *   _text_          → <span class="serif-i">text</span>   Instrument Serif italic accent
 *   [text](url)     → <a class="ulink" href="url">text</a>
 *
 * Why not full Markdown? We only need four inline features, never block elements, and a
 * 20-line function has no dependency, no surprises, and is easy to read for translators.
 * The input is HTML-escaped first, so content can never inject markup by accident.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ESCAPES[ch] ?? ch);
}

export function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/==(.+?)==/g, '<em class="hl">$1</em>')
    .replace(/(^|[\s(])_(.+?)_(?=$|[\s.,;:!?)])/g, '$1<span class="serif-i">$2</span>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)\s]+)\)/g, '<a class="ulink" href="$2" target="_blank" rel="noopener">$1</a>');
}

/** Same markup, stripped to plain text (for <meta> tags, aria-labels...). */
export function plain(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .replace(/(^|[\s(])_(.+?)_(?=$|[\s.,;:!?)])/g, '$1$2')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1');
}
