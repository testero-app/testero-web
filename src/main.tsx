import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted, replacing next/font/google. The families are referenced by name in
// styles/tokens.css (--ts-font-ui, --ts-font-mono), so nothing else has to change.
import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';

import './styles/tokens.css';
import './styles/globals.css';

import AppRouter from './components/AppRouter';
import LocaleProvider from './i18n/LocaleProvider';

console.log(`Testero FE v${__APP_VERSION__}`);

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

createRoot(container).render(
    <StrictMode>
        <LocaleProvider>
            <AppRouter />
        </LocaleProvider>
    </StrictMode>
);
