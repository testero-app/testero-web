import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { resolveLocale, messagesFor } from './messages';

// No locale in the URL — the app is a client SPA. The active locale comes from a cookie
// synced to the user's saved preference, defaulting to Italian.
export default getRequestConfig(async () => {
    const locale = resolveLocale((await cookies()).get('NEXT_LOCALE')?.value);
    return { locale, messages: messagesFor(locale) };
});
