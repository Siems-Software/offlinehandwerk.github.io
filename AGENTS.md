# Agent instructions

Conventions for people and agents changing this repository. The public site, local commands, and page list live in [README.md](README.md). Add a rule here when a new convention or workflow is introduced. Do not replace existing rules.

## Documentation maintenance

Every pull request that changes the repository updates the docs below in the same change. A pull request without its changelog entry is incomplete. Reviewers and agents must not merge it.

### CHANGELOG.md

`CHANGELOG.md` in the repository root records every content change. This is a continuously deployed static site and has no releases, so the changelog uses the merge date. Do not invent a version number.

Workflow:

1. An open pull request adds its entry under `## [Unreleased]`.
2. The person who merges moves that pull request's bullets from `Unreleased` under `## [YYYY-MM-DD]`. The heading is the UTC date the pull request is merged. Deployment follows that merge. Several changes merged on the same date share one heading. Bullets that belong to pull requests still open stay under `Unreleased`.
3. Under `Unreleased` and under each date, use [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) sections in this order: `Added`, `Changed`, `Fixed`, `Removed`. Omit empty sections.
4. Each bullet is a short description plus who made the change. Use the author's GitHub handle. When an agent makes the change, use the human requester's GitHub handle and add `via agent`.

Do not invent entries for changes that were never recorded.

### README.md

`README.md` stays current with the site. New pages, changed URLs, and new features update the README in the same change. Remove sections that no longer match the repository.

### AGENTS.md

Extend this file when a new convention or workflow is introduced.

### Pull requests

Every pull request includes its `CHANGELOG.md` entry. Without that entry the pull request is incomplete, and reviewers and agents must not merge it.
