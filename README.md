# testero-web

![Version](https://img.shields.io/badge/version-1.0.0-blue)

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