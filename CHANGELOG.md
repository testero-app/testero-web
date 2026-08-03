# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.1](https://github.com/testero-app/testero-web/compare/v3.0.0...v3.0.1) (2026-08-03)


### Bug Fixes

* **training:** block the start button while the session is being created ([#166](https://github.com/testero-app/testero-web/issues/166)) ([163001b](https://github.com/testero-app/testero-web/commit/163001b747978be2f5684d342882a2538f691995))

## [3.0.0](https://github.com/testero-app/testero-web/compare/v2.9.2...v3.0.0) (2026-08-03)


### ⚠ BREAKING CHANGES

* the app is no longer a Next.js application. Deployment must serve `dist/` as static files with an SPA fallback (`vercel.json` covers Vercel), and the API base URL variable is now VITE_API_URL instead of NEXT_PUBLIC_API_URL.

### Features

* replace Next.js with React and Vite, and name every screen in English ([fe3ce8f](https://github.com/testero-app/testero-web/commit/fe3ce8fce46ff2ddaa0344c601d9ef74713411b7))


### Bug Fixes

* **settings:** send the notification preference the API actually expects ([0ee42e6](https://github.com/testero-app/testero-web/commit/0ee42e6470e05c424483bbb85715400fdc48be75)), closes [#134](https://github.com/testero-app/testero-web/issues/134)

## [2.9.2](https://github.com/testero-app/testero-web/compare/v2.9.1...v2.9.2) (2026-07-31)


### Bug Fixes

* **results:** display the backend's score and outcome instead of recomputing ([#155](https://github.com/testero-app/testero-web/issues/155)) ([e38ddea](https://github.com/testero-app/testero-web/commit/e38ddea7e5eeb57bd1163264e2da81d9b067b860))

## [2.9.1](https://github.com/testero-app/testero-web/compare/v2.9.0...v2.9.1) (2026-07-24)


### Bug Fixes

* **profile:** move security into Profile, restyle language selector ([#147](https://github.com/testero-app/testero-web/issues/147)) ([159d2e4](https://github.com/testero-app/testero-web/commit/159d2e4884bf2a104d011448571204f3990728a3))

## [2.9.0](https://github.com/testero-app/testero-web/compare/v2.8.3...v2.9.0) (2026-07-24)


### Features

* **i18n:** interface localisation (IT/EN) + language selector + CI drift guard ([#143](https://github.com/testero-app/testero-web/issues/143)) ([8dc1d23](https://github.com/testero-app/testero-web/commit/8dc1d23ade2e32357945b28f2363a34a31d001cd))

## [2.8.3](https://github.com/testero-app/testero-web/compare/v2.8.2...v2.8.3) (2026-07-23)


### Bug Fixes

* categorise results by the real assessment type, not a title guess ([#140](https://github.com/testero-app/testero-web/issues/140)) ([c2d1917](https://github.com/testero-app/testero-web/commit/c2d191763e95b96a5264d975a93c92356de76c33))

## [2.8.2](https://github.com/testero-app/testero-web/compare/v2.8.1...v2.8.2) (2026-07-22)


### Bug Fixes

* make the student flow usable on tablets ([#137](https://github.com/testero-app/testero-web/issues/137)) ([a20b031](https://github.com/testero-app/testero-web/commit/a20b031c60d8e63864d3ba2df18f40a7331a6843))

## [2.8.1](https://github.com/testero-app/testero-web/compare/v2.8.0...v2.8.1) (2026-07-22)


### Bug Fixes

* correct domain types that had drifted from the backend DTOs ([#135](https://github.com/testero-app/testero-web/issues/135)) ([1ec6248](https://github.com/testero-app/testero-web/commit/1ec6248e3f057aa65e2fd450567b829e4f9fae13))

## [2.8.0](https://github.com/testero-app/testero-web/compare/v2.7.0...v2.8.0) (2026-07-14)


### Features

* **competencies:** allow several topics to stay expanded at once ([#130](https://github.com/testero-app/testero-web/issues/130)) ([c93583c](https://github.com/testero-app/testero-web/commit/c93583c2b9f7317fd9df37ec0a42352809887629))

## [2.7.0](https://github.com/testero-app/testero-web/compare/v2.6.0...v2.7.0) (2026-07-08)


### Features

* wire CompetenzeTab to real mastery API ([#125](https://github.com/testero-app/testero-web/issues/125)) ([3febdbc](https://github.com/testero-app/testero-web/commit/3febdbca4e8c1b554795ed646407947d7b04506f))

## [2.6.0](https://github.com/testero-app/testero-web/compare/v2.5.0...v2.6.0) (2026-07-08)


### Features

* add notification bell with badge and panel ([#124](https://github.com/testero-app/testero-web/issues/124)) ([08abf7b](https://github.com/testero-app/testero-web/commit/08abf7b58c9545f642860581675c582a6a8cbc8a))


### Bug Fixes

* remove ZIP download functionality entirely ([#122](https://github.com/testero-app/testero-web/issues/122)) ([e5761e2](https://github.com/testero-app/testero-web/commit/e5761e269ae96bb4eefe1dfa1f56dd1d8acb8425))

## [2.5.0](https://github.com/testero-app/testero-web/compare/v2.4.0...v2.5.0) (2026-07-08)


### Features

* wire profile update, split name fields ([#120](https://github.com/testero-app/testero-web/issues/120)) ([b1f04d3](https://github.com/testero-app/testero-web/commit/b1f04d325109526dbc47b5aacb146445898ca011))

## [2.4.0](https://github.com/testero-app/testero-web/compare/v2.3.2...v2.4.0) (2026-07-04)


### Features

* replace date with availableFrom/availableUntil in types ([#114](https://github.com/testero-app/testero-web/issues/114)) ([3d770d8](https://github.com/testero-app/testero-web/commit/3d770d8c8f52087894a5f90ea40dcf1827f20d60))


### Bug Fixes

* align TAssessmentConfig with BE DTO changes ([#112](https://github.com/testero-app/testero-web/issues/112)) ([cae3768](https://github.com/testero-app/testero-web/commit/cae3768049041b92de4a5ebd2fd28bcbdb2c157f))

## [2.3.2](https://github.com/testero-app/testero-web/compare/v2.3.1...v2.3.2) (2026-07-01)


### Bug Fixes

* pin eslint to 9.x for eslint-config-next compatibility ([#110](https://github.com/testero-app/testero-web/issues/110)) ([366e733](https://github.com/testero-app/testero-web/commit/366e733aa02bc8da80b08990c121016505668407))

## [2.3.1](https://github.com/testero-app/testero-web/compare/v2.3.0...v2.3.1) (2026-07-01)


### Bug Fixes

* remove ZIP download from results page ([#108](https://github.com/testero-app/testero-web/issues/108)) ([97236f5](https://github.com/testero-app/testero-web/commit/97236f549b06e99f24e3cd19a184c034a8d5b98e))

## [2.3.0](https://github.com/testero-app/testero-web/compare/v2.2.1...v2.3.0) (2026-07-01)


### Features

* replace top bar tabs with sidebar shell navigation ([#106](https://github.com/testero-app/testero-web/issues/106)) ([ce99248](https://github.com/testero-app/testero-web/commit/ce9924877df8325162bec88db08dc872ac7db5dc))

## [2.2.1](https://github.com/testero-app/testero-web/compare/v2.2.0...v2.2.1) (2026-06-24)


### Bug Fixes

* align UI to definitive design (T0-1 through T0-7) ([#102](https://github.com/testero-app/testero-web/issues/102)) ([cdb513c](https://github.com/testero-app/testero-web/commit/cdb513cca63b548439d9d8dc273a25467c9ae2d1))

## [2.2.0](https://github.com/testero-app/testero-web/compare/v2.1.3...v2.2.0) (2026-06-23)


### Features

* wire mock components to real BE endpoints ([#97](https://github.com/testero-app/testero-web/issues/97)) ([9ac85a4](https://github.com/testero-app/testero-web/commit/9ac85a4c8d5814b4eba587cc18471a13a32d9171)), closes [#96](https://github.com/testero-app/testero-web/issues/96)


### Bug Fixes

* wire mock FE components to real BE endpoints ([#101](https://github.com/testero-app/testero-web/issues/101)) ([f9be79a](https://github.com/testero-app/testero-web/commit/f9be79a06f6c296188c3f9cfbe2a2e84f55aba77))

## [2.1.3](https://github.com/testero-app/testero-web/compare/v2.1.2...v2.1.3) (2026-06-19)


### Bug Fixes

* add missing restyling components and use server data ([#95](https://github.com/testero-app/testero-web/issues/95)) ([2834dd6](https://github.com/testero-app/testero-web/commit/2834dd6bac5e93b70d13325d73d9ec93736c5981))
* use server-provided difficulty, explanation, and submission feedback ([#93](https://github.com/testero-app/testero-web/issues/93)) ([8222cd5](https://github.com/testero-app/testero-web/commit/8222cd5afbea89836d941867877f4507e201983c)), closes [#92](https://github.com/testero-app/testero-web/issues/92)

## [2.1.2](https://github.com/testero-app/testero-web/compare/v2.1.1...v2.1.2) (2026-06-18)


### Bug Fixes

* downgrade eslint to 9.x for eslint-config-next compatibility ([#90](https://github.com/testero-app/testero-web/issues/90)) ([d3728ce](https://github.com/testero-app/testero-web/commit/d3728ce659fbf357ab77b35dd0910b65971fa425))

## [2.1.1](https://github.com/testero-app/testero-web/compare/v2.1.0...v2.1.1) (2026-06-17)


### Bug Fixes

* update login brand copy and heading size ([#75](https://github.com/testero-app/testero-web/issues/75)) ([060f4bf](https://github.com/testero-app/testero-web/commit/060f4bf7a06abddb1d5cabdebbb06b85aa0193b5))

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
