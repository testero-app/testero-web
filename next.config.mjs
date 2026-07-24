import { readFileSync } from 'fs';
import createNextIntlPlugin from 'next-intl/plugin';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
    },
};

export default withNextIntl(nextConfig);
