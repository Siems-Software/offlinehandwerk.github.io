Copyright (c) 2026 Siems Software (https://offlinehandwerk.de). All rights reserved except as granted by the PolyForm Noncommercial License 1.0.0 (see LICENSE).

# OfflineHandwerk Website

German-language product website for tradespeople (Handwerker), with an English translation.

**Site:** [https://offlinehandwerk.de/](https://offlinehandwerk.de/)

## Pages

German is the default locale. The project root repeats the German home page. `/de/` and `/en/` stay prefixed. Slugs live in `src/config.mjs`.

- Home: [https://offlinehandwerk.de/](https://offlinehandwerk.de/) and [https://offlinehandwerk.de/de/](https://offlinehandwerk.de/de/)
- English home: [https://offlinehandwerk.de/en/](https://offlinehandwerk.de/en/)
- Datenschutz: [https://offlinehandwerk.de/de/datenschutz/](https://offlinehandwerk.de/de/datenschutz/)
- Privacy: [https://offlinehandwerk.de/en/privacy/](https://offlinehandwerk.de/en/privacy/)
- Impressum: [https://offlinehandwerk.de/de/impressum/](https://offlinehandwerk.de/de/impressum/)
- Imprint: [https://offlinehandwerk.de/en/imprint/](https://offlinehandwerk.de/en/imprint/)
- AGB: [https://offlinehandwerk.de/de/agb/](https://offlinehandwerk.de/de/agb/). This is the terms URL for the German store listing.
- Terms: [https://offlinehandwerk.de/en/terms/](https://offlinehandwerk.de/en/terms/). Convenience translation; the German version is legally binding. The language switch links `/de/agb/` and `/en/terms/`. Both footers link to the terms page in that language.
- Anleitung: [https://offlinehandwerk.de/de/anleitung/](https://offlinehandwerk.de/de/anleitung/)
- Manual: [https://offlinehandwerk.de/en/manual/](https://offlinehandwerk.de/en/manual/)
- Not found: `src/pages/404.astro` (GitHub Pages serves the generated `404.html`)

Redirects that stay in the build:

- `/de/privacy/` → `/de/datenschutz/`
- `/de/imprint/` → `/de/impressum/`
- `/de/privacy-app/` and `/en/privacy-app/` → the privacy page `#app`
- `/de/privacy-website/` and `/en/privacy-website/` → the privacy page `#website`

`public/robots.txt` points at the generated [sitemap](https://offlinehandwerk.de/sitemap.xml). The sitemap lists each locale's home, legal pages, and manual, including `/de/agb/` and `/en/terms/`.

## Tech stack

Astro 7 (`astro` in `package.json`) builds static HTML and CSS with its built-in i18n routing. `astro-icon` supplies the icons. `public/theme.js` is the only page script: it toggles the light/dark theme and stores that choice in `localStorage`. There are no cookies, analytics, external fonts, or CDN assets.

Node.js 24. `package.json` requires `>=24`, and `.github/workflows/pages.yml` installs Node 24. There is no `.nvmrc`.

## Run locally

```sh
npm ci
npm run build
npm run preview
```

`npm run check` is the full gate: Prettier, `astro check`, the production build, and `node --test tests/*.test.mjs`.

Open `http://127.0.0.1:4311/de/`. `PORT` changes the preview port. The preview server listens on `127.0.0.1` only and serves the `dist/` build.

## Development

Work on a branch and open a pull request into `main`. The owner reviews and merges; nothing merges automatically. The Pages workflow runs `npm run check` on pull requests and deploys only `main`.

Every content change updates [CHANGELOG.md](CHANGELOG.md) in the same pull request. Date headings, the `Unreleased` section, and the rule that a pull request without its changelog entry must not be merged are in [AGENTS.md](AGENTS.md). New pages, changed URLs, and new features update this README in the same change. New conventions are added to `AGENTS.md`.

## Structure

- `src/i18n/`: typed UI dictionaries, one file per language. German legal text remains authoritative.
- `src/content/legal/`: Impressum, Datenschutz, and terms as Markdown content collections (`de/terms.md`, `en/terms.md`). German is authoritative. The English terms page states that it is a convenience translation.
- `src/content/product.json`: pinned app tokens, entitlements, and Free limits.
- `src/pages/`: Astro routes. `/de/` and `/en/` stay as the locale prefixes. German legal pages are `/de/datenschutz/`, `/de/impressum/`, and `/de/agb/`; English legal pages are `/en/privacy/`, `/en/imprint/`, and `/en/terms/`. Slugs live in `src/config.mjs`. `index.astro` repeats the German home page at the project root. `/de/privacy/`, `/de/imprint/`, and the old `privacy-app` and `privacy-website` routes redirect to the current pages, keeping `#app` and `#website`.
- `src/styles.css`: token-based responsive styles. The build prepends the pinned theme variables.
- `scripts/serve.mjs`: loopback-only production preview.
- `tests/`: localization, route, legal, HTML, preview, and workflow checks.
- `public/CNAME`: `offlinehandwerk.de`. Astro `site` is `https://offlinehandwerk.de` and `base` is `/`.

## Deployment

Settings → Pages should select **GitHub Actions**. The workflow builds and tests pull requests and deploys **only main**.

Plan names and prices come from the language dictionaries and `src/content/product.json`. Do not invent prices, savings, or store URLs. Store buttons stay off while `storesEnabled` is `false`. Open legal checks are in [legal review](docs/legal-review.md).

## Update app facts

Builds neither download nor execute the app. Refresh the checked-in data from an existing app checkout explicitly:

```sh
git -C <app-checkout> fetch origin main
node scripts/sync-app.mjs <app-checkout> origin/main
npm run check
```

The sync reads declarative data and icon artwork, records the exact app commit, and never contacts a store SDK or API. Product images in `public/assets/` are shipped artwork of the German-language web application. See [asset sources](docs/asset-sources.md). Review screenshots stay in pull request attachments, outside Git history.

Browser checks use Mullvad Browser, including accessibility tooling in an isolated profile. Do not substitute Chromium for a Lighthouse score.

## License

Copyright (c) 2026 Siems Software (https://offlinehandwerk.de). PolyForm Noncommercial 1.0.0 (see [LICENSE](LICENSE)).

## Contact

Public contact details are on the [Impressum](https://offlinehandwerk.de/de/impressum/).
