import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="it">
            <head>
                <script dangerouslySetInnerHTML={{ __html: `console.log("Testero FE v${process.env.NEXT_PUBLIC_APP_VERSION}")` }} />
            </head>
            <body className={`${sora.variable} ${jetbrainsMono.variable} ${sora.className}`}>{children}</body>
        </html>
    );
}
