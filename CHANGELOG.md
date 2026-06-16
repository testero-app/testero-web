# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0](https://github.com/testero-app/testero-web/compare/v2.0.2...v2.1.0) (2026-06-16)


### Features

* rebuild Profile and Results pages ([#72](https://github.com/testero-app/testero-web/issues/72)) ([4f58c4d](https://github.com/testero-app/testero-web/commit/4f58c4d13ad523284a3e12da8259b3238f1d49b4))


### Bug Fixes

* make profile personal data fields all read-only ([#74](https://github.com/testero-app/testero-web/issues/74)) ([036b567](https://github.com/testero-app/testero-web/commit/036b56714d2fc659f8c47ef580f48ec3b791f137))

## [2.0.2](https://github.com/testero-app/testero-web/compare/v2.0.1...v2.0.2) (2026-06-16)


### Bug Fixes

* login info box styling ([#69](https://github.com/testero-app/testero-web/issues/69)) ([de9a215](https://github.com/testero-app/testero-web/commit/de9a2156ddac2115c7097eece50183acc413eb35))

## [2.0.1](https://github.com/testero-app/testero-web/compare/v2.0.0...v2.0.1) (2026-06-16)


### Bug Fixes

* add CSS module type declaration for tsc in CI ([#66](https://github.com/testero-app/testero-web/issues/66)) ([0c5d4d0](https://github.com/testero-app/testero-web/commit/0c5d4d082a9fd2e2a0f3a65056345eaeff08636e))

## [2.0.0](https://github.com/testero-app/testero-web/compare/v1.3.0...v2.0.0) (2026-06-16)


### Features

* Meridian design system restyling ([#64](https://github.com/testero-app/testero-web/issues/64)) ([7f1bf20](https://github.com/testero-app/testero-web/commit/7f1bf203ac735dab1b5bf7dd844db1d1440bb0aa))

## [1.3.0](https://github.com/testero-app/testero-web/compare/v1.2.0...v1.3.0) (2026-06-12)


### Features

* save answers incrementally on question navigation ([#61](https://github.com/testero-app/testero-web/issues/61)) ([c85c0a2](https://github.com/testero-app/testero-web/commit/c85c0a22d646f61b9e86e9fbac4dd266f87114b9))

## [1.2.0](https://github.com/testero-app/testero-web/compare/v1.1.0...v1.2.0) (2026-06-11)


### Features

* submission review UI for past test results ([#56](https://github.com/testero-app/testero-web/issues/56)) ([3ac3ba4](https://github.com/testero-app/testero-web/commit/3ac3ba4d3cdf794ffe198843afe98e6075772d36))

## [1.1.0](https://github.com/testero-app/testero-web/compare/v1.0.2...v1.1.0) (2026-06-10)


### Features

* add student personal area with submission history ([#54](https://github.com/testero-app/testero-web/issues/54)) ([b98b430](https://github.com/testero-app/testero-web/commit/b98b430883a7f103b45f3d8691580b34100aaaf0))

## [1.0.2](https://github.com/testero-app/testero-web/compare/v1.0.1...v1.0.2) (2026-06-09)


### Bug Fixes

* frontend quick wins — strict equality, dead code, metadata ([#49](https://github.com/testero-app/testero-web/issues/49)) ([19384fa](https://github.com/testero-app/testero-web/commit/19384fafdcbb676edc605020697bc97385084eab))

## [1.0.1](https://github.com/testero-app/testero-web/compare/v1.0.0...v1.0.1) (2026-06-08)


### Bug Fixes

* **security:** add permissions to dco.yml workflow ([#47](https://github.com/testero-app/testero-web/issues/47)) ([25d273f](https://github.com/testero-app/testero-web/commit/25d273fad8bbb4d1c29739d9e67f230d476a16b0))

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
