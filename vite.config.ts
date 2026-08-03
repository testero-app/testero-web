import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    define: {
        // Was NEXT_PUBLIC_APP_VERSION, injected by next.config.mjs from the same source.
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
        // The backend allows this origin by default (app.cors.origins), so it must not drift.
        port: 3000,
    },
});
