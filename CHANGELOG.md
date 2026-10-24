# Changelog

All notable changes to this website are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions are merge dates (`YYYY-MM-DD`), not release numbers. The workflow is in [AGENTS.md](AGENTS.md).

## [Unreleased]

### Added

- English terms at `/en/terms/`, with the language switch between `/de/agb/` and `/en/terms/` (PR #46, Refs Siems-Software/OfflineHandwerk#153, Crome696 via agent).
- Test that `/de/impressum/` and `/en/imprint/` contain no VAT ID (PR #46, Refs Siems-Software/OfflineHandwerk#152, Crome696 via agent).

### Changed

- Privacy policy in German and English: narrow RevenueCat analytics purpose for the count of paying customers (entitlement `offlinehandwerk_premium`) and app usage duration (PR #46, Refs Siems-Software/OfflineHandwerk#147, Crome696 via agent).
- Privacy policy in German and English: retention by category for RevenueCat data, Google payout reports, and store data, and the privacy pages' last-updated date (PR #46, Refs Siems-Software/OfflineHandwerk#154, Crome696 via agent).

## [2026-10-24]

### Added

- German terms page at `/de/agb/`. There is no English terms page (PR #45, Crome696 via agent).
- PolyForm Noncommercial License 1.0.0 in `LICENSE` (PR #43, Crome696 via agent).
- Documentation-maintenance rules in `AGENTS.md`, this changelog, and a current `README.md` (Crome696 via agent).

### Changed

- PolyForm Noncommercial copyright holder is Siems Software (https://offlinehandwerk.de) in `LICENSE` and `README.md` (Crome696 via agent).
