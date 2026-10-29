# Shared Favorites Implementation Plan

**Goal:** A homepage favorites center for World/Euro/Art and Euro using APWH's existing workspace pattern.
**Architecture:** Pure validated favorite store plus homepage dialog; isolated course adapters exchange canonical metadata through trusted v1 messages. Each repository builds independently. Euro reuses APWH layout and retains source-backed learning helpers.
**Tech Stack:** Static JS modules, JSON configuration, localStorage, existing Python builds, Node tests and CUA cross-origin checks.

- [x] Test metadata validation, identity/deduplication, storage corruption/denial and scoped items; observe initial failures, implement store.
- [x] Add homepage Favorites dialog/count/filter/open/remove; add Euro course registration; preserve auth pin and shell/course boundaries.
- [x] Implement trusted Euro bridge with safe height and one-time existing-card migration; connect existing app callbacks.
- [x] APWH worker adds stars and exact study/event/chain-step reopen, validates scope; Art worker adds artwork stars and exact reopen; Euro worker applies APWH workspace and preserves helpers.
- [x] Build/test each repository; inspect adapters/security and generated-file boundaries. Preview four independently served origins.
- [x] CUA: save from all three courses, main list filters/counts, remove/sync, navigation after module reload, no stale resurrection, helper preservation, mobile and keyboard checks. Save screenshots and report actual publication status.
