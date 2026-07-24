#!/usr/bin/env node
// Fails if the locale message files have drifted apart — i.e. a key exists in one
// language but not the other. next-intl silently falls back to the default locale for
// a missing key, so without this check an untranslated string ships as a silent bug
// (an Italian word inside the English UI, or vice versa).

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// English is the reference language; every other locale must carry exactly its key set.
const REFERENCE = 'en';
const OTHERS = ['it'];

/** All leaf key paths in an object, dot-joined: { a: { b: 1 } } -> ["a.b"]. */
function keyPaths(obj, prefix = '') {
    const out = [];
    for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            out.push(...keyPaths(v, path));
        } else {
            out.push(path);
        }
    }
    return out;
}

function keysOf(loc) {
    const json = JSON.parse(readFileSync(join(root, 'messages', `${loc}.json`), 'utf-8'));
    return new Set(keyPaths(json));
}

const reference = keysOf(REFERENCE);
let ok = true;

for (const loc of OTHERS) {
    const keys = keysOf(loc);
    const untranslated = [...reference].filter((k) => !keys.has(k)); // in en, missing here
    const stray = [...keys].filter((k) => !reference.has(k));         // here, not in the reference

    if (untranslated.length) {
        ok = false;
        console.error(`Untranslated in ${loc}.json (present in the ${REFERENCE} reference):\n  ${untranslated.join('\n  ')}`);
    }
    if (stray.length) {
        ok = false;
        console.error(`Stray keys in ${loc}.json (not in the ${REFERENCE} reference):\n  ${stray.join('\n  ')}`);
    }
}

if (ok) {
    console.log(`i18n: ${reference.size} keys in the ${REFERENCE} reference, all locales in sync ✓`);
    process.exit(0);
}
process.exit(1);
