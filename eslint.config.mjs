import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    // api-generated.ts is emitted by openapi-typescript — style rules do not apply to it.
    globalIgnores(['dist/**', '.next/**', 'src/types/api-generated.ts']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
        },
    },
    {
        // A context provider and its hook belong in the same module — that is the idiomatic
        // shape, and the rule only guards the granularity of hot reloading.
        files: ['src/context/*.tsx', 'src/i18n/*.tsx'],
        rules: { 'react-refresh/only-export-components': 'off' },
    },
    {
        // Node-side tooling: the OpenAPI sync script and the i18n drift guard.
        files: ['scripts/**/*.mjs', 'vite.config.ts'],
        languageOptions: { globals: globals.node },
    },
]);
