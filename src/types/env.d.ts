/// <reference types="vite/client" />

/** Injected by vite.config.ts from package.json — the version logged on boot. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
