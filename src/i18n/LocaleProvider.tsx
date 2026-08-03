import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { IntlProvider } from 'use-intl';
import { messagesFor, resolveLocale, type Locale } from './messages';

/**
 * Holds the active interface language.
 *
 * The locale lives in a cookie rather than in the URL: the app is a SPA behind login and has
 * no localised routes. The cookie is also what a future page on another subdomain would read,
 * so the choice follows the user across testero.app.
 *
 * Under Next this was resolved server-side in `i18n/request.ts`, which meant a language change
 * needed `router.refresh()` to re-render. Here it is plain React state, so the switch is
 * immediate and no server is involved.
 */

const COOKIE = 'NEXT_LOCALE';
const ONE_YEAR_SECONDS = 31536000;

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    return document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`))
        ?.split('=')[1];
}

export function useLocaleSwitch(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocaleSwitch must be used within LocaleProvider');
    }
    return ctx;
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const initial = resolveLocale(readCookie(COOKIE));
        document.documentElement.lang = initial;
        return initial;
    });

    const setLocale = useCallback((next: Locale) => {
        document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
        document.documentElement.lang = next;
        setLocaleState(next);
    }, []);

    const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
    const messages = useMemo(() => messagesFor(locale), [locale]);

    return (
        <LocaleContext.Provider value={value}>
            <IntlProvider locale={locale} messages={messages} timeZone="Europe/Rome">
                {children}
            </IntlProvider>
        </LocaleContext.Provider>
    );
}
