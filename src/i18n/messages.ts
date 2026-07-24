import it from '../../messages/it.json';
import en from '../../messages/en.json';

export type Locale = 'it' | 'en';

const MESSAGES = { it, en } as const;

// Italian is what a new user sees; English is the reference/fallback language, so a key
// missing in another locale resolves to its English value rather than showing the key path.
export const DEFAULT_LOCALE: Locale = 'it';
export const FALLBACK_LOCALE: Locale = 'en';

type Messages = typeof en;

/** Narrows an arbitrary cookie value to a supported locale, falling back to the default. */
export function resolveLocale(value: string | undefined): Locale {
    return value === 'en' ? 'en' : 'it';
}

/** Deep-merges `over` onto `base`, so present keys win and missing ones keep the base value. */
function deepMerge<T>(base: T, over: Partial<T>): T {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries((over ?? {}) as Record<string, unknown>)) {
        const b = out[k];
        out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object'
            ? deepMerge(b, v)
            : v;
    }
    return out as T;
}

/**
 * Messages for a locale, layered over the English reference so any untranslated key falls
 * back to English instead of rendering as a raw key path.
 */
export function messagesFor(locale: Locale): Messages {
    return locale === FALLBACK_LOCALE
        ? MESSAGES[FALLBACK_LOCALE]
        : deepMerge(MESSAGES[FALLBACK_LOCALE], MESSAGES[locale]);
}
