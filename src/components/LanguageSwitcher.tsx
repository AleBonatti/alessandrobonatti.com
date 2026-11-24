/**
 * Language dropdown: a React "island".
 *
 * Astro renders this component to static HTML at build time; with `client:load` on the
 * usage site, React then hydrates it in the browser to attach the event handlers.
 * Props must be serializable (strings, numbers, arrays, plain objects), since Astro
 * embeds them in the HTML for the browser-side hydration.
 */
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { Locale } from '../i18n/locales';
import { LANG_STORAGE_KEY } from '../i18n/locales';

export interface LanguageOption {
  locale: Locale;
  label: string;
  href: string;
}

interface Props {
  current: Locale;
  options: LanguageOption[];
  /** Translated "Language" (aria labels). */
  label: string;
}

function rememberChoice(locale: Locale): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (privacy mode): the choice just won't persist.
  }
}

export default function LanguageSwitcher({ current, options, label }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const currentOption = options.find((o) => o.locale === current);

  // Close on outside click or Escape: listeners exist only while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (e: ReactMouseEvent<HTMLAnchorElement>, option: LanguageOption) => {
    rememberChoice(option.locale);
    setOpen(false);
    e.preventDefault();
    if (option.locale !== current) {
      // Keep the section the visitor is looking at (e.g. #skills).
      window.location.assign(option.href + window.location.hash);
    }
  };

  return (
    <div className="mono lang-switch" ref={rootRef}>
      <button
        type="button"
        className="lsel"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${currentOption?.label ?? current}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current.toUpperCase()}</span>
        <svg className="chev" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M2 3.5 5 6.5 8 3.5" />
        </svg>
      </button>
      <ul role="listbox" id={listId} aria-label={label} hidden={!open} className="lmenu">
        {options.map((o) => {
          const active = o.locale === current;
          return (
            <li key={o.locale} role="option" aria-selected={active} lang={o.locale}>
              <a href={o.href} hrefLang={o.locale} className={active ? 'lopt is-active' : 'lopt'} onClick={(e) => choose(e, o)}>
                <span>{o.label}</span>
                <span className="lcode">{o.locale.toUpperCase()}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
