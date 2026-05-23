# Contributing to testero-web

Thank you for your interest in contributing to Testero! This document
explains how to contribute to the frontend.

## Code of Conduct

All participants are expected to follow the
[Code of Conduct](https://github.com/testero-app/.github/blob/main/CODE_OF_CONDUCT.md).

## Language

All code, commit messages, issues, pull requests, and documentation must
be written in **English**. The user-facing interface may be localized
separately.

## How to Contribute

### Reporting Bugs

Open an [issue](https://github.com/testero-app/testero-web/issues/new/choose)
using the "Bug report" template. Include:

- Testero version (commit hash or tag)
- Browser and operating system
- Steps to reproduce
- Expected vs. actual behavior

### Suggesting Features

Open an [issue](https://github.com/testero-app/testero-web/issues/new/choose)
using the "Feature request" template. Describe the problem the feature
would solve and any proposed solution.

### Submitting Code

1. **Fork** the repository
2. Create a branch from `main`:
   `git checkout -b feature/descriptive-name`
3. Make your changes with **DCO-signed commits** (see below)
4. Push to your fork and open a **Pull Request** against `main`
5. Ensure all checks pass (including the DCO check)

## Developer Certificate of Origin (DCO)

Testero uses the [Developer Certificate of Origin](https://developercertificate.org/)
to certify the origin of contributions. Every commit must be signed off.

Sign off your commits with the `-s` flag:

```bash
git commit -s -m "feat: your change description"
```

This appends a line to your commit message:

```
Signed-off-by: Your Name <your@email.com>
```

By signing off, you certify the DCO 1.1:

> a. The contribution was created in whole or in part by you, and you
>    have the right to submit it under the open source license of this
>    project; OR
> b. The contribution is based upon previous work that, to the best of
>    your knowledge, is covered under an appropriate open source license
>    and you have the right under that license to submit that work with
>    modifications; OR
> c. The contribution was provided directly to you by some other person
>    who certified (a), (b), or (c) and you have not modified it.
>
> d. You understand and agree that this project and the contribution are
>    public and that a record of the contribution (including all personal
>    information submitted with it, including the sign-off) is maintained
>    indefinitely.

### Configure Git

Make sure your name and email are configured correctly. The email must
match (or be a verified alias of) your GitHub account:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Convenience Alias

To sign off automatically with a shorter command:

```bash
git config --global alias.cs 'commit -s'
```

Then use `git cs -m "message"`.

### Fixing a Missing Sign-off

If a commit is missing its sign-off:

```bash
# Last commit only
git commit --amend --signoff
git push --force-with-lease

# Multiple commits (last N)
git rebase --signoff HEAD~N
git push --force-with-lease
```

## Coding Standards

### Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for refactoring without functional changes
- `test:` for adding or modifying tests
- `chore:` for tooling, dependencies, or configuration changes

### Branch Naming

- `feature/descriptive-name` for new features
- `fix/bug-name` for fixes
- `docs/topic` for documentation-only changes

### Pull Requests

- One logical change per PR (avoid bundling unrelated changes)
- Include a clear description and motivation
- Reference related issues with `Closes #N`
- All commits must be DCO-signed (verified automatically)
- At least one approval is required before merging

## License

By contributing to this repository, you agree that your contributions
will be licensed under the project's
[GNU Affero General Public License v3.0](./LICENSE).

## Questions

For questions about contributing, open a
[Discussion](https://github.com/testero-app/testero-web/discussions).
