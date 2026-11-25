/**
 * Tiny inline-markup renderer for content strings.
 *
 *   ==text==        → <em class="hl">text</em>     yellow highlight marker
 *   **text**        → <strong>text</strong>
 *   _text_          → <span class="serif-i">text</span>   Instrument Serif italic accent
 *   [text](url)     → <a class="ulink" href="url">text</a>   https:// (new tab) or mailto:
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
    .replace(/\[(.+?)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, (_match, label: string, url: string) =>
      // Web links open in a new tab; mailto: hands over to the mail app, so no new tab.
      url.startsWith('mailto:')
        ? `<a class="ulink" href="${url}">${label}</a>`
        : `<a class="ulink" href="${url}" target="_blank" rel="noopener">${label}</a>`,
    );
}

/** Same markup, stripped to plain text (for <meta> tags, aria-labels...). */
export function plain(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/==(.+?)==/g, '$1')
    .replace(/(^|[\s(])_(.+?)_(?=$|[\s.,;:!?)])/g, '$1$2')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1');
}
