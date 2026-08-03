# testero-web

[![Version](https://img.shields.io/github/v/release/testero-app/testero-web)](https://github.com/testero-app/testero-web/releases)

Frontend for **Testero**, an open source system for administering tests
and assessments, designed for educational settings: private schools,
training organizations, teachers, and trainers.

Testero replaces the manual cycle of paper → grading → transcription
with an integrated digital workflow.

This repository contains the **web frontend**. The backend lives in
[testero-backend](https://github.com/testero-app/testero-backend).

## Stack

- **Framework**: Next.js (App Router)
- **Language**: JavaScript
- **Hosting**: [Vercel](https://vercel.com) (any platform that supports Next.js works)

## Getting Started

Prerequisites:

- Node.js 18 or later
- npm

```bash
# Clone the repository
git clone https://github.com/testero-app/testero-web.git
cd testero-web

# Install dependencies
npm install

# Copy the environment variables template and fill in the values
cp .env.example .env.local

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:8080`) |

See [`.env.example`](./.env.example) for the expected format.

## CI & Code Quality

Run all checks locally:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

The CI pipeline runs on every PR to `main`:

| Step | What it does |
|------|-------------|
| **API types** | Regenerates the types from the spec and fails if the committed file is stale |
| **TypeScript** | Verifies type safety (`tsc --noEmit`) |
| **ESLint** | Enforces code quality and React best practices |
| **Build** | Verifies the production build succeeds |

## API Types

The types describing backend payloads are **generated**, not written by hand:
`src/types/api-generated.ts` comes from `openapi/openapi.json`, which is the spec
published by [testero-backend](https://github.com/testero-app/testero-backend) at
`docs/openapi.json`. `src/types/domain.ts` and `src/lib/api.ts` only alias those
schemas, so a backend DTO change surfaces here as a type error instead of a
runtime surprise.

After a backend contract change:

```bash
npm run sync:openapi        # pulls the spec from main on GitHub
npm run generate:api-types  # rewrites src/types/api-generated.ts
```

Both files are committed. While a backend change is still in review, point the
sync at your local checkout:

```bash
OPENAPI_SRC=../testero-backend/docs/openapi.json npm run sync:openapi
```

The "Build & Verify" check is **required** — PRs cannot be merged if any
step fails.

> **For contributors:** see [CONTRIBUTING.md](./CONTRIBUTING.md#ci-pipeline)
> for details on running checks locally.

## Releases

This project uses [Release Please](https://github.com/googleapis/release-please)
for automated versioning and changelog generation.

Versioning follows [Semantic Versioning](https://semver.org/) and is driven
by [Conventional Commits](https://www.conventionalcommits.org/) prefixes:

| Prefix | Version bump |
|--------|-------------|
| `fix:` | Patch (1.0.0 → 1.0.1) |
| `feat:` | Minor (1.0.0 → 1.1.0) |
| `feat!:` / `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) |

After each merge to `main`, Release Please opens (or updates) a Release
PR that bumps the version in `package.json` and updates `CHANGELOG.md`.
When the Release PR is merged, a git tag and a GitHub Release are created
automatically.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
before opening a pull request. All contributions follow the
Developer Certificate of Origin (DCO) model.

## License

Released under the
[GNU Affero General Public License v3.0](./LICENSE).

This means anyone can use, modify, and redistribute the software, as long
as modified versions remain under the same license and the source code is
made available — including when the software is offered as a network service.

## Website

[testero.app](https://testero.app)