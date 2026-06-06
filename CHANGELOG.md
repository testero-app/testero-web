# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-06

### Added

- Next.js (App Router) frontend scaffold
- Test administration UI with code migration from previous codebase
- Submission flow with `startedAt` timestamp tracking
- Environment variables documentation and `.env.example`

### Changed

- Renamed Student types to User types to match backend v2.0
- Updated default API port to 8079 in environment and API configuration

### Fixed

- Overridden postcss to 8.5.x to fix XSS vulnerability

[1.0.0]: https://github.com/testero-app/testero-web/releases/tag/v1.0.0
