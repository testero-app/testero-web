# testero-web

Frontend for **Testero** — an open source system for administering tests
and assessments, designed for educational settings: private schools,
training organizations, teachers, and trainers.

Testero replaces the manual cycle of paper → grading → transcription
with an integrated digital workflow.

This repository contains the **web frontend**. The backend lives in
[testero-backend](https://github.com/testero-app/testero-backend).

## Status

Active milestone: **M1** — validating the student assessment flow with
real classes. See the [organization profile](https://github.com/testero-app)
for the overall project status.

## Features (M1)

- One-question-per-page carousel with a sidebar navigation grid
- Multiple-choice questions (single and multiple correct answers)
- Open-ended bonus questions
- "None of the above" option with required justification
- Progress tracking and submission flow

## Stack

- **Framework**: Next.js (App Router)
- **Language**: JavaScript
- **Hosting**: Vercel

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
