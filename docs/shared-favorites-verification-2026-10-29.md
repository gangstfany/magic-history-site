# Shared favorites verification — 2026-10-29

## Automated checks

- Homepage: 14 Node tests, local build passed; pinned authentication commit unchanged.
- Euro: 35 Node tests and public whitelist build passed. Learning helpers, mode round trips, source references and trusted bridge covered.
- APWH: 50 Node tests, 8 Python tests, full 240-card/18-unit-card content verification and build passed.
- Art: 527 Node tests using documented exclusions for browser-runtime-dependent historical cases, 10 Python tests and whitelist build passed.

## Real browser integration

Four separately served origins: homepage 8031, APWH 8032, Art 8036, Euro 8060.
Saved a World chain step, Euro Gutenberg card and Art Pink Panther artwork. Verified homepage count, course filter, reload persistence and exact-item return into all three courses. Removed Euro favorite while its iframe was unloaded; loading Euro did not resurrect old local data. Re-added through the course.
Expanded Euro comparison/argument/mnemonic helpers: comparison table, three teacher-written arguments and mnemonic remained visible. Keyboard navigation used for cross-origin frame controls because the CUA semantic pointer backend could not resolve their targets.
At 390 × 844 viewport, favorites dialog width 352px, left 19px, scroll width equals client width (350px). Viewport override reset after check. Full course mobile matrix was not rerun.

## Boundaries

Favorites are browser-local, not account or cross-device synchronization. Only World, Euro and Art participate; US remains its independent external entry. Source PDFs and private local source paths are excluded from Euro public source and release. Course releases remain separate repositories. No textbook fact-completeness claim is made by UI/protocol tests.
