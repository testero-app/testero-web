import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    display: 'swap',
    variable: '--font-mono',
});

export const metadata = {
    title: 'Testero',
    description: 'Sistema open source per la somministrazione di test e verifiche in ambito didattico',
};

export default function RootLayout({ children }) {
    return (
        <html lang="it">
            <body className={`${dmSans.variable} ${jetbrainsMono.variable} ${dmSans.className}`}>{children}</body>
        </html>
    );
}
