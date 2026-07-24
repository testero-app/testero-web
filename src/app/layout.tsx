import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Sora, JetBrains_Mono } from 'next/font/google';
import '../styles/tokens.css';
import './globals.css';

const sora = Sora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    display: 'swap',
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'Testero',
    description: 'Sistema open source per la somministrazione di test e verifiche in ambito didattico',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    // Locale lives in a cookie synced to the user's saved preference (no locale in the URL —
    // the app is a client SPA). Resolved in src/i18n/request.ts. Defaults to Italian.
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: `console.log("Testero FE v${process.env.NEXT_PUBLIC_APP_VERSION}")` }} />
            </head>
            <body className={`${sora.variable} ${jetbrainsMono.variable} ${sora.className}`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
