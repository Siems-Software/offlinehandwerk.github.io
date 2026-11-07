# Dependency Dashboard #6

## Update scope

The dashboard is a dependency inventory, not a website feature request. No open update PR existed when this change started. Updates stay in one PR, following the repository's Renovate grouping. Automatic merge remains disabled.

| Dependency                      | Previous | Updated |
| ------------------------------- | -------- | ------- |
| `actions/checkout`              | v4       | v7.0.1  |
| `actions/setup-node`            | v4       | v7.1.0  |
| `actions/upload-pages-artifact` | v3       | v5.0.0  |
| `actions/configure-pages`       | v5       | v6.0.0  |
| `actions/deploy-pages`          | v4       | v5.0.1  |
| `typescript`                    | 5.9.3    | 6.0.3   |

Each action is pinned to its verified release commit, with the release version in a comment. The JavaScript actions and the build use Node 24. Build and deployment require `[self-hosted, Linux, X64, default]`, with no hosted fallback. Fork PR builds are skipped to protect the self-hosted runner. Workflow triggers, permissions, environment and the main-only deployment condition are unchanged.

`upload-pages-artifact` v5 excludes hidden files by default. Explicit `include-hidden-files: true` preserves the previous artifact contents, including `dist/.nojekyll`. The action still excludes `.git` and `.github`.

The lockfile was regenerated with npm's update and deduplication commands, without force flags or manual lockfile edits. This refreshes compatible transitive dependencies and removes duplicate language-server packages.

## Compatibility and scheduled follow-ups

- **TypeScript 7.0.2:** not adopted. The latest `@astrojs/check` release, 0.9.10, declares `typescript: ^5.0.0 || ^6.0.0`. A TypeScript 7 install dry run reports the peer conflict. Version 6.0.3 is the latest stable supported 6.x release. A narrowly scoped Renovate rule mirrors the checker's peer range. Revisit it when upgrading the checker; a test detects changes to that peer range in the lockfile.
- **`@iconify-json/lucide` 1.2.144:** published on 2026-10-14, so it does not yet satisfy the configured three-day minimum release age at the time of this update. Keep 1.2.143 until Renovate's normal eligibility checks pass. Neither `minimumReleaseAge` nor `internalChecksFilter` was relaxed.
- Other direct npm dependencies and Selenium already match their latest stable releases in the dashboard inventory.

## Verification

- Baseline: Node 24.22.0, clean npm install, lint/typecheck/build and 28 passing tests. Windows checkout CRLF conversion initially failed Prettier; restoring the repository's original LF bytes and setting `core.autocrlf=false` locally fixed that without source changes.
- Two workflow regression tests failed against the old action references and missing explicit hidden-file input, then passed after the workflow update. A third test guards the TypeScript compatibility rule and existing release/merge gates.
- Updated build on Node 24.22.0: lint, Astro diagnostics (zero errors/warnings/hints), 16 static pages and 31 passing Node tests (zero failed/skipped). Clean `npm ci` and `npm ls --all` succeed; `npm audit --audit-level=moderate` reports zero vulnerabilities.
- Workflow syntax checked with checksum-verified actionlint 1.7.12. Release tags and action inputs/runtimes were read at the pinned commits.
- All 25 generated files, including HTML, CSS, images and the theme script, have the same SHA-256 hashes as the baseline build. **No frontend impact.** No new browser run or visual evidence is claimed for this dependency-only change.

PR CI must validate the updated actions and artifact upload. Production deployment is not exercised by a PR: the deploy job remains restricted to `main`. Owner review and merge are separate from this implementation; no merge or live deployment is authorized or claimed here.
