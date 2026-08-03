#!/usr/bin/env node
// Pulls the backend's published OpenAPI spec into openapi/openapi.json, the file the
// TypeScript types are generated from. The spec is committed so that `generate:api-types`
// — and therefore CI — never needs the network or a running backend.
//
//   npm run sync:openapi                                  # from main on GitHub
//   OPENAPI_SRC=../testero-backend/docs/openapi.json \
//     npm run sync:openapi                                # from a local checkout
//
// The backend regenerates its copy on every `./mvnw test`, so a local checkout is the
// right source while a contract change is still in review.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SRC =
    'https://raw.githubusercontent.com/testero-app/testero-backend/main/docs/openapi.json';

const src = process.env.OPENAPI_SRC || DEFAULT_SRC;
const target = join(root, 'openapi', 'openapi.json');

async function read(from) {
    if (!from.startsWith('http://') && !from.startsWith('https://')) {
        return readFileSync(resolve(root, from), 'utf-8');
    }
    const response = await fetch(from);
    if (!response.ok) {
        throw new Error(`${from} responded ${response.status}`);
    }
    return response.text();
}

const raw = await read(src);
// Parse before writing: a truncated download or an HTML error page must not land on disk.
const spec = JSON.parse(raw);
if (!spec.openapi || !spec.components?.schemas) {
    throw new Error(`${src} is not an OpenAPI document`);
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(spec, null, 2)}\n`, 'utf-8');

console.log(
    `openapi/openapi.json ← ${src} (${Object.keys(spec.components.schemas).length} schemas)`
);
console.log('Now run: npm run generate:api-types');
