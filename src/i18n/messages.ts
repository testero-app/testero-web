import it from '../../messages/it.json';
import en from '../../messages/en.json';

export type Locale = 'it' | 'en';

const MESSAGES = { it, en } as const;

export const DEFAULT_LOCALE: Locale = 'it';

/** Narrows an arbitrary cookie value to a supported locale, falling back to Italian. */
export function resolveLocale(value: string | undefined): Locale {
    return value === 'en' ? 'en' : 'it';
}

export function messagesFor(locale: Locale) {
    return MESSAGES[locale];
}
